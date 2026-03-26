import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarIdosoPorId, Idoso } from '../services/api';

interface PerfilIdosoPageProps {
    idosoId: number;
    onBack: () => void;
}

// Componente de seção colapsável
const Secao: React.FC<{
    titulo: string;
    icone: string;
    cor: string;
    children: React.ReactNode;
}> = ({ titulo, icone, cor, children }) => {
    const [aberta, setAberta] = useState(true);

    return (
        <View style={secaoStyles.container}>
            <TouchableOpacity
                style={secaoStyles.header}
                onPress={() => setAberta(!aberta)}
                activeOpacity={0.7}
            >
                <View style={[secaoStyles.iconContainer, { backgroundColor: cor + '20' }]}>
                    <Ionicons name={icone as any} size={20} color={cor} />
                </View>
                <Text style={secaoStyles.titulo}>{titulo}</Text>
                <Ionicons
                    name={aberta ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9CA3AF"
                />
            </TouchableOpacity>
            {aberta && <View style={secaoStyles.content}>{children}</View>}
        </View>
    );
};

const secaoStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titulo: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});

// Tag colorida para chips (condições, alergias, etc)
const Tag: React.FC<{ texto: string; cor: string; bgCor: string }> = ({ texto, cor, bgCor }) => (
    <View style={[tagStyles.container, { backgroundColor: bgCor }]}>
        <Text style={[tagStyles.texto, { color: cor }]}>{texto}</Text>
    </View>
);

const tagStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    texto: {
        fontSize: 13,
        fontWeight: '500',
    },
});

// Linha de informação
const InfoRow: React.FC<{ label: string; valor: string; icone?: string }> = ({ label, valor, icone }) => (
    <View style={infoStyles.row}>
        {icone && <Ionicons name={icone as any} size={16} color="#9CA3AF" style={infoStyles.icone} />}
        <View style={infoStyles.content}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={infoStyles.valor}>{valor}</Text>
        </View>
    </View>
);

const infoStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    icone: {
        marginRight: 10,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
        fontWeight: '500',
    },
    valor: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
});

