# POC — Formatação Avançada, Preview PDF e Corretor Ortográfico (Terceira Iteração)

## Status

> ✅ DONE — Implementado em 2026-04-09

---

## 1. Problem Summary

Na segunda iteração, validamos Tiptap, Lexical e Quill com campos dinâmicos e export to PDF usando licenças permissivas. A análise de extensibilidade (problem-rationalization) identificou que Tiptap possui a melhor DX para extensões, Lexical é robusto mas mais verboso, e Quill é limitado para componentes interativos.

Agora precisamos validar **3 funcionalidades essenciais para templates profissionais** nos 3 editores:

1. **Formatação avançada** — indentação de parágrafo, espaçamento entre parágrafos e line-height
2. **Preview do formato final** — visualização paginada (A4) antes de exportar o PDF
3. **Corretor ortográfico** — verificação ortográfica funcional no editor

**Objetivo desta iteração**: Implementar essas funcionalidades nos 3 editores e documentar trade-offs de cada abordagem.

---

## 2. Proposed Solution

### 2.1 Formatação Avançada (Parágrafos, Indentação e Espaçamento)

Cada editor trata formatação de parágrafo de forma diferente. A abordagem será adicionar controles na toolbar para:

- **Indentação** — indent/outdent de bloco (margin-left por nível)
- **Espaçamento entre linhas (line-height)** — simples (1.0), 1.15, 1.5, duplo (2.0)
- **Espaçamento entre parágrafos (spacing)** — antes/depois do parágrafo (margin-top/margin-bottom)

#### Tiptap

- **Indentação**: Não nativo. Criar uma **custom extension `Indent`** que adiciona atributo `data-indent` (nível 0-5) nos nodes de bloco, aplicando `margin-left` incremental via CSS ou inline style. Abordagem com `addGlobalAttributes` para injetar nos tipos `paragraph`, `heading`, `bulletList`, `orderedList`.
- **Line-height**: Não nativo. Criar uma **custom extension `LineHeight`** semelhante à `TextAlign` — adiciona atributo `lineHeight` nos nodes de bloco, renderiza como `style="line-height: X"`.
- **Spacing**: Não nativo. Criar uma **custom extension `ParagraphSpacing`** que adiciona atributos `spacingBefore` e `spacingAfter`, renderizando como `margin-top` e `margin-bottom`.

> Todas as 3 extensões seguem o mesmo padrão do `TextAlign` (globalAttributes + commands + keyboard shortcuts). ~30-50 LOC cada.

#### Lexical

- **Indentação**: **Nativo** — Lexical já suporta `indent`/`outdent` via `INDENT_CONTENT_COMMAND` e `OUTDENT_CONTENT_COMMAND`. Basta adicionar botões na toolbar que disparem esses comandos.
- **Line-height**: Não nativo. Aplicar via **CSS classes no theme** ou via manipulação de `style` no DOM do node. Abordagem: criar um dropdown na toolbar que aplica uma classe CSS ao parágrafo selecionado (ex: `line-height-1`, `line-height-1-5`, `line-height-2`), ou usar `element.style.lineHeight` via `editor.update()`.
- **Spacing**: Não nativo. Semelhante ao line-height — aplicar classes CSS ou inline styles aos nodes de bloco.

#### Quill

- **Indentação**: **Nativo** — Quill suporta `indent` como formato built-in. Basta adicionar `{ indent: '-1' }` e `{ indent: '+1' }` na toolbar.
- **Line-height**: Não nativo. Registrar um **custom Attributor** via Parchment para `line-height`, que aplica o style inline. Depois adicionar ao toolbar como dropdown. ~15-20 LOC.
- **Spacing**: Não nativo. Mesmo approach do line-height — registrar Attributors de Parchment para `margin-top` e `margin-bottom`.

### 2.2 Preview do Formato Final (Preview do PDF)

A abordagem será criar um **componente `PdfPreview` compartilhado** entre os 3 editores que:

