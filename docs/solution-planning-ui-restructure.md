# Solution Planning — Reestruturação da UI (Editor Shell Unificado)

## Referência

- Problem: `docs/problem-rationalization-ui-restructure.md`

## Arquitetura

O projeto continua com Vite + React (frontend) + Express (backend). A reestruturação é 100% frontend — envolve a criação de um componente shell unificado que substitui o layout fragmentado anterior.

```
Antes:
  Page (header + description)
  └── EditorTemplate (toolbar + editor + FieldsPanel + TemplateSaveBar)

Depois:
  EditorShell (header + tabs + action bar + sidebar + composition)
  └── children = EditorTemplate (toolbar + editor APENAS)
```

Cada editor expõe um **handle** (`getEditorHtml` / `setEditorHtml`) via mutable ref, permitindo que o shell controle leitura/escrita do conteúdo sem acoplar à implementação interna do editor.

## Fase 1 — EditorShell (✅ Implementado)

### 1. Novo componente `EditorShell` (`src/components/EditorShell.tsx`)

Componente wrapper que recebe o editor como `children` e renderiza toda a casca:

- **Header**: título do editor + descrição contextual
- **Abas**: EDITOR / COMPOSIÇÃO — toggle interno (sem rotas separadas)
- **Barra de ações**: nome do documento editável inline (✏️), select de tipo (header/body/footer), botões (Visualizar PDF, Exportar PDF, Imprimir, Salvar)
- **Body**: grid `1fr 300px` com área do editor à esquerda e sidebar à direita
- **Sidebar "Campos Dinâmicos"**: grupos colapsáveis (accordion) com chevron ▾/▸, label + badge `{{id}}` + input

**Props:**
- `children` — toolbar + editor
- `getEditorHtml` / `setEditorHtml` — ponte com o editor via ref
- `printRef` — ref para impressão/PDF
- `useBadges` — flag para lógica de badges nos editores free
- `activeTemplate` / `onSaved` / `onNew` — gerenciamento de template ativo
- `editorName` / `editorDescription` — textos contextuais do header

**Comportamento chave:** merge fields são resolvidos **automaticamente** no momento de visualizar/exportar PDF — não existe mais botão "Aplicar valores".

### 2. Novo componente `CompositionTab` (`src/components/CompositionTab.tsx`)

Extraído do antigo `ComposePage.tsx`. Funcionalidade idêntica (selecionar header + N bodies + footer, preview, export PDF) — agora renderizado como conteúdo da aba COMPOSIÇÃO dentro do shell.

### 3. Refatoração dos 5 editores (handle pattern)

Cada editor template foi refatorado para:
- **Aceitar props** `printRef`, `initialContent`, `editorRef` (mutable ref)
- **Expor handle** via `editorRef.current = { getEditorHtml, setEditorHtml }`
- **Remover** FieldsPanel, TemplateSaveBar, wrapper `editor-with-panel`
- **Renderizar apenas** toolbar + área de edição dentro de `<div className="editor-wrapper">`

| Componente | Handle type | Mudanças |
|---|---|---|
| `TiptapTemplate.tsx` | `TiptapTemplateHandle` | Removido FieldsPanel, TemplateSaveBar, useSearchParams, activeTemplate state |
| `LexicalTemplate.tsx` | `LexicalTemplateHandle` | Removido FieldsPanel, wrappers `editor-with-panel` / `editor-main` |
| `QuillTemplate.tsx` | `QuillTemplateHandle` | Removido FieldsPanel, wrappers `editor-with-panel` / `editor-main` |
| `CKEditorTemplate.tsx` | `CKEditorTemplateHandle` | Adicionado handle pattern, printRef no `ck-editor-body`, usa `contentToUse` |
| `TinyMCETemplate.tsx` | `TinyMCETemplateHandle` | Adicionado handle pattern, printRef no `editor-wrapper`, usa `contentToUse` |

