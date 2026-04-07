# POC — Validação de Rich Text Editors para Templates de Documentos (CKEditor vs TinyMCE)

## Status

> DONE

---

## 1. Problem Summary

É necessário validar qual rich text editor — CKEditor 5 ou TinyMCE — é mais adequado para criar templates de documentos com header, corpo (campos dinâmicos preenchíveis via placeholder ou digitação) e footer. O foco principal é a experiência de criação de templates; a exportação para PDF deve usar os recursos nativos de cada editor, com download direto.

**Contexto adicional descoberto na aquisição de contexto:**

- **CKEditor 5**: Merge Fields (plugin premium) suporta campos inline de texto, campos block e campos de imagem. Prefixo/sufixo `{{` `}}` configuráveis. Preview mode com data sets. Export to PDF também é premium e usa CKEditor Cloud Services como conversor. Requer `licenseKey` — disponível trial de 14 dias sem cartão.
- **TinyMCE**: Merge Tags (plugin pago) suporta campos inline não-editáveis com prefixo `{{` `}}`. Export to PDF também é plugin pago, usa serviço cloud ou self-hosted com JWT. Trial disponível com watermark (sem JWT) ou sem watermark (com JWT trial).
- Ambos os editores têm integração oficial com React via npm.

## 2. Proposed Solution

SPA com **Vite + React + TypeScript** contendo duas páginas — uma para cada editor — acessíveis via rotas. Cada página implementa um editor configurado com:

- Template com header fixo, corpo com campos dinâmicos (merge fields/tags), e footer
- Capacidade de preencher os campos via placeholder ou digitação
- Botão de exportar para PDF usando o plugin nativo de cada editor

A escolha de Vite + React + TypeScript se justifica por:

- **Velocidade de setup** — Vite gera projeto React+TS em segundos
- **Compatibilidade** — Ambos os editores têm componentes React oficiais
- **Conformidade** — AGENTS.MD define Google JS/TS style guide

## 3. Implementation Plan

### Step 1 — Scaffold do projeto

Criar projeto Vite + React + TypeScript na raiz do repositório existente.

- **Comando**: `npm create vite@latest . -- --template react-ts`
- **Arquivos**: `package.json`, `tsconfig.json`, `vite.config.ts`

### Step 2 — Instalar dependências

- `react-router-dom` para roteamento
- `ckeditor5`, `@ckeditor/ckeditor5-react`, `ckeditor5-premium-features`
- `@tinymce/tinymce-react`, `tinymce` (dev)

### Step 3 — Estrutura de rotas e layout

Layout base com navegação entre as duas páginas (CKEditor / TinyMCE).

### Step 4 — Configuração compartilhada

- `src/config/mergeFieldsConfig.ts` — definições dos campos dinâmicos com funções de conversão para formato CKEditor e TinyMCE
- `src/config/templateConfig.ts` — template HTML inicial com header, body com merge fields, e footer

### Step 5 — Componente CKEditor 5

ClassicEditor com plugins: MergeFields, ExportPdf, Mention, formatação, etc.
Merge fields configurados com groups, data sets e preview mode.

### Step 6 — Componente TinyMCE

Editor com plugins: mergetags, exportpdf, formatação, etc.
Merge tags configurados com a mesma lista de campos.

### Step 7 — Páginas e App

- `src/pages/CKEditorPage.tsx` e `src/pages/TinyMCEPage.tsx`
- `src/App.tsx` com React Router e navegação por abas
- Variáveis de ambiente via `.env` com prefixo `VITE_`

## 4. Architectural Decision Records (ADR)

| Decisão                                     | Justificativa                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Vite + React + TypeScript                   | Setup rápido, integração oficial com ambos os editores, conformidade com AGENTS.MD (Google JS/TS style)   |
| React Router DOM para navegação             | Forma mais simples de ter duas páginas distintas sem complexidade de framework full-stack                 |
| CKEditor 5 via npm + license key trial      | Merge Fields e Export to PDF são plugins premium; trial de 14 dias é suficiente para POC                  |
| TinyMCE via cloud CDN (API key gratuita)    | Simplifica setup — não precisa copiar arquivos para `public/`. Merge Tags e Export PDF funcionam em trial |
| Merge fields com prefixo `{{` e sufixo `}}` | Padrão da indústria, suportado nativamente por ambos os editores, facilita comparação direta              |
| Template HTML compartilhado em `config/`    | Garante que ambos os editores partem do mesmo template, tornando a comparação justa                       |
| Export PDF via plugins nativos dos editores | Conforme solicitado — simplifica a POC e mantém foco na criação de templates                              |
| Sem persistência (localStorage opcional)    | POC de validação — persistência não é requisito, reduz complexidade                                       |
| Variáveis de ambiente com prefixo `VITE_`   | Requerido pelo Vite para expor variáveis ao client-side                                                   |

