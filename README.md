<p align="center">
  <img src="gym-fei/assets/logo-gymfei.png" width="120" alt="Logo do GymFEI" />
</p>

<h1 align="center">GymFEI</h1>
<p align="center"><b>Seu treino. Sua evolução.</b><br/>App mobile para personal trainers montarem treinos e alunos treinarem com séries guiadas.</p>

---

Projeto acadêmico desenvolvido por Rafael Almeida Ferreira (FEI), com React Native + Expo.
Na **versão 2.0** o app foi totalmente redesenhado: nova identidade visual em azul-escuro, navegação por abas no padrão dos apps de celular, treino guiado com cronômetro e troca do Firebase pelo **Supabase**.

## Demonstração

Personal montando um treino para a aluna Ana:

![Personal criando um treino](gifs/demo-personal.gif)

Aluna fazendo o treino guiado, com o cronômetro de descanso:

![Aluna no treino guiado](gifs/demo-aluno.gif)

> Os GIFs foram gravados no modo demonstração (dados de exemplo salvos no navegador).

## Sumário

- [O que tem no app](#o-que-tem-no-app)
- [Tecnologias](#tecnologias)
- [Design e IHC](#design-e-ihc)
- [Rodando no seu computador](#rodando-no-seu-computador)
- [Configurando o banco (Supabase)](#configurando-o-banco-supabase)
- [Gerando o APK e a versão para lojas](#gerando-o-apk-e-a-versão-para-lojas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Problemas comuns](#problemas-comuns)

## O que tem no app

**Personal trainer**
- Painel com resumo da semana, alunos ativos e atividade recente dos alunos.
- Código de convite (ex.: `GF7K2P`) para compartilhar: o aluno cria a conta com ele e entra direto na lista.
- Lista de alunos com busca, total de treinos e última atividade; detalhe do aluno com frequência da semana e histórico.
- Criação e edição de treinos em 5 etapas: aluno, nome e objetivo, grupo muscular (com ilustração), exercícios (sugestões em um toque, séries, repetições, carga e descanso) e observações.
- Lixeira: treinos excluídos podem ser restaurados ou apagados de vez.

**Aluno**
- Início com a semana de treinos, próximo treino sugerido, estatísticas e frase do dia.
- Detalhe do treino com todos os exercícios e a dica do personal.
- **Treino guiado**: marca série por série, cronômetro de descanso com ±15 s, tela sempre ligada, vibração no fim do descanso e opção de salvar ou descartar ao sair.
- Progresso: total de treinos, tempo treinado, semanas seguidas, gráfico das últimas 8 semanas, grupos mais treinados e histórico.

**Modo demonstração**: sem configurar nada, o app abre com dados de exemplo salvos no próprio aparelho. Contas prontas:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Personal | `personal@gymfei.app` | `123456` |
| Aluno | `aluno@gymfei.app` | `123456` |

Na tela de login também há os botões "Sou personal" e "Sou aluno" para entrar com um toque.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| App | React Native 0.88 + **Expo SDK 58** (Android, iOS e web) |
| Navegação | React Navigation 7 (pilha + abas inferiores personalizadas) |
| Banco e login | **Supabase** (PostgreSQL + Auth + Row Level Security) |
| Visual | `react-native-svg` (logo e mapa muscular), `expo-linear-gradient`, ícones Lucide, fonte Montserrat |
| Recursos do celular | `expo-haptics` (vibração), `expo-keep-awake` (tela ligada), `expo-clipboard` |

### Por que Supabase no lugar do Firebase?

- **Plano gratuito permanente** (2 projetos, 500 MB de banco, 50 mil usuários ativos por mês), sem cartão de crédito.
- **Banco relacional (PostgreSQL)**: personal → alunos → treinos → histórico é um modelo relacional; as consultas ficam simples, por exemplo `supabase.from("treinos").select("*").eq("aluno_id", id)`.
- **Login pronto** (e-mail e senha) com `supabase.auth.signUp()` e `signInWithPassword()`.
- **Segurança no próprio banco** com RLS: cada usuário só enxerga o que é dele, mesmo que alguém tente usar a API direto.
- Painel web com editor de tabelas e de SQL para acompanhar os dados.

## Design e IHC

A interface segue o padrão de apps de treino conhecidos (navegação por abas, cartões com capa, treino guiado em tela cheia) e as heurísticas de Nielsen:

| Princípio | Como aparece no app |
| --- | --- |
| Visibilidade do estado | Esqueletos de carregamento, botões com "carregando", barra de progresso do treino, avisos rápidos (toasts) |
| Correspondência com o mundo real | Termos de academia (séries, repetições, carga, descanso) e mapa muscular do grupo trabalhado |
| Controle e liberdade | Lixeira com restaurar, "desfazer série", sair do treino com opção de salvar ou descartar |
| Prevenção de erros | Validação na hora, código do personal conferido enquanto digita, aviso antes de descartar alterações |
| Reconhecer em vez de lembrar | Sugestões de exercícios por grupo, chips de objetivo, contadores em vez de digitação |
| Consistência | Design system único (`src/theme`) usado por todos os componentes |
| Estética minimalista | Tema escuro azul, hierarquia tipográfica clara, uma ação principal por tela |
| Ajuda com erros | Mensagens em português, junto do campo com problema |

Acessibilidade: áreas de toque de pelo menos 44–48 px, contraste de texto AA sobre o fundo escuro, rótulos para leitor de tela (`accessibilityLabel`, `aria-*`) e suporte a fonte ampliada.

## Rodando no seu computador

1. Instale o **Node.js LTS** (versão 22 ou mais nova): https://nodejs.org
2. Instale as dependências, dentro da pasta `gym-fei`:

   ```bash
   cd gym-fei
   npm install
   ```

3. Inicie o projeto:

   ```bash
   npx expo start
   ```

4. Abra o app:
   - **No celular**: instale o **Expo Go** (Play Store / App Store) e leia o QR Code do terminal. O celular e o computador precisam estar na mesma rede Wi-Fi (se não funcionar, use `npx expo start --tunnel`).
   - **No navegador**: aperte `w` no terminal.

Sem o arquivo `.env.local` o app roda no **modo demonstração**. Para usar o banco de verdade, siga a próxima seção.

> Dica: evite deixar o projeto dentro do OneDrive. A pasta `node_modules` tem milhares de arquivos e o OneDrive pode travar a sincronização ou a instalação. Uma pasta como `C:\dev\GymFEI` funciona melhor.

## Configurando o banco (Supabase)

1. Crie uma conta gratuita em https://supabase.com e clique em **New project**.
   - Nome: `gymfei` · Região: **South America (São Paulo)** · anote a senha do banco.
2. Crie as tabelas: no painel, abra **SQL Editor → New query**, cole todo o conteúdo de [`gym-fei/supabase/schema.sql`](gym-fei/supabase/schema.sql) e clique em **Run**. Deve aparecer "Success".
3. Para facilitar os testes, desative a confirmação de e-mail: **Authentication → Sign In / Providers → Email → desligue "Confirm email" → Save**. (Com ela ligada, cada novo usuário precisa clicar no link do e-mail antes de entrar, e o e-mail gratuito do Supabase tem limite de poucos envios por hora.)
4. Pegue as chaves em **Project Settings → API Keys** (copie a **Publishable key**) e a **Project URL** (botão **Connect** no topo do painel, ou **Project Settings → Data API**).
5. Na pasta `gym-fei`, copie `.env.example` para `.env.local` e preencha:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

6. Reinicie limpando o cache, para o app ler as variáveis:

   ```bash
   npx expo start -c
   ```

7. Teste: crie uma conta **personal**, copie o código de convite no Perfil, crie uma conta **aluno** usando esse código e monte o primeiro treino.

As duas chaves acima são públicas por natureza (vão dentro do app). Quem protege os dados é o RLS configurado no `schema.sql`. **Nunca** coloque no app a `secret key`/`service_role` nem a senha do banco.

> No plano gratuito, projetos sem uso por 7 dias são pausados. Basta abrir o painel do Supabase e clicar em **Restore** (os dados continuam lá).

### Modelo de dados

```
perfis ─────────────┐ (1 por usuário; tipo = personal | aluno; código de convite do personal)
  │ personal_id ────┘ (o aluno aponta para o personal)
  │
  ├── treinos (personal_id, aluno_id, nome, grupo_muscular, objetivo, exercicios em JSON, lixeira)
  └── historico_treinos (aluno_id, treino_id, duração, séries concluídas, data)
```

## Gerando o APK e a versão para lojas

O projeto não está publicado na web. Os passos abaixo servem para gerar o app instalável, se você quiser testá-lo no celular.

### APK para Android

Feito na nuvem pelo Expo, sem precisar de Android Studio:

```bash
npm install -g eas-cli
eas login
eas init
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxxxxxx.supabase.co" --environment preview --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_..." --environment preview --environment production --visibility plaintext
eas build --platform android --profile preview
```

Ao terminar, o Expo mostra um link/QR Code para baixar e instalar o APK em qualquer Android. (`eas login` usa uma conta gratuita do Expo; os builds gratuitos têm um limite mensal.)

### Lojas (opcional)

- **Google Play**: `eas build -p android --profile production` e depois `eas submit -p android` (conta Google Play Console, taxa única de US$ 25).
- **App Store**: `eas build -p ios` e `eas submit -p ios` (conta Apple Developer, US$ 99/ano).

## Estrutura do projeto

```
gym-fei/
├── App.js                  # fontes, splash, provedores e navegação
├── app.json                # nome, ícones, splash e cores do app
├── eas.json                # perfis de build (APK e loja)
├── .env.example            # modelo das chaves do Supabase
├── assets/                 # ícones, splash e fontes Montserrat
├── supabase/schema.sql     # tabelas, segurança (RLS) e funções do banco
└── src/
    ├── theme/              # design system: cores, tipografia, espaçamentos
    ├── components/         # Botao, CampoTexto, Cartao, BarraAbas, Logo, MapaMuscular...
    ├── navigation/         # pilha + abas do personal e do aluno
    ├── screens/
    │   ├── auth/           # BoasVindas, Login, Cadastro
    │   ├── personal/       # InicioPersonal, Alunos, DetalheAluno, TreinosPersonal, FormTreino, Lixeira
    │   ├── aluno/          # InicioAluno, MeusTreinos, DetalheTreino, TreinoEmAndamento, TreinoConcluido, Progresso
    │   └── Perfil.js
    ├── services/           # api.js (escolhe Supabase ou demo), supabaseApi.js, demoApi.js
    ├── context/            # AuthContext (sessão) e FeedbackContext (avisos e diálogos)
    ├── hooks/              # useDados, useVincularPersonal
    ├── data/catalogo.js    # grupos musculares, sugestões de exercícios, objetivos, frases
    └── utils/              # datas, estatísticas, regras de treino, vibração
```

## Problemas comuns

| Problema | Solução |
| --- | --- |
| O app continua em "modo demonstração" | Confira o nome do arquivo (`.env.local`, dentro de `gym-fei`) e rode `npx expo start -c` |
| "Invalid API key" | A chave colada não é a *Publishable key* do projeto certo |
| "Confirme seu e-mail" ao entrar | Desative "Confirm email" (passo 3 do Supabase) ou confirme pelo link recebido |
| `Could not find the table 'public.perfis'` | O `schema.sql` não foi executado no SQL Editor |
| Expo Go diz que o projeto é de outro SDK | Atualize o Expo Go pela loja (o projeto usa o SDK 58) |
| Celular não conecta no QR Code | Use a mesma rede Wi-Fi ou `npx expo start --tunnel` |
| `npx` bloqueado no PowerShell | Use o Prompt de Comando (cmd) ou rode `npx.cmd expo start` |

---

Projeto desenvolvido para fins acadêmicos · FEI.
