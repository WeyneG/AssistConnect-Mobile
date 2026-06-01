import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert, Image,
    Dimensions, SafeAreaView, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    buscarIdosoPorId,
    Idoso,
    uploadFotoIdoso,
    getFotoUri,
    buscarMedicamentos,
    buscarAtividades,
    Medicamento,
    Atividade,
    atualizarIdoso,
    criarMedicamento,
    atualizarMedicamento,
    deletarMedicamento,
    criarAtividade,
    atualizarAtividade,
    deletarAtividade,
    StatusMedicamento,
    TipoAtividade,
    StatusAtividade,
    buscarUsuarios,
    UsuarioResponse,
} from '../services/api';
import * as ImagePicker from 'expo-image-picker';

type SecaoAtiva = 'ficha' | 'medicamentos' | 'atividades';

export const PerfilIdosoPage: React.FC<{ idosoId: number, token?: string, userRole?: string, onBack: () => void, initialSection?: SecaoAtiva }> = ({ idosoId, token, userRole, onBack, initialSection = 'ficha' }) => {
    const isAllowedToEdit = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'funcionario';
    const [idoso, setIdoso] = useState<Idoso | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imagemLocal, setImagemLocal] = useState<string | null>(null);

    const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);

    useEffect(() => {
        const carregarUsuarios = async () => {
            try {
                const data = await buscarUsuarios(token);
                setUsuarios(data || []);
            } catch (err) {
                console.warn('[PerfilIdoso] Erro ao buscar usuários:', err);
            }
        };
        carregarUsuarios();
    }, [token]);

    // Estados integrados
    const [secaoAtiva, setSecaoAtiva] = useState<SecaoAtiva>(initialSection);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [loadingSecoes, setLoadingSecoes] = useState(false);

    // Modais e formulários de Edição
    // 1. Ficha
    const [modalFichaVisible, setModalFichaVisible] = useState(false);
    const [editNome, setEditNome] = useState('');
    const [editQuarto, setEditQuarto] = useState('');
    const [editEstadoSaude, setEditEstadoSaude] = useState('ESTAVEL');
    const [editObservacoes, setEditObservacoes] = useState('');
    const [editDataNascimento, setEditDataNascimento] = useState('');
    const [editResponsavelNome, setEditResponsavelNome] = useState('');
    const [editResponsavelId, setEditResponsavelId] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // 2. Medicamento
    const [modalMedVisible, setModalMedVisible] = useState(false);
    const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
    const [medNome, setMedNome] = useState('');
    const [medDosagem, setMedDosagem] = useState('');
    const [medVia, setMedVia] = useState('');
    const [medHorario, setMedHorario] = useState('08:00');
    const [medStatus, setMedStatus] = useState<StatusMedicamento>('pendente');
    const [medObservacoes, setMedObservacoes] = useState('');

    // 3. Atividade
    const [modalActVisible, setModalActVisible] = useState(false);
    const [selectedActId, setSelectedActId] = useState<number | null>(null);
    const [actTitulo, setActTitulo] = useState('');
    const [actData, setActData] = useState(new Date().toISOString().split('T')[0]);
    const [actHorarioInicio, setActHorarioInicio] = useState('09:00:00');
    const [actHorarioFim, setActHorarioFim] = useState('10:00:00');
    const [actTipo, setActTipo] = useState<TipoAtividade>('lazer');
    const [actStatus, setActStatus] = useState<StatusAtividade>('pendente');
    const [actResponsavelId, setActResponsavelId] = useState('2');
    const [actObservacoes, setActObservacoes] = useState('');

    // Sincronizar aba se fornecida
    useEffect(() => {
        if (initialSection) {
            setSecaoAtiva(initialSection);
        }
    }, [initialSection, idosoId]);

    useEffect(() => {
        carregarIdoso();
    }, [idosoId]);

    useEffect(() => {
        if (secaoAtiva === 'medicamentos') {
            carregarMedicamentos();
        } else if (secaoAtiva === 'atividades') {
            carregarAtividades();
        }
    }, [secaoAtiva, idosoId]);

    const carregarIdoso = async () => {
        try {
            setLoading(true);
            const data = await buscarIdosoPorId(idosoId, token);
            setIdoso(data);
            
            // Inicializar estados de edição
            setEditNome(data.nome);
            setEditQuarto(data.quarto || '');
            setEditEstadoSaude(data.estadoSaude || 'ESTAVEL');
            setEditObservacoes(data.observacoes || '');
            setEditDataNascimento(data.dataNascimento ? data.dataNascimento.split('T')[0] : '');
            setEditResponsavelNome(data.responsavelNome || '');
            setEditResponsavelId(data.responsavelId ? String(data.responsavelId) : '1');
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Não foi possível carregar os dados do residente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFicha = async () => {
        try {
            if (!editNome.trim()) {
                Alert.alert('Erro', 'O nome é obrigatório.');
                return;
            }
            if (!editDataNascimento.trim()) {
                Alert.alert('Erro', 'A data de nascimento é obrigatória.');
                return;
            }
            setLoading(true);
            const payload = {
                nome: editNome,
                dataNascimento: editDataNascimento,
                sexo: idoso?.sexo || 'M',
                estadoSaude: editEstadoSaude,
                observacoes: editObservacoes,
                quarto: editQuarto,
                responsavelId: parseInt(editResponsavelId) || idoso?.responsavelId || 1,
                responsavelNome: editResponsavelNome
            };
            await atualizarIdoso(idosoId, payload, token);
            setModalFichaVisible(false);
            Alert.alert('Sucesso', 'Ficha atualizada com sucesso!');
            await carregarIdoso();
        } catch (err) {
            Alert.alert('Erro', 'Falha ao atualizar dados do residente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMedicamento = async () => {
        try {
            if (!medNome.trim() || !medDosagem.trim() || !medVia.trim()) {
                Alert.alert('Erro', 'Preencha nome, dosagem e via de administração.');
                return;
            }
            setLoadingSecoes(true);
            const payload = {
                nome: medNome,
                dosagem: medDosagem,
                via: medVia,
                horarioPrevisto: medHorario,
                status: medStatus,
                observacoes: medObservacoes || undefined,
                residenteId: idosoId
            };

            if (selectedMedId !== null) {
                await atualizarMedicamento(selectedMedId, payload, token);
                Alert.alert('Sucesso', 'Medicamento atualizado!');
            } else {
                await criarMedicamento(payload, token);
                Alert.alert('Sucesso', 'Medicamento adicionado!');
            }
            setModalMedVisible(false);
            // Reset form
            setSelectedMedId(null);
            setMedNome('');
            setMedDosagem('');
            setMedVia('');
            setMedHorario('08:00');
            setMedStatus('pendente');
            setMedObservacoes('');
            await carregarMedicamentos();
        } catch (err) {
            Alert.alert('Erro', 'Falha ao salvar medicamento.');
        } finally {
            setLoadingSecoes(false);
        }
    };

    const handleDeleteMedicamento = async (id: number) => {
        Alert.alert('Excluir Medicamento', 'Deseja realmente remover este medicamento?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoadingSecoes(true);
                        await deletarMedicamento(id, token);
                        Alert.alert('Sucesso', 'Medicamento removido.');
                        await carregarMedicamentos();
                    } catch (err) {
                        Alert.alert('Erro', 'Falha ao remover medicamento.');
                    } finally {
                        setLoadingSecoes(false);
                    }
                }
            }
        ]);
    };

    const openEditMedicamento = (med: Medicamento) => {
        setSelectedMedId(med.id);
        setMedNome(med.nome);
        setMedDosagem(med.dosagem);
        setMedVia(med.via);
        setMedHorario(med.horarioPrevisto);
        setMedStatus(med.status);
        setMedObservacoes(med.observacoes || '');
        setModalMedVisible(true);
    };

    const openAddMedicamento = () => {
        setSelectedMedId(null);
        setMedNome('');
        setMedDosagem('');
        setMedVia('');
        setMedHorario('08:00');
        setMedStatus('pendente');
        setMedObservacoes('');
        setModalMedVisible(true);
    };

    const handleSaveAtividade = async () => {
        try {
            if (!actTitulo.trim() || !actHorarioInicio.trim() || !actHorarioFim.trim()) {
                Alert.alert('Erro', 'Preencha o título e os horários.');
                return;
            }
            setLoadingSecoes(true);
            const payload = {
                nome: actTitulo,
                data: actData,
                horario_inicio: actHorarioInicio,
                horario_fim: actHorarioFim,
                observacoes: actObservacoes,
                responsavelId: parseInt(actResponsavelId) || 2
            };

            if (selectedActId !== null) {
                await atualizarAtividade(selectedActId, payload, token);
                Alert.alert('Sucesso', 'Atividade atualizada!');
            } else {
                await criarAtividade(payload, idosoId, token);
                Alert.alert('Sucesso', 'Atividade agendada!');
            }
            setModalActVisible(false);
            // Reset form
            setSelectedActId(null);
            setActTitulo('');
            setActData(new Date().toISOString().split('T')[0]);
            setActHorarioInicio('09:00:00');
            setActHorarioFim('10:00:00');
            setActTipo('lazer');
            setActStatus('pendente');
            setActResponsavelId('2');
            setActObservacoes('');
            await carregarAtividades();
        } catch (err) {
            Alert.alert('Erro', 'Falha ao salvar atividade.');
        } finally {
            setLoadingSecoes(false);
        }
    };

    const handleDeleteAtividade = async (id: number) => {
        Alert.alert('Excluir Atividade', 'Deseja realmente remover esta atividade?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoadingSecoes(true);
                        await deletarAtividade(id, token);
                        Alert.alert('Sucesso', 'Atividade removida.');
                        await carregarAtividades();
                    } catch (err) {
                        Alert.alert('Erro', 'Falha ao remover atividade.');
                    } finally {
                        setLoadingSecoes(false);
                    }
                }
            }
        ]);
    };

    const openEditAtividade = (act: Atividade) => {
        setSelectedActId(act.id);
        setActTitulo(act.titulo);
        setActData(new Date().toISOString().split('T')[0]);
        setActHorarioInicio(act.horario ? `${act.horario}:00` : '09:00:00');
        setActHorarioFim(act.horario ? `${parseInt(act.horario.split(':')[0]) + 1}:00:00` : '10:00:00');
        setActTipo(act.tipo);
        setActStatus(act.status);
        setActResponsavelId('2');
        setActObservacoes('');
        setModalActVisible(true);
    };

    const openAddAtividade = () => {
        setSelectedActId(null);
        setActTitulo('');
        setActData(new Date().toISOString().split('T')[0]);
        setActHorarioInicio('09:00:00');
        setActHorarioFim('10:00:00');
        setActTipo('lazer');
        setActStatus('pendente');
        setActResponsavelId('2');
        setActObservacoes('');
        setModalActVisible(true);
    };

    const carregarMedicamentos = async () => {
        try {
            setLoadingSecoes(true);
            const dataHoje = new Date().toISOString().split('T')[0];
            const meds = await buscarMedicamentos(dataHoje, idosoId, token);
            setMedicamentos(meds);
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível carregar os medicamentos.');
        } finally {
            setLoadingSecoes(false);
        }
    };

    const carregarAtividades = async () => {
        try {
            setLoadingSecoes(true);
            const acts = await buscarAtividades({ idosoId }, token);
            
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            
            const hojeActs = acts.filter(a => {
                if (!a.data) return false;
                const aDataStr = a.data.split('T')[0];
                return aDataStr === todayStr;
            });
            
            setAtividades(hojeActs);
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível carregar as atividades.');
        } finally {
            setLoadingSecoes(false);
        }
    };

    const selecionarImagem = async () => {
        if (!isAllowedToEdit) {
            Alert.alert('Acesso Negado', 'Apenas administradores e cuidadores podem alterar a foto de perfil.');
            return;
        }

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
                <ActivityIndicator size="large" color="#202c4b" />
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
                                    <Ionicons name="person" size={50} color="#202c4b" />
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
                            <Ionicons name="calendar" size={18} color="#202c4b" />
                            <Text style={styles.gridLabel}>Nascimento</Text>
                            <Text style={styles.gridValue}>{idoso.dataNascimento ? new Date(idoso.dataNascimento).toLocaleDateString('pt-BR') : 'N/A'}</Text>
                        </View>
                        <View style={styles.gridDivider} />
                        <View style={styles.gridItem}>
                            <Ionicons name="bed" size={18} color="#202c4b" />
                            <Text style={styles.gridLabel}>Quarto</Text>
                            <Text style={styles.gridValue}>{idoso.quarto || 'N/A'}</Text>
                        </View>
                    </View>
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
                        {/* Seção Dados Médicos */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="medical" size={16} color="#FFF" />
                                </View>
                                <Text style={styles.sectionTitle}>Dados Médicos</Text>
                            </View>

                            <View style={styles.medicalContent}>
                                <View style={styles.medicalRow}>
                                    <Ionicons name="pulse-outline" size={16} color="#202c4b" />
                                    <Text style={styles.medicalLabel}>Condição:</Text>
                                    <Text style={styles.medicalValue}>{idoso.estadoSaude || 'Estável'}</Text>
                                </View>
                                <View style={styles.medicalRow}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#202c4b" />
                                    <Text style={styles.medicalLabel}>Observações:</Text>
                                </View>
                                <Text style={styles.obsText}>{idoso.observacoes || 'Nenhuma alergia ou observação registrada.'}</Text>
                            </View>
                        </View>

                        {/* Seção Contato de Emergência */}
                        <View style={[styles.sectionCard, { marginTop: 14 }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
                                    <Ionicons name="call" size={16} color="#FFF" />
                                </View>
                                <Text style={styles.sectionTitle}>Contato de Emergência</Text>
                            </View>

                            <View style={styles.medicalContent}>
                                <View style={styles.medicalRow}>
                                    <Ionicons name="person-outline" size={16} color="#202c4b" />
                                    <Text style={styles.medicalLabel}>Responsável:</Text>
                                    <Text style={styles.medicalValue}>{idoso.responsavelNome || 'Não cadastrado'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Botão de Edição para Admins e Cuidadores */}
                        {isAllowedToEdit && (
                            <TouchableOpacity 
                                style={[styles.emergencyButton, { backgroundColor: '#202c4b', marginTop: 16 }]} 
                                onPress={() => setModalFichaVisible(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="create-outline" size={20} color="#FFF" />
                                <Text style={styles.emergencyButtonText}>Editar Ficha Médica</Text>
                            </TouchableOpacity>
                        )}

                        {/* Botão de Emergência */}
                        {isAllowedToEdit && (
                            <TouchableOpacity style={[styles.emergencyButton, { marginTop: 12 }]} activeOpacity={0.8}>
                                <Ionicons name="warning" size={20} color="#FFF" />
                                <Text style={styles.emergencyButtonText}>Registrar Ocorrência</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {secaoAtiva === 'medicamentos' && (
                    <View style={styles.sectionCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Medicamentos de Hoje</Text>
                            {isAllowedToEdit && (
                                <TouchableOpacity style={styles.addButtonInline} onPress={openAddMedicamento}>
                                    <Ionicons name="add" size={16} color="#202c4b" />
                                    <Text style={styles.addButtonInlineText}>Adicionar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
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
                                        <View style={[styles.statusBadgeInline, { backgroundColor: getStatusBgColor(med.status) }]}>
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
                                    {isAllowedToEdit && (
                                        <View style={[styles.actionRowInline, { borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 8, marginTop: 8 }]}>
                                            <TouchableOpacity style={styles.actionBtnInline} onPress={() => openEditMedicamento(med)}>
                                                <Ionicons name="create-outline" size={15} color="#6366F1" />
                                                <Text style={[styles.actionBtnInlineText, { color: '#6366F1' }]}>Editar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionBtnInline} onPress={() => handleDeleteMedicamento(med.id)}>
                                                <Ionicons name="trash-outline" size={15} color="#EF4444" />
                                                <Text style={[styles.actionBtnInlineText, { color: '#EF4444' }]}>Remover</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {secaoAtiva === 'atividades' && (
                    <View style={styles.sectionCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Atividades de Hoje</Text>
                        </View>
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
                                    <View key={act.id} style={[styles.actCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal de Edição de Ficha */}
            <Modal visible={modalFichaVisible} transparent animationType="slide" onRequestClose={() => setModalFichaVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalFichaVisible(false)} />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Editar Ficha Médica</Text>
                        <TouchableOpacity onPress={() => setModalFichaVisible(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                        <Text style={styles.filterLabel}>Nome do Residente</Text>
                        <TextInput style={styles.modalInput} value={editNome} onChangeText={setEditNome} placeholder="Nome completo" />

                        <Text style={styles.filterLabel}>Data de Nascimento (AAAA-MM-DD)</Text>
                        <TextInput style={styles.modalInput} value={editDataNascimento} onChangeText={setEditDataNascimento} placeholder="Ex: 1950-05-15" />

                        <Text style={styles.filterLabel}>Quarto</Text>
                        <TextInput style={styles.modalInput} value={editQuarto} onChangeText={setEditQuarto} placeholder="Ex: Quarto 12" />

                        <Text style={styles.filterLabel}>Condição de Saúde</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                            {['ESTAVEL', 'OBSERVACAO', 'GRAVE'].map(statusVal => (
                                <TouchableOpacity 
                                    key={statusVal} 
                                    style={[
                                        styles.statusSelectBtn, 
                                        editEstadoSaude === statusVal && { backgroundColor: '#202c4b' }
                                    ]}
                                    onPress={() => setEditEstadoSaude(statusVal)}
                                >
                                    <Text style={[styles.statusSelectText, editEstadoSaude === statusVal && { color: '#FFF' }]}>
                                        {statusVal === 'ESTAVEL' ? 'Estável' : statusVal === 'OBSERVACAO' ? 'Observação' : 'Grave'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterLabel}>Observações e Alergias</Text>
                        <TextInput 
                            style={[styles.modalInput, { minHeight: 90, textAlignVertical: 'top' }]} 
                            value={editObservacoes} 
                            onChangeText={setEditObservacoes} 
                            placeholder="Alergias, restrições médicas..." 
                            multiline 
                        />

                        <Text style={styles.filterLabel}>Funcionário Responsável <Text style={{ color: '#EF4444' }}>*</Text></Text>
                        <TouchableOpacity 
                            style={styles.dropdownBox} 
                            onPress={() => setDropdownVisible(!dropdownVisible)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.dropdownBoxText}>
                                {editResponsavelNome || 'Selecione o funcionário responsável'}
                            </Text>
                            <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
                        </TouchableOpacity>

                        {dropdownVisible && (
                            <View style={styles.dropdownListContainer}>
                                <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                                    {usuarios
                                        .filter(u => (u.role || '').toLowerCase() === 'funcionario')
                                        .map(u => {
                                            const selecionado = String(editResponsavelId) === String(u.id);
                                            return (
                                                <TouchableOpacity
                                                    key={String(u.id)}
                                                    style={[
                                                        styles.dropdownItem,
                                                        selecionado && styles.dropdownItemActive
                                                    ]}
                                                    onPress={() => {
                                                        setEditResponsavelId(String(u.id));
                                                        setEditResponsavelNome(u.name || u.nome || '');
                                                        setDropdownVisible(false);
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.dropdownItemText, 
                                                        selecionado && styles.dropdownItemTextActive
                                                    ]}>
                                                        {u.name || u.nome || 'Sem nome'}
                                                    </Text>
                                                    {selecionado && (
                                                        <Ionicons name="checkmark" size={18} color="#202c4b" />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                </ScrollView>
                            </View>
                        )}

                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveFicha}>
                            <Text style={styles.modalSaveText}>Salvar Alterações</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Modal de Medicamento */}
            <Modal visible={modalMedVisible} transparent animationType="slide" onRequestClose={() => setModalMedVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalMedVisible(false)} />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{selectedMedId ? 'Editar Medicamento' : 'Novo Medicamento'}</Text>
                        <TouchableOpacity onPress={() => setModalMedVisible(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                        <Text style={styles.filterLabel}>Nome do Remédio</Text>
                        <TextInput style={styles.modalInput} value={medNome} onChangeText={setMedNome} placeholder="Ex: Losartana" />

                        <Text style={styles.filterLabel}>Dosagem</Text>
                        <TextInput style={styles.modalInput} value={medDosagem} onChangeText={setMedDosagem} placeholder="Ex: 50mg" />

                        <Text style={styles.filterLabel}>Via de Administração</Text>
                        <TextInput style={styles.modalInput} value={medVia} onChangeText={setMedVia} placeholder="Ex: Oral, Subcutânea" />

                        <Text style={styles.filterLabel}>Horário Previsto</Text>
                        <TextInput style={styles.modalInput} value={medHorario} onChangeText={setMedHorario} placeholder="Ex: 08:00" />

                        {selectedMedId !== null && (
                            <>
                                <Text style={styles.filterLabel}>Status</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                                    {['pendente', 'administrado', 'atrasado'].map(st => (
                                        <TouchableOpacity 
                                            key={st} 
                                            style={[styles.statusSelectBtn, medStatus === st && { backgroundColor: '#202c4b' }]}
                                            onPress={() => setMedStatus(st as any)}
                                        >
                                            <Text style={[styles.statusSelectText, medStatus === st && { color: '#FFF' }]}>
                                                {st.charAt(0).toUpperCase() + st.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <Text style={styles.filterLabel}>Observações</Text>
                        <TextInput style={styles.modalInput} value={medObservacoes} onChangeText={setMedObservacoes} placeholder="Ex: Tomar em jejum" />

                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveMedicamento}>
                            <Text style={styles.modalSaveText}>{selectedMedId ? 'Salvar Alterações' : 'Adicionar Medicamento'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Modal de Atividade */}
            <Modal visible={modalActVisible} transparent animationType="slide" onRequestClose={() => setModalActVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalActVisible(false)} />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{selectedActId ? 'Editar Atividade' : 'Agendar Atividade'}</Text>
                        <TouchableOpacity onPress={() => setModalActVisible(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                        <Text style={styles.filterLabel}>Título da Atividade</Text>
                        <TextInput style={styles.modalInput} value={actTitulo} onChangeText={setActTitulo} placeholder="Ex: Fisioterapia Motora" />

                        <Text style={styles.filterLabel}>Data (AAAA-MM-DD)</Text>
                        <TextInput style={styles.modalInput} value={actData} onChangeText={setActData} placeholder="Ex: 2026-05-27" />

                        <Text style={styles.filterLabel}>Horário Início (HH:MM:SS)</Text>
                        <TextInput style={styles.modalInput} value={actHorarioInicio} onChangeText={setActHorarioInicio} placeholder="Ex: 09:00:00" />

                        <Text style={styles.filterLabel}>Horário Fim (HH:MM:SS)</Text>
                        <TextInput style={styles.modalInput} value={actHorarioFim} onChangeText={setActHorarioFim} placeholder="Ex: 10:00:00" />

                        <Text style={styles.filterLabel}>Responsável (ID do Cuidador)</Text>
                        <TextInput style={styles.modalInput} value={actResponsavelId} onChangeText={setActResponsavelId} placeholder="Ex: 2 (Juliana Costa)" keyboardType="numeric" />

                        <Text style={styles.filterLabel}>Observações</Text>
                        <TextInput style={styles.modalInput} value={actObservacoes} onChangeText={setActObservacoes} placeholder="Observações adicionais..." />

                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveAtividade}>
                            <Text style={styles.modalSaveText}>{selectedActId ? 'Salvar Alterações' : 'Agendar Atividade'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F6FF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#6B7280' },
    header: { backgroundColor: '#202c4b', height: 110, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
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
    medicalContent: { marginTop: 5 },
    medicalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    medicalLabel: { fontSize: 13, color: '#718096', marginLeft: 8, fontWeight: '600' },
    medicalValue: { fontSize: 13, color: '#2D3748', marginLeft: 5, fontWeight: '700' },
    obsText: { fontSize: 13, color: '#718096', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
    emergencyButton: { backgroundColor: '#EF4444', marginHorizontal: 20, marginTop: 25, height: 55, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 4 },
    emergencyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    retryButton: { marginTop: 15, padding: 10, backgroundColor: '#202c4b', borderRadius: 8 },
    retryButtonText: { color: '#FFF' },

    // Abas/Segmented Control
    tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 6, marginHorizontal: 20, marginTop: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
    tabButtonActive: { backgroundColor: '#202c4b' },
    tabButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    tabButtonTextActive: { color: '#FFFFFF' },

    // Medicamentos integrados
    medCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    medNome: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    medTime: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    medDetails: { flexDirection: 'row', gap: 16, marginTop: 4 },
    medDetailText: { fontSize: 13, color: '#4B5563' },
    medObs: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 8, backgroundColor: '#F8FAFC', padding: 6, borderRadius: 6 },
    statusBadgeInline: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
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

    // Novas Estilizações de Edição para Modais
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 36, maxHeight: '85%' },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 15 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    modalInput: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', paddingHorizontal: 12, fontSize: 14, color: '#1F2937', marginBottom: 14 },
    filterLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    statusSelectBtn: { flex: 1, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    statusSelectText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
    modalSaveBtn: { backgroundColor: '#202c4b', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15, elevation: 2 },
    modalSaveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    
    addButtonInline: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#202c4b' },
    addButtonInlineText: { fontSize: 11, fontWeight: '700', color: '#202c4b' },
    actionRowInline: { flexDirection: 'row', justifyContent: 'flex-end', gap: 14 },
    actionBtnInline: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
    actionBtnInlineText: { fontSize: 12, fontWeight: '600' },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
    filterChipActive: { backgroundColor: '#202c4b', borderColor: '#202c4b' },
    filterChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
    filterChipTextActive: { color: '#FFFFFF' },
    dropdownBox: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    dropdownBoxText: { fontSize: 14, color: '#1F2937' },
    dropdownListContainer: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    dropdownItemActive: { backgroundColor: '#EEF2FF' },
    dropdownItemText: { fontSize: 14, color: '#4B5563' },
    dropdownItemTextActive: { color: '#202c4b', fontWeight: '600' },
});