## 5. Validation Checklist

- [x] Os dois editores estão funcionando lado a lado na mesma aplicação
- [x] É possível criar um template com header, body com campos dinâmicos e footer em **ambos** os editores
- [x] Os campos dinâmicos podem ser preenchidos via placeholder e via digitação direta
- [x] A exportação para PDF funciona usando os recursos nativos de cada editor e o arquivo é baixado pelo navegador
- [x] O setup é simples: `npm install` → `npm run dev` sem configuração extra (exceto `.env`)
- [x] O código segue o style guide Google JS/TS conforme definido no AGENTS.MD
- [x] O template inicial é o mesmo em ambos os editores para comparação justa
- [x] A navegação entre as páginas CKEditor e TinyMCE funciona corretamente

## 6. Implementation Log

### O que foi feito

1. **Scaffold do projeto** — Projeto Vite + React + TypeScript criado na raiz do repositório com `npm create vite@latest . -- --template react-ts`
2. **Dependências instaladas** — `react-router-dom`, `ckeditor5`, `@ckeditor/ckeditor5-react`, `ckeditor5-premium-features`, `@tinymce/tinymce-react`, `tinymce` (dev)
3. **Configuração compartilhada** — Merge fields e template HTML definidos em `src/config/` com funções de conversão para ambos os formatos
4. **CKEditor 5 configurado** — ClassicEditor com Merge Fields (groups + data sets + preview mode) e Export to PDF, toolbar completa
5. **TinyMCE configurado** — Editor com Merge Tags e Export to PDF, toolbar equivalente
6. **Layout e navegação** — App com header sticky, navegação por abas (NavLink) entre `/ckeditor` e `/tinymce`, redirect automático para `/ckeditor`
7. **Variáveis de ambiente** — `.env` com `VITE_CK_EDITOR_LICENSE_KEY` e `VITE_TINY_CLOUD_API_KEY`, tipagem em `src/env.d.ts`
8. **Estilos** — CSS limpo e moderno em `index.css`
9. **Documentação** — README.md atualizado com setup, estrutura e campos disponíveis

### Pontos de alteração

- `package.json` — dependências e scripts
- `src/main.tsx` — entrypoint com BrowserRouter
- `src/App.tsx` — layout com React Router e navegação por abas
- `src/index.css` — estilos globais da aplicação
- `src/App.css` — limpo (estilos centralizados em index.css)
- `src/env.d.ts` — tipagem das variáveis de ambiente Vite
- `src/config/mergeFieldsConfig.ts` — definição dos 8 campos dinâmicos com funções `getCKEditorMergeFieldsConfig()` e `getTinyMCEMergeTagsList()`
- `src/config/templateConfig.ts` — template HTML com header (empresa + CNPJ), body (declaração com campos), footer
- `src/components/CKEditorTemplate.tsx` — CKEditor 5 ClassicEditor com MergeFields, ExportPdf e 17+ plugins
- `src/components/TinyMCETemplate.tsx` — TinyMCE Editor com mergetags, exportpdf e 16+ plugins
- `src/pages/CKEditorPage.tsx` — página com instruções e componente CKEditor
- `src/pages/TinyMCEPage.tsx` — página com instruções e componente TinyMCE
- `.env` — chaves reais de licença (gitignored)
- `.env-test` — template de variáveis de ambiente para documentação
- `.gitignore` — adicionado `.env`, `.env.local`, `.env.production`
- `README.md` — documentação completa do projeto
- `docs/problem-rationalization.md` — documento de problem-rationalization aprovado

### Desvios do plano

- **Tipagem TinyMCE**: O import `import type {Editor} from 'tinymce'` não resolvia corretamente via TypeScript. Substituído por `useRef<any>` com comment eslint-disable para não bloquear a POC.
- **Variáveis de ambiente**: As chaves estavam configuradas no sistema sem o prefixo `VITE_`. O `.env` foi criado mapeando diretamente os valores com o prefixo correto.

---

## Histórico de versões

| Versão | Data       | Autor    | Alteração                                                           |
| ------ | ---------- | -------- | ------------------------------------------------------------------- |
| 1.0    | 2026-04-07 | AI Agent | Documento criado (AWAITING APPROVAL)                                |
| 1.1    | 2026-04-07 | AI Agent | Implementação concluída, Implementation Log preenchido, status DONE |
