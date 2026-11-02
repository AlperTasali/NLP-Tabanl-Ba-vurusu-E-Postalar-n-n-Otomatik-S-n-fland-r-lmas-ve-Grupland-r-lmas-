"""IMAP bağlantısı, e-posta çekme, MIME ayrıştırma ve temel temizleme."""
import hashlib
import imaplib
import logging
import re
import socket
import ssl
from dataclasses import dataclass
from datetime import datetime, timezone as dt_timezone
from email import message_from_bytes, policy
from email.utils import parseaddr, parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
from typing import Optional

from django.db import DatabaseError, IntegrityError, transaction
from django.db.models import Max

from accounts.models import Company
from .models import EmailApplication

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------- Hatalar
class ImapServiceError(Exception):
    """Servis katmanının temel hatası."""


class ImapAuthenticationError(ImapServiceError):
    """Kullanıcı adı/şifre reddedildi."""


class ImapConnectionError(ImapServiceError):
    """Sunucuya ulaşılamadı veya bağlantı koptu."""


# ---------------------------------------------------------------- Ayarlar
@dataclass
class ImapConfig:
    host: str
    username: str
    password: str
    port: int = 993
    mailbox: str = "INBOX"
    timeout: int = 30


@dataclass
class ParsedEmail:
    uid: int
    message_id: str
    sender_name: str
    sender_email: str
    subject: str
    sent_at: Optional[datetime]
    body_text: str
    body_html: str
    clean_text: str


# ---------------------------------------------------------------- Bağlantı
def connect(config: ImapConfig) -> imaplib.IMAP4_SSL:
    """TLS korumalı IMAP bağlantısı kurar ve oturum açar."""
    context = ssl.create_default_context()  # sertifika + hostname doğrulaması açık
    try:
        conn = imaplib.IMAP4_SSL(
            config.host, config.port, ssl_context=context, timeout=config.timeout
        )
    except (socket.gaierror, socket.timeout, TimeoutError, ConnectionError, OSError) as exc:
        raise ImapConnectionError(f"Sunucuya bağlanılamadı: {exc}") from exc
    except ssl.SSLError as exc:
        raise ImapConnectionError(f"TLS hatası: {exc}") from exc

    try:
        conn.login(config.username, config.password)
    except imaplib.IMAP4.error as exc:
        _safe_logout(conn)
        raise ImapAuthenticationError("IMAP kimlik doğrulaması başarısız.") from exc
    except (socket.timeout, TimeoutError, ConnectionError, OSError) as exc:
        _safe_logout(conn)
        raise ImapConnectionError(f"Giriş sırasında bağlantı hatası: {exc}") from exc
    return conn


def _safe_logout(conn: imaplib.IMAP4_SSL) -> None:
    try:
        conn.logout()
    except Exception:  # bağlantı zaten kopmuş olabilir
        pass


def _select_mailbox(conn: imaplib.IMAP4_SSL, mailbox: str) -> int:
    """Posta kutusunu salt-okunur açar ve UIDVALIDITY değerini döndürür."""
    typ, _ = conn.select(f'"{mailbox}"', readonly=True)
    if typ != "OK":
        raise ImapServiceError(f"Posta kutusu açılamadı: {mailbox}")
    typ, data = conn.response("UIDVALIDITY")
    try:
        return int(data[0])
    except (TypeError, ValueError, IndexError) as exc:
        raise ImapServiceError("UIDVALIDITY okunamadı.") from exc


# ---------------------------------------------------------------- Temizleme
_BLOCK_TAGS = {
    "p", "div", "br", "tr", "li", "ul", "ol", "table", "h1", "h2", "h3",
    "h4", "h5", "h6", "blockquote", "section", "article", "hr",
}
_SKIP_TAGS = {"script", "style", "head", "title"}


class _HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._parts = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP_TAGS:
            self._skip_depth += 1
        elif tag in _BLOCK_TAGS:
            self._parts.append("\n")

    def handle_endtag(self, tag):
        if tag in _SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1
        elif tag in _BLOCK_TAGS:
            self._parts.append("\n")

    def handle_data(self, data):
        if self._skip_depth == 0:
            self._parts.append(data)

    def get_text(self) -> str:
        return "".join(self._parts)


def strip_html(html: str) -> str:
    parser = _HTMLTextExtractor()
    try:
        parser.feed(html)
        parser.close()
    except Exception:  # bozuk HTML: etiketleri regex ile at
        return re.sub(r"<[^>]+>", " ", html)
    return parser.get_text()


def clean_text(text: str) -> str:
    """HTML etiketlerini, fazla boşluk ve satırları temizler."""
    if not text:
        return ""
    text = text.replace("\x00", "")  # PostgreSQL NUL karakterini kabul etmez
    if re.search(r"<\s*(html|body|div|p|br|table|span|a)\b", text, re.I):
        text = strip_html(text)
    text = unescape(text)
    text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)  # sıfır genişlikli karakterler
    text = text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ---------------------------------------------------------------- MIME ayrıştırma
def _decode_part(part) -> str:
    try:
        content = part.get_content()
    except (LookupError, UnicodeDecodeError, AssertionError):
        payload = part.get_payload(decode=True) or b""
        charset = part.get_content_charset() or "utf-8"
        try:
            content = payload.decode(charset, errors="replace")
        except LookupError:
            content = payload.decode("utf-8", errors="replace")
    return str(content).replace("\x00", "")


