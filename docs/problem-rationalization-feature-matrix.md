# Matriz de Capacidades: Editores Rich Text para Templates de Documentos Oficiais

## Problem

O projeto precisa selecionar um editor rich text para criação de templates de documentos oficiais. Existem múltiplos editores em avaliação (CKEditor 5, TinyMCE, Tiptap, Lexical, Quill) e cada um possui diferentes níveis de suporte para os requisitos levantados. É necessário mapear de forma objetiva e comparativa quais features cada editor suporta — nativamente, via plugins da comunidade, via desenvolvimento customizado — ou se a feature é inviável/muito difícil de implementar.

### Contexto

- Editores premium avaliados: **CKEditor 5** (GPL 2+ / licença comercial), **TinyMCE** (GPL 2+ / licença comercial)
- Editores MIT/BSD avaliados: **Tiptap** (MIT, baseado em ProseMirror), **Lexical** (MIT, Meta), **Quill** (BSD 3-Clause)
- O projeto é uma POC para templates de documentos que precisam atender normas ABNT
- Branch de trabalho: `POC-free-tier-extension`

## Expected Output

Um documento contendo:

1. **Definição detalhada de cada feature** a ser avaliada com critérios claros
2. **Pesquisa por editor** mostrando como cada feature é atendida
3. **Tabela comparativa final** com classificação por capacidade (Nativo Premium, Nativo OSS, Plugin Comunidade, Desenvolvimento Customizado, Inviável)
4. **Recomendação** baseada na análise

### Features a avaliar

| #   | Feature                                | Descrição                                                                                                                                        | Critérios de aceite                                                                      |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 1   | **Merge Fields**                       | Campos dinâmicos/variáveis inseridos no template que são substituídos por dados reais na geração do documento (ex: `{{nome}}`, `{{cpf}}`)        | Inserção visual no editor, preview com dados reais, substituição no export               |
| 2   | **Formatação ABNT**                    | Fonte, espaçamento entre linhas, espaçamento entre parágrafos, margens, indentação configuráveis para atender normas ABNT de documentos oficiais | Font family/size, line-height, paragraph spacing, indent, margins no export PDF          |
| 3   | **Preview PDF com quebras de página**  | Pré-visualização do documento final em formato PDF, respeitando quebras de página automáticas e manuais                                          | Inserção de page break, preview visual das páginas, export PDF fiel ao preview           |
| 4   | **Colaboração em tempo real**          | Múltiplos usuários editando o mesmo documento simultaneamente com resolução de conflitos                                                         | Cursores compartilhados, sincronização em tempo real, resolução de conflitos (CRDT/OT)   |
| 5   | **Corretor ortográfico**               | Verificação ortográfica em tempo real com sugestões de correção, suporte ao português brasileiro                                                 | Spell check em pt-BR, sugestões de correção, dicionário customizável                     |
| 6   | **Integração com editores de mercado** | Import/export de documentos de/para Microsoft Office (.docx), LibreOffice (.odt), Google Docs                                                    | Import .docx/.odt, export .docx/.odt, paste from Word/Google Docs preservando formatação |
| 7   | **Manipulação de imagens**             | Inserção, redimensionamento, posicionamento e edição básica de imagens no editor                                                                 | Upload, resize, drag & drop, alinhamento, crop/rotate (básico)                           |

---

## Pesquisa por Editor

### 1. CKEditor 5

**Licença:** GPL 2+ (open source) ou Comercial (planos pagos)
**Versão avaliada:** 48.x

