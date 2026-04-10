# POC — Validação Prática de Features Simples nos Editores Free (Quarta Iteração)

## Status

> ✅ DONE — Todas as 4 fases concluídas. 3 features × 3 editores validados.

---

## 1. Problem Summary

Na terceira iteração validamos **formatação avançada** (indent, line-height, paragraph spacing), **preview PDF** (modal A4 + export via html2pdf.js) e **spellcheck do browser** nos 3 editores free (Tiptap, Lexical, Quill). Todas essas funcionalidades foram implementadas e estão operacionais.

A análise da **feature matrix** (`problem-rationalization-feature-matrix.md`) mapeou 7 features × 5 editores e concluiu que várias features avançadas (colaboração em tempo real, corretor ortográfico com sugestões, integração Office completa) são **complexas demais** para validação prática no escopo de uma POC.

No entanto, resta um conjunto de **3 features fundamentais ainda não implementadas** nos editores free que precisa ser validado para provar a viabilidade técnica:

| #   | Feature pendente         | Motivo de ser prioritária                                                                                                                     |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Merge Fields visuais** | Core do produto — templates de documentos dependem de campos dinâmicos como `{{nome}}`, `{{cpf}}` renderizados como badges atômicos no editor |
| 2   | **Page Break**           | Essencial para documentos oficiais multi-página — o usuário precisa controlar onde as páginas quebram                                         |
| 3   | **Inserção de imagens**  | Requisito básico de qualquer editor de documentos — upload, exibição e resize de imagens                                                      |

**Objetivo desta iteração**: Implementar essas 3 features nos 3 editores free (Tiptap, Lexical, Quill) e validar que é possível construir um editor de templates funcional com ferramentas open source.

### Estado atual da POC (features já validadas ✅)

| Feature                  | Tiptap | Lexical | Quill |
| ------------------------ | ------ | ------- | ----- |
| Formatação ABNT          | ✅     | ✅      | ✅    |
| Preview PDF (modal A4)   | ✅     | ✅      | ✅    |
| Export PDF (html2pdf.js) | ✅     | ✅      | ✅    |
| Spell check (browser)    | ✅     | ✅      | ✅    |
| **Merge Fields visuais** | ✅     | ✅      | ✅    |
| **Page Break**           | ✅     | ✅      | ✅    |
| **Inserção de imagens**  | ✅     | ✅      | ✅    |

---

## 2. Proposed Solution

### 2.1 Merge Fields — Badges Visuais Atômicos

Atualmente os merge fields são **placeholders texto puro** (`{{nome}}`) que o FieldsPanel substitui via regex. Isso funciona mas tem limitações:

- O usuário pode editar parcialmente um placeholder (ex: `{{nom` → quebra o campo)
- Não há diferenciação visual clara entre texto normal e campos dinâmicos
- Não é possível selecionar/deletar um campo como unidade

**Nova abordagem**: Criar um **componente visual (badge/chip)** para cada editor que renderiza o merge field como elemento inline atômico — não editável internamente, selecionável como bloco, com estilo visual distinto.

#### Tiptap — Custom Node Extension

- Criar extensão `MergeField` como `Node.create()` com `atom: true`, `inline: true`, `group: 'inline'`
- Atributos: `fieldId` (ex: `"nome"`) e `label` (ex: `"Nome Completo"`)
- `renderHTML`: gera `<span data-type="merge-field" data-field-id="nome" class="merge-field-badge">{{nome}}</span>`
- `parseHTML`: reconhece `span[data-type="merge-field"]`
- `addNodeView`: usa `ReactNodeViewRenderer` para renderizar um componente React como badge estilizado
- `addCommands`: comando `insertMergeField(fieldId, label)` que insere o node
- O componente React (`MergeFieldNodeView`) renderiza um `<NodeViewWrapper>` com badge estilizado mostrando o label do campo

#### Lexical — Custom DecoratorNode

- Criar `MergeFieldNode` estendendo `DecoratorNode`
- Propriedades: `__fieldId` e `__label`
- `isInline(): true` — renderiza inline no texto
- `decorate()`: retorna componente React `<MergeFieldBadge>` com estilo de badge
- `exportDOM()`: gera `<span data-type="merge-field" data-field-id="..." class="merge-field-badge">{{fieldId}}</span>`
- `importDOM()`: reconhece o mesmo HTML para re-hidratação
- `createDOM()`: cria `<span>` container
- Registrar o node no `initialConfig.nodes`
- Criar comando `INSERT_MERGE_FIELD_COMMAND` e listener no ToolbarPlugin

