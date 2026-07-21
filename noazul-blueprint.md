# NoAzul — Blueprint Arquitetural

> Documento gerado por ARCHITEKT em 2026-07-21. Pronto para entrega ao Claude Code.

## 1. Análise Estratégica

### 1.1 Pontos Positivos
- Demanda comprovada: o app de referência (Controle Financeiro Pessoal, dev Aleff) tem 1M+ downloads e nota 4,9 sendo tecnicamente rudimentar — o mercado premia simplicidade, não sofisticação.
- Modelo validado: freemium com IAP de R$ 4,49 a R$ 149,90 funciona nesse nicho, sem exigir Open Finance nem infraestrutura bancária.
- Público brasileiro de baixa/média renda quer controle manual e offline — sem cadastro, sem conexão bancária, sem fricção. Isso reduz drasticamente custo de infra e risco regulatório.
- O app de referência tem UI visivelmente datada (Material Design 1, cores saturadas, densidade caótica). Uma execução moderna do mesmo escopo já é diferencial.
- Escopo pequeno e bem definido: CRUD + agregações mensais. Baixa complexidade algorítmica, alta previsibilidade de entrega.

### 1.2 Pontos Negativos / Riscos
- Mercado saturado: dezenas de apps quase idênticos na Play Store; aquisição orgânica depende de ASO agressivo e leva 12–24 meses.
- Retenção estrutural baixa na categoria: controle manual exige disciplina; a maioria abandona em 2–4 semanas.
- Sem moat técnico: qualquer feature é copiável em dias. A defesa é execução, ritmo de release e base de reviews.
- Monetização por anúncios em app financeiro degrada confiança; assinatura exige entregar valor percebido acima de planilha grátis.
- O incumbente compete há 7 anos (desde 2019) iterando por feedback de reviews — vantagem de ranking difícil de deslocar de frente.

### 1.3 Oportunidades de Mercado
- "Modo simples radical": onboarding em 30 segundos, zero cadastro, dados 100% locais — atacar exatamente quem rejeita Mobills/Organizze por complexidade e login obrigatório.
- Categorização assistida por IA local/leve (sugestão de categoria pelo nome do lançamento) — nenhum player do segmento low-end faz isso bem.
- Perfis múltiplos (casa / MEI / bico) é subexplorado: autônomos e microempreendedores usam esses apps para o negócio, como o próprio incumbente admite na descrição.
- Exportação PDF/Excel de qualidade profissional é diferencial real para MEI declarar-se ao contador.

### 1.4 Pontos de Atenção
- Local-first + sync opcional é o par mais traiçoeiro do projeto: resolução de conflitos, relógios de dispositivo e migrações de schema local. Definir estratégia (last-write-wins por campo) na Fase 0, não depois.
- Valores monetários SEMPRE em centavos (integer). Float em dinheiro é bug garantido.
- Recorrências e parcelamentos geram lançamentos futuros: decidir cedo entre materialização (gerar N registros) vs. projeção (calcular on-the-fly). Recomendação: materializar — é o que o usuário espera editar.
- LGPD: mesmo sem conta, dados financeiros no dispositivo + sync opcional exigem política de privacidade clara e exclusão total sob demanda.
- Anúncios (se usados no free tier) não podem cobrir valores financeiros — risco de churn imediato.
- Google Play exige target API atualizado anualmente — orçar manutenção contínua.

### 1.5 Concorrência
- **Mobills** — líder BR, Open Finance, cartões, web+mobile. Melhor: completude e marca. Pior: pesado, caro (assinatura ~R$ 15–20/mês), exige cadastro.
- **Organizze** — simples e bonito, web+mobile. Melhor: UX limpa. Pior: pago quase desde o início, sem tier gratuito generoso.
- **Monefy** — global, offline, entrada em 2 toques. Melhor: velocidade de registro. Pior: sem contas a pagar/vencimentos, fraco para o caso brasileiro de "boletos do mês".
- **Controle Financeiro Pessoal (Aleff)** — o incumbente direto do nicho. Melhor: simplicidade offline, sem cadastro, responde sugestões de usuários. Pior: UI datada, sem sync, sem inteligência, anúncios.