| Feature                       | Suporte | Tipo                    | Detalhes                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge Fields                  | ✅ Sim  | 🔶 Nativo Premium       | Plugin `MergeFields` no pacote `ckeditor5-premium-features`. Suporta definições de campos, data sets, preview com labels/valores, 3 modos de visualização.                                                                                                                                                  |
| Formatação ABNT               | ✅ Sim  | 🟢 Nativo OSS           | Font family, font size, font color (open source). Alignment, indent, line-height via configuração CSS do editable. Espaçamento de parágrafo via CSS. Margens configuráveis no ExportPdf.                                                                                                                    |
| Preview PDF + Page Break      | ✅ Sim  | 🔶 Nativo Premium       | `PageBreak` (OSS) para quebras manuais. `Pagination` (Premium) mostra linhas de quebra de página ao vivo no editor — funciona como preview em tempo real. `ExportPdf` (Premium) gera PDF server-side via CKEditor Cloud Services. Não possui modal de preview separado — a paginação no editor É o preview. |
| Colaboração em tempo real     | ✅ Sim  | 🔶 Nativo Premium       | RTC completo com resolução de conflitos (OT), cursores compartilhados, Track Changes, Comments, Revision History. Disponível como SaaS (CKEditor Cloud Services) ou on-premises.                                                                                                                            |
| Corretor ortográfico          | ✅ Sim  | 🔶 Nativo Premium       | `SpellChecker` premium com suporte a múltiplos idiomas (incluindo pt-BR). WProofreader integration. Verificação em tempo real com sugestões. Também suporta spellcheck nativo do browser (gratuito).                                                                                                        |
| Integração Office/LibreOffice | ✅ Sim  | 🔶 Nativo Premium       | `ImportWord` (.docx → HTML), `ExportWord` (HTML → .docx), `ExportPdf` (HTML → PDF). `PasteFromOffice` (OSS) para paste de Word/Google Docs. Não há import/export nativo de .odt — apenas .docx.                                                                                                             |
| Manipulação de imagens        | ✅ Sim  | 🟢 Nativo OSS + Premium | `Image`, `ImageResize`, `ImageStyle` (OSS). `ImageEditing` (Premium, via CKBox) com crop, rotate, flip. Upload via `SimpleUploadAdapter` ou `CKBox`. Drag & drop nativo.                                                                                                                                    |

**Resumo CKEditor 5:** Cobertura completa de todas as features, porém a maioria requer licença premium/comercial. As features open source cobrem formatação básica e manipulação de imagens. Não suporta .odt nativamente.

---

### 2. TinyMCE

**Licença:** GPL 2+ (open source) ou Comercial (planos pagos)
**Versão avaliada:** 7.x

| Feature                       | Suporte    | Tipo                | Detalhes                                                                                                                                                                                                                                                                  |
| ----------------------------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge Fields                  | ✅ Sim     | 🔶 Nativo Premium   | Plugin `Merge Tags` (premium). Permite inserir tags de mesclagem com preview. Callback para resolução de valores. Suporta prefixos/sufixos customizáveis.                                                                                                                 |
| Formatação ABNT               | ✅ Sim     | 🟢 Nativo OSS       | Font family, font size, text color, alignment, indent, line-height tudo disponível open source. `lineheight` plugin nativo. Configuração completa de formatação via `formats` e `style_formats`.                                                                          |
| Preview PDF + Page Break      | ⚠️ Parcial | 🟢 OSS + 🔶 Premium | `pagebreak` (OSS) para quebras manuais. `ExportPdf` (Premium) para gerar PDF. Plugin `Preview` (OSS) abre preview HTML em nova janela mas **não mostra quebras de página**. Não possui equivalente ao `Pagination` do CKEditor (sem preview de página ao vivo no editor). |
| Colaboração em tempo real     | ⚠️ Parcial | 🔶 Nativo Premium   | `Suggested Edits` (Premium) para revisão colaborativa (similar a Track Changes). `Comments` (Premium) para discussões. `Revision History` (Premium). **Não possui RTC nativo** (edição simultânea com resolução de conflitos). Colaboração é assíncrona.                  |
| Corretor ortográfico          | ✅ Sim     | 🔶 Nativo Premium   | `Spell Checker` (Premium) com verificação em tempo real. `Spelling Autocorrect` (Premium) para autocorreção. Suporte a múltiplos idiomas incluindo pt-BR. Também suporta spellcheck nativo do browser (gratuito).                                                         |
| Integração Office/LibreOffice | ✅ Sim     | 🔶 Nativo Premium   | `ImportWord` (.docx → HTML), `ExportWord` (HTML → .docx), `ExportPdf` (HTML → PDF). `PowerPaste` (Premium) para colar de Word/Excel/Google Docs preservando formatação. Não suporta .odt nativamente.                                                                     |
| Manipulação de imagens        | ✅ Sim     | 🟢 OSS + 🔶 Premium | `image` (OSS) para inserção e resize básico. `ImageEditing` / `editimage` (Premium) com crop, rotate, flip, filters, color adjustment. Upload e drag & drop nativos.                                                                                                      |

