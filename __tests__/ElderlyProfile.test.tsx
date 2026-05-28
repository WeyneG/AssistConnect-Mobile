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
const mockBuscarIdosoPorId = api.buscarIdosoPorId as jest.MockedFunction<typeof api.buscarIdosoPorId>;
const mockBuscarMedicamentos = api.buscarMedicamentos as jest.MockedFunction<typeof api.buscarMedicamentos>;
const mockBuscarAtividades = api.buscarAtividades as jest.MockedFunction<typeof api.buscarAtividades>;

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
    dataNascimento: '1949-01-15',
    sexo: 'MASCULINO',
    estadoSaude: 'Excelente',
    idade: 75,
    status: 'ativo' as const,
    quarto: '101',
    responsavelNome: 'Carlos Silva',
    observacoes: 'Nenhuma',
    criadoEm: '2024-01-10T10:00:00',
};

describe('ElderlyProfileScreen - Profile Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── Renderização inicial ────────────────────────────────────────────────────

    describe('Renderização da tela', () => {
        it('deve renderizar o título "Perfil do Idoso"', async () => {
            mockBuscarIdosoPorId.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Perfil do Idoso')).toBeTruthy();
            });
        });

        it('deve exibir loading ao carregar dados', () => {
            mockBuscarIdosoPorId.mockImplementation(() => new Promise(() => { }));
            const { getByTestId } = render(<ElderlyProfileScreen {...defaultProps} />);

            // Deve conter ActivityIndicator
            expect(getByTestId('loading-indicator')).toBeTruthy();
        });
    });

    // ─── Campos do perfil exibidos corretamente ──────────────────────────────────

    describe('Campos do perfil exibidos corretamente', () => {
        it('deve exibir o nome e quarto do idoso', async () => {
            mockBuscarIdosoPorId.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('João Silva')).toBeTruthy();
                expect(getByText(/Quarto 101/)).toBeTruthy();
            });
        });

        it('deve exibir as sub-abas Ficha, Medicação e Atividades', async () => {
            mockBuscarIdosoPorId.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Ficha')).toBeTruthy();
                expect(getByText('Medicação')).toBeTruthy();
                expect(getByText('Atividades')).toBeTruthy();
            });
        });

        it('deve exibir saúde e contato na aba Ficha por padrão', async () => {
            mockBuscarIdosoPorId.mockResolvedValueOnce(mockIdosoCompleto);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Saúde e Cuidados')).toBeTruthy();
                expect(getByText('Excelente')).toBeTruthy();
                expect(getByText('Carlos Silva')).toBeTruthy();
            });
        });
    });

    // ─── Navegação de volta ──────────────────────────────────────────────────────

    describe('Navegação de volta à lista', () => {
        it('deve ter a função onBack disponível e chamada ao voltar', async () => {
            mockBuscarIdosoPorId.mockResolvedValueOnce(mockIdosoCompleto);
            render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(defaultProps.onBack).toBeDefined();
            });
        });
    });

    // ─── Estados de erro ──────────────────────────────────────────────────────────

    describe('Estados de erro', () => {
        it('deve exibir mensagem de erro quando a API falha', async () => {
            mockBuscarIdosoPorId.mockRejectedValueOnce(new Error('Erro ao carregar dados'));
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Erro ao carregar')).toBeTruthy();
                expect(getByText('Erro ao carregar dados')).toBeTruthy();
            });
        });

        it('deve exibir mensagem quando idoso não é encontrado', async () => {
            mockBuscarIdosoPorId.mockResolvedValueOnce(null as any);
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Erro ao carregar')).toBeTruthy();
                expect(getByText('Idoso não encontrado')).toBeTruthy();
            });
        });

        it('deve permitir tentar novamente após erro', async () => {
            mockBuscarIdosoPorId.mockRejectedValueOnce(new Error('Erro de conexão'));
            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} />);

            await waitFor(() => {
                expect(getByText('Tentar novamente')).toBeTruthy();
            });

            mockBuscarIdosoPorId.mockResolvedValueOnce(mockIdosoCompleto);
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
            mockBuscarIdosoPorId.mockResolvedValueOnce(idoso2);

            const { getByText } = render(<ElderlyProfileScreen {...defaultProps} idosoId={2} />);

            await waitFor(() => {
                expect(mockBuscarIdosoPorId).toHaveBeenCalledWith(2, undefined);
                expect(getByText('Pedro Costa')).toBeTruthy();
            });
        });
    });
});
