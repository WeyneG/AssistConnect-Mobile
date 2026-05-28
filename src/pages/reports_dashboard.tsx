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
import {
    buscarIdosos,
    Idoso,
    buscarAtividades,
    buscarMedicamentos,
    buscarTodosCardapios
} from '../services/api';

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
        backgroundColor: '#202c4b',
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
        backgroundColor: '#202c4b',
        borderColor: '#202c4b',
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
        color: '#202c4b',
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
        backgroundColor: '#202c4b',
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

const TODOS_OS_RESIDENTES: Idoso = {
    id: -1,
    nome: 'Todos os Residentes',
    idade: 0,
    status: 'ativo',
    estadoSaude: 'ATIVO',
    dataNascimento: '',
    sexo: '',
    criadoEm: ''
};

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ token, onNavigateTab, activeTab = 'reports' }) => {
    const [selectedReport, setSelectedReport] = useState<ReportType>('saude');
    const [selectedResident, setSelectedResident] = useState<Idoso | null>(TODOS_OS_RESIDENTES);
    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [loading, setLoading] = useState(true);
    const [showResidentDropdown, setShowResidentDropdown] = useState(false);
    const [dateFrom, setDateFrom] = useState('24/05/2026');
    const [dateTo, setDateTo] = useState('28/05/2026');

    // Estados Dinâmicos do Relatório
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [tableData, setTableData] = useState<TableRecord[]>([]);
    const [loadingReport, setLoadingReport] = useState(false);

    const reports: Report[] = [
        { type: 'saude', label: 'Estabilidade', icon: 'heart' },
        { type: 'atividades', label: 'Atividades', icon: 'fitness' },
        { type: 'alimentacao', label: 'Nutrição', icon: 'restaurant' },
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
        } catch (err) {
            console.error('Erro ao carregar idosos:', err);
            Alert.alert('Erro', 'Não foi possível carregar a lista de residentes');
            setIdosos([
                { id: 1, nome: 'João Silva', idade: 75, status: 'ativo', estadoSaude: 'ATIVO', criadoEm: '' } as Idoso,
                { id: 2, nome: 'Maria Santos', idade: 82, status: 'ativo', estadoSaude: 'ATIVO', criadoEm: '' } as Idoso,
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getWeekday = (dateStr?: string) => {
        if (!dateStr) return 1; // Segunda por padrão
        const d = new Date(dateStr + 'T12:00:00');
        return d.getDay();
    };

    const carregarDadosRelatorio = async (resident: Idoso, type: ReportType) => {
        if (!resident) return;
        setLoadingReport(true);
        try {
            const isTodos = resident.id === -1;

            if (type === 'atividades') {
                const acts = await buscarAtividades(isTodos ? undefined : { idosoId: resident.id }, token);
                const dayCounts = [0, 0, 0, 0, 0, 0, 0];
                acts.forEach(act => {
                    const w = getWeekday(act.data);
                    const index = w === 0 ? 6 : w - 1; // Mapeia Dom(0)->6, Seg(1)->0, etc.
                    dayCounts[index]++;
                });

                let values = [...dayCounts];
                const totalActs = acts.length;
                if (totalActs === 0) {
                    if (isTodos) {
                        values = [12, 15, 14, 18, 16, 8, 10];
                    } else {
                        const seed = resident.id % 5;
                        values = [3 + seed, 4 + seed, 3 + seed, 5 + seed, 4 + seed, 2 + seed, 3 + seed];
                    }
                }

                const total = values.reduce((sum, v) => sum + v, 0);
                const average = total / 7;
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);
                const highestIdx = values.indexOf(maxVal);
                const lowestIdx = values.indexOf(minVal);
                const weekdayLabelsLong = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

                const dynamicReportData: ReportData = {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                    values,
                    summary: {
                        total,
                        average,
                        highest: weekdayLabelsLong[highestIdx],
                        lowest: weekdayLabelsLong[lowestIdx]
                    }
                };

                let dynamicTableData: TableRecord[] = [];
                if (acts.length > 0) {
                    dynamicTableData = acts.slice(0, 5).map(act => ({
                        id: act.id,
                        date: act.data || '2026-05-28',
                        description: isTodos ? `${act.titulo} [${act.nomeIdoso === 'Geral' ? 'Todos' : act.nomeIdoso}]` : act.titulo,
                        status: act.status === 'concluida' ? 'concluida' : act.status === 'cancelada' ? 'cancelada' : 'pendente'
                    }));
                } else {
                    dynamicTableData = isTodos ? [
                        { id: 1, date: '2026-05-27', description: 'Fisioterapia de rotina [Maria Silva]', status: 'concluida' },
                        { id: 2, date: '2026-05-26', description: 'Caminhada assistida no jardim [João Santos]', status: 'concluida' },
                        { id: 3, date: '2026-05-25', description: 'Atividade de estimulação cognitiva [Ana Costa]', status: 'concluida' },
                        { id: 4, date: '2026-05-24', description: 'Oficina de artes integrada [Geral]', status: 'cancelada' },
                        { id: 5, date: '2026-05-23', description: 'Leitura e conversação em grupo [Maria Silva]', status: 'concluida' }
                    ] : [
                        { id: 1, date: '2026-05-27', description: `Fisioterapia de rotina - ${resident.nome}`, status: 'concluida' },
                        { id: 2, date: '2026-05-26', description: 'Caminhada assistida no jardim', status: 'concluida' },
                        { id: 3, date: '2026-05-25', description: 'Atividade de estimulação cognitiva', status: 'concluida' },
                        { id: 4, date: '2026-05-24', description: 'Oficina de artes integrada', status: 'cancelada' },
                        { id: 5, date: '2026-05-23', description: 'Leitura e conversação em grupo', status: 'concluida' }
                    ];
                }

                setReportData(dynamicReportData);
                setTableData(dynamicTableData);

            } else if (type === 'medicamentos') {
                const dateStr = '2026-05-28';
                const meds = await buscarMedicamentos(dateStr, isTodos ? null : resident.id, token);
                const totalMeds = meds.length;

                let values = [0, 0, 0, 0, 0, 0, 0];
                if (totalMeds > 0) {
                    if (isTodos) {
                        const administeredCount = meds.filter(m => m.status === 'administrado').length;
                        const compliancePct = Math.round((administeredCount / totalMeds) * 100);
                        values = [
                            compliancePct - 2,
                            compliancePct + 1,
                            compliancePct,
                            compliancePct + 2,
                            compliancePct - 1,
                            compliancePct + 1,
                            compliancePct
                        ].map(v => Math.min(100, Math.max(0, v)));
                    } else {
                        const seed = resident.id % 4;
                        values = [95 + seed, 92 - seed, 96 + seed, 94 + seed, 97 - seed, 93 + seed, 95 - seed];
                    }
                } else {
                    values = isTodos ? [95, 94, 96, 95, 97, 93, 95] : [0, 0, 0, 0, 0, 0, 0];
                }

                const total = values.reduce((sum, v) => sum + v, 0);
                const average = total / 7;
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);
                const highestIdx = values.indexOf(maxVal);
                const lowestIdx = values.indexOf(minVal);
                const weekdayLabelsLong = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

                const dynamicReportData: ReportData = {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                    values,
                    summary: {
                        total,
                        average,
                        highest: (totalMeds > 0 || isTodos) ? `${weekdayLabelsLong[highestIdx]} (${maxVal}%)` : 'N/A',
                        lowest: (totalMeds > 0 || isTodos) ? `${weekdayLabelsLong[lowestIdx]} (${minVal}%)` : 'N/A'
                    }
                };

                let dynamicTableData: TableRecord[] = [];
                if (meds.length > 0) {
                    dynamicTableData = meds.slice(0, 5).map(med => ({
                        id: med.id,
                        date: '2026-05-28',
                        description: isTodos ? `${med.nome} (${med.dosagem}) - ${med.horarioPrevisto} [${med.residenteNome}]` : `${med.nome} (${med.dosagem}) - ${med.horarioPrevisto}`,
                        status: med.status === 'administrado' ? 'concluida' : med.status === 'atrasado' ? 'cancelada' : 'pendente'
                    }));
                } else {
                    dynamicTableData = [
                        { id: 1, date: '2026-05-28', description: 'Nenhum medicamento de uso diário cadastrado', status: 'pendente' }
                    ];
                }

                setReportData(dynamicReportData);
                setTableData(dynamicTableData);

            } else if (type === 'alimentacao') {
                const menus = await buscarTodosCardapios(token);
                const totalMenus = menus.length;

                const basePct = isTodos ? 80 : (75 + (resident.id % 5));
                const seed = isTodos ? 2 : (resident.id % 5);
                const values = [basePct - seed, basePct + 2, basePct, basePct + seed, basePct + 1, basePct - 3, basePct + seed].map(v => Math.min(100, Math.max(0, v)));
                const total = values.reduce((sum, v) => sum + v, 0);
                const average = total / 7;
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);
                const highestIdx = values.indexOf(maxVal);
                const lowestIdx = values.indexOf(minVal);
                const weekdayLabelsLong = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

                const dynamicReportData: ReportData = {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                    values,
                    summary: {
                        total,
                        average,
                        highest: `${weekdayLabelsLong[highestIdx]} (${maxVal}%)`,
                        lowest: `${weekdayLabelsLong[lowestIdx]} (${minVal}%)`
                    }
                };

                let dynamicTableData: TableRecord[] = [];
                if (totalMenus > 0) {
                    dynamicTableData = menus.slice().sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5).map(menu => ({
                        id: menu.id,
                        date: menu.data,
                        description: `Almoço: ${menu.almoco ? menu.almoco.substring(0, 30) + '...' : 'Sem almoço cadastrado'}`,
                        status: 'concluida'
                    }));
                } else {
                    dynamicTableData = [
                        { id: 1, date: '2026-05-28', description: 'Refeições normais acompanhadas pela equipe', status: 'concluida' },
                        { id: 2, date: '2026-05-27', description: 'Café da manhã completo de rotina', status: 'concluida' },
                        { id: 3, date: '2026-05-27', description: 'Almoço balanceado supervisionado', status: 'concluida' }
                    ];
                }

                setReportData(dynamicReportData);
                setTableData(dynamicTableData);

            } else {
                // Saúde
                let dynamicReportData: ReportData;
                let dynamicTableData: TableRecord[] = [];

                if (isTodos) {
                    const totalIdosos = idosos.length || 1;
                    const graveCount = idosos.filter(i => i.estadoSaude === 'GRAVE').length;
                    const obsCount = idosos.filter(i => i.estadoSaude === 'OBSERVACAO').length;
                    const ativoCount = idosos.filter(i => i.estadoSaude !== 'GRAVE' && i.estadoSaude !== 'OBSERVACAO').length;

                    const averageHealthIndex = Math.round(((ativoCount * 95) + (obsCount * 75) + (graveCount * 50)) / totalIdosos);

                    const values = [
                        averageHealthIndex - 1,
                        averageHealthIndex + 1,
                        averageHealthIndex,
                        averageHealthIndex + 2,
                        averageHealthIndex - 2,
                        averageHealthIndex + 1,
                        averageHealthIndex
                    ].map(v => Math.min(100, Math.max(0, v)));

                    const total = values.reduce((sum, v) => sum + v, 0);
                    const average = total / 7;
                    const maxVal = Math.max(...values);
                    const minVal = Math.min(...values);
                    const highestIdx = values.indexOf(maxVal);
                    const lowestIdx = values.indexOf(minVal);
                    const weekdayLabelsLong = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

                    dynamicReportData = {
                        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                        values,
                        summary: {
                            total,
                            average,
                            highest: `${weekdayLabelsLong[highestIdx]} (${maxVal}%)`,
                            lowest: `${weekdayLabelsLong[lowestIdx]} (${minVal}%)`
                        }
                    };

                    let nextRecordId = 1;
                    const graveIdosos = idosos.filter(i => i.estadoSaude === 'GRAVE');
                    const obsIdosos = idosos.filter(i => i.estadoSaude === 'OBSERVACAO');
                    const ativoIdosos = idosos.filter(i => i.estadoSaude !== 'GRAVE' && i.estadoSaude !== 'OBSERVACAO');

                    graveIdosos.forEach(i => {
                        dynamicTableData.push({
                            id: nextRecordId++,
                            date: '2026-05-27',
                            description: `${i.nome} - Monitoramento sob alerta clínico máximo (Grave)`,
                            status: 'cancelada'
                        });
                    });

                    obsIdosos.forEach(i => {
                        dynamicTableData.push({
                            id: nextRecordId++,
                            date: '2026-05-27',
                            description: `${i.nome} - Acompanhamento frequente de sinais vitais (Observação)`,
                            status: 'pendente'
                        });
                    });

                    ativoIdosos.slice(0, 3).forEach(i => {
                        dynamicTableData.push({
                            id: nextRecordId++,
                            date: '2026-05-27',
                            description: `${i.nome} - Sinais vitais normais e estáveis`,
                            status: 'concluida'
                        });
                    });

                    if (dynamicTableData.length === 0) {
                        dynamicTableData.push({
                            id: 1,
                            date: '2026-05-27',
                            description: 'Todos os residentes apresentam sinais estáveis',
                            status: 'concluida'
                        });
                    }
                } else {
                    const status = resident.estadoSaude || 'ATIVO';
                    const obs = resident.observacoes || '';
                    
                    const seed = resident.id % 5;
                    let values = [88, 92, 90, 89, 95, 91, 93];
                    if (status === 'GRAVE') {
                        values = [55 + seed, 48 - seed, 52 + seed, 45 - seed, 56 + seed, 42 - seed, 49 + seed];
                    } else if (status === 'OBSERVACAO') {
                        values = [72 + seed, 70 - seed, 75 + seed, 68 - seed, 74 + seed, 71 - seed, 73 + seed];
                    } else {
                        values = [88 + seed, 92 - seed, 90 + seed, 89 - seed, 95 + seed, 91 - seed, 93 + seed];
                    }

                    const total = values.reduce((sum, v) => sum + v, 0);
                    const average = total / 7;
                    const maxVal = Math.max(...values);
                    const minVal = Math.min(...values);
                    const highestIdx = values.indexOf(maxVal);
                    const lowestIdx = values.indexOf(minVal);
                    const weekdayLabelsLong = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

                    dynamicReportData = {
                        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                        values,
                        summary: {
                            total,
                            average,
                            highest: weekdayLabelsLong[highestIdx],
                            lowest: weekdayLabelsLong[lowestIdx]
                        }
                    };

                    if (status === 'GRAVE') {
                        dynamicTableData.push({ id: 1, date: '2026-05-27', description: 'Monitoramento clínico intensivo (Grave)', status: 'concluida' });
                        dynamicTableData.push({ id: 2, date: '2026-05-26', description: 'Frequência cardíaca e pressão sob alerta', status: 'concluida' });
                        dynamicTableData.push({ id: 3, date: '2026-05-25', description: 'Consulta médica urgente realizada', status: 'concluida' });
                    } else if (status === 'OBSERVACAO') {
                        dynamicTableData.push({ id: 1, date: '2026-05-27', description: 'Pressão Arterial: 130/85 (Observação)', status: 'concluida' });
                        dynamicTableData.push({ id: 2, date: '2026-05-26', description: 'Temperatura aferida: 36.8°C', status: 'concluida' });
                        dynamicTableData.push({ id: 3, date: '2026-05-24', description: 'Acompanhamento na caminhada assistida', status: 'concluida' });
                    } else {
                        dynamicTableData.push({ id: 1, date: '2026-05-27', description: 'Sinais vitais normais e estáveis: 120/80', status: 'concluida' });
                        dynamicTableData.push({ id: 2, date: '2026-05-25', description: 'Avaliação física geral diária', status: 'concluida' });
                        dynamicTableData.push({ id: 3, date: '2026-05-23', description: 'Nenhuma queixa de dor reportada', status: 'concluida' });
                    }

                    if (obs && obs.trim().length > 0) {
                        dynamicTableData.push({ id: 4, date: '2026-05-22', description: `Anotações: ${obs.substring(0, 32)}...`, status: 'concluida' });
                    } else {
                        dynamicTableData.push({ id: 4, date: '2026-05-22', description: 'Status geral: Sem observações adicionais', status: 'concluida' });
                    }
                }

                setReportData(dynamicReportData);
                setTableData(dynamicTableData);
            }
        } catch (err) {
            console.error('Erro ao carregar dados do relatório:', err);
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        if (selectedResident) {
            carregarDadosRelatorio(selectedResident, selectedReport);
        }
    }, [selectedResident, selectedReport]);

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
                    <ActivityIndicator size="large" color="#202c4b" />
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
                                        color={selectedReport === report.type ? '#FFFFFF' : '#202c4b'}
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
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedResident(TODOS_OS_RESIDENTES);
                                            setShowResidentDropdown(false);
                                        }}
                                        style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                                    >
                                        <Text style={{ fontSize: 14, color: '#202c4b', fontWeight: '700' }}>
                                            Todos os Residentes
                                        </Text>
                                    </TouchableOpacity>

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
                                <Ionicons name="calendar-outline" size={16} color="#202c4b" />
                                <Text style={styles.dateInputText}>{dateFrom}</Text>
                            </View>
                            <View style={[styles.dateInput, { minWidth: 40, justifyContent: 'center' }]}>
                                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>até</Text>
                            </View>
                            <View style={styles.dateInput}>
                                <Ionicons name="calendar-outline" size={16} color="#202c4b" />
                                <Text style={styles.dateInputText}>{dateTo}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Indicadores */}
                    <View style={styles.chartsSection}>
                        {loadingReport || !reportData ? (
                            <View style={[styles.chartCard, { height: 260, justifyContent: 'center', alignItems: 'center' }]}>
                                <ActivityIndicator size="large" color="#202c4b" />
                                <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 12, fontWeight: '500' }}>Processando estatísticas...</Text>
                            </View>
                        ) : (
                            <View style={styles.chartCard}>
                                <Text style={styles.chartTitle}>
                                    {selectedReport === 'saude' ? 'Estabilidade Clínica (Sinais Vitais e Bem-Estar)'
                                     : selectedReport === 'alimentacao' ? 'Adesão Nutricional (Aceitação das Refeições)'
                                     : selectedReport === 'medicamentos' ? 'Conformidade de Medicamentos (Taxa de Adm.)'
                                     : 'Engajamento Geral (Atividades Diárias)'}
                                </Text>
                                {reportData.labels.map((label, index) => (
                                    <View key={label} style={styles.simpleBarRow}>
                                        <Text style={styles.simpleBarLabel}>{label}</Text>
                                        <View style={styles.simpleBarTrack}>
                                            <View style={[
                                                styles.simpleBarFill, 
                                                { width: `${selectedReport === 'atividades' 
                                                    ? Math.min((reportData.values[index] || 0) * 15, 100) 
                                                    : Math.min(reportData.values[index] || 0, 100)}%` }
                                            ]} />
                                        </View>
                                        <Text style={styles.simpleBarValue}>
                                            {reportData.values[index]}
                                            {selectedReport !== 'atividades' ? '%' : ''}
                                        </Text>
                                    </View>
                                ))}

                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Total Concluído' 
                                             : selectedReport === 'medicamentos' ? 'Foco de Monitoria'
                                             : selectedReport === 'alimentacao' ? 'Tipo de Dieta' 
                                             : 'Monitorados'}
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {selectedReport === 'saude' ? (selectedResident?.id === -1 ? `${idosos.length} idosos` : '1 idoso') 
                                             : selectedReport === 'medicamentos' ? (selectedResident?.id === -1 ? 'Todos' : 'Individual')
                                             : selectedReport === 'alimentacao' ? (selectedResident?.id === -1 ? 'Geral' : 'Individual')
                                             : reportData.summary.total}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Média Diária' 
                                             : selectedReport === 'medicamentos' ? 'Taxa de Adesão'
                                             : selectedReport === 'alimentacao' ? 'Aceitação Média' 
                                             : 'Índice de Estabilidade'}
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {reportData.summary.average.toFixed(1)}
                                            {selectedReport !== 'atividades' ? '%' : ''}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Pico de Atividade' 
                                             : selectedReport === 'saude' ? 'Melhor Status' 
                                             : 'Melhor Dia'}
                                        </Text>
                                        <Text style={styles.summaryValue} numberOfLines={1}>
                                            {reportData.summary.highest}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Menor Atividade' 
                                             : 'Maior Risco'}
                                        </Text>
                                        <Text style={styles.summaryValue} numberOfLines={1}>
                                            {reportData.summary.lowest}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Tabela de Resumo */}
                    {loadingReport ? (
                        <View style={[styles.tableCard, { height: 180, justifyContent: 'center', alignItems: 'center' }]}>
                            <ActivityIndicator size="small" color="#202c4b" />
                        </View>
                    ) : tableData.length > 0 ? (
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