#### Quill — Custom Embed Blot

- Criar `MergeFieldBlot` estendendo `Inline` do Parchment (não `BlockEmbed`, pois é inline)
- `blotName: 'merge-field'`, `tagName: 'span'`
- `static create(value)`: cria `<span>` com `data-field-id`, `data-label`, `class="merge-field-badge"`, `contenteditable="false"`
- `static value(node)`: extrai `{ fieldId, label }` dos data attributes
- Registrar o Blot via `Quill.register()`
- Inserir via `editor.insertEmbed(index, 'merge-field', { fieldId, label })`
- Adicionar `merge-field` à lista de `QUILL_FORMATS`

#### Toolbar de Inserção (compartilhada)

Adicionar na toolbar de cada editor um **dropdown "Inserir Campo"** que lista os campos disponíveis de `MERGE_FIELDS` config. Ao selecionar um campo, o comando correspondente é executado para inserir o badge na posição do cursor.

#### Compatibilidade com FieldsPanel

O FieldsPanel continuará funcionando para **substituir os valores** — quando o usuário clica "Aplicar valores", o sistema:

1. Serializa o HTML do editor (`getHTML()`)
2. Busca os badges (`data-field-id`) no HTML
3. Substitui os badges pelos valores reais (texto puro)
4. Atualiza o editor com o novo HTML

O botão "Resetar" restaura o template original com os badges.

### 2.2 Page Break — Separador Visual de Página

O page break é um elemento de bloco que indica onde o documento deve quebrar para a próxima página na impressão/PDF. Visualmente aparece como uma linha horizontal estilizada com label "Quebra de Página".

#### Tiptap — Custom Node Extension

- Criar extensão `PageBreak` como `Node.create()` com `group: 'block'`, `atom: true`
- **Não é inline** — é um bloco que ocupa a largura total
- `parseHTML`: reconhece `<div data-type="page-break">` ou `<hr class="page-break">`
- `renderHTML`: gera `<div data-type="page-break" class="page-break" style="break-after: page"><hr></div>`
- `addNodeView`: usa `ReactNodeViewRenderer` para renderizar um componente React com estilo visual (linha tracejada + label "Quebra de Página")
- `addCommands`: comando `insertPageBreak()` que insere o node
- CSS: `break-after: page` para que o html2pdf.js respeite a quebra no export

#### Lexical — Custom DecoratorNode

- Criar `PageBreakNode` estendendo `DecoratorNode`
- `isInline(): false` — é um bloco
- `decorate()`: retorna componente React com visual de separador de página
- `exportDOM()`: gera `<div data-type="page-break" class="page-break" style="break-after: page"><hr></div>`
- `importDOM()`: reconhece `div[data-type="page-break"]`
- Criar comando `INSERT_PAGE_BREAK_COMMAND` e botão na toolbar

#### Quill — Custom Block Blot

- Criar `PageBreakBlot` estendendo `BlockEmbed` do Parchment
- `blotName: 'page-break'`, `tagName: 'div'`
- `static create()`: cria `<div class="page-break" contenteditable="false" style="break-after: page"><hr></div>`
- Registrar via `Quill.register()`
- Inserir via `editor.insertEmbed(index, 'page-break', true, 'user')`
- Adicionar `page-break` à lista de `QUILL_FORMATS`

#### Integração com Preview/Export PDF

O CSS `break-after: page` (ou `page-break-after: always`) garante que o `html2pdf.js` respeite as quebras de página ao gerar o PDF. O preview modal também deve renderizar as quebras como separadores visuais entre "páginas" no container A4.

### 2.3 Inserção de Imagens

Cada editor já possui algum nível de suporte a imagens. O objetivo é validar o fluxo completo: upload → exibição → **resize com manutenção de proporção (aspect ratio lock)** → inclusão no PDF.

> **Requisito**: O redimensionamento deve manter a proporção original da imagem (aspect ratio locked) para evitar stretching. O usuário arrasta um handle de canto para redimensionar e a proporção é preservada automaticamente.

#### Tiptap — Custom Image Extension com Resize

