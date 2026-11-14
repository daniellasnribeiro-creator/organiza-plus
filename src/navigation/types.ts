import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Hoje: undefined;
  Pendentes: undefined;
  Resumo: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Boas_vindas: undefined;
  Login: undefined;
  Cadastro: { withSamples: boolean };
  Abas: NavigatorScreenParams<TabParamList> | undefined;
  FormTarefa: { taskId?: string; date?: string } | undefined;
  DetalheTarefa: { taskId: string };
};
