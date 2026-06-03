import React, { useState, useMemo, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, Modal, ActivityIndicator, Alert,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    buscarCardapio,
    ItemCardapio,
    TipoRefeicao,
    StatusRefeicao,
    salvarCardapio,
    deletarAtividade,
    buscarAtividades,
    Atividade,
    criarAtividade,
    atualizarAtividade,
    buscarIdosos,
    buscarIdososDaAtividade,
    atualizarAlocacoesAtividade,
    Idoso,
    buscarUsuarios,
    UsuarioResponse
} from '../services/api';

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

// ─── Metadados visuais de Atividades ──────────────────────────────────────────

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

// ─── Metadados visuais de Cardápio ──────────────────────────────────────────

const REFEICAO_CONFIG: Record<TipoRefeicao, {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    cor: string;
    bg: string;
    horario: string;
}> = {
    cafe: { label: 'Café da Manhã', icon: 'cafe', cor: '#B45309', bg: '#FEF3C7', horario: '07:00' },
    almoco: { label: 'Almoço', icon: 'restaurant', cor: '#059669', bg: '#ECFDF5', horario: '12:00' },
    lanche: { label: 'Lanche', icon: 'nutrition', cor: '#7C3AED', bg: '#EDE9FE', horario: '15:30' },
    jantar: { label: 'Jantar', icon: 'moon', cor: '#1D4ED8', bg: '#DBEAFE', horario: '19:00' },
};

const STATUS_CONFIG: Record<StatusRefeicao, { label: string; cor: string; bg: string }> = {
    servida: { label: 'Servida', cor: '#059669', bg: '#D1FAE5' },
    pendente: { label: 'Pendente', cor: '#D97706', bg: '#FEF3C7' },
};

const ORDEM_REFEICOES: TipoRefeicao[] = ['cafe', 'almoco', 'lanche', 'jantar'];

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

// ─── Dados demo de Atividades ───────────────────────────────────────────────────

const createDemoActivities = (): Activity[] => {
    const today = new Date();
    const tomorrow = shiftDate(today, 1);
    const yesterday = shiftDate(today, -1);
    return [
        { id: 1, date: dateKey(today), period: 'manhã', time: '08:00', title: 'Medicação da manhã', resident: 'Sr. Carlos Silva', status: 'pendente', location: 'Quarto 12', notes: 'Administrar após o café da manhã e registrar reação.', responsible: 'Marina' },
        { id: 2, date: dateKey(today), period: 'manhã', time: '10:30', title: 'Higiene assistida', resident: 'Sra. Santos Santos', status: 'em_andamento', location: 'Banheiro assistido', notes: 'Acompanhar com calma e revisar itens de higiene.', responsible: 'Lucas' },
        { id: 3, date: dateKey(today), period: 'tarde', time: '14:00', title: 'Apoio no almoço', resident: 'Sr. João Pereira', status: 'concluida', location: 'Refeitório', notes: 'Alimentação concluída sem intercorrências.', responsible: 'Paula' },
        { id: 4, date: dateKey(today), period: 'tarde', time: '16:30', title: 'Fisioterapia leve', resident: 'Sra. Maria Costa', status: 'atrasada', location: 'Sala de atividades', notes: 'Reagendar com a equipe clínica e avisar a família.', responsible: 'Fernanda' },
        { id: 5, date: dateKey(today), period: 'noite', time: '19:00', title: 'Medicação noturna', resident: 'Sr. Pedro Alves', status: 'pendente', location: 'Quarto 09', notes: 'Aplicar antes de dormir e confirmar ingestão de água.', responsible: 'Marina' },
        { id: 6, date: dateKey(tomorrow), period: 'manhã', time: '09:00', title: 'Visita médica', resident: 'Sra. Santos Santos', status: 'pendente', location: 'Consultório 2', notes: 'Levar exames atualizados e prontuário.', responsible: 'Equipe' },
        { id: 7, date: dateKey(yesterday), period: 'noite', time: '20:00', title: 'Checagem de segurança', resident: 'Sr. Carlos Silva', status: 'concluida', location: 'Corredor A', notes: 'Rotina encerrada com passagem de plantão.', responsible: 'Marina' },
    ];
};

// ─── Dados demo de Cardápio ───────────────────────────────────────────────────

const createDemoCardapio = (data: string): ItemCardapio[] => [
    {
        id: 1, data, tipo: 'cafe',
        descricao: 'Pão integral com manteiga, suco de laranja natural e iogurte',
        observacoes: 'Servir morno. Evitar açúcar refinado.',
        alimentos: ['Pão integral', 'Manteiga', 'Suco de laranja', 'Iogurte natural'],
        restricoes: ['Sem glúten disponível', 'Opção sem lactose'],
        calorias: 320, status: 'servida',
    },
    {
        id: 2, data, tipo: 'almoco',
        descricao: 'Arroz, feijão, frango grelhado, salada de folhas e suco de maracujá',
        observacoes: 'Dieta hipossódica para residentes com hipertensão.',
        alimentos: ['Arroz branco', 'Feijão carioca', 'Frango grelhado', 'Salada verde', 'Suco de maracujá'],
        restricoes: ['Baixo sódio', 'Sem pimenta'],
        calorias: 680, status: 'servida',
    },
    {
        id: 3, data, tipo: 'lanche',
        descricao: 'Fruta da estação e chá de camomila',
        alimentos: ['Banana', 'Maçã', 'Chá de camomila'],
        restricoes: [],
        calorias: 150, status: 'pendente',
    },
    {
        id: 4, data, tipo: 'jantar',
        descricao: 'Sopa de legumes com macarrão e pão de forma',
        observacoes: 'Consistência pastosa disponível para quem necessitar.',
        alimentos: ['Sopa de legumes', 'Macarrão', 'Pão de forma'],
        restricoes: ['Opção pastosa', 'Sem glúten disponível'],
        calorias: 420, status: 'pendente',
    },
];

