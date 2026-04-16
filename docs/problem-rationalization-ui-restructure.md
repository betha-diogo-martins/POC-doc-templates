# Reestruturação da UI — Editor Shell Unificado

## Problem
A UI atual distribui funcionalidades de forma fragmentada entre múltiplos componentes (`FieldsPanel`, `TemplateSaveBar`, editor pages individuais, `ComposePage`). O resultado é uma experiência dispersa onde o usuário precisa navegar entre diferentes páginas para editar, salvar, compor e gerenciar campos dinâmicos.

A nova UI proposta na imagem de referência consolida tudo em um **shell único** que envolve qualquer editor de texto. Esse shell deve ser reutilizado por todos os editores (Tiptap, Lexical, Quill, CKEditor, TinyMCE) — a única coisa que muda é a toolbar + área de edição do editor em si.

### Mudanças identificadas na imagem:

**1. Layout reorganizado:**
- Página "Editor de documentos" com título e descrição contextual no topo
- Duas abas internas: **EDITOR** e **COMPOSIÇÃO** (dentro da mesma página, não rotas separadas)
- Nome do documento editável inline (com ícone de lápis ✏️), na mesma linha dos botões de ação

**2. Barra de ações no topo do editor:**
- Nome do documento à esquerda com ícone de edição
- Botões à direita: **VISUALIZAR PDF** (verde), **EXPORTAR / IMPRIMIR** (azul escuro), **SALVAR PDF** (verde escuro)

**3. Sidebar direita — "Campos Dinâmicos":**
- Título "Campos Dinâmicos" com botão **+** (azul, circular) para adicionar novo campo/grupo
- Grupos colapsáveis (ex: Pessoa, Documento, Empresa) com chevron ˅/˄ para expandir/colapsar
- Dentro de cada grupo expandido: label do campo + badge `{{campo}}` + input de valor com placeholder "Ex.: John Doe"
- Visual mais limpo e compacto

**4. Área central:**
- Toolbar do editor (NÃO muda — mantém a toolbar específica de cada editor)
- Área de edição do rich text editor abaixo

## Expected Output

### 1. Novo componente `EditorShell` (`src/components/EditorShell.tsx`)
Componente wrapper que recebe o editor como `children` e renderiza toda a casca ao redor:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Editor de documentos                                               │
│  Crie um documento novo ou edite um existente...                    │
│  [EDITOR]  [COMPOSIÇÃO]                                            │
├─────────────────────────────────────────────────────────────────────┤
│  Documento 1 ✏️           [Visualizar PDF] [Exportar] [Salvar]      │
├──────────────────────────────────────────────┬──────────────────────┤
│                                              │ Campos Dinâmicos [+] │
│  [Toolbar do editor — NÃO TOCA]             │                      │
│  [───────────────────────────]               │ ˅ Pessoa             │
│                                              │   Nome {{nome}}      │
│  [Área de edição — NÃO TOCA]                │   [______________]   │
│                                              │   Cargo {{cargo}}    │
│                                              │   [______________]   │
│                                              │                      │
│                                              │ ˃ Documento          │
│                                              │ ˃ Empresa            │
└──────────────────────────────────────────────┴──────────────────────┘
```

**Props do EditorShell:**
- `children` — toolbar + editor (cada editor passa seu conteúdo)
- `getEditorHtml` / `setEditorHtml` — funções de ponte com o editor
- `printRef` — ref para impressão/PDF
- `useBadges` — flag para lógica de badges nos campos
- `activeTemplate` / `onSaved` / `onNew` — gerenciamento de template ativo

### 2. Sidebar "Campos Dinâmicos" (refatorada)
- Cada grupo (Pessoa, Documento, Empresa) é um **accordion colapsável**
- Chevron para expandir/colapsar
- Dentro do grupo: label + badge `{{id}}` + input com placeholder
- Botão **+** no header abre um mini-formulário para criar novo campo (grupo, label, id)

### 3. Aba "Composição" integrada
- A funcionalidade da `ComposePage` atual é integrada como aba **dentro do shell**
- Quando aba COMPOSIÇÃO está ativa → mostra a interface de composição (header + N bodies + footer)
- Quando aba EDITOR está ativa → mostra o editor + sidebar de campos

### 4. Simplificação das Pages
- Cada page (`TiptapPage`, `LexicalPage`, etc.) renderiza `<EditorShell>` passando o editor como children
- Remove a duplicação entre pages — o shell é a casca comum

## Validation Criteria
- O layout final se aproxima visualmente da imagem de referência
- `EditorShell` é reutilizado por todos os 5 editores
- Grupos na sidebar são colapsáveis com transição suave
- Nome do documento é editável inline na barra superior
- Botões de ação estão posicionados no topo à direita
- Abas EDITOR / COMPOSIÇÃO funcionam como toggle dentro da mesma página
- Botão **+** permite adicionar novos campos dinâmicos
- Toolbar e editor de texto de cada editor **NÃO são alterados**

## Assumptions
⚠ Inferido que "SALVAR PDF" na imagem se refere a salvar o template no MongoDB (persistência), não gerar um arquivo PDF — o label será ajustado para "✅ SALVAR" com estilo verde escuro.

⚠ Inferido que a aba COMPOSIÇÃO substitui a área central inteira (editor + sidebar) pela interface de composição de templates.

⚠ Inferido que o botão **+** na sidebar abre um formulário inline para definir grupo, label e id do novo campo — campo adicionado à sessão local, sem persistência no backend por ora.

⚠ Inferido que o header global do `App.tsx` (navegação entre editores) **permanece** — o `EditorShell` é apenas o conteúdo de cada rota, não substitui o layout raiz.

⚠ Inferido que o tipo do template (header/body/footer) será integrado junto ao nome do documento na barra superior (como um select/badge ao lado do nome).

## Comportamentos explícitos (validados com o usuário)

✅ Os botões "Aplicar valores" e "Resetar template" são **removidos** da sidebar. Os valores dos merge fields são resolvidos **automaticamente** no momento de visualizar/exportar o PDF — ao clicar em "Visualizar PDF" ou "Exportar/Imprimir", o sistema substitui os placeholders `{{campo}}` (e badges) pelos valores preenchidos na sidebar antes de gerar a visualização. O editor em si continua exibindo os badges/placeholders normalmente.

---

Interpretação validada. Pronto para implementação.
