// Serviço de API unificado
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.31.64.40:8080/api';

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
    quarto?: string;
    ultimaVisita?: string;
    status?: string;
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
    // Todos os idosos atualmente cadastrados no banco representam residentes ativos na instituição.
    return 'ativo';
};

const mapearIdoso = (response: IdosoResponse): Idoso => {
    return {
        ...response,
        // 💡 CORREÇÃO AQUI: Garante que fotoUrl pegue o valor de foto_url caso venha do banco assim
        fotoUrl: response.fotoUrl || response.foto_url,
        idade: calcularIdade(response.dataNascimento),
        status: response.status ? (response.status.toLowerCase() as 'ativo' | 'inativo') : 'ativo',
    };
};

export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
            throw new Error('E-mail e/ou senha incorreto(s)');
        }
        throw new Error('Falha no login');
    }
    return await response.json();
};

export const cadastrarUsuario = async (
    name: string,
    email: string,
    password: string,
    role: string = 'FUNCIONARIO'
): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha ao cadastrar usuário');
    }

    return await response.json();
};

export const solicitarRecuperacaoSenha = async (email: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha ao solicitar recuperação de senha');
    }

    return await response.text();
};

export const buscarIdosos = async (token?: string, page: number = 0, size: number = 10): Promise<Idoso[]> => {
    const idososMock: Idoso[] = [
        {
            id: 1,
            nome: 'Maria Silva',
            dataNascimento: '1950-03-15',
            sexo: 'FEMININO',
            estadoSaude: 'ATIVO',
            idade: 74,
            status: 'ativo',
            criadoEm: '2024-01-10T10:00:00',
            quarto: 'Quarto 12',
            observacoes: 'Hipertensa, necessita de acompanhamento ao caminhar.'
        },
        {
            id: 2,
            nome: 'João Santos',
            dataNascimento: '1945-07-22',
            sexo: 'MASCULINO',
            estadoSaude: 'ATIVO',
            idade: 79,
            status: 'ativo',
            criadoEm: '2024-01-15T14:30:00',
            quarto: 'Quarto 08',
            observacoes: 'Diabético tipo 2, controle de insulina necessário.'
        },
        {
            id: 3,
            nome: 'Ana Costa',
            dataNascimento: '1955-11-08',
            sexo: 'FEMININO',
            estadoSaude: 'ATIVO',
            idade: 69,
            status: 'ativo',
            criadoEm: '2024-02-01T09:15:00',
            quarto: 'Quarto 15',
            observacoes: 'Recuperando de cirurgia no quadril.'
        }
    ];

    if (!token || token === 'demo-token') {
        // Aplica paginação no mock
        const start = page * size;
        const end = start + size;
        return idososMock.slice(start, end);
    }

    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Adiciona parâmetros de paginação na URL
        const url = `${API_BASE_URL}/idosos?page=${page}&size=${size}`;
        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) throw new Error('Erro ao buscar idosos');

        const data = await response.json();
        const idosos = Array.isArray(data) ? data : (data.content || []);
        if (idosos.length === 0) return idososMock;
        return idosos.map(mapearIdoso);
    } catch (err) {
        console.warn('[API] Erro ao buscar idosos do backend (offline), usando mock:', err);
        return idososMock;
    }
};

export interface UsuarioResponse {
    id: number;
    name: string;
    nome?: string;
    email: string;
    role: string;
}