1. Captura o HTML do editor (já temos `getEditorHtml()`)
2. Aplica os valores dos campos dinâmicos (se preenchidos)
3. Renderiza o conteúdo num **container com dimensões de página A4** (210mm × 297mm) com margens, simulando a paginação
4. Exibe num **modal overlay** com botão de fechar e opção de exportar diretamente

#### Abordagem técnica

- **Container A4**: `div` com `width: 210mm`, `min-height: 297mm`, `padding` simulando margens de impressão, `background: white`, `box-shadow` para efeito de página.
- **Paginação visual**: Usar CSS `break-after: auto` e um wrapper que simula múltiplas páginas com overflow. Para um preview fiel, aplicaremos os mesmos estilos que o `html2pdf.js` usa (font-family, line-height, padding, max-width).
- **Modal**: Componente React com overlay escuro, conteúdo scrollável, botão de fechar (ESC ou clique fora), e botão "Exportar PDF" integrado.
- **Fidelidade**: Reutilizar exatamente os mesmos estilos CSS do container de export PDF (`pdfExport.ts`) para garantir que o preview seja fiel ao resultado.

#### Integração com FieldsPanel

Adicionar um botão **"👁️ Preview PDF"** no `FieldsPanel`, entre os botões de exportar. O botão abre o modal de preview com o conteúdo atual do editor + valores de campos aplicados.

### 2.3 Corretor Ortográfico

#### Spellcheck nativo do browser

Todos os 3 editores usam `contenteditable`, portanto o **spellcheck nativo do browser já deve funcionar** com `spellcheck="true"` (que é o padrão em `contenteditable`). Precisamos validar:

- Se cada editor **não desabilita** o `spellcheck` por padrão
- Se o sublinhado vermelho aparece corretamente em palavras erradas
- Se o menu de contexto (clique direito) oferece sugestões de correção
- Se a correção funciona em **português** (depende do idioma do browser/SO)

#### Configuração

- **Tiptap**: O ProseMirror subjacente respeita `spellcheck` do `contenteditable`. Basta garantir que o atributo `spellcheck="true"` esteja no `EditorContent`. Pode ser configurado via `editorProps` no `useEditor`.
- **Lexical**: O `ContentEditable` do `@lexical/react` aceita atributos HTML. Garantir `spellCheck={true}` como prop.
- **Quill**: O container do Quill é `contenteditable` por padrão. O `spellcheck` depende do atributo no elemento root do editor.

#### Configuração de idioma

Adicionar `lang="pt-BR"` no container do editor (ou no `<html>`) para que o browser priorize o dicionário de português. Isso é uma configuração HTML padrão, não específica dos editores.

#### Extensões avançadas (documentação)

Documentar a possibilidade de integração futura com:

- **LanguageTool** (LGPL 2.1, open-source) — API REST para correção gramatical avançada, suporte a múltiplos idiomas
- **Tiptap Pro** tem um plugin `@tiptap-pro/extension-ai` mas é pago
- **Lexical** não possui plugin de spellcheck dedicado
- **Quill** não possui plugin de spellcheck dedicado

Para esta iteração, o foco é **validar que o spellcheck nativo funciona** e documentar o caminho para correção avançada.

---

## 3. Implementation Plan

### Step 1 — Custom Extension de Indentação (Tiptap)

Criar `src/extensions/tiptap/IndentExtension.ts`:

- Extension que adiciona `globalAttributes` com atributo `indent` (nível 0-5) nos tipos `paragraph`, `heading`, `listItem`
- Renderiza como `style="margin-left: {level * 2}em"`
- Comandos `indent()` e `outdent()` que incrementam/decrementam o nível
- Parse HTML: lê `data-indent` ou `style.marginLeft` para restaurar
- Keyboard shortcuts: `Tab` para indent, `Shift+Tab` para outdent

### Step 2 — Custom Extension de Line-Height (Tiptap)

Criar `src/extensions/tiptap/LineHeightExtension.ts`:

