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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarIdosos, Idoso } from '../services/api';
import { ElderlyProfileScreen } from './elderly_profile';

interface ElderlyListProps {
    onBack: () => void;
}

type ViewMode = 'list' | 'profile';

export const ElderlyListScreen: React.FC<ElderlyListProps> = ({ onBack }) => {
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
            setCurrentPage(1);
            
            const idososData = await buscarIdosos(1, pageSize);
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
            const novosDados = await buscarIdosos(nextPage, pageSize);
            
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
                    <View style={{ width: 28 }} />
                </View>
            </View>

            {/* Search e Filtros */}
            <View style={styles.filtersSection}>
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

                {/* Status Filter Label */}
                <Text style={styles.filterLabel}>Status</Text>

                {/* Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterTabs}
                    contentContainerStyle={styles.filterTabsContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            filterStatus === 'todos' && styles.filterTabActive
                        ]}
                        onPress={() => setFilterStatus('todos')}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filterStatus === 'todos' && styles.filterTabTextActive
                            ]}
                        >
                            Todos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            filterStatus === 'ativo' && styles.filterTabActive
                        ]}
                        onPress={() => setFilterStatus('ativo')}
                    >
                        <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={filterStatus === 'ativo' ? '#FFFFFF' : '#9CA3AF'}
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            style={[
                                styles.filterTabText,
                                filterStatus === 'ativo' && styles.filterTabTextActive
                            ]}
                        >
                            Ativos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            filterStatus === 'inativo' && styles.filterTabActive
                        ]}
                        onPress={() => setFilterStatus('inativo')}
                    >
                        <Ionicons
                            name="pause-circle"
                            size={14}
                            color={filterStatus === 'inativo' ? '#FFFFFF' : '#9CA3AF'}
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            style={[
                                styles.filterTabText,
                                filterStatus === 'inativo' && styles.filterTabTextActive
                            ]}
                        >
                            Inativos
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Room Filter Label */}
                {availableRooms.length > 0 && (
                    <Text style={styles.filterLabel}>Ala/Quarto</Text>
                )}

                {/* Filter Rooms */}
                {availableRooms.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterTabs}
                        contentContainerStyle={styles.filterTabsContent}
                    >
                        <TouchableOpacity
                            style={[
                                styles.filterTab,
                                filterRoom === 'todos' && styles.filterTabActive
                            ]}
                            onPress={() => setFilterRoom('todos')}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    filterRoom === 'todos' && styles.filterTabTextActive
                                ]}
                            >
                                Todos os quartos
                            </Text>
                        </TouchableOpacity>

                        {availableRooms.map(room => (
                            <TouchableOpacity
                                key={room}
                                style={[
                                    styles.filterTab,
                                    filterRoom === room && styles.filterTabActive
                                ]}
                                onPress={() => setFilterRoom(room)}
                            >
                                <Ionicons
                                    name="home-outline"
                                    size={14}
                                    color={filterRoom === room ? '#FFFFFF' : '#9CA3AF'}
                                    style={{ marginRight: 4 }}
                                />
                                <Text
                                    style={[
                                        styles.filterTabText,
                                        filterRoom === room && styles.filterTabTextActive
                                    ]}
                                >
                                    Qto {room}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
        </View>
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
    filtersSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#F8FAFC',
    },
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
    searchInput: {
        flex: 1,
        fontSize: 14,
        marginLeft: 8,
        color: '#1F2937',
    },
    filterTabs: {
        marginBottom: 4,
    },
    filterTabsContent: {
        gap: 8,
        paddingRight: 20,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterTabActive: {
        backgroundColor: '#8297D9',
        borderColor: '#8297D9',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        marginTop: 12,
    },
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