### 4. Refatoração das 5 pages

Cada page agora:
- Cria `printRef` e `editorRef`
- Renderiza `<EditorShell>` passando props + `<EditorTemplate>` como children
- Gerencia `activeTemplate` state (TiptapPage mantém carregamento via `?templateId=`)

### 5. Alterações em `App.tsx`

- Removida rota `/compose` (agora é aba dentro do shell)
- Removido link de navegação "🧩 Compor"
- Removida importação de `ComposePage`

### 6. CSS adicionado (`src/index.css`)

~300 linhas de estilos para:
- `.editor-shell`, `.shell-header`, `.shell-tabs`, `.shell-tab`
- `.shell-action-bar`, `.shell-doc-name`, `.shell-doc-name-input`, `.shell-type-select`
- `.shell-btn` variantes (preview, export, print, save, new)
- `.shell-body`, `.shell-editor-area`, `.shell-sidebar`
- `.shell-sidebar-header`, `.shell-sidebar-title`
- `.shell-field-group`, `.shell-group-toggle`, `.shell-chevron`
- `.shell-field-row`, `.shell-field-header`, `.shell-field-label`, `.shell-field-badge`, `.shell-field-input`
- `.composition-tab`
- Responsivo (`@media max-width: 1024px`)

---

## Fase 2 — Seções e campos dinâmicos na sidebar (✅ Implementado)

### Problema

Atualmente os campos dinâmicos vêm de uma constante estática `MERGE_FIELDS` em `mergeFieldsConfig.ts`. Não há como o usuário adicionar novas seções (grupos) ou novos campos pela UI. O botão **+** previsto no mockup ainda não foi implementado.

### Plano de implementação

#### 2.1. Novo hook `useCustomFields` (`src/hooks/useCustomFields.ts`)

Hook que gerencia estado local de campos customizados (sessão), separado dos campos padrão.

```typescript
interface CustomField {
  id: string;        // gerado a partir do label (slug)
  label: string;
  defaultValue: string;
  group: string;
}

interface UseCustomFieldsReturn {
  customFields: CustomField[];
  customGroups: string[];
  addGroup: (groupName: string) => void;
  removeGroup: (groupName: string) => void;
  addField: (field: CustomField) => void;
  removeField: (fieldId: string) => void;
  getAllFieldsByGroup: () => Map<string, MergeFieldDefinition[]>;
  // ^ mescla MERGE_FIELDS estáticos + customFields
}
```

- Estado gerenciado com `useState` (sessão local, sem persistência no backend por ora)
- `getAllFieldsByGroup()` mescla os campos padrão de `mergeFieldsConfig.ts` com os campos custom, retornando o Map unificado
- Gera `id` automaticamente a partir do `label` com slugify (ex: "Nome Fantasia" → `nome_fantasia`)

#### 2.2. Botão "+ Seção" no header da sidebar

- Botão posicionado ao lado do título "Campos Dinâmicos"
- Ao clicar: abre formulário inline **dentro da sidebar** com:
  - Input "Nome da seção" (ex: "Endereço")
  - Botões "Criar" / "Cancelar"
- Ao criar: adiciona grupo vazio colapsado na lista

#### 2.3. Botão "+ Campo" dentro de cada seção

- Dentro de cada grupo expandido (incluindo os padrão), um botão "+ Campo" no final da lista de campos
- Ao clicar: abre formulário inline com:
  - Input "Label do campo" (ex: "CEP")
  - Input "Valor padrão" (ex: "00000-000")
  - Botões "Adicionar" / "Cancelar"
- O `id` é gerado automaticamente: `label.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')`
- Badge `{{id}}` exibido automaticamente após criação
- Campo adicionado ao estado local + ao `values` do `useFieldValues`

#### 2.4. Remoção de seções e campos custom

