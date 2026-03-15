import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarIdosoDetalhes, Idoso } from '../services/api';

interface ElderlyProfileProps {
    idosoId: number;
    onBack: () => void;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

export const ElderlyProfileScreen: React.FC<ElderlyProfileProps> = ({ idosoId, onBack, onNavigateTab, activeTab = 'elderly' }) => {
    const [idoso, setIdoso] = useState<Idoso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        carregarDetalhes();
    }, [idosoId]);

    const carregarDetalhes = async () => {
        try {
            setError(null);
            setLoading(true);
            const dados = await buscarIdosoDetalhes(idosoId);
            if (!dados) {
                setError('Idoso não encontrado');
            } else {
                setIdoso(dados);
            }
        } catch (err) {
            const mensagemErro = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Perfil</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8297D9" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </View>
        );
    }

    if (error || !idoso) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Perfil</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIcon}>
                        <Ionicons name="alert-circle-outline" size={48} color="#8297D9" />
                    </View>
                    <Text style={styles.errorTitle}>Erro ao carregar</Text>
                    <Text style={styles.errorMessage}>{error || 'Idoso não encontrado'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={carregarDetalhes}>
                        <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarLarge}>
                        <Ionicons name="person" size={64} color="#8297D9" />
                    </View>
                    <Text style={styles.nomePrincipal}>{idoso.nome}</Text>
                    <View style={[styles.statusLargeBadge, idoso.status === 'ativo' ? styles.statusAtivoLarge : styles.statusInativoLarge]}>
                        <View style={[styles.statusDot, idoso.status === 'ativo' ? styles.statusDotAtivo : styles.statusDotInativo]} />
                        <Text style={[styles.statusTextLarge, idoso.status === 'ativo' ? styles.statusTextAtivoLarge : styles.statusTextInativoLarge]}>
                            {idoso.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Text>
                    </View>
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="calendar-outline" size={24} color="#8297D9" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Idade</Text>
                            <Text style={styles.infoValue}>{idoso.idade} anos</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="home-outline" size={24} color="#8297D9" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Quarto</Text>
                            <Text style={styles.infoValue}>{idoso.quarto}</Text>
                        </View>
                    </View>

                    {idoso.ultimaVisita && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#8297D9" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Última Visita</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(idoso.ultimaVisita).toLocaleDateString('pt-BR')}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="document-text-outline" size={20} color="#8297D9" />
                        <Text style={styles.actionButtonText}>Ver Relatórios</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="medical-outline" size={20} color="#8297D9" />
                        <Text style={styles.actionButtonText}>Medicamentos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call-outline" size={20} color="#8297D9" />
                        <Text style={styles.actionButtonText}>Contatar</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => {
                        onBack(); // Volta para lista de idosos
                        onNavigateTab?.('home'); // Depois navega para home
                    }}
                >
                    <Ionicons name="home-outline" size={22} color="#9CA3AF" />
                    <Text style={styles.navItemText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                >
                    {activeTab === 'elderly' && <View style={styles.navItemActive}>
                        <Ionicons name="people" size={22} color="#8297D9" />
                    </View>}
                    {activeTab !== 'elderly' && <Ionicons name="people-outline" size={22} color="#9CA3AF" />}
                    <Text style={activeTab === 'elderly' ? styles.navItemTextActive : styles.navItemText}>Idosos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => {
                        onBack(); // Volta para lista de idosos
                        onNavigateTab?.('alerts'); // Depois navega para alerts
                    }}
                >
                    <Ionicons name="notifications-outline" size={22} color="#9CA3AF" />
                    <Text style={styles.navItemText}>Alertas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => {
                        onBack(); // Volta para lista de idosos
                        onNavigateTab?.('profile'); // Depois navega para perfil
                    }}
                >
                    <Ionicons name="person-outline" size={22} color="#9CA3AF" />
                    <Text style={styles.navItemText}>Perfil</Text>
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
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
    content: {
        flex: 1,
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
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    nomePrincipal: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    statusLargeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusAtivoLarge: {
        backgroundColor: '#ECFDF5',
    },
    statusInativoLarge: {
        backgroundColor: '#FEF3C7',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusDotAtivo: {
        backgroundColor: '#10B981',
    },
    statusDotInativo: {
        backgroundColor: '#F59E0B',
    },
    statusTextLarge: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusTextAtivoLarge: {
        color: '#059669',
    },
    statusTextInativoLarge: {
        color: '#D97706',
    },
    infoSection: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    actionsSection: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8297D9',
        marginLeft: 12,
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