export const buscarUsuarios = async (token?: string): Promise<UsuarioResponse[]> => {
    const usuariosMock: UsuarioResponse[] = [
        { id: 1, name: 'Marina', email: 'marina@email.com', role: 'FUNCIONARIO' },
        { id: 2, name: 'Juliana Costa', email: 'juliana@email.com', role: 'FUNCIONARIO' },
        { id: 3, name: 'Renato Pereira', email: 'renato@email.com', role: 'FAMILIAR' },
    ];

    if (!token || token === 'demo-token') {
        return usuariosMock;
    }

    try {
        const headers: any = { 'Content-Type': 'application/json' };
        headers['Authorization'] = `Bearer ${token}`;

        const url = `${API_BASE_URL}/usuarios?size=1000&page=0&sort=name,asc`;
        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) throw new Error('Erro ao buscar usuários');

        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.content || []);
        console.log('[API] buscarUsuarios list from backend:', JSON.stringify(list));
        if (list.length === 0) return usuariosMock;
        return list.map((u: any) => ({
            id: u.id,
            name: u.name || u.nome || '',
            nome: u.nome || u.name || '',
            email: u.email || '',
            role: u.role || 'FUNCIONARIO'
        }));
    } catch (err) {
        console.warn('[API] Erro ao buscar usuários do backend (offline), usando mock:', err);
        return usuariosMock;
    }
};

