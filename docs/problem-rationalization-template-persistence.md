# Persistência e Composição de Templates no MongoDB

## Problem

A POC atual permite criar e editar templates usando rich text editors (Tiptap, Quill, CKEditor, etc.), mas **não persiste** esses templates. Toda vez que a página é recarregada, o conteúdo é perdido. É necessário adicionar a capacidade de:

1. **Salvar templates no MongoDB** em uma coleção chamada `templates`, com suporte a multi-tenancy (`databaseId`, `systemId`), campos de auditoria (`createdAt`, `updatedAt`) e campos de negócio (`definition`, `type`, `name`).
2. **CRUD completo na UI** — listar templates com filtro por tipo (header, body, footer), editar, excluir (na listagem) e salvar (no editor).
3. **Compor documentos a partir de múltiplos templates** — montar um documento combinando partes, por exemplo: 1 header + N bodies + 1 footer, permitindo uso flexível das peças.

O campo `type` aceita exatamente 3 valores: `header`, `footer` e `body`.

O projeto já possui um `MongoDBClient` singleton em `src/config/mongoClient.ts` e um `docker-compose.yaml` para infraestrutura.

## Expected Output

1. **Schema/model** — tipo TypeScript para o documento `Template` com todos os campos especificados.
2. **Camada de serviço/repositório** — funções para CRUD de templates no MongoDB (create, findAll com filtro por type, findById, update, delete).
3. **API/backend** — endpoints (ou rotas server-side) que exponham as operações de CRUD. Como o projeto usa Vite (frontend), será necessário um backend (ex.: Express) ou usar uma abordagem de API routes.
4. **UI — Listagem de templates** — página/componente que lista templates, com filtros por tipo (header, body, footer), e botões de editar/excluir em cada item.
5. **UI — Salvar no editor** — botão de salvar disponível dentro do editor de texto (Tiptap, Quill, CKEditor, etc.) que persiste o HTML (`definition`) do template.
6. **UI — Composição de documentos** — interface para selecionar e combinar templates (1 header + N bodies + 1 footer) e visualizar/exportar o documento composto.

Formato: código TypeScript/React seguindo as convenções do projeto (Google style guide para JS/TS).

## Validation Criteria

- Templates são persistidos no MongoDB na coleção `templates` com todos os campos obrigatórios (`databaseId`, `systemId`, `createdAt`, `updatedAt`, `definition`, `type`, `name`).
- É possível listar templates e filtrar por `header`, `body` e `footer`.
- É possível criar, editar e excluir templates pela UI.
- O botão de salvar está disponível no editor de texto e persiste o HTML corretamente.
- É possível compor um documento selecionando 1 header, N bodies e 1 footer, e o resultado combina o HTML de todas as partes na ordem correta.
- Campos de auditoria (`createdAt`, `updatedAt`) são preenchidos automaticamente.
- Multi-tenancy (`databaseId`, `systemId`) é enviado em todas as operações.

## Assumptions

⚠ Inferido que será necessário um backend (Express ou similar) para expor APIs REST, já que o projeto atual é apenas frontend (Vite + React). Alternativa: usar o Vite como proxy para um server Express no mesmo projeto.

⚠ Inferido que `databaseId` e `systemId` serão valores fixos/mockados nesta fase de POC, já que não há sistema de autenticação/tenant mencionado.

⚠ Inferido que a composição de documentos é apenas para **visualização/preview e exportação PDF**, não para edição inline do documento composto.

⚠ Inferido que o filtro na listagem será por abas ou dropdown com os 3 tipos (header, body, footer), e não por busca textual.

⚠ Inferido que um template pode ser reutilizado em múltiplas composições (relação N:N).

⚠ Inferido que a composição segue ordem fixa: headers no topo, bodies no meio (em ordem de seleção), footer no final.

⚠ Não foi mencionado se a composição também deve ser persistida como um "documento composto" — assumido que por ora é apenas montagem em tempo real na UI, sem salvar a composição em si.

---

Essa interpretação está correta? Algum ponto precisa de ajuste antes de partirmos para a implementação?
