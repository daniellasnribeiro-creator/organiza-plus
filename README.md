# Organiza+ 📋

Aplicativo mobile (Android) de **organização de tarefas e compromissos**, desenvolvido em **React Native com Expo** como Projeto Final da disciplina **ARA0089 – Programação para Dispositivos Móveis em Android** (Universidade Estácio de Sá – Campus Teresópolis, 2026.2).

Para estudar a arquitetura e os recursos implementados, consulte o [Manual de estudo](./MANUAL_DE_ESTUDO.md).

## Funcionalidades

- Cadastro e login com e-mail e senha pelo Firebase Authentication
- Perfil e tarefas armazenados no Cloud Firestore, separados por conta
- Tarefas locais antigas migradas na primeira criação de conta; a cópia local é mantida como backup
- Criar, editar e excluir tarefas com **título, categoria, data, horário e observações**
- Categorias: Consulta, Treino, Compromisso, Tarefa pessoal e Meta do dia
- Marcar tarefa como **concluída** (toque no círculo)
- **Deixar pendente** ou **remarcar para o dia seguinte** quando não der para cumprir
- Aba **Pendentes** com tarefas atrasadas/pendentes e ação "tudo para hoje / amanhã"
- **Lembretes** por notificação local (na hora, 15 min ou 1 h antes)
- Navegação por dias (faixa de datas) e filtros (Todas / A fazer / Concluídas)
- **Resumo** dos últimos 7 dias: concluídas, taxa de conclusão, gráfico por dia e por categoria
- Sessão Firebase persistida com AsyncStorage no Android; os dados da conta ficam na nuvem

> No Expo Go, os lembretes ficam desativados para evitar falha quando o runtime não inclui o módulo nativo de notificações. Use um development build para testar notificações.

## Como executar

Pré-requisitos: [Node.js LTS](https://nodejs.org) e o app **Expo Go** instalado no celular Android (Play Store).

### Configuração do Firebase

1. Copie `.env.example` para `.env.local`.
2. No Firebase Console, abra **Configurações do projeto > Geral > Seus apps > Organiza Plus Mobile** e copie os valores da configuração do SDK Web para `.env.local`.
3. Confira se as regras em `firestore.rules` estão publicadas no **Cloud Firestore > Regras**.

`.env.local` é ignorado pelo Git. As variáveis `EXPO_PUBLIC_FIREBASE_*` são configuração de cliente e ficam visíveis no app compilado; não coloque chaves de conta de serviço ou outras credenciais privadas nelas. O acesso aos dados é protegido pelas regras do Firestore.

```bash
npm install
npx expo start
```

Após criar ou alterar `.env.local`, reinicie o Expo. Escaneie o QR Code exibido no terminal com o Expo Go (celular e computador na mesma rede Wi-Fi).
Também é possível rodar no emulador do Android Studio com `npx expo start --android`.

No primeiro cadastro, as tarefas já salvas no aparelho são copiadas para a nova conta. A cópia local não é removida automaticamente. Para testar, crie uma conta com um e-mail válido; depois use **Já tenho uma conta** para entrar novamente.

Os dados são armazenados em `users/{uid}` e `users/{uid}/tasks/{taskId}`. Cada pessoa autenticada só pode ler ou alterar documentos cujo UID corresponde à própria conta.

Para encerrar a sessão, use **Sair da conta** no Perfil; na web, a saída é imediata. Ao iniciar o app, a sessão é validada com o Firebase. Se uma conta for removida pelo Console enquanto o app estiver aberto, feche e abra o app para ele renovar a sessão e detectar a remoção. Excluir apenas o documento do Firestore não apaga a conta do Firebase Authentication; para remover totalmente o acesso, exclua também o usuário em **Authentication > Users**. A regra das tarefas exige que o documento de perfil exista, bloqueando tarefas órfãs depois que o perfil é removido.

### Gerar APK (opcional, para entrega)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

O perfil `preview` (em `eas.json`) gera um arquivo `.apk` que pode ser instalado direto no celular.

## Estrutura do projeto

```text
App.tsx                      # ponto de entrada: Provider + Navegação
src/
  types.ts                   # tipos (Task, Category, TaskStatus...)
  theme.ts                   # cores, espaçamentos, categorias
  utils/date.ts              # funções de data (formatação, somar dias)
  storage/storage.ts         # migração dos dados locais antigos + dados de exemplo
  services/notifications.ts  # lembretes com expo-notifications
  services/firebase.ts       # inicialização Firebase e Cloud Firestore
  services/firebaseAuth.*.ts # autenticação web e persistência no Android
  services/firebaseData.ts   # autenticação e operações de perfil/tarefas
  context/TaskContext.tsx    # estado global e sincronização Firebase
  navigation/
    AppNavigator.tsx         # Stack + Bottom Tabs (React Navigation)
    types.ts                 # tipagem das rotas
  components/                # TaskCard, DateStrip, DateTimeField, PrimaryButton, EmptyState
  screens/
    WelcomeScreen.tsx        # Boas-vindas
    RegistrationScreen.tsx  # Cadastro Firebase
    LoginScreen.tsx          # Login Firebase
    HomeScreen.tsx           # Hoje (lista do dia)
    TaskFormScreen.tsx       # Nova / Editar tarefa
    TaskDetailScreen.tsx     # Detalhes da tarefa
    PendingScreen.tsx        # Pendentes
    SummaryScreen.tsx        # Resumo semanal
    ProfileScreen.tsx        # Perfil e configurações
```

## Tecnologias

React Native · Expo · TypeScript · React Navigation (native-stack + bottom-tabs) · Firebase Authentication · Cloud Firestore · AsyncStorage · expo-notifications · @react-native-community/datetimepicker · @expo/vector-icons

## Integrantes

- Daniella Soares Nascimento Ribeiro – 202503559431
- Victor Ramos Silva – 202309125129
- Caio Eduardo Palhares Nogueira – 202203004107
- Rogerio Marins de Medeiros – 202307566471
