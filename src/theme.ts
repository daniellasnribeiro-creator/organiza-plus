import { Ionicons } from '@expo/vector-icons';
import { Category, TaskStatus } from './types';

type IconName = keyof typeof Ionicons.glyphMap;

export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const CATEGORIES: Record<Category, { label: string; color: string; icon: IconName }> = {
  consulta: { label: 'Consulta', color: '#0EA5E9', icon: 'medkit-outline' },
  treino: { label: 'Treino', color: '#F97316', icon: 'barbell-outline' },
  compromisso: { label: 'Compromisso', color: '#8B5CF6', icon: 'location-outline' },
  pessoal: { label: 'Tarefa pessoal', color: '#14B8A6', icon: 'home-outline' },
  meta: { label: 'Meta do dia', color: '#EC4899', icon: 'flag-outline' },
};

export const CATEGORY_LIST = Object.keys(CATEGORIES) as Category[];

export const STATUS_INFO: Record<TaskStatus | 'atrasada', { label: string; color: string; bg: string }> = {
  a_fazer: { label: 'A fazer', color: colors.primary, bg: colors.primaryLight },
  concluida: { label: 'Concluída', color: colors.success, bg: colors.successLight },
  pendente: { label: 'Pendente', color: colors.warning, bg: colors.warningLight },
  atrasada: { label: 'Atrasada', color: colors.danger, bg: colors.dangerLight },
};