- Extension semelhante ao `TextAlign` — `globalAttributes` com atributo `lineHeight` nos tipos `paragraph`, `heading`
- Valores: `'1'`, `'1.15'`, `'1.5'`, `'2'`
- Renderiza como `style="line-height: X"`
- Comando `setLineHeight(value)` e `unsetLineHeight()`
- Parse HTML: lê `style.lineHeight` para restaurar

### Step 3 — Custom Extension de Paragraph Spacing (Tiptap)

Criar `src/extensions/tiptap/ParagraphSpacingExtension.ts`:

- Extension com `globalAttributes`: `spacingBefore` e `spacingAfter` nos tipos `paragraph`, `heading`
- Valores predefinidos: `0`, `0.5em`, `1em`, `1.5em`, `2em`
- Renderiza como `style="margin-top: X; margin-bottom: Y"`
- Comandos `setSpacingBefore(value)`, `setSpacingAfter(value)`

### Step 4 — Formatação Avançada na Toolbar do Tiptap

Atualizar `src/components/TiptapTemplate.tsx`:

- Registrar as 3 novas extensions no `useEditor`
- Adicionar seção "Formatação" na toolbar com:
  - Botões de indent/outdent (→ ←)
  - Dropdown de line-height (1.0 | 1.15 | 1.5 | 2.0)
  - Dropdown de spacing (Nenhum | Pequeno | Médio | Grande)

### Step 5 — Formatação Avançada no Lexical

Atualizar `src/components/LexicalTemplate.tsx`:

- **Indentação**: Adicionar botões de indent/outdent na toolbar que disparam `INDENT_CONTENT_COMMAND` / `OUTDENT_CONTENT_COMMAND` (já nativos)
- **Line-height**: Criar plugin `LineHeightPlugin` que:
  - Registra um comando `SET_LINE_HEIGHT_COMMAND`
  - No handler, percorre os nodes selecionados e aplica `element.style.lineHeight` via `editor.update()`
  - Adicionar dropdown na toolbar
- **Spacing**: Criar plugin `ParagraphSpacingPlugin` semelhante ao line-height, aplicando `margin-top`/`margin-bottom`

### Step 6 — Formatação Avançada no Quill

Atualizar `src/components/QuillTemplate.tsx`:

- **Indentação**: Adicionar `{ indent: '-1' }` e `{ indent: '+1' }` na config da toolbar (nativo do Quill)
- **Line-height**: Registrar custom Parchment Attributor:
  ```
  const LineHeightStyle = new Quill.import('attributors/style/line-height')
  Quill.register(LineHeightStyle, true)
  ```
  Adicionar dropdown de line-height na toolbar
- **Spacing**: Registrar Attributors para `margin-top` e `margin-bottom`, adicionar na toolbar

### Step 7 — Componente PdfPreview (compartilhado)

Criar `src/components/PdfPreview.tsx`:

- Props: `htmlContent: string`, `isOpen: boolean`, `onClose: () => void`, `onExport: () => void`
- Renderiza modal overlay com:
  - Backdrop escuro (click para fechar)
  - Container A4 com `width: 210mm`, `min-height: 297mm`, `padding: 20mm 15mm`
  - Conteúdo HTML injetado via `dangerouslySetInnerHTML`
  - Estilos idênticos aos usados em `pdfExport.ts`
  - Header do modal com título "Preview do Documento" + botões "Exportar PDF" e "✕ Fechar"
- Keyboard: `ESC` fecha o modal
- CSS com media query `@media print` para esconder o modal se o usuário tentar imprimir

### Step 8 — Integrar PdfPreview no FieldsPanel

Atualizar `src/components/FieldsPanel.tsx`:

- Importar `PdfPreview`
- Adicionar state `isPreviewOpen` e `previewHtml`
- Novo botão **"👁️ Preview PDF"** na seção de exportar
- Ao clicar, monta o HTML com campos aplicados e abre o modal
- O botão "Exportar PDF" dentro do preview reutiliza `exportWithHtml2Pdf`

### Step 9 — Corretor Ortográfico nos 3 Editores

Atualizar os 3 componentes de editor:

- **Tiptap** (`TiptapTemplate.tsx`): Adicionar `editorProps: { attributes: { spellcheck: 'true', lang: 'pt-BR' } }` no `useEditor`
- **Lexical** (`LexicalTemplate.tsx`): Adicionar `spellCheck={true}` e `lang="pt-BR"` no `ContentEditable`
- **Quill** (`QuillTemplate.tsx`): Garantir que o container tenha `spellCheck={true}` e `lang="pt-BR"` — configurar via ref no `useEffect` se necessário

### Step 10 — Estilos CSS

Atualizar `src/index.css`:

- Estilos para dropdowns de formatação na toolbar (line-height, spacing)
- Estilos para o modal de PdfPreview (overlay, container A4, header do modal, botões)
- Estilos para o container A4 (sombra, bordas, simulação de página)
- Classes utilitárias para line-height (`line-height-1`, `line-height-1-5`, etc.) para Lexical
- Estilos de indent levels para os 3 editores

### Step 11 — Documentação e Análise Comparativa

Atualizar `README.md` e criar seção de análise:

- Documentar quais funcionalidades são nativas vs customizadas em cada editor
- Comparar fidelidade do preview vs PDF real
- Documentar estado do spellcheck em cada editor e navegador
- Atualizar o problem-rationalization com os validation criteria preenchidos

---

## 4. Architectural Decision Records (ADR)

| #   | Decisão                                                           | Justificativa                                                                                                                                                                                                 |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Tiptap: globalAttributes para indentação/spacing/line-height**  | Mesmo padrão usado por `TextAlign` (extensão oficial). Permite aplicar atributos em múltiplos tipos de node de forma limpa, sem criar custom nodes. Cada extensão fica isolada e composável.                  |
| 2   | **Lexical: indent nativo + CSS classes para line-height/spacing** | Lexical já possui `INDENT_CONTENT_COMMAND`. Para line-height e spacing, manipulação de style inline via `editor.update()` é a abordagem mais direta sem criar custom nodes.                                   |
| 3   | **Quill: Parchment Attributors para line-height/spacing**         | Parchment Attributors são a forma canônica de adicionar formatação por style no Quill. Indent já é nativo. Abordagem registra formatação sem criar Blots customizados.                                        |
| 4   | **PdfPreview como modal overlay, não painel lateral**             | Modal oferece mais espaço para visualizar o documento em escala próxima ao real (A4). Painel lateral comprimiria demais. Toggle de modo alteraria o layout do editor, o que é mais invasivo.                  |
| 5   | **Container A4 com medidas reais (mm) no preview**                | Usar `width: 210mm` e `min-height: 297mm` garante fidelidade visual com o PDF. Escala pode ser ajustada via `transform: scale()` se a viewport for pequena.                                                   |
| 6   | **dangerouslySetInnerHTML no preview**                            | O conteúdo já vem do editor (é confiável/sanitizado pelo próprio editor). Renderizar via innerHTML é a forma mais fiel de reproduzir exatamente o que será exportado pelo html2pdf.js.                        |
| 7   | **Spellcheck nativo do browser como baseline**                    | Funciona "grátis", sem deps adicionais, em todos os browsers modernos. Suporte a PT-BR depende do SO/browser, mas é o padrão mais universal. Integração com LanguageTool pode ser feita depois como evolução. |
| 8   | **lang="pt-BR" nos containers dos editores**                      | Atributo `lang` é a forma padrão W3C de informar ao browser qual dicionário de spellcheck usar. Necessário para que o sublinhado vermelho funcione corretamente em português.                                 |
| 9   | **PdfPreview compartilhado via FieldsPanel**                      | Reutiliza o mesmo padrão do `FieldsPanel` como componente compartilhado entre editores. Evita duplicação. O preview recebe HTML pronto, independente do editor de origem.                                     |
| 10  | **Estilos de formatação via inline styles (não classes)**         | Inline styles (`margin-left`, `line-height`, `margin-top`) são preservados no `getHTML()` de todos os editores e no export PDF. Classes CSS seriam perdidas no contexto do PDF.                               |

---

## 5. Validation Checklist

