# POC — Avaliação de Extensibilidade dos Editores Rich Text (Tiptap, Lexical, Quill)

## Problem

Na segunda iteração da POC, validamos que **Tiptap** (MIT), **Lexical** (MIT) e **Quill** (BSD 3-Clause) atendem os requisitos principais para criação de templates de documentos com campos dinâmicos (merge fields) e exportação para PDF, utilizando licenças permissivas compatíveis com software proprietário.

Agora precisamos responder uma pergunta crítica antes de recomendar um editor para adoção: **quão extensíveis são esses editores?**

Em um cenário de produção, a criação de templates de documentos provavelmente exigirá funcionalidades além das oferecidas "out of the box". Exemplos de componentes que poderiam ser necessários:

- **Blocos de assinatura** — componente customizado que renderiza nome, cargo e linha de assinatura
- **Campos condicionais** — conteúdo que aparece/desaparece baseado em regras (ex: "se o cliente é PJ, mostrar CNPJ")
- **Tabelas dinâmicas** — tabela que gera linhas automaticamente a partir de uma lista de dados
- **Blocos de endereço** — componente estruturado com CEP, rua, cidade, estado formatados
- **Blocos de imagem com metadados** — imagem com legenda, alt text, e alinhamento configuráveis
- **Componentes interativos no editor** — datepickers, dropdowns, checkboxes inline que se tornam texto estático no PDF final

### O que precisa ser avaliado

1. **Arquitetura de extensão**: Cada editor possui um modelo diferente para extensibilidade. Qual é a abordagem arquitetural de cada um? Quão profundamente se pode customizar?
2. **Dificuldade de implementação**: Qual é o esforço (complexidade, LOC, boilerplate) necessário para adicionar um componente novo a cada editor?
3. **Suporte a React**: Como cada editor integra componentes React customizados dentro do conteúdo editável?
4. **Serialização**: Como os componentes customizados são serializados/desserializados (HTML, JSON)? Isso é crucial para persistência e geração de PDF.
5. **Documentação e ecossistema**: Quão bem documentadas são as APIs de extensão? Existe uma comunidade ativa criando extensões?

### Funcionalidades a implementar na próxima iteração (validação prática)

Além da análise teórica de extensibilidade, as seguintes funcionalidades devem ser **implementadas nos 3 editores** para validação prática:

6. **Formatação avançada (Parágrafos, indentação e espaçamento)**: Avaliar o suporte de cada editor para controle fino de formatação de texto — espaçamento entre parágrafos (margin/padding), indentação de primeira linha e de bloco, e line-height. Essas configurações são essenciais para templates de documentos profissionais que precisam seguir normas de formatação (ex: ABNT, padrões jurídicos). Pontos a avaliar:
   - Indentação de parágrafo (primeira linha e bloco inteiro)
   - Espaçamento entre parágrafos (antes/depois)
   - Espaçamento entre linhas (line-height: simples, 1.5, duplo)
   - Se o editor oferece isso nativamente ou requer extensão customizada
   - Grau de controle que o usuário final tem sobre essas propriedades

7. **Preview do formato final (Preview do PDF)**: Implementar um modo de visualização que mostre ao usuário como o documento ficará no PDF final **antes** da exportação. Isso é crítico para a experiência do usuário, pois evita ciclos de "exportar → verificar → voltar a editar". Pontos a avaliar:
   - Viabilidade de renderizar o conteúdo em um layout paginado (simulando páginas A4)
   - Fidelidade entre o preview e o PDF gerado pelo `html2pdf.js`
   - Experiência do usuário (modal, painel lateral, toggle de modo)
   - Performance da renderização do preview com documentos longos

8. **Corretor ortográfico**: Avaliar o suporte de cada editor para verificação ortográfica. O navegador já oferece spellcheck nativo via atributo `spellcheck="true"` em elementos `contenteditable`, mas precisamos entender:
   - Se o spellcheck nativo do browser funciona corretamente com cada editor
   - Se é necessária configuração adicional ou se funciona "out of the box"
   - Se existem extensões/plugins para correção ortográfica mais avançada (gramática, sugestões contextuais)
   - Limitações do spellcheck nativo (idioma, dicionários customizados)
   - Possibilidade de integração com APIs externas de correção (ex: LanguageTool, que é open-source)

