// Serviço de API para buscar dados dos idosos do backend
// ⚠️ IMPORTANTE: Configure a URL base com o IP da sua máquina!

// HOW TO FIND YOUR IP:
// Windows: Open PowerShell and type: ipconfig (look for IPv4 Address)
// Mac/Linux: Open terminal and type: ifconfig (look for inet)

// EXAMPLES:
// const API_BASE_URL = 'http://192.168.0.7:8080/api';   // Local network
// const API_BASE_URL = 'http://10.0.0.50:8080/api';     // Another local network
// const API_BASE_URL = 'http://localhost:8080/api';     // Only for web/same machine

// 👇 CONFIGURADO PARA SEU IP 👇
const API_BASE_URL = 'http://172.20.10.4:8080/api'; // ✅ IP real da máquina

/**
 * Tipos de dados que correspondem ao backend (IdosoResponse)
 */
export enum EstadoSaude {
    ATIVO = 'ATIVO',
    INATIVO = 'INATIVO',
}

export enum Sexo {
    MASCULINO = 'MASCULINO',
    FEMININO = 'FEMININO',
    OUTRO = 'OUTRO',
}

/**
 * Interface que corresponde ao IdosoResponse do backend
 */
export interface IdosoResponse {
    id: number;
    nome: string;
    dataNascimento: string; // ISO date string: YYYY-MM-DD
    sexo: Sexo | string;
    estadoSaude: EstadoSaude | string;
    observacoes?: string;
    responsavelId?: number;
    responsavelNome?: string;
    criadoEm: string; // ISO datetime string
}

/**
 * Interface para uso na tela mobile (com dados calculados)
 */
export interface Idoso extends IdosoResponse {
    idade: number; // Calculado a partir de dataNascimento
    status: 'ativo' | 'inativo'; // Mapeado de estadoSaude
}

export interface ResumoIdosos {
    total: number;
    ativos: number;
    inativos: number;
}

/**
 * Calcula a idade a partir da data de nascimento
 */
const calcularIdade = (dataNascimento: string): number => {
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNasc = nasc.getMonth();

    if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
};

/**
 * Mapeia EstadoSaude do backend para status mobile
 */
const mapearStatus = (estadoSaude: string): 'ativo' | 'inativo' => {
    const estado = estadoSaude?.toUpperCase();
    // ESTAVEL, ATIVO, RECUPERANDO = ativo
    // CRITICO, INATIVO, FALECIDO = inativo
    return ['ESTAVEL', 'ATIVO', 'RECUPERANDO'].includes(estado) ? 'ativo' : 'inativo';
};

/**
 * Mapeia IdosoResponse do backend para Idoso (formato mobile)
 */
const mapearIdoso = (response: IdosoResponse): Idoso => {
    return {
        ...response,
        idade: calcularIdade(response.dataNascimento),
        status: mapearStatus(response.estadoSaude),
    };
};

/**
 * Busca a lista de idosos do backend
 * @param token Token JWT para autenticação
 * @param page Página (padrão: 1)
 * @param pageSize Tamanho da página (padrão: 10)
 */
export const buscarIdosos = async (
    token?: string,
    page: number = 0,
    pageSize: number = 20
): Promise<Idoso[]> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Adiciona token se fornecido
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📡 Fazendo requisição para:', `${API_BASE_URL}/idosos?page=${page}&pageSize=${pageSize}`);
        console.log('🔐 Token:', typeof token === 'string' ? `${token.substring(0, 20)}...` : 'SEM TOKEN');

        const response = await fetch(
            `${API_BASE_URL}/idosos?page=${page}&pageSize=${pageSize}`,
            { method: 'GET', headers }
        );

        console.log('📊 Status da resposta:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Erro ao buscar idosos: ${response.status}`
            );
        }

        const data = await response.json();

        console.log('✅ Resposta bruta completa:', JSON.stringify(data, null, 2));
        console.log('📋 Tipo da resposta:', Array.isArray(data) ? 'Array' : 'Objeto');
        console.log('🔑 Chaves do objeto:', Object.keys(data));

        // O backend pode retornar um array ou um objeto com content
        let idosos = [];

        if (Array.isArray(data)) {
            console.log('✅ É um array direto');
            idosos = data;
        } else if (data.content) {
            console.log('✅ Encontrado em data.content');
            idosos = data.content;
        } else if (data.data) {
            console.log('✅ Encontrado em data.data');
            idosos = data.data;
        } else if (data.idosos) {
            console.log('✅ Encontrado em data.idosos');
            idosos = data.idosos;
        } else {
            console.log('⚠️ Nenhum campo de array encontrado, tentando extrair valores');
            idosos = Object.values(data);
        }

        console.log('📝 Quantidade de idosos extraídos:', idosos.length);
        console.log('👥 Primeiro idoso (exemplo):', JSON.stringify(idosos[0], null, 2));

        // Mapeia cada idoso para o formato mobile
        const idososMapeados = idosos.map(mapearIdoso);
        console.log('✨ Idosos após mapeamento:', JSON.stringify(idososMapeados, null, 2));

        return idososMapeados;
    } catch (error) {
        const mensagem =
            error instanceof Error ? error.message : 'Falha ao carregar dados dos idosos';
        console.error('❌ ERRO em buscarIdosos:', mensagem, error);
        throw new Error(mensagem);
    }
};

