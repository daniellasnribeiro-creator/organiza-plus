import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskProvider } from './src/context/TaskContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const { width, height } = useWindowDimensions();

  const app = (
    <SafeAreaProvider>
      <TaskProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </TaskProvider>
    </SafeAreaProvider>
  );

  // No navegador do computador (tela larga), mostra o app dentro de uma "moldura de celular"
  // para visualizar como ficaria no Android. No celular, roda em tela cheia normalmente.
  if (Platform.OS === 'web' && width > 600) {
    const phoneHeight = Math.min(844, height - 40);
    return (
      <View style={styles.page}>
        <View style={[styles.phone, { height: phoneHeight }]}>{app}</View>
      </View>
    );
  }

  return app;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: 390,
    borderRadius: 36,
    borderWidth: 10,
    borderColor: '#111827',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});