### 1.6 Veredito
Vale construir **como negócio de nicho, não como aposta de escala**: teto realista de receita na casa de dezenas de milhares de R$/mês com anos de ASO. O wedge é **"o app de contas do mês, offline e sem cadastro, com a melhor exportação para contador do Brasil"** — mirando quem organiza boletos por vencimento (não quem quer dashboard bancário) e o autônomo/MEI via perfis múltiplos. Escopo do MVP deve ser brutal: replicar o núcleo do incumbente com UX moderna, e só depois diferenciar com IA de categorização e relatórios premium.

---

## 2. Definição do Produto

### 2.1 Nome e One-liner
- **Nome de trabalho:** NoAzul
- **One-liner:** O app offline de contas do mês que qualquer brasileiro organiza em 30 segundos — sem cadastro, sem banco, sem complicação.

### 2.2 Público-Alvo
Brasileiros classe C/B de 25–55 anos que controlam boletos e salário manualmente (hoje em papel, planilha ou apps datados), mais autônomos/MEIs que precisam separar finanças da casa e do negócio. Dispostos a pagar R$ 6,90–14,90/mês ou compra vitalícia ~R$ 99 por conveniência e relatórios.

### 2.3 Problema e Proposta de Valor
- **Problema:** Não saber, no meio do mês, quanto ainda falta pagar e quanto sobra com segurança.
- **Proposta de valor:** Registro em segundos, visão imediata de "falta pagar / saldo seguro" por mês, funcionando 100% offline e sem criar conta — com relatórios exportáveis que nem planilha nem os concorrentes gratuitos entregam.

### 2.4 Modelo de Negócio
Freemium por assinatura via loja (RevenueCat): **Free** = 1 perfil, lançamentos ilimitados, orçamentos, sem exportação, com 1 banner discreto. **Premium** (R$ 9,90/mês, R$ 79,90/ano ou vitalício R$ 149,90) = perfis ilimitados, exportação PDF/Excel, sync/backup em nuvem, sem anúncios. Sem venda de dados, nunca.

### 2.5 Funcionalidades do MVP
1. Lançamentos de receita/despesa com vencimento, status pago/pendente, categoria e navegação mensal (← mês →).
2. Recorrências e parcelamentos (conta fixa mensal; compra em N parcelas gera N lançamentos).
3. Painel do mês: receita disponível, saldo seguro, total de despesas, falta pagar + gráfico de rosca por categoria.
4. Orçamento mensal por categoria com barra de progresso (orçado × gasto × disponível).
5. Perfis múltiplos locais (Casa, Firma, etc.), cada um com seus lançamentos e orçamentos.

**Backlog pós-MVP:** exportação PDF/Excel, sync em nuvem + backup, categorização sugerida por IA, transferência de saldo entre meses, filtros avançados (categoria/conta/status), widgets, versão web, lembretes de vencimento, multi-moeda.

### 2.6 Métricas de Sucesso
- **North Star:** % de usuários ativos que registram lançamentos em ≥3 semanas distintas do mesmo mês (hábito formado).
- Secundárias: retenção D30; conversão free→premium em 60 dias.

---

## 3. Arquitetura Técnica

> **Desvio da stack padrão — justificado:** o produto é mobile-first, offline-first e sem cadastro obrigatório. Next.js web como núcleo seria o produto errado. Núcleo em **Expo (React Native)** com banco local; o backend padrão (Next.js + tRPC + Prisma + Supabase + Vercel) entra apenas como **serviço de sync/backup opcional** (Premium), preservando a stack padrão onde ela cabe.

### 3.1 Stack
- **Mobile:** Expo SDK 52+ (React Native, TypeScript, expo-router) — único caminho sano para Android+iOS com um time de 1 dev.
- **UI:** NativeWind (Tailwind para RN) + componentes próprios — consistência com o ecossistema Tailwind.
- **Estado:** Zustand (client state) + TanStack Query (dados locais/async) — leve e sem boilerplate.
- **Banco local:** expo-sqlite + **Drizzle ORM** — SQLite é o padrão offline-first; Drizzle dá tipagem e migrações no dispositivo (Prisma não roda em RN).
- **Validação:** Zod — schema único compartilhado entre app e backend.
- **Backend de sync (opcional/Premium):** Next.js 14+ (App Router) + tRPC + Prisma + Supabase Postgres, deploy na Vercel — stack padrão, só para push/pull de sync e webhooks de billing.
- **Auth (só para sync):** Supabase Auth (magic link/OTP por e-mail) — Clerk é overkill para um login opcional.
- **Pagamentos:** RevenueCat sobre Google Play Billing / App Store — abstrai as duas lojas; Stripe não serve para IAP mobile.
- **Anúncios (free):** Google AdMob, 1 banner fixo fora das telas de valores.
- **Exportação (pós-MVP):** geração de PDF/XLSX no dispositivo (react-native-html-to-pdf + SheetJS).
- **Observabilidade:** Sentry (crash) + PostHog (produto) — ambos com SDK RN maduro.
- **CI/CD:** EAS Build + EAS Update (OTA) — releases sem esperar review para JS fixes.