/**
 * Busca um idoso específico pelo ID
 * @param id ID do idoso
 * @param token Token JWT para autenticação
 */
export const buscarIdosoPorId = async (
    id: number,
    token?: string
): Promise<Idoso> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📡 Buscando idoso:', id);
        console.log('🔐 Token:', token ? `${token.substring(0, 20)}...` : 'SEM TOKEN');

        const response = await fetch(`${API_BASE_URL}/idosos/${id}`, {
            method: 'GET',
            headers,
        });

        console.log('📊 Status da resposta (detalhe):', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Erro na resposta:', response.status, errorData);
            if (response.status === 404) {
                throw new Error('Idoso não encontrado');
            }
            throw new Error(
                errorData.message || `Erro ao buscar idoso: ${response.status}`
            );
        }

        const data = await response.json();
        console.log('✅ Idoso detalhes:', JSON.stringify(data, null, 2));

        return mapearIdoso(data);
    } catch (error) {
        const mensagem =
            error instanceof Error
                ? error.message
                : 'Falha ao carregar dados do idoso';
        console.error('❌ ERRO em buscarIdosoPorId:', mensagem, error);
        throw new Error(mensagem);
    }
};

/**
 * Alias para buscarIdosoPorId para compatibilidade com código antigo
 */
export const buscarIdosoDetalhes = async (
    id: number,
    token?: string
): Promise<Idoso | null> => {
    try {
        return await buscarIdosoPorId(id, token);
    } catch (error) {
        return null;
    }
};

// ─── Atividades ───────────────────────────────────────────────────────────────

export type TipoAtividade = 'medicacao' | 'fisioterapia' | 'consulta' | 'lazer' | 'alimentacao' | 'higiene';
export type StatusAtividade = 'pendente' | 'concluida' | 'cancelada';

export interface Atividade {
    id: number;
    idosoId: number;
    nomeIdoso: string;
    titulo: string;
    tipo: TipoAtividade;
    status: StatusAtividade;
    data: string;       // ISO date string
    horario: string;    // HH:mm
    descricao?: string;
    responsavel?: string;
}

export interface FiltrosAtividade {
    idosoId?: number;
    tipo?: TipoAtividade;
    status?: StatusAtividade;
}

/**
 * Busca atividades com filtros opcionais
 * @param token Token JWT para autenticação
 * @param filtros Filtros opcionais (idosoId, tipo, status)
 */
export const buscarAtividades = async (
    token?: string,
    filtros?: FiltrosAtividade
): Promise<Atividade[]> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Monta os parâmetros de query
        const params = new URLSearchParams();
        if (filtros?.idosoId) params.append('idosoId', String(filtros.idosoId));
        if (filtros?.tipo) params.append('tipo', filtros.tipo);
        if (filtros?.status) params.append('status', filtros.status);

        const response = await fetch(
            `${API_BASE_URL}/atividades?${params.toString()}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Erro ao buscar atividades: ${response.status}`
            );
        }

        const data = await response.json();
        const atividades = Array.isArray(data) ? data : (data.content || []);
        return atividades;
    } catch (error) {
        const mensagem =
            error instanceof Error ? error.message : 'Falha ao carregar atividades';
        throw new Error(mensagem);
    }
};

/**
 * Busca o resumo de idosos (total, ativos, inativos)
 * @param token Token JWT para autenticação
 */
export const buscarResumo = async (token?: string): Promise<ResumoIdosos> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📡 Fazendo requisição para: resumo de idosos');

        const response = await fetch(`${API_BASE_URL}/idosos/count`, {
            method: 'GET',
            headers,
        });

        console.log('📊 Status da resposta (count):', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Erro ao buscar resumo: ${response.status}`
            );
        }

        const data = await response.json();
        console.log('✅ Resposta resumo completa:', JSON.stringify(data, null, 2));

        // Se a resposta é apenas um número (totalElements)
        let total = 0;
        if (typeof data === 'number') {
            total = data;
        } else if (data.total !== undefined) {
            total = data.total;
        } else if (data.totalElements !== undefined) {
            total = data.totalElements;
        }

        const resultado = {
            total: total,
            ativos: data.ativos || Math.ceil(total * 0.8), // Aproximação se não tiver
            inativos: data.inativos || Math.floor(total * 0.2),
        };

        console.log('📊 Resumo processado:', resultado);
        return resultado;
    } catch (error) {
        const mensagem =
            error instanceof Error ? error.message : 'Falha ao carregar resumo';
        console.error('❌ ERRO em buscarResumo:', mensagem, error);
        throw new Error(mensagem);
    }
};
