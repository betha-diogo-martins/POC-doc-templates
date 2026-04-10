# POC — Document Templates (Rich Text Editors)

Repositório de POC para validar o uso de rich text editors na criação de templates de documentos com cabeçalho, corpo com campos dinâmicos e rodapé.

## Objetivos

- Criar templates com header, body (campos editáveis/dinâmicos) e footer
- Preencher campos via placeholder (`{{campo}}`) ou digitação direta
- Exportar o documento como PDF
- Comparar a experiência entre editores **premium (GPL 2+)** e **free (MIT/BSD)**

## Iterações

### 1ª Iteração — Premium (Trial)

- **CKEditor 5** (GPL 2+) com Merge Fields + Export to PDF premium
- **TinyMCE** (GPL 2+) com Merge Tags + Export to PDF premium
- ⚠️ Ambos licenciados sob **GPL 2+** — incompatível com produtos proprietários sem licença comercial

### 2ª Iteração — MIT/BSD (Free)

- **Tiptap** (MIT, ProseMirror) — headless, 100+ extensions, toolbar customizada
- **Lexical** (MIT, Meta) — plugin-based, arquitetura moderna, custom toolbar
- **Quill** (BSD 3-Clause) — popular, toolbar nativa, simples de configurar
- Campos dinâmicos via placeholders `{{campo}}` + regex replace + painel lateral
- Export PDF via **html2pdf.js** (MIT, client-side) e **react-to-print** (MIT, browser print)

### 3ª Iteração — Extensibilidade (Formatação, Preview, Spellcheck)

Validação prática de extensibilidade nos 3 editores free, implementando:

- **Formatação avançada** — indentação (indent/outdent), line-height (1.0, 1.15, 1.5, 2.0), espaçamento entre parágrafos (margin-top/bottom)
- **Preview PDF** — modal A4 (210mm × 297mm) com campos aplicados, exportação direta do preview
- **Corretor ortográfico** — `spellcheck="true"` + `lang="pt-BR"` (nativo do browser)

#### Abordagem por editor

| Feature          | Tiptap                                  | Lexical                             | Quill                             |
| ---------------- | --------------------------------------- | ----------------------------------- | --------------------------------- |
| Indentação       | Custom extension (`IndentExtension`)    | Nativo (`INDENT_CONTENT_COMMAND`)   | Nativo (`indent` format)          |
| Line-height      | Custom extension (`LineHeightExtension`)| DOM style via `applyBlockStyle()`   | Parchment `StyleAttributor`       |
| Spacing          | Custom extension (`ParagraphSpacing`)   | DOM style via `applyBlockStyle()`   | Parchment `StyleAttributor`       |
| Preview PDF      | Compartilhado (`PdfPreview.tsx`)        | Compartilhado (`PdfPreview.tsx`)    | Compartilhado (`PdfPreview.tsx`)  |
| Spellcheck       | `editorProps.attributes`                | `ContentEditable` props             | Container `lang` attribute        |

## Stack

- **Vite** + **React** + **TypeScript**
- **CKEditor 5** (premium trial — Merge Fields + Export to PDF)
- **TinyMCE** (premium trial — Merge Tags + Export to PDF)
- **Tiptap** (MIT — ProseMirror-based, StarterKit + extensions)
- **Lexical** (MIT — Meta, plugins React)
- **Quill** (BSD 3-Clause — react-quill-new wrapper)
- **html2pdf.js** (MIT — HTML → Canvas → PDF client-side)
- **react-to-print** (MIT — window.print() browser native)
- **React Router DOM** para navegação entre páginas

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/betha-diogo-martins/POC-doc-templates.git
cd POC-doc-templates
npm install
```

### 2. Configurar variáveis de ambiente (opcional — apenas para editores premium)

Crie um arquivo `.env` na raiz com suas chaves (necessário apenas para CKEditor/TinyMCE premium):

```env
VITE_CK_EDITOR_LICENSE_KEY=sua_license_key_do_ckeditor
VITE_TINY_CLOUD_API_KEY=sua_api_key_do_tinymce
```

> **As páginas Tiptap, Lexical e Quill funcionam sem nenhuma variável de ambiente.**

### 3. Rodar

```bash
npm run dev
```

Acesse `http://localhost:5173` — o redirect padrão é para `/tiptap`.

## Rotas disponíveis

| Rota        | Editor                  | Licença        | Tipo       |
| ----------- | ----------------------- | -------------- | ---------- |
| `/tiptap`   | Tiptap (ProseMirror)    | MIT            | Free ✅    |
| `/lexical`  | Lexical (Meta)          | MIT            | Free ✅    |
| `/quill`    | Quill (react-quill-new) | BSD 3-Clause   | Free ✅    |
| `/ckeditor` | CKEditor 5              | GPL 2+ (trial) | Premium ⚠️ |
| `/tinymce`  | TinyMCE                 | GPL 2+ (trial) | Premium ⚠️ |

## Estrutura do Projeto

