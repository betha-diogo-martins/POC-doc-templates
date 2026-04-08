# POC — Editores Rich Text com Licenças Permissivas + Templating + Export to PDF (Segunda Iteração)

## Status

> DONE — Implemented

---

## 1. Problem Summary

Na primeira iteração da POC, validamos CKEditor 5 e TinyMCE com plugins premium (Merge Fields/Tags + Export to PDF) via licenças trial. A análise de licenciamento revelou que:

- **Export to PDF** e **Merge Fields/Tags** são plugins **premium/pagos** em ambos os editores
- Ambos os editores são licenciados sob **GPL 2+** na versão open-source — **incompatível com produtos proprietários/SaaS**
- O uso de GPL 2+ é um **deal-breaker** pois obrigaria a empresa a abrir o código-fonte do produto

**Conclusão**: CKEditor 5 e TinyMCE **não são opções viáveis** para uso em produto proprietário sem licença comercial paga. Precisamos avaliar **editores com licenças permissivas** (MIT, BSD) que não tenham restrição copyleft.

**Objetivo desta iteração**: Incorporar editores rich text com licenças permissivas ao projeto, criar uma página dedicada para cada um, e validar:

1. Como implementar um **mecanismo de templating** (campos dinâmicos `{{campo}}`) em cada editor
2. Como fazer **export to PDF** a partir do HTML gerado por cada editor

### Editores a avaliar

| Editor      | Licença      | Stars | Base          | React Package     |
| ----------- | ------------ | ----- | ------------- | ----------------- |
| **Tiptap**  | MIT          | 36.1k | ProseMirror   | `@tiptap/react`   |
| **Lexical** | MIT (Meta)   | 23.2k | Custom (Meta) | `@lexical/react`  |
| **Quill**   | BSD 3-Clause | 47k   | Delta format  | `react-quill-new` |

### Bibliotecas de suporte (PDF)

| Biblioteca         | Licença | Abordagem                                                                      |
| ------------------ | ------- | ------------------------------------------------------------------------------ |
| **html2pdf.js**    | MIT     | Client-side: HTML → Canvas → PDF (rasterizado, texto não selecionável)         |
| **react-to-print** | MIT     | Usa `window.print()` nativo, texto selecionável, depende de diálogo do browser |

## 2. Proposed Solution

Adicionar **3 novas rotas/páginas** na SPA existente — uma para cada editor com licença permissiva — mantendo as páginas da primeira iteração (CKEditor/TinyMCE premium) para comparação direta.

### Rotas existentes (primeira iteração — mantidas para comparação)

- `/ckeditor` — CKEditor 5 com Merge Fields + ExportPdf (premium trial, GPL 2+)
- `/tinymce` — TinyMCE com Merge Tags + ExportPdf (premium trial, GPL 2+)

### Novas rotas (segunda iteração — editores MIT/BSD)

- `/tiptap` — Tiptap (MIT) com templating custom + export PDF
- `/lexical` — Lexical (MIT, Meta) com templating custom + export PDF
- `/quill` — Quill (BSD 3-Clause) com templating custom + export PDF

### Abordagem para templating (campos dinâmicos)

Como nenhum dos editores com licença permissiva possui merge fields nativos, implementaremos um **mecanismo customizado** compartilhado:

1. **Placeholders `{{campo}}`** no template HTML como texto puro
2. **CSS content_style** para highlight visual dos placeholders no editor (destaque em azul com bordas arredondadas)
3. **FieldsPanel** — painel lateral com inputs para cada campo, com botões "Aplicar valores" e "Resetar"
4. **Replace via regex** — `replacePlaceholders()` substitui `{{campo}}` pelos valores fornecidos no HTML do editor
5. Utiliza a mesma configuração de campos de `mergeFieldsConfig.ts`

**Para Tiptap** (ProseMirror): Possibilidade adicional de criar um **custom Node** (`MergeFieldNode`) que renderiza o placeholder como um chip inline não-editável — UX mais próxima do CKEditor premium.

### Abordagem para Export to PDF

**html2pdf.js** como opção principal em todas as páginas + **react-to-print** como alternativa:

- Botão "📄 Exportar PDF (html2pdf.js)" — gera PDF diretamente
- Botão "🖨️ Imprimir / PDF (browser)" — abre diálogo de impressão

## 3. Implementation Plan

### Step 1 — Instalar dependências

Instalar os 3 editores + bibliotecas de PDF:

