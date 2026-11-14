// Funções utilitárias de data. As datas são guardadas como texto "YYYY-MM-DD"
// para evitar problemas de fuso horário.

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function toTimeKey(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function combineDateTime(dateKey: string, time: string | null): Date {
  const d = fromDateKey(dateKey);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function weekdayShort(key: string): string {
  return WEEKDAYS[fromDateKey(key).getDay()];
}

/** Ex.: "Hoje", "Amanhã", "Ontem" ou "qui, 22 de out" */
export function friendlyDate(key: string): string {
  const today = todayKey();
  if (key === today) return 'Hoje';
  if (key === addDays(today, 1)) return 'Amanhã';
  if (key === addDays(today, -1)) return 'Ontem';
  const d = fromDateKey(key);
  return `${WEEKDAYS[d.getDay()].toLowerCase()}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** Ex.: "terça-feira, 20 de outubro" */
export function longDate(key: string): string {
  const d = fromDateKey(key);
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  const text = `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${month}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function dayNumber(key: string): number {
  return fromDateKey(key).getDate();
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
