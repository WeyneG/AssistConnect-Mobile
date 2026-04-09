import React, { useState, useEffect, useRef } from 'react';
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
    FlatList,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarIdosos, Idoso } from '../services/api';
import { ElderlyProfileScreen } from './elderly_profile';
import { BottomTabBar } from '../components/BottomTabBar';

interface ElderlyListProps {
    token?: string;
    onBack: () => void;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

type ViewMode = 'list' | 'profile';

export const ElderlyListScreen: React.FC<ElderlyListProps> = ({ token, onBack, onNavigateTab, activeTab = 'elderly' }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedIdosoId, setSelectedIdosoId] = useState<number | null>(null);

    // Listagem
    const [todosIdosos, setTodosIdosos] = useState<Idoso[]>([]);
    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [filteredIdosos, setFilteredIdosos] = useState<Idoso[]>([]);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Estados
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Busca com debounce
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
    const [filterRoom, setFilterRoom] = useState<string>('todos');
    const [availableRooms, setAvailableRooms] = useState<string[]>([]);
    const [modalFiltros, setModalFiltros] = useState(false);

    const temFiltros = filterStatus !== 'todos' || filterRoom !== 'todos';

    const limparFiltros = () => {
        setFilterStatus('todos');
        setFilterRoom('todos');
    };