```
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-link @tiptap/extension-image
npm install lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/table @lexical/html @lexical/selection @lexical/utils
npm install react-quill-new
npm install html2pdf.js react-to-print
```

### Step 2 — Utilitário de campos dinâmicos customizados

Criar `src/utils/customMergeFields.ts`:

- `replacePlaceholders(html, values)` — substitui `{{campo}}` pelos valores
- `highlightPlaceholdersCSS()` — retorna CSS string para estilizar placeholders visualmente nos editores
- `extractPlaceholders(html)` — extrai lista de placeholders encontrados
- `useFieldValues()` — hook React que gerencia state dos valores dos campos com defaults de `MERGE_FIELDS`

### Step 3 — Utilitário de Export to PDF

Criar `src/utils/pdfExport.ts`:

- `exportWithHtml2Pdf(element, filename?)` — wrapper sobre html2pdf.js com config A4, margens, qualidade
- Configurações padrão de PDF reutilizáveis

### Step 4 — Componente FieldsPanel

Criar `src/components/FieldsPanel.tsx`:

- Painel com inputs para cada campo de `MERGE_FIELDS`, agrupados por grupo (Pessoa, Documento, Empresa)
- Botão "Aplicar valores" — faz replace no HTML e atualiza o conteúdo do editor
- Botão "Resetar" — restaura os placeholders `{{campo}}` originais
- Botões de export: "Exportar PDF" (html2pdf.js) + "Imprimir / PDF" (react-to-print)
- Componente reutilizável entre os 3 editores, recebe callbacks `onApply`, `onReset`, `onExportPdf`, `onPrint`

### Step 5 — Página Tiptap

Criar `src/components/TiptapTemplate.tsx` e `src/pages/TiptapPage.tsx`:

- **Tiptap** (MIT, ProseMirror-based) com `useEditor` + `EditorContent`
- Extensions: `StarterKit`, `TextAlign`, `Underline`, `Color`, `TextStyle`, `Highlight`, `Link`, `Image`, `Table`, `TableRow`, `TableCell`, `TableHeader`
- **Toolbar customizada** com botões de formatação (Bold, Italic, Underline, Headings, Alignment, Lists, Link, Table)
- Template inicial: `DOCUMENT_TEMPLATE` com placeholders `{{campo}}`
- Integração com `FieldsPanel` — `onApply` usa `editor.commands.setContent()` para atualizar conteúdo
- Botões de PDF que capturam o conteúdo via `editor.getHTML()` e geram PDF

### Step 6 — Página Lexical

Criar `src/components/LexicalTemplate.tsx` e `src/pages/LexicalPage.tsx`:

- **Lexical** (MIT, Meta) com `LexicalComposer` + `RichTextPlugin`
- Plugins: `RichTextPlugin`, `HistoryPlugin`, `ListPlugin`, `LinkPlugin`, `TablePlugin`, `AutoFocusPlugin`
- **ToolbarPlugin** customizado com botões de formatação
- Template inicial carregado via `$generateNodesFromDOM()` para converter `DOCUMENT_TEMPLATE` HTML em nós Lexical
- Integração com `FieldsPanel` — `onApply` usa `editor.update()` + `$insertNodes` para atualizar conteúdo
- Export HTML via `$generateHtmlFromNodes()` para gerar PDF

### Step 7 — Página Quill

Criar `src/components/QuillTemplate.tsx` e `src/pages/QuillPage.tsx`:

- **Quill** (BSD 3-Clause) via `react-quill-new` com ref para acessar a instância
- Módulos: toolbar com formatação padrão (headers, bold, italic, underline, lists, link, image, alignment, color)
- Template inicial: `DOCUMENT_TEMPLATE` passado como `defaultValue` em HTML
- Integração com `FieldsPanel` — `onApply` usa `quillRef.current.getEditor().root.innerHTML` para ler/escrever conteúdo
- Export PDF captura `innerHTML` do editor e gera via html2pdf.js

### Step 8 — Atualizar App.tsx e estilos

- Atualizar `src/App.tsx`:
  - Navegação com **duas seções**: "Premium (Trial)" com CKEditor/TinyMCE e "MIT/BSD (Free)" com Tiptap/Lexical/Quill
  - Novas rotas: `/tiptap`, `/lexical`, `/quill`
  - Redirect padrão atualizado
- Atualizar `src/index.css`:
  - Estilos para `FieldsPanel` (inputs agrupados, botões de ação)
  - Estilos para toolbars customizadas (Tiptap, Lexical)
  - Estilos para highlight de placeholders `{{campo}}` dentro dos editores
  - Estilos para layout do editor com painel lateral
  - Estilos para a seção de navegação com separador visual entre os dois grupos

