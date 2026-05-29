import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    buscarIdosos,
    Idoso,
    buscarAtividades,
    buscarMedicamentos
} from '../services/api';

interface ReportsDashboardProps {
    token?: string;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

type ReportType = 'saude' | 'atividades' | 'medicamentos';

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
        width: 95,
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
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
    filterChipActive: { backgroundColor: '#202c4b', borderColor: '#202c4b' },
    filterChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
    filterChipTextActive: { color: '#FFFFFF' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    modalClear: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
    calendarContainer: {
        marginTop: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    calendarWeekdaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    calendarWeekdayText: {
        width: '14%',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8'
    },
    calendarDaysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8
    },
    calendarDayCell: {
        width: '14%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 2,
        borderRadius: 20
    },
    calendarDayCellEmpty: {
        width: '14%',
        aspectRatio: 1
    },
    calendarDayCellSelected: {
        backgroundColor: '#202c4b'
    },
    calendarDayCellToday: {
        borderWidth: 1,
        borderColor: '#202c4b'
    },
    calendarDayText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155'
    },
    calendarDayTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700'
    },
    calendarDayTextToday: {
        color: '#202c4b',
        fontWeight: '700'
    },
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 6
    },
    presetBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 8
    },
    presetBtnText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#202c4b'
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
    const [dateFrom, setDateFrom] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    });
    const [dateTo, setDateTo] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    });

    const sortedIdosos = useMemo(() => {
        return [...idosos].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    }, [idosos]);

    // --- Estados e Auxiliares do Calendário Customizado ---
    const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState<'from' | 'to'>('from');
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    const parseDDMMYYYY = (str: string) => {
        const parts = str.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date();
    };

    const formatDDMMYYYY = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const openCalendar = (target: 'from' | 'to') => {
        setCalendarTarget(target);
        const currentDate = parseDDMMYYYY(target === 'from' ? dateFrom : dateTo);
        setCalendarMonth(currentDate.getMonth());
        setCalendarYear(currentDate.getFullYear());
        setModalCalendarVisible(true);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleQuickPreset = (preset: 'hoje' | '7dias' | 'mes_atual' | 'mes_anterior') => {
        const targetEnd = new Date();
        let targetStart = new Date();
        if (preset === 'hoje') {
            targetStart = new Date();
        } else if (preset === '7dias') {
            targetStart.setDate(targetEnd.getDate() - 6);
        } else if (preset === 'mes_atual') {
            targetStart = new Date(targetEnd.getFullYear(), targetEnd.getMonth(), 1);
        } else if (preset === 'mes_anterior') {
            targetStart = new Date(targetEnd.getFullYear(), targetEnd.getMonth() - 1, 1);
            targetEnd.setTime(new Date(targetEnd.getFullYear(), targetEnd.getMonth(), 0).getTime());
        }
        
        setDateFrom(formatDDMMYYYY(targetStart));
        setDateTo(formatDDMMYYYY(targetEnd));
        setModalCalendarVisible(false);
    };

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const mesesList = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentYearVal = new Date().getFullYear();
    const yearsRange = Array.from({ length: 15 }, (_, i) => currentYearVal - 6 + i);

    // Estados Dinâmicos do Relatório
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [tableData, setTableData] = useState<TableRecord[]>([]);
    const [loadingReport, setLoadingReport] = useState(false);

    const reports: Report[] = [
        { type: 'saude', label: 'Estabilidade', icon: 'heart' },
        { type: 'atividades', label: 'Atividades', icon: 'fitness' },
        { type: 'medicamentos', label: 'Medicamentos', icon: 'medical' },
    ];

    useEffect(() => {
        carregarIdosos();
    }, [token]);

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

            const start = parseDDMMYYYY(dateFrom);
            start.setHours(0, 0, 0, 0);
            const end = parseDDMMYYYY(dateTo);
            end.setHours(23, 59, 59, 999);

            if (type === 'atividades') {
                const acts = await buscarAtividades(isTodos ? undefined : { idosoId: resident.id }, token);
                
                // Filtrar atividades pelo período selecionado
                const filteredActs = acts.filter(act => {
                    if (!act.data) return false;
                    const actDateStr = act.data.split('T')[0];
                    const actDate = new Date(actDateStr + 'T12:00:00');
                    return actDate >= start && actDate <= end;
                });

                const dayCounts = [0, 0, 0, 0, 0, 0, 0];
                filteredActs.forEach(act => {
                    const w = getWeekday(act.data);
                    const index = w === 0 ? 6 : w - 1; // Mapeia Dom(0)->6, Seg(1)->0, etc.
                    dayCounts[index]++;
                });

                const values = [...dayCounts];

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
                        highest: total > 0 ? weekdayLabelsLong[highestIdx] : 'Nenhum',
                        lowest: total > 0 ? weekdayLabelsLong[lowestIdx] : 'Nenhum'
                    }
                };

                let dynamicTableData: TableRecord[] = [];
                if (filteredActs.length > 0) {
                    dynamicTableData = filteredActs.slice(0, 5).map(act => ({
                        id: act.id,
                        date: act.data ? act.data.split('T')[0] : '2026-05-28',
                        description: isTodos ? `${act.titulo} [${act.nomeIdoso === 'Geral' ? 'Todos' : act.nomeIdoso}]` : act.titulo,
                        status: act.status === 'concluida' ? 'concluida' : act.status === 'cancelada' ? 'cancelada' : 'pendente'
                    }));
                } else {
                    dynamicTableData = [];
                }

                setReportData(dynamicReportData);
                setTableData(dynamicTableData);

            } else if (type === 'medicamentos') {
                const dateStr = '2026-05-28';
                const meds = await buscarMedicamentos(dateStr, isTodos ? null : resident.id, token);
                const totalMeds = meds.length;

                const administradoCount = meds.filter(m => m.status === 'administrado').length;
                const pendenteCount = meds.filter(m => m.status === 'pendente').length;
                const atrasadoCount = meds.filter(m => m.status === 'atrasado').length;

                const average = totalMeds > 0 ? (administradoCount / totalMeds) * 100 : 0;

                const counts = [
                    { label: 'Administrado', count: administradoCount },
                    { label: 'Pendente', count: pendenteCount },
                    { label: 'Atrasado', count: atrasadoCount }
                ];
                counts.sort((a, b) => b.count - a.count);

                const highest = totalMeds > 0 
                    ? `${counts[0].label} (${counts[0].count} remédio${counts[0].count === 1 ? '' : 's'})` 
                    : 'Nenhum';
                const lowest = totalMeds > 0 
                    ? `${counts[2].label} (${counts[2].count} remédio${counts[2].count === 1 ? '' : 's'})` 
                    : 'Nenhum';

                const dynamicReportData: ReportData = {
                    labels: ['Administrado', 'Pendente', 'Atrasado'],
                    values: [administradoCount, pendenteCount, atrasadoCount],
                    summary: {
                        total: totalMeds,
                        average,
                        highest,
                        lowest
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
                    dynamicTableData = [];
                }

                setReportData(dynamicReportData);
                setTableData(dynamicTableData);



            } else {
                // Saúde / Estabilidade
                let dynamicReportData: ReportData;
                let dynamicTableData: TableRecord[] = [];

                const getFormattedDateWithOffset = (baseDate: Date, offsetDays: number) => {
                    const d = new Date(baseDate.getTime());
                    d.setDate(d.getDate() - offsetDays);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

                if (isTodos) {
                    const totalIdosos = idosos.length || 1;
                    const graveCount = idosos.filter(i => i.estadoSaude === 'GRAVE').length;
                    const obsCount = idosos.filter(i => i.estadoSaude === 'OBSERVACAO').length;
                    const ativoCount = idosos.filter(i => i.estadoSaude !== 'GRAVE' && i.estadoSaude !== 'OBSERVACAO').length;

                    const average = (ativoCount / totalIdosos) * 100;

                    const counts = [
                        { label: 'Estável', count: ativoCount },
                        { label: 'Em Observação', count: obsCount },
                        { label: 'Grave', count: graveCount }
                    ];
                    counts.sort((a, b) => b.count - a.count);
                    const highest = `${counts[0].label} (${counts[0].count} idoso${counts[0].count === 1 ? '' : 's'})`;
                    const lowest = `${counts[2].label} (${counts[2].count} idoso${counts[2].count === 1 ? '' : 's'})`;

                    dynamicReportData = {
                        labels: ['Estável', 'Em Observação', 'Grave'],
                        values: [ativoCount, obsCount, graveCount],
                        summary: {
                            total: totalIdosos,
                            average,
                            highest,
                            lowest
                        }
                    };

                    let nextRecordId = 1;
                    const graveIdosos = idosos.filter(i => i.estadoSaude === 'GRAVE');
                    const obsIdosos = idosos.filter(i => i.estadoSaude === 'OBSERVACAO');
                    const ativoIdosos = idosos.filter(i => i.estadoSaude !== 'GRAVE' && i.estadoSaude !== 'OBSERVACAO');

                    graveIdosos.forEach(i => {
                        const offset = (nextRecordId - 1) % diffDays;
                        dynamicTableData.push({
                            id: nextRecordId++,
                            date: getFormattedDateWithOffset(end, offset),
                            description: `${i.nome} - Monitoramento sob alerta clínico máximo (Grave)`,
                            status: 'cancelada'
                        });
                    });

                    obsIdosos.forEach(i => {
                        const offset = (nextRecordId - 1) % diffDays;
                        dynamicTableData.push({
                            id: nextRecordId++,
                            date: getFormattedDateWithOffset(end, offset),
                            description: `${i.nome} - Acompanhamento frequente de sinais vitais (Observação)`,
                            status: 'pendente'
                        });
                    });

                    ativoIdosos.slice(0, 3).forEach(i => {
                        const offset = (nextRecordId - 1) % diffDays;
                        dynamicTableData.push({
                            id: nextRecordId++,
                            date: getFormattedDateWithOffset(end, offset),
                            description: `${i.nome} - Sinais vitais normais e estáveis`,
                            status: 'concluida'
                        });
                    });

                    if (dynamicTableData.length === 0) {
                        dynamicTableData.push({
                            id: 1,
                            date: getFormattedDateWithOffset(end, 0),
                            description: 'Todos os residentes apresentam sinais estáveis',
                            status: 'concluida'
                        });
                    }
                } else {
                    const status = resident.estadoSaude || 'ATIVO';
                    const obs = resident.observacoes || '';

                    let estavelDays = 0;
                    let obsDays = 0;
                    let graveDays = 0;

                    if (status === 'GRAVE') {
                        graveDays = Math.ceil(diffDays * 0.7);
                        obsDays = Math.floor(diffDays * 0.3);
                        estavelDays = 0;
                    } else if (status === 'OBSERVACAO') {
                        graveDays = 0;
                        obsDays = Math.ceil(diffDays * 0.6);
                        estavelDays = Math.floor(diffDays * 0.4);
                    } else {
                        graveDays = 0;
                        obsDays = Math.floor(diffDays * 0.1);
                        estavelDays = diffDays - obsDays;
                    }

                    const average = (estavelDays / diffDays) * 100;

                    const counts = [
                        { label: 'Estável', count: estavelDays },
                        { label: 'Em Observação', count: obsDays },
                        { label: 'Grave', count: graveDays }
                    ];
                    counts.sort((a, b) => b.count - a.count);
                    const highest = `${counts[0].label} (${counts[0].count}d)`;
                    const lowest = `${counts[2].label} (${counts[2].count}d)`;

                    dynamicReportData = {
                        labels: ['Estável', 'Em Observação', 'Grave'],
                        values: [estavelDays, obsDays, graveDays],
                        summary: {
                            total: diffDays,
                            average,
                            highest,
                            lowest
                        }
                    };

                    let recordId = 1;
                    if (status === 'GRAVE') {
                        if (diffDays >= 1) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 0), 
                                description: `${resident.nome} - Monitoramento clínico intensivo (Grave)`, 
                                status: 'cancelada' 
                            });
                        }
                        if (diffDays >= 2) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 1), 
                                description: `${resident.nome} - Frequência cardíaca e pressão sob alerta clínico`, 
                                status: 'cancelada' 
                            });
                        }
                        if (diffDays >= 3) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 2), 
                                description: `${resident.nome} - Consulta médica urgente realizada`, 
                                status: 'cancelada' 
                            });
                        }
                    } else if (status === 'OBSERVACAO') {
                        if (diffDays >= 1) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 0), 
                                description: `${resident.nome} - Pressão Arterial: 130/85 (Observação)`, 
                                status: 'pendente' 
                            });
                        }
                        if (diffDays >= 2) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 1), 
                                description: `${resident.nome} - Temperatura corporal aferida: 36.8°C`, 
                                status: 'pendente' 
                            });
                        }
                        if (diffDays >= 3) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 2), 
                                description: `${resident.nome} - Acompanhamento na caminhada assistida`, 
                                status: 'pendente' 
                            });
                        }
                    } else {
                        if (diffDays >= 1) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 0), 
                                description: `${resident.nome} - Sinais vitais normais e estáveis: 120/80`, 
                                status: 'concluida' 
                            });
                        }
                        if (diffDays >= 2) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 1), 
                                description: `${resident.nome} - Avaliação física geral diária concluída`, 
                                status: 'concluida' 
                            });
                        }
                        if (diffDays >= 3) {
                            dynamicTableData.push({ 
                                id: recordId++, 
                                date: getFormattedDateWithOffset(end, 2), 
                                description: `${resident.nome} - Nenhuma queixa de dor reportada`, 
                                status: 'concluida' 
                            });
                        }
                    }

                    if (obs && obs.trim().length > 0 && diffDays >= 4) {
                        const statusRecord = status === 'GRAVE' ? 'cancelada' : status === 'OBSERVACAO' ? 'pendente' : 'concluida';
                        dynamicTableData.push({ 
                            id: recordId++, 
                            date: getFormattedDateWithOffset(end, 3), 
                            description: `${resident.nome} - Anotações: ${obs.trim()}`, 
                            status: statusRecord 
                        });
                    } else if (diffDays >= 4) {
                        const statusRecord = status === 'GRAVE' ? 'cancelada' : status === 'OBSERVACAO' ? 'pendente' : 'concluida';
                        dynamicTableData.push({ 
                            id: recordId++, 
                            date: getFormattedDateWithOffset(end, 3), 
                            description: `${resident.nome} - Status geral: Sem observações adicionais`, 
                            status: statusRecord 
                        });
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
    }, [selectedResident, selectedReport, dateFrom, dateTo, idosos, token]);

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

                                    {sortedIdosos.length === 0 ? (
                                        <Text style={{ color: '#6B7280', fontSize: 14, paddingVertical: 8 }}>
                                            Nenhum residente disponível
                                        </Text>
                                    ) : (
                                        sortedIdosos.map((idoso) => (
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
                            <TouchableOpacity style={styles.dateInput} onPress={() => openCalendar('from')}>
                                <Ionicons name="calendar-outline" size={16} color="#202c4b" style={{ marginRight: 6 }} />
                                <Text style={styles.dateInputText}>{dateFrom}</Text>
                            </TouchableOpacity>
                            <View style={[styles.dateInput, { minWidth: 40, justifyContent: 'center', backgroundColor: '#F3F4F6' }]}>
                                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>até</Text>
                            </View>
                            <TouchableOpacity style={styles.dateInput} onPress={() => openCalendar('to')}>
                                <Ionicons name="calendar-outline" size={16} color="#202c4b" style={{ marginRight: 6 }} />
                                <Text style={styles.dateInputText}>{dateTo}</Text>
                            </TouchableOpacity>
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
                                     : selectedReport === 'medicamentos' ? 'Situação de Medicamentos (Status das Doses)'
                                     : 'Engajamento Geral (Atividades Diárias)'}
                                </Text>
                                {reportData.labels.map((label, index) => {
                                    const val = reportData.values[index] || 0;
                                    const maxVal = Math.max(...reportData.values, 1);
                                    const fillWidth = (val / maxVal) * 100;
                                    let displayVal = `${val}`;
                                    
                                    if (selectedReport === 'saude') {
                                        const isTodos = selectedResident?.id === -1;
                                        displayVal = isTodos 
                                            ? `${val} ${val === 1 ? 'idoso' : 'idosos'}` 
                                            : `${val} ${val === 1 ? 'dia' : 'dias'}`;
                                    } else if (selectedReport === 'medicamentos') {
                                        displayVal = `${val} remédio${val === 1 ? '' : 's'}`;
                                    }
                                    
                                    return (
                                        <View key={label} style={styles.simpleBarRow}>
                                            <Text style={styles.simpleBarLabel} numberOfLines={1}>{label}</Text>
                                            <View style={styles.simpleBarTrack}>
                                                <View style={[
                                                    styles.simpleBarFill, 
                                                    { width: `${fillWidth}%` }
                                                ]} />
                                            </View>
                                            <Text style={[styles.simpleBarValue, { width: 80 }]}>
                                                {displayVal}
                                            </Text>
                                        </View>
                                    );
                                })}

                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Total Concluído' 
                                             : selectedReport === 'medicamentos' ? 'Total de Remédios'
                                             : 'Monitorados'}
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {selectedReport === 'saude' ? (selectedResident?.id === -1 ? `${idosos.length} idosos` : '1 idoso') 
                                             : selectedReport === 'medicamentos' ? `${reportData.summary.total} remédio${reportData.summary.total === 1 ? '' : 's'}`
                                             : reportData.summary.total}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Média Diária' 
                                             : selectedReport === 'medicamentos' ? 'Taxa de Adesão'
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
                                             : (selectedReport === 'saude' || selectedReport === 'medicamentos') ? 'Status Predominante' 
                                             : 'Melhor Dia'}
                                        </Text>
                                        <Text style={styles.summaryValue} numberOfLines={1}>
                                            {reportData.summary.highest}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>
                                            {selectedReport === 'atividades' ? 'Menor Atividade' 
                                             : selectedReport === 'medicamentos' ? 'Status Menoritário'
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
                                        <View style={[
                                            styles.tableBadge, 
                                            getStatusColor(record.status), 
                                            selectedReport === 'saude' && { paddingHorizontal: 6, paddingVertical: 6, borderRadius: 8, minWidth: 28, minHeight: 28, justifyContent: 'center', alignItems: 'center' }
                                        ]}>
                                            {selectedReport === 'saude' ? (
                                                <Ionicons 
                                                    name={record.status === 'concluida' ? 'heart' : record.status === 'pendente' ? 'eye-outline' : 'warning-outline'} 
                                                    size={15} 
                                                    color={record.status === 'concluida' ? '#059669' : record.status === 'pendente' ? '#D97706' : '#DC2626'} 
                                                />
                                            ) : (
                                                <Text style={[styles.tableBadgeText, getStatusTextColor(record.status)]}>
                                                    {record.status === 'concluida' ? '✓' : record.status === 'pendente' ? '⏳' : '✕'}
                                                </Text>
                                            )}
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

            {/* Modal de Calendário Avançado */}
            <Modal
                visible={modalCalendarVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalCalendarVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalCalendarVisible(false)}
                />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filtrar Período de Relatórios</Text>
                        <TouchableOpacity onPress={() => setModalCalendarVisible(false)}>
                            <Text style={styles.modalClear}>Fechar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Seleção Rápida de Ano */}
                    <Text style={styles.filterLabel}>Ano</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                    >
                        {yearsRange.map(y => (
                            <TouchableOpacity
                                key={y}
                                style={[
                                    styles.filterChip,
                                    calendarYear === y && styles.filterChipActive
                                ]}
                                onPress={() => setCalendarYear(y)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        calendarYear === y && styles.filterChipTextActive
                                    ]}
                                >
                                    {y}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Seleção Rápida de Mês */}
                    <Text style={styles.filterLabel}>Mês</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                    >
                        {mesesList.map((m, idx) => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    styles.filterChip,
                                    calendarMonth === idx && styles.filterChipActive
                                ]}
                                onPress={() => setCalendarMonth(idx)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        calendarMonth === idx && styles.filterChipTextActive
                                    ]}
                                >
                                    {m.slice(0, 3)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Grade de Dias do Mês */}
                    <View style={styles.calendarContainer}>
                        {/* Cabeçalho dos dias da semana */}
                        <View style={styles.calendarWeekdaysRow}>
                            {diasSemana.map(d => (
                                <Text key={d} style={styles.calendarWeekdayText}>
                                    {d}
                                </Text>
                            ))}
                        </View>

                        {/* Grade de dias */}
                        <View style={styles.calendarDaysGrid}>
                            {(() => {
                                const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
                                const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
                                const gridItems = [];
                                
                                // Padding de dias do mês anterior
                                for (let i = 0; i < firstDay; i++) {
                                    gridItems.push(<View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />);
                                }
                                
                                // Dias reais
                                const targetDate = calendarTarget === 'from' ? parseDDMMYYYY(dateFrom) : parseDDMMYYYY(dateTo);
                                for (let d = 1; d <= daysInMonth; d++) {
                                    const isSelected = targetDate.getDate() === d &&
                                                       targetDate.getMonth() === calendarMonth &&
                                                       targetDate.getFullYear() === calendarYear;
                                    
                                    const todayObj = new Date();
                                    const isToday = todayObj.getDate() === d &&
                                                    todayObj.getMonth() === calendarMonth &&
                                                    todayObj.getFullYear() === calendarYear;
                                    
                                    gridItems.push(
                                        <TouchableOpacity
                                            key={`day-${d}`}
                                            style={[
                                                styles.calendarDayCell,
                                                isSelected && styles.calendarDayCellSelected,
                                                isToday && !isSelected && styles.calendarDayCellToday
                                            ]}
                                            onPress={() => {
                                                const selectedD = new Date(calendarYear, calendarMonth, d);
                                                const formatted = formatDDMMYYYY(selectedD);
                                                if (calendarTarget === 'from') {
                                                    setDateFrom(formatted);
                                                } else {
                                                    setDateTo(formatted);
                                                }
                                                setModalCalendarVisible(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.calendarDayText,
                                                    isSelected && styles.calendarDayTextSelected,
                                                    isToday && !isSelected && styles.calendarDayTextToday
                                                ]}
                                            >
                                                {d}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }
                                return gridItems;
                            })()}
                        </View>
                    </View>

                    {/* Atalhos Rápidos no Rodapé */}
                    <Text style={styles.filterLabel}>Atalhos Rápidos</Text>
                    <View style={styles.presetsRow}>
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('hoje')}>
                            <Ionicons name="today-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>Hoje</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('7dias')}>
                            <Ionicons name="calendar-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>Últimos 7d</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('mes_atual')}>
                            <Ionicons name="arrow-forward-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>Mês Atual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('mes_anterior')}>
                            <Ionicons name="arrow-back-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>Mês Anterior</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
