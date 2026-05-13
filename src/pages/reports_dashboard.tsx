import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarIdosos, Idoso } from '../services/api';

interface ReportsDashboardProps {
    token?: string;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

type ReportType = 'saude' | 'atividades' | 'alimentacao' | 'medicamentos';

interface Report {
    type: ReportType;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

interface ReportData {
    labels: string[];
    values: number[];
    summary: {
        total: number;
        average: number;
        highest: string;
        lowest: string;
    };
}

interface TableRecord {
    id: number;
    date: string;
    description: string;
    status: 'concluida' | 'pendente' | 'cancelada';
    value?: number;
}

// ─── Dados Simulados ───────────────────────────────────────────────────────
const generateSimulatedData = (reportType: ReportType): ReportData => {
    const dataMap: Record<ReportType, ReportData> = {
        saude: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
            values: [65, 78, 82, 75, 88, 72, 85],
            summary: {
                total: 565,
                average: 80.7,
                highest: 'Sexta-feira',
                lowest: 'Sábado',
            },
        },
        atividades: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
            values: [45, 52, 48, 61, 55, 38, 42],
            summary: {
                total: 341,
                average: 48.7,
                highest: 'Quinta-feira',
                lowest: 'Sábado',
            },
        },
        alimentacao: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Fish', 'Sab', 'Dom'],
            values: [72, 75, 78, 80, 82, 76, 79],
            summary: {
                total: 542,
                average: 77.4,
                highest: 'Sexta-feira',
                lowest: 'Segunda-feira',
            },
        },
        medicamentos: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
            values: [95, 92, 96, 94, 97, 93, 95],
            summary: {
                total: 662,
                average: 94.6,
                highest: 'Sexta-feira',
                lowest: 'Terça-feira',
            },
        },
    };
    return dataMap[reportType];
};

const generateTableData = (reportType: ReportType): TableRecord[] => {
    const dataMap: Record<ReportType, TableRecord[]> = {
        saude: [
            { id: 1, date: '2024-04-22', description: 'Pressão Arterial Aferida', status: 'concluida', value: 120 },
            { id: 2, date: '2024-04-21', description: 'Consulta Geral', status: 'concluida' },
            { id: 3, date: '2024-04-20', description: 'Exame Laboratorial', status: 'pendente' },
            { id: 4, date: '2024-04-19', description: 'Avaliação Clínica', status: 'concluida' },
            { id: 5, date: '2024-04-18', description: 'Monitoramento', status: 'cancelada' },
        ],
        atividades: [
            { id: 1, date: '2024-04-22', description: 'Fisioterapia', status: 'concluida' },
            { id: 2, date: '2024-04-21', description: 'Atividade Recreativa', status: 'concluida' },
            { id: 3, date: '2024-04-20', description: 'Exercício Leve', status: 'pendente' },
            { id: 4, date: '2024-04-19', description: 'Caminhada Orientada', status: 'concluida' },
            { id: 5, date: '2024-04-18', description: 'Yoga Adaptado', status: 'concluida' },
        ],
        alimentacao: [
            { id: 1, date: '2024-04-22', description: 'Café da Manhã', status: 'concluida' },
            { id: 2, date: '2024-04-22', description: 'Almoço', status: 'concluida' },
            { id: 3, date: '2024-04-22', description: 'Café da Tarde', status: 'concluida' },
            { id: 4, date: '2024-04-21', description: 'Café da Manhã', status: 'pendente' },
            { id: 5, date: '2024-04-21', description: 'Almoço', status: 'concluida' },
        ],
        medicamentos: [
            { id: 1, date: '2024-04-22', description: 'Medicamento A - Manhã', status: 'concluida' },
            { id: 2, date: '2024-04-22', description: 'Medicamento B - Tarde', status: 'concluida' },
            { id: 3, date: '2024-04-22', description: 'Medicamento C - Noite', status: 'pendente' },
            { id: 4, date: '2024-04-21', description: 'Medicamento A - Manhã', status: 'concluida' },
            { id: 5, date: '2024-04-21', description: 'Medicamento B - Tarde', status: 'concluida' },
        ],
    };
    return dataMap[reportType];
};

