// Tela 7 – Perfil e configurações
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ensureNotificationPermission } from '../services/notifications';
import { colors, radius, spacing } from '../theme';

export function ProfileScreen() {
  const { user, tasks, updateUserName, logout, resetAll } = useTasks();
  const [name, setName] = useState(user?.name ?? '');
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = (user?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const done = tasks.filter((t) => t.status === 'concluida').length;

  const saveName = async () => {
    if (name.trim().length < 2) return Alert.alert('Nome inválido', 'Digite pelo menos 2 letras.');
    try {
      await updateUserName(name);
      Alert.alert('Pronto!', 'Nome atualizado.');
    } catch (error) {
      console.error('Erro ao atualizar o perfil', error);
      Alert.alert('Não foi possível atualizar', 'Verifique sua conexão e tente novamente.');
    }
  };

  const testPermission = async () => {
    const ok = await ensureNotificationPermission();
    Alert.alert(
      ok ? 'Notificações ativas' : 'Notificações bloqueadas',
      ok ? 'Você receberá lembretes das tarefas com horário.' : 'Ative as notificações do Organiza+ nas configurações do Android.'
    );
  };

  const confirmReset = () =>
    Alert.alert(
      'Sair e limpar dados do aparelho',
      'Isso apaga a cópia local deste aparelho e encerra a sessão. Seus dados salvos na nuvem continuarão disponíveis ao entrar novamente. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair e limpar',
          style: 'destructive',
          onPress: () => {
            void resetAll().catch((error) => {
              console.error('Erro ao limpar os dados deste aparelho', error);
              Alert.alert('Não foi possível limpar', 'Tente novamente.');
            });
          },
        },
      ]
    );

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair da conta', error);
      setLogoutError('Não foi possível sair da conta. Verifique a conexão e tente novamente.');
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.sub}>
            {tasks.length} tarefas cadastradas • {done} concluídas
          </Text>
          {!!user?.email && <Text style={styles.contact}>{user.email}</Text>}
          {!!user?.phone && <Text style={styles.contact}>{user.phone}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Seu nome</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} maxLength={30} />
          <PrimaryButton label="Salvar nome" icon="save-outline" variant="outline" onPress={saveName} style={{ marginTop: spacing.md }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Lembretes</Text>
          <Text style={styles.help}>O Organiza+ usa notificações locais para avisar antes dos seus compromissos.</Text>
          <PrimaryButton label="Verificar permissão" icon="notifications-outline" variant="outline" onPress={testPermission} style={{ marginTop: spacing.md }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Como usar</Text>
          {[
            ['add-circle-outline', 'Toque no + na tela Hoje para criar uma tarefa.'],
            ['ellipse-outline', 'Toque no círculo para marcar como concluída.'],
            ['hand-left-outline', 'Segure uma tarefa para ações rápidas.'],
            ['alert-circle-outline', 'Veja na aba Pendentes o que ficou para trás.'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.tipRow}>
              <Ionicons name={icon as any} size={18} color={colors.primary} />
              <Text style={styles.tipText}>{text}</Text>
            </View>
          ))}
        </View>

        {!!logoutError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {logoutError}
          </Text>
        )}
        <PrimaryButton
          label={loggingOut ? 'Saindo...' : 'Sair da conta'}
          icon="log-out-outline"
          variant="outline"
          onPress={() => void handleLogout()}
          disabled={loggingOut}
          style={{ marginTop: spacing.lg }}
        />
        <PrimaryButton label="Sair e limpar dados do aparelho" icon="trash-outline" variant="danger" onPress={confirmReset} style={{ marginTop: spacing.md }} />
        <Text style={styles.footer}>Organiza+ v1.0 • Projeto Final ARA0089 – Estácio Teresópolis</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  contact: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  help: { fontSize: 13, color: colors.textMuted },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  tipText: { flex: 1, fontSize: 14, color: colors.text },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: spacing.xl },
});
