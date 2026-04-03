import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
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

const dateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const shiftDate = (date: Date, offset: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + offset);
    return nextDate;
};

const formatDayLabel = (date: Date) => {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} • ${formatted}`;
};

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

export const AgendaPage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('lista');
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [activities, setActivities] = useState<Activity[]>(createDemoActivities());
    const [draftActivity, setDraftActivity] = useState<Activity | null>(null);

    const selectedDateKey = dateKey(selectedDate);
    const selectedActivity = selectedActivityId ? activities.find(activity => activity.id === selectedActivityId) || null : null;
    const activitiesForDay = activities.filter(activity => activity.date === selectedDateKey);
    const completedCount = activitiesForDay.filter(activity => activity.status === 'concluida').length;
    const pendingCount = activitiesForDay.filter(activity => activity.status === 'pendente' || activity.status === 'atrasada').length;
    const inProgressCount = activitiesForDay.filter(activity => activity.status === 'em_andamento').length;
    const hasActivities = activitiesForDay.length > 0;

    const openDetails = (activity: Activity) => {
        setSelectedActivityId(activity.id);
        setViewMode('detalhe');
    };

    const startCreating = () => {
        setDraftActivity({
            id: 0,
            date: selectedDateKey,
            period: 'manhã',
            time: '',
            title: '',
            resident: '',
            status: 'pendente',
            location: '',
            notes: '',
            responsible: '',
        });
        setViewMode('criar');
    };

    const saveNewActivity = () => {
        if (!draftActivity || !draftActivity.title.trim()) {
            return;
        }
        const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
        setActivities(prev => [...prev, { ...draftActivity, id: newId }]);
        resetToList();
    };

    const startEditing = () => {
        if (!selectedActivity) {
            return;
        }

        setDraftActivity({ ...selectedActivity });
        setViewMode('editar');
    };

    const saveEditing = () => {
        if (!draftActivity) {
            return;
        }

        setActivities(prev => prev.map(activity => (
            activity.id === draftActivity.id ? { ...activity, ...draftActivity } : activity
        )));
        setViewMode('detalhe');
    };

    const resetToList = () => {
        setViewMode('lista');
        setSelectedActivityId(null);
        setDraftActivity(null);
    };

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
            <TextInput
                style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
            />
        </View>
    );

    const renderActivityCard = (activity: Activity) => {
        const meta = statusMeta[activity.status];

        return (
            <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                activeOpacity={0.8}
                onPress={() => openDetails(activity)}
            >
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
                    <View style={styles.activityFooter}>
                        <View style={styles.periodBadge}>
                            <Ionicons name="calendar-outline" size={14} color="#8297D9" />
                            <Text style={styles.periodBadgeText}>{activity.period}</Text>
                        </View>
                        <Text style={styles.detailLink}>Ver detalhes</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
            <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroEyebrow}>Agenda / atividades do dia</Text>
                        <Text style={styles.heroTitle}>Organize o turno por período</Text>
                        <Text style={styles.heroSubtitle}>Acompanhe manhã, tarde e noite com acesso rápido aos detalhes e à edição.</Text>
                    </View>
                    <View style={styles.heroIconBadge}>
                        <Ionicons name="calendar" size={28} color="#8297D9" />
                    </View>
                </View>

                <View style={styles.heroStatsRow}>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatNumber}>{activitiesForDay.length}</Text>
                        <Text style={styles.heroStatLabel}>Atividades</Text>
                    </View>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatNumber}>{pendingCount}</Text>
                        <Text style={styles.heroStatLabel}>Pendentes</Text>
                    </View>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatNumber}>{completedCount}</Text>
                        <Text style={styles.heroStatLabel}>Concluídas</Text>
                    </View>
                </View>
            </View>

            <View style={styles.quickStrip}>
                {(['manhã', 'tarde', 'noite'] as Periodo[]).map(periodo => {
                    const meta = periodMeta[periodo];
                    const count = activitiesForDay.filter(activity => activity.period === periodo).length;

                    return (
                        <View key={periodo} style={styles.quickStripItem}>
                            <View style={[styles.quickStripIcon, { backgroundColor: meta.backgroundColor }]}>
                                <Ionicons name={meta.icon} size={16} color={meta.color} />
                            </View>
                            <Text style={styles.quickStripValue}>{count}</Text>
                            <Text style={styles.quickStripLabel}>{meta.label}</Text>
                        </View>
                    );
                })}
            </View>

            <View style={styles.dateSelector}>
                <TouchableOpacity style={styles.dateNavButton} onPress={() => setSelectedDate(prev => shiftDate(prev, -1))}>
                    <Ionicons name="chevron-back" size={18} color="#1F2937" />
                </TouchableOpacity>

                <View style={styles.dateCenter}>
                    <Text style={styles.dateLabel}>{formatDayLabel(selectedDate)}</Text>
                    <Text style={styles.dateCount}>{activitiesForDay.length} atividade(s) no dia</Text>
                </View>

                <TouchableOpacity style={styles.dateNavButton} onPress={() => setSelectedDate(prev => shiftDate(prev, 1))}>
                    <Ionicons name="chevron-forward" size={18} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.todayButton} onPress={() => setSelectedDate(new Date())}>
                    <Ionicons name="today-outline" size={16} color="#8297D9" />
                    <Text style={styles.todayButtonText}>Hoje</Text>
                    <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>{inProgressCount} em andamento</Text>
                    </View>
                </TouchableOpacity>

                {viewMode === 'lista' && (
                    <TouchableOpacity style={styles.newActivityFab} onPress={startCreating} activeOpacity={0.85}>
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.newActivityFabText}>Nova atividade</Text>
                    </TouchableOpacity>
                )}
            </View>

            {viewMode === 'lista' && (
                <View style={styles.listSection}>
                    {!hasActivities && (
                        <View style={styles.emptyDayCard}>
                            <View style={styles.emptyDayIcon}>
                                <Ionicons name="calendar-outline" size={28} color="#8297D9" />
                            </View>
                            <Text style={styles.emptyDayTitle}>Nenhuma atividade neste dia</Text>
                            <Text style={styles.emptyDayText}>Use as setas para navegar entre os dias ou toque em Hoje para voltar ao dia atual.</Text>
                            <TouchableOpacity style={styles.emptyDayButton} onPress={startCreating}>
                                <Ionicons name="add-circle-outline" size={16} color="#8297D9" />
                                <Text style={styles.emptyDayButtonText}>Criar primeira atividade</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {periodos.map(periodo => {
                        const items = activitiesForDay.filter(activity => activity.period === periodo);
                        const meta = periodMeta[periodo];

                        return (
                            <View key={periodo} style={styles.periodSection}>
                                <View style={styles.periodHeader}>
                                    <View style={styles.periodHeaderLeft}>
                                        <View style={[styles.periodIcon, { backgroundColor: meta.backgroundColor }]}>
                                            <Ionicons name={meta.icon} size={16} color={meta.color} />
                                        </View>
                                        <View>
                                            <Text style={styles.periodTitle}>{meta.label}</Text>
                                            <Text style={styles.periodSubtitle}>{items.length === 0 ? 'Sem atividades' : 'Atividades programadas'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.periodCount}>{items.length}</Text>
                                </View>

                                {items.length === 0 ? (
                                    <View style={styles.emptyPeriod}>
                                        <Text style={styles.emptyPeriodText}>Sem atividades para este período.</Text>
                                    </View>
                                ) : (
                                    items.map(renderActivityCard)
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {viewMode === 'detalhe' && selectedActivity && (
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <View>
                            <Text style={styles.detailKicker}>Detalhes da atividade</Text>
                            <Text style={styles.detailTitle}>{selectedActivity.title}</Text>
                        </View>
                        {renderStatusChip(selectedActivity.status)}
                    </View>

                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Horário</Text><Text style={styles.detailValue}>{selectedActivity.time}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Período</Text><Text style={styles.detailValue}>{selectedActivity.period}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Idoso</Text><Text style={styles.detailValue}>{selectedActivity.resident}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Local</Text><Text style={styles.detailValue}>{selectedActivity.location}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Responsável</Text><Text style={styles.detailValue}>{selectedActivity.responsible}</Text></View>
                    <View style={styles.detailNotes}><Text style={styles.detailLabel}>Observações</Text><Text style={styles.detailNotesValue}>{selectedActivity.notes}</Text></View>

                    <View style={styles.detailActions}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={resetToList}>
                            <Text style={styles.secondaryButtonText}>Voltar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButton} onPress={startEditing}>
                            <Text style={styles.primaryButtonText}>Editar atividade</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {viewMode === 'criar' && draftActivity && (
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <View style={styles.detailHeaderLeft}>
                            <View style={styles.createKickerBadge}>
                                <Ionicons name="add-circle" size={16} color="#8297D9" />
                                <Text style={styles.detailKicker}>Nova atividade</Text>
                            </View>
                            <Text style={styles.detailTitle}>{formatDayLabel(selectedDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Período</Text>
                        <View style={styles.periodOptions}>
                            {(periodos).map(periodo => {
                                const meta = periodMeta[periodo];
                                const isSelected = draftActivity.period === periodo;

                                return (
                                    <TouchableOpacity
                                        key={periodo}
                                        style={[styles.periodOption, isSelected && { backgroundColor: meta.backgroundColor, borderColor: meta.color }]}
                                        onPress={() => setDraftActivity(prev => prev ? { ...prev, period: periodo } : prev)}
                                    >
                                        <Ionicons name={meta.icon} size={14} color={isSelected ? meta.color : '#9CA3AF'} />
                                        <Text style={[styles.periodOptionText, { color: isSelected ? meta.color : '#6B7280' }]}>{meta.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {renderEditField('Título *', draftActivity.title, text => setDraftActivity(prev => prev ? { ...prev, title: text } : prev))}
                    {renderEditField('Horário (ex: 08:00)', draftActivity.time, text => setDraftActivity(prev => prev ? { ...prev, time: text } : prev))}
                    {renderEditField('Idoso', draftActivity.resident, text => setDraftActivity(prev => prev ? { ...prev, resident: text } : prev))}
                    {renderEditField('Local', draftActivity.location, text => setDraftActivity(prev => prev ? { ...prev, location: text } : prev))}
                    {renderEditField('Responsável', draftActivity.responsible, text => setDraftActivity(prev => prev ? { ...prev, responsible: text } : prev))}
                    {renderEditField('Observações', draftActivity.notes, text => setDraftActivity(prev => prev ? { ...prev, notes: text } : prev), true)}

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Status inicial</Text>
                        <View style={styles.statusOptions}>
                            {(Object.keys(statusMeta) as ActivityStatus[]).map(status => {
                                const meta = statusMeta[status];
                                const isSelected = draftActivity.status === status;

                                return (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.statusOption, { backgroundColor: isSelected ? meta.backgroundColor : '#F9FAFB' }]}
                                        onPress={() => setDraftActivity(prev => prev ? { ...prev, status } : prev)}
                                    >
                                        <Text style={[styles.statusOptionText, { color: isSelected ? meta.color : '#6B7280' }]}>{meta.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.detailActions}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={resetToList}>
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.primaryButton, !draftActivity.title.trim() && styles.primaryButtonDisabled]}
                            onPress={saveNewActivity}
                            disabled={!draftActivity.title.trim()}
                        >
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Salvar atividade</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {viewMode === 'editar' && draftActivity && (
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <View>
                            <Text style={styles.detailKicker}>Editar atividade</Text>
                            <Text style={styles.detailTitle}>Atualize os dados do turno</Text>
                        </View>
                    </View>

                    {renderEditField('Título', draftActivity.title, text => setDraftActivity(prev => prev ? { ...prev, title: text } : prev))}
                    {renderEditField('Horário', draftActivity.time, text => setDraftActivity(prev => prev ? { ...prev, time: text } : prev))}
                    {renderEditField('Idoso', draftActivity.resident, text => setDraftActivity(prev => prev ? { ...prev, resident: text } : prev))}
                    {renderEditField('Local', draftActivity.location, text => setDraftActivity(prev => prev ? { ...prev, location: text } : prev))}
                    {renderEditField('Observações', draftActivity.notes, text => setDraftActivity(prev => prev ? { ...prev, notes: text } : prev), true)}

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <View style={styles.statusOptions}>
                            {(Object.keys(statusMeta) as ActivityStatus[]).map(status => {
                                const meta = statusMeta[status];
                                const isSelected = draftActivity.status === status;

                                return (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.statusOption, { backgroundColor: isSelected ? meta.backgroundColor : '#F9FAFB' }]}
                                        onPress={() => setDraftActivity(prev => prev ? { ...prev, status } : prev)}
                                    >
                                        <Text style={[styles.statusOptionText, { color: isSelected ? meta.color : '#6B7280' }]}>{meta.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.detailActions}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setViewMode('detalhe')}>
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButton} onPress={saveEditing}>
                            <Text style={styles.primaryButtonText}>Salvar alterações</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    screenContent: {
        paddingBottom: 24,
    },
    heroCard: {
        backgroundColor: '#8297D9',
        borderRadius: 24,
        padding: 20,
        marginTop: 18,
        marginHorizontal: 20,
        shadowColor: '#8297D9',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 5,
    },
    heroEyebrow: {
        fontSize: 12,
        fontWeight: '700',
        color: '#E0E7FF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.6,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
    },
    heroCopy: {
        flex: 1,
    },
    heroIconBadge: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroStatsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 18,
    },
    heroStatCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    heroStatNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    heroStatLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.85)',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    quickStrip: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginTop: 16,
    },
    quickStripItem: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickStripIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    quickStripValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 2,
    },
    quickStripLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 18,
        gap: 12,
    },
    dateNavButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dateCenter: {
        flex: 1,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
    },
    dateCount: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 14,
        gap: 10,
    },
    todayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#EEF2FF',
    },
    newActivityFab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#8297D9',
        shadowColor: '#8297D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    newActivityFabText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    todayButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8297D9',
    },
    todayBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    todayBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8297D9',
    },
    listSection: {
        marginTop: 18,
        paddingHorizontal: 20,
    },
    emptyDayCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 18,
    },
    emptyDayIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emptyDayTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 6,
        textAlign: 'center',
    },
    emptyDayText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        textAlign: 'center',
    },
    emptyDayButton: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#EEF2FF',
    },
    emptyDayButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8297D9',
    },
    periodSection: {
        marginBottom: 18,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    periodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    periodHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    periodIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
        textTransform: 'capitalize',
    },
    periodSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    periodCount: {
        minWidth: 26,
        height: 26,
        borderRadius: 13,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 12,
        fontWeight: '700',
        color: '#8297D9',
        backgroundColor: '#EEF2FF',
        overflow: 'hidden',
    },
    emptyPeriod: {
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyPeriodText: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EEF2FF',
        overflow: 'hidden',
    },
    activityAccent: {
        width: 4,
        borderRadius: 999,
        marginRight: 12,
    },
    activityTimeColumn: {
        width: 58,
        alignItems: 'center',
        marginRight: 12,
    },
    activityTime: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1F2937',
    },
    activityTimeLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 10,
        borderRadius: 1,
    },
    activityContent: {
        flex: 1,
    },
    activityHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    activityTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2937',
    },
    activityResident: {
        fontSize: 13,
        color: '#8297D9',
        fontWeight: '700',
        marginBottom: 4,
    },
    activityMeta: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    activityFooter: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#F8FAFC',
    },
    periodBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8297D9',
        textTransform: 'capitalize',
    },
    detailLink: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8297D9',
    },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '800',
    },
    detailCard: {
        marginTop: 18,
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
        gap: 12,
    },
    detailKicker: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8297D9',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    detailTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: -0.4,
    },
    detailRow: {
        marginBottom: 14,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    detailNotes: {
        marginTop: 4,
    },
    detailNotesValue: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    detailActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    secondaryButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#374151',
    },
    primaryButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#8297D9',
    },
    primaryButtonDisabled: {
        backgroundColor: '#C4CFEF',
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    detailHeaderLeft: {
        flex: 1,
    },
    createKickerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    periodOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    periodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    periodOptionText: {
        fontSize: 13,
        fontWeight: '700',
    },
    fieldGroup: {
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    fieldInput: {
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1F2937',
    },
    fieldInputMultiline: {
        minHeight: 96,
        textAlignVertical: 'top',
    },
    statusOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
    },
    statusOptionText: {
        fontSize: 12,
        fontWeight: '800',
    },
});