### 3.2 Estrutura de Pastas

```
noazul/
├── apps/
│   ├── mobile/                  # Expo app
│   │   ├── app/                 # expo-router
│   │   │   ├── (onboarding)/
│   │   │   │   └── index.tsx
│   │   │   ├── (main)/
│   │   │   │   ├── month/[ym].tsx      # tela principal do mês
│   │   │   │   ├── transaction/
│   │   │   │   │   ├── new.tsx
│   │   │   │   │   └── [id].tsx
│   │   │   │   ├── budget/index.tsx
│   │   │   │   ├── profiles/index.tsx
│   │   │   │   └── settings/index.tsx
│   │   │   └── paywall.tsx
│   │   ├── src/
│   │   │   ├── db/              # drizzle schema local + migrações
│   │   │   ├── features/        # transactions/, budgets/, profiles/, summary/
│   │   │   ├── components/ui/
│   │   │   ├── stores/          # zustand
│   │   │   ├── services/        # revenuecat, admob, sync-client
│   │   │   └── lib/             # money.ts (centavos), dates.ts, recurrence.ts
│   │   └── app.config.ts
│   └── web-sync/                # Next.js (App Router) — API de sync + landing
│       ├── app/
│       │   ├── (marketing)/page.tsx
│       │   └── api/trpc/[trpc]/route.ts
│       ├── server/
│       │   ├── routers/         # sync.ts, user.ts, billing.ts
│       │   └── db.ts            # prisma client
│       └── prisma/schema.prisma
└── packages/
    └── shared/                  # zod schemas, tipos, regras de domínio
```

### 3.3 Schema do Banco (Prisma — backend de sync; espelhado em Drizzle no app)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String    @id @default(cuid())
  email      String    @unique
  isPremium  Boolean   @default(false)
  createdAt  DateTime  @default(now())
  profiles   Profile[]
}

model Profile {
  id           String        @id            // uuid gerado no dispositivo
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String                        // "Casa", "Firma"
  isDefault    Boolean       @default(false)
  deletedAt    DateTime?
  updatedAt    DateTime      @updatedAt
  categories   Category[]
  transactions Transaction[]
  budgets      Budget[]

  @@index([userId])
}

model Category {
  id           String        @id
  profileId    String
  profile      Profile       @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name         String
  color        String                        // hex
  deletedAt    DateTime?
  updatedAt    DateTime      @updatedAt
  transactions Transaction[]
  budgets      Budget[]

  @@unique([profileId, name])
}

enum TxType {
  INCOME
  EXPENSE
}

enum TxStatus {
  PENDING
  PAID
}

model Transaction {
  id            String    @id
  profileId     String
  profile       Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  categoryId    String?
  category      Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  name          String
  type          TxType
  status        TxStatus  @default(PENDING)
  amountCents   Int                           // SEMPRE centavos
  dueDate       DateTime                      // vencimento
  paidAt        DateTime?
  recurrenceId  String?                       // agrupa série recorrente
  installmentNo Int?                          // 3 de 10
  installmentOf Int?
  deletedAt     DateTime?
  updatedAt     DateTime  @updatedAt

  @@index([profileId, dueDate])
  @@index([recurrenceId])
}

