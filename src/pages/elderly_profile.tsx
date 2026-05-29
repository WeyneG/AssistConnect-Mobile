import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
    buscarIdosoPorId,
    uploadFotoIdoso,
    getFotoUri,
    Idoso,
    buscarMedicamentos,
    buscarAtividades,
    Medicamento,
    Atividade,
} from '../services/api';
import { BottomTabBar } from '../components/BottomTabBar';

interface ElderlyProfileProps {
    idosoId: number;
    token?: string;
    onBack: () => void;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

type SecaoAtiva = 'ficha' | 'medicamentos' | 'atividades';

export const ElderlyProfileScreen: React.FC<ElderlyProfileProps> = ({ idosoId, token, onBack, onNavigateTab, activeTab = 'elderly' }) => {
    const [idoso, setIdoso] = useState<Idoso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Estados integrados
    const [secaoAtiva, setSecaoAtiva] = useState<SecaoAtiva>('ficha');
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [loadingSecoes, setLoadingSecoes] = useState(false);

    useEffect(() => {
        carregarDetalhes();
    }, [idosoId]);

    useEffect(() => {
        if (secaoAtiva === 'medicamentos') {
            carregarMedicamentos();
        } else if (secaoAtiva === 'atividades') {
            carregarAtividades();
        }
    }, [secaoAtiva, idosoId]);

    const carregarDetalhes = async () => {
        try {
            setError(null);
            setLoading(true);
            const dados = await buscarIdosoPorId(idosoId, token);
            if (!dados) {
                throw new Error('Idoso não encontrado');
            }
            setIdoso(dados);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Não foi possível carregar os dados.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const carregarMedicamentos = async () => {
        try {
            setLoadingSecoes(true);
            const dataHoje = new Date().toISOString().split('T')[0];
            const meds = await buscarMedicamentos(dataHoje, idosoId, token);
            setMedicamentos(meds);
        } catch (err) {
            Alert.alert('Erro', 'Erro ao carregar medicamentos do residente.');
        } finally {
            setLoadingSecoes(false);
        }
    };

    const carregarAtividades = async () => {
        try {
            setLoadingSecoes(true);
            const acts = await buscarAtividades({ idosoId }, token);
            setAtividades(acts);
        } catch (err) {
            Alert.alert('Erro', 'Erro ao carregar atividades do residente.');
        } finally {
            setLoadingSecoes(false);
        }
    };

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setPreviewImage(uri);
            confirmarUpload(uri);
        }
    };

    const confirmarUpload = (uri: string) => {
        Alert.alert('Nova Foto', 'Deseja salvar esta imagem como foto de perfil?', [
            { text: 'Cancelar', onPress: () => setPreviewImage(null), style: 'cancel' },
            { text: 'Salvar', onPress: () => realizarUpload(uri) },
        ]);
    };

    const realizarUpload = async (uri: string) => {
        try {
            setUploading(true);
            await uploadFotoIdoso(idosoId, uri, token);
            await carregarDetalhes(); // Recarrega para pegar a nova fotoUrl do backend
            setPreviewImage(null);
            Alert.alert('Sucesso', 'Foto atualizada!');
        } catch (err) {
            Alert.alert('Erro', 'Falha ao enviar a foto.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator testID="loading-indicator" size="large" color="#202c4b" style={{ flex: 1 }} />
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
                    <Text style={styles.headerTitle}>Erro ao carregar</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" style={{ marginBottom: 16 }} />
                    <Text style={{ fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 24 }}>
                        {error || 'Idoso não encontrado'}
                    </Text>
                    <TouchableOpacity
                        style={{ backgroundColor: '#202c4b', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                        onPress={carregarDetalhes}
                    >
                        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const fotoUri = previewImage || getFotoUri(idoso?.fotoUrl);

    // Helpers de medicamentos
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'administrado': return '#10B981';
            case 'atrasado': return '#EF4444';
            default: return '#F59E0B';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'administrado': return '#ECFDF5';
            case 'atrasado': return '#FEE2E2';
            default: return '#FEF3C7';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'administrado': return 'Administrado';
            case 'atrasado': return 'Atrasado';
            default: return 'Pendente';
        }
    };

    // Helpers de atividades
    const TIPO_CONFIG = {
        medicacao: { label: 'Medicação', icon: 'medical', cor: '#EF4444', bg: '#FEE2E2' },
        fisioterapia: { label: 'Fisioterapia', icon: 'fitness', cor: '#202c4b', bg: '#EEF2FF' },
        consulta: { label: 'Consulta', icon: 'stethoscope', cor: '#212B48', bg: '#E8EAF0' },
        lazer: { label: 'Lazer', icon: 'game-controller', cor: '#10B981', bg: '#ECFDF5' },
        alimentacao: { label: 'Alimentação', icon: 'restaurant', cor: '#F59E0B', bg: '#FEF3C7' },
        higiene: { label: 'Higiene', icon: 'water', cor: '#06B6D4', bg: '#ECFEFF' },
    };

    const STATUS_CONFIG = {
        pendente: { label: 'Pendente', cor: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' },
        concluida: { label: 'Concluída', cor: '#059669', bg: '#ECFDF5', dot: '#10B981' },
        cancelada: { label: 'Cancelada', cor: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
        em_andamento: { label: 'Em Andamento', cor: '#1D4ED8', bg: '#DBEAFE', dot: '#1D4ED8' },
        atrasada: { label: 'Atrasada', cor: '#DC2626', bg: '#FEE2E2', dot: '#DC2626' },
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil do Idoso</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
                        <View style={styles.avatarWrapper}>
                            {fotoUri ? (
                                <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={50} color="#202c4b" />
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={18} color="#FFFFFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    {uploading && <Text style={styles.uploadingText}>Enviando...</Text>}
                    <Text style={styles.nomePrincipal}>{idoso?.nome}</Text>
                    <Text style={styles.idadeSub}>{idoso?.idade} anos • Quarto {idoso?.quarto || 'N/A'}</Text>
                </View>

                {/* Seletor de Abas Internas */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, secaoAtiva === 'ficha' && styles.tabButtonActive]}
                        onPress={() => setSecaoAtiva('ficha')}
                    >
                        <Ionicons name="document-text" size={18} color={secaoAtiva === 'ficha' ? '#FFFFFF' : '#6B7280'} />
                        <Text style={[styles.tabButtonText, secaoAtiva === 'ficha' && styles.tabButtonTextActive]}>Ficha</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, secaoAtiva === 'medicamentos' && styles.tabButtonActive]}
                        onPress={() => setSecaoAtiva('medicamentos')}
                    >
                        <Ionicons name="medkit" size={18} color={secaoAtiva === 'medicamentos' ? '#FFFFFF' : '#6B7280'} />
                        <Text style={[styles.tabButtonText, secaoAtiva === 'medicamentos' && styles.tabButtonTextActive]}>Medicação</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, secaoAtiva === 'atividades' && styles.tabButtonActive]}
                        onPress={() => setSecaoAtiva('atividades')}
                    >
                        <Ionicons name="calendar" size={18} color={secaoAtiva === 'atividades' ? '#FFFFFF' : '#6B7280'} />
                        <Text style={[styles.tabButtonText, secaoAtiva === 'atividades' && styles.tabButtonTextActive]}>Atividades</Text>
                    </TouchableOpacity>
                </View>

                {/* Conteúdo baseado na Aba Selecionada */}
                {secaoAtiva === 'ficha' && (
                    <View>
                        {/* Seção de Saúde - Sprint 03 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Saúde e Cuidados</Text>
                            <View style={styles.card}>
                                <View style={styles.cardItem}>
                                    <Ionicons name="pulse" size={20} color="#202c4b" />
                                    <View style={styles.cardText}>
                                        <Text style={styles.label}>Estado de Saúde</Text>
                                        <Text style={styles.value}>{idoso?.estadoSaude || 'Não informado'}</Text>
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.cardItem}>
                                    <Ionicons name="document-text" size={20} color="#202c4b" />
                                    <View style={styles.cardText}>
                                        <Text style={styles.label}>Observações</Text>
                                        <Text style={styles.value}>{idoso?.observacoes || 'Nenhuma observação'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Seção de Contato - Sprint 03 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contato de Emergência</Text>
                            <View style={styles.card}>
                                <View style={styles.cardItem}>
                                    <Ionicons name="call" size={20} color="#202c4b" />
                                    <View style={styles.cardText}>
                                        <Text style={styles.label}>Responsável</Text>
                                        <Text style={styles.value}>{idoso?.responsavelNome || 'Não cadastrado'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {secaoAtiva === 'medicamentos' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medicamentos de Hoje</Text>
                        {loadingSecoes ? (
                            <ActivityIndicator size="small" color="#202c4b" style={{ marginVertical: 20 }} />
                        ) : medicamentos.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="medkit-outline" size={40} color="#9CA3AF" />
                                <Text style={styles.emptyStateText}>Nenhum medicamento agendado para hoje.</Text>
                            </View>
                        ) : (
                            medicamentos.map(med => (
                                <View key={med.id} style={styles.medCard}>
                                    <View style={styles.medHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.medNome}>{med.nome}</Text>
                                            <Text style={styles.medTime}>Horário: {med.horarioPrevisto}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(med.status) }]}>
                                            <Text style={[styles.statusBadgeText, { color: getStatusColor(med.status) }]}>
                                                {getStatusLabel(med.status)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.medDetails}>
                                        <Text style={styles.medDetailText}><Text style={{ fontWeight: '600' }}>Dosagem:</Text> {med.dosagem}</Text>
                                        <Text style={styles.medDetailText}><Text style={{ fontWeight: '600' }}>Via:</Text> {med.via}</Text>
                                    </View>
                                    {med.observacoes && (
                                        <Text style={styles.medObs}><Text style={{ fontWeight: '600' }}>Obs:</Text> {med.observacoes}</Text>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {secaoAtiva === 'atividades' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Atividades de Hoje</Text>
                        {loadingSecoes ? (
                            <ActivityIndicator size="small" color="#202c4b" style={{ marginVertical: 20 }} />
                        ) : atividades.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
                                <Text style={styles.emptyStateText}>Nenhuma atividade agendada para hoje.</Text>
                            </View>
                        ) : (
                            atividades.map(act => {
                                const tipo = TIPO_CONFIG[act.tipo] || { label: act.tipo, icon: 'ellipse', cor: '#202c4b', bg: '#EEF2FF' };
                                const status = STATUS_CONFIG[act.status] || { label: act.status, cor: '#202c4b', bg: '#EEF2FF', dot: '#202c4b' };
                                return (
                                    <View key={act.id} style={styles.actCard}>
                                        <View style={[styles.actIconContainer, { backgroundColor: tipo.bg }]}>
                                            <Ionicons name={tipo.icon as any} size={20} color={tipo.cor} />
                                        </View>
                                        <View style={styles.actInfo}>
                                            <Text style={styles.actTitle}>{act.titulo}</Text>
                                            <Text style={styles.actTime}>{act.horario}{act.responsavel ? ` • Resp: ${act.responsavel}` : ''}</Text>
                                        </View>
                                        <View style={[styles.actStatus, { backgroundColor: status.bg }]}>
                                            <Text style={[styles.actStatusText, { color: status.cor }]}>{status.label}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomTabBar
                activeTab={activeTab}
                onTabPress={(tab) => { onBack(); onNavigateTab?.(tab); }}
                tabs={[
                    { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
                    { key: 'elderly', label: 'Idosos', activeIcon: 'people', inactiveIcon: 'people-outline' },
                    { key: 'agenda', label: 'Agenda', activeIcon: 'calendar', inactiveIcon: 'calendar-outline' },
                    { key: 'reports', label: 'Relatórios', activeIcon: 'bar-chart', inactiveIcon: 'bar-chart-outline' },
                    { key: 'profile', label: 'Perfil', activeIcon: 'person', inactiveIcon: 'person-outline' },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { backgroundColor: '#202c4b', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    content: { flex: 1 },
    avatarSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#202c4b', width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    nomePrincipal: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 12 },
    idadeSub: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
    uploadingText: { marginTop: 10, color: '#202c4b', fontWeight: '600' },
    
    // Abas/Segmented Control
    tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 6, marginHorizontal: 20, marginTop: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
    tabButtonActive: { backgroundColor: '#202c4b' },
    tabButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    tabButtonTextActive: { color: '#FFFFFF' },

    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5 },
    cardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    cardText: { marginLeft: 15 },
    label: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
    value: { fontSize: 15, color: '#1F2937', fontWeight: '600', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

    // Medicamentos integrados
    medCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    medNome: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    medTime: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    medDetails: { flexDirection: 'row', gap: 16, marginTop: 4 },
    medDetailText: { fontSize: 13, color: '#4B5563' },
    medObs: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 8, backgroundColor: '#F8FAFC', padding: 6, borderRadius: 6 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusBadgeText: { fontSize: 11, fontWeight: '700' },

    // Atividades integradas
    actCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    actIconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    actInfo: { flex: 1 },
    actTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
    actTime: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    actStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    actStatusText: { fontSize: 11, fontWeight: '600' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    emptyStateText: { fontSize: 13, color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
});