**Resumo TinyMCE:** Boa cobertura geral, similar ao CKEditor em features premium. Principal lacuna: **não possui colaboração em tempo real** (apenas assíncrona com Suggested Edits). Preview de PDF não mostra quebras de página ao vivo. Não suporta .odt.

---

### 3. Tiptap

**Licença:** MIT (editor core e extensões open source). Planos pagos para Collaboration Cloud e extensões premium.
**Versão avaliada:** 3.x (baseado em ProseMirror)

| Feature                       | Suporte    | Tipo                              | Detalhes                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ---------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge Fields                  | ⚠️ Parcial | 🛠 Customizado                    | Não possui plugin nativo de merge fields. Pode ser implementado via extensão `Mention` (sugestão com `@`) adaptada, ou criando um custom Node que renderiza placeholders `{{campo}}`. A extensão `Mention` é OSS e pode ser estendida. Viável mas requer desenvolvimento.                                                                                              |
| Formatação ABNT               | ✅ Sim     | 🟢 Nativo OSS + 🛠 Custom         | `FontFamily`, `FontSize`, `TextAlign`, `Color`, `Indent` (OSS). `LineHeight` (OSS, extensão oficial). `ParagraphSpacing` requer extensão customizada (já implementada na POC). Margens via CSS.                                                                                                                                                                        |
| Preview PDF + Page Break      | ⚠️ Parcial | 🔶 Premium + 🛠 Custom            | Extensão `Pages` (Team plan, premium) para visualização paginada com margens e quebras de página no editor. Export via extensão `Export` (Start plan) para .docx, .odt, markdown. Para PDF: requer biblioteca externa (`html2pdf.js`, `puppeteer`, etc). Não possui export PDF nativo — precisa de solução client-side ou server-side customizada.                     |
| Colaboração em tempo real     | ✅ Sim     | 🟢 OSS (Yjs) + 🔶 Premium (Cloud) | Extensão `Collaboration` (OSS) baseada em Yjs/CRDT. `CollaborationCaret` para cursores compartilhados. Backend open source via **Hocuspocus** (self-hosted) ou premium via **Tiptap Collaboration Cloud**. `Comments` (Start plan). `Tracked Changes` (Add-on). `Snapshot` para versioning.                                                                            |
| Corretor ortográfico          | ⚠️ Parcial | 🌐 Browser + 🛠 Custom            | Depende do spellcheck nativo do browser (`spellcheck="true"`). Não possui corretor ortográfico próprio. Para spell check avançado (sugestões, dicionário custom), requer integração com serviço externo (ex: LanguageTool API) ou biblioteca JS.                                                                                                                       |
| Integração Office/LibreOffice | ⚠️ Parcial | 🔶 Premium + 🛠 Custom            | Extensão `Import` (Start plan) para importar de .docx, .odt, markdown. Extensão `Export` (Start plan) para exportar para .docx, .odt, markdown. `PasteHandler` (Team plan) para paste de Word/Excel/Google Docs. **Nota:** Import/Export de .odt é suportado, diferencial em relação aos editores premium! Sem paste handler gratuito preservando formatação complexa. |
| Manipulação de imagens        | ✅ Sim     | 🟢 Nativo OSS                     | Extensão `Image` (OSS) para inserção. Resize nativo via handles. Drag & drop. Alinhamento via `TextAlign`. `FileHandler` (premium) para melhor UX de upload. Não possui crop/rotate/filtros nativos — requer biblioteca externa (ex: `cropperjs`).                                                                                                                     |