model Budget {
  id          String    @id
  profileId   String
  profile     Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  yearMonth   String                          // "2026-07"
  limitCents  Int
  deletedAt   DateTime?
  updatedAt   DateTime  @updatedAt

  @@unique([profileId, categoryId, yearMonth])
}
```

### 3.4 Rotas e tRPC Routers
- **Telas públicas (app):** onboarding (1 tela, cria perfil "Casa" e entra), paywall.
- **Telas principais:** mês (lista + resumo + gráfico), novo/editar lançamento, orçamentos do mês, perfis, ajustes.
- **Web pública:** landing de marketing + política de privacidade.
- **tRPC (web-sync):**
  - `user.getMe`, `user.deleteAccount`
  - `sync.push` (lote de mutações do dispositivo, LWW por `updatedAt`)
  - `sync.pull` (mudanças desde `lastSyncedAt`)
  - `billing.webhook` (RevenueCat → atualiza `isPremium`)

### 3.5 Integrações Externas
- **RevenueCat** — assinaturas nas duas lojas. Custo: grátis até US$ 2,5k MRR, depois 1%. Lock-in: médio (migração possível, chata).
- **AdMob** — banner no free tier. Custo: zero (é receita). Lock-in: baixo.
- **Supabase** — Postgres + Auth do sync. Custo: free tier → ~US$ 25/mês. Lock-in: baixo (Postgres puro).
- **Sentry + PostHog** — crash e analytics. Free tiers suficientes até ~10k MAU. Lock-in: baixo.
- **EAS (Expo)** — builds e OTA. ~US$ 0–19/mês no início. Lock-in: médio (aceitável, é o padrão do ecossistema).

---

## 4. Roadmap de Implementação

### Fase 0 — Setup & Foundations
**Objetivo:** Monorepo rodando com app Expo no dispositivo e banco local migrando.
**Duração estimada:** 3 dias úteis
**Entregável:** App abre, cria perfil "Casa" no SQLite, EAS build de dev instalável.

**Tarefas:**
1. Monorepo (pnpm workspaces) com `apps/mobile`, `apps/web-sync`, `packages/shared`.
2. Expo + TypeScript strict + expo-router + NativeWind configurados.
3. expo-sqlite + Drizzle com migração inicial (profiles, categories, transactions, budgets) e seed de categorias padrão.
4. `lib/money.ts` (centavos ↔ BRL) e `lib/dates.ts` (yearMonth) com testes unitários.
5. EAS configurado, primeiro build de desenvolvimento.

**Critério de aceite:**
- [ ] `pnpm dev` sobe o app no Expo Go/dev build
- [ ] Migração cria as 4 tabelas e o perfil default no primeiro boot
- [ ] Testes de money/dates passam no CI

**Bloqueadores/Dependências:** nenhum.

### Fase 1 — Core Domain: lançamentos do mês
**Objetivo:** A feature central funciona end-to-end, mesmo feia.
**Duração estimada:** 5 dias úteis
**Entregável:** Criar/editar/excluir lançamentos, marcar pago/pendente, navegar entre meses, ver totais.

**Tarefas:**
1. CRUD de Transaction (form com nome, valor, tipo, vencimento, categoria, status).
2. Tela do mês: lista ordenada por vencimento, cores por tipo/status, navegação ← →.
3. Agregações do mês (SQL): receita disponível, total despesas, já pago, falta pagar, saldo seguro.
4. Swipe no card para alternar pago/pendente (gesto central do incumbente).
5. Duplicar lançamento e mover para mês anterior/seguinte.

**Critério de aceite:**
- [ ] Lançamento criado aparece no mês correto e altera os totais instantaneamente
- [ ] Swipe alterna status e recalcula "falta pagar"
- [ ] Nenhum valor manipulado como float em nenhum ponto do código

**Bloqueadores/Dependências:** Fase 0.

### Fase 2 — Recorrências e parcelamentos
**Objetivo:** Contas fixas e compras parceladas em um único cadastro.
**Duração estimada:** 4 dias úteis
**Entregável:** "Aluguel todo dia 10" e "Notebook em 10x" geram os lançamentos corretos.

**Tarefas:**
1. `lib/recurrence.ts`: materialização de série mensal (12 meses à frente) e parcelas N/M.
2. UI no form: toggle fixa/parcelada com campos condicionais.
3. Edição em série vs. instância única (padrão calendário: "só esta / esta e futuras").
4. Exclusão de série com confirmação.

**Critério de aceite:**
- [ ] Parcelada 10x cria 10 lançamentos com sufixo (1/10…10/10) nos meses corretos
- [ ] Editar "esta e futuras" não altera lançamentos passados
- [ ] Testes unitários de recorrência cobrem fim de mês (dia 31 → fev)

**Bloqueadores/Dependências:** Fase 1.

### Fase 3 — Painel, gráfico e orçamentos
**Objetivo:** O usuário entende sua situação do mês em 3 segundos.
**Duração estimada:** 4 dias úteis
**Entregável:** Bottom sheet de resumo com gráfico de rosca + tela de orçamentos por categoria.

**Tarefas:**
1. Bottom sheet arrastável na tela do mês com os blocos de resumo (receitas, despesas, saldo seguro, falta pagar, média diária).
2. Gráfico de rosca de despesas por categoria (victory-native ou react-native-svg).
3. CRUD de Budget por categoria/mês com barra de progresso e "ainda pode gastar".
4. Copiar orçamentos do mês anterior em 1 toque.

**Critério de aceite:**
- [ ] Rosca soma 100% e reflete exclusões em tempo real
- [ ] Orçamento estourado muda a barra para vermelho
- [ ] Resumo idêntico entre tela do mês e tela de orçamento

**Bloqueadores/Dependências:** Fase 1 (Fase 2 ajuda mas não bloqueia).

### Fase 4 — UI polida + perfis múltiplos
**Objetivo:** Parecer produto de 2026, não de 2019, e habilitar o caso MEI.
**Duração estimada:** 5 dias úteis
**Entregável:** Design system aplicado, estados vazios/erro, troca de perfil no header.

**Tarefas:**
1. Design tokens (cores, tipografia, espaçamento) e refino de todos os componentes.
2. Estados empty/loading/erro em todas as telas; haptics nos gestos.
3. CRUD de perfis + switcher no header; todo o estado escopado por `profileId`.
4. Onboarding de 1 tela (nome do perfil opcional → entra direto).
5. Modo escuro.

**Critério de aceite:**
- [ ] Trocar de perfil isola 100% dos dados exibidos
- [ ] Zero telas com layout quebrado em Android pequeno (5") e grande
- [ ] Onboarding até o primeiro lançamento em <60s cronometrados

**Bloqueadores/Dependências:** Fases 1–3.

### Fase 5 — Monetização
**Objetivo:** Free/Premium funcionando nas lojas.
**Duração estimada:** 4 dias úteis
**Entregável:** Paywall, assinatura via RevenueCat, gates de feature, banner AdMob no free.

**Tarefas:**
1. RevenueCat: produtos (mensal, anual, vitalício), sincronização de entitlement.
2. Paywall (acionado em: 2º perfil, exportação futura, remoção de ads).
3. Gate de perfis (free = 1) e flag `isPremium` local.
4. AdMob banner apenas na lista (nunca sobre valores), oculto para premium.

**Critério de aceite:**
- [ ] Compra sandbox libera premium sem reinstalar
- [ ] Restaurar compra funciona em dispositivo novo
- [ ] Free vê exatamente 1 banner e nenhum interstitial

**Bloqueadores/Dependências:** Fase 4; contas Play Console/App Store ativas.

### Fase 6 — Sync opcional + backend
**Objetivo:** Backup/sync em nuvem para premium, mantendo offline-first.
**Duração estimada:** 6 dias úteis
**Entregável:** Login opcional por e-mail, push/pull de mutações, restauração em novo aparelho.

**Tarefas:**
1. `apps/web-sync`: Next.js + tRPC + Prisma + Supabase (schema da seção 3.3).
2. Fila de mutações no dispositivo (outbox) com `updatedAt` e soft delete.
3. `sync.push`/`sync.pull` com resolução last-write-wins por registro.
4. Webhook RevenueCat → `isPremium`; exclusão total de conta (LGPD).
5. Landing page + política de privacidade publicadas.

**Critério de aceite:**
- [ ] Editar offline em 2 aparelhos e sincronizar não perde nenhum registro
- [ ] `user.deleteAccount` apaga tudo no servidor e confirma no app
- [ ] App continua 100% funcional sem login

**Bloqueadores/Dependências:** Fase 5 (entitlement) e Fase 0 (shared schemas).

### Fase 7 — Observabilidade + Launch prep
**Objetivo:** Lançar nas lojas com telemetria e ASO mínimos.
**Duração estimada:** 4 dias úteis
**Entregável:** App publicado em produção com Sentry/PostHog ativos e ficha de loja otimizada.

**Tarefas:**
1. Sentry (crash + source maps EAS) e PostHog (eventos: lançamento criado, paywall visto, compra).
2. Funil de conversão free→premium instrumentado.
3. Ficha da loja: screenshots, descrição ASO (palavras: controle de gastos, contas a pagar, orçamento), vídeo curto.
4. Testes fechados Play Console (exigência de 12 testers), depois produção.
5. Backlog pós-launch priorizado: exportação PDF/Excel → IA de categorização → transferência de saldo entre meses → filtros avançados.

**Critério de aceite:**
- [ ] Crash-free rate visível no Sentry no dia 1
- [ ] Evento de compra chega ao PostHog em produção
- [ ] App aprovado e listado nas duas lojas

**Bloqueadores/Dependências:** Fases 5–6; review das lojas (1–7 dias, fora do controle).

---

## 5. Instruções para o Claude Code

> Cole o bloco abaixo como mensagem inicial no Claude Code, na raiz do repositório vazio.

```
CONTEXTO
Você vai construir o NoAzul: app mobile offline-first de controle de finanças pessoais
(receitas/despesas por mês, recorrências/parcelas, orçamentos por categoria, perfis
múltiplos), freemium via RevenueCat, com backend opcional de sync.
O blueprint completo está em ./noazul-blueprint.md — leia antes de qualquer código.

