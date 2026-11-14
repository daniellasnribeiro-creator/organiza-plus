import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTasks } from '../context/TaskContext';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { firebaseAuthErrorMessage } from '../utils/firebaseError';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useTasks();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Digite seu e-mail e sua senha.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await login(trimmedEmail, password);
    } catch (loginError) {
      console.error('Erro ao entrar na conta', loginError);
      setError(firebaseAuthErrorMessage(loginError, 'login'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heading}>
            <View style={styles.icon}>
              <Ionicons name="log-in-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Entre na sua conta</Text>
            <Text style={styles.subtitle}>Use o e-mail e a senha do seu cadastro.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="voce@exemplo.com"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              maxLength={254}
              accessibilityLabel="E-mail"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              maxLength={128}
              accessibilityLabel="Senha"
            />
          </View>

          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}

          <PrimaryButton
            label={saving ? 'Entrando...' : 'Entrar'}
            icon="log-in-outline"
            onPress={handleLogin}
            disabled={saving}
            style={styles.submit}
          />
          <PrimaryButton
            label="Voltar"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.back}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  heading: { alignItems: 'center', marginBottom: spacing.xl },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
  submit: { marginTop: spacing.lg },
  back: { marginTop: spacing.md },
});
