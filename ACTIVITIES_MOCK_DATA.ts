// Mock Data para Testes da Tela de Agenda
// Arquivo: ACTIVITIES_MOCK_DATA.ts

export const ACTIVITIES_MOCK_DATA_EXAMPLES = {
  // Exemplo 1: Dia com muitas atividades (bem distribuído)
  wellDistributed: [
    {
      id: '1',
      title: 'Tomar Medicação',
      description: 'Tomar os medicamentos da pressão e diabetes',
      time: '08:00',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'alta' as const,
      category: 'Saúde',
      idosoName: 'João Silva',
    },
    {
      id: '2',
      title: 'Café da Manhã',
      description: 'Refeição matinal saudável com leite e biscoitos',
      time: '08:30',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'média' as const,
      category: 'Alimentação',
      idosoName: 'João Silva',
    },
    {
      id: '3',
      title: 'Fisioterapia',
      description: 'Sessão de exercícios para mobilidade',
      time: '10:00',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'alta' as const,
      category: 'Saúde',
      idosoName: 'João Silva',
    },
    {
      id: '4',
      title: 'Lanche da Manhã',
      description: 'Frutas ou iogurte',
      time: '11:00',
      period: 'manhã' as const,
      status: 'pending' as const,
      priority: 'baixa' as const,
      category: 'Alimentação',
      idosoName: 'João Silva',
    },
    {
      id: '5',
      title: 'Almoço',
      description: 'Refeição principal do dia',
      time: '12:00',
      period: 'tarde' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Alimentação',
      idosoName: 'João Silva',
    },
    {
      id: '6',
      title: 'Descanso',
      description: 'Momento de repouso após almoço',
      time: '13:30',
      period: 'tarde' as const,
      status: 'pending' as const,
      priority: 'média' as const,
      category: 'Cuidados',
      idosoName: 'João Silva',
    },
    {
      id: '7',
      title: 'Passeio no Parque',
      description: 'Caminhada leve para exercício e atividade social',
      time: '14:30',
      period: 'tarde' as const,
      status: 'pending' as const,
      priority: 'média' as const,
      category: 'Lazer',
      idosoName: 'João Silva',
    },
    {
      id: '8',
      title: 'Consulta Médica',
      description: 'Acompanhamento com o cardiologista',
      time: '15:00',
      period: 'tarde' as const,
      status: 'cancelled' as const,
      priority: 'alta' as const,
      category: 'Médico',
      idosoName: 'Maria Santos',
    },
    {
      id: '9',
      title: 'Café da Tarde',
      description: 'Bebida quente e biscoitos',
      time: '16:00',
      period: 'tarde' as const,
      status: 'pending' as const,
      priority: 'média' as const,
      category: 'Alimentação',
      idosoName: 'João Silva',
    },
    {
      id: '10',
      title: 'Tomar Medicação',
      description: 'Medicamentos da noite',
      time: '18:00',
      period: 'noite' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Saúde',
      idosoName: 'João Silva',
    },
    {
      id: '11',
      title: 'Jantar',
      description: 'Refeição leve à noite',
      time: '18:30',
      period: 'noite' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Alimentação',
      idosoName: 'João Silva',
    },
    {
      id: '12',
      title: 'Atividades de Lazer',
      description: 'TV, leitura ou jogos de tabuleiro',
      time: '19:30',
      period: 'noite' as const,
      status: 'pending' as const,
      priority: 'baixa' as const,
      category: 'Lazer',
      idosoName: 'João Silva',
    },
  ],

  // Exemplo 2: Dia apenas com manhã cheio
  morningFull: [
    {
      id: '1',
      title: 'Acordar e Higiene Pessoal',
      description: 'Banho e preparação para o dia',
      time: '06:00',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'alta' as const,
      category: 'Cuidados',
      idosoName: 'José da Silva',
    },
    {
      id: '2',
      title: 'Café da Manhã',
      description: 'Café coado com pão',
      time: '07:00',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'alta' as const,
      category: 'Alimentação',
      idosoName: 'José da Silva',
    },
    {
      id: '3',
      title: 'Medicação Matinal',
      description: 'Tomar vitaminas e suplementos',
      time: '07:30',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'alta' as const,
      category: 'Saúde',
      idosoName: 'José da Silva',
    },
    {
      id: '4',
      title: 'Exercícios Respiratórios',
      description: 'Fisioterapia respiratória - 15 min',
      time: '08:30',
      period: 'manhã' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Saúde',
      idosoName: 'José da Silva',
    },
    {
      id: '5',
      title: 'Atividade Recreativa',
      description: 'Jogo de palavras ou puzzle',
      time: '09:30',
      period: 'manhã' as const,
      status: 'pending' as const,
      priority: 'média' as const,
      category: 'Lazer',
      idosoName: 'José da Silva',
    },
  ],

  // Exemplo 3: Dia vazio ou sem atividades
  empty: [],

  // Exemplo 4: Dia crítico com urgências
  critical: [
    {
      id: '1',
      title: 'Consulta Urgente',
      description: 'Avaliação de dor no peito - URGENTE',
      time: '08:00',
      period: 'manhã' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Médico',
      idosoName: 'Paulo Gomes',
    },
    {
      id: '2',
      title: 'Medicação de Emergência',
      description: 'Tomar nitroglicerina conforme prescrito',
      time: '08:15',
      period: 'manhã' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Saúde',
      idosoName: 'Paulo Gomes',
    },
    {
      id: '3',
      title: 'Contato com Familiar',
      description: 'Avisar o filho sobre a situação',
      time: '08:30',
      period: 'manhã' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Cuidados',
      idosoName: 'Paulo Gomes',
    },
  ],

  // Exemplo 5: Dia com todas as refeições
  mealsOnly: [
    {
      id: '1',
      title: 'Café da Manhã',
      description: 'Leite, pão e queijo',
      time: '07:00',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'alta' as const,
      category: 'Alimentação',
      idosoName: 'Pedro Costa',
    },
    {
      id: '2',
      title: 'Lanche Matinal',
      description: 'Suco e bolo',
      time: '10:00',
      period: 'manhã' as const,
      status: 'completed' as const,
      priority: 'baixa' as const,
      category: 'Alimentação',
      idosoName: 'Pedro Costa',
    },
    {
      id: '3',
      title: 'Almoço',
      description: 'Arroz, feijão, carne e salada',
      time: '12:30',
      period: 'tarde' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Alimentação',
      idosoName: 'Pedro Costa',
    },
    {
      id: '4',
      title: 'Café da Tarde',
      description: 'Café, bolo ou biscoito',
      time: '15:00',
      period: 'tarde' as const,
      status: 'pending' as const,
      priority: 'média' as const,
      category: 'Alimentação',
      idosoName: 'Pedro Costa',
    },
    {
      id: '5',
      title: 'Jantar',
      description: 'Sopa leve e pão',
      time: '18:30',
      period: 'noite' as const,
      status: 'pending' as const,
      priority: 'alta' as const,
      category: 'Alimentação',
      idosoName: 'Pedro Costa',
    },
  ],
};

// Exporta um conjunto aleatório de dados para testes
export const getRandomMockData = () => {
  const examples = Object.values(ACTIVITIES_MOCK_DATA_EXAMPLES);
  const randomIndex = Math.floor(Math.random() * examples.length);
  return examples[randomIndex];
};

// Exporta dados para um período específico
export const getMockDataForPeriod = (period: 'manhã' | 'tarde' | 'noite') => {
  return ACTIVITIES_MOCK_DATA_EXAMPLES.wellDistributed.filter(
    (activity) => activity.period === period
  );
};

// Exporta dados por status
export const getMockDataByStatus = (status: 'completed' | 'pending' | 'cancelled') => {
  return ACTIVITIES_MOCK_DATA_EXAMPLES.wellDistributed.filter(
    (activity) => activity.status === status
  );
};

// Exporta dados por prioridade
export const getMockDataByPriority = (priority: 'alta' | 'média' | 'baixa') => {
  return ACTIVITIES_MOCK_DATA_EXAMPLES.wellDistributed.filter(
    (activity) => activity.priority === priority
  );
};
