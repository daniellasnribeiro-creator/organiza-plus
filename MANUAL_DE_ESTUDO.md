# Manual de estudo — Organiza+

Este manual explica o que já foi construído no Organiza+ e serve como roteiro para estudar o código. O projeto é um aplicativo de organização de tarefas desenvolvido como projeto final da disciplina ARA0089 — Programação para Dispositivos Móveis em Android.

## 1. O que o aplicativo faz

O Organiza+ permite que cada pessoa crie uma conta e organize tarefas e compromissos. Uma tarefa pode ter título, categoria, data, horário, observações e lembrete. Ela pode ser concluída, deixada pendente, remarcada ou excluída.

As telas principais são:

- **Hoje:** tarefas de uma data selecionada, filtros e progresso de conclusão.
- **Pendentes:** tarefas marcadas como pendentes e tarefas a fazer cuja data já passou.
- **Resumo:** indicadores e gráficos dos últimos sete dias.
- **Perfil:** dados da pessoa, permissão de notificações e opções de sessão.
- **Cadastro e login:** autenticação por e-mail e senha.
- **Formulário e detalhes:** criação, edição e ações de uma tarefa.

As categorias são Consulta, Treino, Compromisso, Tarefa pessoal e Meta do dia. Os lembretes podem ser configurados para a hora do compromisso, 15 minutos antes ou uma hora antes.

## 2. Tecnologias e conceitos utilizados

- **React Native:** criação de interfaces móveis usando componentes como `View`, `Text`, `Pressable`, `TextInput` e `FlatList`.
- **Expo:** ambiente e ferramentas para executar o app em Android e Web. O projeto está configurado com Expo SDK 58.
- **TypeScript:** tipos explícitos para tarefas, categorias, estados e rotas.
- **React Hooks:** `useState` guarda estado local de uma tela; `useMemo` evita refazer cálculos derivados sem necessidade; `useEffect` e `useCallback` organizam efeitos e funções.
- **Context API e `useReducer`:** compartilham o estado das tarefas e do usuário entre telas.
- **React Navigation:** navegação com pilha (Stack) e abas inferiores (Bottom Tabs).
- **Firebase Authentication:** criação de conta, login, logout e persistência da sessão.
- **Cloud Firestore:** armazenamento do perfil e das tarefas na nuvem, separados por usuário.
- **AsyncStorage:** persistência local usada pela sessão do Firebase no Android e para ler dados antigos do app durante a migração.
- **`expo-notifications`:** agendamento de lembretes locais no dispositivo.

## 3. Como o código está organizado

| Caminho | Responsabilidade |
| --- | --- |
| `App.tsx` | Monta os provedores globais e inicia a navegação. Na Web em tela larga, apresenta uma moldura de celular. |
| `src/types.ts` | Define os tipos `Task`, `TaskInput`, `UserProfile`, `Category`, `TaskStatus` e `ReminderOption`. |
| `src/theme.ts` | Centraliza cores, espaçamentos, categorias, ícones e aparência dos estados. |
| `src/context/TaskContext.tsx` | Mantém o estado global, carrega os dados da conta e expõe ações para as telas. |
| `src/navigation/` | Declara os parâmetros tipados das rotas e monta Stack + Bottom Tabs. |
| `src/screens/` | Contém as telas e suas regras de interface. |
| `src/components/` | Contém componentes reutilizáveis, como cartões de tarefa e controles de data/hora. |
| `src/services/firebase.ts` | Inicializa o Firebase e o Firestore usando as variáveis de ambiente. |
| `src/services/firebaseAuth.*.ts` | Configura o Firebase Authentication para Android e Web. |
| `src/services/firebaseData.ts` | Encapsula operações de autenticação e leitura/escrita no Firestore. |
| `src/services/notifications.ts` | Solicita permissão e agenda/cancela notificações locais. |
| `src/storage/storage.ts` | Lê dados locais antigos, controla a migração e fornece tarefas de exemplo. |
| `src/utils/date.ts` | Formata e calcula datas e horários. |
| `firestore.rules` | Restringe o acesso aos dados da conta autenticada. |

## 4. Modelo de dados

O tipo `Task` descreve uma tarefa. Em resumo, ele contém:

```ts
interface Task {
  id: string;
  title: string;
  category: Category;
  date: string; // "YYYY-MM-DD"
  time: string | null; // "HH:mm" ou null
  notes: string;
  status: TaskStatus;
  reminder: ReminderOption;
  rescheduledCount: number;
  createdAt: number;
  completedAt?: number | null;
}
```

