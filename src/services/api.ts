// Serviço de API unificado
const API_BASE_URL = 'http://192.168.10.158:8080/api';

export enum EstadoSaude {
    ATIVO = 'ATIVO',
    INATIVO = 'INATIVO',
}

export enum Sexo {
    MASCULINO = 'MASCULINO',
    FEMININO = 'FEMININO',
    OUTRO = 'OUTRO',
}

export interface IdosoResponse {
    id: number;
    nome: string;
    dataNascimento: string;
    sexo: Sexo | string;
    estadoSaude: EstadoSaude | string;
    observacoes?: string;
    responsavelId?: number;
    responsavelNome?: string;
    criadoEm: string;
    fotoUrl?: string;
    foto_url?: string; // Suporte para o nome vindo do banco (snake_case)
}

export interface Idoso extends IdosoResponse {
    idade: number;
    status: 'ativo' | 'inativo';
}

export interface ResumoIdosos {
    total: number;
    ativos: number;
    inativos: number;
}

const calcularIdade = (dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
};

const mapearStatus = (estadoSaude: string): 'ativo' | 'inativo' => {
    const estado = estadoSaude?.toUpperCase();
    return ['ESTAVEL', 'ATIVO', 'RECUPERANDO'].includes(estado) ? 'ativo' : 'inativo';
};

const mapearIdoso = (response: IdosoResponse): Idoso => {
    return {
        ...response,
        // 💡 CORREÇÃO AQUI: Garante que fotoUrl pegue o valor de foto_url caso venha do banco assim
        fotoUrl: response.fotoUrl || response.foto_url,
        idade: calcularIdade(response.dataNascimento),
        status: mapearStatus(response.estadoSaude),
    };
};

export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Falha no login');
    return await response.json();
};

export const buscarIdosos = async (token?: string): Promise<Idoso[]> => {
    // 🎭 DADOS MOCKADOS PARA DESENVOLVIMENTO
    await new Promise(resolve => setTimeout(resolve, 500));

    const idososMock: Idoso[] = [
        {
            id: 1,
            nome: 'Maria Silva',
            dataNascimento: '1950-03-15',
            sexo: 'FEMININO',
            estadoSaude: 'ATIVO',
            idade: 74,
            status: 'ativo',
            criadoEm: '2024-01-10T10:00:00'
        },
        {
            id: 2,
            nome: 'João Santos',
            dataNascimento: '1945-07-22',
            sexo: 'MASCULINO',
            estadoSaude: 'ATIVO',
            idade: 79,
            status: 'ativo',
            criadoEm: '2024-01-15T14:30:00'
        },
        {
            id: 3,
            nome: 'Ana Costa',
            dataNascimento: '1955-11-08',
            sexo: 'FEMININO',
            estadoSaude: 'ATIVO',
            idade: 69,
            status: 'ativo',
            criadoEm: '2024-02-01T09:15:00'
        }
    ];

    return idososMock;

    /* 🔧 CÓDIGO REAL DA API (comentado para desenvolvimento)
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/idosos`, { method: 'GET', headers });
    if (!response.ok) throw new Error('Erro ao buscar idosos');

    const data = await response.json();
    const idosos = Array.isArray(data) ? data : (data.content || []);
    return idosos.map(mapearIdoso);
    */
};

export const buscarIdosoPorId = async (id: number, token?: string): Promise<Idoso> => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/idosos/${id}`, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Erro ${response.status}: Idoso não encontrado`);
    const data = await response.json();
    return mapearIdoso(data);
};

export const buscarResumo = async (token?: string): Promise<ResumoIdosos> => {
    // 🎭 DADOS MOCKADOS PARA DESENVOLVIMENTO
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        total: 3,
        ativos: 3,
        inativos: 0
    };

    /* 🔧 CÓDIGO REAL DA API (comentado para desenvolvimento)
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/idosos/count`, { method: 'GET', headers });
    if (!response.ok) throw new Error('Erro ao buscar resumo');

    const data = await response.json();
    const total = typeof data === 'number' ? data : (data.total || data.totalElements || 0);
    return {
        total: total,
        ativos: data.ativos || Math.ceil(total * 0.8),
        inativos: data.inativos || Math.floor(total * 0.2),
    };
    */
};

export const uploadFotoIdoso = async (id: number, imageUri: string, token?: string): Promise<Idoso> => {
    try {
        const formData = new FormData();
        formData.append('photo', {
            uri: imageUri,
            name: `photo_${id}.jpg`,
            type: 'image/jpeg',
        } as any);

        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/idosos/${id}/photo`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Servidor retornou ${response.status}: ${errorMsg}`);
        }

        const data = await response.json();
        return mapearIdoso(data);
    } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
    }
};

// ─── Cardápio / Alimentação ───────────────────────────────────────────────────