- Seções custom: botão 🗑️ no header do grupo (visível apenas para grupos custom, não para Pessoa/Documento/Empresa)
- Campos custom: botão ✕ pequeno ao lado do input (visível apenas para campos custom)
- Confirmação via tooltip/popover simples antes de remover

#### 2.5. Integração com `replaceMergeFields`

- A função `replaceMergeFields` no EditorShell já itera sobre `MERGE_FIELDS` + `values`
- Precisa ser atualizada para também iterar sobre campos custom
- Os campos custom são adicionados ao mesmo `values` state do `useFieldValues`, então a substituição funciona automaticamente para `{{}}` placeholders
- Para badges (`useBadges=true`), campos custom serão apenas `{{id}}` (sem badge `<span>` no editor, pois os editores free usam badge nodes que dependem do config estático)

#### 2.6. Alterações no EditorShell

- Importar e usar `useCustomFields`
- Substituir `getFieldsByGroup()` por `getAllFieldsByGroup()` do hook
- Adicionar UI dos formulários inline (adicionar seção, adicionar campo)
- Propagar novos campos para o `values` state

### Arquivos impactados

| Arquivo | Alteração |
|---|---|
| `src/hooks/useCustomFields.ts` | **Novo** — hook para gerenciar campos custom |
| `src/components/EditorShell.tsx` | Integrar `useCustomFields`, adicionar botões + formulários inline |
| `src/index.css` | Estilos para formulários inline, botões de ação na sidebar |

### Restrições

- Campos custom são **sessão local** — não persistidos no backend nesta fase
- Seções padrão (Pessoa, Documento, Empresa) **não podem ser removidas**
- Campos padrão **não podem ser removidos**
- `id` do campo custom deve ser único — validar antes de criar
- Campos custom inseridos no editor usam `{{id}}` como placeholder de texto, **não** como badge node (simplificação para esta fase)

### Critérios de validação

- Botão "+ Seção" cria novo grupo vazio na sidebar
- Botão "+ Campo" dentro de qualquer grupo adiciona campo com label, id auto-gerado e input de valor
- Badge `{{id}}` aparece automaticamente no header do campo
- Valores de campos custom são resolvidos no PDF preview/export
- Seções e campos custom podem ser removidos (com confirmação)
- Seções padrão não mostram botão de remoção

---

## Fase 2.5 — Campos custom disponíveis no dropdown "Inserir Campo" dos editores (✅ Implementado)

### Problema

A Fase 2 adicionou a capacidade de criar seções e campos custom na sidebar, mas esses campos **não aparecem** no dropdown "Inserir Campo" dentro dos editores. Isso porque:

1. O `MergeFieldDropdown` (usado por Tiptap, Lexical, Quill) chama `getFieldsByGroup()` diretamente — que lê apenas o `MERGE_FIELDS` estático
2. Os editores CKEditor e TinyMCE usam `getCKEditorMergeFieldsConfig()` / `getTinyMCEMergeTagsList()` — também estáticos
3. Não existe canal de comunicação entre o `useCustomFields` hook (no EditorShell) e os componentes de editor filhos

### Ajuste visual

- Botão "+ Seção" na sidebar: trocar de texto `+ Seção` com borda dashed para **botão redondo com `+` branco sobre fundo verde** (mais compacto e alinhado ao feedback do usuário)

### Plano de implementação

#### 2.5.1. Novo Context `MergeFieldsContext` (`src/contexts/MergeFieldsContext.tsx`)

Criar um React Context que expõe o `Map<string, MergeFieldDefinition[]>` unificado (padrão + custom) para toda a árvore de componentes abaixo do EditorShell.

```typescript
interface MergeFieldsContextValue {
  fieldsByGroup: Map<string, MergeFieldDefinition[]>;
}
```

- **Provider** renderizado dentro do `EditorShell`, envolvendo o `children` e a sidebar
- O value é o resultado de `getAllFieldsByGroup()` do hook `useCustomFields` (já existente)

#### 2.5.2. Atualização do `MergeFieldDropdown`

