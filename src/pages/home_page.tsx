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
import { buscarIdosos, buscarResumo, Idoso, ResumoIdosos, FiltrosAtividade } from '../services/api';
import { BottomTabBar } from '../components/BottomTabBar';
import { ElderlyListScreen } from './elderly_list';
import { AgendaPage } from './agenda_page';
import { Image } from 'react-native';
import { getFotoUri } from '../services/api';

interface HomePageProps {
    token?: string;
    onLogout: () => void;
    onVerPerfil: (idosoId: number) => void;
}

type NavigationPage = 'home' | 'elderly' | 'agenda' | 'profile';

// ─── Tela de Perfil simples ───────────────────────────────────────────────────
const PerfilTab: React.FC<{ onLogout: () => void; onNavigateTab: (tab: string) => void; activeTab: string }> = ({ onLogout, onNavigateTab, activeTab }) => (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View style={{ backgroundColor: '#8297D9', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 }}>Perfil</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="person" size={48} color="#8297D9" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}>Cuidador</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>AssistConnect</Text>
            <TouchableOpacity onPress={onLogout} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>Sair</Text>
            </TouchableOpacity>
        </View>
        <BottomTabBar
            activeTab={activeTab}
            onTabPress={onNavigateTab}
            tabs={[
                { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
                { key: 'elderly', label: 'Idosos', activeIcon: 'people', inactiveIcon: 'people-outline' },
                { key: 'agenda', label: 'Agenda', activeIcon: 'calendar', inactiveIcon: 'calendar-outline' },
                { key: 'profile', label: 'Perfil', activeIcon: 'person', inactiveIcon: 'person-outline' },
            ]}
        />
    </View>
);

