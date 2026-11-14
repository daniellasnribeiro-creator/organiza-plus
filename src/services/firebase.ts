import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function requiredConfig(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Configuração ausente: ${name}. Confira o arquivo .env.local e reinicie o Expo.`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requiredConfig('EXPO_PUBLIC_FIREBASE_API_KEY', process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: requiredConfig('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: requiredConfig('EXPO_PUBLIC_FIREBASE_PROJECT_ID', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: requiredConfig('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: requiredConfig(
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: requiredConfig('EXPO_PUBLIC_FIREBASE_APP_ID', process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
};

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
