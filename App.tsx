import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './Home';
import { ForgotPasswordScreen } from './ForgotPassword';
import { SignUpScreen } from './SignUp';
import { HomePage } from './src/pages/home_page';
<<<<<<< Updated upstream

type Screen = 'login' | 'forgotPassword' | 'signUp' | 'home';
=======
import { PerfilIdosoPage } from './src/pages/perfil_idoso_page';
import { ActivitiesPage } from './src/pages/activities_page';

type Screen = 'login' | 'forgotPassword' | 'signUp' | 'home' | 'perfilIdoso' | 'activities';
>>>>>>> Stashed changes

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const handleLoginSuccess = () => {
    setCurrentScreen('home');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const handleSignUp = () => {
    setCurrentScreen('signUp');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
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

<<<<<<< Updated upstream
=======
  if (currentScreen === 'perfilIdoso' && idosoSelecionadoId !== null) {
    return (
      <>
        <PerfilIdosoPage idosoId={idosoSelecionadoId} onBack={handleBackToHome} />
        <StatusBar style="light" />
      </>
    );
  }

  if (currentScreen === 'activities') {
    return (
      <>
        <ActivitiesPage onBack={handleBackToHome} />
        <StatusBar style="light" />
      </>
    );
  }

>>>>>>> Stashed changes
  if (currentScreen === 'login') {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  // Home Screen (após login)
  return (
    <>
      <HomePage onLogout={handleBackToLogin} />
      <StatusBar style="dark" />
    </>
  );
}