---

## Expected Output

Um **documento de análise comparativa de extensibilidade** contendo:

### 1. Mapa arquitetural de extensão de cada editor

| Aspecto                                | Tiptap                                                                            | Lexical                                                                         | Quill                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Modelo de dados**                    | ProseMirror Document (árvore de nodes)                                            | EditorState (árvore imutável de LexicalNodes)                                   | Delta (formato operacional OT)                                    |
| **Unidades de extensão**               | Extensions, Nodes, Marks                                                          | Custom Nodes (ElementNode, TextNode, DecoratorNode), Plugins, Commands          | Blots (via Parchment), Modules                                    |
| **Custom Nodes (block)**               | `Node.create({ ... })` com `renderHTML`/`parseHTML`                               | Extends `ElementNode` com `createDOM`/`updateDOM`                               | Extends `BlockEmbed` com `static create`/`static value`           |
| **Custom Nodes (inline)**              | `Node.create({ inline: true })` — ex: Mention                                     | Extends `TextNode` ou `DecoratorNode` inline                                    | Extends `Inline` ou `Embed`                                       |
| **Componentes React dentro do editor** | ✅ Node Views com `ReactNodeViewRenderer` — renderiza componentes React completos | ✅ `DecoratorNode.decorate()` retorna JSX, renderizado via `React.createPortal` | ❌ Não possui suporte nativo — manipulação direta do DOM          |
| **Serialização customizada**           | `renderHTML()` / `parseHTML()` no node + JSON automático                          | `exportJSON()` / `importJSON()` / `createDOM()` no node                         | `static create()` / `static value()` / `static formats()` no Blot |
| **Sistema de comandos**                | Comandos via `addCommands()` no extension                                         | `createCommand()` + `registerCommand()` com sistema de prioridades              | API imperativa (`quill.insertEmbed()`, `quill.format()`)          |
| **Toolbar customizada**                | Livre — toolbar é componente React separado                                       | Livre — toolbar é plugin React com `useLexicalComposerContext`                  | Configuração via objeto `modules.toolbar`                         |
| **Plugins/módulos**                    | Extensions são plugins (addons ao editor)                                         | React components como children de `<LexicalComposer>`                           | Classes registradas via `Quill.register()`                        |

### 2. Complexidade para adicionar um componente customizado

#### Tiptap — Criar um Custom Node (ex: bloco de assinatura)

```typescript
// ~30-50 LOC para o Node
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SignatureComponent } from "./SignatureComponent";

const SignatureNode = Node.create({
  name: "signatureBlock",
  group: "block",
  atom: true, // não tem conteúdo editável interno

  addAttributes() {
    return {
      name: { default: "" },
      role: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signature-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "signature-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SignatureComponent); // Componente React completo!
  },

  addCommands() {
    return {
      insertSignature:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },
});
```

**Pontos fortes**: API declarativa e concisa. `ReactNodeViewRenderer` permite renderizar qualquer componente React dentro do editor. O node é registrado como extensão, e o editor gerencia ciclo de vida, seleção, undo/redo automaticamente.

**Boilerplate estimado**: ~30-50 LOC para o Node + componente React à parte.

#### Lexical — Criar um Custom Node (ex: bloco de assinatura)