// ─── Componentes de Cardápio ─────────────────────────────────────────────────

const TagRestricao: React.FC<{ label: string }> = ({ label }) => (
    <View style={styles.tag}>
        <Ionicons name="alert-circle-outline" size={11} color="#DC2626" />
        <Text style={styles.tagText}>{label}</Text>
    </View>
);

const CardRefeicao: React.FC<{ item: ItemCardapio }> = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const cfg = REFEICAO_CONFIG[item.tipo];
    const statusCfg = STATUS_CONFIG[item.status];

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => setExpanded(e => !e)}
        >
            {/* Cabeçalho do card */}
            <View style={styles.cardHeader}>
                <View style={[styles.cardIconWrap, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={22} color={cfg.cor} />
                </View>
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.cardTitle}>{cfg.label}</Text>
                    <Text style={styles.cardHorario}>{cfg.horario}</Text>
                </View>
                <View style={[styles.statusBadgeMeal, { backgroundColor: statusCfg.bg }]}>
                    <View style={[styles.statusDotMeal, { backgroundColor: statusCfg.cor }]} />
                    <Text style={[styles.statusTextMeal, { color: statusCfg.cor }]}>{statusCfg.label}</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#9CA3AF"
                    style={{ marginLeft: 8 }}
                />
            </View>

            {/* Descrição sempre visível */}
            <Text style={styles.cardDescricao} numberOfLines={expanded ? undefined : 2}>
                {item.descricao}
            </Text>

            {/* Conteúdo expandido */}
            {expanded && (
                <View style={styles.cardExpanded}>
                    {/* Alimentos */}
                    {item.alimentos && item.alimentos.length > 0 && (
                        <View style={styles.alimentosWrap}>
                            {item.alimentos.map((a, i) => (
                                <View key={i} style={styles.alimentoChip}>
                                    <Text style={styles.alimentoText}>{a}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Calorias */}
                    {item.calorias != null && (
                        <View style={styles.caloriasRow}>
                            <Ionicons name="flame-outline" size={14} color="#F59E0B" />
                            <Text style={styles.caloriasText}>{item.calorias} kcal</Text>
                        </View>
                    )}

                    {/* Observações */}
                    {item.observacoes ? (
                        <View style={styles.obsWrap}>
                            <Text style={styles.obsLabel}>Observações</Text>
                            <Text style={styles.obsText}>{item.observacoes}</Text>
                        </View>
                    ) : null}

                    {/* Tags de restrição */}
                    {item.restricoes && item.restricoes.length > 0 && (
                        <View style={styles.tagsWrap}>
                            {item.restricoes.map((r, i) => <TagRestricao key={i} label={r} />)}
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

// ─── Chip de Atividades ──────────────────────────────────────────────────────

const ChipFiltro: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <View style={chipStyles.container}>
        <Text style={chipStyles.label}>{label}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
            <Ionicons name="close" size={13} color="#202c4b" />
        </TouchableOpacity>
    </View>
);

const chipStyles = StyleSheet.create({
    container: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#EEF2FF', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1, borderColor: '#202c4b',
        marginRight: 8,
    },
    label: { fontSize: 12, fontWeight: '600', color: '#202c4b', marginRight: 4 },
});

// ─── Props do Componente Principal ─────────────────────────────────────────────

interface AgendaPageProps {
    initialTab?: 'atividades' | 'cardapio';
    onTabChange?: (tab: 'atividades' | 'cardapio') => void;
    userRole?: string;
    token?: string;
}

export const AgendaPage: React.FC<AgendaPageProps> = ({ initialTab = 'atividades', onTabChange, userRole, token }) => {
    const isAllowedToEdit = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'funcionario';
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('lista');

    // --- Estados e utilitários do Calendário Customizado ---
    const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    const openCalendar = () => {
        setCalendarMonth(selectedDate.getMonth());
        setCalendarYear(selectedDate.getFullYear());
        setModalCalendarVisible(true);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleQuickPreset = (preset: 'hoje' | 'amanha' | 'semana' | 'mes') => {
        const target = new Date();
        if (preset === 'hoje') {
            // Hoje
        } else if (preset === 'amanha') {
            target.setDate(target.getDate() + 1);
        } else if (preset === 'semana') {
            target.setDate(target.getDate() + 7);
        } else if (preset === 'mes') {
            target.setMonth(target.getMonth() + 1);
        }
        setSelectedDate(target);
        setCalendarMonth(target.getMonth());
        setCalendarYear(target.getFullYear());
        setModalCalendarVisible(false);
    };

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const mesesList = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentYear = new Date().getFullYear();
    const yearsRange = Array.from({ length: 15 }, (_, i) => currentYear - 6 + i);

    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [draftActivity, setDraftActivity] = useState<Activity | null>(null);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'atividades') {
                await carregarAtividadesAgenda(selectedDate);
            } else if (activeTab === 'cardapio') {
                await carregarCardapio(selectedDate);
            }
        } catch (err) {
            console.error('[Agenda] Erro ao recarregar dados:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [selectedIdosoIds, setSelectedIdosoIds] = useState<number[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);

    // Carregar lista de residentes ativos e funcionários
    useEffect(() => {
        const carregarIdosos = async () => {
            try {
                const data = await buscarIdosos(token, 0, 1000); // busca todos
                setIdosos(data || []);
            } catch (err) {
                console.warn('[Agenda] Erro ao buscar idosos:', err);
            }
        };
        const carregarUsuarios = async () => {
            try {
                const data = await buscarUsuarios(token);
                setUsuarios(data || []);
            } catch (err) {
                console.warn('[Agenda] Erro ao buscar usuários:', err);
            }
        };
        carregarIdosos();
        carregarUsuarios();
    }, [token]);

    // Estados de Integração
    const [activeTab, setActiveTab] = useState<'atividades' | 'cardapio'>(initialTab);
    const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
    const [loadingCardapio, setLoadingCardapio] = useState(false);
    const [usandoDemo, setUsandoDemo] = useState(false);

    // Estados de Edição do Cardápio para Admins
    const [modalCardapioVisible, setModalCardapioVisible] = useState(false);
    const [editCafeDaManha, setEditCafeDaManha] = useState('');
    const [editAlmoco, setEditAlmoco] = useState('');
    const [editJantar, setEditJantar] = useState('');

    const openEditCardapio = () => {
        const cafeItem = cardapio.find(c => c.tipo === 'cafe');
        const almocoItem = cardapio.find(c => c.tipo === 'almoco');
        const jantarItem = cardapio.find(c => c.tipo === 'jantar');

        setEditCafeDaManha(cafeItem ? cafeItem.descricao : '');
        setEditAlmoco(almocoItem ? almocoItem.descricao : '');
        setEditJantar(jantarItem ? jantarItem.descricao : '');
        setModalCardapioVisible(true);
    };

    const handleSaveCardapio = async () => {
        if (!editCafeDaManha.trim() || !editAlmoco.trim() || !editJantar.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos do cardápio (Café da Manhã, Almoço e Jantar) antes de salvar.');
            return;
        }

        try {
            setLoadingCardapio(true);
            const dateStr = dateKey(selectedDate);
            let existingId: number | undefined = undefined;
            
            // 💡 BUSCA EM TEMPO REAL: Evita duplicados mesmo se o estado do app ficou dessincronizado
            if (token && token !== 'demo-token') {
                try {
                    const realCardapios = await buscarCardapio(dateStr, token);
                    if (realCardapios && realCardapios.length > 0) {
                        const calculated = Math.floor(realCardapios[0].id / 10);
                        if (calculated > 0) {
                            existingId = calculated;
                        }
                    }
                } catch (e) {
                    console.warn('[Agenda] Não foi possível verificar duplicados em tempo real:', e);
                }
            }

            // Fallback caso a verificação em tempo real falhe/ offline mas tenhamos dados locais
            if (existingId === undefined && !usandoDemo && cardapio && cardapio.length > 0) {
                const calculated = Math.floor(cardapio[0].id / 10);
                if (calculated > 0) {
                    existingId = calculated;
                }
            }

            // Constrói o payload de forma limpa
            const payload: any = {
                data: dateStr,
                cafeDaManha: editCafeDaManha,
                almoco: editAlmoco,
                jantar: editJantar
            };

            // Somente anexa o ID se ele for um ID válido no banco de dados
            if (existingId !== undefined && existingId > 0) {
                payload.id = existingId;
            }

            await salvarCardapio(payload, token);
            setModalCardapioVisible(false);
            Alert.alert('Sucesso', 'Cardápio salvo com sucesso!');
            await carregarCardapio(selectedDate);
        } catch (err) {
            Alert.alert('Erro', 'Falha ao salvar cardápio. Certifique-se de que o backend está online.');
        } finally {
            setLoadingCardapio(false);
        }
    };

    // Sincronizar tab externa
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const handleTabChange = (tab: 'atividades' | 'cardapio') => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

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

    const selectedDateKey = dateKey(selectedDate);
    const selectedActivity = selectedActivityId ? activities.find(a => a.id === selectedActivityId) || null : null;

    const activitiesForDay = useMemo(() => {
        let result = activities.filter(a => a.date === selectedDateKey);
        if (filtroResidente) result = result.filter(a => a.resident === filtroResidente);
        if (filtroPeriodo) result = result.filter(a => a.period === filtroPeriodo);
        if (filtroStatus) result = result.filter(a => a.status === filtroStatus);
        return result;
    }, [activities, selectedDateKey, filtroResidente, filtroPeriodo, filtroStatus]);

    const mapApiAtividadeToActivity = (act: Atividade, defaultDate: string): Activity => {
        let period: Periodo = 'manhã';
        try {
            const hour = parseInt(act.horario.split(':')[0]);
            if (hour >= 12 && hour < 18) period = 'tarde';
            else if (hour >= 18 || hour < 6) period = 'noite';
        } catch {}

        let status: ActivityStatus = 'pendente';
        if (act.status === 'concluida') status = 'concluida';
        else if (act.status === 'em_andamento') status = 'em_andamento';
        else if (act.status === 'atrasada') status = 'atrasada';
        else if (act.status === 'cancelada') status = 'atrasada';

        let location = 'Sala de convivência';
        if (act.tipo === 'fisioterapia') location = 'Sala de fisioterapia';
        else if (act.tipo === 'alimentacao') location = 'Refeitório';
        else if (act.tipo === 'consulta') location = 'Consultório médico';
        else if (act.tipo === 'higiene') location = 'Banho assistido';

        return {
            id: act.id,
            date: act.data || defaultDate,
            period,
            time: act.horario,
            title: act.titulo,
            resident: act.nomeIdoso === 'Geral' ? 'Residentes (Geral)' : act.nomeIdoso === 'Residente' ? 'Maria Silva' : act.nomeIdoso,
            status,
            location,
            notes: act.observacoes || '',
            responsible: act.responsavel || 'Equipe'
        };
    };

    const [loadingActivities, setLoadingActivities] = useState(false);

    const carregarAtividadesAgenda = async (date: Date) => {
        setLoadingActivities(true);
        try {
            const dataStr = dateKey(date);
            const apiActs = await buscarAtividades(undefined, token);
            const mappedActs = apiActs.map(act => mapApiAtividadeToActivity(act, dataStr));
            
            setActivities(mappedActs || []);
        } catch (err) {
            console.warn('[Agenda] Erro ao carregar atividades do backend:', err);
            setActivities([]);
        } finally {
            setLoadingActivities(false);
        }
    };

    // Carregar Atividades
    useEffect(() => {
        if (activeTab === 'atividades') {
            carregarAtividadesAgenda(selectedDate);
        }
    }, [selectedDate, activeTab]);

    // Carregar Cardápio
    useEffect(() => {
        if (activeTab === 'cardapio') {
            carregarCardapio(selectedDate);
        }
    }, [selectedDate, activeTab]);

    const carregarCardapio = async (date: Date) => {
        setLoadingCardapio(true);
        setUsandoDemo(false);
        try {
            const dataStr = dateKey(date);
            const data = await buscarCardapio(dataStr, token);
            setCardapio(data || []);
        } catch {
            setCardapio([]);
        } finally {
            setLoadingCardapio(false);
        }
    };

    const completedCount = activitiesForDay.filter(a => a.status === 'concluida').length;
    const pendingCount = activitiesForDay.filter(a => a.status === 'pendente' || a.status === 'atrasada').length;
    const inProgressCount = activitiesForDay.filter(a => a.status === 'em_andamento').length;

    const openDetails = (activity: Activity) => { setSelectedActivityId(activity.id); setViewMode('detalhe'); };

    const handleTimeChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 4) {
            formatted = cleaned.slice(0, 4);
        }
        if (formatted.length > 2) {
            formatted = `${formatted.slice(0, 2)}:${formatted.slice(2)}`;
        }
        setDraftActivity(p => p ? { ...p, time: formatted } : p);
    };

    const startCreating = () => {
        setSelectedIdosoIds([]);
        setDraftActivity({ id: 0, date: selectedDateKey, period: 'manhã', time: '', title: '', resident: '', status: 'pendente', location: '', notes: '', responsible: '' });
        setViewMode('criar');
    };

    const saveNewActivity = async () => {
        if (!draftActivity || !draftActivity.title.trim()) {
            Alert.alert('Atenção', 'O título da atividade é obrigatório.');
            return;
        }
        if (!draftActivity.time || !draftActivity.time.trim()) {
            Alert.alert('Atenção', 'O horário da atividade é obrigatório.');
            return;
        }
        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(draftActivity.time.trim())) {
            Alert.alert('Atenção', 'Insira um horário válido no formato HH:MM (ex.: 08:30 ou 14:00).');
            return;
        }
        if (selectedIdosoIds.length === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos um residente para vincular à atividade.');
            return;
        }
        try {
            setLoadingActivities(true);
            
            // Constrói os nomes correspondentes para o estado local
            const nomes = idosos
                .filter(i => selectedIdosoIds.includes(i.id))
                .map(i => i.nome)
                .join(', ');
            
            const selecionouTodos = idosos.length > 0 && selectedIdosoIds.length === idosos.length;
            const residentLabel = selecionouTodos ? 'Todos os Residentes' : (nomes || 'Residentes (Geral)');

            const cleanTime = draftActivity.time.trim();
            const startHour = cleanTime.split(':')[0];

            const matchingUser = usuarios.find(
                u => (u.name || u.nome || '').trim().toLowerCase() === (draftActivity.responsible || '').trim().toLowerCase()
            );
            const firstFuncionario = usuarios.find(
                u => (u.role || '').toLowerCase() === 'funcionario' || (u.role || '').toLowerCase() === 'admin'
            );
            const targetId = matchingUser ? matchingUser.id : (firstFuncionario ? firstFuncionario.id : 2);

            if (token && token !== 'demo-token') {
                const apiPayload = {
                    nome: draftActivity.title,
                    data: draftActivity.date,
                    horario_inicio: `${cleanTime}:00`,
                    horario_fim: `${String(parseInt(startHour) + 1).padStart(2, '0')}:00:00`,
                    observacoes: draftActivity.notes,
                    responsavelId: targetId,
                    responsavelNome: (draftActivity.responsible || '').trim(),
                    status: draftActivity.status
                };
                await criarAtividade(apiPayload, selectedIdosoIds, token);
            }
            const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
            setActivities(prev => [...prev, { ...draftActivity, id: newId, time: cleanTime, resident: residentLabel }]);
            resetToList();
            Alert.alert('Sucesso', 'Atividade criada com sucesso!');
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível criar a atividade no backend.');
        } finally {
            setLoadingActivities(false);
        }
    };

    const startEditing = async () => {
        if (!selectedActivity) return;
        try {
            setLoadingActivities(true);
            const ids = await buscarIdososDaAtividade(selectedActivity.id, token);
            setSelectedIdosoIds(ids || []);
        } catch (e) {
            console.warn('[Agenda] Erro ao carregar idosos vinculados:', e);
            setSelectedIdosoIds([]);
        } finally {
            setLoadingActivities(false);
        }
        setDraftActivity({ ...selectedActivity });
        setViewMode('editar');
    };

    const saveEditing = async () => {
        if (!draftActivity) return;
        if (!draftActivity.title.trim()) {
            Alert.alert('Atenção', 'O título da atividade é obrigatório.');
            return;
        }
        if (!draftActivity.time || !draftActivity.time.trim()) {
            Alert.alert('Atenção', 'O horário da atividade é obrigatório.');
            return;
        }
        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(draftActivity.time.trim())) {
            Alert.alert('Atenção', 'Insira um horário válido no formato HH:MM (ex.: 08:30 ou 14:00).');
            return;
        }
        if (selectedIdosoIds.length === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos um residente.');
            return;
        }
        try {
            setLoadingActivities(true);

            // Constrói os nomes correspondentes para o estado local
            const nomes = idosos
                .filter(i => selectedIdosoIds.includes(i.id))
                .map(i => i.nome)
                .join(', ');
            
            const selecionouTodos = idosos.length > 0 && selectedIdosoIds.length === idosos.length;
            const residentLabel = selecionouTodos ? 'Todos os Residentes' : (nomes || 'Residentes (Geral)');

            const cleanTime = draftActivity.time.trim();
            const startHour = cleanTime.split(':')[0];

            const matchingUser = usuarios.find(
                u => (u.name || u.nome || '').trim().toLowerCase() === (draftActivity.responsible || '').trim().toLowerCase()
            );
            const firstFuncionario = usuarios.find(
                u => (u.role || '').toLowerCase() === 'funcionario' || (u.role || '').toLowerCase() === 'admin'
            );
            const targetId = matchingUser ? matchingUser.id : (firstFuncionario ? firstFuncionario.id : 2);

            if (token && token !== 'demo-token') {
                const apiPayload = {
                    nome: draftActivity.title,
                    data: draftActivity.date,
                    horario_inicio: `${cleanTime}:00`,
                    horario_fim: `${String(parseInt(startHour) + 1).padStart(2, '0')}:00:00`,
                    observacoes: draftActivity.notes,
                    responsavelId: targetId,
                    responsavelNome: (draftActivity.responsible || '').trim(),
                    status: draftActivity.status
                };
                await atualizarAtividade(draftActivity.id, apiPayload, token);
                await atualizarAlocacoesAtividade(draftActivity.id, selectedIdosoIds, token);
            }
            setActivities(prev => prev.map(a => a.id === draftActivity.id ? { ...a, ...draftActivity, resident: residentLabel } : a));
            setViewMode('detalhe');
            Alert.alert('Sucesso', 'Atividade atualizada com sucesso!');
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível atualizar a atividade no backend.');
        } finally {
            setLoadingActivities(false);
        }
    };

    const resetToList = () => { setViewMode('lista'); setSelectedActivityId(null); setDraftActivity(null); };

    const handleDeleteActivity = () => {
        if (!selectedActivity) return;
        Alert.alert(
            'Confirmar Exclusão',
            'Deseja realmente excluir esta atividade? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (token && token !== 'demo-token') {
                                await deletarAtividade(selectedActivity.id, token);
                            }
                            setActivities(prev => prev.filter(a => a.id !== selectedActivity.id));
                            Alert.alert('Sucesso', 'Atividade excluída com sucesso!');
                            resetToList();
                        } catch (err) {
                            Alert.alert('Erro', 'Não foi possível excluir a atividade.');
                        }
                    }
                }
            ]
        );
    };

    const renderStatusChip = (status: ActivityStatus) => {
        const meta = statusMeta[status];
        return (
            <View style={[styles.statusChip, { backgroundColor: meta.backgroundColor }]}>
                <Text style={[styles.statusChipText, { color: meta.color }]}>{meta.label}</Text>
            </View>
        );
    };

    const renderEditField = (
        label: string, 
        value: string, 
        onChangeText: (text: string) => void, 
        multiline = false, 
        required = false, 
        keyboardType: 'default' | 'numeric' = 'default'
    ) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
                {label}
                {required && <Text style={{ color: '#EF4444' }}> *</Text>}
            </Text>
            <TextInput 
                style={[styles.fieldInput, multiline && styles.fieldInputMultiline]} 
                value={value} 
                onChangeText={onChangeText} 
                multiline={multiline} 
                keyboardType={keyboardType}
            />
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
                <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 20 }]}>
                    <TouchableOpacity onPress={resetToList} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center', marginHorizontal: 8 }]}>Detalhes</Text>
                    {isAllowedToEdit ? (
                        <TouchableOpacity onPress={startEditing} style={styles.editBtn}>
                            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.editBtnText}>Editar</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 36 }} />
                    )}
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

                        {isAllowedToEdit && (
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                                    Atualização Rápida de Status
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                    {(Object.keys(statusMeta) as ActivityStatus[]).map(s => {
                                        const meta = statusMeta[s];
                                        const active = selectedActivity.status === s;
                                        return (
                                            <TouchableOpacity 
                                                key={s} 
                                                style={{ 
                                                    paddingHorizontal: 10, 
                                                    paddingVertical: 6, 
                                                    borderRadius: 12, 
                                                    borderWidth: 1, 
                                                    borderColor: active ? meta.color : '#E5E7EB',
                                                    backgroundColor: active ? meta.backgroundColor : '#FFF'
                                                }}
                                                onPress={async () => {
                                                    try {
                                                        setLoadingActivities(true);
                                                        const cleanTime = selectedActivity.time.trim();
                                                        const startHour = cleanTime.split(':')[0];
                                                        const matchingUser = usuarios.find(
                                                            u => (u.name || u.nome || '').trim().toLowerCase() === (selectedActivity.responsible || '').trim().toLowerCase()
                                                        );
                                                        const firstFuncionario = usuarios.find(
                                                            u => (u.role || '').toLowerCase() === 'funcionario' || (u.role || '').toLowerCase() === 'admin'
                                                        );
                                                        const targetId = matchingUser ? matchingUser.id : (firstFuncionario ? firstFuncionario.id : 2);

                                                        const apiPayload = {
                                                            nome: selectedActivity.title,
                                                            data: selectedActivity.date,
                                                            horario_inicio: `${cleanTime}:00`,
                                                            horario_fim: `${String(parseInt(startHour) + 1).padStart(2, '0')}:00:00`,
                                                            observacoes: selectedActivity.notes,
                                                            responsavelId: targetId,
                                                            responsavelNome: selectedActivity.responsible,
                                                            status: s
                                                        };
                                                        if (token && token !== 'demo-token') {
                                                            await atualizarAtividade(selectedActivity.id, apiPayload, token);
                                                        }
                                                        setActivities(prev => prev.map(a => a.id === selectedActivity.id ? { ...a, status: s } : a));
                                                        Alert.alert('Sucesso', `Status atualizado para: ${meta.label}`);
                                                    } catch (err) {
                                                        Alert.alert('Erro', 'Não foi possível atualizar o status.');
                                                    } finally {
                                                        setLoadingActivities(false);
                                                    }
                                                }}
                                            >
                                                <Text style={{ fontSize: 11, fontWeight: '700', color: active ? meta.color : '#6B7280' }}>
                                                    {meta.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
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
                <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 20 }]}>
                    <TouchableOpacity onPress={isCreating ? resetToList : () => setViewMode('detalhe')} style={styles.backBtn} disabled={loadingActivities}>
                        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center', marginHorizontal: 8 }]}>{isCreating ? 'Nova Atividade' : 'Editar'}</Text>
                    <TouchableOpacity onPress={isCreating ? saveNewActivity : saveEditing} style={styles.saveBtn} disabled={loadingActivities}>
                        {loadingActivities ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveBtnText}>Salvar</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} scrollEnabled={!loadingActivities}>
                    {renderEditField('Título', draftActivity.title, t => setDraftActivity(p => p ? { ...p, title: t } : p), false, true)}
                    
                    {/* Seleção Múltipla de Residentes */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Residentes Vinculados <Text style={{ color: '#EF4444' }}>*</Text></Text>
                        
                        {/* Opção Todos */}
                        <TouchableOpacity 
                            style={[
                                styles.filterChip, 
                                idosos.length > 0 && selectedIdosoIds.length === idosos.length && styles.filterChipActive,
                                { marginBottom: 12, alignSelf: 'flex-start' }
                            ]}
                            onPress={() => {
                                if (idosos.length > 0 && selectedIdosoIds.length === idosos.length) {
                                    setSelectedIdosoIds([]);
                                } else {
                                    setSelectedIdosoIds(idosos.map(i => i.id));
                                }
                            }}
                        >
                            <Ionicons name="people" size={14} color={idosos.length > 0 && selectedIdosoIds.length === idosos.length ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 6 }} />
                            <Text style={[styles.filterChipText, idosos.length > 0 && selectedIdosoIds.length === idosos.length && styles.filterChipTextActive]}>
                                Todos os Residentes
                            </Text>
                        </TouchableOpacity>

                        {/* Chips de idosos ativos para seleção individual */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                            {idosos.map(i => {
                                const selecionado = selectedIdosoIds.includes(i.id);
                                return (
                                    <TouchableOpacity
                                        key={i.id}
                                        style={[styles.filterChip, selecionado && styles.filterChipActive]}
                                        onPress={() => {
                                            if (selecionado) {
                                                setSelectedIdosoIds(prev => prev.filter(id => id !== i.id));
                                            } else {
                                                setSelectedIdosoIds(prev => [...prev, i.id]);
                                            }
                                        }}
                                    >
                                        <Text style={[styles.filterChipText, selecionado && styles.filterChipTextActive]}>
                                            {i.nome.replace(/^(Sr\.|Sra\.) /, '')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {selectedIdosoIds.length === 0 && (
                            <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 4, fontWeight: '500' }}>
                                * Selecione pelo menos um residente.
                            </Text>
                        )}
                    </View>

                    {renderEditField('Horário', draftActivity.time, handleTimeChange, false, true, 'numeric')}
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
                    {!isCreating && (
                        <TouchableOpacity 
                            style={styles.deleteActivityBtn} 
                            onPress={handleDeleteActivity}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                            <Text style={styles.deleteActivityBtnText}>Excluir Atividade</Text>
                        </TouchableOpacity>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
                {loadingActivities && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999
                    }}>
                        <ActivityIndicator size="large" color="#202c4b" />
                        <Text style={{ marginTop: 12, color: '#202c4b', fontSize: 15, fontWeight: '600' }}>
                            {isCreating ? 'Criando atividade...' : 'Salvando alterações...'}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    // ── Vista de lista (principal) ────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.headerTitle}>Agenda</Text>
                    {activeTab === 'atividades' && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {/* Botão de filtro com badge quando há filtros ativos */}
                            <TouchableOpacity style={[styles.addBtn, temFiltros && styles.filterBtnActive]} onPress={() => setModalFiltros(true)}>
                                <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                                {temFiltros && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{filtrosAtivos.length}</Text></View>}
                            </TouchableOpacity>
                            {isAllowedToEdit && (
                                <TouchableOpacity style={styles.addBtn} onPress={startCreating}>
                                    <Ionicons name="add" size={22} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Abas / Segmented Control Premium no Topo */}
                <View style={styles.segmentContainer}>
                    <TouchableOpacity
                        style={[styles.segmentButton, activeTab === 'atividades' && styles.segmentButtonActive]}
                        onPress={() => handleTabChange('atividades')}
                    >
                        <Ionicons name="calendar" size={15} color={activeTab === 'atividades' ? '#202c4b' : '#E2E8F0'} />
                        <Text style={[styles.segmentText, activeTab === 'atividades' && styles.segmentTextActive]}>Atividades</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segmentButton, activeTab === 'cardapio' && styles.segmentButtonActive]}
                        onPress={() => handleTabChange('cardapio')}
                    >
                        <Ionicons name="restaurant" size={15} color={activeTab === 'cardapio' ? '#202c4b' : '#E2E8F0'} />
                        <Text style={[styles.segmentText, activeTab === 'cardapio' && styles.segmentTextActive]}>Cardápio</Text>
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
                        <Text style={styles.modalTitle}>Filtrar Data da Agenda</Text>
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
                                for (let d = 1; d <= daysInMonth; d++) {
                                    const isSelected = selectedDate.getDate() === d &&
                                                       selectedDate.getMonth() === calendarMonth &&
                                                       selectedDate.getFullYear() === calendarYear;
                                    
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
                                                const newD = new Date(calendarYear, calendarMonth, d);
                                                setSelectedDate(newD);
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
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('amanha')}>
                            <Ionicons name="play-forward-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>Amanhã</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('semana')}>
                            <Ionicons name="calendar-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>+7 Dias</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.presetBtn} onPress={() => handleQuickPreset('mes')}>
                            <Ionicons name="arrow-forward-outline" size={13} color="#202c4b" style={{ marginRight: 4 }} />
                            <Text style={styles.presetBtnText}>+1 Mês</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de Edição de Cardápio para Admins */}

            <Modal
                visible={modalCardapioVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalCardapioVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalCardapioVisible(false)}
                />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Editar Cardápio</Text>
                        <TouchableOpacity onPress={() => setModalCardapioVisible(false)}>
                            <Text style={styles.modalClear}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Café da Manhã</Text>
                            <TextInput
                                style={[styles.fieldInput, styles.fieldInputMultiline]}
                                value={editCafeDaManha}
                                onChangeText={setEditCafeDaManha}
                                multiline
                                placeholder="Pão, café com leite, frutas..."
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Almoço</Text>
                            <TextInput
                                style={[styles.fieldInput, styles.fieldInputMultiline]}
                                value={editAlmoco}
                                onChangeText={setEditAlmoco}
                                multiline
                                placeholder="Arroz, feijão, proteína, legumes..."
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Jantar</Text>
                            <TextInput
                                style={[styles.fieldInput, styles.fieldInputMultiline]}
                                value={editJantar}
                                onChangeText={setEditJantar}
                                multiline
                                placeholder="Sopa, canja, chá, biscoitos..."
                            />
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.modalApplyBtn} onPress={handleSaveCardapio}>
                        {loadingCardapio ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.modalApplyText}>Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Modal>



            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#202c4b']} tintColor="#202c4b" />
                }
            >
                {/* Navegação de datas (compartilhada) */}
                <View style={styles.dateNav}>
                    <TouchableOpacity onPress={() => setSelectedDate(d => shiftDate(d, -1))} style={styles.dateNavBtn}>
                        <Ionicons name="chevron-back" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={openCalendar} style={styles.dateLabelContainer} activeOpacity={0.7}>
                        <Ionicons name="calendar-outline" size={16} color="#202c4b" style={{ marginRight: 6 }} />
                        <Text style={styles.dateLabelText}>{formatDayLabel(selectedDate)}</Text>
                        <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedDate(d => shiftDate(d, 1))} style={styles.dateNavBtn}>
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* VISUALIZAÇÃO DE ATIVIDADES */}
                {activeTab === 'atividades' && (
                    <View>
                        {/* Resumo do dia */}
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryCard}><Text style={styles.summaryNum}>{completedCount}</Text><Text style={styles.summaryLabel}>Concluídas</Text></View>
                            <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: '#1D4ED8' }]}>{inProgressCount}</Text><Text style={styles.summaryLabel}>Em andamento</Text></View>
                            <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: '#B45309' }]}>{pendingCount}</Text><Text style={styles.summaryLabel}>Pendentes</Text></View>
                        </View>

                        {/* Chips de filtros ativos compactos */}
                        {temFiltros && (
                            <View style={styles.activeFiltersRow}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
                                    {filtrosAtivos.map(f => <ChipFiltro key={f.key} label={f.label} onRemove={f.onRemove} />)}
                                </ScrollView>
                                <TouchableOpacity style={styles.clearBtn} onPress={limparFiltros}>
                                    <Ionicons name="close-circle" size={14} color="#EF4444" />
                                    <Text style={styles.clearBtnText}>Limpar</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Atividades por período */}
                        {loadingActivities ? (
                            <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                <ActivityIndicator size="large" color="#202c4b" />
                                <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '500' }}>Carregando atividades...</Text>
                            </View>
                        ) : activitiesForDay.length === 0 ? (
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
                    </View>
                )}

                {/* VISUALIZAÇÃO DE CARDÁPIO */}
                {activeTab === 'cardapio' && (
                    <View style={styles.cardapioContainer}>
                        {isAllowedToEdit && (
                            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                                <TouchableOpacity
                                    style={styles.adminEditCardapioBtn}
                                    onPress={openEditCardapio}
                                >
                                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.adminEditCardapioBtnText}>
                                        {cardapio.length === 0 ? 'Cadastrar Cardápio' : 'Editar Cardápio do Dia'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {loadingCardapio ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator size="large" color="#202c4b" />
                                <Text style={styles.loadingText}>Carregando cardápio...</Text>
                            </View>
                        ) : cardapio.length === 0 ? (
                            <View style={styles.emptyWrap}>
                                <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyText}>Nenhum cardápio cadastrado para este dia.</Text>
                            </View>
                        ) : (
                            <View style={styles.listWrap}>
                                {usandoDemo && (
                                    <View style={styles.demoBanner}>
                                        <Ionicons name="information-circle-outline" size={16} color="#1D4ED8" />
                                        <Text style={styles.demoBannerText}>Exibindo cardápio de demonstração</Text>
                                    </View>
                                )}
                                {ORDEM_REFEICOES.map(tipo => {
                                    const item = cardapio.find(c => c.tipo === tipo);
                                    if (!item) return null;
                                    return <CardRefeicao key={tipo} item={item} />;
                                })}
                            </View>
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        paddingTop: 52, 
        paddingBottom: 20, 
        paddingHorizontal: 20, 
        backgroundColor: '#202c4b', 
        borderBottomLeftRadius: 24, 
        borderBottomRightRadius: 24,
        flexDirection: 'column',
        gap: 14
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    editBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
    saveBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    saveBtnText: { fontSize: 13, fontWeight: '700', color: '#202c4b' },
    addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    dateNavBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
    dateLabelContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1
    },
    dateLabelText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937'
    },
    
    // Abas de Agenda (Atividades / Cardápio) - INTEGRADO PREMIUM NO TOPO
    segmentContainer: { 
        flexDirection: 'row', 
        backgroundColor: 'rgba(255, 255, 255, 0.12)', 
        padding: 4, 
        borderRadius: 20, 
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)'
    },
    segmentButton: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 6, 
        paddingVertical: 8, 
        borderRadius: 16 
    },
    segmentButtonActive: { 
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2
    },
    segmentText: { fontSize: 13, fontWeight: '600', color: '#E2E8F0' },
    segmentTextActive: { color: '#202c4b', fontWeight: '700' },

    summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 4 },
    summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    summaryNum: { fontSize: 22, fontWeight: '700', color: '#059669' },
    summaryLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
    
    // Filtros no modal
    filterLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 4 },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
    filterChipActive: { backgroundColor: '#202c4b', borderColor: '#202c4b' },
    filterChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
    filterChipTextActive: { color: '#FFFFFF' },
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
    modalApplyBtn: { backgroundColor: '#202c4b', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    modalApplyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    
    // Chips ativos inline
    activeFiltersRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    clearBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FEE2E2', borderRadius: 20, marginLeft: 8 },
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
    activityResident: { fontSize: 12, color: '#202c4b', fontWeight: '500', marginBottom: 2 },
    activityMeta: { fontSize: 11, color: '#9CA3AF' },
    statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusChipText: { fontSize: 10, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
    clearBtnLarge: { marginTop: 16, backgroundColor: '#202c4b', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
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

    // Cardápio
    cardapioContainer: { paddingHorizontal: 0, marginTop: 4 },
    listWrap: { paddingHorizontal: 20, gap: 12 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardHeaderInfo: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    cardHorario: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
    statusBadgeMeal: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusDotMeal: { width: 6, height: 6, borderRadius: 3 },
    statusTextMeal: { fontSize: 12, fontWeight: '600' },
    cardDescricao: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
    cardExpanded: { marginTop: 12, gap: 10 },
    alimentosWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    alimentoChip: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    alimentoText: { fontSize: 12, color: '#374151', fontWeight: '500' },
    caloriasRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    caloriasText: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
    obsWrap: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10 },
    obsLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    obsText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
        borderWidth: 1, borderColor: '#FECACA',
    },
    tagText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },
    loadingWrap: { alignItems: 'center', paddingTop: 40, gap: 12 },
    loadingText: { fontSize: 14, color: '#9CA3AF' },
    emptyWrap: { alignItems: 'center', paddingTop: 40, gap: 12 },
    demoBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginBottom: 8, backgroundColor: '#DBEAFE', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    },
    demoBannerText: { fontSize: 12, color: '#1D4ED8', fontWeight: '500' },
    adminEditCardapioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#202c4b',
        borderRadius: 12,
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    adminEditCardapioBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    deleteActivityBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 14,
        height: 48,
        marginTop: 18,
        marginBottom: 10
    },
    deleteActivityBtnText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '700',
    },
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