- Importar e consumir `MergeFieldsContext` via `useContext`
- Remover importação direta de `getFieldsByGroup`
- Usar `context.fieldsByGroup` no lugar de `getFieldsByGroup()`
- Se o context não estiver disponível (fallback), usar `getFieldsByGroup()` como antes

#### 2.5.3. Ajuste visual do botão "+ Seção"

- Trocar texto "**+ Seção**" por apenas "**+**"
- CSS: fundo verde (`#27ae60`), texto branco, `border-radius: 50%`, `width/height: 26px`
- Hover: fundo mais escuro (`#219a52`)

### Arquivos impactados

| Arquivo | Alteração |
|---|---|
| `src/contexts/mergeFieldsContext.ts` | **Novo** — context + hook `useMergeFields()` com fallback |
| `src/contexts/MergeFieldsProvider.tsx` | **Novo** — Provider component (separado para Vite Fast Refresh) |
| `src/components/EditorShell.tsx` | Envolver children com `MergeFieldsProvider`, remover import `MERGE_FIELDS` |
| `src/components/merge-fields/MergeFieldDropdown.tsx` | Consumir context em vez de `getFieldsByGroup()` |
| `src/index.css` | Ajuste visual do botão "+ Seção" (fundo verde, redondo) |

### Restrições

- CKEditor e TinyMCE **não serão afetados** nesta fase — eles usam config nativo do plugin, que é passado na inicialização do editor e não pode ser atualizado dinamicamente sem recriação do editor. Campos custom nesses editores continuam sendo inseridos manualmente como `{{id}}`
- A abordagem via Context é leve e não exige mudança nas props dos 5 editores

### Critérios de validação

- Campos custom criados na sidebar aparecem no dropdown "Inserir Campo" de Tiptap, Lexical e Quill
- Ao clicar em um campo custom no dropdown, o placeholder `{{id}}` é inserido no editor
- Valores dos campos custom são resolvidos automaticamente no PDF preview/export
- Botão "+ Seção" aparece como círculo verde com "+" branco
- Dropdown não quebra se o context não estiver disponível (fallback graceful)

---

## Histórico de correções

### Fix: substituição de badges de campos custom no PDF preview (Fase 2.5)

**Problema:** campos custom inseridos via dropdown no Tiptap/Lexical/Quill geravam badges `<span data-type="merge-field" data-field-id="...">`, mas a função `replaceMergeFields` só iterava sobre `MERGE_FIELDS` (constante estática) na etapa de substituição de badges DOM. Resultado: badges de campos custom apareciam crus no PDF preview.

**Causa raiz:**
1. O loop de substituição de `{{placeholder}}` já usava `allFields` (padrão + custom), mas montava a lista de forma redundante com `filter(isCustomField)`
2. O loop de substituição de badges DOM (`querySelectorAll`) iterava **apenas** sobre `MERGE_FIELDS` estático — campos custom eram ignorados

**Correção:**
- Unificou `allFields` como `Array.from(fieldsByGroup.values()).flat()` — obtém todos os campos (padrão + custom) de uma só vez, sem duplicação
- Alterou o loop de substituição de badges para iterar sobre `allFields` em vez de `MERGE_FIELDS`
- Removeu import não utilizado de `MERGE_FIELDS` do EditorShell

**Arquivos alterados:**
- `src/components/EditorShell.tsx` — função `replaceMergeFields`

---

## Fase 3 — Repetição automática de Header/Footer em page breaks (✅ Implementado)

### Problema

Quando o usuário insere page breaks no corpo do documento, o PDF gerado quebra a página mas **não** repete o header e o footer nas páginas subsequentes. Em documentos oficiais (declarações, contratos, relatórios) é comum que todas as páginas carreguem o cabeçalho e rodapé da empresa/documento.

Atualmente o header e o footer só existem na aba de **Composição** (onde o documento final é montado a partir de templates salvos). Não há mecanismo que injete essas partes automaticamente em cada "página lógica" separada por page breaks.

