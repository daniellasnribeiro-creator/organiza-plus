// Tipos centrais do Organiza+

export type Category = 'consulta' | 'treino' | 'compromisso' | 'pessoal' | 'meta';

// a_fazer  -> tarefa agendada, ainda não realizada
// concluida -> usuário marcou como feita
// pendente  -> usuário não conseguiu fazer e deixou em aberto para decidir depois
export type TaskStatus = 'a_fazer' | 'concluida' | 'pendente';

// Quantos minutos antes do horário o lembrete deve tocar (null = sem lembrete)
export type ReminderOption = null | 0 | 15 | 60;

export interface Task {
  id: string;
  title: string;
  category: Category;
  date: string; // "YYYY-MM-DD"
  time: string | null; // "HH:mm" ou null (tarefa sem horário)
  notes: string;
  status: TaskStatus;
  reminder: ReminderOption;
  notificationId?: string | null;
  rescheduledCount: number;
  createdAt: number;
  completedAt?: number | null;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  createdAt: number;
}

export type TaskInput = Pick<Task, 'title' | 'category' | 'date' | 'time' | 'notes' | 'reminder'>;