STACK E CONVENÇÕES
- Monorepo pnpm: apps/mobile (Expo SDK 52+, TS strict, expo-router, NativeWind,
  Zustand, TanStack Query, expo-sqlite + Drizzle), apps/web-sync (Next.js App Router,
  tRPC, Prisma, Supabase), packages/shared (Zod schemas e regras de domínio).
- TypeScript strict, proibido `any` e `as unknown as`.
- Dinheiro SEMPRE em centavos (int). Formatação BRL só na borda da UI (lib/money.ts).
- IDs: uuid v7 gerados no dispositivo (compatível com sync).
- Soft delete (`deletedAt`) em todas as entidades sincronizáveis.
- Datas em UTC no banco; exibição no fuso do dispositivo; mês = string "YYYY-MM".
- Commits convencionais; cada fase termina com testes passando.

COMO RODAR
1. pnpm install
2. pnpm --filter mobile dev  (Expo dev server; use dev build ou Expo Go)
3. pnpm --filter web-sync dev (só a partir da Fase 6)
4. pnpm test

EXECUTE AGORA A FASE 0 do roadmap (seção 4 do blueprint), na ordem das tarefas,
e pare ao cumprir todos os critérios de aceite. Não avance de fase sem eu pedir.
```

---

## 6. Anexos

### 6.1 Variáveis de ambiente (.env.example)

```
# apps/mobile (via app.config.ts / EAS secrets)
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID=
EXPO_PUBLIC_ADMOB_BANNER_ID_IOS=
EXPO_PUBLIC_REVENUECAT_KEY_ANDROID=
EXPO_PUBLIC_REVENUECAT_KEY_IOS=
EXPO_PUBLIC_SYNC_API_URL=