### Escopo

Repetição de header/footer **apenas** em page breaks explícitos (inseridos pelo usuário). Overflow automático (conteúdo longo que gera múltiplas páginas) **não é tratado** nesta fase — o `html2pdf.js` fatia o canvas por pixels e não há hook confiável para injetar conteúdo entre páginas geradas por overflow.

### Conceito

Toggle **"Repetir Header/Footer nas páginas"** na aba de Composição. Quando habilitado:

1. O sistema identifica todos os page breaks no HTML dos bodies
2. Divide o conteúdo em **segmentos** (um por página lógica)
3. Envolve cada segmento com o header selecionado no topo e o footer selecionado no final
4. Insere page break markers entre cada bloco `header + segmento + footer`

Se **não houver page breaks**, o toggle não tem efeito — documento segue como header + bodies + footer em sequência normal.

### Plano de implementação

#### 3.1. Novo estado `repeatHeaderFooter` na `CompositionTab`

```typescript
const [repeatHeaderFooter, setRepeatHeaderFooter] = useState(false);
```

- Toggle tipo switch na seção de ações da Composição
- Label: **"Repetir cabeçalho e rodapé em todas as páginas"**
- Só é habilitável quando um header **ou** footer está selecionado
- Visualmente: toggle switch com label descritivo

#### 3.2. Nova função `composeWithPageHeaders`

Função utilitária dentro da CompositionTab:

```typescript
function composeWithPageHeaders(
  bodyHtml: string,
  headerHtml: string | null,
  footerHtml: string | null,
): string
```

1. Recebe o HTML dos bodies concatenados (que pode conter page breaks)
2. Faz split do HTML nos elementos de page break usando DOMParser
3. Para cada segmento resultante, monta:
   ```html
   <div class="composed-page">
     <div class="composed-header">{headerHtml}</div>
     <div class="composed-body">{segmento}</div>
     <div class="composed-footer">{footerHtml}</div>
   </div>
   <!-- page break marker -->
   ```
4. Retorna o HTML final com todas as páginas montadas

#### 3.3. Alteração no `getComposedHtml`

- Se `repeatHeaderFooter === false` **ou** não houver page breaks: comportamento atual (header + bodies + footer em sequência)
- Se `repeatHeaderFooter === true` **e** houver page breaks: chama `composeWithPageHeaders`

#### 3.4. CSS para `.composed-page`

Estilos para garantir que cada "página lógica" tenha layout correto:
- Header fixo no topo do bloco
- Footer fixo no final do bloco
- Body ocupando o espaço restante
- Page break entre cada `.composed-page`

### Arquivos impactados

| Arquivo | Alteração |
|---|---|
| `src/components/CompositionTab.tsx` | Toggle `repeatHeaderFooter`, lógica `composeWithPageHeaders`, UI do switch |
| `src/index.css` | Estilos para `.composed-page`, toggle switch |

### Restrições

- A funcionalidade opera **apenas** na aba de Composição — não afeta o editor individual
- Page breaks são detectados via `.page-break` class e `data-type="page-break"` attribute
- Sem page breaks = sem repetição (toggle não tem efeito)
- O header/footer precisam estar selecionados para o toggle ter efeito
- Overflow automático (conteúdo longo sem page breaks) **não é tratado** — descartado por limitação do html2pdf.js

### Critérios de validação

- Toggle aparece na aba de Composição, desabilitado quando não há header/footer selecionado
- Com toggle **desligado**: comportamento idêntico ao atual
- Com toggle **ligado** e page breaks no body:
  - Cada "página" no preview/PDF tem header no topo e footer no final
  - Page breaks entre cada bloco page-header-footer
- Com toggle **ligado** e **sem** page breaks: documento normal (toggle sem efeito)
- Preview e Export PDF respeitam a flag igualmente