- A extensão `Image` do `@tiptap/extension-image` renderiza `<img>` mas **não possui resize interativo**
- **Solução**: Criar uma extensão customizada `ResizableImage` que estende o `Image` nativo com um `ReactNodeViewRenderer`
- O componente `TiptapResizableImageView` renderiza a imagem dentro de um container com **handle de resize no canto inferior-direito**
- O resize é feito via `mousedown` → `mousemove` → `mouseup` no handle, calculando o novo `width` proporcionalmente
- **Aspect ratio lock**: Ao redimensionar, calcula `newHeight = newWidth / aspectRatio` automaticamente
- Os atributos `width` e `height` são persistidos no node e serializados no HTML para manter o tamanho ao recarregar
- Upload converte a imagem para **base64 Data URL** (via `FileReader`) e insere com `editor.chain().focus().setImage({ src })`
- Validar que a imagem (com tamanho customizado) é incluída no export PDF via html2pdf.js

#### Lexical — ImageNode com Resize

- O Lexical **não possui extensão oficial de imagem** — o `ImageNode` existe apenas no playground
- Criar `ImageNode` como `DecoratorNode` que renderiza um `<img>` com resize handles
- O componente React `ImageComponent` gerencia o resize via drag handles (mouse events) **com aspect ratio lock**
- Registrar o node no `initialConfig.nodes`
- Criar comando `INSERT_IMAGE_COMMAND` + botão na toolbar com file input
- Upload via `FileReader` → base64 Data URL

#### Quill — Image embed com resize

- O Quill **já possui** image embed nativo e o botão `image` **já está na toolbar** (`quillFormattingConfig.ts`)
- O botão padrão do Quill abre um prompt de URL — precisamos mudar para **file upload**
- Sobrescrever o handler de imagem via `quill.getModule('toolbar').addHandler('image', ...)` para abrir file input
- Upload via `FileReader` → base64 → `editor.insertEmbed(index, 'image', dataUrl)`
- **Resize**: Implementar via wrapper Blot ou CSS `resize: both` com `aspect-ratio` preservado
- Resize: testar com `quill-image-resize-module` (comunidade) ou implementar resize básico via CSS

> **Nota sobre base64**: Para a POC, imagens serão convertidas para base64 Data URLs para simplificar. Em produção, seriam enviadas para um servidor/CDN e referenciadas por URL.

---

## 3. Estratégia de Desenvolvimento Incremental

Para facilitar a validação, o desenvolvimento será feito **1 editor por vez**, implementando as 3 features (Merge Fields, Page Break, Imagens) em cada editor antes de passar para o próximo. Componentes compartilhados (CSS, dropdown, utilitários) são criados junto com o **primeiro editor** (Tiptap) e reutilizados nos demais.

### Ordem de desenvolvimento

```
Fase 1 — Tiptap (primeiro, cria infraestrutura compartilhada)
  ├── Step 1:  ✅ CSS compartilhado (merge-field-badge, page-break, dropdown, image)
  ├── Step 2:  ✅ MergeFieldDropdown (componente compartilhado)
  ├── Step 3:  ✅ Merge Field extension + NodeView
  ├── Step 4:  ✅ Page Break extension + NodeView
  ├── Step 5:  ✅ Image upload + ResizableImage (resize com aspect ratio lock)
  ├── Step 6:  ✅ Atualizar FieldsPanel + templateConfig (compartilhado)
  └── 🔍 VALIDAÇÃO: Tiptap com 3 features funcionando

Fase 2 — Lexical
  ├── Step 7:  ✅ MergeFieldNode (DecoratorNode)
  ├── Step 8:  ✅ PageBreakNode (DecoratorNode)
  ├── Step 9:  ✅ ImageNode (DecoratorNode + resize com aspect ratio lock)
  └── 🔍 VALIDAÇÃO: Lexical com 3 features funcionando

Fase 3 — Quill
  ├── Step 10: ✅ MergeFieldBlot (Inline Embed)
  ├── Step 11: ✅ PageBreakBlot (Block Embed)
  ├── Step 12: ✅ Image upload handler (sobrescrever nativo com file picker)
  └── 🔍 VALIDAÇÃO: Quill com 3 features funcionando

Fase 4 — Finalização
  ├── Step 13: ✅ Preview PDF (page break visual)
  ├── Step 14: ✅ Validação cruzada e documentação
  └── 🔍 VALIDAÇÃO FINAL: 3 editores × 7 features ✅
```