**Resumo Tiptap:** Melhor opção open source para colaboração em tempo real (Yjs/Hocuspocus). **Único editor que suporta import/export .odt**. Merge fields e spell check requerem desenvolvimento customizado. Extensão Pages (premium) resolve preview paginado. Ecossistema ProseMirror é extenso.

---

### 4. Lexical (Meta)

**Licença:** MIT
**Versão avaliada:** 0.42.x

| Feature                       | Suporte     | Tipo                      | Detalhes                                                                                                                                                                                                                                                                          |
| ----------------------------- | ----------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge Fields                  | ⚠️ Parcial  | 🛠 Customizado            | Não possui plugin nativo. Pode ser implementado como custom `DecoratorNode` que renderiza badges/chips de campos dinâmicos. O playground do Lexical tem exemplos de Mentions, Hashtags e Custom Embeds que servem como base. Viável mas requer desenvolvimento significativo.     |
| Formatação ABNT               | ✅ Sim      | 🟢 Nativo OSS + 🛠 Custom | Font family, font size, color, alignment, indent, lists tudo no playground. Line-height e paragraph spacing requerem utility customizado (já implementado na POC via `applyBlockStyle`). Margens via CSS.                                                                         |
| Preview PDF + Page Break      | ⚠️ Limitado | 🛠 Customizado            | Não possui plugin de page break, pagination ou export PDF. Tudo requer implementação customizada. Page break pode ser um custom `DecoratorNode`. PDF via `html2pdf.js` ou similar (client-side) ou `puppeteer` (server-side). Preview modal customizado (já implementado na POC). |
| Colaboração em tempo real     | ✅ Sim      | 🟢 Nativo OSS (Yjs)       | `@lexical/yjs` é binding oficial mantido pela equipe Lexical/Meta. `CollaborationPlugin` no `@lexical/react`. Usa `y-websocket` como provider. Cursores compartilhados. Comments no playground (não produção). Requer backend Yjs (y-websocket ou Hocuspocus).                    |
| Corretor ortográfico          | ⚠️ Parcial  | 🌐 Browser + 🛠 Custom    | Suporta `spellcheck="true"` do browser. Não possui corretor ortográfico próprio. Para spell check avançado requer integração com serviço externo. O playground tem autocomplete mas não spell check.                                                                              |
| Integração Office/LibreOffice | ❌ Limitado | 🛠 Customizado            | Não possui import/export de .docx ou .odt. `$generateHtmlFromNodes` e `$generateNodesFromDOM` para HTML ↔ Lexical. Para .docx requer biblioteca externa (`docx`, `mammoth.js`). Paste from Word funciona parcialmente via clipboard HTML nativo. Sem solução pronta.              |
| Manipulação de imagens        | ⚠️ Parcial  | 🟢 OSS (Playground)       | `ImageNode` no playground com resize via handles. Upload, drag & drop. O playground tem `InlineImageNode` e `ImageComponent` com resize. Não tem crop/rotate nativos. Código do playground não é produção — precisa ser adaptado.                                                 |

**Resumo Lexical:** Framework poderoso e flexível com boa base para colaboração via Yjs. Principal fraqueza: **quase tudo requer desenvolvimento customizado** — merge fields, page break, PDF, integração Office. Ideal para quem quer controle total e tem equipe para construir. O fato de ser mantido pela Meta garante longevidade.

---

### 5. Quill

**Licença:** BSD 3-Clause
**Versão avaliada:** 2.0.3

