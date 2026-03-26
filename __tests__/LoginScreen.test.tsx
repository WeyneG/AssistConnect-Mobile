import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock do módulo expo completo antes de qualquer import que o use
jest.mock('expo', () => ({}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }));

import { LoginScreen } from '../Home';
import * as api from '../services/api';

// Mock do módulo de API
jest.mock('../services/api');
const mockLogin = api.login as jest.MockedFunction<typeof api.login>;

// Mock do @expo/vector-icons para não quebrar no ambiente de teste
jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

// Props padrão reutilizáveis
const defaultProps = {
    onLoginSuccess: jest.fn(),
    onForgotPassword: jest.fn(),
    onSignUp: jest.fn(),
};

describe('LoginScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
    });

    // ─── Renderização ────────────────────────────────────────────────────────────

    describe('Renderização da tela', () => {
        it('deve renderizar o título AssistConnect', () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);
            expect(getByText('AssistConnect')).toBeTruthy();
        });

        it('deve renderizar o campo de e-mail', () => {
            const { getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);
            expect(getByPlaceholderText('seu@email.com')).toBeTruthy();
        });

        it('deve renderizar o campo de senha', () => {
            const { getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);
            expect(getByPlaceholderText('••••••••')).toBeTruthy();
        });

        it('deve renderizar o botão Entrar', () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);
            expect(getByText('Entrar')).toBeTruthy();
        });

        it('deve renderizar o link "Esqueceu a senha?"', () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);
            expect(getByText('Esqueceu a senha?')).toBeTruthy();
        });

        it('deve renderizar o link "Criar conta"', () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);
            expect(getByText('Criar conta')).toBeTruthy();
        });
    });

    // ─── Validação de campos obrigatórios ────────────────────────────────────────

    describe('Validação de campos obrigatórios', () => {
        it('deve exibir alerta quando email e senha estão vazios', async () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Erro',
                    'Por favor, preencha todos os campos'
                );
            });
        });

        it('deve exibir alerta quando apenas o email está preenchido', async () => {
            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'teste@email.com');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Erro',
                    'Por favor, preencha todos os campos'
                );
            });
        });

        it('deve exibir alerta quando apenas a senha está preenchida', async () => {
            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('••••••••'), '123456');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Erro',
                    'Por favor, preencha todos os campos'
                );
            });
        });
    });

    // ─── Validação de email inválido ──────────────────────────────────────────────

    describe('Validação de email inválido', () => {
        it('o campo de email deve ter keyboardType email-address', () => {
            const { getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);
            const emailInput = getByPlaceholderText('seu@email.com');
            expect(emailInput.props.keyboardType).toBe('email-address');
        });

        it('o campo de email deve ter autoCapitalize none', () => {
            const { getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);
            const emailInput = getByPlaceholderText('seu@email.com');
            expect(emailInput.props.autoCapitalize).toBe('none');
        });
    });

    // ─── Clique no botão Entrar ───────────────────────────────────────────────────

    describe('Clique no botão Entrar', () => {
        it('não deve chamar a API quando os campos estão vazios', async () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(mockLogin).not.toHaveBeenCalled();
            });
        });

        it('deve chamar a API com email e senha quando os campos estão preenchidos', async () => {
            mockLogin.mockResolvedValueOnce({ token: 'fake-token' });

            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'teste@email.com');
            fireEvent.changeText(getByPlaceholderText('••••••••'), '123456');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('teste@email.com', '123456');
            });
        });
    });

    // ─── Login com sucesso ────────────────────────────────────────────────────────

    describe('Login com sucesso', () => {
        it('deve chamar onLoginSuccess com o token quando a API retorna token', async () => {
            mockLogin.mockResolvedValueOnce({ token: 'token-valido-123' });

            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'cuidador@assistconnect.com');
            fireEvent.changeText(getByPlaceholderText('••••••••'), 'senha123');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(defaultProps.onLoginSuccess).toHaveBeenCalledWith('token-valido-123');
            });
        });

        it('não deve exibir alerta de erro quando o login é bem-sucedido', async () => {
            mockLogin.mockResolvedValueOnce({ token: 'token-valido-123' });

            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'cuidador@assistconnect.com');
            fireEvent.changeText(getByPlaceholderText('••••••••'), 'senha123');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(Alert.alert).not.toHaveBeenCalled();
            });
        });
    });

    // ─── Login com erro ───────────────────────────────────────────────────────────

    describe('Login com erro', () => {
        it('deve exibir alerta quando a API retorna sem token', async () => {
            mockLogin.mockResolvedValueOnce({ token: '' });

            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'errado@email.com');
            fireEvent.changeText(getByPlaceholderText('••••••••'), 'senhaerrada');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Email ou senha inválidos');
            });
        });

        it('deve exibir alerta de conexão quando a API lança exceção', async () => {
            mockLogin.mockRejectedValueOnce(new Error('Network Error'));

            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'teste@email.com');
            fireEvent.changeText(getByPlaceholderText('••••••••'), '123456');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Erro',
                    'Não foi possível conectar ao servidor'
                );
            });
        });

        it('não deve chamar onLoginSuccess quando o login falha', async () => {
            mockLogin.mockRejectedValueOnce(new Error('Network Error'));

            const { getByText, getByPlaceholderText } = render(<LoginScreen {...defaultProps} />);

            fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'teste@email.com');
            fireEvent.changeText(getByPlaceholderText('••••••••'), '123456');
            fireEvent.press(getByText('Entrar'));

            await waitFor(() => {
                expect(defaultProps.onLoginSuccess).not.toHaveBeenCalled();
            });
        });
    });

    // ─── Navegação ────────────────────────────────────────────────────────────────

    describe('Navegação', () => {
        it('deve chamar onForgotPassword ao clicar em "Esqueceu a senha?"', () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);
            fireEvent.press(getByText('Esqueceu a senha?'));
            expect(defaultProps.onForgotPassword).toHaveBeenCalledTimes(1);
        });

        it('deve chamar onSignUp ao clicar em "Criar conta"', () => {
            const { getByText } = render(<LoginScreen {...defaultProps} />);
            fireEvent.press(getByText('Criar conta'));
            expect(defaultProps.onSignUp).toHaveBeenCalledTimes(1);
        });
    });
});
