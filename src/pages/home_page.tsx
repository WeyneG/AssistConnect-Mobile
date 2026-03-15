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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buscarIdosos, buscarResumo, Idoso, ResumoIdosos } from '../services/api';
import { ElderlyListScreen } from './elderly_list';

interface HomePageProps {
    onLogout: () => void;
}

type NavigationPage = 'home' | 'elderly' | 'agenda' | 'alerts' | 'profile';

export const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
    const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
    const [idosos, setIdosos] = useState<Idoso[]>([]);
    const [resumo, setResumo] = useState<ResumoIdosos | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setError(null);
            setLoading(true);

            const [idososData, resumoData] = await Promise.all([
                buscarIdosos(),
                buscarResumo(),
            ]);

            setIdosos(idososData);
            setResumo(resumoData);
        } catch (err) {
            const mensagemErro = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(mensagemErro);
            Alert.alert('Erro', mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await carregarDados();
        setRefreshing(false);
    };

    const handleVerDetalhes = (idoso: Idoso) => {
        Alert.alert('Detalhes', `Visualizar detalhes de ${idoso.nome}`);
    };

    // Mostrar tela de listagem de idosos
    if (currentPage === 'elderly') {
        return <ElderlyListScreen onBack={() => setCurrentPage('home')} />;
    }

    return (
        <View style={styles.container}>
            {/* Header com Gradiente */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Olá, Cuidador 👋</Text>
                        <Text style={styles.headerTitle}>AssistConnect</Text>
                    </View>
                    <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8297D9']} tintColor="#8297D9" />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8297D9" />
                        <Text style={styles.loadingText}>Carregando...</Text>
                    </View>
                ) : error ? (
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
                ) : (
                    <>
                        {/* Stats Cards */}
                        {resumo && (
                            <View style={styles.statsContainer}>
                                <View style={styles.statCard}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons name="people" size={28} color="#8297D9" />
                                    </View>
                                    <Text style={styles.statNumber}>{resumo.total}</Text>
                                    <Text style={styles.statLabel}>Total</Text>
                                </View>

                                <View style={styles.statCard}>
                                    <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                                        <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.statNumber}>{resumo.ativos}</Text>
                                    <Text style={styles.statLabel}>Ativos</Text>
                                </View>

                                <View style={styles.statCard}>
                                    <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                        <Ionicons name="pause-circle" size={28} color="#FF9800" />
                                    </View>
                                    <Text style={styles.statNumber}>{resumo.inativos}</Text>
                                    <Text style={styles.statLabel}>Inativos</Text>
                                </View>
                            </View>
                        )}

                        {/* Lista de Idosos */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Idosos Cadastrados</Text>
                                <TouchableOpacity>
                                    <Ionicons name="filter" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {idosos.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIcon}>
                                        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                                    </View>
                                    <Text style={styles.emptyText}>Nenhum idoso cadastrado</Text>
                                    <Text style={styles.emptySubtext}>Adicione o primeiro idoso para começar</Text>
                                </View>
                            ) : (
                                idosos.map((idoso, index) => (
                                    <TouchableOpacity
                                        key={idoso.id}
                                        style={[styles.idosoCard, { marginTop: index === 0 ? 0 : 12 }]}
                                        onPress={() => handleVerDetalhes(idoso)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.idosoAvatar}>
                                            <Ionicons name="person" size={24} color="#8297D9" />
                                        </View>

                                        <View style={styles.idosoInfo}>
                                            <Text style={styles.idosoNome}>{idoso.nome}</Text>
                                            <View style={styles.idosoMeta}>
                                                <View style={styles.idosoMetaItem}>
                                                    <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                                                    <Text style={styles.idosoMetaText}>{idoso.idade} anos</Text>
                                                </View>
                                                <View style={[styles.statusBadge, idoso.status === 'ativo' ? styles.statusAtivo : styles.statusInativo]}>
                                                    <View style={[styles.statusDot, idoso.status === 'ativo' ? styles.statusDotAtivo : styles.statusDotInativo]} />
                                                    <Text style={[styles.statusText, idoso.status === 'ativo' ? styles.statusTextAtivo : styles.statusTextInativo]}>
                                                        {idoso.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                                    </Text>
                                                </View>
                                            </View>
                                            {idoso.ultimaVisita && (
                                                <Text style={styles.idosoVisita}>
                                                    Última visita: {new Date(idoso.ultimaVisita).toLocaleDateString('pt-BR')}
                                                </Text>
                                            )}
                                        </View>

                                        <View style={styles.chevronButton}>
                                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setCurrentPage('home')}
                >
                    {currentPage === 'home' && <View style={styles.navItemActive}>
                        <Ionicons name="home" size={22} color="#8297D9" />
                    </View>}
                    {currentPage !== 'home' && <Ionicons name="home-outline" size={22} color="#9CA3AF" />}
                    <Text style={currentPage === 'home' ? styles.navItemTextActive : styles.navItemText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setCurrentPage('elderly')}
                >
                    {currentPage === 'elderly' && <View style={styles.navItemActive}>
                        <Ionicons name="people" size={22} color="#8297D9" />
                    </View>}
                    {currentPage !== 'elderly' && <Ionicons name="people-outline" size={22} color="#9CA3AF" />}
                    <Text style={currentPage === 'elderly' ? styles.navItemTextActive : styles.navItemText}>Idosos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setCurrentPage('alerts')}
                >
                    {currentPage === 'alerts' && <View style={styles.navItemActive}>
                        <Ionicons name="notifications" size={22} color="#8297D9" />
                    </View>}
                    {currentPage !== 'alerts' && <Ionicons name="notifications-outline" size={22} color="#9CA3AF" />}
                    <Text style={currentPage === 'alerts' ? styles.navItemTextActive : styles.navItemText}>Alertas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => setCurrentPage('profile')}
                >
                    {currentPage === 'profile' && <View style={styles.navItemActive}>
                        <Ionicons name="person" size={22} color="#8297D9" />
                    </View>}
                    {currentPage !== 'profile' && <Ionicons name="person-outline" size={22} color="#9CA3AF" />}
                    <Text style={currentPage === 'profile' ? styles.navItemTextActive : styles.navItemText}>Perfil</Text>
                </TouchableOpacity>
            </View>
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
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginTop: -10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
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
        paddingVertical: 100,
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
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: -0.3,
    },
    idosoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    idosoAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    idosoInfo: {
        flex: 1,
    },
    idosoNome: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
    },
    idosoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    idosoMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    idosoMetaText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusAtivo: {
        backgroundColor: '#ECFDF5',
    },
    statusInativo: {
        backgroundColor: '#FEF3C7',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusDotAtivo: {
        backgroundColor: '#10B981',
    },
    statusDotInativo: {
        backgroundColor: '#F59E0B',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusTextAtivo: {
        color: '#059669',
    },
    statusTextInativo: {
        color: '#D97706',
    },
    idosoVisita: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    chevronButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#8297D9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8297D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 8,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    navItemActive: {
        backgroundColor: '#EEF2FF',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navItemText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    navItemTextActive: {
        fontSize: 11,
        color: '#8297D9',
        fontWeight: '600',
    },
});