> **Benefício**: Cada fase termina com um editor 100% funcional validável. Problemas são detectados cedo e a infraestrutura compartilhada é criada uma única vez.

---

## 4. Implementation Plan

### Fase 1 — Tiptap + Infraestrutura Compartilhada

#### Step 1 — CSS Compartilhado para Merge Fields, Page Break e Imagens

Atualizar `src/index.css` com estilos para:

- `.merge-field-badge` — badge inline com background colorido, border-radius, padding, font-weight, cursor default, `user-select: all`
- `.page-break` — bloco com linha tracejada horizontal, label "Quebra de Página" centralizado, margin vertical, `break-after: page`
- `.merge-field-dropdown` — dropdown de seleção de campo na toolbar
- Estilos de toolbar para os novos botões (inserir campo, inserir page break, inserir imagem)
- Estilos de resize handle para imagens no Lexical

#### Step 2 — Componente MergeFieldDropdown (compartilhado)

Criar `src/components/merge-fields/MergeFieldDropdown.tsx`:

- Props: `onSelect(fieldId: string, label: string)` — callback quando um campo é selecionado
- Renderiza botão "📎 Inserir Campo" que abre dropdown com campos de `MERGE_FIELDS` agrupados por grupo
- Reutilizável entre os 3 editores (cada um passa seu callback de inserção)

#### Step 3 — Merge Field: Tiptap Extension + NodeView

Criar 2 arquivos:

1. `src/extensions/tiptap/MergeFieldExtension.ts` — Node extension com `atom: true`, atributos `fieldId`/`label`, parseHTML/renderHTML, comando `insertMergeField`
2. `src/components/merge-fields/TiptapMergeFieldView.tsx` — Componente React para `ReactNodeViewRenderer`, renderiza badge com `<NodeViewWrapper>`

Atualizar `src/components/TiptapTemplate.tsx`:

- Importar e registrar extensão `MergeField` no `useEditor`
- Adicionar `MergeFieldDropdown` na toolbar que chama `editor.chain().focus().insertMergeField(fieldId, label).run()`

#### Step 4 — Page Break: Tiptap Extension

Criar 2 arquivos:

1. `src/extensions/tiptap/PageBreakExtension.ts` — Node extension com `group: 'block'`, `atom: true`, parseHTML/renderHTML, comando `insertPageBreak`
2. `src/components/page-break/TiptapPageBreakView.tsx` — Componente React para `ReactNodeViewRenderer`, renderiza visual de separador de página

Atualizar `src/components/TiptapTemplate.tsx`:

- Registrar extensão `PageBreak` no `useEditor`
- Adicionar botão "⬛ Quebra de Página" na toolbar

#### Step 5 — Imagens: Tiptap (ResizableImage com aspect ratio lock)

Criar `src/extensions/tiptap/ResizableImageExtension.ts`:

- Estende `@tiptap/extension-image` com `Image.extend()`
- Adiciona atributos `width` e `height` persistidos (parseHTML/renderHTML)
- Usa `ReactNodeViewRenderer(TiptapResizableImageView)` para renderizar

Criar `src/components/image/TiptapResizableImageView.tsx`:

- Container com `<img>` + handle de resize no canto inferior-direito
- Drag resize via `mousedown` → `mousemove` → `mouseup`
- **Aspect ratio lock**: `newHeight = newWidth / aspectRatio` automático
- Handle visível apenas no hover ou seleção (UX limpa)
- Persiste `width`/`height` no ProseMirror via `updateAttributes()`

Atualizar `src/components/TiptapTemplate.tsx`:

- Substituir `Image` por `ResizableImage`
- Manter `handleImageUpload()` + file input existentes
- Botão "🖼️ Imagem" na toolbar

#### Step 6 — Atualizar FieldsPanel + templateConfig (compartilhado)

Atualizar `src/components/FieldsPanel.tsx`:

- A lógica de "Aplicar valores" precisa ser atualizada para lidar com ambos os formatos:
  - Placeholders texto puro `{{campo}}` (legado)
  - Badges HTML `<span data-type="merge-field" data-field-id="campo">...</span>`
- Adicionar regex para encontrar badges e substituí-los por valores reais
- "Resetar" deve restaurar os badges no template original

Atualizar `src/config/templateConfig.ts`:

- Converter os `{{campo}}` do `DOCUMENT_TEMPLATE` para o formato de badge HTML: `<span data-type="merge-field" data-field-id="campo" class="merge-field-badge">{{campo}}</span>`
- Isso garante que ao carregar o template nos editores free, os badges são renderizados como nodes visuais

> 🔍 **Checkpoint de validação — Tiptap**: Merge fields (inserir/deletar/serializar), page break (inserir/PDF), imagem (upload/exibir/PDF), FieldsPanel (aplicar/resetar com badges).

---

### Fase 2 — Lexical

#### Step 7 — Merge Field: Lexical DecoratorNode

Criar 2 arquivos:

1. `src/extensions/lexical/MergeFieldNode.ts` — `DecoratorNode` com `__fieldId`, `__label`, `isInline(): true`, `exportDOM`, `importDOM`, `decorate` retornando React component
2. `src/components/merge-fields/LexicalMergeFieldBadge.tsx` — Componente React renderizado pelo `decorate()`

Atualizar `src/extensions/lexical/index.ts` — Barrel export do `MergeFieldNode`

Atualizar `src/components/LexicalTemplate.tsx`:

- Registrar `MergeFieldNode` no `initialConfig.nodes`
- Criar `INSERT_MERGE_FIELD_COMMAND` e listener no `ToolbarPlugin`
- Reutilizar `MergeFieldDropdown` na toolbar

#### Step 8 — Page Break: Lexical DecoratorNode

Criar 2 arquivos:

1. `src/extensions/lexical/PageBreakNode.ts` — `DecoratorNode` com `isInline(): false`, `exportDOM` com `break-after: page`, `decorate` retornando React component
2. `src/components/page-break/LexicalPageBreakView.tsx` — Componente React renderizado pelo `decorate()`

Atualizar `src/extensions/lexical/index.ts` — Barrel export do `PageBreakNode`

Atualizar `src/components/LexicalTemplate.tsx`:

- Registrar `PageBreakNode` no `initialConfig.nodes`
- Criar `INSERT_PAGE_BREAK_COMMAND` e botão na toolbar

#### Step 9 — Imagens: Lexical (DecoratorNode simplificado)

Criar 2 arquivos:

1. `src/extensions/lexical/ImageNode.ts` — `DecoratorNode` que renderiza `<img>` com `src`, `altText`, `width`, `height`. `exportDOM()` gera `<img>` tag. `importDOM()` reconhece `<img>`.
2. `src/components/images/LexicalImageComponent.tsx` — Componente React com `<img>` e resize handles simples (drag corners)

Atualizar `src/extensions/lexical/index.ts` — Barrel export do `ImageNode`

Atualizar `src/components/LexicalTemplate.tsx`:

- Registrar `ImageNode` no `initialConfig.nodes`
- Criar `INSERT_IMAGE_COMMAND` e botão na toolbar com file input

> 🔍 **Checkpoint de validação — Lexical**: Mesmos critérios do Tiptap. Reutiliza MergeFieldDropdown e CSS.

---

### Fase 3 — Quill

#### Step 10 — Merge Field: Quill Embed Blot

Criar 1 arquivo:

1. `src/extensions/quill/MergeFieldBlot.ts` — Inline Blot estendendo `Inline` (ou `Embed`), com `create`, `value`, `formats`, registrado no Parchment

Atualizar `src/extensions/quill/registerFormattingAttributors.ts` — Registrar também o `MergeFieldBlot`
Atualizar `src/extensions/quill/quillFormattingConfig.ts` — Adicionar `'merge-field'` aos `QUILL_FORMATS`
Atualizar `src/extensions/quill/index.ts` — Exportar o novo Blot

Atualizar `src/components/QuillTemplate.tsx`:

- Reutilizar `MergeFieldDropdown` acima do editor
- Handler que chama `editor.insertEmbed(index, 'merge-field', { fieldId, label })`

#### Step 11 — Page Break: Quill Block Blot

Criar 1 arquivo:

1. `src/extensions/quill/PageBreakBlot.ts` — `BlockEmbed` com `create()` gerando `<div>` estilizado, `contenteditable="false"`, `break-after: page`

Atualizar `src/extensions/quill/registerFormattingAttributors.ts` — Registrar `PageBreakBlot`
Atualizar `src/extensions/quill/quillFormattingConfig.ts` — Adicionar `'page-break'` aos `QUILL_FORMATS`

Atualizar `src/components/QuillTemplate.tsx`:

