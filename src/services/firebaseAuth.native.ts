import { initializeAuth, getReactNativePersistence } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from './firebase';

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