| Feature                       | Suporte     | Tipo                       | Detalhes                                                                                                                                                                                                                                                                  |
| ----------------------------- | ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge Fields                  | ⚠️ Parcial  | 🛠 Customizado             | Não possui plugin nativo. Pode ser implementado via custom Blot (Embed Blot) que renderiza campos dinâmicos. O modelo Delta do Quill suporta embeds customizados. Viável mas requer desenvolvimento e integração com toolbar customizada.                                 |
| Formatação ABNT               | ✅ Sim      | 🟢 Nativo OSS + 🛠 Custom  | Font, size, color, alignment, indent nativos. Line-height e paragraph spacing via Parchment `StyleAttributor` customizado (já implementado na POC). O Quill não possui toolbar configurável para formatos customizados — requer UI externa.                               |
| Preview PDF + Page Break      | ❌ Limitado | 🛠 Customizado             | Não possui page break nativo, pagination ou export PDF. Requer implementação 100% customizada. PDF via `html2pdf.js` (client) ou `puppeteer` (server). Page break como custom Blot. Preview modal customizado (já implementado na POC).                                   |
| Colaboração em tempo real     | ✅ Sim      | 🔵 Plugin Comunidade (Yjs) | `y-quill` (MIT) — binding oficial do Yjs para Quill mantido por Kevin Jahns (autor do Yjs). `quill-cursors` para cursores compartilhados. Requer backend y-websocket ou Hocuspocus. Funcional mas comunidade menor que Tiptap/Lexical para collab.                        |
| Corretor ortográfico          | ⚠️ Parcial  | 🌐 Browser                 | Suporta `spellcheck="true"` do browser. Não possui corretor próprio. A arquitetura do Quill (contenteditable + Parchment) torna difícil integrar spell checkers avançados pois o Quill controla fortemente o DOM.                                                         |
| Integração Office/LibreOffice | ❌ Limitado | 🛠 Customizado             | Sem import/export .docx ou .odt nativo. Paste from Word funciona parcialmente via clipboard module mas perde formatação complexa. Para import .docx: `mammoth.js` → HTML → Quill Delta. Export .docx: Delta → HTML → `html-docx-js` ou `docx` lib. Muito trabalho manual. |
| Manipulação de imagens        | ⚠️ Parcial  | 🟢 OSS + 🔵 Comunidade     | Image embed nativo (inserção básica). Resize via `quill-image-resize-module` (comunidade, pouco mantido). Drag & drop básico. Sem crop/rotate. Alinhamento via attributor. Ecossistema de plugins de imagem é fragmentado e nem todos compatíveis com v2.                 |

**Resumo Quill:** Editor mais simples e maduro (Delta format é elegante), mas **o mais limitado em features avançadas**. Merge fields, page break, PDF, integração Office — tudo requer desenvolvimento customizado significativo. Colaboração funciona via y-quill mas o ecossistema é menor. A v2 quebrou compatibilidade com muitos plugins da comunidade.

---

## Tabela Comparativa Final

### Legenda

| Símbolo                       | Significado                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| 🟢 **Nativo OSS**             | Feature disponível gratuitamente, open source, pronta para uso     |
| 🔶 **Nativo Premium**         | Feature disponível mas requer licença paga                         |
| 🔵 **Plugin Comunidade**      | Plugin/binding mantido pela comunidade, funcional                  |
| 🛠 **Dev Customizado**        | Requer desenvolvimento próprio, viável com esforço moderado a alto |
| ❌ **Inviável/Muito Difícil** | Não existe solução pronta, implementar é complexo e arriscado      |

### Matriz

