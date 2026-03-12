import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './Home';
import { ForgotPasswordScreen } from './ForgotPassword';
import { SignUpScreen } from './SignUp';
import { HomePage } from './src/pages/home_page';

type Screen = 'login' | 'forgotPassword' | 'signUp' | 'home';

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
