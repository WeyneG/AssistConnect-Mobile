import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './Home';
import { ForgotPasswordScreen } from './ForgotPassword';
import { SignUpScreen } from './SignUp';
import { HomePage } from './src/pages/home_page';
import { PerfilIdosoPage } from './src/pages/perfil_idoso_page';

type Screen = 'login' | 'forgotPassword' | 'signUp' | 'home' | 'perfilIdoso';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userToken, setUserToken] = useState<string | null>(null);
  const [idosoSelecionadoId, setIdosoSelecionadoId] = useState<number | null>(null);

  const handleLoginSuccess = (token: string) => {
    setUserToken(token);
    setIdosoSelecionadoId(null);
    setCurrentScreen('home');
  };

  const handleDemoAccess = () => {
    setUserToken(null);
    setIdosoSelecionadoId(null);
    setCurrentScreen('home');
  };

  const handleForgotPassword = () => setCurrentScreen('forgotPassword');
  const handleSignUp = () => setCurrentScreen('signUp');
  const handleBackToLogin = () => {
    setUserToken(null);
    setIdosoSelecionadoId(null);
    setCurrentScreen('login');
  };
  const handleBackToHome = () => setCurrentScreen('home');

  const handleVerPerfil = (idosoId: number) => {
    setIdosoSelecionadoId(idosoId);
    setCurrentScreen('perfilIdoso');
  };

  if (currentScreen === 'forgotPassword') {
    return (
      <>
        <ForgotPasswordScreen onBackToLogin={handleBackToLogin} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (currentScreen === 'signUp') {
    return (
      <>
        <SignUpScreen onBackToLogin={handleBackToLogin} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (currentScreen === 'perfilIdoso' && idosoSelecionadoId !== null) {
    return (
      <>
        <PerfilIdosoPage idosoId={idosoSelecionadoId} onBack={handleBackToHome} />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'login') {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
          onDemoAccess={handleDemoAccess}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <HomePage onLogout={handleBackToLogin} onVerPerfil={handleVerPerfil} />
      <StatusBar style="dark" />
    </>
  );
}
