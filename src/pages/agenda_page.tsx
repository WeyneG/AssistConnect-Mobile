import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Periodo = 'manhã' | 'tarde' | 'noite';
type ActivityStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
type ViewMode = 'lista' | 'detalhe' | 'editar' | 'criar';

interface Activity {
    id: number;
    date: string;
    period: Periodo;
    time: string;
    title: string;
    resident: string;
    status: ActivityStatus;
    location: string;
    notes: string;
    responsible: string;
}

// ─── Metadados visuais ────────────────────────────────────────────────────────

const periodos: Periodo[] = ['manhã', 'tarde', 'noite'];

const periodMeta: Record<Periodo, { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; backgroundColor: string }> = {
    manhã: { label: 'Manhã', icon: 'sunny', color: '#B45309', backgroundColor: '#FEF3C7' },
    tarde: { label: 'Tarde', icon: 'partly-sunny', color: '#C2410C', backgroundColor: '#FFEDD5' },
    noite: { label: 'Noite', icon: 'moon', color: '#4338CA', backgroundColor: '#EDE9FE' },
};

const statusMeta: Record<ActivityStatus, { label: string; color: string; backgroundColor: string }> = {
    pendente: { label: 'Pendente', color: '#B45309', backgroundColor: '#FEF3C7' },
    em_andamento: { label: 'Em andamento', color: '#1D4ED8', backgroundColor: '#DBEAFE' },
    concluida: { label: 'Concluída', color: '#059669', backgroundColor: '#D1FAE5' },
    atrasada: { label: 'Atrasada', color: '#DC2626', backgroundColor: '#FEE2E2' },
};

// ─── Helpers de data ──────────────────────────────────────────────────────────

const dateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const shiftDate = (date: Date, offset: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + offset);
    return next;
};

