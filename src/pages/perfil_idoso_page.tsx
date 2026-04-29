import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert, Image,
    Dimensions, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    buscarIdosoPorId,
    Idoso,
    uploadFotoIdoso,
    getFotoUri
} from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export const PerfilIdosoPage: React.FC<{ idosoId: number, token?: string, onBack: () => void }> = ({ idosoId, token, onBack }) => {
    const [idoso, setIdoso] = useState<Idoso | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imagemLocal, setImagemLocal] = useState<string | null>(null);

    useEffect(() => {
        carregarIdoso();
    }, [idosoId]);

    const carregarIdoso = async () => {
        try {
            setLoading(true);
            const data = await buscarIdosoPorId(idosoId, token);
            setIdoso(data);
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Não foi possível carregar os dados do residente.');
        } finally {
            setLoading(false);
        }
    };

    const selecionarImagem = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão negada', 'Precisamos de acesso às fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImagemLocal(uri);
            Alert.alert('Salvar Foto', 'Deseja definir esta imagem como foto de perfil?', [
                { text: 'Cancelar', onPress: () => setImagemLocal(null), style: 'cancel' },
                { text: 'Salvar', onPress: () => fazerUpload(uri) }
            ]);
        }
    };

    const fazerUpload = async (uri: string) => {
        try {
            setUploading(true);
            await uploadFotoIdoso(idosoId, uri, token);
            await carregarIdoso(); // Recarrega para exibir a foto vinda do servidor
            setImagemLocal(null);
            Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
        } catch (err) {
            Alert.alert('Erro', 'Falha ao enviar foto para o servidor.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8297D9" />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    if (!idoso) {
        return (
            <View style={styles.centered}>
                <Text>Residente não encontrado.</Text>
                <TouchableOpacity onPress={onBack} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const uriFinal = imagemLocal || getFotoUri(idoso.fotoUrl);

    console.log('fotoUrl:', idoso.fotoUrl);
    console.log('uriFinal:', uriFinal);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header com estilo moderno */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil do Idoso</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Card Principal */}
                <View style={styles.mainCard}>
                    <View style={styles.avatarWrapper}>
                        <TouchableOpacity onPress={selecionarImagem} style={styles.avatarContainer}>
                            {uriFinal ? (
                                <Image source={{ uri: uriFinal }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={50} color="#8297D9" />
                                </View>
                            )}
                            {uploading && (
                                <View style={styles.uploadOverlay}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                        
                        {/* Badge de Status flutuante */}
                        <View style={[styles.statusBadge, idoso.status === 'ativo' ? styles.bgAtivo : styles.bgInativo]}>
                            <View style={[styles.statusDot, idoso.status === 'ativo' ? styles.dotAtivo : styles.dotInativo]} />
                            <Text style={styles.statusText}>{idoso.status === 'ativo' ? 'Ativo' : 'Inativo'}</Text>
                        </View>
                    </View>

                    <Text style={styles.nomeIdoso}>{idoso.nome}</Text>
                    <Text style={styles.subInfo}>{idoso.idade} anos • {idoso.quarto || 'Sem Quarto'}</Text>

                    {/* Grid de Informações Rápidas */}
                    <View style={styles.infoGrid}>
                        <View style={styles.gridItem}>
                            <Ionicons name="water" size={18} color="#8297D9" />
                            <Text style={styles.gridLabel}>Tipo Sanguíneo</Text>
                            <Text style={styles.gridValue}>N/A</Text>
                        </View>
                        <View style={styles.gridDivider} />
                        <View style={styles.gridItem}>
                            <Ionicons name="calendar" size={18} color="#8297D9" />
                            <Text style={styles.gridLabel}>Nascimento</Text>
                            <Text style={styles.gridValue}>{idoso.dataNascimento ? new Date(idoso.dataNascimento).toLocaleDateString('pt-BR') : 'N/A'}</Text>
                        </View>
                        <View style={styles.gridDivider} />
                        <View style={styles.gridItem}>
                            <Ionicons name="bed" size={18} color="#8297D9" />
                            <Text style={styles.gridLabel}>Quarto</Text>
                            <Text style={styles.gridValue}>{idoso.quarto || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Seção Dados Médicos */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="medical" size={16} color="#FFF" />
                        </View>
                        <Text style={styles.sectionTitle}>Dados Médicos</Text>
                        <Ionicons name="chevron-up" size={20} color="#CBD5E0" />
                    </View>

                    <View style={styles.medicalContent}>
                        <View style={styles.medicalRow}>
                            <Ionicons name="pulse-outline" size={16} color="#8297D9" />
                            <Text style={styles.medicalLabel}>Condição:</Text>
                            <Text style={styles.medicalValue}>{idoso.estadoSaude || 'Estável'}</Text>
                        </View>
                        <View style={styles.medicalRow}>
                            <Ionicons name="alert-circle-outline" size={16} color="#8297D9" />
                            <Text style={styles.medicalLabel}>Observações:</Text>
                        </View>
                        <Text style={styles.obsText}>{idoso.observacoes || 'Nenhuma alergia ou observação registrada.'}</Text>
                    </View>
                </View>

                {/* Botão de Emergência */}
                <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.8}>
                    <Ionicons name="warning" size={20} color="#FFF" />
                    <Text style={styles.emergencyButtonText}>Registrar Ocorrência</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F6FF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#6B7280' },
    header: { backgroundColor: '#8297D9', height: 110, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', color: '#FFF', fontSize: 19, fontWeight: '700' },
    scroll: { flex: 1, marginTop: -25 },
    mainCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    avatarWrapper: { marginBottom: 15 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF', overflow: 'hidden' },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    statusBadge: { position: 'absolute', bottom: 0, right: -5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, borderWidth: 2, borderColor: '#FFF' },
    bgAtivo: { backgroundColor: '#E6FFFA' },
    bgInativo: { backgroundColor: '#FFF5F5' },
    statusDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 5 },
    dotAtivo: { backgroundColor: '#38B2AC' },
    dotInativo: { backgroundColor: '#F56565' },
    statusText: { fontSize: 11, fontWeight: '700', color: '#2D3748' },
    nomeIdoso: { fontSize: 22, fontWeight: '800', color: '#2D3748', marginTop: 10 },
    subInfo: { fontSize: 14, color: '#A0AEC0', marginBottom: 15 },
    infoGrid: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 20, padding: 15, width: '100%' },
    gridItem: { flex: 1, alignItems: 'center' },
    gridDivider: { width: 1, height: '70%', backgroundColor: '#E2E8F0', alignSelf: 'center' },
    gridLabel: { fontSize: 10, color: '#A0AEC0', marginTop: 4 },
    gridValue: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
    sectionCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 20, elevation: 2 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF8A8A', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#2D3748' },
    medicalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    medicalLabel: { fontSize: 13, color: '#718096', marginLeft: 8, fontWeight: '600' },
    medicalValue: { fontSize: 13, color: '#2D3748', marginLeft: 5, fontWeight: '700' },
    obsText: { fontSize: 13, color: '#718096', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
    emergencyButton: { backgroundColor: '#EF4444', marginHorizontal: 20, marginTop: 25, height: 55, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 4 },
    emergencyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    retryButton: { marginTop: 15, padding: 10, backgroundColor: '#8297D9', borderRadius: 8 },
    retryButtonText: { color: '#FFF' },
});
