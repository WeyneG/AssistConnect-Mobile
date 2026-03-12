// Serviço de API para buscar dados dos idosos
// Substitua a URL base pela sua API real

const API_BASE_URL = 'https://sua-api.com/api'; // Altere para sua API

export interface Idoso {
    id: number;
    nome: string;
    idade: number;
    foto?: string;
    status: 'ativo' | 'inativo';
    ultimaVisita?: string;
}

export interface ResumoIdosos {
    total: number;
    ativos: number;
    inativos: number;
}

// Simula chamada à API - substitua por fetch real
export const buscarIdosos = async (): Promise<Idoso[]> => {
    try {
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Dados mockados - substitua pela chamada real:
        // const response = await fetch(`${API_BASE_URL}/idosos`);
        // if (!response.ok) throw new Error('Erro ao buscar idosos');
        // return await response.json();

        return [
            { id: 1, nome: 'Sr. Carlos Silva', idade: 78, status: 'ativo', ultimaVisita: '2025-02-10' },
            { id: 2, nome: 'Sra. Ana Santos', idade: 82, status: 'ativo', ultimaVisita: '2025-02-09' },
            { id: 3, nome: 'Sr. João Pereira', idade: 75, status: 'ativo', ultimaVisita: '2025-02-11' },
            { id: 4, nome: 'Sra. Maria Costa', idade: 80, status: 'inativo', ultimaVisita: '2025-01-28' },
            { id: 5, nome: 'Sr. Pedro Alves', idade: 77, status: 'ativo', ultimaVisita: '2025-02-10' },
        ];
    } catch (error) {
        throw new Error('Falha ao carregar dados dos idosos');
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