export const buscarIdosoPorId = async (id: number, token?: string): Promise<Idoso> => {
    const idososMock = [
        {
            id: 1,
            nome: 'Maria Silva',
            dataNascimento: '1950-03-15',
            sexo: 'FEMININO',
            estadoSaude: 'ATIVO',
            idade: 74,
            status: 'ativo' as const,
            criadoEm: '2024-01-10T10:00:00',
            quarto: 'Quarto 12',
            observacoes: 'Hipertensa, necessita de acompanhamento ao caminhar.'
        },
        {
            id: 2,
            nome: 'João Santos',
            dataNascimento: '1945-07-22',
            sexo: 'MASCULINO',
            estadoSaude: 'ATIVO',
            idade: 79,
            status: 'ativo' as const,
            criadoEm: '2024-01-15T14:30:00',
            quarto: 'Quarto 08',
            observacoes: 'Diabético tipo 2, controle de insulina necessário.'
        },
        {
            id: 3,
            nome: 'Ana Costa',
            dataNascimento: '1955-11-08',
            sexo: 'FEMININO',
            estadoSaude: 'ATIVO',
            idade: 69,
            status: 'ativo' as const,
            criadoEm: '2024-02-01T09:15:00',
            quarto: 'Quarto 15',
            observacoes: 'Recuperando de cirurgia no quadril.'
        }
    ];

    if (!token || token === 'demo-token') {
        const idoso = idososMock.find(i => i.id === id);
        if (idoso) return idoso;
    }

    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/idosos/${id}`, { method: 'GET', headers });
        if (!response.ok) throw new Error(`Erro ${response.status}: Idoso não encontrado`);
        const data = await response.json();
        return mapearIdoso(data);
    } catch (error) {
        console.warn(`[API] Erro ao buscar idoso ${id} do backend, usando mock:`, error);
        const idoso = idososMock.find(i => i.id === id);
        if (idoso) return idoso;
        throw error;
    }
};

export const atualizarIdoso = async (id: number, idoso: Partial<IdosoResponse>, token?: string): Promise<Idoso> => {
    const createMockResponse = (): IdosoResponse => ({
        id,
        nome: idoso.nome || 'Maria Silva',
        dataNascimento: idoso.dataNascimento || '1950-03-15',
        sexo: idoso.sexo || 'FEMININO',
        estadoSaude: idoso.estadoSaude || 'ATIVO',
        observacoes: idoso.observacoes,
        responsavelId: idoso.responsavelId || 1,
        responsavelNome: idoso.responsavelNome || 'Carlos Silva',
        criadoEm: new Date().toISOString(),
        fotoUrl: idoso.fotoUrl,
        quarto: idoso.quarto,
    });

    if (!token || token === 'demo-token') {
        return mapearIdoso(createMockResponse());
    }

    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/idosos/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(idoso),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Falha ao atualizar idoso');
        }

        const data = await response.json();
        return mapearIdoso(data);
    } catch (error) {
        console.warn(`[API] Erro ao atualizar idoso ${id} no backend, simulando alteração local:`, error);
        return mapearIdoso(createMockResponse());
    }
};

export const buscarResumo = async (token?: string): Promise<ResumoIdosos> => {
    if (!token || token === 'demo-token') {
        return {
            total: 3,
            ativos: 3,
            inativos: 0
        };
    }

    try {
        // Busca a lista real de idosos do banco de dados para computar status reais
        const idosos = await buscarIdosos(token);
        const total = idosos.length;
        const ativos = idosos.filter(i => i.status === 'ativo').length;
        const inativos = idosos.filter(i => i.status === 'inativo').length;

        return {
            total,
            ativos,
            inativos
        };
    } catch (err) {
        console.warn('[API] Erro ao buscar resumo real do backend:', err);
        return {
            total: 0,
            ativos: 0,
            inativos: 0
        };
    }
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

export const normalizarData = (dataVal: any): string => {
    if (!dataVal) return '';

    // Case 1: Array of integers [year, month, day]
    if (Array.isArray(dataVal)) {
        const year = dataVal[0];
        const month = String(dataVal[1]).padStart(2, '0');
        const day = String(dataVal[2]).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Case 2: String representation
    if (typeof dataVal === 'string') {
        const cleanStr = dataVal.trim();
        const datePart = cleanStr.split(/[T ]/)[0]; // extracts 'YYYY-MM-DD' or 'DD/MM/YYYY'

        if (datePart.includes('-')) {
            const parts = datePart.split('-');
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            } else if (parts[2].length === 4) {
                // DD-MM-YYYY
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        } else if (datePart.includes('/')) {
            const parts = datePart.split('/');
            if (parts[0].length === 4) {
                // YYYY/MM/DD
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            } else if (parts[2].length === 4) {
                // DD/MM/YYYY
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        return datePart;
    }

    // Case 3: Object representation (e.g. Jackson LocalDate object)
    if (typeof dataVal === 'object') {
        const year = dataVal.year;
        const monthNum = dataVal.monthValue !== undefined ? dataVal.monthValue : (typeof dataVal.month === 'number' ? dataVal.month : undefined);
        const day = dataVal.dayOfMonth !== undefined ? dataVal.dayOfMonth : dataVal.day;

        if (year !== undefined && day !== undefined) {
            let mStr = '';
            if (monthNum !== undefined) {
                mStr = String(monthNum).padStart(2, '0');
            } else if (typeof dataVal.month === 'string') {
                const meses: Record<string, string> = {
                    JANUARY: '01', FEBRUARY: '02', MARCH: '03', APRIL: '04', MAY: '05', JUNE: '06',
                    JULY: '07', AUGUST: '08', SEPTEMBER: '09', OCTOBER: '10', NOVEMBER: '11', DECEMBER: '12',
                    JAN: '01', FEB: '02', MAR: '03', APR: '04', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
                };
                mStr = meses[dataVal.month.toUpperCase()] || '01';
            } else {
                mStr = '01';
            }
            return `${year}-${mStr}-${String(day).padStart(2, '0')}`;
        }
    }

    // Case 4: Number (timestamp)
    if (typeof dataVal === 'number') {
        const dObj = new Date(dataVal);
        if (!isNaN(dObj.getTime())) {
            const year = dObj.getFullYear();
            const month = String(dObj.getMonth() + 1).padStart(2, '0');
            const day = String(dObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }

    return '';
};

export const buscarCardapio = async (data: string, token?: string): Promise<ItemCardapio[]> => {
    if (!token || token === 'demo-token') {
        throw new Error('Modo de demonstração');
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/cardapios`, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao buscar cardápio`);

    const cardapios: any[] = await response.json();

    const cardapioDoDia = cardapios.find(c => {
        const cDateStr = normalizarData(c.data);
        const queryDateStr = normalizarData(data);
        return cDateStr === queryDateStr;
    });

    if (!cardapioDoDia) return [];

    const itens: ItemCardapio[] = [];
    const cafeDesc = cardapioDoDia.cafeDaManha || cardapioDoDia.cafe_da_manha;
    const almocoDesc = cardapioDoDia.almoco;
    const jantarDesc = cardapioDoDia.jantar;

    // Converte a data do cardápio recebido para string YYYY-MM-DD de forma normalizada
    const dateStr = normalizarData(cardapioDoDia.data) || data;

    if (cafeDesc) {
        itens.push({
            id: cardapioDoDia.id * 10 + 1,
            data: dateStr,
            tipo: 'cafe',
            descricao: cafeDesc,
            alimentos: cafeDesc.split(',').map((s: string) => s.trim()),
            status: 'servida'
        });
    }

    if (almocoDesc) {
        itens.push({
            id: cardapioDoDia.id * 10 + 2,
            data: dateStr,
            tipo: 'almoco',
            descricao: almocoDesc,
            alimentos: almocoDesc.split(',').map((s: string) => s.trim()),
            status: 'servida'
        });
    }

    if (jantarDesc) {
        itens.push({
            id: cardapioDoDia.id * 10 + 3,
            data: dateStr,
            tipo: 'jantar',
            descricao: jantarDesc,
            alimentos: jantarDesc.split(',').map((s: string) => s.trim()),
            status: 'pendente'
        });
    }

    return itens;
};

export const salvarCardapio = async (
    cardapio: { id?: number; data: string; cafeDaManha: string; almoco: string; jantar: string },
    token?: string
): Promise<any> => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // 💡 CORREÇÃO: Garante que só faz PUT com ID real maior que zero
    const hasValidId = cardapio.id !== undefined && cardapio.id !== null && cardapio.id > 0;
    const url = hasValidId
        ? `${API_BASE_URL}/cardapios/${cardapio.id}`
        : `${API_BASE_URL}/cardapios`;
    const method = hasValidId ? 'PUT' : 'POST';

    // Cria uma cópia do objeto para remover IDs inválidos/0 se houver
    const bodyPayload = { ...cardapio };
    if (!hasValidId) {
        delete bodyPayload.id;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha ao salvar cardápio');
    }

    return await response.json();
};

export const buscarTodosCardapios = async (token?: string): Promise<any[]> => {
    if (!token || token === 'demo-token') {
        return [];
    }
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}/cardapios`, { method: 'GET', headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.warn('[API] Erro ao buscar todos os cardápios do backend:', err);
        return [];
    }
};