```typescript
// ~60-80 LOC para o Node
import { DecoratorNode, LexicalNode, NodeKey, $applyNodeReplacement } from 'lexical'
import { SignatureComponent } from './SignatureComponent'

export class SignatureNode extends DecoratorNode<React.ReactNode> {
  __name: string
  __role: string

  static getType(): string {
    return 'signature-block'
  }

  static clone(node: SignatureNode): SignatureNode {
    return new SignatureNode(node.__name, node.__role, node.__key)
  }

  static importJSON(serializedNode: any): SignatureNode {
    return new SignatureNode(serializedNode.name, serializedNode.role)
  }

  constructor(name: string = '', role: string = '', key?: NodeKey) {
    super(key)
    this.__name = name
    this.__role = role
  }

  exportJSON() {
    return { ...super.exportJSON(), type: 'signature-block', name: this.__name, role: this.__role }
  }

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  updateDOM(): false {
    return false
  }

  decorate(): React.ReactNode {
    return <SignatureComponent name={this.__name} role={this.__role} />
  }

  // Getters/Setters com getWritable()/getLatest()
  getName(): string { return this.getLatest().__name }
  setName(name: string): this { const self = this.getWritable(); self.__name = name; return self }
  getRole(): string { return this.getLatest().__role }
  setRole(role: string): this { const self = this.getWritable(); self.__role = role; return self }
}

// Plugin + Comando (~20 LOC adicionais)
export const INSERT_SIGNATURE_COMMAND = createCommand<{ name: string; role: string }>()

export function SignaturePlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand(INSERT_SIGNATURE_COMMAND, (payload) => {
      const node = $createSignatureNode(payload.name, payload.role)
      $insertNodeToNearestRoot(node)
      return true
    }, COMMAND_PRIORITY_EDITOR)
  }, [editor])
  return null
}
```

**Pontos fortes**: Arquitetura robusta com imutabilidade. `DecoratorNode` suporta React via portals nativamente. Sistema de comandos com prioridades permite composição sofisticada. `$config` + `NodeState` (v0.33+) reduz boilerplate significativamente.

**Boilerplate estimado**: ~60-80 LOC para o Node + ~20 LOC para o Plugin/Command + componente React à parte.

#### Quill — Criar um Custom Blot (ex: bloco de assinatura)

```javascript
// ~30-40 LOC para o Blot — mas sem suporte React
const BlockEmbed = Quill.import("blots/block/embed");

class SignatureBlot extends BlockEmbed {
  static blotName = "signature-block";
  static tagName = "div";
  static className = "signature-block";

  static create(value) {
    const node = super.create();
    node.dataset.name = value.name || "";
    node.dataset.role = value.role || "";
    // Renderização imperativa — sem React!
    node.innerHTML = `
      <div class="signature-name">${value.name}</div>
      <div class="signature-role">${value.role}</div>
      <div class="signature-line">___________________________</div>
    `;
    return node;
  }

  static value(domNode) {
    return {
      name: domNode.dataset.name,
      role: domNode.dataset.role,
    };
  }
}

Quill.register(SignatureBlot);

// Uso:
quill.insertEmbed(index, "signature-block", { name: "João", role: "Gerente" });
```

**Pontos fortes**: API simples e direta. Blots são leves. Bom para componentes estáticos simples.

**Limitações críticas**: Sem suporte a React dentro do editor. Componentes interativos (dropdowns, datepickers) requerem manipulação manual do DOM dentro do Blot, sem lifecycle do React, sem estado reativo. Isso torna componentes complexos significativamente mais difíceis de implementar e manter.

**Boilerplate estimado**: ~30-40 LOC para o Blot — mas complexidade aumenta exponencialmente para componentes interativos.

### 3. Tabela comparativa de complexidade

| Cenário                                               | Tiptap                                  | Lexical                                                         | Quill                                             |
| ----------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| **Node estático simples** (ex: divider)               | 🟢 ~15 LOC                              | 🟡 ~30 LOC                                                      | 🟢 ~10 LOC                                        |
| **Node com atributos** (ex: signature block)          | 🟢 ~35 LOC                              | 🟡 ~60 LOC                                                      | 🟢 ~30 LOC                                        |
| **Node com React interativo** (ex: datepicker inline) | 🟢 ~40 LOC + componente React           | 🟢 ~70 LOC + componente React                                   | 🔴 Sem suporte nativo — manipulação DOM manual    |
| **Serialização HTML bidirecional**                    | 🟢 `renderHTML`/`parseHTML` declarativo | 🟡 `createDOM`/`exportJSON`/`importJSON` manual                 | 🟢 `create`/`value` simples                       |
| **Integração com toolbar**                            | 🟢 Trivial — `addCommands()`            | 🟢 Sistema de comandos flexível                                 | 🟡 API imperativa, menos composável               |
| **Undo/Redo com custom nodes**                        | 🟢 Automático via ProseMirror           | 🟢 Automático via EditorState imutável                          | 🟡 Automático via Delta                           |
| **Curva de aprendizado para extensões**               | 🟢 Baixa — API de alto nível            | 🟡 Média — conceitos de imutabilidade, EditorState, $ functions | 🟢 Baixa — Parchment/Blots simples, mas limitados |