- Adicionar botão "Quebra de Página" na UI
- Handler que chama `editor.insertEmbed(index, 'page-break', true, 'user')`

#### Step 12 — Imagens: Quill (sobrescrever handler)

Atualizar `src/components/QuillTemplate.tsx`:

- Sobrescrever o handler de imagem nativo do Quill para usar file upload em vez de prompt URL:
  ```
  const toolbar = quill.getModule('toolbar');
  toolbar.addHandler('image', () => { /* file input logic */ });
  ```
- Upload via `FileReader` → base64 → `editor.insertEmbed(index, 'image', dataUrl)`
- Testar resize — se `quill-image-resize-module` for compatível com v2, instalar e registrar; caso contrário, documentar como limitação

> 🔍 **Checkpoint de validação — Quill**: Mesmos critérios. Reutiliza MergeFieldDropdown e CSS.

---

### Fase 4 — Finalização

#### Step 13 — Atualizar Preview PDF para respeitar Page Breaks

Atualizar `src/components/PdfPreview.tsx`:

- Garantir que o CSS do preview modal respeita `.page-break { break-after: page }` visualmente
- Opcionalmente: renderizar os page breaks como separadores visuais entre "páginas" distintas no preview (cada "página" como um bloco A4 separado)

#### Step 14 — Validação cruzada e documentação

- Testar todos os fluxos em cada editor
- Atualizar a **Matriz de Validação POC** no `problem-rationalization-feature-matrix.md` com status ✅ para as features implementadas
- Documentar limitações encontradas, dificuldades e observações por editor
- Atualizar `README.md` com as novas funcionalidades

---

## 5. Estrutura de Arquivos — Novos e Modificados

### Novos arquivos

```
src/extensions/tiptap/
├── MergeFieldExtension.ts       # Node extension (atom, inline)
├── PageBreakExtension.ts        # Node extension (atom, block)
└── ResizableImageExtension.ts   # Estende Image com resize + width/height attrs

src/extensions/lexical/
├── MergeFieldNode.ts            # DecoratorNode (inline)
├── PageBreakNode.ts             # DecoratorNode (block)
└── ImageNode.ts                 # DecoratorNode (block)

src/extensions/quill/
├── MergeFieldBlot.ts            # Inline Embed Blot
├── PageBreakBlot.ts             # Block Embed Blot
└── ResizableImageBlot.ts        # Sobrescreve image blot nativo com resize handles

src/components/merge-fields/
├── MergeFieldDropdown.tsx        # Dropdown compartilhado de seleção de campo
├── TiptapMergeFieldView.tsx      # NodeView React para Tiptap
└── LexicalMergeFieldBadge.tsx    # Badge React para Lexical

src/components/page-break/
├── TiptapPageBreakView.tsx       # NodeView React para Tiptap
└── LexicalPageBreakView.tsx      # Component React para Lexical

src/components/image/
├── TiptapResizableImageView.tsx  # NodeView React com drag resize + aspect ratio lock
└── LexicalImageComponent.tsx     # Componente React com resize handles
```

### Arquivos modificados

```
src/components/TiptapTemplate.tsx      # + MergeField, PageBreak, ResizableImage extensions + dropdown
src/components/LexicalTemplate.tsx     # + MergeFieldNode, PageBreakNode, ImageNode + commands + toolbar
src/components/QuillTemplate.tsx       # + MergeFieldBlot, PageBreakBlot + image upload handler + toolbar
src/components/FieldsPanel.tsx         # + lógica de badge HTML para aplicar/resetar valores (useBadges prop)
src/components/PdfPreview.tsx          # + CSS para page break visual
src/config/templateConfig.ts           # + DOCUMENT_TEMPLATE_WITH_BADGES export
src/extensions/lexical/index.ts        # + exports dos novos nodes
src/extensions/quill/index.ts          # + exports dos novos blots
src/extensions/quill/registerFormattingAttributors.ts  # + registro dos novos blots
src/extensions/quill/quillFormattingConfig.ts          # + novos formats
src/index.css                          # + estilos merge-field-badge, page-break, image resize handles, dropdown
```

---

## 6. Architectural Decision Records (ADR)

