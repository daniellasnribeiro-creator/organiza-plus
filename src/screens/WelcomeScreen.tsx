// Tela 1 – Boas-vindas / cadastro local do usuário
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Boas_vindas'>;

export function WelcomeScreen({ navigation }: Props) {
  const [withSamples, setWithSamples] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.logo}>
          <Ionicons name="checkmark-done" size={56} color="#fff" />
        </View>
        <Text style={styles.title}>Organiza+</Text>
        <Text style={styles.subtitle}>
          Sua rotina em um só lugar: consultas, treinos, compromissos e metas do dia.
        </Text>

        <View style={styles.features}>
          {[
            ['calendar-outline', 'Cadastre tarefas com data e horário'],
            ['checkmark-circle-outline', 'Marque o que foi concluído'],
            ['refresh-outline', 'Deixe pendente ou remarque para amanhã'],
            ['notifications-outline', 'Receba lembretes no celular'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.featureRow}>
              <Ionicons name={icon as any} size={20} color={colors.primary} />
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.checkRow} onPress={() => setWithSamples((v) => !v)}>
          <Ionicons name={withSamples ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
          <Text style={styles.checkText}>Começar com tarefas de exemplo</Text>
        </Pressable>

        <PrimaryButton
          label="Criar cadastro"
          icon="arrow-forward"
          onPress={() => navigation.navigate('Cadastro', { withSamples })}
          style={{ marginTop: spacing.lg }}
        />
        <PrimaryButton
          label="Já tenho uma conta"
          icon="log-in-outline"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.md }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.lg },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  features: { marginVertical: spacing.xl, gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureText: { fontSize: 15, color: colors.text },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  checkText: { fontSize: 14, color: colors.text },
});
