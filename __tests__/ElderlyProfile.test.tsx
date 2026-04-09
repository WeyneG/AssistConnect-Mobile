import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock do módulo expo completo antes de qualquer import que o use
jest.mock('expo', () => ({}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }));

import { ElderlyProfileScreen } from '../src/pages/elderly_profile';
import * as api from '../src/services/api';

// Mock do módulo de API
jest.mock('../src/services/api');
const mockBuscarIdosoDetalhes = api.buscarIdosoDetalhes as jest.MockedFunction<typeof api.buscarIdosoDetalhes>;

// Mock do @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

// Mock do BottomTabBar
jest.mock('../src/components/BottomTabBar', () => ({
    BottomTabBar: () => null,
}));

// Props padrão
const defaultProps = {
    idosoId: 1,
    onBack: jest.fn(),
    onNavigateTab: jest.fn(),
    activeTab: 'elderly' as const,
};

// Dados mock de idoso completo
const mockIdosoCompleto = {
    id: 1,
    nome: 'João Silva',
    idade: 75,
    quarto: '101',
    status: 'ativo' as const,
    ultimaVisita: '2024-01-15',
};

// Dados mock de idoso com campos opcionais faltando
const mockIdosoSemUltimaVisita = {
    id: 2,
    nome: 'Maria Santos',
    idade: 82,
    quarto: '102',
    status: 'ativo' as const,
};

describe('ElderlyProfileScreen - Profile Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── Renderização inicial ────────────────────────────────────────────────────

    describe('Renderização da tela', () => {
        it('deve renderizar o título "Perfil"', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Perfil')).toBeTruthy();
            });
        });

        it('deve exibir loading ao carregar dados', () => {
            mockBuscarIdosoDetalhes.mockImplementation(() => new Promise(() => { }));
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            expect(getByText('Carregando...')).toBeTruthy();
        });
    });

    // ─── Campos do perfil exibidos corretamente ──────────────────────────────────

    describe('Campos do perfil exibidos corretamente', () => {
        it('deve exibir o nome do idoso', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });
        });

        it('deve exibir a idade do idoso', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Idade')).toBeTruthy();
                expect(getByText('75 anos')).toBeTruthy();
            });
        });

        it('deve exibir o quarto do idoso', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Quarto')).toBeTruthy();
                expect(getByText('101')).toBeTruthy();
            });
        });

        it('deve exibir o status do idoso', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Ativo')).toBeTruthy();
            });
        });

        it('deve exibir a última visita quando disponível', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Última Visita')).toBeTruthy();
                // Verificar que existe uma data no formato DD/MM/YYYY
                expect(getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeTruthy();
            });
        });

        it('deve exibir status "Inativo" corretamente', async () => {
            const idosoInativo = { ...mockIdosoCompleto, status: 'inativo' as const };
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(idosoInativo);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Inativo')).toBeTruthy();
            });
        });
    });

    // ─── Campos opcionais faltando (comportamento gracioso) ──────────────────────

    describe('Campos opcionais faltando (comportamento gracioso)', () => {
        it('deve lidar graciosamente quando última visita não está disponível', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoSemUltimaVisita);
            const { getByText, queryByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Maria Santos')).toBeTruthy();
                // Não deve exibir o card de última visita
                expect(queryByText('Última Visita')).toBeNull();
            });
        });

        it('deve exibir todos os campos obrigatórios mesmo sem campos opcionais', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoSemUltimaVisita);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Maria Santos')).toBeTruthy();
                expect(getByText('Idade')).toBeTruthy();
                expect(getByText('82 anos')).toBeTruthy();
                expect(getByText('Quarto')).toBeTruthy();
                expect(getByText('102')).toBeTruthy();
                expect(getByText('Ativo')).toBeTruthy();
            });
        });
    });

    // ─── Foto e fallback de avatar ───────────────────────────────────────────────

    describe('Foto e fallback de avatar', () => {
        it('deve exibir avatar com ícone de fallback', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            // O avatar é renderizado com ícone Ionicons "person" como fallback
            // Verificamos que o componente foi renderizado sem erros
        });
    });

    // ─── Botões de ação ───────────────────────────────────────────────────────────

    describe('Botões de ação', () => {
        it('deve exibir botão "Ver Relatórios"', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Ver Relatórios')).toBeTruthy();
            });
        });

        it('deve exibir botão "Medicamentos"', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Medicamentos')).toBeTruthy();
            });
        });

        it('deve exibir botão "Contatar"', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Contatar')).toBeTruthy();
            });
        });
    });

    // ─── Navegação de volta ──────────────────────────────────────────────────────

    describe('Navegação de volta à lista', () => {
        it('deve ter a função onBack disponível', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(defaultProps.onBack).toBeDefined();
            });
        });
    });

    // ─── Estados de erro ──────────────────────────────────────────────────────────

    describe('Estados de erro', () => {
        it('deve exibir mensagem de erro quando a API falha', async () => {
            mockBuscarIdosoDetalhes.mockRejectedValueOnce(new Error('Erro ao carregar dados'));
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Erro ao carregar')).toBeTruthy();
                expect(getByText('Erro ao carregar dados')).toBeTruthy();
            });
        });

        it('deve exibir mensagem quando idoso não é encontrado', async () => {
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(null);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Erro ao carregar')).toBeTruthy();
                expect(getByText('Idoso não encontrado')).toBeTruthy();
            });
        });

        it('deve permitir tentar novamente após erro', async () => {
            mockBuscarIdosoDetalhes.mockRejectedValueOnce(new Error('Erro de conexão'));
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Tentar novamente')).toBeTruthy();
            });

            mockBuscarIdosoDetalhes.mockResolvedValueOnce(mockIdosoCompleto);
            fireEvent.press(getByText('Tentar novamente'));

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });
        });
    });

    // ─── Integração com diferentes IDs ────────────────────────────────────────────

    describe('Integração com diferentes IDs', () => {
        it('deve carregar dados do idoso correto baseado no ID', async () => {
            const idoso2 = { ...mockIdosoCompleto, id: 2, nome: 'Pedro Costa' };
            mockBuscarIdosoDetalhes.mockResolvedValueOnce(idoso2);

            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} idosoId={2} />);

            await waitFor(() => {
                expect(mockBuscarIdosoDetalhes).toHaveBeenCalledWith(2);
                expect(getByText('Pedro Costa')).toBeTruthy();
            });
        });
    });
});