export const PerfilIdosoPage: React.FC<PerfilIdosoPageProps> = ({ idosoId, onBack }) => {
    const [idoso, setIdoso] = useState<Idoso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        carregarIdoso();
    }, [idosoId]);

    const carregarIdoso = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await buscarIdosoPorId(idosoId);
            setIdoso(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarOcorrencia = () => {
        Alert.alert(
            'Registrar Ocorrência',
            `Registrar ocorrência para ${idoso?.nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => Alert.alert('Sucesso', 'Ocorrência registrada!') },
            ]
        );
    };

    const calcularIdade = (dataNascimento: string) => {
        const hoje = new Date();
        const nasc = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return idade;
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8297D9" />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    if (error || !idoso) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={64} color="#8297D9" />
                <Text style={styles.errorTitle}>Erro ao carregar</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={carregarIdoso}>
                    <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil do Idoso</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                {/* Card de Identidade */}
                <View style={styles.identidadeCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={48} color="#8297D9" />
                        </View>
                        <View style={[
                            styles.statusBadge,
                            idoso.status === 'ativo' ? styles.statusAtivo : styles.statusInativo
                        ]}>
                            <View style={[
                                styles.statusDot,
                                idoso.status === 'ativo' ? styles.statusDotAtivo : styles.statusDotInativo
                            ]} />
                            <Text style={[
                                styles.statusText,
                                idoso.status === 'ativo' ? styles.statusTextAtivo : styles.statusTextInativo
                            ]}>
                                {idoso.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.nomeIdoso}>{idoso.nome}</Text>
                    <Text style={styles.idadeIdoso}>
                        {calcularIdade(idoso.dataNascimento)} anos • {idoso.ala}, Quarto {idoso.quarto}
                    </Text>

                    <View style={styles.infoRapida}>
                        <View style={styles.infoRapidaItem}>
                            <Ionicons name="water" size={18} color="#8297D9" />
                            <Text style={styles.infoRapidaLabel}>Tipo Sanguíneo</Text>
                            <Text style={styles.infoRapidaValor}>{idoso.tipoSanguineo || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRapidaDivider} />
                        <View style={styles.infoRapidaItem}>
                            <Ionicons name="calendar" size={18} color="#8297D9" />
                            <Text style={styles.infoRapidaLabel}>Nascimento</Text>
                            <Text style={styles.infoRapidaValor}>{formatarData(idoso.dataNascimento)}</Text>
                        </View>
                        <View style={styles.infoRapidaDivider} />
                        <View style={styles.infoRapidaItem}>
                            <Ionicons name="bed" size={18} color="#8297D9" />
                            <Text style={styles.infoRapidaLabel}>Quarto</Text>
                            <Text style={styles.infoRapidaValor}>{idoso.quarto || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Seções */}
                <View style={styles.secoes}>

                    {/* Dados Médicos */}
                    <Secao titulo="Dados Médicos" icone="medkit" cor="#EF4444">
                        <InfoRow label="Tipo Sanguíneo" valor={idoso.tipoSanguineo || 'Não informado'} icone="water-outline" />
                        <View style={{ paddingTop: 12 }}>
                            <Text style={styles.tagLabel}>Condições</Text>
                            <View style={styles.tagRow}>
                                {idoso.condicoes && idoso.condicoes.length > 0
                                    ? idoso.condicoes.map((c, i) => <Tag key={i} texto={c} cor="#EF4444" bgCor="#FEE2E2" />)
                                    : <Text style={styles.semDados}>Nenhuma condição registrada</Text>
                                }
                            </View>
                        </View>
                        <View style={{ paddingTop: 8 }}>
                            <Text style={styles.tagLabel}>Alergias</Text>
                            <View style={styles.tagRow}>
                                {idoso.alergias && idoso.alergias.length > 0
                                    ? idoso.alergias.map((a, i) => <Tag key={i} texto={a} cor="#F59E0B" bgCor="#FEF3C7" />)
                                    : <Text style={styles.semDados}>Nenhuma alergia registrada</Text>
                                }
                            </View>
                        </View>
                    </Secao>

                    {/* Restrições Alimentares */}
                    <Secao titulo="Restrições Alimentares" icone="restaurant" cor="#10B981">
                        <View style={styles.tagRow}>
                            {idoso.restricoesAlimentares && idoso.restricoesAlimentares.length > 0
                                ? idoso.restricoesAlimentares.map((r, i) => <Tag key={i} texto={r} cor="#059669" bgCor="#ECFDF5" />)
                                : <Text style={styles.semDados}>Nenhuma restrição alimentar</Text>
                            }
                        </View>
                    </Secao>

                    {/* Contatos de Emergência */}
                    <Secao titulo="Contatos de Emergência" icone="call" cor="#8297D9">
                        {idoso.contatosEmergencia && idoso.contatosEmergencia.length > 0
                            ? idoso.contatosEmergencia.map((contato, i) => (
                                <View key={i} style={styles.contatoCard}>
                                    <View style={styles.contatoAvatar}>
                                        <Ionicons name="person" size={20} color="#8297D9" />
                                    </View>
                                    <View style={styles.contatoInfo}>
                                        <Text style={styles.contatoNome}>{contato.nome}</Text>
                                        <Text style={styles.contatoParentesco}>{contato.parentesco}</Text>
                                        <Text style={styles.contatoTelefone}>{contato.telefone}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.ligarButton}>
                                        <Ionicons name="call" size={18} color="#8297D9" />
                                    </TouchableOpacity>
                                </View>
                            ))
                            : <Text style={styles.semDados}>Nenhum contato registrado</Text>
                        }
                    </Secao>

                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Botão de Ação Rápida */}
            <View style={styles.acaoContainer}>
                <TouchableOpacity
                    style={styles.acaoButton}
                    onPress={handleRegistrarOcorrencia}
                    activeOpacity={0.8}
                >
                    <Ionicons name="warning" size={22} color="#FFFFFF" />
                    <Text style={styles.acaoButtonText}>Registrar Ocorrência</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#F8FAFC' },
    loadingText: { marginTop: 16, fontSize: 15, color: '#6B7280' },
    errorTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginTop: 16 },
    errorMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
    retryButton: { marginTop: 24, backgroundColor: '#8297D9', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    retryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    header: {
        backgroundColor: '#8297D9',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    scroll: { flex: 1 },
    identidadeCard: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: '#EEF2FF',
        alignItems: 'center', justifyContent: 'center',
    },
    statusBadge: {
        position: 'absolute', bottom: 0, right: -4,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 12, gap: 4,
        borderWidth: 2, borderColor: '#FFFFFF',
    },
    statusAtivo: { backgroundColor: '#ECFDF5' },
    statusInativo: { backgroundColor: '#FEF3C7' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusDotAtivo: { backgroundColor: '#10B981' },
    statusDotInativo: { backgroundColor: '#F59E0B' },
    statusText: { fontSize: 11, fontWeight: '600' },
    statusTextAtivo: { color: '#059669' },
    statusTextInativo: { color: '#D97706' },
    nomeIdoso: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 6, textAlign: 'center' },
    idadeIdoso: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
    infoRapida: {
        flexDirection: 'row', width: '100%',
        backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16,
    },
    infoRapidaItem: { flex: 1, alignItems: 'center', gap: 4 },
    infoRapidaDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
    infoRapidaLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
    infoRapidaValor: { fontSize: 14, color: '#1F2937', fontWeight: '700' },
    secoes: { paddingHorizontal: 20 },
    tagLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginBottom: 8 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
    semDados: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },
    contatoCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12,
    },
    contatoAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
    },
    contatoInfo: { flex: 1 },
    contatoNome: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
    contatoParentesco: { fontSize: 13, color: '#6B7280' },
    contatoTelefone: { fontSize: 13, color: '#8297D9', fontWeight: '500', marginTop: 2 },
    ligarButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
    },
    acaoContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: 32,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    acaoButton: {
        flexDirection: 'row', backgroundColor: '#EF4444',
        borderRadius: 12, height: 52,
        alignItems: 'center', justifyContent: 'center', gap: 10,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    acaoButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
