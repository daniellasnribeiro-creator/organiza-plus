// Camada de persistência local com AsyncStorage.
// Todos os dados ficam salvos no próprio celular (funciona sem internet).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, UserProfile } from '../types';
import { addDays, todayKey } from '../utils/date';

const KEYS = {
  tasks: '@organizaplus:tasks',
  user: '@organizaplus:user',
  firebaseMigration: '@organizaplus:firebaseMigrationComplete',
};

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.tasks);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch (e) {
    console.warn('Erro ao carregar tarefas', e);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Erro ao salvar tarefas', e);
  }
}

export async function loadUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function saveUser(user: UserProfile | null): Promise<void> {
  if (user) await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
  else await AsyncStorage.removeItem(KEYS.user);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.tasks, KEYS.user, KEYS.firebaseMigration]);
}

export async function hasMigratedLegacyData(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.firebaseMigration)) === 'true';
}

export async function markLegacyDataMigrated(): Promise<void> {
  await AsyncStorage.setItem(KEYS.firebaseMigration, 'true');
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Tarefas de exemplo para demonstrar o app na apresentação. */
export function sampleTasks(): Task[] {
  const t = todayKey();
  const base = { notes: '', reminder: null, rescheduledCount: 0, createdAt: Date.now(), notificationId: null } as const;
  return [
    { ...base, id: newId(), title: 'Academia – treino de pernas', category: 'treino', date: t, time: '07:00', status: 'concluida', completedAt: Date.now() },
    { ...base, id: newId(), title: 'Consulta no dentista', category: 'consulta', date: t, time: '10:30', status: 'a_fazer', notes: 'Levar carteirinha do plano' },
    { ...base, id: newId(), title: 'Aula de Programação Mobile', category: 'compromisso', date: t, time: '19:00', status: 'a_fazer' },
    { ...base, id: newId(), title: 'Beber 2 litros de água', category: 'meta', date: t, time: null, status: 'a_fazer' },
    { ...base, id: newId(), title: 'Pagar conta de luz', category: 'pessoal', date: addDays(t, -1), time: '18:00', status: 'a_fazer' },
    { ...base, id: newId(), title: 'Ler 20 páginas do livro', category: 'meta', date: addDays(t, -2), time: null, status: 'pendente' },
    { ...base, id: newId(), title: 'Corrida no parque', category: 'treino', date: addDays(t, 1), time: '06:30', status: 'a_fazer' },
    { ...base, id: newId(), title: 'Reunião do grupo – Projeto Final', category: 'compromisso', date: addDays(t, 2), time: '20:00', status: 'a_fazer' },
  ];
}