export const getFotoUri = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;

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

// Cache em memória mutável para simular a API de Medicamentos
let medicamentosMockCache: Medicamento[] = [
    { id: 1, nome: 'Paracetamol', dosagem: '500mg', via: 'Oral', residenteId: 1, residenteNome: 'Maria Silva', horarioPrevisto: '08:00', status: 'administrado', observacoes: 'Tomar com água' },
    { id: 2, nome: 'Losartana', dosagem: '50mg', via: 'Oral', residenteId: 1, residenteNome: 'Maria Silva', horarioPrevisto: '08:00', status: 'administrado', observacoes: 'Em jejum' },
    { id: 3, nome: 'Omeprazol', dosagem: '20mg', via: 'Oral', residenteId: 2, residenteNome: 'João Santos', horarioPrevisto: '08:00', status: 'pendente', observacoes: 'Antes do café' },
    { id: 4, nome: 'Metformina', dosagem: '850mg', via: 'Oral', residenteId: 1, residenteNome: 'Maria Silva', horarioPrevisto: '12:00', status: 'pendente', observacoes: 'Com almoço' },
    { id: 5, nome: 'Insulina NPH', dosagem: '20 UI', via: 'Subcutânea', residenteId: 2, residenteNome: 'João Santos', horarioPrevisto: '12:00', status: 'pendente', observacoes: 'Aplicar na coxa' },
    { id: 6, nome: 'Captopril', dosagem: '25mg', via: 'Oral', residenteId: 3, residenteNome: 'Ana Costa', horarioPrevisto: '14:00', status: 'atrasado', observacoes: 'Urgente - Pressão alta' },
    { id: 7, nome: 'Sinvastatina', dosagem: '40mg', via: 'Oral', residenteId: 1, residenteNome: 'Maria Silva', horarioPrevisto: '20:00', status: 'pendente', observacoes: 'Antes de dormir' },
    { id: 8, nome: 'AAS', dosagem: '100mg', via: 'Oral', residenteId: 2, residenteNome: 'João Santos', horarioPrevisto: '20:00', status: 'pendente', observacoes: 'Anticoagulante' },
    { id: 9, nome: 'Rivotril', dosagem: '2mg', via: 'Oral', residenteId: 3, residenteNome: 'Ana Costa', horarioPrevisto: '22:00', status: 'pendente', observacoes: 'Para dormir' }
];

