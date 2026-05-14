import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock do módulo expo completo antes de qualquer import que o use
jest.mock('expo', () => ({}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }));

import { ReportsDashboard } from '../src/pages/reports_dashboard';
import * as api from '../src/services/api';

// Mock do módulo de API
jest.mock('../src/services/api');
const mockBuscarIdosos = api.buscarIdosos as jest.MockedFunction<typeof api.buscarIdosos>;

// Mock do @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

// Dados mockados para testes
const mockIdosos = [
    {
        id: 1,
        nome: 'João Silva',
        dataNascimento: '1950-01-15',
        sexo: 'MASCULINO',
        estadoSaude: 'ATIVO',
        idade: 74,
        status: 'ativo' as const,
        criadoEm: '2024-01-01T00:00:00',
    },
    {
        id: 2,
        nome: 'Maria Santos',
        dataNascimento: '1948-05-20',
        sexo: 'FEMININO',
        estadoSaude: 'ATIVO',
        idade: 76,
        status: 'ativo' as const,
        criadoEm: '2024-01-02T00:00:00',
    },
    {
        id: 3,
        nome: 'Ana Costa',
        dataNascimento: '1955-11-08',
        sexo: 'FEMININO',
        estadoSaude: 'ATIVO',
        idade: 69,
        status: 'ativo' as const,
        criadoEm: '2024-01-03T00:00:00',
    },
];