- [x] **Tiptap**: Controles de indent/outdent funcionam e persistem no HTML
- [x] **Tiptap**: Dropdown de line-height aplica corretamente os valores (1.0, 1.15, 1.5, 2.0)
- [x] **Tiptap**: Dropdown de spacing aplica margin-top/margin-bottom nos parágrafos
- [x] **Lexical**: Indent/outdent via comandos nativos funcionam na toolbar
- [x] **Lexical**: Line-height e spacing são aplicáveis via toolbar
- [x] **Quill**: Indent nativo funciona via toolbar
- [x] **Quill**: Line-height e spacing são aplicáveis via Parchment Attributors
- [x] **Preview**: Modal abre com conteúdo do editor renderizado em formato A4
- [x] **Preview**: Campos dinâmicos são substituídos no preview quando preenchidos
- [x] **Preview**: Botão de exportar PDF no preview gera o mesmo resultado que o botão direto
- [x] **Preview**: Modal fecha com ESC, clique fora, ou botão fechar
- [x] **Spellcheck**: Palavras incorretas em português são sublinhadas nos 3 editores
- [x] **Spellcheck**: Menu de contexto (clique direito) oferece sugestões de correção
- [x] **Formatação no PDF**: As configurações de indentação, line-height e spacing são refletidas no PDF exportado
- [x] O setup continua simples: `npm install` → `npm run dev`

---

## 6. Refactor — Organização das Extensões em Arquivos Separados

Após a implementação inicial, as extensões de formatação do Lexical e Quill estavam definidas inline nos respectivos componentes de template. Isso dificultava a leitura e compreensão do código, misturando lógica de extensão com lógica de UI.

### Motivação

- **Separação de responsabilidades**: Cada extensão/utilitário fica isolado em seu próprio arquivo
- **Consistência**: O Tiptap já tinha extensões em `src/extensions/tiptap/` — agora Lexical e Quill seguem o mesmo padrão
- **Legibilidade**: Os componentes de template ficam focados em rendering e state management
- **Reusabilidade**: As extensões podem ser importadas em outros contextos se necessário

### Estrutura após o refactor

```
src/extensions/
├── tiptap/                          (já existia)
│   ├── IndentExtension.ts           # Indentação por níveis (0-5)
│   ├── LineHeightExtension.ts       # Line-height (1, 1.15, 1.5, 2)
│   └── ParagraphSpacingExtension.ts # Margin-top/bottom entre parágrafos
├── lexical/
│   ├── index.ts                     # Barrel export
│   └── applyBlockStyle.ts           # Utilitário para aplicar CSS inline em blocos selecionados
└── quill/
    ├── index.ts                     # Barrel export
    ├── registerFormattingAttributors.ts  # Parchment StyleAttributors (lineHeight, spacingBefore, spacingAfter)
    └── quillFormattingConfig.ts     # QUILL_MODULES e QUILL_FORMATS centralizados
```

### O que foi extraído

| Editor  | O que estava inline                                | Novo arquivo                                        |
| ------- | -------------------------------------------------- | --------------------------------------------------- |
| Lexical | `applyBlockStyle()` dentro do `ToolbarPlugin`      | `extensions/lexical/applyBlockStyle.ts`             |
| Quill   | Parchment Attributor registrations (3 attributors) | `extensions/quill/registerFormattingAttributors.ts` |
| Quill   | `QUILL_MODULES` e `QUILL_FORMATS` constantes       | `extensions/quill/quillFormattingConfig.ts`         |

### Mudanças nos componentes

- **`LexicalTemplate.tsx`**: Removido `$isElementNode` import e função inline `applyBlockStyle`. Agora importa `applyBlockStyle(editor, property, value)` de `../extensions/lexical`
- **`QuillTemplate.tsx`**: Removidas ~50 linhas de registro de Parchment e constantes. Agora importa `registerQuillFormattingAttributors`, `QUILL_MODULES`, `QUILL_FORMATS` de `../extensions/quill`
- **`PdfPreview.tsx`**: Adicionado `createPortal` (React DOM) para renderizar o modal diretamente no `<body>`, evitando conflitos de z-index com o app header sticky