```
src/
├── main.tsx                        # Entrypoint com Router
├── App.tsx                         # Layout com navegação (2 seções)
├── pages/
│   ├── TiptapPage.tsx              # Página Tiptap (MIT)
│   ├── LexicalPage.tsx             # Página Lexical (MIT)
│   ├── QuillPage.tsx               # Página Quill (BSD)
│   ├── CKEditorPage.tsx            # Página CKEditor (premium)
│   └── TinyMCEPage.tsx             # Página TinyMCE (premium)
├── components/
│   ├── TiptapTemplate.tsx          # Editor Tiptap + toolbar custom + formatting
│   ├── LexicalTemplate.tsx         # Editor Lexical + toolbar custom + formatting
│   ├── QuillTemplate.tsx           # Editor Quill + toolbar nativa + formatting
│   ├── FieldsPanel.tsx             # Painel de campos dinâmicos + preview (compartilhado)
│   ├── PdfPreview.tsx              # Modal de preview A4 do documento (compartilhado)
│   ├── SpacingControls.tsx         # Controles de line-height e spacing com presets + input livre (compartilhado)
│   ├── CKEditorTemplate.tsx        # Editor CKEditor (premium)
│   └── TinyMCETemplate.tsx         # Editor TinyMCE (premium)
├── extensions/
│   ├── tiptap/
│   │   ├── IndentExtension.ts      # Indentação por níveis (0-5, 2em/nível)
│   │   ├── LineHeightExtension.ts  # Line-height (1, 1.15, 1.5, 2)
│   │   └── ParagraphSpacingExtension.ts # Margin-top/bottom entre parágrafos
│   ├── lexical/
│   │   ├── index.ts                # Barrel export
│   │   └── applyBlockStyle.ts      # CSS inline em blocos selecionados
│   └── quill/
│       ├── index.ts                # Barrel export
│       ├── registerFormattingAttributors.ts # Parchment StyleAttributors
│       └── quillFormattingConfig.ts # QUILL_MODULES e QUILL_FORMATS
├── utils/
│   ├── customMergeFields.ts        # Placeholders regex, useFieldValues hook
│   └── pdfExport.ts                # Wrapper html2pdf.js
├── types/
│   └── html2pdf.d.ts               # Type declarations para html2pdf.js
├── config/
│   ├── mergeFieldsConfig.ts        # Campos dinâmicos compartilhados
│   └── templateConfig.ts           # Template HTML inicial
└── index.css                       # Estilos globais
```

## Campos Dinâmicos Disponíveis

| Campo                  | Label               | Exemplo                |
| ---------------------- | ------------------- | ---------------------- |
| `{{nome}}`             | Nome Completo       | João da Silva          |
| `{{cargo}}`            | Cargo               | Analista de Sistemas   |
| `{{departamento}}`     | Departamento        | Tecnologia             |
| `{{email}}`            | E-mail              | joao.silva@empresa.com |
| `{{data}}`             | Data do Documento   | 07/04/2026             |
| `{{numero_documento}}` | Número do Documento | DOC-2026-001           |
| `{{empresa}}`          | Nome da Empresa     | Betha Sistemas         |
| `{{cnpj}}`             | CNPJ                | 00.000.000/0001-00     |

## Documentação

- [`docs/problem-rationalization.md`](docs/problem-rationalization.md) — Problema (1ª iteração)
- [`docs/solution-planning-first-iteration.md`](docs/solution-planning-first-iteration.md) — Plano (1ª iteração)
- [`docs/problem-rationalization-free-tier.md`](docs/problem-rationalization-free-tier.md) — Problema (2ª iteração — licenciamento + alternativas free)
- [`docs/solution-planning-free-tier.md`](docs/solution-planning-free-tier.md) — Plano (2ª iteração — editores MIT/BSD)
- [`docs/problem-rationalization-extensibility.md`](docs/problem-rationalization-extensibility.md) — Problema (3ª iteração — extensibilidade)
- [`docs/solution-planning-extensibility.md`](docs/solution-planning-extensibility.md) — Plano (3ª iteração — formatação, preview, spellcheck)

## Licenciamento

### Editores MIT/BSD (2ª iteração — sem restrição copyleft)

- **Tiptap**: MIT — sem restrição, uso livre em produtos proprietários
- **Lexical**: MIT (Meta) — sem restrição, uso livre em produtos proprietários
- **Quill**: BSD 3-Clause — sem restrição, uso livre em produtos proprietários
- **html2pdf.js**: MIT — client-side, PDF como imagem rasterizada
- **react-to-print**: MIT — usa window.print() nativo

### Editores GPL 2+ (1ª iteração — ⚠️ copyleft)

- **CKEditor 5**: GPL 2+ open-source, plugins premium requerem licença comercial
- **TinyMCE**: GPL 2+ open-source, plugins premium requerem licença comercial
- ⚠️ **GPL 2+ obriga a abrir o código-fonte** se o software for distribuído — incompatível com produtos proprietários
