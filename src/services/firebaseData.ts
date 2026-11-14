import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth } from './firebaseAuth';
import { firestore } from './firebase';
import { Task, UserProfile } from '../types';

export interface AccountData {
  user: UserProfile;
  tasks: Task[];
}

export function observeAuth(
  onUser: (user: FirebaseUser | null) => void,
  onError: (error: Error) => void
): () => void {
  return onAuthStateChanged(auth, onUser, onError);
}

export function getCurrentAccount(): FirebaseUser | null {
  return auth.currentUser;
}

export async function refreshAccountSession(account: FirebaseUser): Promise<FirebaseUser | null> {
  try {
    await account.getIdToken(true);
    return auth.currentUser?.uid === account.uid ? account : null;
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';
    const accountNoLongerValid = [
      'auth/invalid-user-token',
      'auth/user-disabled',
      'auth/user-not-found',
      'auth/user-token-expired',
    ].includes(code);

    if (!accountNoLongerValid) throw error;
    if (auth.currentUser?.uid === account.uid) await signOut(auth);
    return null;
  }
}

export async function loadAccountData(account: FirebaseUser): Promise<AccountData> {
  const profileRef = doc(firestore, 'users', account.uid);
  const profileSnapshot = await getDoc(profileRef);
  const profile = profileSnapshot.exists()
    ? profileSnapshot.data()
    : {
        name: account.displayName || account.email || 'Usuário',
        ...(account.email ? { email: account.email } : {}),
        createdAt: account.metadata.creationTime
          ? Date.parse(account.metadata.creationTime)
          : Date.now(),
      };
  if (!profileSnapshot.exists()) {
    console.warn('Perfil ausente no Firestore; restaurando os dados básicos da conta.');
    await setDoc(profileRef, profile);
  }

  const taskSnapshot = await getDocs(collection(profileRef, 'tasks'));

  return {
    user: {
      name: typeof profile?.name === 'string' ? profile.name : account.displayName || account.email || 'Usuário',
      email: account.email ?? undefined,
      phone: typeof profile?.phone === 'string' ? profile.phone : undefined,
      createdAt:
        typeof profile?.createdAt === 'number'
          ? profile.createdAt
          : account.metadata.creationTime
            ? Date.parse(account.metadata.creationTime)
            : Date.now(),
    },
    tasks: taskSnapshot.docs.map((taskDocument) => ({
      ...(taskDocument.data() as Task),
      id: taskDocument.id,
      notificationId: null,
    })),
  };
}

// O Firestore não aceita campos com valor undefined (ex.: telefone vazio em contas antigas).
// Esta função remove esses campos antes de gravar.
function withoutUndefined<T extends object>(data: T): T {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as T;
}

function taskForFirestore(task: Task): Task {
  return withoutUndefined({
    ...task,
    completedAt: task.completedAt ?? null,
    notificationId: null,
  });
}

export async function createAccount(
  profile: UserProfile,
  password: string,
  tasks: Task[]
): Promise<FirebaseUser> {
  if (!profile.email) throw new Error('O e-mail é obrigatório para criar a conta.');
  const credential = await createUserWithEmailAndPassword(auth, profile.email, password);

  await updateProfile(credential.user, { displayName: profile.name });

  const profileRef = doc(firestore, 'users', credential.user.uid);
  const taskBatches: Task[][] = [];
  for (let index = 0; index < tasks.length; index += 499) {
    taskBatches.push(tasks.slice(index, index + 499));
  }

  const firstBatch = writeBatch(firestore);
  firstBatch.set(profileRef, withoutUndefined(profile));
  for (const task of taskBatches.shift() ?? []) {
    firstBatch.set(doc(profileRef, 'tasks', task.id), taskForFirestore(task));
  }
  await firstBatch.commit();

  for (const taskBatch of taskBatches) {
    const batch = writeBatch(firestore);
    for (const task of taskBatch) {
      batch.set(doc(profileRef, 'tasks', task.id), taskForFirestore(task));
    }
    await batch.commit();
  }

  return credential.user;
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function saveProfile(uid: string, profile: UserProfile): Promise<void> {
  const account = auth.currentUser;
  if (!account || account.uid !== uid) throw new Error('Não há uma sessão ativa para atualizar o perfil.');
  await updateProfile(account, { displayName: profile.name });
  await setDoc(doc(firestore, 'users', uid), withoutUndefined(profile), { merge: true });
}

export async function saveTask(uid: string, task: Task): Promise<void> {
  await setDoc(doc(firestore, 'users', uid, 'tasks', task.id), taskForFirestore(task));
}

export async function removeTask(uid: string, taskId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'users', uid, 'tasks', taskId));
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}
