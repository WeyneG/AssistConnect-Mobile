import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onForgotPassword, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos');
    return;
  }

  try {
    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);

    if (result.token) {
      onLoginSuccess();
    } else {
      Alert.alert('Erro', 'Email ou senha inválidos');
    }

  } catch (error) {
    setIsLoading(false);
    Alert.alert('Erro', 'Não foi possível conectar ao servidor');
  }
};

  const handleForgotPasswordPress = () => {
    onForgotPassword();
  };

  const handleSignUpPress = () => {
    onSignUp();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Logo</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Bem vindo ao Assisconnect!</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Palavra-passe"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Support Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={handleForgotPasswordPress}>
            <Text style={styles.link}>Esqueci-me da palavra-passe</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignUpPress}>
            <Text style={styles.link}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerText}>Acessibilidade</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>|</Text>
          <TouchableOpacity>
            <Text style={styles.footerText}>Suporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F4E8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3E2010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E2010',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 16,
    color: '#3E2010',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#3E2010',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  link: {
    color: '#3E2010',
    fontSize: 14,
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
  },
  footerSeparator: {
    color: '#6B7280',
    fontSize: 12,
    marginHorizontal: 16,
  },
});