# apps/web-sync
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REVENUECAT_WEBHOOK_SECRET=
SENTRY_DSN=
```

### 6.2 Comandos úteis (package.json raiz)

```json
{
  "scripts": {
    "dev": "pnpm --filter mobile dev",
    "dev:sync": "pnpm --filter web-sync dev",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "db:generate": "pnpm --filter mobile drizzle-kit generate",
    "db:migrate:remote": "pnpm --filter web-sync prisma migrate deploy",
    "build:android": "eas build -p android --profile production",
    "ota": "eas update --branch production"
  }
}
```

### 6.3 Riscos técnicos conhecidos e mitigações
- **Conflitos de sync** — LWW por registro + soft delete; nunca merge por campo no MVP; logar conflitos no Sentry para avaliar upgrade futuro (CRDT é overkill agora).
- **Migrações do SQLite no dispositivo** — versionar com Drizzle desde a Fase 0; testar upgrade de cada versão publicada antes do release.
- **Recorrência em fins de mês** (dia 31 → fevereiro) — regra explícita "último dia do mês" com testes unitários dedicados.
- **Rejeição de loja por billing** — usar exclusivamente IAP nativo via RevenueCat; nenhum link externo de pagamento no app.
- **Peso do bundle** — meta <30 MB; evitar libs de gráfico pesadas (usar SVG puro se necessário).
- **Reviews/ranking do zero** — mitigar com prompt de avaliação in-app após 3ª semana de uso ativo (momento de valor percebido).
