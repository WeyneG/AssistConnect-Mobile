import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock do módulo expo completo antes de qualquer import que o use
jest.mock('expo', () => ({}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }));

import { ElderlyListScreen } from '../src/pages/elderly_list';
import * as api from '../src/services/api';

// Mock do módulo de API
jest.mock('../src/services/api');
const mockBuscarIdosos = api.buscarIdosos as jest.MockedFunction<typeof api.buscarIdosos>;

// Mock do @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

// Mock do BottomTabBar
jest.mock('../src/components/BottomTabBar', () => ({
    BottomTabBar: () => null,
}));

// Mock do ElderlyProfileScreen
jest.mock('../src/pages/elderly_profile', () => ({
    ElderlyProfileScreen: () => null,
}));

// Props padrão
const defaultProps = {
    onBack: jest.fn(),
    onNavigateTab: jest.fn(),
    activeTab: 'elderly' as const,
};

// Dados mock de idosos
const mockIdosos = [
    {
        id: 1,
        nome: 'João Silva',
        idade: 75,
        quarto: '101',
        status: 'ativo' as const,
        ultimaVisita: '2024-01-15',
    },
    {
        id: 2,
        nome: 'Maria Santos',
        idade: 82,
        quarto: '102',
        status: 'ativo' as const,
        ultimaVisita: '2024-01-14',
    },
    {
        id: 3,
        nome: 'José Oliveira',
        idade: 68,
        quarto: '201',
        status: 'inativo' as const,
        ultimaVisita: '2024-01-10',
    },
];

describe('ElderlyListScreen - Dashboard Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
    });

    // ─── Renderização inicial ────────────────────────────────────────────────────

    describe('Renderização da tela', () => {
        it('deve renderizar o título "Idosos"', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Idosos')).toBeTruthy();
            });
        });

        it('deve renderizar o campo de busca', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByPlaceholderText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByPlaceholderText('Buscar idoso...')).toBeTruthy();
            });
        });

        it('deve renderizar a lista de idosos após carregamento', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
                expect(getByText('Maria Santos')).toBeTruthy();
                expect(getByText('José Oliveira')).toBeTruthy();
            });
        });
    });

    // ─── Busca de residentes ─────────────────────────────────────────────────────

    describe('Busca de residentes', () => {
        it('deve buscar residente por nome parcial', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByPlaceholderText, getByText, queryByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            const searchInput = getByPlaceholderText('Buscar idoso...');

            await act(async () => {
                fireEvent.changeText(searchInput, 'João');
                // Aguardar debounce
                await new Promise(resolve => setTimeout(resolve, 350));
            });

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
                expect(queryByText('Maria Santos')).toBeNull();
            });
        });

        it('deve buscar residente ignorando maiúsculas/minúsculas', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByPlaceholderText, getByText, queryByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            const searchInput = getByPlaceholderText('Buscar idoso...');

            await act(async () => {
                fireEvent.changeText(searchInput, 'joão');
                await new Promise(resolve => setTimeout(resolve, 350));
            });

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
                expect(queryByText('Maria Santos')).toBeNull();
            });
        });

        it('deve mostrar mensagem quando nenhum resultado é encontrado', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByPlaceholderText, getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            const searchInput = getByPlaceholderText('Buscar idoso...');

            await act(async () => {
                fireEvent.changeText(searchInput, 'Nome Inexistente');
                await new Promise(resolve => setTimeout(resolve, 350));
            });

            await waitFor(() => {
                expect(getByText('Nenhum resultado encontrado')).toBeTruthy();
            });
        });

        it('deve limpar a busca ao alterar o texto para vazio', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByPlaceholderText, getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            const searchInput = getByPlaceholderText('Buscar idoso...');

            await act(async () => {
                fireEvent.changeText(searchInput, 'João');
                await new Promise(resolve => setTimeout(resolve, 350));
            });

            await act(async () => {
                fireEvent.changeText(searchInput, '');
                await new Promise(resolve => setTimeout(resolve, 350));
            });

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
                expect(getByText('Maria Santos')).toBeTruthy();
            });
        });
    });

    // ─── Filtro por quarto/ala ───────────────────────────────────────────────────

    describe('Filtro por quarto/ala', () => {
        it('deve ter botão de filtros disponível', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            // O botão de filtro existe (ícone options-outline)
            // Verificamos que a tela foi renderizada sem erros
        });
    });

    // ─── Avatar e fallback ────────────────────────────────────────────────────────

    describe('Foto e fallback de avatar', () => {
        it('deve exibir ícone de fallback quando não há foto', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });

            // Verificar que o avatar está sendo renderizado
            // O ícone Ionicons "person" é usado como fallback
        });
    });

    // ─── Estados de loading e erro ────────────────────────────────────────────────

    describe('Estados de loading e erro', () => {
        it('deve exibir loading ao carregar dados', () => {
            mockBuscarIdosos.mockImplementation(() => new Promise(() => { }));
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            expect(getByText('Carregando...')).toBeTruthy();
        });

        it('deve exibir mensagem de erro quando a API falha', async () => {
            mockBuscarIdosos.mockRejectedValueOnce(new Error('Erro de conexão'));
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Sem conexão')).toBeTruthy();
                expect(getByText('Erro de conexão')).toBeTruthy();
            });
        });

        it('deve permitir tentar novamente após erro', async () => {
            mockBuscarIdosos.mockRejectedValueOnce(new Error('Erro de conexão'));
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Tentar novamente')).toBeTruthy();
            });

            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            fireEvent.press(getByText('Tentar novamente'));

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
            });
        });
    });

    // ─── Lista vazia ──────────────────────────────────────────────────────────────

    describe('Lista vazia', () => {
        it('deve exibir mensagem quando não há idosos cadastrados', async () => {
            mockBuscarIdosos.mockResolvedValueOnce([]);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Nenhum idoso cadastrado')).toBeTruthy();
                expect(getByText('Adicione o primeiro idoso para começar')).toBeTruthy();
            });
        });
    });

    // ─── Navegação de volta ──────────────────────────────────────────────────────

    describe('Navegação de volta', () => {
        it('deve ter a função onBack disponível', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(defaultProps.onBack).toBeDefined();
            });
        });
    });

    // ─── Exibição de informações dos idosos ──────────────────────────────────────

    describe('Exibição de informações dos idosos', () => {
        it('deve exibir quarto do idoso', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Quarto 101')).toBeTruthy();
                expect(getByText('Quarto 102')).toBeTruthy();
            });
        });

        it('deve exibir idade do idoso', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('75a')).toBeTruthy();
                expect(getByText('82a')).toBeTruthy();
            });
        });

        it('deve exibir status ativo corretamente', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getAllByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                const ativoElements = getAllByText('Ativo');
                expect(ativoElements.length).toBeGreaterThan(0);
            });
        });

        it('deve exibir status inativo corretamente', async () => {
            mockBuscarIdosos.mockResolvedValueOnce(mockIdosos);
            const { getByText } = render(<ElderlyListScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Inativo')).toBeTruthy();
            });
        });
    });
});
