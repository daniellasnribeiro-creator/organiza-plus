// Estado global do app (Context API + useReducer).
// Qualquer tela pode ler as tarefas e chamar ações como concluir, remarcar etc.
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Task, TaskInput, UserProfile } from '../types';
import * as storage from '../storage/storage';
import { cancelAllReminders, cancelTaskReminder, scheduleTaskReminder } from '../services/notifications';
import { addDays, todayKey } from '../utils/date';
import {
  createAccount,
  getCurrentAccount,
  loadAccountData,
  observeAuth,
  refreshAccountSession,
  removeTask as removeCloudTask,
  saveProfile,
  saveTask,
  signIn,
  signOutAccount,
} from '../services/firebaseData';

interface State {
  loading: boolean;
  loadError: string | null;
  user: UserProfile | null;
  tasks: Task[];
}

type Action =
  | { type: 'LOADED'; user: UserProfile | null; tasks: Task[] }
  | { type: 'LOADING' }
  | { type: 'LOAD_FAILED'; message: string }
  | { type: 'UPSERT'; task: Task }
  | { type: 'REMOVE'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADED':
      return { loading: false, loadError: null, user: action.user, tasks: action.tasks };
    case 'LOADING':
      return { ...state, loading: true, loadError: null };
    case 'LOAD_FAILED':
      return { ...state, loading: false, loadError: action.message };
    case 'UPSERT': {
      const exists = state.tasks.some((t) => t.id === action.task.id);
      return {
        ...state,
        tasks: exists ? state.tasks.map((t) => (t.id === action.task.id ? action.task : t)) : [...state.tasks, action.task],
      };
    }
    case 'REMOVE':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
  }
}

/** Tarefa "a fazer" cuja data já passou é considerada atrasada. */
export function isOverdue(task: Task, today = todayKey()): boolean {
  return task.status === 'a_fazer' && task.date < today;
}

/** Ordena por horário; tarefas sem horário vão para o fim do dia. */
export function sortByTime(a: Task, b: Task): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.time === b.time) return a.createdAt - b.createdAt;
  if (!a.time) return 1;
  if (!b.time) return -1;
  return a.time < b.time ? -1 : 1;
}