### 4. Documentação e ecossistema

| Aspecto                     | Tiptap                                                                           | Lexical                                                           | Quill                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Docs de extensibilidade** | ✅ Excelente — guias dedicados para extend, create new, node views, com exemplos | ✅ Bom — docs de Nodes, Plugins, Commands com exemplos TypeScript | 🟡 Adequado — "Cloning Medium with Parchment" é o guia principal, sem docs separados de API |
| **Exemplos oficiais**       | ✅ `awesome-tiptap` repo + exemplos na doc                                       | ✅ `lexical-playground` é referência completa com ~30 plugins     | 🟡 Playground básico, poucos exemplos de extensão                                           |
| **GitHub Stars**            | ~30k                                                                             | ~22k                                                              | ~44k                                                                                        |
| **npm downloads/semana**    | ~1M (`@tiptap/core`)                                                             | ~700k (`lexical`)                                                 | ~500k (`quill`)                                                                             |
| **Comunidade de extensões** | ✅ Grande — muitas extensões da comunidade                                       | ✅ Crescente — Meta mantém ativamente                             | 🟡 Estável mas menos ativa para extensões modernas                                          |
| **TypeScript support**      | ✅ Nativo, tipagem forte                                                         | ✅ Nativo, tipagem forte                                          | 🔴 Tipos via `@types/quill`, wrapper `react-quill-new`                                      |
| **Manutenção**              | ✅ Ativa (Tiptap GmbH)                                                           | ✅ Muito ativa (Meta)                                             | 🟡 v2.0 lançado recentemente, mas releases menos frequentes                                 |
| **CLI para extensões**      | ✅ `npm init tiptap-extension` — scaffold de extensão                            | ❌ Não possui                                                     | ❌ Não possui                                                                               |

### 5. Capacidades avançadas de extensibilidade

| Capacidade                               | Tiptap                                                   | Lexical                                                | Quill                                                  |
| ---------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| **Extend extensão existente**            | ✅ `.extend()` em qualquer extensão — herança composável | ✅ Node Replacement — substitui tipo de node existente | 🟡 Possível via herança de Blots mas pouco documentado |
| **Node Views interativos (React)**       | ✅ `ReactNodeViewRenderer` — primeira classe             | ✅ `DecoratorNode.decorate()` — primeira classe        | ❌ Não suportado                                       |
| **Editable content dentro do node**      | ✅ Mixed content — editável + não-editável               | 🟡 Possível via `ElementNode` mas mais complexo        | ❌ Embed é void, sem conteúdo editável interno         |
| **Mark customizado** (formatação inline) | ✅ `Mark.create()`                                       | 🟡 Via `TextNode` customizado                          | 🟢 `Inline` blot simples                               |
| **Keyboard shortcuts customizados**      | ✅ `addKeyboardShortcuts()`                              | ✅ Via `KEY_*_COMMAND` com prioridades                 | 🟢 Módulo Keyboard                                     |
| **Input rules** (autoformatação)         | ✅ `addInputRules()`                                     | 🟡 Possível mas manual                                 | 🟡 Possível mas manual                                 |
| **Collaboration (CRDT)**                 | ✅ Via Hocuspocus / Yjs                                  | ✅ Via `@lexical/yjs`                                  | 🟡 Via Yjs (menos integrado)                           |
| **Headless mode** (server-side)          | ✅ Pode rodar sem DOM                                    | 🟡 Precisa de DOM mínimo (jsdom)                       | 🔴 Precisa de DOM                                      |

---

## Validation Criteria

