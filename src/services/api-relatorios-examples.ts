/**
 * EXEMPLOS DE INTEGRAÇÃO COM API
 * ================================
 * 
 * Este arquivo mostra como integrar o ReportsDashboard com endpoints reais
 * de forma gradual, começando com dados simulados e evoluindo para dados reais.
 */

// ─── PASSO 1: Adicionar tipos no api.ts ───────────────────────────────────

export interface RelatorioSaude {
    data: string;
    pressaoSistolica: number;
    pressaoDiastolica: number;
    frequenciaCardiaca: number;
    temperatura: number;
    status: 'normal' | 'alerta' | 'critico';
}

export interface RelatorioAtividade {
    id: number;
    data: string;
    tipo: 'fisioterapia' | 'exercicio' | 'recreacao' | 'outro';
    descricao: string;
    duracao: number; // em minutos
    intensidade: 'leve' | 'moderada' | 'intensa';
    status: 'concluida' | 'pendente' | 'cancelada';
    calorias?: number;
}

export interface RelatorioAlimentacao {
    id: number;
    data: string;
    tipo: 'cafe' | 'almoco' | 'lanche' | 'jantar';
    alimentos: string[];
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    status: 'concluida' | 'nao-realizada';
}

export interface RelatorioMedicamentos {
    id: number;
    data: string;
    medicamento: string;
    horario: string;
    dosagem: string;
    prescricao: string;
    status: 'administrado' | 'pendente' | 'recusado';
}

// ─── PASSO 2: Adicionar funções de API ───────────────────────────────────

/**
 * Busca relatório de saúde
 */
export const buscarRelatorioSaude = async (
    idosoId: number,
    dataInicio: string,
    dataFim: string,
    token?: string
): Promise<RelatorioSaude[]> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}/relatorios/saude?idosoId=${idosoId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar relatório de saúde: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        console.error('Erro em buscarRelatorioSaude:', error);
        throw error;
    }
};

/**
 * Busca relatório de atividades
 */
export const buscarRelatorioAtividades = async (
    idosoId: number,
    dataInicio: string,
    dataFim: string,
    token?: string
): Promise<RelatorioAtividade[]> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}/relatorios/atividades?idosoId=${idosoId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar relatório de atividades: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        console.error('Erro em buscarRelatorioAtividades:', error);
        throw error;
    }
};

/**
 * Busca relatório de alimentação
 */
export const buscarRelatorioAlimentacao = async (
    idosoId: number,
    dataInicio: string,
    dataFim: string,
    token?: string
): Promise<RelatorioAlimentacao[]> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}/relatorios/alimentacao?idosoId=${idosoId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar relatório de alimentação: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        console.error('Erro em buscarRelatorioAlimentacao:', error);
        throw error;
    }
};

/**
 * Busca relatório de medicamentos
 */
export const buscarRelatorioMedicamentos = async (
    idosoId: number,
    dataInicio: string,
    dataFim: string,
    token?: string
): Promise<RelatorioMedicamentos[]> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}/relatorios/medicamentos?idosoId=${idosoId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
            { method: 'GET', headers }
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar relatório de medicamentos: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        console.error('Erro em buscarRelatorioMedicamentos:', error);
        throw error;
    }
};

// ─── PASSO 3: Atualizar ReportsDashboard.tsx ───────────────────────────────

/**
 * Exemplo de como atualizar a função carregarDados no ReportsDashboard
 */

/*
const carregarDados = async () => {
    if (!selectedResident) return;

    try {
        setLoading(true);
        
        // Converter datas de DD/MM/YYYY para YYYY-MM-DD
        const [diaInicio, mesInicio, anoInicio] = dateFrom.split('/');
        const [diaFim, mesFim, anoFim] = dateTo.split('/');
        
        const dataInicio = `${anoInicio}-${mesInicio}-${diaInicio}`;
        const dataFim = `${anoFim}-${mesFim}-${diaFim}`;

        switch (selectedReport) {
            case 'saude':
                const saudeData = await buscarRelatorioSaude(
                    selectedResident.id,
                    dataInicio,
                    dataFim,
                    token
                );
                // Processar dados para gráficos
                break;
            case 'atividades':
                const atividadesData = await buscarRelatorioAtividades(
                    selectedResident.id,
                    dataInicio,
                    dataFim,
                    token
                );
                // Processar dados para gráficos
                break;
            case 'alimentacao':
                const alimentacaoData = await buscarRelatorioAlimentacao(
                    selectedResident.id,
                    dataInicio,
                    dataFim,
                    token
                );
                // Processar dados para gráficos
                break;
            case 'medicamentos':
                const medicamentosData = await buscarRelatorioMedicamentos(
                    selectedResident.id,
                    dataInicio,
                    dataFim,
                    token
                );
                // Processar dados para gráficos
                break;
        }

        setLoading(false);
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados');
        setLoading(false);
    }
};
*/

