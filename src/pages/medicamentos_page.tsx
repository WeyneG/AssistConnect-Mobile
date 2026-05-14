import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarMedicamentos, buscarIdosos, Medicamento, Idoso } from '../services/api';

interface MedicamentosPageProps {
    token?: string;
}

type StatusMedicamento = 'pendente' | 'administrado' | 'atrasado';

export const MedicamentosPage: React.FC<MedicamentosPageProps> = ({ token }) => {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filtroResidente, setFiltroResidente] = useState<number | null>(null);
    const [filtroData, setFiltroData] = useState<string>(new Date().toISOString().split('T')[0]);
    const [modalFiltroVisible, setModalFiltroVisible] = useState(false);

    useEffect(() => {
        carregarDados();
    }, [filtroResidente, filtroData]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [medicamentosData, idososData] = await Promise.all([
                buscarMedicamentos(filtroData, filtroResidente, token),
                buscarIdosos(token),
            ]);
            setMedicamentos(medicamentosData);
            setIdosos(idososData);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os medicamentos');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarDados();
        setRefreshing(false);
    };

    const agruparPorHorario = () => {
        const grupos: { [key: string]: Medicamento[] } = {};
        medicamentos.forEach(med => {
            const horario = med.horarioPrevisto;
            if (!grupos[horario]) grupos[horario] = [];
            grupos[horario].push(med);
        });
        return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
    };

    const calcularProgresso = () => {
        if (medicamentos.length === 0) return { administrados: 0, total: 0, percentual: 0 };
        const administrados = medicamentos.filter(m => m.status === 'administrado').length;
        return {
            administrados,
            total: medicamentos.length,
            percentual: Math.round((administrados / medicamentos.length) * 100),
        };
    };

    const getStatusColor = (status: StatusMedicamento) => {
        switch (status) {
            case 'administrado': return '#10B981';
            case 'atrasado': return '#EF4444';
            default: return '#F59E0B';
        }
    };

    const getStatusBgColor = (status: StatusMedicamento) => {
        switch (status) {
            case 'administrado': return '#ECFDF5';
            case 'atrasado': return '#FEE2E2';
            default: return '#FEF3C7';
        }
    };

    const getStatusLabel = (status: StatusMedicamento) => {
        switch (status) {
            case 'administrado': return 'Administrado';
            case 'atrasado': return 'Atrasado';
            default: return 'Pendente';
        }
    };

    const progresso = calcularProgresso();
    const gruposHorario = agruparPorHorario();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Medicamentos</Text>
                        <Text style={styles.headerSubtitle}>Controle diário de medicação</Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalFiltroVisible(true)} style={styles.filterButton}>
                        <Ionicons name="filter" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8297D9']} tintColor="#8297D9" />
                }
            >
                {/* Card de Progresso */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Progresso do dia</Text>
                        <Text style={styles.progressPercentage}>{progresso.percentual}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progresso.percentual}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {progresso.administrados} de {progresso.total} medicamentos administrados
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8297D9" />
                    </View>
                ) : medicamentos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
                        </View>
                        <Text style={styles.emptyText}>Nenhum medicamento encontrado</Text>
                        <Text style={styles.emptySubtext}>Ajuste os filtros ou adicione novos medicamentos</Text>
                    </View>
                ) : (
                    gruposHorario.map(([horario, meds]) => (
                        <View key={horario} style={styles.horarioGroup}>
                            <View style={styles.horarioHeader}>
                                <View style={styles.horarioIconContainer}>
                                    <Ionicons name="time-outline" size={18} color="#8297D9" />
                                </View>
                                <Text style={styles.horarioTitle}>{horario}</Text>
                                <View style={styles.horarioBadge}>
                                    <Text style={styles.horarioBadgeText}>{meds.length}</Text>
                                </View>
                            </View>

                            {meds.map((med, index) => (
                                <View key={med.id} style={[styles.medCard, index > 0 && { marginTop: 12 }]}>
                                    <View style={styles.medHeader}>
                                        <View style={styles.medInfo}>
                                            <Text style={styles.medNome}>{med.nome}</Text>
                                            <Text style={styles.medResidente}>{med.residenteNome}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(med.status) }]}>
                                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(med.status) }]} />
                                            <Text style={[styles.statusText, { color: getStatusColor(med.status) }]}>
                                                {getStatusLabel(med.status)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.medDetails}>
                                        <View style={styles.medDetailItem}>
                                            <Ionicons name="medical" size={16} color="#6B7280" />
                                            <Text style={styles.medDetailText}>{med.dosagem}</Text>
                                        </View>
                                        <View style={styles.medDetailItem}>
                                            <Ionicons name="water-outline" size={16} color="#6B7280" />
                                            <Text style={styles.medDetailText}>{med.via}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal de Filtros */}
            <Modal visible={modalFiltroVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros</Text>
                            <TouchableOpacity onPress={() => setModalFiltroVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Residente</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                                <TouchableOpacity
                                    style={[styles.filterChip, !filtroResidente && styles.filterChipActive]}
                                    onPress={() => setFiltroResidente(null)}
                                >
                                    <Text style={[styles.filterChipText, !filtroResidente && styles.filterChipTextActive]}>
                                        Todos
                                    </Text>
                                </TouchableOpacity>
                                {idosos.map(idoso => (
                                    <TouchableOpacity
                                        key={idoso.id}
                                        style={[styles.filterChip, filtroResidente === idoso.id && styles.filterChipActive]}
                                        onPress={() => setFiltroResidente(idoso.id)}
                                    >
                                        <Text style={[styles.filterChipText, filtroResidente === idoso.id && styles.filterChipTextActive]}>
                                            {idoso.nome}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Data</Text>
                            <TextInput
                                style={styles.dateInput}
                                value={filtroData}
                                onChangeText={setFiltroData}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                setModalFiltroVisible(false);
                                carregarDados();
                            }}
                        >
                            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginTop: 4 },
    filterButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    progressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    progressTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    progressPercentage: { fontSize: 24, fontWeight: '700', color: '#8297D9' },
    progressBarContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressBar: { height: '100%', backgroundColor: '#8297D9', borderRadius: 4 },
    progressText: { fontSize: 13, color: '#6B7280' },
    loadingContainer: { paddingVertical: 60, alignItems: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
    emptySubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
    horarioGroup: { marginBottom: 24 },
    horarioHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    horarioIconContainer: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center', justifyContent: 'center',
    },
    horarioTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', flex: 1 },
    horarioBadge: {
        backgroundColor: '#8297D9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    horarioBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
    medCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    medInfo: { flex: 1 },
    medNome: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
    medResidente: { fontSize: 14, color: '#6B7280' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '600' },
    medDetails: { flexDirection: 'row', gap: 16 },
    medDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    medDetailText: { fontSize: 13, color: '#6B7280' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
    filterSection: { marginBottom: 24 },
    filterLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
    filterChips: { flexDirection: 'row', gap: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
    },
    filterChipActive: { backgroundColor: '#8297D9' },
    filterChipText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
    filterChipTextActive: { color: '#FFFFFF' },
    dateInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    applyButton: {
        backgroundColor: '#8297D9',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
