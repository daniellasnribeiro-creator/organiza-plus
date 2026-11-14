// Navegação: Stack (telas empilhadas) + Bottom Tabs (abas inferiores)
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { isOverdue, useTasks } from '../context/TaskContext';
import { RootStackParamList, TabParamList } from './types';
import { colors } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RegistrationScreen } from '../screens/RegistrationScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PendingScreen } from '../screens/PendingScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Hoje: ['today', 'today-outline'],
  Pendentes: ['alert-circle', 'alert-circle-outline'],
  Resumo: ['stats-chart', 'stats-chart-outline'],
  Perfil: ['person', 'person-outline'],
};

function Tabs() {
  const { tasks } = useTasks();
  const pendingCount = tasks.filter((t) => t.status === 'pendente' || isOverdue(t)).length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Hoje" component={HomeScreen} />
      <Tab.Screen
        name="Pendentes"
        component={PendingScreen}
        options={{ tabBarBadge: pendingCount > 0 ? pendingCount : undefined }}
      />
      <Tab.Screen name="Resumo" component={SummaryScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background } };

export function AppNavigator() {
  const { loading, loadError, reload, user } = useTasks();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
          {loadError}
        </Text>
        <PrimaryButton label="Tentar novamente" onPress={() => void reload()} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerTitleStyle: { color: colors.text } }}>
        {!user ? (
          <>
            <Stack.Screen name="Boas_vindas" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
            <Stack.Screen
              name="Cadastro"
              component={RegistrationScreen}
              options={{ title: 'Criar cadastro' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Abas" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="FormTarefa" component={TaskFormScreen} options={{ title: 'Nova tarefa', presentation: 'modal' }} />
            <Stack.Screen name="DetalheTarefa" component={TaskDetailScreen} options={{ title: 'Detalhes' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
