import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
    ActivityIndicator, RefreshControl, FlatList, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    buscarAtividades, buscarIdosos,
    Atividade, FiltrosAtividade, TipoAtividade, StatusAtividade, Idoso,
} from '../services/api';

interface AtividadesPageProps {
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
    filtrosIniciais?: FiltrosAtividade;
    onFiltrosChange?: (filtros: FiltrosAtividade) => void;
}

const TIPO_
// ─── Configurações visuais por tipo e status ─────────────────────────────────

const TIPO_CONFIG: Record<TipoAtividade, { label: string; icon: string; cor: string; bg: string }> = {
    medicacao: { label: 'Medicação', icon: 'medical', cor: '#EF4444', bg: '#FEE2E2' },
    fisioterapia: { label: 'Fisioterapia', icon: 'fitness', cor: '#8297D9', bg: '#EEF2FF' },
    consulta: { label: 'Consulta', icon: 'stethoscope', cor: '#212B48', bg: '#E8EAF0' },
    lazer: { label: 'Lazer', icon: 'game-controller', cor: '#10B981', bg: '#ECFDF5' },
    alimentacao: { label: 'Alimentação', icon: 'restaurant', cor: '#F59E0B', bg: '#FEF3C7' },
    higiene: { label: 'Higiene', icon: 'water', cor: '#06B6D4', bg: '#ECFEFF' },
};

const STATUS_CONFIG: Record<StatusAtividade, { label: string; cor: string; bg: string; dot: string }> = {
    pendente: { label: 'Pendente', cor: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' },
    concluida: { label: 'Concluída', cor: '#059669', bg: '#ECFDF5', dot: '#10B981' },
    cancelada: { label: 'Cancelada', cor: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
};

// ─── Componente de chip de filtro ativo ──────────────────────────────────────

const ChipFiltro: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <View style={chipStyles.container}>
        <Text style={chipStyles.label}>{label}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
            <Ionicons name="close" size={14} color="#8297D9" />
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

// ─── Card de atividade ───────────────────────────────────────────────────────

const CardAtividade: React.FC<{ atividade: Atividade }> = ({ atividade }) => {
    const tipo = TIPO_CONFIG[atividade.tipo];
    const status = STATUS_CONFIG[atividade.status];

    return (
        <View style={cardStyles.container}>
            <View style={[cardStyles.iconBox, { backgroundColor: tipo.bg }]}>
                <Ionicons name={tipo.icon as any} size={22} color={tipo.cor} />
            </View>

            <View style={cardStyles.info}>
                <Text style={cardStyles.titulo}>{atividade.titulo}</Text>
                <Text style={cardStyles.residente}>{atividade.nomeIdoso}</Text>
                <View style={cardStyles.meta}>
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text style={cardStyles.metaText}>{atividade.horario}</Text>
                    {atividade.responsavel && (
                        <>
                            <View style={cardStyles.dot} />
                            <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                            <Text style={cardStyles.metaText}>{atividade.responsavel}</Text>
                        </>
                    )}
                </View>
            </View>

            <View style={[cardStyles.statusBadge, { backgroundColor: status.bg }]}>
                <View style={[cardStyles.statusDot, { backgroundColor: status.dot }]} />
                <Text style={[cardStyles.statusText, { color: status.cor }]}>{status.label}</Text>
            </View>
        </View>
    );
};

const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
        flexDirection: 'row', alignItems: 'center', marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    iconBox: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    info: { flex: 1 },
    titulo: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
    residente: { fontSize: 12, color: '#8297D9', fontWeight: '500', marginBottom: 4 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, color: '#9CA3AF' },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    statusDot: { width: 5, height: 5, borderRadius: 2.5 },
    statusText: { fontSize: 10, fontWeight: '600' },
});

// ─── Tela principal ──────────────────────────────────────────────────────────

