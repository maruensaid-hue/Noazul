# NoAzul

App de controle financeiro pessoal offline-first para o mercado brasileiro. Veja o
blueprint completo em [`noazul-blueprint.md`](./noazul-blueprint.md) antes de mexer no
código — ele define produto, arquitetura e o roadmap de fases.

## Estrutura

```
apps/mobile      Expo (React Native) — app principal, offline-first, SQLite local
apps/web-sync    Next.js — API de sync/backup opcional (Premium), a partir da Fase 6
packages/shared  Zod schemas e tipos de domínio compartilhados
```

## Como rodar

```
pnpm install
pnpm dev          # expo start (apps/mobile)
pnpm dev:sync     # apps/web-sync, só relevante a partir da Fase 6
pnpm test         # testes de todos os workspaces
pnpm typecheck
pnpm lint
```

## Status

Fase 0 (Setup & Foundations) concluída — ver seção 4 do blueprint para o roadmap
completo.