export const HomePage: React.FC<HomePageProps> = ({ token, onLogout, onVerPerfil }) => {
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
                buscarIdosos(token),
                buscarResumo(token),
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

    // Mostrar tela de listagem de idosos
    if (currentPage === 'elderly') {
        return (
            <ElderlyListScreen
                token={token}
                onBack={() => setCurrentPage('home')}
                onNavigateTab={(tab) => setCurrentPage(tab as NavigationPage)}
                activeTab={currentPage}
            />
        );
    }

    // Mostrar agenda como tela separada (sem header duplo)
    if (currentPage === 'agenda') {
        return (
            <View style={{ flex: 1 }}>
                <AgendaPage />
                <BottomTabBar
                    activeTab={currentPage}
                    onTabPress={(tab) => setCurrentPage(tab as NavigationPage)}
                    tabs={[
                        { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
                        { key: 'elderly', label: 'Idosos', activeIcon: 'people', inactiveIcon: 'people-outline' },
                        { key: 'agenda', label: 'Agenda', activeIcon: 'calendar', inactiveIcon: 'calendar-outline' },
                        { key: 'profile', label: 'Perfil', activeIcon: 'person', inactiveIcon: 'person-outline' },
                    ]}
                />
            </View>
        );
    }

    // Mostrar perfil
    if (currentPage === 'profile') {
        return (
            <PerfilTab
                onLogout={onLogout}
                onNavigateTab={(tab) => setCurrentPage(tab as NavigationPage)}
                activeTab={currentPage}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
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
                contentContainerStyle={{ paddingTop: 20 }}
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

                        <TouchableOpacity style={styles.agendaCard} onPress={() => setCurrentPage('agenda')} activeOpacity={0.8}>
                            <View style={styles.agendaCardLeft}>
                                <View style={styles.agendaCardIcon}>
                                    <Ionicons name="calendar" size={22} color="#8297D9" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.agendaCardTitle}>Agenda do dia</Text>
                                    <Text style={styles.agendaCardSubtitle}>Abra atividades por período, veja os detalhes e edite sem sair da tela.</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>

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
                                idosos.map((idoso, index) => {
                                    const fotoUri = getFotoUri(idoso.fotoUrl);

                                    return (
                                        <TouchableOpacity
                                            key={idoso.id}
                                            style={[
                                                styles.idosoCard,
                                                { marginTop: index === 0 ? 0 : 12 }
                                            ]}
                                            onPress={() => onVerPerfil(idoso.id)}
                                            activeOpacity={0.7}
                                        >
                                            {/* AVATAR */}
                                            <View style={styles.idosoAvatar}>
                                                {fotoUri ? (
                                                    <Image
                                                        source={{ uri: fotoUri + '?t=' + Date.now() }}
                                                        style={{ width: 56, height: 56, borderRadius: 28 }}
                                                    />
                                                ) : (
                                                    <Ionicons name="person" size={24} color="#8297D9" />
                                                )}
                                            </View>

                                            {/* INFO */}
                                            <View style={styles.idosoInfo}>
                                                <Text style={styles.idosoNome}>{idoso.nome}</Text>

                                                {/* META: idade + status */}
                                                <View style={styles.idosoMeta}>
                                                    <View style={styles.idosoMetaItem}>
                                                        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                                                        <Text style={styles.idosoMetaText}>
                                                            {idoso.idade} anos
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={[
                                                            styles.statusBadge,
                                                            idoso.status === 'ativo'
                                                                ? styles.statusAtivo
                                                                : styles.statusInativo
                                                        ]}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.statusDot,
                                                                idoso.status === 'ativo'
                                                                    ? styles.statusDotAtivo
                                                                    : styles.statusDotInativo
                                                            ]}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.statusText,
                                                                idoso.status === 'ativo'
                                                                    ? styles.statusTextAtivo
                                                                    : styles.statusTextInativo
                                                            ]}
                                                        >
                                                            {idoso.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* opcional: última visita */}
                                                {idoso.ultimaVisita && (
                                                    <Text style={styles.idosoVisita}>
                                                        Última visita:{" "}
                                                        {new Date(idoso.ultimaVisita).toLocaleDateString("pt-BR")}
                                                    </Text>
                                                )}
                                            </View>

                                            {/* SETA */}
                                            <View style={styles.chevronButton}>
                                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            {currentPage !== 'agenda' && (
                <TouchableOpacity style={styles.fab} onPress={() => setCurrentPage('agenda')}>
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            <BottomTabBar
                activeTab={currentPage}
                onTabPress={(tab) => setCurrentPage(tab as NavigationPage)}
                tabs={[
                    { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
                    { key: 'elderly', label: 'Idosos', activeIcon: 'people', inactiveIcon: 'people-outline' },
                    { key: 'agenda', label: 'Agenda', activeIcon: 'calendar', inactiveIcon: 'calendar-outline' },
                    { key: 'profile', label: 'Perfil', activeIcon: 'person', inactiveIcon: 'person-outline' },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginBottom: 4 },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
    logoutButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    content: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    loadingText: { marginTop: 16, fontSize: 15, color: '#6B7280', fontWeight: '500' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 100 },
    errorIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    errorTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
    errorMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
    retryButton: { marginTop: 24, backgroundColor: '#8297D9', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    retryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
    statCard: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    statIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statNumber: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    agendaCard: {
        marginHorizontal: 20,
        marginTop: 18,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    agendaCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    agendaCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    agendaCardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    agendaCardSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
    section: { paddingHorizontal: 20, marginTop: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', letterSpacing: -0.3 },
    idosoCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    idosoAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    idosoInfo: { flex: 1 },
    idosoNome: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 6 },
    idosoMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
    idosoMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    idosoMetaText: { fontSize: 13, color: '#9CA3AF' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    statusAtivo: { backgroundColor: '#ECFDF5' },
    statusInativo: { backgroundColor: '#FEF3C7' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusDotAtivo: { backgroundColor: '#10B981' },
    statusDotInativo: { backgroundColor: '#F59E0B' },
    statusText: { fontSize: 11, fontWeight: '600' },
    statusTextAtivo: { color: '#059669' },
    statusTextInativo: { color: '#D97706' },
    idosoVisita: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    chevronButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
    emptySubtext: { fontSize: 14, color: '#9CA3AF' },
    fab: {
        position: 'absolute', right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#8297D9', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#8297D9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
});