// ─── PASSO 4: Funções Auxiliares de Processamento ───────────────────────────

/**
 * Processa dados de saúde para o gráfico
 */
export const processarDadosSaude = (dados: RelatorioSaude[]): ReportData => {
    const label = 'Pressão Sistólica';
    const values = dados.map(d => d.pressaoSistolica);
    const labels = dados.map(d => new Date(d.data).toLocaleDateString('pt-BR', { weekday: 'short' }));

    return {
        labels,
        values,
        summary: {
            total: values.reduce((a, b) => a + b, 0),
            average: values.reduce((a, b) => a + b, 0) / values.length,
            highest: 'Consultar histórico',
            lowest: 'Consultar histórico',
        },
    };
};

/**
 * Processa dados de atividades para o gráfico
 */
export const processarDadosAtividades = (dados: RelatorioAtividade[]): ReportData => {
    const statusCount = {
        concluida: dados.filter(d => d.status === 'concluida').length,
        pendente: dados.filter(d => d.status === 'pendente').length,
        cancelada: dados.filter(d => d.status === 'cancelada').length,
    };

    return {
        labels: ['Concluída', 'Pendente', 'Cancelada'],
        values: [statusCount.concluida, statusCount.pendente, statusCount.cancelada],
        summary: {
            total: dados.length,
            average: dados.reduce((sum, d) => sum + d.duracao, 0) / dados.length,
            highest: 'Verificar',
            lowest: 'Verificar',
        },
    };
};

/**
 * Processa dados de alimentação para o gráfico
 */
export const processarDadosAlimentacao = (dados: RelatorioAlimentacao[]): ReportData => {
    const calorias = dados.map(d => d.calorias);
    const labels = dados.map(d => d.tipo);

    return {
        labels,
        values: calorias,
        summary: {
            total: calorias.reduce((a, b) => a + b, 0),
            average: calorias.reduce((a, b) => a + b, 0) / calorias.length,
            highest: Math.max(...calorias) + ' cal',
            lowest: Math.min(...calorias) + ' cal',
        },
    };
};

/**
 * Processa dados de medicamentos para o gráfico
 */
export const processarDadosMedicamentos = (dados: RelatorioMedicamentos[]): ReportData => {
    const statusCount = {
        administrado: dados.filter(d => d.status === 'administrado').length,
        pendente: dados.filter(d => d.status === 'pendente').length,
        recusado: dados.filter(d => d.status === 'recusado').length,
    };

    return {
        labels: ['Administrado', 'Pendente', 'Recusado'],
        values: [statusCount.administrado, statusCount.pendente, statusCount.recusado],
        summary: {
            total: dados.length,
            average: (statusCount.administrado / dados.length) * 100,
            highest: 'Adesão = ' + ((statusCount.administrado / dados.length) * 100).toFixed(1) + '%',
            lowest: 'Consultar histórico',
        },
    };
};

/*
// ─── ENDPOINTS ESPERADOS NO BACKEND ───────────────────────────────────

GET /api/relatorios/saude?idosoId=1&dataInicio=2024-01-01&dataFim=2024-01-31
Response: RelatorioSaude[]

GET /api/relatorios/atividades?idosoId=1&dataInicio=2024-01-01&dataFim=2024-01-31
Response: RelatorioAtividade[]

GET /api/relatorios/alimentacao?idosoId=1&dataInicio=2024-01-01&dataFim=2024-01-31
Response: RelatorioAlimentacao[]

GET /api/relatorios/medicamentos?idosoId=1&dataInicio=2024-01-01&dataFim=2024-01-31
Response: RelatorioMedicamentos[]
*/