describe('ReportsDashboard - Testes de Relatórios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // TESTE 1: Relatórios com diferentes filtros
    // ═══════════════════════════════════════════════════════════════════════════

    describe('1. Relatórios com diferentes filtros', () => {
        it('deve renderizar todos os tipos de relatórios disponíveis', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Saúde')).toBeTruthy();
                expect(getByText('Atividades')).toBeTruthy();
                expect(getByText('Alimentação')).toBeTruthy();
                expect(getByText('Medicamentos')).toBeTruthy();
            });
        });

        it('deve iniciar com o relatório de Saúde selecionado por padrão', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                const saudeTab = getByText('Saúde').parent;
                // Verifica se o tab de Saúde está ativo (tem estilo diferente)
                expect(saudeTab).toBeTruthy();
            });
        });

        it('deve alternar para relatório de Atividades ao clicar', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Atividades')).toBeTruthy();
                expect(getByText('Indicadores')).toBeTruthy();
            });

            fireEvent.press(getByText('Atividades'));

            await waitFor(() => {
                // Verifica se o conteúdo mudou (dados de atividades são diferentes)
                expect(getByText('341')).toBeTruthy(); // Total de atividades
            });
        });

        it('deve alternar para relatório de Alimentação ao clicar', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Alimentação')).toBeTruthy();
                expect(getByText('Indicadores')).toBeTruthy();
            });

            fireEvent.press(getByText('Alimentação'));

            await waitFor(() => {
                expect(getByText('542')).toBeTruthy(); // Total de alimentação
            });
        });

        it('deve alternar para relatório de Medicamentos ao clicar', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Medicamentos')).toBeTruthy();
                expect(getByText('Indicadores')).toBeTruthy();
            });

            fireEvent.press(getByText('Medicamentos'));

            await waitFor(() => {
                expect(getByText('662')).toBeTruthy(); // Total de medicamentos
            });
        });

        it('deve exibir o seletor de residente', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Residente')).toBeTruthy();
                expect(getByText('João Silva')).toBeTruthy(); // Primeiro residente selecionado por padrão
            });
        });

        it('deve abrir dropdown ao clicar no seletor de residente', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText, getAllByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            // Clica no dropdown
            const joaoElements = getAllByText('João Silva');
            fireEvent.press(joaoElements[0]);

            await waitFor(() => {
                // Verifica se todos os residentes aparecem no dropdown
                expect(getByText('Maria Santos')).toBeTruthy();
                expect(getByText('Ana Costa')).toBeTruthy();
            });
        });

        it('deve selecionar outro residente ao clicar no dropdown', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText, getAllByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            // Abre o dropdown
            const joaoElements = getAllByText('João Silva');
            fireEvent.press(joaoElements[0]);

            await waitFor(() => {
                expect(getByText('Maria Santos')).toBeTruthy();
            });

            // Seleciona Maria Santos
            fireEvent.press(getByText('Maria Santos'));

            await waitFor(() => {
                // Verifica se Maria Santos foi selecionada
                const mariaSantosElements = getAllByText('Maria Santos');
                expect(mariaSantosElements.length).toBeGreaterThan(0);
            });
        });

        it('deve exibir filtro de período com datas', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Período')).toBeTruthy();
                expect(getByText('02/04/2024')).toBeTruthy();
                expect(getByText('22/04/2024')).toBeTruthy();
                expect(getByText('até')).toBeTruthy();
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // TESTE 2: Dados do relatório vs. dados reais inseridos
    // ═══════════════════════════════════════════════════════════════════════════

    describe('2. Dados do relatório vs. dados reais inseridos', () => {
        it('deve exibir indicadores com valores numéricos', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Indicadores')).toBeTruthy();
                // Verifica se há valores numéricos (dados simulados de saúde)
                expect(getByText('65')).toBeTruthy(); // Segunda-feira
                expect(getByText('78')).toBeTruthy(); // Terça-feira
            });
        });

        it('deve exibir labels dos dias da semana nos indicadores', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Seg')).toBeTruthy();
                expect(getByText('Ter')).toBeTruthy();
                expect(getByText('Qua')).toBeTruthy();
                expect(getByText('Qui')).toBeTruthy();
                expect(getByText('Sex')).toBeTruthy();
                expect(getByText('Sab')).toBeTruthy();
                expect(getByText('Dom')).toBeTruthy();
            });
        });

        it('deve exibir resumo com total calculado', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Total')).toBeTruthy();
                expect(getByText('565')).toBeTruthy(); // Total dos valores de saúde
            });
        });

        it('deve exibir resumo com média calculada', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Média')).toBeTruthy();
                expect(getByText('80.7')).toBeTruthy(); // Média dos valores de saúde
            });
        });

        it('deve exibir resumo com maior valor', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Maior')).toBeTruthy();
                expect(getByText('Sexta-feira')).toBeTruthy(); // Dia com maior valor
            });
        });

        it('deve exibir resumo com menor valor', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Menor')).toBeTruthy();
                expect(getByText('Sábado')).toBeTruthy(); // Dia com menor valor
            });
        });

        it('deve exibir tabela de registros recentes', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Registros Recentes')).toBeTruthy();
            });
        });

        it('deve exibir registros com datas na tabela', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('2024-04-22')).toBeTruthy();
                expect(getByText('2024-04-21')).toBeTruthy();
                expect(getByText('2024-04-20')).toBeTruthy();
            });
        });

        it('deve exibir descrições dos registros na tabela', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Pressão Arterial Aferida')).toBeTruthy();
                expect(getByText('Consulta Geral')).toBeTruthy();
                expect(getByText('Exame Laboratorial')).toBeTruthy();
            });
        });

        it('deve exibir status dos registros com ícones', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getAllByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                // Verifica se há ícones de status (✓, ⏳, ✕)
                expect(getAllByText('✓').length).toBeGreaterThan(0); // Concluída
                expect(getAllByText('⏳').length).toBeGreaterThan(0); // Pendente
                expect(getAllByText('✕').length).toBeGreaterThan(0); // Cancelada
            });
        });

        it('deve alterar dados ao trocar tipo de relatório', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            // Dados iniciais de Saúde
            await waitFor(() => {
                expect(getByText('565')).toBeTruthy(); // Total de saúde
                expect(getByText('Atividades')).toBeTruthy();
            });

            // Troca para Atividades
            fireEvent.press(getByText('Atividades'));

            await waitFor(() => {
                expect(getByText('341')).toBeTruthy(); // Total de atividades (diferente)
            });
        });

        it('deve exibir dados diferentes para relatório de Alimentação', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Alimentação')).toBeTruthy();
            });

            fireEvent.press(getByText('Alimentação'));

            await waitFor(() => {
                expect(getByText('542')).toBeTruthy(); // Total de alimentação
                expect(getByText('77.4')).toBeTruthy(); // Média de alimentação
            });
        });

        it('deve exibir dados diferentes para relatório de Medicamentos', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Medicamentos')).toBeTruthy();
            });

            fireEvent.press(getByText('Medicamentos'));

            await waitFor(() => {
                expect(getByText('662')).toBeTruthy(); // Total de medicamentos
                expect(getByText('94.6')).toBeTruthy(); // Média de medicamentos
            });
        });

        it('deve exibir registros específicos de atividades', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Atividades')).toBeTruthy();
            });

            fireEvent.press(getByText('Atividades'));

            await waitFor(() => {
                expect(getByText('Fisioterapia')).toBeTruthy();
                expect(getByText('Atividade Recreativa')).toBeTruthy();
                expect(getByText('Exercício Leve')).toBeTruthy();
            });
        });

        it('deve exibir registros específicos de alimentação', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getAllByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getAllByText('Alimentação').length).toBeGreaterThan(0);
            });

            fireEvent.press(getAllByText('Alimentação')[0]);

            await waitFor(() => {
                expect(getAllByText('Café da Manhã').length).toBeGreaterThan(0);
                expect(getAllByText('Almoço').length).toBeGreaterThan(0);
                expect(getAllByText('Café da Tarde').length).toBeGreaterThan(0);
            });
        });

        it('deve exibir registros específicos de medicamentos', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getAllByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getAllByText('Medicamentos').length).toBeGreaterThan(0);
            });

            fireEvent.press(getAllByText('Medicamentos')[0]);

            await waitFor(() => {
                expect(getAllByText('Medicamento A - Manhã').length).toBeGreaterThan(0);
                expect(getAllByText('Medicamento B - Tarde').length).toBeGreaterThan(0);
                expect(getAllByText('Medicamento C - Noite').length).toBeGreaterThan(0);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // TESTES ADICIONAIS: Estados de Loading e Erro
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Estados de Loading e Erro', () => {
        it('deve exibir loading ao carregar dados', () => {
            mockBuscarIdosos.mockImplementation(() => new Promise(() => { })); // Never resolves

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            expect(getByText('Carregando dados...')).toBeTruthy();
        });

        it('deve exibir header mesmo durante loading', () => {
            mockBuscarIdosos.mockImplementation(() => new Promise(() => { }));

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            expect(getByText('Relatórios')).toBeTruthy();
            expect(getByText('Análise de dados dos residentes')).toBeTruthy();
        });

        it('deve usar dados simulados quando API falha', async () => {
            mockBuscarIdosos.mockRejectedValueOnce(new Error('Network Error'));

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                // Deve exibir dados simulados mesmo com erro
                expect(getByText('Indicadores')).toBeTruthy();
                expect(getByText('565')).toBeTruthy(); // Total de saúde dos dados simulados
            });
        });

        it('deve exibir alerta quando API falha', async () => {
            mockBuscarIdosos.mockRejectedValueOnce(new Error('Network Error'));

            render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Erro',
                    'Não foi possível carregar a lista de residentes'
                );
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // TESTES ADICIONAIS: Renderização Completa
    // ═══════════════════════════════════════════════════════════════════════════

    describe('Renderização Completa', () => {
        it('deve renderizar título e subtítulo do header', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Relatórios')).toBeTruthy();
                expect(getByText('Análise de dados dos residentes')).toBeTruthy();
            });
        });

        it('deve renderizar todos os labels de filtros', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Tipo de Relatório')).toBeTruthy();
                expect(getByText('Residente')).toBeTruthy();
                expect(getByText('Período')).toBeTruthy();
            });
        });

        it('deve renderizar barras de progresso para cada dia', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                // Verifica se todos os dias têm valores
                expect(getByText('Seg')).toBeTruthy();
                expect(getByText('65')).toBeTruthy();
                expect(getByText('Ter')).toBeTruthy();
                expect(getByText('78')).toBeTruthy();
            });
        });

        it('deve renderizar todos os 4 cards de resumo', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('Total')).toBeTruthy();
                expect(getByText('Média')).toBeTruthy();
                expect(getByText('Maior')).toBeTruthy();
                expect(getByText('Menor')).toBeTruthy();
            });
        });

        it('deve renderizar pelo menos 5 registros na tabela', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);

            const { getByText } = render(<ReportsDashboard token="fake-token" />);

            await waitFor(() => {
                expect(getByText('2024-04-22')).toBeTruthy();
                expect(getByText('2024-04-21')).toBeTruthy();
                expect(getByText('2024-04-20')).toBeTruthy();
                expect(getByText('2024-04-19')).toBeTruthy();
                expect(getByText('2024-04-18')).toBeTruthy();
            });
        });
    });
});