- [ ] As três arquiteturas de extensão estão **documentadas e comparadas** com exemplos de código
- [ ] A complexidade para adicionar um componente customizado está **quantificada** (LOC, boilerplate) para cada editor
- [ ] O suporte a **React dentro do editor** (node views / decorator nodes) está validado para Tiptap e Lexical
- [ ] A limitação do Quill quanto a **componentes React interativos** está documentada
- [ ] A **serialização/desserialização** de custom nodes está avaliada para cada editor
- [ ] A análise cobre **documentação e ecossistema** (docs, exemplos, comunidade)
- [ ] O documento contém uma **recomendação clara** de qual editor oferece melhor extensibilidade para o caso de uso

### Critérios para a implementação prática (próxima iteração)

- [ ] **Formatação**: Os 3 editores possuem controles de indentação de parágrafo, espaçamento entre parágrafos e line-height implementados e funcionais
- [ ] **Formatação**: O usuário final consegue ajustar essas propriedades via toolbar ou painel de configuração
- [ ] **Preview PDF**: Os 3 editores possuem um modo de preview que simula o layout final do PDF (paginação A4)
- [ ] **Preview PDF**: A fidelidade entre preview e PDF exportado é aceitável (comparação visual documentada)
- [ ] **Corretor ortográfico**: O spellcheck nativo do browser funciona corretamente nos 3 editores
- [ ] **Corretor ortográfico**: Limitações e possibilidades de integração com ferramentas externas estão documentadas

---

## Recomendação Preliminar

Com base na análise de extensibilidade:

### 🥇 Tiptap — Mais extensível para o caso de uso

- **API de extensão mais concisa e declarativa** — menos boilerplate para adicionar nodes customizados
- **Suporte React nativo em node views** — `ReactNodeViewRenderer` torna trivial renderizar componentes React dentro do editor
- **Menor curva de aprendizado** para extensões — abstrações de alto nível sobre ProseMirror
- **CLI para scaffold de extensões** — `npm init tiptap-extension`
- **Melhor DX (Developer Experience)** — TypeScript nativo, API composável com `.extend()`

### 🥈 Lexical — Extensível e robusto, mas mais complexo

- **Arquitetura mais sólida** — imutabilidade, sistema de comandos com prioridades, EditorState snapshots
- **Bom suporte React** — `DecoratorNode` com portals
- **Mais boilerplate** — `getType`, `clone`, `importJSON`, `exportJSON`, getters/setters com `getWritable()`/`getLatest()`
- **Evolução rápida** — `$config` + `NodeState` (v0.33+) reduz boilerplate, mas API ainda em mudança
- **Melhor escolha para casos que exigem** colaboração em tempo real ou arquitetura altamente robusta

### 🥉 Quill — Extensível para casos simples, limitado para interativos

- **API de Blots simples e rápida** para componentes estáticos
- **Sem suporte React nativo** — deal breaker para componentes interativos complexos
- **Modelo Delta diverge** do paradigma de árvore de nodes — menos intuitivo para extensões complexas
- **Documentação de extensibilidade limitada** — o guia principal é um tutorial ("Cloning Medium with Parchment")
- **Recomendado apenas** se as extensões necessárias forem estritamente estáticas e simples

---

## Assumptions

⚠ Inferido que o caso de uso principal é **templates de documentos** com componentes customizados para um produto proprietário  
⚠ Inferido que **React** é o framework de UI do produto (baseado no stack da POC)  
⚠ Inferido que a necessidade de extensibilidade inclui **componentes interativos** (não apenas formatação estática)  
⚠ Inferido que a **manutenibilidade de longo prazo** é fator importante (favor para APIs estáveis e bem documentadas)  
⚠ Os números de GitHub Stars e npm downloads são aproximados e podem ter variado desde a pesquisa  
⚠ A análise de LOC é estimativa baseada nos exemplos da documentação oficial — implementações reais podem variar  
⚠ Não foram avaliadas extensões de terceiros específicas — o foco foi na capacidade nativa de cada editor

---

Essa interpretação está correta? Algum ponto precisa de ajuste?