O tipo real também contém `notificationId`, usado para cancelar um lembrete agendado. Ele não é persistido como dado da tarefa no Firestore: ao carregar dados da nuvem, o app o inicia como `null`, pois os identificadores das notificações pertencem ao dispositivo.

Os estados de tarefa são:

- `a_fazer`: tarefa ainda não concluída.
- `concluida`: pessoa marcou a tarefa como feita.
- `pendente`: pessoa escolheu deixar a tarefa em aberto.
- **Atrasada:** não é um valor salvo em `TaskStatus`. É uma condição calculada quando uma tarefa `a_fazer` tem data anterior a hoje.

As datas são armazenadas como texto no formato `YYYY-MM-DD`, e os horários como `HH:mm`. Isso ajuda a comparar dias sem depender da conversão automática de fuso horário do formato ISO completo.

## 5. Fluxo de dados e estado global

`App.tsx` envolve a navegação com `TaskProvider`. Assim, qualquer tela dentro do app pode chamar `useTasks()` para consultar o estado ou executar uma ação.

O `TaskContext` usa `useReducer` para atualizar o estado em resposta a ações como `LOADED`, `LOADING`, `LOAD_FAILED`, `UPSERT` e `REMOVE`. Também oferece operações de nível mais alto:

- `addTask` cria uma tarefa com identificador e estado inicial.
- `updateTask` altera os campos editáveis e salva a tarefa.
- `toggleComplete` alterna entre concluída e a fazer.
- `markPending` deixa a tarefa pendente.
- `rescheduleTo` muda a data, volta o estado para a fazer e incrementa `rescheduledCount`.
- `rescheduleTomorrow` calcula amanhã; se a tarefa já está atrasada, usa hoje como base para não remarcar para uma data antiga.
- `deleteTask` remove a tarefa da nuvem e cancela o lembrete associado.

O fluxo típico de uma alteração é:

1. A pessoa interage com uma tela ou componente.
2. A tela chama uma função exposta por `useTasks()`.
3. O `TaskContext` verifica a sessão e chama a camada de serviços.
4. `firebaseData.ts` grava a alteração no Firestore.
5. O contexto atualiza o estado compartilhado; se necessário, agenda ou cancela a notificação.
6. As telas que usam esse estado renderizam os dados atualizados.

## 6. Autenticação, armazenamento e segurança

O Firebase Authentication cuida das credenciais. O perfil, sem a senha, e as tarefas são armazenados no Firestore:

```text
users/{uid}
users/{uid}/tasks/{taskId}
```

`uid` é o identificador fornecido pelo Firebase para a conta autenticada. As regras em `firestore.rules` permitem ler ou escrever o perfil apenas quando `request.auth.uid` corresponde ao identificador do documento. Para acessar tarefas, exigem também que o documento do perfil exista.

No Android, o Firebase Authentication usa AsyncStorage para manter a sessão entre aberturas do app. Na Web, usa a configuração própria da plataforma. A inicialização do Firebase valida as variáveis `EXPO_PUBLIC_FIREBASE_*`; elas são configuração de cliente, não devem conter credenciais privadas ou chaves de conta de serviço.

Na primeira criação de conta, o app tenta importar tarefas locais antigas. Se não houver tarefas antigas e a opção de exemplos estiver marcada, cria tarefas de demonstração. Os dados locais antigos não são apagados automaticamente depois da importação. Sair da conta encerra a sessão, mas não apaga os dados da nuvem. A opção **Sair e limpar dados do aparelho** limpa os dados locais antigos e encerra a sessão; também não exclui os documentos da nuvem.

## 7. Navegação e telas

`src/navigation/AppNavigator.tsx` contém uma pilha com as telas de autenticação e, após login, a área principal com quatro abas. As rotas são tipadas em `src/navigation/types.ts`.

As telas de tarefa são abertas sobre a navegação principal:

- O formulário recebe uma data opcional para iniciar a criação naquele dia ou um `taskId` para editar.
- A tela de detalhes recebe `taskId` e procura a tarefa no estado compartilhado.
- O componente `TaskCard` é reutilizado nas listas e oferece ações rápidas por toque longo. O toque no círculo alterna a conclusão.

## 8. Regras de negócio que vale estudar