### Step 9 — Documentação e análise comparativa

- Atualizar `README.md` com as novas rotas, instruções e resumo dos editores
- Criar `docs/comparative-analysis.md` com trade-offs documentados:
  - Premium (CKEditor/TinyMCE) vs Free (Tiptap/Lexical/Quill)
  - Licenciamento: GPL 2+ vs MIT vs BSD
  - Funcionalidades nativas vs customizadas
  - Qualidade do PDF (cloud service vs html2pdf.js vs browser print)
  - Esforço de implementação (plugins prontos vs custom)
  - DX (developer experience) de cada editor

## 4. Architectural Decision Records (ADR)

| #   | Decisão                                              | Justificativa                                                                                                                                                                                    |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Excluir CKEditor e TinyMCE das alternativas free** | GPL 2+ é deal-breaker para produto proprietário. Mesmo os "Free Plans" comerciais têm limitações severas (1.000 loads/mês, sem merge fields). Manter apenas como referência na primeira iteração |
| 2   | **Tiptap como editor principal a avaliar**           | MIT license, 36.1k stars, baseado em ProseMirror (robusto e bem documentado), 100+ extensions open-source, headless (UI totalmente customizável), excelente integração React                     |
| 3   | **Lexical como segunda opção**                       | MIT license (Meta), 23.2k stars, arquitetura moderna com imutabilidade, boa extensibilidade via custom nodes/plugins, suporte oficial React. Mais low-level que Tiptap                           |
| 4   | **Quill como terceira opção**                        | BSD 3-Clause, 47k stars, editor mais popular/maduro, `react-quill-new` é o wrapper React mantido. Menos extensível que Tiptap/Lexical mas mais simples de configurar                             |
| 5   | **html2pdf.js como gerador de PDF**                  | MIT license, client-side puro, sem dependência de serviço cloud. Trade-off aceito: PDF como imagem rasterizada (texto não selecionável)                                                          |
| 6   | **react-to-print como alternativa de PDF**           | MIT license, zero deps, texto selecionável no PDF resultante. Trade-off: depende de interação do usuário com diálogo de impressão do browser                                                     |
| 7   | **Campos dinâmicos via regex replace**               | Abordagem universal que funciona em qualquer editor. Simples de implementar. Trade-off: sem UX nativa de autocomplete/drag-drop. Para Tiptap, pode-se evoluir para custom Node no futuro         |
| 8   | **FieldsPanel como componente compartilhado**        | Reutilizável entre os 3 editores, mantém lógica de campos desacoplada do editor específico                                                                                                       |
| 9   | **Manter primeira iteração intacta**                 | Permite comparação direta side-by-side entre premium (GPL) e free (MIT/BSD) na mesma aplicação                                                                                                   |

## 5. Validation Checklist

- [x] As páginas da primeira iteração (CKEditor/TinyMCE premium) continuam funcionando normalmente
- [x] **Tiptap** renderiza o template, permite edição rich text, e os placeholders `{{campo}}` podem ser preenchidos via painel
- [x] **Lexical** renderiza o template, permite edição rich text, e os placeholders `{{campo}}` podem ser preenchidos via painel
- [x] **Quill** renderiza o template, permite edição rich text, e os placeholders `{{campo}}` podem ser preenchidos via painel
- [x] A exportação via **html2pdf.js** funciona em **todos os 3 editores**, gerando PDF com conteúdo e valores
- [x] A exportação via **react-to-print** funciona como alternativa de PDF via diálogo do browser
- [x] Todas as bibliotecas adicionadas possuem **licença MIT ou BSD** (nenhuma GPL)
- [x] O setup continua simples: `npm install` → `npm run dev` (sem variáveis de ambiente obrigatórias para as rotas free)
- [x] A navegação entre todas as páginas (premium e free) funciona corretamente com separação visual clara

---

## Histórico de versões

| Versão | Data       | Autor    | Alteração                                                                                                                                    |
| ------ | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0    | 2026-04-07 | AI Agent | Documento criado (AWAITING APPROVAL)                                                                                                         |
| 2.0    | 2026-04-07 | AI Agent | Reescrito: foco em editores MIT/BSD (Tiptap, Lexical, Quill), excluídos CKEditor e TinyMCE das alternativas free por GPL 2+ ser deal-breaker |