// ─── Componente de Skeleton Loading ───────────────────────────────────────
const SkeletonLoader: React.FC = () => (
    <View style={styles.skeletonContainer}>
        <View style={[styles.skeletonItem, { height: 100, marginBottom: 16 }]} />
        <View style={[styles.skeletonItem, { height: 200, marginBottom: 16 }]} />
        <View style={[styles.skeletonItem, { height: 150 }]} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#E0E7FF',
        marginTop: 4,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    filterSection: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        gap: 4,
    },
    tabActive: {
        backgroundColor: '#8297D9',
        borderColor: '#8297D9',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    tabIcon: {
        fontSize: 18,
    },
    dropdownContainer: {
        marginBottom: 12,
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    dateRangeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dateInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateInputText: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    exportButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    chartsSection: {
        marginVertical: 16,
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    summaryItem: {
        flex: 1,
        minWidth: '48%',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    tableSection: {
        marginVertical: 16,
    },
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    tableHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableDate: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8297D9',
        minWidth: 80,
    },
    tableDescription: {
        flex: 1,
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
        marginHorizontal: 8,
    },
    tableBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusConcluida: {
        backgroundColor: '#D1FAE5',
    },
    statusConcluidaText: {
        color: '#059669',
    },
    statusPendente: {
        backgroundColor: '#FEF3C7',
    },
    statusPendenteText: {
        color: '#D97706',
    },
    statusCancelada: {
        backgroundColor: '#FEE2E2',
    },
    statusCanceladaText: {
        color: '#DC2626',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    skeletonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    skeletonItem: {
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
    },
    simpleBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    simpleBarLabel: {
        width: 40,
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    simpleBarTrack: {
        flex: 1,
        height: 10,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
        marginHorizontal: 12,
    },
    simpleBarFill: {
        height: 10,
        backgroundColor: '#8297D9',
        borderRadius: 6,
    },
    simpleBarValue: {
        width: 32,
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'right',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ token, onNavigateTab, activeTab = 'reports' }) => {
    const [selectedReport, setSelectedReport] = useState<ReportType>('saude');
    const [selectedResident, setSelectedResident] = useState<Idoso | null>(null);
    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [loading, setLoading] = useState(true);
    const [showResidentDropdown, setShowResidentDropdown] = useState(false);
    const [dateFrom, setDateFrom] = useState('02/04/2024');
    const [dateTo, setDateTo] = useState('22/04/2024');

    const reports: Report[] = [
        { type: 'saude', label: 'Saúde', icon: 'heart' },
        { type: 'atividades', label: 'Atividades', icon: 'fitness' },
        { type: 'alimentacao', label: 'Alimentação', icon: 'restaurant' },
        { type: 'medicamentos', label: 'Medicamentos', icon: 'medical' },
    ];

    useEffect(() => {
        carregarIdosos();
    }, []);

    const carregarIdosos = async () => {
        try {
            setLoading(true);
            const data = await buscarIdosos(token);
            setIdosos(data);
            if (data.length > 0) {
                setSelectedResident(data[0]);
            }
        } catch (err) {
            console.error('Erro ao carregar idosos:', err);
            Alert.alert('Erro', 'Não foi possível carregar a lista de residentes');
            // Simular dados para demonstração
            setIdosos([
                { id: 1, nome: 'João Silva', idade: 75, status: 'ativo' } as Idoso,
                { id: 2, nome: 'Maria Santos', idade: 82, status: 'ativo' } as Idoso,
            ]);
        } finally {
            setLoading(false);
        }
    };

    const reportData = generateSimulatedData(selectedReport);
    const tableData = generateTableData(selectedReport);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'concluida':
                return styles.statusConcluida;
            case 'pendente':
                return styles.statusPendente;
            case 'cancelada':
                return styles.statusCancelada;
            default:
                return styles.statusConcluida;
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'concluida':
                return styles.statusConcluidaText;
            case 'pendente':
                return styles.statusPendenteText;
            case 'cancelada':
                return styles.statusCanceladaText;
            default:
                return styles.statusConcluidaText;
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Relatórios</Text>
                    <Text style={styles.headerSubtitle}>Análise de dados dos residentes</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8297D9" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Relatórios</Text>
                <Text style={styles.headerSubtitle}>Análise de dados dos residentes</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentPadding}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    {/* Filtros */}
                    <View style={styles.filterSection}>
                        {/* Tipo de Relatório */}
                        <Text style={styles.filterLabel}>Tipo de Relatório</Text>
                        <View style={styles.tabsContainer}>
                            {reports.map((report) => (
                                <TouchableOpacity
                                    key={report.type}
                                    style={[styles.tab, selectedReport === report.type && styles.tabActive]}
                                    onPress={() => setSelectedReport(report.type)}
                                >
                                    <Ionicons
                                        name={report.icon}
                                        size={18}
                                        color={selectedReport === report.type ? '#FFFFFF' : '#8297D9'}
                                    />
                                    <Text style={[styles.tabText, selectedReport === report.type && styles.tabTextActive]}>
                                        {report.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Seletor de Residente */}
                        <Text style={[styles.filterLabel, { marginTop: 16 }]}>Residente</Text>
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowResidentDropdown(!showResidentDropdown)}
                            >
                                <Text style={styles.dropdownText}>
                                    {selectedResident?.nome || 'Selecione um residente'}
                                </Text>
                                <Ionicons
                                    name={showResidentDropdown ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>

                            {showResidentDropdown && (
                                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: -4, paddingTop: 12, paddingHorizontal: 12 }}>
                                    {idosos.length === 0 ? (
                                        <Text style={{ color: '#6B7280', fontSize: 14, paddingVertical: 8 }}>
                                            Nenhum residente disponível
                                        </Text>
                                    ) : (
                                        idosos.map((idoso) => (
                                            <TouchableOpacity
                                                key={idoso.id}
                                                onPress={() => {
                                                    setSelectedResident(idoso);
                                                    setShowResidentDropdown(false);
                                                }}
                                                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                                            >
                                                <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '500' }}>
                                                    {idoso.nome}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Data Range */}
                        <Text style={[styles.filterLabel, { marginTop: 16 }]}>Período</Text>
                        <View style={styles.dateRangeContainer}>
                            <View style={styles.dateInput}>
                                <Ionicons name="calendar-outline" size={16} color="#8297D9" />
                                <Text style={styles.dateInputText}>{dateFrom}</Text>
                            </View>
                            <View style={[styles.dateInput, { minWidth: 40, justifyContent: 'center' }]}>
                                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>até</Text>
                            </View>
                            <View style={styles.dateInput}>
                                <Ionicons name="calendar-outline" size={16} color="#8297D9" />
                                <Text style={styles.dateInputText}>{dateTo}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Indicadores */}
                    <View style={styles.chartsSection}>
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Indicadores</Text>
                            {reportData.labels.map((label, index) => (
                                <View key={label} style={styles.simpleBarRow}>
                                    <Text style={styles.simpleBarLabel}>{label}</Text>
                                    <View style={styles.simpleBarTrack}>
                                        <View style={[styles.simpleBarFill, { width: `${Math.min(reportData.values[index], 100)}%` }]} />
                                    </View>
                                    <Text style={styles.simpleBarValue}>{reportData.values[index]}</Text>
                                </View>
                            ))}

                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Total</Text>
                                    <Text style={styles.summaryValue}>{reportData.summary.total}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Média</Text>
                                    <Text style={styles.summaryValue}>{reportData.summary.average.toFixed(1)}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Maior</Text>
                                    <Text style={styles.summaryValue} numberOfLines={1}>
                                        {reportData.summary.highest}
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Menor</Text>
                                    <Text style={styles.summaryValue} numberOfLines={1}>
                                        {reportData.summary.lowest}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Tabela de Resumo */}
                    {tableData.length > 0 ? (
                        <View style={styles.tableSection}>
                            <View style={styles.tableCard}>
                                <Text style={styles.tableHeader}>Registros Recentes</Text>

                                {tableData.map((record, index) => (
                                    <View
                                        key={record.id}
                                        style={[styles.tableRow, index === tableData.length - 1 && styles.tableRowLast]}
                                    >
                                        <Text style={styles.tableDate}>{record.date}</Text>
                                        <Text style={styles.tableDescription} numberOfLines={1}>
                                            {record.description}
                                        </Text>
                                        <View style={[styles.tableBadge, getStatusColor(record.status)]}>
                                            <Text style={[styles.tableBadgeText, getStatusTextColor(record.status)]}>
                                                {record.status === 'concluida' ? '✓' : record.status === 'pendente' ? '⏳' : '✕'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="document-outline" size={40} color="#D1D5DB" />
                            </View>
                            <Text style={styles.emptyText}>Sem dados</Text>
                            <Text style={styles.emptySubtext}>Nenhum registro encontrado para o período selecionado</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};
