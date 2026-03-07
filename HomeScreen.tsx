import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});

  // Dados simulados - depois virão da API
  const employeeName = "Marina";
  const currentDate = "Quinta-feira, 04 fev 2025";
  const shift = "08:00 às 16:00";
  const lastSync = "09:41";

  const alerts = [
    { id: 1, icon: "warning", text: "Sr. Carlos | Medicação Pendente às 10:00", urgent: true },
    { id: 2, icon: "close-circle", text: "Visita Médica da Sra. Ana cancelada", urgent: false },
  ];

  const tasks = [
    { id: 1, time: "10:00", description: "Administrar Medicamento (Sr. João)" },
    { id: 2, time: "11:30", description: "Apoio no Almoço (Sra. Maria)" },
    { id: 3, time: "14:00", description: "Relatório de Turno" },
  ];

  const residents = [
    { id: 1, name: "Sr. Carlos" },
    { id: 2, name: "Sra. Ana" },
    { id: 3, name: "Sr. João" },
    { id: 4, name: "Sra. Maria" },
  ];

  const quickAccess = [
    { id: 1, title: "Medicamentos do Dia", subtitle: "Registar Administração", icon: "medical" },
    { id: 2, title: "Alimentação do Dia", subtitle: "Registar Ingestão Alimentar", icon: "restaurant" },
    { id: 3, title: "Relatórios de Atividades", subtitle: "Ver ou criar relatórios", icon: "document-text" },
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
        {/* Alertas Críticos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas e Prioridades</Text>
          {alerts.map(alert => (
            <View 
              key={alert.id} 
              style={[styles.alertCard, alert.urgent && styles.alertCardUrgent]}
            >
              <Ionicons 
                name={alert.icon as any} 
                size={20} 
                color={alert.urgent ? "#DC2626" : "#F59E0B"} 
              />
              <Text style={styles.alertText}>{alert.text}</Text>
            </View>
          ))}
        </View>

        {/* Minha Agenda de Hoje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Tarefas Próximas</Text>
          {tasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskCard}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskLeft}>
                <View style={[
                  styles.checkbox, 
                  checkedTasks[task.id] && styles.checkboxChecked
                ]}>
                  {checkedTasks[task.id] && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View>
                  <Text style={styles.taskTime}>{task.time}</Text>
                  <Text style={[
                    styles.taskDescription,
                    checkedTasks[task.id] && styles.taskDescriptionCompleted
                  ]}>
                    {task.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Meus Residentes Designados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Residentes Designados</Text>
          <View style={styles.residentsGrid}>
            {residents.map(resident => (
              <TouchableOpacity key={resident.id} style={styles.residentCard}>
                <View style={styles.residentAvatar}>
                  <Ionicons name="person-outline" size={24} color="#3E2010" />
                </View>
                <Text style={styles.residentName}>{resident.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estado da Equipa e Sincronização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado da Equipa</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncRow}>
              <Ionicons name="sync-outline" size={18} color="#10B981" />
              <Text style={styles.syncText}>Última sincronização: {lastSync}</Text>
            </View>
            <TouchableOpacity style={styles.chatButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#3E2010" />
              <Text style={styles.chatButtonText}>Chat da Equipa</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acesso Rápido */}
        <View style={styles.section}>
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

        {/* Ver Fichas Completas */}
        <View style={[styles.section, styles.sectionLast]}>
          <Text style={styles.sectionTitle}>Ver Fichas Completas</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Ionicons name="documents-outline" size={20} color="#3E2010" />
            <Text style={styles.viewAllButtonText}>Abrir todas as fichas</Text>
            <Ionicons name="chevron-forward" size={20} color="#3E2010" />
          </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#F9F4E8',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3E2010',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E2010',
  },
  roleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    padding: 8,
  },
  shiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  shiftText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionLast: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E2010',
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertCardUrgent: {
    backgroundColor: '#FEE2E2',
    borderLeftColor: '#DC2626',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#3E2010',
    marginLeft: 12,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E2010',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  taskDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  residentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  residentCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  residentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9F4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  residentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3E2010',
    textAlign: 'center',
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F4E8',
    padding: 12,
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3E2010',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#DC2626',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickAccessCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9F4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickAccessTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2010',
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  viewAllButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2010',
    marginLeft: 8,
    marginRight: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  navItemTextActive: {
    fontSize: 12,
    color: '#3E2010',
    fontWeight: '600',
    marginTop: 4,
  },
  mainActionButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#3E2010',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
