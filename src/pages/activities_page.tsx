import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Activity {
    id: string;
    title: string;
    description: string;
    time: string;
    period: 'manhã' | 'tarde' | 'noite';
    status: 'completed' | 'pending' | 'cancelled';
    priority: 'alta' | 'média' | 'baixa';
    category: string;
    idosoId?: number;
    idosoName?: string;
}

interface ActivitiesPageProps {
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
    onBack?: () => void;
}

type ScreenMode = 'list' | 'edit' | 'detail';

const PERIOD_OPTIONS: Array<{ value: Activity['period']; label: string; icon: string; color: string }> = [
    { value: 'manhã', label: 'Manhã', icon: 'sunny', color: '#FBBF24' },
    { value: 'tarde', label: 'Tarde', icon: 'partly-sunny', color: '#F97316' },
    { value: 'noite', label: 'Noite', icon: 'moon', color: '#6366F1' },
];

const STATUS_OPTIONS: Array<{ value: Activity['status']; label: string; color: string; icon: string }> = [
    { value: 'completed', label: 'Concluído', color: '#10B981', icon: 'checkmark-circle' },
    { value: 'pending', label: 'Pendente', color: '#F59E0B', icon: 'time-outline' },
    { value: 'cancelled', label: 'Cancelado', color: '#EF4444', icon: 'close-circle' },
];

const PRIORITY_OPTIONS: Array<{ value: Activity['priority']; label: string; color: string; icon: string }> = [
    { value: 'alta', label: 'Alta', color: '#DC2626', icon: 'alert-circle' },
    { value: 'média', label: 'Média', color: '#F59E0B', icon: 'alert' },
    { value: 'baixa', label: 'Baixa', color: '#6B7280', icon: 'information-circle' },
];

const CATEGORY_OPTIONS = ['Saúde', 'Alimentação', 'Lazer', 'Cuidados', 'Médico'];