export const AtividadesPage: React.FC<AtividadesPageProps> = ({
    onNavigateTab, activeTab = 'agenda', filtrosIniciais = {}, onFiltrosChange,
}) => {
    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtros — inicializados com os valores persistidos
    const [filtroIdoso, setFiltroIdoso] = useState<number | undefined>(filtrosIniciais.idosoId);
    const [filtroTipo, setFiltroTipo] = useState<TipoAtividade | undefined>(filtrosIniciais.tipo);
    const [filtroStatus, setFiltroStatus] = useState<StatusAtividade | undefined>(filtrosIniciais.status);

    // Notifica o pai sempre que os filtros mudam (persistência)
    useEffect(() => {
        onFiltrosChange?.({ idosoId: filtroIdoso, tipo: filtroTipo, status: filtroStatus });
    }, [filtroIdoso, filtroTipo, filtroStatus]);

    const filtrosAtivos = [
        filtroIdoso !== undefined && { key: 'idoso', label: idosos.find(i => i.id === filtroIdoso)?.nome ?? 'Residente', onRemove: () => setFiltroIdoso(undefined) },
        filtroTipo !== undefined && { key: 'tipo', label: TIPO_CONFIG[filtroTipo].label, onRemove: () => setFiltroTipo(undefined) },
        filtroStatus !== undefined && { key: 'status', label: STATUS_CONFIG[filtroStatus].label, onRemove: () => setFiltroStatus(undefined) },
    ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

    const temFiltrosAtivos = filtrosAtivos.length > 0;

    const limparFiltros = () => {
        setFiltroIdoso(undefined);
        setFiltroTipo(undefined);
        setFiltroStatus(undefined);
    };

    const carregarDados = useCallback(async () => {
        try {
            setError(null);
            const [atividadesData, idososData] = await Promise.all([
                buscarAtividades({ idosoId: filtroIdoso, tipo: filtroTipo, status: filtroStatus }),
                buscarIdosos(),
            ]);
            setAtividades(atividadesData);
            setIdosos(idososData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filtroIdoso, filtroTipo, filtroStatus]);

    useEffect(() => {
        setLoading(true);
        carregarDados();
    }, [filtroIdoso, filtroTipo, filtroStatus]);

    const onRefresh = () => {
        setRefreshing(true);
        carregarDados();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Atividades</Text>
                <Text style={styles.headerSub}>Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</Text>
            </View>

            {/* Seção de filtros */}
            <View style={styles.filtersSection}>

                {/* Filtro por Residente */}
                <Text style={styles.filterLabel}>Residente</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
                    <TouchableOpacity
                        style={[styles.filterChip, filtroIdoso === undefined && styles.filterChipActive]}
                        onPress={() => setFiltroIdoso(undefined)}
                    >
                        <Text style={[styles.filterChipText, filtroIdoso === undefined && styles.filterChipTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {idosos.map(idoso => (
                        <TouchableOpacity
                            key={idoso.id}
                            style={[styles.filterChip, filtroIdoso === idoso.id && styles.filterChipActive]}
                            onPress={() => setFiltroIdoso(filtroIdoso === idoso.id ? undefined : idoso.id)}
                        >
                            <Text style={[styles.filterChipText, filtroIdoso === idoso.id && styles.filterChipTextActive]} numberOfLines={1}>
                                {idoso.nome.replace(/^(Sr\.|Sra\.) /, '')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Filtro por Tipo */}
                <Text style={styles.filterLabel}>Tipo</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
                    <TouchableOpacity
                        style={[styles.filterChip, filtroTipo === undefined && styles.filterChipActive]}
                        onPress={() => setFiltroTipo(undefined)}
                    >
                        <Text style={[styles.filterChipText, filtroTipo === undefined && styles.filterChipTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {(Object.keys(TIPO_CONFIG) as TipoAtividade[]).map(tipo => (
                        <TouchableOpacity
                            key={tipo}
                            style={[styles.filterChip, filtroTipo === tipo && styles.filterChipActive]}
                            onPress={() => setFiltroTipo(filtroTipo === tipo ? undefined : tipo)}
                        >
                            <Ionicons
                                name={TIPO_CONFIG[tipo].icon as any}
                                size={13}
                                color={filtroTipo === tipo ? '#FFFFFF' : '#9CA3AF'}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.filterChipText, filtroTipo === tipo && styles.filterChipTextActive]}>
                                {TIPO_CONFIG[tipo].label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Filtro por Status */}
                <Text style={styles.filterLabel}>Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
                    <TouchableOpacity
                        style={[styles.filterChip, filtroStatus === undefined && styles.filterChipActive]}
                        onPress={() => setFiltroStatus(undefined)}
                    >
                        <Text style={[styles.filterChipText, filtroStatus === undefined && styles.filterChipTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {(Object.keys(STATUS_CONFIG) as StatusAtividade[]).map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.filterChip, filtroStatus === status && styles.filterChipActive]}
                            onPress={() => setFiltroStatus(filtroStatus === status ? undefined : status)}
                        >
                            <View style={[styles.statusDotInline, { backgroundColor: filtroStatus === status ? '#FFFFFF' : STATUS_CONFIG[status].dot }]} />
                            <Text style={[styles.filterChipText, filtroStatus === status && styles.filterChipTextActive]}>
                                {STATUS_CONFIG[status].label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Chips de filtros ativos + botão limpar */}
                {temFiltrosAtivos && (
                    <View style={styles.activeFiltersRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersContent}>
                            {filtrosAtivos.map(f => (
                                <ChipFiltro key={f.key} label={f.label} onRemove={f.onRemove} />
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.clearButton} onPress={limparFiltros}>
                            <Ionicons name="close-circle" size={14} color="#EF4444" />
                            <Text style={styles.clearButtonText}>Limpar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Lista */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#8297D9" />
                    <Text style={styles.loadingText}>Carregando atividades...</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Ionicons name="cloud-offline-outline" size={48} color="#8297D9" />
                    <Text style={styles.errorTitle}>Sem conexão</Text>
                    <Text style={styles.errorMsg}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); carregarDados(); }}>
                        <Text style={styles.retryBtnText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={atividades}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <CardAtividade atividade={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8297D9']} tintColor="#8297D9" />}
                    ListHeaderComponent={
                        atividades.length > 0 ? (
                            <Text style={styles.resultCount}>
                                {atividades.length} {atividades.length === 1 ? 'atividade' : 'atividades'}
                            </Text>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                            </View>
                            <Text style={styles.emptyText}>Nenhuma atividade encontrada</Text>
                            <Text style={styles.emptySubtext}>
                                {temFiltrosAtivos ? 'Tente ajustar ou limpar os filtros' : 'Nenhuma atividade cadastrada para hoje'}
                            </Text>
                            {temFiltrosAtivos && (
                                <TouchableOpacity style={styles.retryBtn} onPress={limparFiltros}>
                                    <Text style={styles.retryBtnText}>Limpar filtros</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigateTab?.('home')}>
                    <Ionicons name="home-outline" size={22} color="#9CA3AF" />
                    <Text style={styles.navItemText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigateTab?.('elderly')}>
                    <Ionicons name="people-outline" size={22} color="#9CA3AF" />
                    <Text style={styles.navItemText}>Idosos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <View style={styles.navItemActive}>
                        <Ionicons name="calendar" size={22} color="#8297D9" />
                    </View>
                    <Text style={styles.navItemTextActive}>Agenda</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigateTab?.('profile')}>
                    <Ionicons name="person-outline" size={22} color="#9CA3AF" />
                    <Text style={styles.navItemText}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    filtersSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: '#F8FAFC' },
    filterLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8, marginTop: 10 },
    filterRow: { marginBottom: 4 },
    filterRowContent: { gap: 8, paddingRight: 20 },
    filterChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    },
    filterChipActive: { backgroundColor: '#8297D9', borderColor: '#8297D9' },
    filterChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
    filterChipTextActive: { color: '#FFFFFF' },
    statusDotInline: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    activeFiltersRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: 12, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    activeFiltersContent: { gap: 8, paddingRight: 8 },
    clearButton: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6,
        backgroundColor: '#FEE2E2', borderRadius: 20, marginLeft: 8,
    },
    clearButtonText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
    errorTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 12 },
    errorMsg: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6 },
    retryBtn: { marginTop: 20, backgroundColor: '#8297D9', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    retryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
    resultCount: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginBottom: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
    emptySubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
    bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 8, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    navItem: { flex: 1, alignItems: 'center', gap: 4 },
    navItemActive: { backgroundColor: '#EEF2FF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    navItemText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
    navItemTextActive: { fontSize: 11, color: '#8297D9', fontWeight: '600' },
});