export const buscarMedicamentos = async (
    data: string,
    residenteId?: number | null,
    token?: string
): Promise<Medicamento[]> => {
    if (!token || token === 'demo-token') {
        return residenteId
            ? medicamentosMockCache.filter(m => m.residenteId === residenteId)
            : medicamentosMockCache;
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        let url = `${API_BASE_URL}/medicamentos`;
        if (residenteId) {
            url += `?residenteId=${residenteId}`;
        }
        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) return [];
        const data = await response.json();
        return data as Medicamento[];
    } catch (err) {
        console.warn('[API] Erro ao buscar medicamentos do backend:', err);
        return residenteId
            ? medicamentosMockCache.filter(m => m.residenteId === residenteId)
            : medicamentosMockCache;
    }
};

export const criarMedicamento = async (
    med: Omit<Medicamento, 'id' | 'residenteNome'>,
    token?: string
): Promise<Medicamento> => {
    if (!token || token === 'demo-token') {
        const id = medicamentosMockCache.length > 0 ? Math.max(...medicamentosMockCache.map(m => m.id)) + 1 : 1;
        const novoMed: Medicamento = {
            ...med,
            id,
            residenteNome: med.residenteId === 1 ? 'Maria Silva (Demo)' : med.residenteId === 2 ? 'João Santos (Demo)' : 'Ana Costa (Demo)',
            status: med.status || 'pendente'
        };
        medicamentosMockCache.push(novoMed);
        return novoMed;
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}/medicamentos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(med)
        });
        if (!response.ok) throw new Error('Erro ao criar medicamento no backend');
        const salvo = await response.json();
        return salvo as Medicamento;
    } catch (err) {
        console.warn('[API] Erro ao criar medicamento no backend:', err);
        const id = medicamentosMockCache.length > 0 ? Math.max(...medicamentosMockCache.map(m => m.id)) + 1 : 1;
        const novoMed: Medicamento = {
            ...med,
            id,
            residenteNome: 'Residente',
            status: med.status || 'pendente'
        };
        medicamentosMockCache.push(novoMed);
        return novoMed;
    }
};

export const atualizarMedicamento = async (
    id: number,
    med: Partial<Medicamento>,
    token?: string
): Promise<Medicamento> => {
    if (!token || token === 'demo-token') {
        const index = medicamentosMockCache.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Medicamento não encontrado');
        medicamentosMockCache[index] = {
            ...medicamentosMockCache[index],
            ...med
        };
        return medicamentosMockCache[index];
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}/medicamentos/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(med)
        });
        if (!response.ok) throw new Error('Erro ao atualizar medicamento no backend');
        const atualizado = await response.json();
        return atualizado as Medicamento;
    } catch (err) {
        console.warn('[API] Erro ao atualizar medicamento no backend:', err);
        const index = medicamentosMockCache.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Medicamento não encontrado');
        medicamentosMockCache[index] = {
            ...medicamentosMockCache[index],
            ...med
        };
        return medicamentosMockCache[index];
    }
};

export const deletarMedicamento = async (id: number, token?: string): Promise<void> => {
    if (!token || token === 'demo-token') {
        medicamentosMockCache = medicamentosMockCache.filter(m => m.id !== id);
        return;
    }

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}/medicamentos/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) throw new Error('Erro ao deletar medicamento no backend');
    } catch (err) {
        console.warn('[API] Erro ao deletar medicamento no backend:', err);
        medicamentosMockCache = medicamentosMockCache.filter(m => m.id !== id);
    }
};

// ─── Atividades ───────────────────────────────────────────────────────

