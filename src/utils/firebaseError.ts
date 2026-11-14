type AuthAction = 'login' | 'register';

export function firebaseAuthErrorMessage(error: unknown, action: AuthAction): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já tem uma conta. Entre com sua senha.';
    case 'auth/invalid-email':
      return 'Digite um endereço de e-mail válido.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha incorretos.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Confira sua rede e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
    default:
      return action === 'register'
        ? 'Não foi possível criar a conta. Verifique sua conexão e tente novamente.'
        : 'Não foi possível entrar. Verifique sua conexão e tente novamente.';
  }
}