export type TipoRefeicao = 'cafe' | 'almoco' | 'lanche' | 'jantar';
export type StatusRefeicao = 'servida' | 'pendente';

export interface ItemCardapio {
    id: number;
    data: string;                    // 'YYYY-MM-DD'
    tipo: TipoRefeicao;
    descricao: string;
    observacoes?: string;
    alimentos?: string[];
    restricoes?: string[];           // tags de restrição alimentar
    calorias?: number;
    status: StatusRefeicao;
}

export const buscarCardapio = async (data: string, token?: string): Promise<ItemCardapio[]> => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/cardapio?data=${data}`, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao buscar cardápio`);
    const data2 = await response.json();
    return Array.isArray(data2) ? data2 : (data2.content || []);
};

export const getFotoUri = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const base = API_BASE_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Adicionamos o timestamp para evitar cache no celular
    return `${base}/${cleanPath}?t=${new Date().getTime()}`;
};

// ─── Medicamentos ───────────────────────────────────────────────────

export type StatusMedicamento = 'pendente' | 'administrado' | 'atrasado';

export interface Medicamento {
    id: number;
    nome: string;
    dosagem: string;
    via: string;
    residenteId: number;
    residenteNome: string;
    horarioPrevisto: string;
    status: StatusMedicamento;
    observacoes?: string;
}

export const buscarMedicamentos = async (
    data: string,
    residenteId?: number | null,
    token?: string
): Promise<Medicamento[]> => {
    // 🎭 DADOS MOCKADOS PARA DESENVOLVIMENTO
    await new Promise(resolve => setTimeout(resolve, 800)); // Simula delay da API

    const medicamentosMock: Medicamento[] = [
        {
            id: 1,
            nome: 'Paracetamol',
            dosagem: '500mg',
            via: 'Oral',
            residenteId: 1,
            residenteNome: 'Maria Silva',
            horarioPrevisto: '08:00',
            status: 'administrado',
            observacoes: 'Tomar com água'
        },
        {
            id: 2,
            nome: 'Losartana',
            dosagem: '50mg',
            via: 'Oral',
            residenteId: 1,
            residenteNome: 'Maria Silva',
            horarioPrevisto: '08:00',
            status: 'administrado',
            observacoes: 'Em jejum'
        },
        {
            id: 3,
            nome: 'Omeprazol',
            dosagem: '20mg',
            via: 'Oral',
            residenteId: 2,
            residenteNome: 'João Santos',
            horarioPrevisto: '08:00',
            status: 'pendente',
            observacoes: 'Antes do café'
        },
        {
            id: 4,
            nome: 'Metformina',
            dosagem: '850mg',
            via: 'Oral',
            residenteId: 1,
            residenteNome: 'Maria Silva',
            horarioPrevisto: '12:00',
            status: 'pendente',
            observacoes: 'Com almoço'
        },
        {
            id: 5,
            nome: 'Insulina NPH',
            dosagem: '20 UI',
            via: 'Subcutânea',
            residenteId: 2,
            residenteNome: 'João Santos',
            horarioPrevisto: '12:00',
            status: 'pendente',
            observacoes: 'Aplicar na coxa'
        },
        {
            id: 6,
            nome: 'Captopril',
            dosagem: '25mg',
            via: 'Oral',
            residenteId: 3,
            residenteNome: 'Ana Costa',
            horarioPrevisto: '14:00',
            status: 'atrasado',
            observacoes: 'Urgente - Pressão alta'
        },
        {
            id: 7,
            nome: 'Sinvastatina',
            dosagem: '40mg',
            via: 'Oral',
            residenteId: 1,
            residenteNome: 'Maria Silva',
            horarioPrevisto: '20:00',
            status: 'pendente',
            observacoes: 'Antes de dormir'
        },
        {
            id: 8,
            nome: 'AAS',
            dosagem: '100mg',
            via: 'Oral',
            residenteId: 2,
            residenteNome: 'João Santos',
            horarioPrevisto: '20:00',
            status: 'pendente',
            observacoes: 'Anticoagulante'
        },
        {
            id: 9,
            nome: 'Rivotril',
            dosagem: '2mg',
            via: 'Oral',
            residenteId: 3,
            residenteNome: 'Ana Costa',
            horarioPrevisto: '22:00',
            status: 'pendente',
            observacoes: 'Para dormir'
        }
    ];

    // Filtrar por residente se especificado
    let resultado = residenteId
        ? medicamentosMock.filter(m => m.residenteId === residenteId)
        : medicamentosMock;

    return resultado;

    /* 🔧 CÓDIGO REAL DA API (comentado para desenvolvimento)
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let url = `${API_BASE_URL}/medicamentos?data=${data}`;
    if (residenteId) url += `&residenteId=${residenteId}`;

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao buscar medicamentos`);

    const responseData = await response.json();
    return Array.isArray(responseData) ? responseData : (responseData.content || []);
    */
};
