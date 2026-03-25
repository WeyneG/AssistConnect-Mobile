import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getIdosos } from './services/api';

interface HomeScreenProps {
  onLogout: () => void;
  token: string;
}

interface Idoso {
  id: number;
  nome: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, token }) => {
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});
  const [residents, setResidents] = useState<Idoso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dados simulados mantidos para interface
  const employeeName = "Marina";
  const currentDate = "Quinta-feira, 04 fev 2025";
  const shift = "08:00 às 16:00";
  const lastSync = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (token) {
      fetchResidents();
    }
  }, [token]);

  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      const data = await getIdosos(token);
      // Tratamento para Spring Data (data.content) ou Array simples
      const idososList = Array.isArray(data) ? data : (data.content || []);
      setResidents(idososList);
    } catch (error) {
      console.error("Erro ao buscar idosos:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de idosos da API.");
    } finally {
      setIsLoading(false);
    }
  };

  const alerts = [
    { id: 1, icon: "warning", text: "Sr. Carlos | Medicação Pendente às 10:00", urgent: true },
    { id: 2, icon: "close-circle", text: "Visita Médica da Sra. Ana cancelada", urgent: false },
  ];

  const tasks = [
    { id: 1, time: "10:00", description: "Administrar Medicamento" },
    { id: 2, time: "11:30", description: "Apoio no Almoço" },
  ];

  const quickAccess = [
    { id: 1, title: "Medicamentos do Dia", subtitle: "Registar Administração", icon: "medical" },
    { id: 2, title: "Alimentação do Dia", subtitle: "Registar Ingestão Alimentar", icon: "restaurant" },
  ];

  const toggleTask = (taskId: number) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Olá, {employeeName}!</Text>
              <Text style={styles.roleText}>Cuidador</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#3E2010" />
          </TouchableOpacity>
        </View>
        <View style={styles.shiftInfo}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.shiftText}>{currentDate} | Turno: {shift}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Alertas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas e Prioridades</Text>
          {alerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, alert.urgent && styles.alertCardUrgent]}>
              <Ionicons name={alert.icon as any} size={20} color={alert.urgent ? "#DC2626" : "#F59E0B"} />
              <Text style={styles.alertText}>{alert.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Idosos</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#3E2010" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.residentsGrid}>
              {residents.length > 0 ? (
                residents.map(resident => (
                  <TouchableOpacity key={resident.id} style={styles.residentCard}>
                    <View style={styles.residentAvatar}>
                      <Ionicons name="person-outline" size={24} color="#3E2010" />
                    </View>
                    <Text style={styles.residentName}>{resident.nome}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum idoso cadastrado no sistema.</Text>
              )}
            </View>
          )}
        </View>

        {/* Acesso Rápido */}
        <View style={[styles.section, styles.sectionLast]}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          {quickAccess.map(item => (
            <TouchableOpacity key={item.id} style={styles.quickAccessCard}>
              <View style={styles.quickAccessLeft}>
                <View style={styles.quickAccessIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#3E2010" />
                </View>
                <View>
                  <Text style={styles.quickAccessTitle}>{item.title}</Text>
                  <Text style={styles.quickAccessSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#3E2010" />
          <Text style={styles.navItemTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
          <Text style={styles.navItemText}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#6B7280" />
          <Text style={styles.navItemText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Main Action Button */}
      <TouchableOpacity style={styles.mainActionButton}>
        <Text style={styles.mainActionButtonText}>Iniciar Relatório de Turno</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F4E8' },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#3E2010', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  greetingContainer: { justifyContent: 'center' },
  greetingText: { fontSize: 20, fontWeight: 'bold', color: '#3E2010' },
  roleText: { fontSize: 14, color: '#6B7280' },
  logoutButton: { padding: 8 },
  shiftInfo: { flexDirection: 'row', alignItems: 'center' },
  shiftText: { fontSize: 13, color: '#6B7280', marginLeft: 8 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 24 },
  sectionLast: { marginBottom: 120 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#3E2010', marginBottom: 12 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  alertCardUrgent: { backgroundColor: '#FEE2E2', borderLeftColor: '#DC2626' },
  alertText: { flex: 1, fontSize: 14, color: '#3E2010', marginLeft: 12 },
  residentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  residentCard: { width: '47%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  residentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F9F4E8', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  residentName: { fontSize: 14, fontWeight: '500', color: '#3E2010', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#6B7280', width: '100%', marginTop: 10 },
  quickAccessCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8, elevation: 2 },
  quickAccessLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  quickAccessIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F9F4E8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quickAccessTitle: { fontSize: 15, fontWeight: '600', color: '#3E2010', marginBottom: 2 },
  quickAccessSubtitle: { fontSize: 13, color: '#6B7280' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  navItem: { alignItems: 'center' },
  navItemText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  navItemTextActive: { fontSize: 12, color: '#3E2010', fontWeight: '600', marginTop: 4 },
  mainActionButton: { position: 'absolute', bottom: 80, left: 20, right: 20, backgroundColor: '#3E2010', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 8 },
  mainActionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