def _extract_bodies(msg) -> tuple:
    """multipart/tekil mesajlardan (düz metin, html) gövdelerini güvenle çıkarır."""
    text, html = "", ""
    for part in msg.walk():
        if part.is_multipart():
            continue
        if part.get_content_disposition() == "attachment":
            continue
        ctype = part.get_content_type()
        if ctype == "text/plain" and not text:
            text = _decode_part(part)
        elif ctype == "text/html" and not html:
            html = _decode_part(part)
    return text, html


def _parse_date(value) -> Optional[datetime]:
    if not value:
        return None
    try:
        dt = parsedate_to_datetime(str(value))
    except (TypeError, ValueError, IndexError):
        return None
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=dt_timezone.utc)
    return dt


def _normalize_message_id(raw_message: bytes, header_value) -> str:
    message_id = str(header_value or "").strip()
    if not message_id:
        digest = hashlib.sha256(raw_message).hexdigest()
        return f"<generated-{digest}@local>"
    if len(message_id) > 512:
        return f"<hashed-{hashlib.sha256(message_id.encode()).hexdigest()}@local>"
    return message_id


def parse_email(uid: int, raw_message: bytes) -> ParsedEmail:
    msg = message_from_bytes(raw_message, policy=policy.default)

    sender_name, sender_email = parseaddr(str(msg.get("From", "")))
    text, html = _extract_bodies(msg)
    # Düz metin varsa onu tercih et, yoksa HTML'den metin üret
    cleaned = clean_text(text) or clean_text(html)

    return ParsedEmail(
        uid=uid,
        message_id=_normalize_message_id(raw_message, msg.get("Message-ID")),
        sender_name=sender_name[:255],
        sender_email=sender_email[:320],
        subject=str(msg.get("Subject", "")).replace("\x00", "")[:998],
        sent_at=_parse_date(msg.get("Date")),
        body_text=text,
        body_html=html,
        clean_text=cleaned,
    )


# ---------------------------------------------------------------- Kayıt
def save_email(
    company: Company, config: ImapConfig, uid_validity: int, parsed: ParsedEmail
) -> bool:
    """E-postayı kaydeder. Yinelenen kayıtta False döner, hata fırlatmaz."""
    try:
        with transaction.atomic():  # IntegrityError sonrası bağlantı bozulmasın
            EmailApplication.objects.create(
                company=company,
                mailbox=config.mailbox,
                uid_validity=uid_validity,
                uid=parsed.uid,
                message_id=parsed.message_id,
                sender_name=parsed.sender_name,
                sender_email=parsed.sender_email,
                subject=parsed.subject,
                sent_at=parsed.sent_at,
                body_text=parsed.body_text,
                body_html=parsed.body_html,
                clean_text=parsed.clean_text,
            )
        return True
    except IntegrityError:
        logger.info("Yinelenen e-posta atlandı: uid=%s id=%s", parsed.uid, parsed.message_id)
        return False
    except DatabaseError:
        logger.exception("E-posta kaydedilemedi: uid=%s", parsed.uid)
        return False


# ---------------------------------------------------------------- Ana akış
def fetch_new_emails(company: Company, config: ImapConfig, limit: int = 100) -> dict:
    """Daha önce işlenmemiş (UID'si DB'deki en büyük UID'den büyük) e-postaları çeker."""
    summary = {"fetched": 0, "saved": 0, "duplicates": 0, "failed": 0}
    conn = None
    try:
        conn = connect(config)
        uid_validity = _select_mailbox(conn, config.mailbox)

        last_uid = (
            EmailApplication.objects.filter(
                company=company, mailbox=config.mailbox, uid_validity=uid_validity
            ).aggregate(m=Max("uid"))["m"]
            or 0
        )
        start = last_uid + 1

        # "N:*" sunucuda en az bir (son) mesajı her zaman döndürür, bu yüzden filtreliyoruz
        typ, data = conn.uid("SEARCH", None, f"UID {start}:*")
        if typ != "OK":
            raise ImapServiceError("UID araması başarısız.")
        uids = sorted(int(u) for u in data[0].split() if int(u) >= start)[:limit]

        for uid in uids:
            try:
                typ, msg_data = conn.uid("FETCH", str(uid), "(BODY.PEEK[])")
                if typ != "OK":
                    summary["failed"] += 1
                    continue
                raw = next(
                    (item[1] for item in msg_data if isinstance(item, tuple)), None
                )
                if not raw:
                    summary["failed"] += 1
                    continue
                summary["fetched"] += 1
                parsed = parse_email(uid, raw)
                if save_email(company, config, uid_validity, parsed):
                    summary["saved"] += 1
                else:
                    summary["duplicates"] += 1
            except (imaplib.IMAP4.abort, socket.timeout, TimeoutError, ConnectionError, ssl.SSLError) as exc:
                # Bağlantı koptu: kalanlar bir sonraki çalıştırmada UID'den devam eder
                raise ImapConnectionError(f"Bağlantı koptu (UID {uid}): {exc}") from exc
            except Exception:
                logger.exception("Mesaj işlenemedi: uid=%s", uid)
                summary["failed"] += 1
        return summary

    except (imaplib.IMAP4.abort, socket.timeout, TimeoutError, ConnectionError, ssl.SSLError) as exc:
        raise ImapConnectionError(f"IMAP bağlantı hatası: {exc}") from exc
    except imaplib.IMAP4.error as exc:
        raise ImapServiceError(f"IMAP protokol hatası: {exc}") from exc
    finally:
        if conn is not None:
            _safe_logout(conn)