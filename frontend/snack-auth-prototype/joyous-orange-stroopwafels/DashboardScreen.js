
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const sampleApplications = [
  {
    id: 1,
    sender_email: 'candidate1@example.com',
    subject: 'Backend Developer Application',
    predicted_position: 'Backend Developer',
    status: 'new',
  },
  {
    id: 2,
    sender_email: 'candidate2@example.com',
    subject: 'Frontend Developer Application',
    predicted_position: 'Frontend Developer',
    status: 'reviewed',
  },
  {
    id: 3,
    sender_email: 'candidate3@example.com',
    subject: 'DevOps Engineer Application',
    predicted_position: 'DevOps Engineer',
    status: 'interview',
  },
];

export default function DashboardScreen({ onBack }) {
  const total = sampleApplications.length;
  const pending = sampleApplications.filter(
    (item) => item.status === 'new'
  ).length;
  const reviewed = sampleApplications.filter(
    (item) => item.status === 'reviewed'
  ).length;
  const interviews = sampleApplications.filter(
    (item) => item.status === 'interview'
  ).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>RecruitFlow AI</Text>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Akıllı İşe Alım Yönetim Paneli
        </Text>
        <Text style={styles.demo}>Demo verileri</Text>
      </View>

      <View style={styles.grid}>
        <StatCard title="Toplam Başvuru" value={total} />
        <StatCard title="Yeni Başvuru" value={pending} />
        <StatCard title="İncelenen" value={reviewed} />
        <StatCard title="Mülakat" value={interviews} />
      </View>

      <Text style={styles.sectionTitle}>Son Başvurular</Text>

      {sampleApplications.map((item) => (
        <View key={item.id} style={styles.application}>
          <Text style={styles.position}>
            {item.predicted_position}
          </Text>
          <Text style={styles.email}>
            {item.sender_email}
          </Text>
          <Text style={styles.subject}>
            {item.subject}
          </Text>
          <Text style={styles.status}>
            Durum: {item.status}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={onBack}
      >
        <Text style={styles.buttonText}>
          Geri Dön
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 20,
  },
  header: {
    marginTop: 35,
    marginBottom: 24,
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 6,
  },
  demo: {
    color: '#EA580C',
    marginTop: 10,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  cardTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  application: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  email: {
    color: '#6B7280',
    marginTop: 6,
  },
  subject: {
    marginTop: 6,
  },
  status: {
    color: '#EA580C',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#EA580C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
