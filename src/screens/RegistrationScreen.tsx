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
import { useTasks } from '../context/TaskContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { firebaseAuthErrorMessage } from '../utils/firebaseError';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export function RegistrationScreen({ route }: Props) {
  const { register } = useTasks();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const digits = phone.replace(/\D/g, '');

    if (trimmedName.length < 2) {
      setError('Digite seu nome completo ou pelo menos 2 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Digite um e-mail válido.');
      return;
    }
    if (digits.length < 10 || digits.length > 15) {
      setError('Digite um telefone com DDD e pelo menos 10 números.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await register(trimmedName, trimmedEmail, phone.trim(), password, route.params.withSamples);
    } catch (registrationError) {
      console.error('Erro ao salvar cadastro', registrationError);
      setError(firebaseAuthErrorMessage(registrationError, 'register'));
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heading}>
            <View style={styles.icon}>
              <Ionicons name="person-add-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Crie seu cadastro</Text>
            <Text style={styles.subtitle}>
              Preencha seus dados para começar a organizar sua rotina.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              maxLength={60}
              accessibilityLabel="Nome"
            />
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
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(21) 99999-9999"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              keyboardType="phone-pad"
              returnKeyType="next"
              maxLength={20}
              accessibilityLabel="Telefone"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo de 8 caracteres"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              maxLength={128}
              accessibilityLabel="Senha"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Digite a senha novamente"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              maxLength={128}
              accessibilityLabel="Confirmar senha"
            />
          </View>

          <Text style={styles.note}>
            Sua senha será usada pelo Firebase Authentication para proteger sua conta.
            Ela não é salva no Firestore.
          </Text>

          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}

          <PrimaryButton
            label={saving ? 'Salvando...' : 'Finalizar cadastro'}
            icon="checkmark"
            onPress={handleRegister}
            disabled={saving}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xl },
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
  note: { fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: spacing.xs },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
  submit: { marginTop: spacing.lg },
});
