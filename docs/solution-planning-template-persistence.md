# Solution Planning — Persistência e Composição de Templates

## Referência

- Problem: `docs/problem-rationalization-template-persistence.md`

## Arquitetura

O projeto é Vite + React (frontend only). Para persistir no MongoDB, precisamos de um backend.  
Abordagem escolhida: **Express server separado** (`server/`) com proxy no Vite.

```
┌──────────────────┐       proxy /api/*       ┌──────────────────┐
│   Vite (React)   │ ──────────────────────►   │  Express (3001)  │
│   localhost:5173  │                           │  server/index.ts │
└──────────────────┘                           └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │   MongoDB (27017)│
                                               │   docker-compose │
                                               └──────────────────┘
```

## Plano de implementação

### 1. Backend — Express API

- `server/index.ts` — Express app, CORS, JSON body parser
- `server/models/template.ts` — tipo TypeScript do documento
- `server/routes/templates.ts` — CRUD REST endpoints
- `server/db.ts` — conexão MongoDB usando o driver nativo (reutilizando padrão do mongoClient.ts existente)

### 2. Vite proxy

- `vite.config.ts` — adicionar proxy `/api` → `http://localhost:3001`

### 3. Frontend — Service layer

- `src/services/templateService.ts` — funções fetch para CRUD

### 4. Frontend — Páginas e componentes

- `src/pages/TemplatesPage.tsx` — listagem com filtros por tipo
- `src/pages/ComposePage.tsx` — composição de templates
- `src/components/TemplateSaveBar.tsx` — barra de salvar no editor
- Alterar `App.tsx` — adicionar rotas para Templates e Compose
- Alterar cada editor page para incluir o TemplateSaveBar

### 5. Scripts

- `package.json` — adicionar script `server` e dependências (express, cors)

## Endpoints REST

| Método | Rota                       | Descrição                  |
| ------ | -------------------------- | -------------------------- |
| GET    | /api/templates?type=header | Listar com filtro opcional |
| GET    | /api/templates/:id         | Buscar por ID              |
| POST   | /api/templates             | Criar template             |
| PUT    | /api/templates/:id         | Atualizar template         |
| DELETE | /api/templates/:id         | Excluir template           |

## Modelo do documento

```typescript
interface Template {
  _id?: ObjectId;
  databaseId: string;
  systemId: string;
  name: string;
  type: "header" | "body" | "footer";
  definition: string; // HTML
  createdAt: Date;
  updatedAt: Date;
}
```