- Uma tarefa atrasada é sempre `a_fazer` com data menor que a data de hoje. Uma tarefa `pendente` aparece na aba Pendentes mesmo que esteja agendada para hoje ou para o futuro.
- Na tela Hoje, as tarefas são filtradas pela data selecionada e ordenadas por data, horário e, em caso de horários iguais, horário de criação. Tarefas sem horário aparecem no fim do dia.
- O progresso diário é `tarefas concluídas / total de tarefas daquele dia`.
- O resumo considera como período de sete dias os seis dias anteriores mais hoje. A taxa é calculada com as tarefas desse intervalo.
- O formulário exige título com pelo menos três caracteres. Para escolher lembrete, é necessário definir horário.
- Datas/horários no passado podem ser salvos, mas a criação exibe um aviso de confirmação.
- O lembrete não é agendado se a tarefa não tem horário, não tem lembrete, já está concluída ou o horário calculado já passou.
- Notificações usam recursos locais do dispositivo. No Expo Go, ficam desativadas; para testá-las é necessário um development build. Na Web, o módulo de notificações não é usado.

## 9. Como executar e testar o app

Pré-requisitos: Node.js LTS, dependências instaladas e Expo Go no Android para testar o fluxo normal.

1. Copie `.env.example` para `.env.local` e preencha os valores do SDK Web do Firebase.
2. Publique as regras de `firestore.rules` no Cloud Firestore.
3. No terminal, na pasta do projeto, execute:

```bash
npm install
npx expo start
```

1. Escaneie o QR Code com o Expo Go. Celular e computador precisam estar na mesma rede Wi-Fi.
1. Crie uma conta para testar cadastro e dados isolados por usuário; depois use **Já tenho uma conta** para testar o login.

Depois de alterar `.env.local`, reinicie o Expo. Para testar lembretes, use um development build, não o Expo Go.

Comandos disponíveis no `package.json`:

```bash
npm run typecheck
npm run lint
npm run android
npm run web
```

## 10. Roteiro de estudo sugerido

1. Leia `src/types.ts` e identifique quais propriedades podem ser `null` ou opcionais.
2. Leia `src/theme.ts` e veja como categorias e estados viram rótulos, cores e ícones.
3. Estude `src/context/TaskContext.tsx`: reducer, provider, hooks e ações de tarefa.
4. Siga o caminho de uma tarefa nova: `HomeScreen` → `TaskFormScreen` → `addTask` → `persist` → `saveTask`.
5. Compare as telas `HomeScreen`, `PendingScreen` e `SummaryScreen` para entender filtro, ordenação e cálculo de estatísticas.
6. Estude `firebaseData.ts` e `firestore.rules` em conjunto: como o código grava os dados e como as regras limitam o acesso.
7. Leia `notifications.ts` e acompanhe o agendamento e cancelamento de um lembrete.
8. Finalize com `AppNavigator.tsx` e `navigation/types.ts` para revisar as rotas e os parâmetros tipados.

### Perguntas para revisar

- Qual é a diferença entre o estado local de uma tela e o estado compartilhado pelo Context?
- Por que a senha não aparece no documento de perfil do Firestore?
- Como o app diferencia uma tarefa pendente de uma tarefa atrasada?
- Por que `notificationId` é tratado de forma diferente dos demais campos da tarefa?
- O que acontece com uma tarefa quando ela é remarcada?
- Como as regras do Firestore impedem uma conta de ler as tarefas de outra?
- Quais dados permanecem na nuvem quando a pessoa usa **Sair e limpar dados do aparelho**?

### Pequenos exercícios

- Adicione uma categoria: atualize o tipo `Category`, as configurações em `theme.ts` e confira os pontos da interface que usam `CATEGORY_LIST`.
- Altere a ordenação para priorizar tarefas sem horário e observe o impacto nas listas.
- Adicione um filtro à tela Hoje sem duplicar a fonte de verdade das tarefas.
- Trace um erro de gravação desde o serviço até a mensagem apresentada à pessoa usuária.

## 11. Arquivos recomendados para consulta

- [README.md](./README.md): visão geral e instruções operacionais.
- [src/types.ts](./src/types.ts): modelo de dados.
- [src/context/TaskContext.tsx](./src/context/TaskContext.tsx): estado e regras de tarefa.
- [src/services/firebaseData.ts](./src/services/firebaseData.ts): integração com Firebase e Firestore.
- [firestore.rules](./firestore.rules): regras de acesso aos documentos.