---

## 7. Refactor — SpacingControls Compartilhado + Valores Personalizados

### Problema

1. **Quill quebrado**: O `lineHeight` dropdown registrado na toolbar nativa do Quill não renderizava corretamente como custom format. Os Parchment `StyleAttributor` usavam `whitelist`, rejeitando qualquer valor fora da lista.
2. **Valores fixos**: Os dropdowns de line-height e spacing nos 3 editores só permitiam valores predefinidos (1, 1.15, 1.5, 2 para line-height; 0.5em, 1em, 1.5em, 2em para spacing). Usuários que precisassem de um valor personalizado (ex: `2.33cm`, `18pt`) não tinham como especificá-lo.
3. **Código duplicado**: A mesma UI de controles de line-height/spacing estava implementada de forma diferente (e repetida) em cada template.

### Solução

#### SpacingControls — Componente compartilhado

Criado `src/components/SpacingControls.tsx`:

- Recebe callbacks `onLineHeight(value)` e `onSpacing(value)` — agnóstico ao editor
- Exibe **preset buttons** para valores comuns (clique rápido)
- Inclui **campo de input livre** onde o usuário digita qualquer valor CSS (ex: `2.33cm`, `18pt`, `1.8`)
- Aplica com Enter ou botão ✓

#### Quill fix — Whitelist removida

- Removidas as `whitelist` dos Parchment `StyleAttributor` em `registerFormattingAttributors.ts`
- O `lineHeight` dropdown foi removido da toolbar nativa do Quill (não renderizava corretamente)
- Toda a formatação de line-height e spacing agora é controlada via `SpacingControls`

#### Integração nos 3 editores

| Editor  | Integração                                                                                                                                         |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tiptap  | `SpacingControls` renderizado entre toolbar e `EditorContent`. Chama `setLineHeight()` e `setSpacingBefore()/setSpacingAfter()` via chain commands |
| Lexical | `SpacingPlugin` wrapper (dentro do `LexicalComposer`) renderiza `SpacingControls`. Chama `applyBlockStyle(editor, ...)`                            |
| Quill   | `SpacingControls` renderizado acima do `ReactQuill`. Chama `editor.formatLine()` com os attributors registrados                                    |

### Arquivos modificados

| Arquivo                                                 | Mudança                                                                                                                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/SpacingControls.tsx`                    | **Novo** — componente compartilhado com presets + custom input                                                                                           |
| `src/extensions/quill/registerFormattingAttributors.ts` | Removidas `whitelist` dos 3 attributors (aceita qualquer valor)                                                                                          |
| `src/extensions/quill/quillFormattingConfig.ts`         | Removido `lineHeight` da toolbar nativa                                                                                                                  |
| `src/components/TiptapTemplate.tsx`                     | Substituídos `<select>` inline por `<SpacingControls>`                                                                                                   |
| `src/components/LexicalTemplate.tsx`                    | Substituídos `<select>` inline por `<SpacingPlugin>` + `<SpacingControls>`                                                                               |
| `src/components/QuillTemplate.tsx`                      | Removido extra-toolbar inline, usa `<SpacingControls>`                                                                                                   |
| `src/index.css`                                         | Adicionados estilos para `.spacing-controls`, `.spacing-presets`, `.spacing-preset-btn`, `.spacing-custom-input`, `.spacing-input`, `.spacing-apply-btn` |

---

## Histórico de versões

| Versão | Data       | Autor    | Alteração                                                                     |
| ------ | ---------- | -------- | ----------------------------------------------------------------------------- |
| 1.0    | 2026-04-08 | AI Agent | Documento criado (AWAITING APPROVAL)                                          |
| 1.1    | 2026-04-09 | AI Agent | Implementação completa — status DONE                                          |
| 1.2    | 2026-04-09 | AI Agent | Refactor — extensões extraídas para arquivos separados                        |
| 1.3    | 2026-04-09 | AI Agent | Refactor — SpacingControls compartilhado + valores personalizados + fix Quill |