const formatDayLabel = (date: Date) => {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} • ${formatted}`;
};

// ─── Dados demo ───────────────────────────────────────────────────────────────

const createDemoActivities = (): Activity[] => {
    const today = new Date();
    const tomorrow = shiftDate(today, 1);
    const yesterday = shiftDate(today, -1);
    return [
        { id: 1, date: dateKey(today), period: 'manhã', time: '08:00', title: 'Medicação da manhã', resident: 'Sr. Carlos Silva', status: 'pendente', location: 'Quarto 12', notes: 'Administrar após o café da manhã e registrar reação.', responsible: 'Marina' },
        { id: 2, date: dateKey(today), period: 'manhã', time: '10:30', title: 'Higiene assistida', resident: 'Sra. Ana Santos', status: 'em_andamento', location: 'Banheiro assistido', notes: 'Acompanhar com calma e revisar itens de higiene.', responsible: 'Lucas' },
        { id: 3, date: dateKey(today), period: 'tarde', time: '14:00', title: 'Apoio no almoço', resident: 'Sr. João Pereira', status: 'concluida', location: 'Refeitório', notes: 'Alimentação concluída sem intercorrências.', responsible: 'Paula' },
        { id: 4, date: dateKey(today), period: 'tarde', time: '16:30', title: 'Fisioterapia leve', resident: 'Sra. Maria Costa', status: 'atrasada', location: 'Sala de atividades', notes: 'Reagendar com a equipe clínica e avisar a família.', responsible: 'Fernanda' },
        { id: 5, date: dateKey(today), period: 'noite', time: '19:00', title: 'Medicação noturna', resident: 'Sr. Pedro Alves', status: 'pendente', location: 'Quarto 09', notes: 'Aplicar antes de dormir e confirmar ingestão de água.', responsible: 'Marina' },
        { id: 6, date: dateKey(tomorrow), period: 'manhã', time: '09:00', title: 'Visita médica', resident: 'Sra. Ana Santos', status: 'pendente', location: 'Consultório 2', notes: 'Levar exames atualizados e prontuário.', responsible: 'Equipe' },
        { id: 7, date: dateKey(yesterday), period: 'noite', time: '20:00', title: 'Checagem de segurança', resident: 'Sr. Carlos Silva', status: 'concluida', location: 'Corredor A', notes: 'Rotina encerrada com passagem de plantão.', responsible: 'Marina' },
    ];
};

// ─── Chip de filtro ativo ─────────────────────────────────────────────────────

const ChipFiltro: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <View style={chipStyles.container}>
        <Text style={chipStyles.label}>{label}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
            <Ionicons name="close" size={13} color="#8297D9" />
        </TouchableOpacity>
    </View>
);

const chipStyles = StyleSheet.create({
    container: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#EEF2FF', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1, borderColor: '#8297D9',
    },
    label: { fontSize: 12, fontWeight: '600', color: '#8297D9' },
});

// ─── Componente principal ─────────────────────────────────────────────────────

export const AgendaPage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('lista');
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [activities, setActivities] = useState<Activity[]>(createDemoActivities());
    const [draftActivity, setDraftActivity] = useState<Activity | null>(null);

    // ── Filtros Sprint 3 ──────────────────────────────────────────────────────
    const [filtroResidente, setFiltroResidente] = useState<string | undefined>(undefined);
    const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo | undefined>(undefined);
    const [filtroStatus, setFiltroStatus] = useState<ActivityStatus | undefined>(undefined);
    const [modalFiltros, setModalFiltros] = useState(false);

    const residentes = useMemo(() => Array.from(new Set(activities.map(a => a.resident))).sort(), [activities]);

    const filtrosAtivos = [
        filtroResidente !== undefined && { key: 'residente', label: filtroResidente.replace(/^(Sr\.|Sra\.) /, ''), onRemove: () => setFiltroResidente(undefined) },
        filtroPeriodo !== undefined && { key: 'periodo', label: periodMeta[filtroPeriodo].label, onRemove: () => setFiltroPeriodo(undefined) },
        filtroStatus !== undefined && { key: 'status', label: statusMeta[filtroStatus].label, onRemove: () => setFiltroStatus(undefined) },
    ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const temFiltros = filtrosAtivos.length > 0;

    const limparFiltros = () => {
        setFiltroResidente(undefined);
        setFiltroPeriodo(undefined);
        setFiltroStatus(undefined);
    };
    // ─────────────────────────────────────────────────────────────────────────

    const selectedDateKey = dateKey(selectedDate);
    const selectedActivity = selectedActivityId ? activities.find(a => a.id === selectedActivityId) || null : null;

    const activitiesForDay = useMemo(() => {
        let result = activities.filter(a => a.date === selectedDateKey);
        if (filtroResidente) result = result.filter(a => a.resident === filtroResidente);
        if (filtroPeriodo) result = result.filter(a => a.period === filtroPeriodo);
        if (filtroStatus) result = result.filter(a => a.status === filtroStatus);
        return result;
    }, [activities, selectedDateKey, filtroResidente, filtroPeriodo, filtroStatus]);

    const completedCount = activitiesForDay.filter(a => a.status === 'concluida').length;
    const pendingCount = activitiesForDay.filter(a => a.status === 'pendente' || a.status === 'atrasada').length;
    const inProgressCount = activitiesForDay.filter(a => a.status === 'em_andamento').length;

    const openDetails = (activity: Activity) => { setSelectedActivityId(activity.id); setViewMode('detalhe'); };

    const startCreating = () => {
        setDraftActivity({ id: 0, date: selectedDateKey, period: 'manhã', time: '', title: '', resident: '', status: 'pendente', location: '', notes: '', responsible: '' });
        setViewMode('criar');
    };

    const saveNewActivity = () => {
        if (!draftActivity || !draftActivity.title.trim()) return;
        const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
        setActivities(prev => [...prev, { ...draftActivity, id: newId }]);
        resetToList();
    };

    const startEditing = () => { if (!selectedActivity) return; setDraftActivity({ ...selectedActivity }); setViewMode('editar'); };

    const saveEditing = () => {
        if (!draftActivity) return;
        setActivities(prev => prev.map(a => a.id === draftActivity.id ? { ...a, ...draftActivity } : a));
        setViewMode('detalhe');
    };

    const resetToList = () => { setViewMode('lista'); setSelectedActivityId(null); setDraftActivity(null); };

    const renderStatusChip = (status: ActivityStatus) => {
        const meta = statusMeta[status];
        return (
            <View style={[styles.statusChip, { backgroundColor: meta.backgroundColor }]}>
                <Text style={[styles.statusChipText, { color: meta.color }]}>{meta.label}</Text>
            </View>
        );
    };

    const renderEditField = (label: string, value: string, onChangeText: (text: string) => void, multiline = false) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput style={[styles.fieldInput, multiline && styles.fieldInputMultiline]} value={value} onChangeText={onChangeText} multiline={multiline} />
        </View>
    );

    const renderActivityCard = (activity: Activity) => {
        const meta = statusMeta[activity.status];
        return (
            <TouchableOpacity key={activity.id} style={styles.activityCard} activeOpacity={0.8} onPress={() => openDetails(activity)}>
                <View style={[styles.activityAccent, { backgroundColor: meta.color }]} />
                <View style={styles.activityTimeColumn}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <View style={styles.activityTimeLine} />
                </View>
                <View style={styles.activityContent}>
                    <View style={styles.activityHeaderRow}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        {renderStatusChip(activity.status)}
                    </View>
                    <Text style={styles.activityResident}>{activity.resident}</Text>
                    <Text style={styles.activityMeta}>{activity.location} • {activity.responsible}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ── Vista de detalhe ──────────────────────────────────────────────────────
    if (viewMode === 'detalhe' && selectedActivity) {
        const pMeta = periodMeta[selectedActivity.period];
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={resetToList} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalhes</Text>
                    <TouchableOpacity onPress={startEditing} style={styles.editBtn}>
                        <Ionicons name="create-outline" size={20} color="#8297D9" />
                        <Text style={styles.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.detailCard}>
                        <View style={[styles.detailPeriodBadge, { backgroundColor: pMeta.backgroundColor }]}>
                            <Ionicons name={pMeta.icon} size={16} color={pMeta.color} />
                            <Text style={[styles.detailPeriodText, { color: pMeta.color }]}>{pMeta.label} • {selectedActivity.time}</Text>
                        </View>
                        <Text style={styles.detailTitle}>{selectedActivity.title}</Text>
                        {renderStatusChip(selectedActivity.status)}
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}><Ionicons name="person-outline" size={16} color="#9CA3AF" /><Text style={styles.detailRowText}>{selectedActivity.resident}</Text></View>
                        <View style={styles.detailRow}><Ionicons name="location-outline" size={16} color="#9CA3AF" /><Text style={styles.detailRowText}>{selectedActivity.location}</Text></View>
                        <View style={styles.detailRow}><Ionicons name="shield-checkmark-outline" size={16} color="#9CA3AF" /><Text style={styles.detailRowText}>{selectedActivity.responsible}</Text></View>
                        {selectedActivity.notes ? (
                            <View style={styles.detailNotes}>
                                <Text style={styles.detailNotesLabel}>Observações</Text>
                                <Text style={styles.detailNotesText}>{selectedActivity.notes}</Text>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </View>
        );
    }

    // ── Vista de edição / criação ─────────────────────────────────────────────
    if ((viewMode === 'editar' || viewMode === 'criar') && draftActivity) {
        const isCreating = viewMode === 'criar';
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={isCreating ? resetToList : () => setViewMode('detalhe')} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isCreating ? 'Nova Atividade' : 'Editar'}</Text>
                    <TouchableOpacity onPress={isCreating ? saveNewActivity : saveEditing} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                    {renderEditField('Título', draftActivity.title, t => setDraftActivity(p => p ? { ...p, title: t } : p))}
                    {renderEditField('Residente', draftActivity.resident, t => setDraftActivity(p => p ? { ...p, resident: t } : p))}
                    {renderEditField('Horário', draftActivity.time, t => setDraftActivity(p => p ? { ...p, time: t } : p))}
                    {renderEditField('Local', draftActivity.location, t => setDraftActivity(p => p ? { ...p, location: t } : p))}
                    {renderEditField('Responsável', draftActivity.responsible, t => setDraftActivity(p => p ? { ...p, responsible: t } : p))}
                    {renderEditField('Observações', draftActivity.notes, t => setDraftActivity(p => p ? { ...p, notes: t } : p), true)}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Período</Text>
                        <View style={styles.periodOptions}>
                            {periodos.map(p => {
                                const meta = periodMeta[p];
                                const active = draftActivity.period === p;
                                return (
                                    <TouchableOpacity key={p} style={[styles.periodOption, active && { backgroundColor: meta.backgroundColor, borderColor: meta.color }]} onPress={() => setDraftActivity(prev => prev ? { ...prev, period: p } : prev)}>
                                        <Ionicons name={meta.icon} size={16} color={active ? meta.color : '#9CA3AF'} />
                                        <Text style={[styles.periodOptionText, { color: active ? meta.color : '#9CA3AF' }]}>{meta.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <View style={styles.statusOptions}>
                            {(Object.keys(statusMeta) as ActivityStatus[]).map(s => {
                                const meta = statusMeta[s];
                                const active = draftActivity.status === s;
                                return (
                                    <TouchableOpacity key={s} style={[styles.statusOption, { backgroundColor: active ? meta.backgroundColor : '#F9FAFB' }]} onPress={() => setDraftActivity(prev => prev ? { ...prev, status: s } : prev)}>
                                        <Text style={[styles.statusOptionText, { color: active ? meta.color : '#9CA3AF' }]}>{meta.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        );
    }

    // ── Vista de lista (principal) ────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Agenda</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* Botão de filtro com badge quando há filtros ativos */}
                    <TouchableOpacity style={[styles.addBtn, temFiltros && styles.filterBtnActive]} onPress={() => setModalFiltros(true)}>
                        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                        {temFiltros && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{filtrosAtivos.length}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={startCreating}>
                        <Ionicons name="add" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal de Filtros */}
            <Modal visible={modalFiltros} transparent animationType="slide" onRequestClose={() => setModalFiltros(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalFiltros(false)} />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filtros</Text>
                        {temFiltros && (
                            <TouchableOpacity onPress={() => { limparFiltros(); setModalFiltros(false); }}>
                                <Text style={styles.modalClear}>Limpar tudo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.filterLabel}>Residente</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        <TouchableOpacity style={[styles.filterChip, filtroResidente === undefined && styles.filterChipActive]} onPress={() => setFiltroResidente(undefined)}>
                            <Text style={[styles.filterChipText, filtroResidente === undefined && styles.filterChipTextActive]}>Todos</Text>
                        </TouchableOpacity>
                        {residentes.map(r => (
                            <TouchableOpacity key={r} style={[styles.filterChip, filtroResidente === r && styles.filterChipActive]} onPress={() => setFiltroResidente(filtroResidente === r ? undefined : r)}>
                                <Text style={[styles.filterChipText, filtroResidente === r && styles.filterChipTextActive]} numberOfLines={1}>{r.replace(/^(Sr\.|Sra\.) /, '')}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.filterLabel}>Período</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        <TouchableOpacity style={[styles.filterChip, filtroPeriodo === undefined && styles.filterChipActive]} onPress={() => setFiltroPeriodo(undefined)}>
                            <Text style={[styles.filterChipText, filtroPeriodo === undefined && styles.filterChipTextActive]}>Todos</Text>
                        </TouchableOpacity>
                        {periodos.map(p => (
                            <TouchableOpacity key={p} style={[styles.filterChip, filtroPeriodo === p && styles.filterChipActive]} onPress={() => setFiltroPeriodo(filtroPeriodo === p ? undefined : p)}>
                                <Ionicons name={periodMeta[p].icon} size={13} color={filtroPeriodo === p ? '#FFFFFF' : '#9CA3AF'} style={{ marginRight: 4 }} />
                                <Text style={[styles.filterChipText, filtroPeriodo === p && styles.filterChipTextActive]}>{periodMeta[p].label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.filterLabel}>Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        <TouchableOpacity style={[styles.filterChip, filtroStatus === undefined && styles.filterChipActive]} onPress={() => setFiltroStatus(undefined)}>
                            <Text style={[styles.filterChipText, filtroStatus === undefined && styles.filterChipTextActive]}>Todos</Text>
                        </TouchableOpacity>
                        {(Object.keys(statusMeta) as ActivityStatus[]).map(s => (
                            <TouchableOpacity key={s} style={[styles.filterChip, filtroStatus === s && styles.filterChipActive]} onPress={() => setFiltroStatus(filtroStatus === s ? undefined : s)}>
                                <Text style={[styles.filterChipText, filtroStatus === s && styles.filterChipTextActive]}>{statusMeta[s].label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.modalApplyBtn} onPress={() => setModalFiltros(false)}>
                        <Text style={styles.modalApplyText}>Aplicar{temFiltros ? ` (${filtrosAtivos.length} ativo${filtrosAtivos.length > 1 ? 's' : ''})` : ''}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Navegação de datas */}
                <View style={styles.dateNav}>
                    <TouchableOpacity onPress={() => setSelectedDate(d => shiftDate(d, -1))} style={styles.dateNavBtn}>
                        <Ionicons name="chevron-back" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.dateLabel}>{formatDayLabel(selectedDate)}</Text>
                    <TouchableOpacity onPress={() => setSelectedDate(d => shiftDate(d, 1))} style={styles.dateNavBtn}>
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Resumo do dia */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}><Text style={styles.summaryNum}>{completedCount}</Text><Text style={styles.summaryLabel}>Concluídas</Text></View>
                    <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: '#1D4ED8' }]}>{inProgressCount}</Text><Text style={styles.summaryLabel}>Em andamento</Text></View>
                    <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: '#B45309' }]}>{pendingCount}</Text><Text style={styles.summaryLabel}>Pendentes</Text></View>
                </View>

                {/* Chips de filtros ativos compactos */}
                {temFiltros && (
                    <View style={styles.activeFiltersRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
                            {filtrosAtivos.map(f => <ChipFiltro key={f.key} label={f.label} onRemove={f.onRemove} />)}
                        </ScrollView>
                        <TouchableOpacity style={styles.clearBtn} onPress={limparFiltros}>
                            <Ionicons name="close-circle" size={14} color="#EF4444" />
                            <Text style={styles.clearBtnText}>Limpar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Atividades por período */}
                {activitiesForDay.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>{temFiltros ? 'Nenhuma atividade com esses filtros' : 'Nenhuma atividade para este dia'}</Text>
                        {temFiltros && (
                            <TouchableOpacity style={styles.clearBtnLarge} onPress={limparFiltros}>
                                <Text style={styles.clearBtnLargeText}>Limpar filtros</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    periodos.map(periodo => {
                        const items = activitiesForDay.filter(a => a.period === periodo);
                        if (items.length === 0) return null;
                        const meta = periodMeta[periodo];
                        return (
                            <View key={periodo} style={styles.periodSection}>
                                <View style={[styles.periodHeader, { backgroundColor: meta.backgroundColor }]}>
                                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                                    <Text style={[styles.periodHeaderText, { color: meta.color }]}>{meta.label}</Text>
                                    <Text style={[styles.periodCount, { color: meta.color }]}>{items.length}</Text>
                                </View>
                                {items.map(renderActivityCard)}
                            </View>
                        );
                    })
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#8297D9', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    editBtnText: { fontSize: 13, fontWeight: '600', color: '#8297D9' },
    saveBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    saveBtnText: { fontSize: 13, fontWeight: '700', color: '#8297D9' },
    addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    dateNavBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
    dateLabel: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#1F2937', marginHorizontal: 8 },
    summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 4 },
    summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    summaryNum: { fontSize: 22, fontWeight: '700', color: '#059669' },
    summaryLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
    filterBtnActive: { backgroundColor: '#212B48' },
    filterBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
    filterBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
    // Modal de filtros
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    modalClear: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
    modalApplyBtn: { backgroundColor: '#8297D9', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    modalApplyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    // Chips ativos inline
    activeFiltersRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FEE2E2', borderRadius: 20, marginLeft: 8 },
    clearBtnText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
    // Lista
    periodSection: { paddingHorizontal: 20, marginTop: 16 },
    periodHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 10 },
    periodHeaderText: { flex: 1, fontSize: 14, fontWeight: '700' },
    periodCount: { fontSize: 13, fontWeight: '700' },
    activityCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    activityAccent: { width: 4 },
    activityTimeColumn: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, width: 52 },
    activityTime: { fontSize: 12, fontWeight: '700', color: '#374151' },
    activityTimeLine: { flex: 1, width: 1, backgroundColor: '#E5E7EB', marginTop: 4 },
    activityContent: { flex: 1, paddingVertical: 12, paddingRight: 14 },
    activityHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
    activityTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1F2937' },
    activityResident: { fontSize: 12, color: '#8297D9', fontWeight: '500', marginBottom: 2 },
    activityMeta: { fontSize: 11, color: '#9CA3AF' },
    statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusChipText: { fontSize: 10, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
    clearBtnLarge: { marginTop: 16, backgroundColor: '#8297D9', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    clearBtnLargeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    // Detalhe
    detailScroll: { flex: 1, padding: 20 },
    detailCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
    detailPeriodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
    detailPeriodText: { fontSize: 13, fontWeight: '600' },
    detailTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 10 },
    detailDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    detailRowText: { fontSize: 14, color: '#374151' },
    detailNotes: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginTop: 8 },
    detailNotesLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
    detailNotesText: { fontSize: 14, color: '#374151', lineHeight: 20 },
    // Formulário
    formScroll: { flex: 1, padding: 20 },
    periodOptions: { flexDirection: 'row', gap: 8 },
    periodOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
    periodOptionText: { fontSize: 13, fontWeight: '700' },
    fieldGroup: { marginBottom: 14 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
    fieldInput: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1F2937' },
    fieldInputMultiline: { minHeight: 96, textAlignVertical: 'top' },
    statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusOption: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999 },
    statusOptionText: { fontSize: 12, fontWeight: '800' },
});
