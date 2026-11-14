import type { Persistence, ReactNativeAsyncStorage } from '@firebase/auth';

// The shared Firebase typings omit this export even though the React Native entrypoint provides it.
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