| Feature                       | CKEditor 5          | TinyMCE              | Tiptap                  | Lexical             | Quill                   |
| ----------------------------- | ------------------- | -------------------- | ----------------------- | ------------------- | ----------------------- |
| **Merge Fields**              | 🔶 Premium          | 🔶 Premium           | 🛠 Custom               | 🛠 Custom           | 🛠 Custom               |
| **Formatação ABNT**           | 🟢 OSS              | 🟢 OSS               | 🟢 OSS + 🛠             | 🟢 OSS + 🛠         | 🟢 OSS + 🛠             |
| **Preview PDF + Page Break**  | 🔶 Premium          | 🔶 Premium (parcial) | 🔶 Premium (Pages) + 🛠 | 🛠 Custom           | 🛠 Custom               |
| **Colaboração em tempo real** | 🔶 Premium          | ❌ Não nativo\*      | 🟢 OSS (Yjs)            | 🟢 OSS (Yjs)        | 🔵 Comunidade (y-quill) |
| **Corretor ortográfico**      | 🔶 Premium          | 🔶 Premium           | 🌐 Browser              | 🌐 Browser          | 🌐 Browser              |
| **Integração Office** (.docx) | 🔶 Premium          | 🔶 Premium           | 🔶 Premium              | 🛠 Custom           | 🛠 Custom               |
| **Integração Office** (.odt)  | ❌ Não suporta      | ❌ Não suporta       | 🔶 Premium ✅           | ❌ Não suporta      | ❌ Não suporta          |
| **Manipulação de imagens**    | 🟢 OSS + 🔶 Premium | 🟢 OSS + 🔶 Premium  | 🟢 OSS                  | 🟢 OSS (playground) | 🟢 OSS + 🔵 Comunidade  |

\*TinyMCE possui "Suggested Edits" (colaboração assíncrona) mas NÃO possui edição simultânea em tempo real com resolução de conflitos.

### Contagem por Capacidade

| Editor         | 🟢 Nativo OSS | 🔶 Premium | 🔵 Comunidade | 🛠 Custom | ❌ Inviável   |
| -------------- | ------------- | ---------- | ------------- | --------- | ------------- |
| **CKEditor 5** | 2             | 6          | 0             | 0         | 1 (.odt)      |
| **TinyMCE**    | 2             | 5          | 0             | 0         | 2 (.odt, RTC) |
| **Tiptap**     | 3             | 3          | 0             | 2         | 0             |
| **Lexical**    | 2             | 0          | 0             | 5         | 1 (.odt)      |
| **Quill**      | 1             | 0          | 1             | 4         | 1 (.odt)      |

---

## POC de Validação Prática — Features "Simples" nos Editores Free

### Motivação

Algumas features da matriz (colaboração em tempo real, corretor ortográfico avançado com sugestões, integração Office com fidelidade completa) são reconhecidamente complexas e exigem infraestrutura significativa (backend Yjs/CRDT, serviços de NLP, conversores de formato). Implementá-las na POC seria inviável no escopo atual.

No entanto, existe um conjunto de features **fundamentais e viáveis** que pode — e deve — ser validado na prática para os **3 editores free/open source (Tiptap, Lexical, Quill)**. O objetivo é provar que é possível construir um editor de templates de documentos funcional com essas ferramentas, mesmo sem licenças premium.

> **Nota:** CKEditor 5 e TinyMCE não fazem parte desta validação prática porque suas features "simples" já funcionam nativamente (OSS ou Premium). A POC foca exclusivamente nos editores MIT/BSD que exigem desenvolvimento customizado.

### Features a Validar na POC

| #   | Feature POC               | Descrição                                                                                     | Critério de aceite                                                                                                                                |
| --- | ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Merge Fields**          | Inserir campos dinâmicos (`{{nome}}`, `{{cpf}}`) como elementos visuais no editor             | Campo aparece como badge/chip visual no editor; é tratado como bloco atômico (não editável internamente); pode ser inserido via toolbar ou atalho |
| 2   | **Formatação ABNT**       | Configurar fonte, tamanho, espaçamento entre linhas, espaçamento entre parágrafos, indentação | Toolbar permite alterar font family, font size, line-height, paragraph spacing (before/after), indent; valores são aplicados ao conteúdo          |
| 3   | **Page Break**            | Inserir quebra de página manual no documento                                                  | Botão na toolbar insere separador visual de página; o separador é renderizado como linha/divisor claro no editor                                  |
| 4   | **Preview PDF**           | Pré-visualizar o documento em formato próximo ao PDF final                                    | Modal/painel exibe o conteúdo do editor renderizado em layout A4 com margens; quebras de página são respeitadas                                   |
| 5   | **Export PDF**            | Gerar e baixar o documento como arquivo PDF                                                   | Botão exporta o conteúdo para arquivo .pdf; formatação (fonte, espaçamento, margens) é preservada; quebras de página são respeitadas              |
| 6   | **Spell Check (browser)** | Verificação ortográfica básica usando o corretor nativo do navegador                          | Atributo `spellcheck="true"` ativo no editor; palavras erradas são sublinhadas pelo browser; clique direito mostra sugestões do SO                |
| 7   | **Inserção de imagens**   | Inserir e redimensionar imagens no documento                                                  | Upload de imagem via botão ou drag & drop; imagem é exibida no editor; resize via handles ou UI; imagem é incluída no export PDF                  |