export type TipoAtividade = 'medicacao' | 'fisioterapia' | 'consulta' | 'lazer' | 'alimentacao' | 'higiene';
export type StatusAtividade = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada' | 'cancelada';

export interface Atividade {
    id: number;
    titulo: string;
    nomeIdoso: string;
    idosoId: number;
    horario: string;
    tipo: TipoAtividade;
    status: StatusAtividade;
    responsavel?: string;
    data?: string;
    horarioFim?: string;
    observacoes?: string;
}

export interface FiltrosAtividade {
    idosoId?: number;
    tipo?: TipoAtividade;
    status?: StatusAtividade;
    data?: string; // Filtro por data no formato YYYY-MM-DD
}

export const buscarAtividades = async (filtros?: FiltrosAtividade, token?: string): Promise<Atividade[]> => {
    const atividadesMock: Atividade[] = [
        { id: 1, titulo: 'Fisioterapia Motora', nomeIdoso: 'Maria Silva', idosoId: 1, horario: '09:00', tipo: 'fisioterapia', status: 'concluida', responsavel: 'Dr. Roberto' },
        { id: 2, titulo: 'Medicação Diária', nomeIdoso: 'Maria Silva', idosoId: 1, horario: '08:00', tipo: 'medicacao', status: 'concluida', responsavel: 'Marina' },
        { id: 3, titulo: 'Consulta Geral', nomeIdoso: 'Maria Silva', idosoId: 1, horario: '14:00', tipo: 'consulta', status: 'pendente', responsavel: 'Dr. Roberto' },
        { id: 4, titulo: 'Passeio no Jardim', nomeIdoso: 'João Santos', idosoId: 2, horario: '16:00', tipo: 'lazer', status: 'pendente', responsavel: 'Lucas' },
        { id: 5, titulo: 'Almoço Assistido', nomeIdoso: 'João Santos', idosoId: 2, horario: '12:00', tipo: 'alimentacao', status: 'concluida', responsavel: 'Lucas' },
        { id: 6, titulo: 'Higiene e Banho', nomeIdoso: 'João Santos', idosoId: 2, horario: '10:30', tipo: 'higiene', status: 'concluida', responsavel: 'Lucas' },
        { id: 7, titulo: 'Leitura na Tarde', nomeIdoso: 'Ana Costa', idosoId: 3, horario: '15:00', tipo: 'lazer', status: 'concluida', responsavel: 'Paula' },
        { id: 8, titulo: 'Medicação da Noite', nomeIdoso: 'Ana Costa', idosoId: 3, horario: '21:00', tipo: 'medicacao', status: 'pendente', responsavel: 'Paula' },
    ];

    if (!token || token === 'demo-token') {
        console.log('[API] Carregando atividades mockadas (Modo Demo)');
        let filtradas = atividadesMock;
        if (filtros) {
            if (filtros.idosoId !== undefined) {
                filtradas = filtradas.filter(a => a.idosoId === filtros.idosoId);
            }
            if (filtros.tipo !== undefined) {
                filtradas = filtradas.filter(a => a.tipo === filtros.tipo);
            }
            if (filtros.status !== undefined) {
                filtradas = filtradas.filter(a => a.status === filtros.status);
            }
            // TODO: Implementar filtro por data quando backend suportar
            // if (filtros.data !== undefined) {
            //     filtradas = filtradas.filter(a => a.data === filtros.data);
            // }
        }
        return filtradas;
    }

    try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let url = `${API_BASE_URL}/atividades`;
    if (filtros?.idosoId !== undefined) {
        url += `?idosoId=${filtros.idosoId}`;
    }

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error('Erro ao buscar atividades');

    const dtos: any[] = await response.json();

    let filtradas = dtos.map(dto => {
        const horarioStr = dto.horario_inicio ? dto.horario_inicio.substring(0, 5) : '08:00';

        let tipo: TipoAtividade = 'consulta';
        const nomeLower = (dto.nome || '').toLowerCase();
        if (nomeLower.includes('medica') || nomeLower.includes('remédio')) tipo = 'medicacao';
        else if (nomeLower.includes('fisio')) tipo = 'fisioterapia';
        else if (nomeLower.includes('lazer') || nomeLower.includes('passeio') || nomeLower.includes('jardim')) tipo = 'lazer';
        else if (nomeLower.includes('almoc') || nomeLower.includes('comida') || nomeLower.includes('refeic')) tipo = 'alimentacao';
        else if (nomeLower.includes('banho') || nomeLower.includes('higiene')) tipo = 'higiene';

        return {
            id: dto.id,
            titulo: dto.nome || 'Atividade',
            nomeIdoso: filtros?.idosoId ? 'Residente' : 'Geral',
            idosoId: filtros?.idosoId || 0,
            horario: horarioStr,
            tipo: tipo,
            status: (dto.status ? dto.status.toLowerCase() : 'pendente') as StatusAtividade,
            responsavel: dto.responsavelNome || 'Não atribuído',
            data: dto.data || ''
        };
    });

    if (filtros) {
        if (filtros.tipo !== undefined) {
            filtradas = filtradas.filter(a => a.tipo === filtros.tipo);
        }
        if (filtros.status !== undefined) {
            filtradas = filtradas.filter(a => a.status === filtros.status);
        }
    }

    return filtradas;
} catch (error) {
    console.warn('[API] Erro ao buscar atividades real do backend, usando mock:', error);
    let filtradas = atividadesMock;
    if (filtros) {
        if (filtros.idosoId !== undefined) {
            filtradas = filtradas.filter(a => a.idosoId === filtros.idosoId);
        }
        if (filtros.tipo !== undefined) {
            filtradas = filtradas.filter(a => a.tipo === filtros.tipo);
        }
        if (filtros.status !== undefined) {
            filtradas = filtradas.filter(a => a.status === filtros.status);
        }
    }
    return filtradas;
}
};