| #   | Decisão                                                               | Justificativa                                                                                                                                                                                   |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Merge Fields como nodes atômicos (não texto puro)**                 | Evita edição parcial dos placeholders, garante integridade do campo, melhor UX com visual de badge. A serialização HTML mantém compatibilidade com o FieldsPanel existente.                     |
| 2   | **Tiptap: `ReactNodeViewRenderer` para merge fields e page break**    | Permite renderizar componentes React dentro do editor ProseMirror. É a abordagem oficial e mais flexível para custom UI.                                                                        |
| 3   | **Lexical: `DecoratorNode` para todos os custom nodes**               | É o tipo de node do Lexical projetado para renderizar React components. `ElementNode` é para containers de texto; `DecoratorNode` é para conteúdo não-editável/custom.                          |
| 4   | **Quill: Inline Embed para merge fields, BlockEmbed para page break** | Merge fields são inline (dentro do texto), page break é um bloco que ocupa a largura total. O Parchment distingue claramente esses dois tipos de blot.                                          |
| 5   | **Imagens via base64 Data URL**                                       | Simplifica a POC eliminando a necessidade de um servidor de upload. O html2pdf.js renderiza base64 corretamente. Em produção, seria substituído por upload para CDN.                            |
| 6   | **Dropdown de merge fields como componente React externo**            | A toolbar nativa do Quill não suporta dropdowns customizados facilmente. Um componente React compartilhado garante UX consistente entre os 3 editores.                                          |
| 7   | **`break-after: page` para page breaks no PDF**                       | É a propriedade CSS padrão que o html2pdf.js (via html2canvas + jsPDF) respeita para paginação. `page-break-after: always` é o legado equivalente.                                              |
| 8   | **Template com badges HTML (não texto puro)**                         | Ao carregar o template, os editores com parseHTML reconhecem os badges e convertem para seus custom nodes. Editores que não reconhecem simplesmente mostram o `<span>` com o texto `{{campo}}`. |
| 9   | **MergeFieldDropdown compartilhado entre editores**                   | Mesmo padrão do `SpacingControls` — componente agnóstico ao editor que recebe um callback de inserção. Reutilizável e testável.                                                                 |
| 10  | **Lexical ImageNode simplificado (não playground completo)**          | O ImageNode do playground Lexical é complexo (~300 LOC) com inline images, captions, collab. Para a POC, um DecoratorNode simples com `<img>` + resize CSS é suficiente.                        |

---

## 7. Riscos e Mitigações

| Risco                                                                          | Impacto                                       | Mitigação                                                                                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Quill v2 incompatível com `quill-image-resize-module`                          | Imagens sem resize no Quill                   | Implementar resize via CSS `resize: both` ou drag handles customizados                                                                       |
| `ReactNodeViewRenderer` do Tiptap pode ter limitações com `atom: true`         | Merge field não seleciona/deleta corretamente | Testar com `draggable: true` + `selectable: true`, fallback para `renderHTML` puro sem React                                                 |
| `break-after: page` pode não ser respeitado pelo html2pdf.js em todos os casos | Page break não funciona no PDF                | Testar com `pagebreak` option do html2pdf.js (`mode: ['avoid-all', 'css', 'legacy']`), adicionar fallback com `html2canvas` pagebreak config |
| Base64 de imagens grandes pode impactar performance do editor e PDF            | Editor lento com muitas imagens               | Limitar tamanho do upload (ex: max 5MB), comprimir via canvas antes de converter para base64                                                 |
| `importDOM` do Lexical pode não reconhecer badges do template HTML             | Merge fields não aparecem como nodes visuais  | Testar importação com `$generateNodesFromDOM`, adicionar fallback regex para converter badges                                                |

---

## 8. Validation Checklist

### Merge Fields

- [x] **Tiptap**: Badge visual aparece ao inserir campo via dropdown
- [x] **Tiptap**: Badge é atômico — não pode ser editado parcialmente, apenas selecionado/deletado
- [x] **Tiptap**: Badge persiste ao serializar (getHTML) e deserializar (setContent)
- [x] **Lexical**: Badge visual aparece ao inserir campo via dropdown
- [x] **Lexical**: Badge é atômico e inline no texto
- [x] **Lexical**: Badge persiste ao serializar e importar HTML
- [x] **Quill**: Badge visual aparece ao inserir campo via dropdown
- [x] **Quill**: Badge é atômico e inline no texto
- [x] **Quill**: Badge persiste no Delta e no HTML exportado
- [x] **FieldsPanel**: "Aplicar valores" substitui badges por valores reais nos 3 editores
- [x] **FieldsPanel**: "Resetar" restaura os badges originais nos 3 editores