    // Debounce na busca (300ms)
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText]);

    // Filtrar quando a busca com debounce, status ou quarto muda
    useEffect(() => {
        filtrarIdosos();
    }, [debouncedSearch, filterStatus, filterRoom, idosos]);

    // Carregar primeira página
    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setError(null);
            setLoading(true);
            setCurrentPage(0);
            const idososData = await buscarIdosos(token, 0, pageSize);
            setIdosos(idososData);
            setTodosIdosos(idososData);
            setHasMore(idososData.length === pageSize);
            // Extrair quartos únicos e ordenar
            const quartos = Array.from(new Set(idososData.map(i => i.quarto))).sort();
            setAvailableRooms(quartos);
        } catch (err) {
            const mensagemErro = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(mensagemErro);
            Alert.alert('Erro', mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    const carregarMais = async () => {
        if (loadingMore || !hasMore) return;
        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            const novosDados = await buscarIdosos(token, nextPage, pageSize);
            if (novosDados.length === 0) {
                setHasMore(false);
            } else {
                setIdosos(prev => [...prev, ...novosDados]);
                setTodosIdosos(prev => [...prev, ...novosDados]);
                setCurrentPage(nextPage);
                setHasMore(novosDados.length === pageSize);
            }
        } catch (err) {
            const mensagemErro = err instanceof Error ? err.message : 'Erro ao carregar mais';
            Alert.alert('Erro', mensagemErro);
        } finally {
            setLoadingMore(false);
        }
    };

    const filtrarIdosos = () => {
        let resultado = idosos;

        // Filtrar por status
        if (filterStatus !== 'todos') {
            resultado = resultado.filter(idoso => idoso.status === filterStatus);
        }

        // Filtrar por quarto
        if (filterRoom !== 'todos') {
            resultado = resultado.filter(idoso => idoso.quarto === filterRoom);
        }

        // Filtrar por busca
        if (debouncedSearch) {
            resultado = resultado.filter(idoso =>
                idoso.nome.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        setFilteredIdosos(resultado);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarDados();
        setRefreshing(false);
    };

    const handleVerDetalhes = (idoso: Idoso) => {
        setSelectedIdosoId(idoso.id);
        setViewMode('profile');
    };

    const handleBackFromProfile = () => {
        setViewMode('list');
        setSelectedIdosoId(null);
    };

    // Tela de perfil
    if (viewMode === 'profile' && selectedIdosoId) {
        return (
            <ElderlyProfileScreen
                idosoId={selectedIdosoId}
                onBack={handleBackFromProfile}
                onNavigateTab={onNavigateTab}
                activeTab={activeTab}
            />
        );
    }

    // Tela de loading
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={onBack}>
                            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Idosos</Text>
                        <View style={{ width: 28 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8297D9" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </View>
        );
    }

    // Tela de erro
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={onBack}>
                            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Idosos</Text>
                        <View style={{ width: 28 }} />
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIcon}>
                        <Ionicons name="cloud-offline-outline" size={48} color="#8297D9" />
                    </View>
                    <Text style={styles.errorTitle}>Sem conexão</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={carregarDados}>
                        <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Tela de listagem
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={onBack}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Idosos</Text>
                    <TouchableOpacity style={[styles.filterBtn, temFiltros && styles.filterBtnActive]} onPress={() => setModalFiltros(true)}>
                        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                        {temFiltros && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{(filterStatus !== 'todos' ? 1 : 0) + (filterRoom !== 'todos' ? 1 : 0)}</Text></View>}
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

                    <Text style={styles.modalFilterLabel}>Status</Text>
                    <View style={styles.modalFilterRow}>
                        {(['todos', 'ativo', 'inativo'] as const).map(s => (
                            <TouchableOpacity key={s} style={[styles.modalChip, filterStatus === s && styles.modalChipActive]} onPress={() => setFilterStatus(s)}>
                                {s !== 'todos' && <Ionicons name={s === 'ativo' ? 'checkmark-circle' : 'pause-circle'} size={13} color={filterStatus === s ? '#FFFFFF' : '#9CA3AF'} style={{ marginRight: 4 }} />}
                                <Text style={[styles.modalChipText, filterStatus === s && styles.modalChipTextActive]}>
                                    {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Inativos'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {availableRooms.length > 0 && <>
                        <Text style={styles.modalFilterLabel}>Ala/Quarto</Text>
                        <View style={styles.modalFilterRow}>
                            <TouchableOpacity style={[styles.modalChip, filterRoom === 'todos' && styles.modalChipActive]} onPress={() => setFilterRoom('todos')}>
                                <Text style={[styles.modalChipText, filterRoom === 'todos' && styles.modalChipTextActive]}>Todos</Text>
                            </TouchableOpacity>
                            {availableRooms.map(room => (
                                <TouchableOpacity key={room} style={[styles.modalChip, filterRoom === room && styles.modalChipActive]} onPress={() => setFilterRoom(room)}>
                                    <Ionicons name="home-outline" size={13} color={filterRoom === room ? '#FFFFFF' : '#9CA3AF'} style={{ marginRight: 4 }} />
                                    <Text style={[styles.modalChipText, filterRoom === room && styles.modalChipTextActive]}>Qto {room}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>}

                    <TouchableOpacity style={styles.modalApplyBtn} onPress={() => setModalFiltros(false)}>
                        <Text style={styles.modalApplyText}>Aplicar{temFiltros ? ` (${(filterStatus !== 'todos' ? 1 : 0) + (filterRoom !== 'todos' ? 1 : 0)} ativo${((filterStatus !== 'todos' ? 1 : 0) + (filterRoom !== 'todos' ? 1 : 0)) > 1 ? 's' : ''})` : ''}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Search */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar idoso..."
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText !== '' && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Chips de filtros ativos */}
                {temFiltros && (
                    <View style={styles.activeFiltersRow}>
                        {filterStatus !== 'todos' && (
                            <View style={styles.activeChip}>
                                <Text style={styles.activeChipText}>{filterStatus === 'ativo' ? 'Ativos' : 'Inativos'}</Text>
                                <TouchableOpacity onPress={() => setFilterStatus('todos')} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                                    <Ionicons name="close" size={13} color="#8297D9" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {filterRoom !== 'todos' && (
                            <View style={styles.activeChip}>
                                <Text style={styles.activeChipText}>Qto {filterRoom}</Text>
                                <TouchableOpacity onPress={() => setFilterRoom('todos')} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                                    <Ionicons name="close" size={13} color="#8297D9" />
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity style={styles.clearBtn} onPress={limparFiltros}>
                            <Ionicons name="close-circle" size={13} color="#EF4444" />
                            <Text style={styles.clearBtnText}>Limpar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <FlatList
                data={filteredIdosos}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.idosoCard}
                        onPress={() => handleVerDetalhes(item)}
                        activeOpacity={0.7}
                    >
                        {/* Avatar */}
                        <View style={styles.cardAvatar}>
                            <Ionicons name="person" size={20} color="#8297D9" />
                        </View>

                        {/* Informações */}
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardNome}>{item.nome}</Text>
                            <View style={styles.cardMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="home-outline" size={12} color="#9CA3AF" />
                                    <Text style={styles.metaText}>Quarto {item.quarto}</Text>
                                </View>
                                <View style={styles.metaSeparator} />
                                <View style={styles.metaItem}>
                                    <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                                    <Text style={styles.metaText}>{item.idade}a</Text>
                                </View>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View style={[styles.statusBadge, item.status === 'ativo' ? styles.statusAtivo : styles.statusInativo]}>
                            <View style={[styles.statusDot, item.status === 'ativo' ? styles.statusDotAtivo : styles.statusDotInativo]} />
                            <Text style={[styles.statusText, item.status === 'ativo' ? styles.statusTextAtivo : styles.statusTextInativo]}>
                                {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Text>
                        </View>

                        {/* Chevron */}
                        <View style={styles.chevronButton}>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                        </View>
                        <Text style={styles.emptyText}>
                            {todosIdosos.length === 0 ? 'Nenhum idoso cadastrado' : 'Nenhum resultado encontrado'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {todosIdosos.length === 0
                                ? 'Adicione o primeiro idoso para começar'
                                : 'Tente ajustar seus filtros'}
                        </Text>
                    </View>
                }
                ListHeaderComponent={
                    filteredIdosos.length > 0 ? (
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultText}>
                                {filteredIdosos.length} {filteredIdosos.length === 1 ? 'idoso' : 'idosos'} encontrado{filteredIdosos.length === 1 ? '' : 's'}
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    hasMore ? (
                        <View style={styles.loadMoreContainer}>
                            {loadingMore ? (
                                <>
                                    <ActivityIndicator size="large" color="#8297D9" />
                                    <Text style={styles.loadingMoreText}>Carregando mais...</Text>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={carregarMais}
                                    disabled={loadingMore}
                                >
                                    <Ionicons name="arrow-down" size={18} color="#8297D9" />
                                    <Text style={styles.loadMoreButtonText}>Carregar mais</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#8297D9']}
                        tintColor="#8297D9"
                    />
                }
                scrollIndicatorInsets={{ right: 1 }}
            />

            <BottomTabBar
                activeTab={activeTab}
                onTabPress={(tab) => {
                    onBack();
                    onNavigateTab?.(tab);
                }}
                tabs={[
                    { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
                    { key: 'elderly', label: 'Idosos', activeIcon: 'people', inactiveIcon: 'people-outline' },
                    { key: 'agenda', label: 'Agenda', activeIcon: 'calendar', inactiveIcon: 'calendar-outline' },
                    { key: 'profile', label: 'Perfil', activeIcon: 'person', inactiveIcon: 'person-outline' },
                ]}
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    filterBtnActive: { backgroundColor: '#212B48' },
    filterBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
    filterBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    modalClear: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
    modalFilterLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    modalFilterRow: { flexDirection: 'row', flexWrap: 'wrap' },
    modalChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
    modalChipActive: { backgroundColor: '#8297D9', borderColor: '#8297D9' },
    modalChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
    modalChipTextActive: { color: '#FFFFFF' },
    modalApplyBtn: { backgroundColor: '#8297D9', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    modalApplyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    // Search + chips ativos
    searchSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    activeFiltersRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 10 },
    activeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#8297D9', marginRight: 8, marginBottom: 4 },
    activeChipText: { fontSize: 12, fontWeight: '600', color: '#8297D9', marginRight: 4 },
    clearBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FEE2E2', borderRadius: 20, marginBottom: 4 },
    clearBtnText: { fontSize: 12, fontWeight: '600', color: '#EF4444', marginLeft: 4 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    searchInput: { flex: 1, fontSize: 14, marginLeft: 8, color: '#1F2937' },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#8297D9',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    resultInfo: {
        paddingBottom: 12,
    },
    resultText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    idosoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardNome: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    metaText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    metaSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 3,
        marginRight: 8,
    },
    statusAtivo: {
        backgroundColor: '#ECFDF5',
    },
    statusInativo: {
        backgroundColor: '#FEF3C7',
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    statusDotAtivo: {
        backgroundColor: '#10B981',
    },
    statusDotInativo: {
        backgroundColor: '#F59E0B',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    statusTextAtivo: {
        color: '#059669',
    },
    statusTextInativo: {
        color: '#D97706',
    },
    chevronButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    loadMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadMoreButton: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        gap: 8,
    },
    loadMoreButtonText: {
        color: '#8297D9',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingMoreText: {
        marginTop: 8,
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
});
