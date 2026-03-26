// Serviço de API para buscar dados dos idosos
// Substitua a URL base pela sua API real

const API_BASE_URL = 'https://sua-api.com/api'; // Altere para sua API

export interface ContatoEmergencia {
    nome: string;
    parentesco: string;
    telefone: string;
}

export interface Idoso {
    id: number;
    nome: string;
    dataNascimento: string;
    idade: number;
    foto?: string;
    status: 'ativo' | 'inativo';
    ultimaVisita?: string;
    quarto?: string;
    ala?: string;
    // Dados médicos
    tipoSanguineo?: string;
    condicoes?: string[];
    alergias?: string[];
    restricoesAlimentares?: string[];
    contatosEmergencia?: ContatoEmergencia[];
}

export interface ResumoIdosos {
    total: number;
    ativos: number;
    inativos: number;
}

const allIdosos: Idoso[] = [
    {
        id: 1, nome: 'Sr. Carlos Silva', dataNascimento: '1947-03-15', idade: 78,
        status: 'ativo', ultimaVisita: '2025-02-10', quarto: '12', ala: 'Ala A',
        tipoSanguineo: 'O+', condicoes: ['Hipertensão', 'Diabetes Tipo 2'],
        alergias: ['Penicilina', 'Dipirona'],
        restricoesAlimentares: ['Sem sal', 'Sem açúcar'],
        contatosEmergencia: [
            { nome: 'Ana Silva', parentesco: 'Filha', telefone: '(11) 99999-1111' },
            { nome: 'Pedro Silva', parentesco: 'Filho', telefone: '(11) 99999-2222' },
        ],
    },
    {
        id: 2, nome: 'Sra. Ana Santos', dataNascimento: '1943-07-22', idade: 82,
        status: 'ativo', ultimaVisita: '2025-02-09', quarto: '07', ala: 'Ala B',
        tipoSanguineo: 'A+', condicoes: ['Alzheimer leve', 'Osteoporose'],
        alergias: ['Látex'],
        restricoesAlimentares: ['Dieta pastosa'],
        contatosEmergencia: [
            { nome: 'Carlos Santos', parentesco: 'Filho', telefone: '(11) 98888-3333' },
        ],
    },
    {
        id: 3, nome: 'Sr. João Pereira', dataNascimento: '1950-11-05', idade: 75,
        status: 'ativo', ultimaVisita: '2025-02-11', quarto: '03', ala: 'Ala A',
        tipoSanguineo: 'B-', condicoes: ['Parkinson', 'Hipertensão'],
        alergias: [],
        restricoesAlimentares: ['Sem glúten'],
        contatosEmergencia: [
            { nome: 'Maria Pereira', parentesco: 'Esposa', telefone: '(11) 97777-4444' },
        ],
    },
    {
        id: 4, nome: 'Sra. Maria Costa', dataNascimento: '1945-05-30', idade: 80,
        status: 'inativo', ultimaVisita: '2025-01-28', quarto: '15', ala: 'Ala C',
        tipoSanguineo: 'AB+', condicoes: ['Insuficiência cardíaca'],
        alergias: ['Aspirina', 'Ibuprofeno'],
        restricoesAlimentares: ['Sem gordura', 'Sem sal'],
        contatosEmergencia: [
            { nome: 'José Costa', parentesco: 'Marido', telefone: '(11) 96666-5555' },
        ],
    },
    {
        id: 5, nome: 'Sr. Pedro Alves', dataNascimento: '1948-09-18', idade: 77,
        status: 'ativo', ultimaVisita: '2025-02-10', quarto: '09', ala: 'Ala B',
        tipoSanguineo: 'O-', condicoes: ['Diabetes Tipo 2'],
        alergias: [],
        restricoesAlimentares: ['Sem açúcar'],
        contatosEmergencia: [
            { nome: 'Lucia Alves', parentesco: 'Filha', telefone: '(11) 95555-6666' },
        ],
    },
];

export const buscarIdosos = async (page: number = 1, pageSize: number = 10): Promise<Idoso[]> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // const response = await fetch(`${API_BASE_URL}/idosos?page=${page}&pageSize=${pageSize}`);
        // if (!response.ok) throw new Error('Erro ao buscar idosos');
        // return await response.json();

        const startIndex = (page - 1) * pageSize;
        return allIdosos.slice(startIndex, startIndex + pageSize);
    } catch (error) {
        throw new Error('Falha ao carregar dados dos idosos');
    }
};

export const buscarIdosoPorId = async (id: number): Promise<Idoso> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // const response = await fetch(`${API_BASE_URL}/idosos/${id}`);
        // if (!response.ok) throw new Error('Erro ao buscar idoso');
        // return await response.json();

        const idoso = allIdosos.find(i => i.id === id);
        if (!idoso) throw new Error('Idoso não encontrado');
        return idoso;
    } catch (error) {
        throw new Error('Falha ao carregar dados do idoso');
    }
};

export const buscarIdosoDetalhes = async (id: number): Promise<Idoso | null> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return allIdosos.find(i => i.id === id) || null;
    } catch (error) {
        throw new Error('Falha ao carregar detalhes do idoso');
    }
};

export const buscarResumo = async (): Promise<ResumoIdosos> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // const response = await fetch(`${API_BASE_URL}/idosos/resumo`);
        // if (!response.ok) throw new Error('Erro ao buscar resumo');
        // return await response.json();

        return { total: 5, ativos: 4, inativos: 1 };
    } catch (error) {
        throw new Error('Falha ao carregar resumo');
    }
};
