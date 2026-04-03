// Serviço de API para buscar dados dos idosos
// Substitua a URL base pela sua API real

const API_BASE_URL = 'https://sua-api.com/api'; // Altere para sua API

export interface Idoso {
    id: number;
    nome: string;
    idade: number;
    foto?: string;
    quarto: string;
    status: 'ativo' | 'inativo';
    ultimaVisita?: string;
}

export interface ResumoIdosos {
    total: number;
    ativos: number;
    inativos: number;
}

// Simula chamada à API - substitua por fetch real
const allIdosos: Idoso[] = [
    { id: 1, nome: 'Sr. Carlos Silva', idade: 78, quarto: '101', status: 'ativo', ultimaVisita: '2025-02-10' },
    { id: 2, nome: 'Sra. Ana Santos', idade: 82, quarto: '102', status: 'ativo', ultimaVisita: '2025-02-09' },
    { id: 3, nome: 'Sr. João Pereira', idade: 75, quarto: '103', status: 'ativo', ultimaVisita: '2025-02-11' },
    { id: 4, nome: 'Sra. Maria Costa', idade: 80, quarto: '104', status: 'inativo', ultimaVisita: '2025-01-28' },
    { id: 5, nome: 'Sr. Pedro Alves', idade: 77, quarto: '105', status: 'ativo', ultimaVisita: '2025-02-10' },
    { id: 6, nome: 'Sra. Rosa Vieira', idade: 79, quarto: '201', status: 'ativo', ultimaVisita: '2025-02-11' },
    { id: 7, nome: 'Sr. Luis Gomes', idade: 81, quarto: '202', status: 'ativo', ultimaVisita: '2025-02-08' },
    { id: 8, nome: 'Sra. Fernanda Dias', idade: 76, quarto: '203', status: 'ativo', ultimaVisita: '2025-02-10' },
];

export const buscarIdosos = async (page: number = 1, pageSize: number = 5): Promise<Idoso[]> => {
    try {
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        // Paginação simples
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedIdosos = allIdosos.slice(startIndex, endIndex);

        // Simulação de fetch real:
        // const response = await fetch(`${API_BASE_URL}/idosos?page=${page}&pageSize=${pageSize}`);
        // if (!response.ok) throw new Error('Erro ao buscar idosos');
        // return await response.json();

        return paginatedIdosos;
    } catch (error) {
        throw new Error('Falha ao carregar dados dos idosos');
    }
};

export const buscarIdosoDetalhes = async (id: number): Promise<Idoso | null> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const idoso = allIdosos.find(i => i.id === id);
        return idoso || null;
    } catch (error) {
        throw new Error('Falha ao carregar detalhes do idoso');
    }
};

export const buscarResumo = async (): Promise<ResumoIdosos> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Substitua pela chamada real:
        // const response = await fetch(`${API_BASE_URL}/idosos/resumo`);
        // if (!response.ok) throw new Error('Erro ao buscar resumo');
        // return await response.json();

        return {
            total: 5,
            ativos: 4,
            inativos: 1,
        };
    } catch (error) {
        throw new Error('Falha ao carregar resumo');
    }
};

// ==================== AUTENTICAÇÃO ====================

export interface LoginResponse {
    token: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface SignUpData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Mock de usuários autorizados para test
const AUTHORIZED_USERS = [
    { email: 'admin@assist.com', password: '123456', name: 'Administrador' },
    { email: 'cuidador@assist.com', password: '123456', name: 'Cuidador' },
    { email: 'teste@email.com', password: '12345678', name: 'Usuário Teste' },
];

/**
 * Função de login
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Token de autenticação
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Em produção, isso seria uma chamada real à API:
        // const response = await fetch(`${API_BASE_URL}/auth/login`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password }),
        // });
        // if (!response.ok) throw new Error('Login falhou');
        // return await response.json();

        // Mock: Validar usuário
        const user = AUTHORIZED_USERS.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            throw new Error('Email ou senha inválidos');
        }

        // Gerar token mock (em produção seria gerado pelo servidor)
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

        return {
            token,
            user: {
                id: `user_${email.split('@')[0]}`,
                name: user.name,
                email: user.email,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao fazer login';
        throw new Error(errorMessage);
    }
};

/**
 * Função de registro/sign-up
 * @param data Dados do novo usuário
 * @returns Token de autenticação
 */
export const signUp = async (data: SignUpData): Promise<LoginResponse> => {
    try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Em produção:
        // const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data),
        // });
        // if (!response.ok) throw new Error('Erro ao criar conta');
        // return await response.json();

        // Validações simples
        if (!data.email || !data.password || !data.name) {
            throw new Error('Todos os campos são obrigatórios');
        }

        if (data.password !== data.confirmPassword) {
            throw new Error('As senhas não coincidem');
        }

        if (data.password.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres');
        }

        // Verificar se email já existe
        if (AUTHORIZED_USERS.some(u => u.email === data.email)) {
            throw new Error('Este email já está cadastrado');
        }

        // Gerar token mock
        const token = Buffer.from(`${data.email}:${Date.now()}`).toString('base64');

        return {
            token,
            user: {
                id: `user_${data.email.split('@')[0]}`,
                name: data.name,
                email: data.email,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar conta';
        throw new Error(errorMessage);
    }
};

/**
 * Função para recuperar senha
 * @param email Email do usuário
 * @returns Mensagem de confirmação
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Em produção:
        // const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email }),
        // });
        // if (!response.ok) throw new Error('Erro ao enviar email');
        // return await response.json();

        if (!email) {
            throw new Error('Email é obrigatório');
        }

        // Mock: Simular envio de email
        console.log(`Email de recuperação enviado para: ${email}`);

        return {
            message: `Um link para recuperação de senha foi enviado para ${email}. Verifique sua caixa de entrada.`,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        throw new Error(errorMessage);
    }
};

/**
 * Função para validar token
 * @param token Token de autenticação
 * @returns Dados do usuário se o token for válido
 */
export const validateToken = async (token: string): Promise<{ valid: boolean; user?: any }> => {
    try {
        // Em produção, isso verificaria o token no servidor
        if (!token) {
            throw new Error('Token ausente');
        }

        // Mock: Simulated token validation
        const isValid = token.length > 0;
        return { valid: isValid };
    } catch (error) {
        return { valid: false };
    }
};
