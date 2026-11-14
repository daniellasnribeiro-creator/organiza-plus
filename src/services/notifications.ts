// Lembretes locais com expo-notifications (recurso nativo do dispositivo).
// Não usa internet nem servidor: o próprio Android dispara a notificação no horário.
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { Task } from '../types';
import { combineDateTime } from '../utils/date';

type NotificationsModule = typeof import('expo-notifications');

let notificationModule: Promise<NotificationsModule | null> | undefined;
let warnedAboutExpoGo = false;

function getNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return Promise.resolve(null);

  if (isRunningInExpoGo()) {
    if (!warnedAboutExpoGo) {
      console.warn(
        'Lembretes estão desativados no Expo Go devido a um módulo nativo ausente. Use um development build para testar notificações.'
      );
      warnedAboutExpoGo = true;
    }
    return Promise.resolve(null);
  }

  notificationModule ??= import('expo-notifications').then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return Notifications;
  });

  return notificationModule;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('lembretes', {
        name: 'Lembretes de tarefas',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch (e) {
    console.warn('Notificações indisponíveis', e);
    return false;
  }
}

/** Agenda o lembrete da tarefa. Retorna o id da notificação ou null. */
export async function scheduleTaskReminder(task: Task): Promise<string | null> {
  if (task.reminder === null || !task.time || task.status === 'concluida') return null;
  const when = combineDateTime(task.date, task.time);
  when.setMinutes(when.getMinutes() - task.reminder);
  if (when.getTime() <= Date.now()) return null; // horário já passou

  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;

    const ok = await ensureNotificationPermission();
    if (!ok) return null;
    const before = task.reminder === 0 ? 'agora' : `em ${task.reminder === 60 ? '1 hora' : task.reminder + ' minutos'}`;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${task.title}`,
        body: `Seu compromisso começa ${before} (${task.time}).`,
        data: { taskId: task.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: 'lembretes',
      },
    });
  } catch (e) {
    console.warn('Falha ao agendar lembrete', e);
    return null;
  }
}

export async function cancelTaskReminder(notificationId?: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignora: notificação pode já ter disparado
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