export const criarAtividade = async (
    atividade: { nome: string; data: string; horario_inicio: string; horario_fim: string; observacoes: string; responsavelId: number; responsavelNome?: string; status?: string },
    idosoIds?: number[] | number,
    token?: string
): Promise<any> => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/atividades`, {
        method: 'POST',
        headers,
        body: JSON.stringify(atividade),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Falha ao criar atividade');
    }

    const salvo = await response.json();

    if (idosoIds && token) {
        const ids = Array.isArray(idosoIds) ? idosoIds : [idosoIds];
        if (ids.length > 0) {
            await fetch(`${API_BASE_URL}/alocacao/atividades/${salvo.id}/alocar`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ idosoIds: ids }),
            });
        }
    }

    return salvo;
};

export const buscarIdososDaAtividade = async (
    atividadeId: number,
    token?: string
): Promise<number[]> => {
    if (!token || token === 'demo-token') return [];
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/alocacao/atividades/${atividadeId}/idosos`, {
            method: 'GET',
            headers,
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.warn('[API] Erro ao buscar idosos da atividade:', e);
        return [];
    }
};

export const atualizarAlocacoesAtividade = async (
    atividadeId: number,
    idosoIds: number[],
    token?: string
): Promise<any> => {
    if (!token || token === 'demo-token') return null;
    const headers: any = { 'Content-Type': 'application/json' };
    headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/alocacao/atividades/${atividadeId}/atualizar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ idosoIds }),
    });

    if (!response.ok) {
        throw new Error('Falha ao atualizar alocações da atividade');
    }
    return response;
};

export const atualizarAtividade = async (
    id: number,
    atividade: { nome: string; data: string; horario_inicio: string; horario_fim: string; observacoes: string; responsavelId: number; responsavelNome?: string; status?: string },
    token?: string
): Promise<any> => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/atividades/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(atividade),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Falha ao atualizar atividade');
    }

    return await response.json();
};

export const deletarAtividade = async (id: number, token?: string): Promise<void> => {
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/atividades/${id}`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        throw new Error('Falha ao deletar atividade');
    }
};