// Mock de dados de atividades
const MOCK_ACTIVITIES: Activity[] = [
    {
        id: '1',
        title: 'Tomar Medicação',
        description: 'Tomar os medicamentos da pressão',
        time: '08:00',
        period: 'manhã',
        status: 'completed',
        priority: 'alta',
        category: 'Saúde',
        idosoName: 'João Silva',
    },
    {
        id: '2',
        title: 'Café da Manhã',
        description: 'Refeição matinal saudável',
        time: '08:30',
        period: 'manhã',
        status: 'completed',
        priority: 'média',
        category: 'Alimentação',
        idosoName: 'João Silva',
    },
    {
        id: '3',
        title: 'Fisioterapia',
        description: 'Sessão de exercícios',
        time: '10:00',
        period: 'manhã',
        status: 'completed',
        priority: 'alta',
        category: 'Saúde',
        idosoName: 'João Silva',
    },
    {
        id: '4',
        title: 'Almoço',
        description: 'Refeição principal',
        time: '12:00',
        period: 'tarde',
        status: 'pending',
        priority: 'média',
        category: 'Alimentação',
        idosoName: 'João Silva',
    },
    {
        id: '5',
        title: 'Passeio no Parque',
        description: 'Caminhada leve para exercício',
        time: '14:30',
        period: 'tarde',
        status: 'pending',
        priority: 'média',
        category: 'Lazer',
        idosoName: 'João Silva',
    },
    {
        id: '6',
        title: 'Consulta Médica',
        description: 'Acompanhamento com o cardiologista',
        time: '15:00',
        period: 'tarde',
        status: 'cancelled',
        priority: 'alta',
        category: 'Saúde',
        idosoName: 'Maria Santos',
    },
    {
        id: '7',
        title: 'Jantar',
        description: 'Refeição leve à noite',
        time: '18:30',
        period: 'noite',
        status: 'pending',
        priority: 'média',
        category: 'Alimentação',
        idosoName: 'João Silva',
    },
    {
        id: '8',
        title: 'Tomar Medicação Noturna',
        description: 'Medicamentos prescritos',
        time: '20:00',
        period: 'noite',
        status: 'pending',
        priority: 'alta',
        category: 'Saúde',
        idosoName: 'João Silva',
    },
];

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({
    onNavigateTab,
    activeTab,
    onBack,
}) => {
    const [screenMode, setScreenMode] = useState<ScreenMode>('list');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [editForm, setEditForm] = useState<Activity | null>(null);
    const [detailActivity, setDetailActivity] = useState<Activity | null>(null);

    useEffect(() => {
        carregarAtividades();
    }, [selectedDate]);

    const carregarAtividades = async () => {
        try {
            setLoading(true);
            // Simular carregamento de dados
            // Em produção, aqui você faria a chamada à API
            setActivities((currentActivities) => (currentActivities.length > 0 ? currentActivities : [...MOCK_ACTIVITIES]));
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível carregar as atividades');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarAtividades();
        setRefreshing(false);
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (date) {
            setSelectedDate(date);
        }
        setShowDatePicker(false);
    };

    const formatarData = (date: Date) => {
        const opcoes: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return date.toLocaleDateString('pt-BR', opcoes);
    };

    const agruparAtividadesPorPeriodo = () => {
        const agrupadas = {
            manhã: activities.filter(a => a.period === 'manhã'),
            tarde: activities.filter(a => a.period === 'tarde'),
            noite: activities.filter(a => a.period === 'noite'),
        };
        return agrupadas;
    };

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return '#10B981';
            case 'pending':
                return '#F59E0B';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#9CA3AF';
        }
    };

    const obterIconeStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return 'checkmark-circle';
            case 'pending':
                return 'time-outline';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    const obterTextoStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Concluído';
            case 'pending':
                return 'Pendente';
            case 'cancelled':
                return 'Cancelado';
            default:
                return 'Desconhecido';
        }
    };

    const obterCorPrioridade = (priority: string) => {
        switch (priority) {
            case 'alta':
                return '#DC2626';
            case 'média':
                return '#F59E0B';
            case 'baixa':
                return '#6B7280';
            default:
                return '#9CA3AF';
        }
    };

    const obterIconePriodade = (priority: string) => {
        switch (priority) {
            case 'alta':
                return 'alert-circle';
            case 'média':
                return 'alert';
            case 'baixa':
                return 'information-circle';
            default:
                return 'help-circle';
        }
    };

    const obterCorCategoria = (category: string) => {
        const cores: Record<string, string> = {
            'Saúde': '#8B5CF6',
            'Alimentação': '#EC4899',
            'Lazer': '#06B6D4',
            'Cuidados': '#14B8A6',
            'Médico': '#F97316',
        };
        return cores[category] || '#8297D9';
    };

    const abrirEdicao = (activity: Activity) => {
        setEditingActivity(activity);
        setEditForm({ ...activity });
        setExpandedActivity(null);
        setScreenMode('edit');
    };

    const abrirDetalhes = (activity: Activity) => {
        setDetailActivity(activity);
        setExpandedActivity(null);
        setScreenMode('detail');
    };

    const voltarParaLista = () => {
        setScreenMode('list');
        setEditingActivity(null);
        setEditForm(null);
        setDetailActivity(null);
    };

    const atualizarCampoEdicao = <K extends keyof Activity>(campo: K, valor: Activity[K]) => {
        setEditForm((currentForm) => {
            if (!currentForm) {
                return currentForm;
            }

            return {
                ...currentForm,
                [campo]: valor,
            };
        });
    };

    const salvarEdicao = () => {
        if (!editingActivity || !editForm) {
            return;
        }

        if (!editForm.title.trim() || !editForm.description.trim() || !editForm.time.trim() || !editForm.category.trim()) {
            Alert.alert('Atenção', 'Preencha os campos obrigatórios para salvar a atividade.');
            return;
        }

        setActivities((currentActivities) =>
            currentActivities.map((activity) =>
                activity.id === editingActivity.id
                    ? {
                          ...activity,
                          ...editForm,
                          idosoName: editForm.idosoName?.trim() || undefined,
                      }
                    : activity,
            ),
        );

        voltarParaLista();
        Alert.alert('Sucesso', 'Atividade atualizada com sucesso.');
    };

    const renderActivity = (activity: Activity) => {
        const isExpanded = expandedActivity === activity.id;
        const corStatus = obterCorStatus(activity.status);
        const iconeStatus = obterIconeStatus(activity.status);
        const textoStatus = obterTextoStatus(activity.status);
        const corPrioridade = obterCorPrioridade(activity.priority);
        const iconePrioridade = obterIconePriodade(activity.priority);
        const corCategoria = obterCorCategoria(activity.category);

        return (
            <TouchableOpacity
                key={activity.id}
                style={[styles.activityCard, isExpanded && styles.activityCardExpanded]}
                onPress={() => setExpandedActivity(isExpanded ? null : activity.id)}
                activeOpacity={0.7}
            >
                {/* Header da Atividade */}
                <View style={styles.activityHeader}>
                    {/* Indicador de Status */}
                    <View style={styles.statusIndicator}>
                        <Ionicons
                            name={iconeStatus}
                            size={24}
                            color={corStatus}
                        />
                    </View>

                    {/* Conteúdo Principal */}
                    <View style={styles.activityContent}>
                        <View style={styles.activityTitleRow}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <View style={[styles.priorityBadge, { backgroundColor: corPrioridade + '20' }]}>
                                <Ionicons
                                    name={iconePrioridade}
                                    size={14}
                                    color={corPrioridade}
                                />
                                <Text style={[styles.priorityText, { color: corPrioridade }]}>
                                    {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.activityMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="time" size={14} color="#9CA3AF" />
                                <Text style={styles.metaText}>{activity.time}</Text>
                            </View>
                            <View style={[styles.categoryBadge, { backgroundColor: corCategoria + '20' }]}>
                                <Text style={[styles.categoryText, { color: corCategoria }]}>
                                    {activity.category}
                                </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: corStatus + '20' }]}>
                                <Text style={[styles.statusText, { color: corStatus }]}>
                                    {textoStatus}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Ícone de Expandir */}
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                    />
                </View>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                    <View style={styles.activityDetails}>
                        <View style={styles.detailDivider} />
                        <Text style={styles.descriptionLabel}>Descrição</Text>
                        <Text style={styles.description}>{activity.description}</Text>

                        {activity.idosoName && (
                            <>
                                <Text style={styles.descriptionLabel}>Responsável</Text>
                                <View style={styles.responsavel}>
                                    <Ionicons name="person-circle" size={32} color="#8297D9" />
                                    <Text style={styles.responsavelNome}>{activity.idosoName}</Text>
                                </View>
                            </>
                        )}

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.editButton]}
                                onPress={() => abrirEdicao(activity)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={18} color="#8297D9" />
                                <Text style={[styles.actionButtonText, { color: '#8297D9' }]}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.detailButton]}
                                onPress={() => abrirDetalhes(activity)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Detalhes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderPeriodSection = (period: 'manhã' | 'tarde' | 'noite', activities: Activity[]) => {
        const info = PERIOD_OPTIONS.find((option) => option.value === period) || PERIOD_OPTIONS[0];
        const completadas = activities.filter(a => a.status === 'completed').length;

        if (activities.length === 0) {
            return (
                <View key={period} style={styles.periodSection}>
                    <View style={styles.periodHeader}>
                        <View style={[styles.periodIconContainer, { backgroundColor: info.color + '20' }]}>
                            <Ionicons name={info.icon as any} size={20} color={info.color} />
                        </View>
                        <View style={styles.periodInfo}>
                            <Text style={styles.periodTitle}>{info.label}</Text>
                            <Text style={styles.periodCount}>Nenhuma atividade</Text>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View key={period} style={styles.periodSection}>
                <View style={styles.periodHeader}>
                    <View style={[styles.periodIconContainer, { backgroundColor: info.color + '20' }]}>
                        <Ionicons name={info.icon as any} size={20} color={info.color} />
                    </View>
                    <View style={styles.periodInfo}>
                        <Text style={styles.periodTitle}>{info.label}</Text>
                        <Text style={styles.periodCount}>
                            {completadas} de {activities.length} concluídas
                        </Text>
                    </View>
                    <View style={[styles.periodProgress, { backgroundColor: info.color + '20' }]}>
                        <Text style={[styles.periodPercentage, { color: info.color }]}>
                            {Math.round((completadas / activities.length) * 100)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.activitiesList}>
                    {activities.map(renderActivity)}
                </View>
            </View>
        );
    };

    const renderEditScreen = () => {
        if (!editingActivity || !editForm) {
            return null;
        }

        return (
            <View style={styles.container}>
                <View style={styles.editHeader}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Editar atividade</Text>
                            <Text style={styles.headerSubtitle}>{editingActivity.title}</Text>
                        </View>
                        <TouchableOpacity onPress={voltarParaLista} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.editScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.editCard}>
                        <Text style={styles.editSectionTitle}>Informações principais</Text>

                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Título</Text>
                            <TextInput
                                style={styles.editInput}
                                value={editForm.title}
                                onChangeText={(value) => atualizarCampoEdicao('title', value)}
                                placeholder="Digite o título"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.editField}>
                            <Text style={styles.editLabel}>Descrição</Text>
                            <TextInput
                                style={[styles.editInput, styles.editTextArea]}
                                value={editForm.description}
                                onChangeText={(value) => atualizarCampoEdicao('description', value)}
                                placeholder="Digite a descrição"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.editRow}>
                            <View style={[styles.editField, styles.editHalfField]}>
                                <Text style={styles.editLabel}>Horário</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={editForm.time}
                                    onChangeText={(value) => atualizarCampoEdicao('time', value)}
                                    placeholder="08:00"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View style={[styles.editField, styles.editHalfField]}>
                                <Text style={styles.editLabel}>Responsável</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={editForm.idosoName || ''}
                                    onChangeText={(value) => atualizarCampoEdicao('idosoName', value)}
                                    placeholder="Nome do idoso"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.editCard}>
                        <Text style={styles.editSectionTitle}>Período</Text>
                        <View style={styles.optionGrid}>
                            {PERIOD_OPTIONS.map((option) => {
                                const selected = editForm.period === option.value;

                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionPill,
                                            selected && { backgroundColor: option.color, borderColor: option.color },
                                        ]}
                                        onPress={() => atualizarCampoEdicao('period', option.value)}
                                    >
                                        <Ionicons name={option.icon as any} size={16} color={selected ? '#FFFFFF' : option.color} />
                                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.editCard}>
                        <Text style={styles.editSectionTitle}>Status</Text>
                        <View style={styles.optionGrid}>
                            {STATUS_OPTIONS.map((option) => {
                                const selected = editForm.status === option.value;

                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionPill,
                                            selected && { backgroundColor: option.color, borderColor: option.color },
                                        ]}
                                        onPress={() => atualizarCampoEdicao('status', option.value)}
                                    >
                                        <Ionicons name={option.icon as any} size={16} color={selected ? '#FFFFFF' : option.color} />
                                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.editCard}>
                        <Text style={styles.editSectionTitle}>Prioridade</Text>
                        <View style={styles.optionGrid}>
                            {PRIORITY_OPTIONS.map((option) => {
                                const selected = editForm.priority === option.value;

                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionPill,
                                            selected && { backgroundColor: option.color, borderColor: option.color },
                                        ]}
                                        onPress={() => atualizarCampoEdicao('priority', option.value)}
                                    >
                                        <Ionicons name={option.icon as any} size={16} color={selected ? '#FFFFFF' : option.color} />
                                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.editCard}>
                        <Text style={styles.editSectionTitle}>Categoria</Text>
                        <View style={styles.categoryChipsContainer}>
                            {CATEGORY_OPTIONS.map((category) => {
                                const selected = editForm.category === category;
                                const categoryColor = obterCorCategoria(category);

                                return (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categoryChip,
                                            { borderColor: categoryColor },
                                            selected && { backgroundColor: categoryColor },
                                        ]}
                                        onPress={() => atualizarCampoEdicao('category', category)}
                                    >
                                        <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.editActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelEditButton]} onPress={voltarParaLista}>
                            <Ionicons name="close-outline" size={18} color="#6B7280" />
                            <Text style={[styles.actionButtonText, { color: '#6B7280' }]}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.saveEditButton]} onPress={salvarEdicao}>
                            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderDetailScreen = () => {
        if (!detailActivity) {
            return null;
        }

        const corStatus = obterCorStatus(detailActivity.status);
        const iconeStatus = obterIconeStatus(detailActivity.status);
        const textoStatus = obterTextoStatus(detailActivity.status);
        const corPrioridade = obterCorPrioridade(detailActivity.priority);
        const iconePrioridade = obterIconePriodade(detailActivity.priority);
        const corCategoria = obterCorCategoria(detailActivity.category);
        const periodoInfo = PERIOD_OPTIONS.find((option) => option.value === detailActivity.period) || PERIOD_OPTIONS[0];

        return (
            <View style={styles.container}>
                <View style={styles.detailHeader}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Detalhes da atividade</Text>
                            <Text style={styles.headerSubtitle}>{detailActivity.title}</Text>
                        </View>
                        <TouchableOpacity onPress={voltarParaLista} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.editScrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.detailHeroCard}>
                        <View style={styles.detailHeroRow}>
                            <View style={styles.statusIndicator}>
                                <Ionicons name={iconeStatus} size={24} color={corStatus} />
                            </View>
                            <View style={styles.detailHeroContent}>
                                <Text style={styles.detailTitle}>{detailActivity.title}</Text>
                                <Text style={styles.detailDescription}>{detailActivity.description}</Text>
                            </View>
                        </View>

                        <View style={styles.detailBadgesRow}>
                            <View style={[styles.statusBadge, { backgroundColor: corStatus + '20' }]}>
                                <Text style={[styles.statusText, { color: corStatus }]}>{textoStatus}</Text>
                            </View>
                            <View style={[styles.priorityBadge, { backgroundColor: corPrioridade + '20' }]}>
                                <Ionicons name={iconePrioridade} size={14} color={corPrioridade} />
                                <Text style={[styles.priorityText, { color: corPrioridade }]}>
                                    {detailActivity.priority.charAt(0).toUpperCase() + detailActivity.priority.slice(1)}
                                </Text>
                            </View>
                            <View style={[styles.categoryBadge, { backgroundColor: corCategoria + '20' }]}>
                                <Text style={[styles.categoryText, { color: corCategoria }]}>{detailActivity.category}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.editCard}>
                        <Text style={styles.editSectionTitle}>Informações</Text>

                        <View style={styles.detailInfoRow}>
                            <Text style={styles.detailInfoLabel}>Período</Text>
                            <View style={[styles.optionPill, { alignSelf: 'flex-start', backgroundColor: periodoInfo.color + '20', borderColor: periodoInfo.color + '40' }]}>
                                <Ionicons name={periodoInfo.icon as any} size={16} color={periodoInfo.color} />
                                <Text style={[styles.optionText, { color: periodoInfo.color }]}>{periodoInfo.label}</Text>
                            </View>
                        </View>

                        <View style={styles.detailInfoRow}>
                            <Text style={styles.detailInfoLabel}>Horário</Text>
                            <Text style={styles.detailInfoValue}>{detailActivity.time}</Text>
                        </View>

                        <View style={styles.detailInfoRow}>
                            <Text style={styles.detailInfoLabel}>Responsável</Text>
                            <Text style={styles.detailInfoValue}>{detailActivity.idosoName || 'Não informado'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => abrirEdicao(detailActivity)} activeOpacity={0.7}>
                            <Ionicons name="create-outline" size={18} color="#8297D9" />
                            <Text style={[styles.actionButtonText, { color: '#8297D9' }]}>Editar atividade</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.cancelEditButton]} onPress={voltarParaLista} activeOpacity={0.7}>
                            <Ionicons name="arrow-back-outline" size={18} color="#6B7280" />
                            <Text style={[styles.actionButtonText, { color: '#6B7280' }]}>Voltar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    };

    const agrupadas = agruparAtividadesPorPeriodo();

    if (screenMode === 'edit') {
        return renderEditScreen();
    }

    if (screenMode === 'detail') {
        return renderDetailScreen();
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Agenda</Text>
                        <Text style={styles.headerSubtitle}>Atividades do dia</Text>
                    </View>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Seletor de Data */}
            <View style={styles.dateSelectorContainer}>
                <TouchableOpacity
                    style={styles.dateNavigationButton}
                    onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() - 1);
                        setSelectedDate(newDate);
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color="#8297D9" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dateDisplay}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="calendar" size={18} color="#8297D9" />
                    <View style={styles.dateTextContainer}>
                        <Text style={styles.dateText}>{formatarData(selectedDate)}</Text>
                        <Text style={styles.dateSubtext}>Toque para selecionar outra data</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dateNavigationButton}
                    onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() + 1);
                        setSelectedDate(newDate);
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-forward" size={20} color="#8297D9" />
                </TouchableOpacity>
            </View>

            {/* DateTimePicker */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                />
            )}

            {/* Conteúdo */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8297D9" />
                    <Text style={styles.loadingText}>Carregando atividades...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#8297D9']}
                            tintColor="#8297D9"
                        />
                    }
                >
                    {activities.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyStateTitle}>Nenhuma atividade</Text>
                            <Text style={styles.emptyStateSubtitle}>
                                Você não tem atividades agendadas para este dia
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.periodsContainer}>
                            {renderPeriodSection('manhã', agrupadas.manhã)}
                            {renderPeriodSection('tarde', agrupadas.tarde)}
                            {renderPeriodSection('noite', agrupadas.noite)}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    editHeader: {
        backgroundColor: '#8297D9',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    detailHeader: {
        backgroundColor: '#8297D9',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    backButton: {
        padding: 8,
    },
    dateSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateNavigationButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    dateDisplay: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 10,
    },
    dateTextContainer: {
        flex: 1,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    dateSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    periodsContainer: {
        paddingBottom: 20,
    },
    periodSection: {
        marginBottom: 24,
    },
    periodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    periodIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    periodInfo: {
        flex: 1,
    },
    periodTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    periodCount: {
        fontSize: 12,
        color: '#999CA3AF',
        marginTop: 2,
    },
    periodProgress: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    periodPercentage: {
        fontSize: 12,
        fontWeight: '600',
    },
    activitiesList: {
        gap: 12,
    },
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activityCardExpanded: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
        marginLeft: 8,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    activityDetails: {
        marginTop: 12,
        paddingTop: 12,
    },
    detailDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },
    descriptionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 12,
    },
    responsavel: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
        gap: 10,
    },
    responsavelNome: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    editButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    detailButton: {
        backgroundColor: '#8297D9',
    },
    detailHeroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    detailHeroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    detailHeroContent: {
        flex: 1,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    detailDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4B5563',
    },
    detailBadgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    detailInfoRow: {
        marginBottom: 14,
    },
    detailInfoLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    detailInfoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    detailActions: {
        gap: 12,
        marginTop: 4,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    editScrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 32,
    },
    editCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    editSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 14,
    },
    editField: {
        marginBottom: 14,
    },
    editRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editHalfField: {
        flex: 1,
    },
    editLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    editInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1F2937',
    },
    editTextArea: {
        minHeight: 110,
        textAlignVertical: 'top',
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    optionTextSelected: {
        color: '#FFFFFF',
    },
    categoryChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    categoryChipTextSelected: {
        color: '#FFFFFF',
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    cancelEditButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    saveEditButton: {
        flex: 1,
        backgroundColor: '#8297D9',
    },
});
