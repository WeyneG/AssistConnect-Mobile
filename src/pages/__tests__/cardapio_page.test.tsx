import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CardapioPage } from '../cardapio_page';
import * as api from '../../services/api';

// Mock da API
jest.mock('../../services/api');

const mockCardapioHoje = [
    {
        id: 1,
        data: '2026-04-30',
        tipo: 'cafe' as const,
        descricao: 'Pão integral com manteiga, suco de laranja natural e iogurte',
        observacoes: 'Servir morno. Evitar açúcar refinado.',
        alimentos: ['Pão integral', 'Manteiga', 'Suco de laranja', 'Iogurte natural'],
        restricoes: ['Sem glúten disponível', 'Opção sem lactose'],
        calorias: 320,
        status: 'servida' as const,
    },
    {
        id: 2,
        data: '2026-04-30',
        tipo: 'almoco' as const,
        descricao: 'Arroz, feijão, frango grelhado, salada de folhas e suco de maracujá',
        observacoes: 'Dieta hipossódica para residentes com hipertensão.',
        alimentos: ['Arroz branco', 'Feijão carioca', 'Frango grelhado', 'Salada verde', 'Suco de maracujá'],
        restricoes: ['Baixo sódio', 'Sem pimenta'],
        calorias: 680,
        status: 'servida' as const,
    },
    {
        id: 3,
        data: '2026-04-30',
        tipo: 'lanche' as const,
        descricao: 'Fruta da estação e chá de camomila',
        alimentos: ['Banana', 'Maçã', 'Chá de camomila'],
        restricoes: [],
        calorias: 150,
        status: 'pendente' as const,
    },
    {
        id: 4,
        data: '2026-04-30',
        tipo: 'jantar' as const,
        descricao: 'Sopa de legumes com macarrão e pão de forma',
        observacoes: 'Consistência pastosa disponível para quem necessitar.',
        alimentos: ['Sopa de legumes', 'Macarrão', 'Pão de forma'],
        restricoes: ['Opção pastosa', 'Sem glúten disponível'],
        calorias: 420,
        status: 'pendente' as const,
    },
];

const mockCardapioOutroDia = [
    {
        id: 5,
        data: '2026-05-01',
        tipo: 'cafe' as const,
        descricao: 'Tapioca com queijo e café com leite',
        alimentos: ['Tapioca', 'Queijo minas', 'Café com leite'],
        restricoes: ['Opção sem lactose'],
        calorias: 280,
        status: 'pendente' as const,
    },
];

describe('CardapioPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── Teste 1: Cardápio do dia atual ──────────────────────────────────────
    it('deve exibir o cardápio do dia atual corretamente', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText, getAllByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
            expect(getByText('Almoço')).toBeTruthy();
            expect(getByText('Lanche')).toBeTruthy();
            expect(getByText('Jantar')).toBeTruthy();
        });

        // Verifica descrições
        expect(getByText(/Pão integral com manteiga/)).toBeTruthy();
        expect(getByText(/Arroz, feijão, frango grelhado/)).toBeTruthy();
    });

    // ─── Teste 2: Navegação entre dias ───────────────────────────────────────
    it('deve permitir navegar para outros dias', async () => {
        (api.buscarCardapio as jest.Mock)
            .mockResolvedValueOnce(mockCardapioHoje)
            .mockResolvedValueOnce(mockCardapioOutroDia);

        const { getByText, getByLabelText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
        });

        // Navega para o próximo dia
        const btnProximo = getByLabelText('Próximo dia') || getByText('›');
        fireEvent.press(btnProximo);

        await waitFor(() => {
            expect(api.buscarCardapio).toHaveBeenCalledWith('2026-05-01', undefined);
            expect(getByText(/Tapioca com queijo/)).toBeTruthy();
        });
    });

    // ─── Teste 3: Checklist de refeições (marcar/desmarcar status) ───────────
    it('deve exibir status servida e pendente corretamente', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText, getAllByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
        });

        // Verifica status "Servida" no café e almoço
        const servidas = getAllByText('Servida');
        expect(servidas.length).toBe(2);

        // Verifica status "Pendente" no lanche e jantar
        const pendentes = getAllByText('Pendente');
        expect(pendentes.length).toBe(2);
    });

    // ─── Teste 4: Restrições alimentares exibidas ────────────────────────────
    it('deve exibir restrições alimentares corretamente', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
        });

        // Expande o card do café da manhã
        const cardCafe = getByText('Café da Manhã');
        fireEvent.press(cardCafe);

        await waitFor(() => {
            expect(getByText('Sem glúten disponível')).toBeTruthy();
            expect(getByText('Opção sem lactose')).toBeTruthy();
        });
    });

    // ─── Teste 5: Exibição de observações ────────────────────────────────────
    it('deve exibir observações quando expandido', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Almoço')).toBeTruthy();
        });

        // Expande o card do almoço
        const cardAlmoco = getByText('Almoço');
        fireEvent.press(cardAlmoco);

        await waitFor(() => {
            expect(getByText(/Dieta hipossódica/)).toBeTruthy();
        });
    });

    // ─── Teste 6: Exibição de alimentos ──────────────────────────────────────
    it('deve exibir lista de alimentos quando expandido', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
        });

        // Expande o card
        const cardCafe = getByText('Café da Manhã');
        fireEvent.press(cardCafe);

        await waitFor(() => {
            expect(getByText('Pão integral')).toBeTruthy();
            expect(getByText('Manteiga')).toBeTruthy();
            expect(getByText('Suco de laranja')).toBeTruthy();
            expect(getByText('Iogurte natural')).toBeTruthy();
        });
    });

    // ─── Teste 7: Exibição de calorias ───────────────────────────────────────
    it('deve exibir calorias quando expandido', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
        });

        // Expande o card
        const cardCafe = getByText('Café da Manhã');
        fireEvent.press(cardCafe);

        await waitFor(() => {
            expect(getByText('320 kcal')).toBeTruthy();
        });
    });

    // ─── Teste 8: Pull-to-refresh ────────────────────────────────────────────
    it('deve recarregar dados ao fazer pull-to-refresh', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByTestId } = render(<CardapioPage />);

        await waitFor(() => {
            expect(api.buscarCardapio).toHaveBeenCalledTimes(1);
        });

        // Simula pull-to-refresh
        const scrollView = getByTestId('cardapio-scroll');
        fireEvent(scrollView, 'refresh');

        await waitFor(() => {
            expect(api.buscarCardapio).toHaveBeenCalledTimes(2);
        });
    });

    // ─── Teste 9: Resumo do dia ──────────────────────────────────────────────
    it('deve exibir resumo correto (servidas/pendentes)', async () => {
        (api.buscarCardapio as jest.Mock).mockResolvedValue(mockCardapioHoje);

        const { getByText } = render(<CardapioPage />);

        await waitFor(() => {
            // 2 servidas (café e almoço)
            expect(getByText('2')).toBeTruthy();
            // 2 pendentes (lanche e jantar)
            expect(getByText('2')).toBeTruthy();
            // 4 refeições no total
            expect(getByText('4')).toBeTruthy();
        });
    });

    // ─── Teste 10: Fallback para dados demo ──────────────────────────────────
    it('deve exibir dados demo quando API falha', async () => {
        (api.buscarCardapio as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { getByText } = render(<CardapioPage />);

        await waitFor(() => {
            expect(getByText('Café da Manhã')).toBeTruthy();
            expect(getByText('Exibindo dados de demonstração')).toBeTruthy();
        });
    });
});
