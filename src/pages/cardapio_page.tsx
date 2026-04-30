import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarCardapio, ItemCardapio, TipoRefeicao, StatusRefeicao } from '../services/api';

// ─── Tipos e metadados ────────────────────────────────────────────────────────

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

const dateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const shiftDate = (d: Date, offset: number) => {
    const next = new Date(d);
    next.setDate(next.getDate() + offset);
    return next;
};

const formatDayLabel = (d: Date) => {
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} • ${formatted}`;
};

const isToday = (d: Date) => dateKey(d) === dateKey(new Date());

// ─── Dados demo (fallback quando API não responde) ────────────────────────────

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

// ─── Componente de tag de restrição ──────────────────────────────────────────

const TagRestricao: React.FC<{ label: string }> = ({ label }) => (
    <View style={styles.tag}>
        <Ionicons name="alert-circle-outline" size={11} color="#DC2626" />
        <Text style={styles.tagText}>{label}</Text>
    </View>
);

// ─── Card de refeição ─────────────────────────────────────────────────────────

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
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusCfg.cor }]} />
                    <Text style={[styles.statusText, { color: statusCfg.cor }]}>{statusCfg.label}</Text>
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface CardapioPageProps {
    token?: string;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const CardapioPage: React.FC<CardapioPageProps> = ({ token, onNavigateTab, activeTab }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usandoDemo, setUsandoDemo] = useState(false);

    const carregarCardapio = useCallback(async (date: Date) => {
        setError(null);
        setLoading(true);
        setUsandoDemo(false);
        try {
            const data = await buscarCardapio(dateKey(date), token);
            setCardapio(data);
        } catch {
            // Fallback para dados demo quando API não está disponível
            setCardapio(createDemoCardapio(dateKey(date)));
            setUsandoDemo(true);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Carrega ao montar e ao trocar data
    React.useEffect(() => {
        carregarCardapio(selectedDate);
    }, [selectedDate, carregarCardapio]);

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarCardapio(selectedDate);
        setRefreshing(false);
    };

    const mudarData = (offset: number) => {
        setSelectedDate(d => shiftDate(d, offset));
    };

    const irParaHoje = () => setSelectedDate(new Date());

    // Estatísticas do dia
    const servidas = cardapio.filter(c => c.status === 'servida').length;
    const pendentes = cardapio.filter(c => c.status === 'pendente').length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cardápio</Text>
                {!isToday(selectedDate) && (
                    <TouchableOpacity style={styles.hojeBtn} onPress={irParaHoje}>
                        <Ionicons name="today-outline" size={16} color="#8297D9" />
                        <Text style={styles.hojeBtnText}>Hoje</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
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
                {/* Seletor de data */}
                <View style={styles.dateNav}>
                    <TouchableOpacity style={styles.dateNavBtn} onPress={() => mudarData(-1)}>
                        <Ionicons name="chevron-back" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <View style={styles.dateLabelWrap}>
                        <Text style={styles.dateLabel}>{formatDayLabel(selectedDate)}</Text>
                        {isToday(selectedDate) && (
                            <View style={styles.todayBadge}>
                                <Text style={styles.todayBadgeText}>Hoje</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity style={styles.dateNavBtn} onPress={() => mudarData(1)}>
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Resumo do dia */}
                {!loading && cardapio.length > 0 && (
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryNum, { color: '#059669' }]}>{servidas}</Text>
                            <Text style={styles.summaryLabel}>Servidas</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryNum, { color: '#D97706' }]}>{pendentes}</Text>
                            <Text style={styles.summaryLabel}>Pendentes</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryNum}>{cardapio.length}</Text>
                            <Text style={styles.summaryLabel}>Refeições</Text>
                        </View>
                    </View>
                )}

                {/* Banner de dados demo */}
                {usandoDemo && (
                    <View style={styles.demoBanner}>
                        <Ionicons name="information-circle-outline" size={16} color="#1D4ED8" />
                        <Text style={styles.demoBannerText}>Exibindo dados de demonstração</Text>
                    </View>
                )}

                {/* Conteúdo */}
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#8297D9" />
                        <Text style={styles.loadingText}>Carregando cardápio...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorWrap}>
                        <Ionicons name="cloud-offline-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => carregarCardapio(selectedDate)}>
                            <Text style={styles.retryText}>Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                ) : cardapio.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Nenhum cardápio para este dia</Text>
                    </View>
                ) : (
                    <View style={styles.listWrap}>
                        {ORDEM_REFEICOES.map(tipo => {
                            const item = cardapio.find(c => c.tipo === tipo);
                            if (!item) return null;
                            return <CardRefeicao key={tipo} item={item} />;
                        })}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
        backgroundColor: '#8297D9', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    hojeBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    hojeBtnText: { fontSize: 13, fontWeight: '600', color: '#8297D9' },

    // Seletor de data
    dateNav: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
    },
    dateNavBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
    },
    dateLabelWrap: { flex: 1, alignItems: 'center', gap: 4 },
    dateLabel: { fontSize: 13, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
    todayBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
    todayBadgeText: { fontSize: 11, fontWeight: '600', color: '#8297D9' },

    // Resumo
    summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 8 },
    summaryCard: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },
    summaryNum: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
    summaryLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },

    // Banner demo
    demoBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginHorizontal: 20, marginBottom: 8,
        backgroundColor: '#DBEAFE', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    },
    demoBannerText: { fontSize: 12, color: '#1D4ED8', fontWeight: '500' },

    // Lista
    listWrap: { paddingHorizontal: 20, gap: 12 },

    // Card de refeição
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardHeaderInfo: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    cardHorario: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '600' },
    cardDescricao: { fontSize: 13, color: '#6B7280', lineHeight: 19 },

    // Conteúdo expandido
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

    // Estados
    loadingWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    loadingText: { fontSize: 14, color: '#9CA3AF' },
    errorWrap: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 40 },
    errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
    retryBtn: { backgroundColor: '#8297D9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    retryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: '#9CA3AF' },
});