interface TaskContextValue extends State {
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    withSamples: boolean
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  addTask: (input: TaskInput) => Promise<Task>;
  updateTask: (id: string, input: TaskInput) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  markPending: (id: string) => Promise<void>;
  rescheduleTo: (id: string, date: string) => Promise<void>;
  rescheduleTomorrow: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  resetAll: () => Promise<void>;
  getTask: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { loading: true, loadError: null, user: null, tasks: [] });
  const tasksRef = useRef<Task[]>([]);
  const registrationInProgress = useRef(false);
  const loadVersion = useRef(0);
  useLayoutEffect(() => {
    tasksRef.current = state.tasks;
  }, [state.tasks]);

  const hydrate = useCallback(async (account: FirebaseUser | null) => {
    const version = ++loadVersion.current;
    dispatch({ type: 'LOADING' });
    if (!account) {
      dispatch({ type: 'LOADED', user: null, tasks: [] });
      return;
    }

    try {
      const activeAccount = await refreshAccountSession(account);
      if (version !== loadVersion.current) return;
      if (!activeAccount) {
        dispatch({ type: 'LOADED', user: null, tasks: [] });
        return;
      }
      const data = await loadAccountData(activeAccount);
      if (version !== loadVersion.current) return;
      dispatch({ type: 'LOADED', user: data.user, tasks: data.tasks });
    } catch (error) {
      if (version !== loadVersion.current) return;
      console.error('Erro ao carregar dados do Firebase', error);
      dispatch({
        type: 'LOAD_FAILED',
        message: 'Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.',
      });
    }
  }, []);

  useEffect(
    () =>
      observeAuth(
        (account) => {
          if (registrationInProgress.current) return;
          void hydrate(account);
        },
        (error) => {
          console.error('Erro ao verificar a sessão Firebase', error);
          dispatch({
            type: 'LOAD_FAILED',
            message: 'Não foi possível verificar sua sessão. Verifique sua conexão e tente novamente.',
          });
        }
      ),
    [hydrate]
  );

  const find = (id: string) => tasksRef.current.find((t) => t.id === id);

  /** Salva a tarefa e (re)agenda o lembrete dela. */
  const persist = useCallback(async (task: Task, previous?: Task) => {
    const account = getCurrentAccount();
    if (!account) throw new Error('Entre na sua conta para salvar tarefas.');
    await saveTask(account.uid, task);
    await cancelTaskReminder(previous?.notificationId);
    const notificationId = await scheduleTaskReminder(task);
    dispatch({ type: 'UPSERT', task: { ...task, notificationId } });
  }, []);

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string, withSamples: boolean) => {
      const alreadyMigrated = await storage.hasMigratedLegacyData();
      const [legacyUser, legacyTasks] = alreadyMigrated
        ? [null, []]
        : await Promise.all([storage.loadUser(), storage.loadTasks()]);
      const tasksToImport =
        legacyTasks.length > 0 ? legacyTasks : withSamples ? storage.sampleTasks() : [];
      const user: UserProfile = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        createdAt: legacyUser?.createdAt ?? Date.now(),
      };

      registrationInProgress.current = true;
      try {
        const account = await createAccount(user, password, tasksToImport);
        await storage.markLegacyDataMigrated();
        await hydrate(account);
      } catch (error) {
        if (getCurrentAccount()) {
          try {
            await signOutAccount();
          } catch (signOutError) {
            console.error('Erro ao encerrar a sessão após falha no cadastro', signOutError);
            dispatch({
              type: 'LOAD_FAILED',
              message: 'A conta foi criada, mas houve um erro ao concluir o cadastro. Entre novamente para tentar carregar os dados.',
            });
            throw error;
          }
        }
        dispatch({ type: 'LOADED', user: null, tasks: [] });
        throw error;
      } finally {
        registrationInProgress.current = false;
      }
    },
    [hydrate]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const account = await signIn(email.trim(), password);
      await hydrate(account);
    },
    [hydrate]
  );

  const logout = useCallback(async () => {
    await signOutAccount();
  }, []);

  const reload = useCallback(async () => {
    await hydrate(getCurrentAccount());
  }, [hydrate]);

  const updateUserName = useCallback(async (name: string) => {
    const account = getCurrentAccount();
    if (!account) throw new Error('Entre na sua conta para atualizar o perfil.');
    const user: UserProfile = { ...(state.user ?? { createdAt: Date.now() }), name: name.trim() };
    await saveProfile(account.uid, user);
    dispatch({ type: 'LOADED', user, tasks: state.tasks });
  }, [state.user, state.tasks]);

  const addTask = useCallback(
    async (input: TaskInput) => {
      const task: Task = {
        ...input,
        id: storage.newId(),
        status: 'a_fazer',
        rescheduledCount: 0,
        createdAt: Date.now(),
        completedAt: null,
        notificationId: null,
      };
      await persist(task);
      return task;
    },
    [persist]
  );

  const updateTask = useCallback(
    async (id: string, input: TaskInput) => {
      const prev = find(id);
      if (!prev) return;
      await persist({ ...prev, ...input }, prev);
    },
    [persist]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const prev = find(id);
      if (!prev) return;
      const done = prev.status !== 'concluida';
      await persist(
        { ...prev, status: done ? 'concluida' : 'a_fazer', completedAt: done ? Date.now() : null },
        prev
      );
    },
    [persist]
  );

  const markPending = useCallback(
    async (id: string) => {
      const prev = find(id);
      if (!prev) return;
      await persist({ ...prev, status: 'pendente', completedAt: null }, prev);
    },
    [persist]
  );

  const rescheduleTo = useCallback(
    async (id: string, date: string) => {
      const prev = find(id);
      if (!prev) return;
      await persist(
        { ...prev, date, status: 'a_fazer', completedAt: null, rescheduledCount: prev.rescheduledCount + 1 },
        prev
      );
    },
    [persist]
  );

  // "Dia seguinte": se a tarefa já está atrasada, vai para amanhã (e não para o dia seguinte a uma data passada)
  const rescheduleTomorrow = useCallback(
    async (id: string) => {
      const prev = find(id);
      if (!prev) return;
      const today = todayKey();
      const base = prev.date < today ? today : prev.date;
      await rescheduleTo(id, addDays(base, 1));
    },
    [rescheduleTo]
  );

  const deleteTask = useCallback(async (id: string) => {
    const prev = find(id);
    const account = getCurrentAccount();
    if (!account) throw new Error('Entre na sua conta para excluir tarefas.');
    if (!prev) return;
    await removeCloudTask(account.uid, id);
    await cancelTaskReminder(prev?.notificationId);
    dispatch({ type: 'REMOVE', id });
  }, []);

  const resetAll = useCallback(async () => {
    await cancelAllReminders();
    await signOutAccount();
    await storage.clearAll();
    dispatch({ type: 'LOADED', user: null, tasks: [] });
  }, []);

  const getTask = useCallback((id: string) => state.tasks.find((t) => t.id === id), [state.tasks]);

  const value = useMemo<TaskContextValue>(
    () => ({
      ...state,
      register,
      login,
      logout,
      reload,
      updateUserName,
      addTask,
      updateTask,
      toggleComplete,
      markPending,
      rescheduleTo,
      rescheduleTomorrow,
      deleteTask,
      resetAll,
      getTask,
    }),
    [state, register, login, logout, reload, updateUserName, addTask, updateTask, toggleComplete, markPending, rescheduleTo, rescheduleTomorrow, deleteTask, resetAll, getTask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks deve ser usado dentro de <TaskProvider>');
  return ctx;
}