### Matriz de Validação POC (Editores Free)

| Feature POC               | Tiptap                               | Lexical                              | Quill                                | Status           |
| ------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ | ---------------- |
| **Merge Fields**          | 🛠 Custom Node/Mention               | 🛠 Custom DecoratorNode              | 🛠 Custom Embed Blot                 | ⬜ A implementar |
| **Formatação ABNT**       | ✅ Implementado na POC               | ✅ Implementado na POC               | ✅ Implementado na POC               | ✅ Validado      |
| **Page Break**            | 🛠 Custom Node (HorizontalRule base) | 🛠 Custom DecoratorNode              | 🛠 Custom Blot                       | ⬜ A implementar |
| **Preview PDF**           | ✅ Implementado na POC (html2pdf.js) | ✅ Implementado na POC (html2pdf.js) | ✅ Implementado na POC (html2pdf.js) | ✅ Validado      |
| **Export PDF**            | ✅ Implementado na POC (html2pdf.js) | ✅ Implementado na POC (html2pdf.js) | ✅ Implementado na POC (html2pdf.js) | ✅ Validado      |
| **Spell Check (browser)** | ✅ Implementado na POC               | ✅ Implementado na POC               | ✅ Implementado na POC               | ✅ Validado      |
| **Inserção de imagens**   | 🟢 Extensão Image (OSS)              | 🟢 ImageNode (playground)            | 🟢 Image embed nativo                | ⬜ A validar     |

### Status Atual da POC

**Já validado (✅):**

- Formatação ABNT (font, size, line-height, paragraph spacing, indent) — implementado com extensões customizadas para os 3 editores
- Preview PDF via modal com layout A4 — implementado com `html2pdf.js` + `createPortal`
- Export PDF via download — implementado com `html2pdf.js`
- Spell check do browser — `spellcheck="true"` funcional nos 3 editores

**A implementar (⬜):**

- **Merge Fields** — criar componentes visuais (badge/chip) para campos dinâmicos em cada editor
- **Page Break** — criar separador visual de quebra de página em cada editor
- **Inserção de imagens** — validar upload, exibição, resize e inclusão no export PDF

### Abordagem Técnica por Editor

#### Merge Fields

| Editor      | Abordagem                                                                                                           | Complexidade                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **Tiptap**  | Custom Node (extensão ProseMirror) com `atom: true` + `NodeViewRenderer` para renderizar React component como badge | Média                            |
| **Lexical** | Custom `DecoratorNode` que renderiza React component inline                                                         | Média                            |
| **Quill**   | Custom `Embed Blot` (extends `BlockEmbed` ou `Inline`) registrado no Parchment                                      | Média-Alta (API menos intuitiva) |

#### Page Break

| Editor      | Abordagem                                                                                  | Complexidade |
| ----------- | ------------------------------------------------------------------------------------------ | ------------ |
| **Tiptap**  | Custom Node baseado em `HorizontalRule` com CSS de página ou extensão `HardBreak` adaptada | Baixa-Média  |
| **Lexical** | Custom `DecoratorNode` que renderiza `<hr>` estilizado como separador de página            | Baixa-Média  |
| **Quill**   | Custom `BlockEmbed Blot` com render de `<div>` estilizado como separador                   | Média        |

#### Inserção de Imagens

