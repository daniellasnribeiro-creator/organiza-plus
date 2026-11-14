import { Alert } from 'react-native';

export async function runTaskAction(action: () => Promise<unknown>, description: string): Promise<void> {
  try {
    await action();
  } catch (error) {
    console.error(`Erro ao ${description}`, error);
    Alert.alert(
      'Não foi possível salvar',
      'Verifique sua conexão e tente novamente. Se o problema continuar, saia e entre na conta.'
    );
  }
}