### Page Break

- [x] **Tiptap**: Separador visual aparece ao inserir via botão na toolbar
- [x] **Tiptap**: Separador persiste ao serializar/deserializar
- [x] **Lexical**: Separador visual aparece ao inserir via botão
- [x] **Lexical**: Separador persiste ao serializar/deserializar
- [x] **Quill**: Separador visual aparece ao inserir via botão
- [x] **Quill**: Separador persiste no Delta e HTML
- [x] **Export PDF**: Page break é respeitado pelo html2pdf.js — conteúdo após o break inicia em nova página
- [x] **Preview**: Page break é visualmente representado no modal de preview

### Imagens

- [x] **Tiptap**: Upload de imagem local funciona via botão na toolbar
- [x] **Tiptap**: Imagem é exibida no editor e pode ser redimensionada via handle de canto
- [x] **Tiptap**: Resize mantém aspect ratio (sem stretching)
- [x] **Tiptap**: Tamanho customizado persiste ao serializar/deserializar
- [x] **Lexical**: Upload de imagem local funciona via botão na toolbar
- [x] **Lexical**: Imagem é exibida no editor e pode ser redimensionada
- [x] **Lexical**: Resize mantém aspect ratio (sem stretching)
- [x] **Quill**: Upload de imagem local funciona (substitui prompt de URL)
- [x] **Quill**: Imagem é exibida no editor e pode ser redimensionada
- [x] **Export PDF**: Imagens (com tamanho customizado) são incluídas no PDF gerado em todos os 3 editores

### Geral

- [x] O setup continua simples: `npm install` → `npm run dev`
- [x] Nenhuma nova dependência GPL/copyleft foi adicionada
- [x] Todos os 3 editores free demonstram as 7 features "simples" da POC

---

## Histórico de versões

| Versão | Data       | Autor    | Alteração                                                                                                                                                                           |
| ------ | ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0    | 2026-04-09 | AI Agent | Documento criado com plano de 14 steps em 4 fases (AWAITING APPROVAL)                                                                                                               |
| 1.1    | 2026-04-09 | AI Agent | Fase 1 concluída — Tiptap: MergeField, PageBreak, ResizableImage extensions + CSS compartilhado + MergeFieldDropdown + FieldsPanel badge-aware + templateConfig                     |
| 1.2    | 2026-04-09 | AI Agent | Fase 2 concluída — Lexical: MergeFieldNode, PageBreakNode, ImageNode (DecoratorNodes) + CustomNodesPlugin + toolbar                                                                 |
| 1.3    | 2026-04-09 | AI Agent | Fase 3 concluída — Quill: MergeFieldBlot, PageBreakBlot, image upload handler override + custom toolbar                                                                             |
| 1.4    | 2026-04-09 | AI Agent | Bug fix: FieldsPanel `replaceMergeFields` — regex substituída por DOMParser para compatibilidade com inner HTML do Quill Embed (zero-width spaces + nested spans)                   |
| 1.5    | 2026-04-09 | AI Agent | Bug fix: ResizableImageBlot criado para Quill — sobrescreve blot `image` nativo com container `.editor-image-container` + drag handle de resize com aspect ratio lock               |
| 1.6    | 2026-04-09 | AI Agent | Bug fix: Preview CSS — `.pdf-preview-page .page-break` desativa `break-after` em tela, mantém visual de separador                                                                   |
| 1.7    | 2026-04-09 | AI Agent | Bug fix: PDF export — page break invisível no PDF final via swap in-place (`.page-break` → marker `.html2pdf-page-break-after` invisível) + config `pagebreak.after` no html2pdf.js |
| 1.8    | 2026-04-09 | AI Agent | Bug fix: PDF em branco — removida abordagem de clone off-screen (html2canvas precisa de elemento visível); swap in-place com restore no `finally`                                   |
| 1.9    | 2026-04-09 | AI Agent | Bug fix: Container PDF visível na sidebar após export — `handleExportPdf` agora preserva `position: absolute; left: -9999px` no `cssText` e limpa `innerHTML` após export           |
| 2.0    | 2026-04-09 | AI Agent | Fase 4 concluída — Validation checklist 100% ✅, status atualizado para DONE, `ResizableImageBlot.ts` adicionado à estrutura de arquivos                                            |
