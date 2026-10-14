from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Company, Role

User = get_user_model()


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.company = Company.objects.create(name='Test A.S.', email='info@test.com')
        self.admin_role = Role.objects.create(code='admin', name='Admin')
        self.user_role = Role.objects.create(code='user', name='User')
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.refresh_url = '/api/auth/refresh/'
        self.me_url = '/api/auth/me/'
        self.user_payload = {
            'email': 'ik@test.com',
            'password': 'GucluParola123!',
            'first_name': 'Ayşe',
            'last_name': 'Yılmaz',
            'company': self.company.id,
            'role': self.user_role.id,
        }

    def test_register_creates_user_and_returns_tokens(self):
        res = self.client.post(self.register_url, self.user_payload, format='json')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['email'], 'ik@test.com')
        self.assertTrue(User.objects.filter(email='ik@test.com').exists())

    def test_register_duplicate_email_case_insensitive_fails(self):
        self.client.post(self.register_url, self.user_payload, format='json')
        dup = dict(self.user_payload, email='IK@TEST.COM')
        res = self.client.post(self.register_url, dup, format='json')
        self.assertEqual(res.status_code, 400)

    def test_login_returns_tokens_and_user_with_company_claims(self):
        self.client.post(self.register_url, self.user_payload, format='json')
        res = self.client.post(
            self.login_url,
            {'email': 'ik@test.com', 'password': 'GucluParola123!'},
            format='json',
        )
        self.assertEqual(res.status_code, 200, res.content)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['company'], self.company.id)
        self.assertEqual(res.data['user']['role_code'], 'user')

    def test_login_wrong_password_fails(self):
        self.client.post(self.register_url, self.user_payload, format='json')
        res = self.client.post(
            self.login_url, {'email': 'ik@test.com', 'password': 'yanlis!'}, format='json'
        )
        self.assertEqual(res.status_code, 401)

    def test_profile_requires_auth(self):
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 401)

    def test_profile_get_and_update(self):
        reg = self.client.post(self.register_url, self.user_payload, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {reg.data['access']}")
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['company_name'], 'Test A.S.')
        patch = self.client.patch(self.me_url, {'first_name': 'Fatma'}, format='json')
        self.assertEqual(patch.status_code, 200)
        self.assertEqual(patch.data['first_name'], 'Fatma')

    def test_refresh_returns_new_access(self):
        reg = self.client.post(self.register_url, self.user_payload, format='json')
        res = self.client.post(
            self.refresh_url, {'refresh': reg.data['refresh']}, format='json'
        )
        self.assertEqual(res.status_code, 200, res.content)
        self.assertIn('access', res.data)