| Editor      | Abordagem                                                                           | Complexidade                                    |
| ----------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Tiptap**  | Extensão `Image` (OSS) + `FileHandler` ou input customizado para upload             | Baixa                                           |
| **Lexical** | `ImageNode` adaptado do playground + upload handler                                 | Média (adaptar do playground)                   |
| **Quill**   | Image embed nativo + `quill-image-resize-module` (comunidade) ou resize customizado | Média (módulos v2 podem ter incompatibilidades) |

### Critério de Sucesso da POC

A POC será considerada **bem-sucedida** se for possível demonstrar, para **todos os 3 editores free**, que:

1. ✅ O editor renderiza texto formatado (fonte, tamanho, espaçamento, indentação)
2. ⬜ O editor permite inserir merge fields como elementos visuais atômicos
3. ⬜ O editor permite inserir quebras de página manuais com representação visual
4. ✅ O editor permite pré-visualizar o documento em layout A4 (preview PDF)
5. ✅ O editor permite exportar o conteúdo como PDF preservando formatação
6. ✅ O editor suporta spell check básico do navegador
7. ⬜ O editor permite inserir e redimensionar imagens

> **Se algum editor free não conseguir implementar alguma dessas features básicas, isso será um forte indicador de limitação técnica e deve pesar na decisão final.**

---

## Validation Criteria

- [ ] Todas as 7 features foram avaliadas para todos os 5 editores
- [ ] Cada célula da matriz está classificada com o tipo correto de suporte
- [ ] As features "Nativo" foram verificadas na documentação oficial de cada editor
- [ ] As features "Plugin Comunidade" foram verificadas em repositórios com manutenção ativa
- [ ] As features "Custom" foram avaliadas quanto à viabilidade técnica real
- [ ] A tabela comparativa final é legível e permite decisão rápida
- [ ] Recomendação final foi produzida
- [ ] POC prática validou as 7 features "simples" nos 3 editores free (Tiptap, Lexical, Quill)
- [ ] Features já implementadas na POC foram marcadas como ✅ Validado
- [ ] Features pendentes (Merge Fields, Page Break, Imagens) foram implementadas e testadas
- [ ] Resultado da POC prática foi documentado com evidências (screenshots ou descrição funcional)

---

## Assumptions

⚠ Inferido que "normas ABNT de documentos oficiais" refere-se principalmente à formatação de texto (fonte Times New Roman/Arial 12pt, espaçamento 1.5, margens 3cm superior/esquerda e 2cm inferior/direita), não ao template completo de trabalhos acadêmicos.

⚠ Inferido que "integração com editores de mercado" refere-se a import/export de arquivos (.docx, .odt) e paste preservando formatação, não à integração em tempo real com esses softwares.

⚠ Inferido que "preview da versão final do documento com as quebras de página" refere-se a uma visualização no próprio editor ou modal que mostre como o documento ficará quando impresso/exportado para PDF.

⚠ As versões avaliadas podem ter features adicionais lançadas após esta análise (CKEditor 48.x, TinyMCE 7.x, Tiptap 3.x, Lexical 0.42.x, Quill 2.0.3).

⚠ O suporte a .odt do Tiptap utiliza o serviço de conversão do Tiptap (Import/Export extensions) — pode ter limitações de fidelidade comparado a conversões nativas.

⚠ O spell check "🌐 Browser" depende do sistema operacional e navegador do usuário — funciona bem no Chrome/Edge/Firefox com dicionário pt-BR instalado, mas não oferece controle programático (dicionário custom, ignorar palavras, etc).

---

## Próximos Passos

1. **Implementar Merge Fields** nos 3 editores free (Tiptap, Lexical, Quill)
2. **Implementar Page Break** nos 3 editores free
3. **Validar Inserção de Imagens** (upload, resize, inclusão no PDF) nos 3 editores free
4. **Documentar resultados** de cada implementação com observações sobre dificuldade, limitações encontradas e qualidade do resultado
5. **Atualizar a Matriz de Validação POC** com o status final de cada feature/editor
6. **Produzir recomendação final** baseada na análise teórica + resultados práticos da POC
