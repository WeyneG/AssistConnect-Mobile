// Serviço de API unificado
const API_BASE_URL = 'http://192.168.0.5:8080/api'; 

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
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/idosos`, { method: 'GET', headers });
    if (!response.ok) throw new Error('Erro ao buscar idosos');
    
    const data = await response.json();
    const idosos = Array.isArray(data) ? data : (data.content || []);
    return idosos.map(mapearIdoso);
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

export const getFotoUri = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    const base = API_BASE_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Adicionamos o timestamp para evitar cache no celular
    return `${base}/${cleanPath}?t=${new Date().getTime()}`;
};
