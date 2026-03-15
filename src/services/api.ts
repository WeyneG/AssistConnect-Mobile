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
