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
import { buscarIdosoPorId, uploadFotoIdoso, getFotoUri, Idoso } from '../services/api';
import { BottomTabBar } from '../components/BottomTabBar';

interface ElderlyProfileProps {
    idosoId: number;
    token?: string;
    onBack: () => void;
    onNavigateTab?: (tab: string) => void;
    activeTab?: string;
}

export const ElderlyProfileScreen: React.FC<ElderlyProfileProps> = ({ idosoId, token, onBack, onNavigateTab, activeTab = 'elderly' }) => {
    const [idoso, setIdoso] = useState<Idoso | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        carregarDetalhes();
    }, [idosoId]);

    const carregarDetalhes = async () => {
        try {
            setLoading(true);
            const dados = await buscarIdosoPorId(idosoId, token);
            setIdoso(dados);
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
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
                <ActivityIndicator size="large" color="#8297D9" style={{ flex: 1 }} />
            </View>
        );
    }

    const fotoUri = previewImage || getFotoUri(idoso?.fotoUrl);

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
                                    <Ionicons name="person" size={50} color="#8297D9" />
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={18} color="#FFFFFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    {uploading && <Text style={styles.uploadingText}>Enviando...</Text>}
                    <Text style={styles.nomePrincipal}>{idoso?.nome}</Text>
                    <Text style={styles.idadeSub}>{idoso?.idade} anos</Text>
                </View>

                {/* Seção de Saúde - Sprint 03 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Saúde e Cuidados</Text>
                    <View style={styles.card}>
                        <View style={styles.cardItem}>
                            <Ionicons name="pulse" size={20} color="#8297D9" />
                            <View style={styles.cardText}>
                                <Text style={styles.label}>Estado de Saúde</Text>
                                <Text style={styles.value}>{idoso?.estadoSaude || 'Não informado'}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.cardItem}>
                            <Ionicons name="document-text" size={20} color="#8297D9" />
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
                            <Ionicons name="call" size={20} color="#8297D9" />
                            <View style={styles.cardText}>
                                <Text style={styles.label}>Responsável</Text>
                                <Text style={styles.value}>{idoso?.responsavelNome || 'Não cadastrado'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomTabBar activeTab="elderly" onTabPress={(tab) => { onBack(); onNavigateTab?.(tab); }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { backgroundColor: '#8297D9', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    content: { flex: 1 },
    avatarSection: { alignItems: 'center', paddingVertical: 30 },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8297D9', width: 32, height: 32, borderRadius: 16, borderWith: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    nomePrincipal: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 15 },
    idadeSub: { fontSize: 16, color: '#6B7280' },
    uploadingText: { marginTop: 10, color: '#8297D9', fontWeight: '600' },
    section: { paddingHorizontal: 20, marginTop: 25 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 10 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    cardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    cardText: { marginLeft: 15 },
    label: { fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase' },
    value: { fontSize: 15, color: '#1F2937', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
});
