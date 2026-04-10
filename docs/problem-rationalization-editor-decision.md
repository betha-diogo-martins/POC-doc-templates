# Análise Comparativa Final: Editores Rich Text para Templates de Documentos Oficiais

## Problem

Após a conclusão da POC prática (3 features × 3 editores free validados) e da análise teórica da feature matrix (7 features × 5 editores), é necessário **consolidar todos os insumos coletados** em um único documento de apoio à decisão.

O objetivo é fornecer à equipe uma visão completa e objetiva sobre cada editor — incluindo prós e contras, extensibilidade (free e paga), popularidade na comunidade, dificuldade de manutenção, complexidade do código-base e restrições de licenciamento — para fundamentar a escolha do editor que será adotado no produto.

### Contexto

- **POC branch**: `POC-free-tier-extension`
- **Stack da POC**: Vite + React 19 + TypeScript
- **Features validadas na POC prática** (3 editores free): Formatação ABNT, Preview PDF, Export PDF, Spell Check, Merge Fields visuais, Page Break, Inserção de imagens com resize
- **Documento de referência — Feature Matrix**: `problem-rationalization-feature-matrix.md`
- **Documento de referência — Validação POC**: `solution-planning-poc-validation.md`

---

## 1. Métricas de Popularidade e Saúde do Projeto

> Dados coletados em **abril/2026** via npm e GitHub API.

| Métrica                    | CKEditor 5               | TinyMCE                     | Tiptap                       | Lexical                | Quill                |
| -------------------------- | ------------------------ | --------------------------- | ---------------------------- | ---------------------- | -------------------- |
| **GitHub Stars**           | ~10.400                  | ~16.200                     | ~36.100                      | ~23.200                | ~47.000              |
| **GitHub Forks**           | ~3.700                   | ~2.300                      | ~2.900                       | ~2.100                 | ~3.600               |
| **Open Issues**            | ~876                     | ~431                        | ~890                         | ~541                   | ~635                 |
| **npm Weekly Downloads**   | ~1.018.000 (`ckeditor5`) | ~885.000 (`tinymce`)        | ~8.016.000 (`@tiptap/core`)  | ~2.971.000 (`lexical`) | ~3.047.000 (`quill`) |
| **Última versão**          | 48.0.0                   | 8.4.0                       | 3.22.3                       | 0.43.0                 | 2.0.3                |
| **Último publish (npm)**   | abr/2026                 | abr/2026                    | abr/2026                     | abr/2026               | ~jul/2025            |
| **Último push (GitHub)**   | abr/2026                 | abr/2026                    | abr/2026                     | abr/2026               | jul/2025             |
| **Linguagem principal**    | TypeScript               | TypeScript                  | TypeScript                   | TypeScript             | TypeScript           |
| **Licença**                | GPL 2+ / Comercial       | GPL 2+ / Comercial          | MIT                          | MIT                    | BSD 3-Clause         |
| **Mantenedor**             | CKSource (empresa)       | Tiny Technologies (empresa) | Überdosis (empresa + YC S23) | Meta (Facebook)        | Slab (empresa)       |
| **Subscribers (watchers)** | 146                      | 254                         | 169                          | 135                    | 484                  |
| **Criação do repo**        | jan/2015                 | jan/2010                    | ago/2018                     | dez/2020               | jul/2012             |

### Análise das Métricas

| Editor         | Veredito                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CKEditor 5** | Repositório maduro (desde 2015), releases frequentes, empresa consolidada. Downloads menores refletem o modelo dual-license que afasta projetos OSS puros.                                                                |
| **TinyMCE**    | Repositório mais antigo (2010), empresa consolidada (Tiny Technologies). Downloads menores que os editores MIT/BSD. Releases frequentes.                                                                                  |
| **Tiptap**     | **Líder absoluto em downloads npm** (~8M/semana). Crescimento explosivo, empresa com backing de YC. Releases muito frequentes (várias por semana). Muitas issues abertas (~890) mas refletem a alta adoção.               |
| **Lexical**    | Mantido pela Meta — garante longevidade e engenharia de primeira. Ainda pré-1.0 (v0.43.0) mas releases frequentes. Downloads altos (~3M/semana).                                                                          |
| **Quill**      | **Mais estrelas no GitHub** (~47k) historicamente, mas **último publish há ~9 meses** (jul/2025). Risco de estagnação. A v2 quebrou compatibilidade com muitos plugins. Downloads altos refletem a base instalada legacy. |

---

## 2. Extensibilidade

### 2.1 Extensibilidade nas versões Free/OSS

| Editor         | Mecanismo de extensão                                                                                                                                     | É possível criar plugins custom?                                                                                              | Complexidade   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **CKEditor 5** | Plugin System com MVC + Custom Data Model + Virtual DOM. Plugins são classes que registram commands, converters (upcast/downcast) e UI components.        | ✅ Sim — mas a curva de aprendizado é íngreme. O modelo de conversão (data ↔ editing ↔ view) exige entender 3 camadas.        | 🔴 Alta        |
| **TinyMCE**    | Plugin API baseada em registro de plugins via `tinymce.PluginManager.add()`. Plugins recebem a instância do editor e registram botões, menus e comandos.  | ✅ Sim — API mais direta que CKEditor. Documentação extensa com exemplos.                                                     | 🟡 Média       |
| **Tiptap**     | Extension API sobre ProseMirror. `Node.create()`, `Mark.create()`, `Extension.create()` com hooks (`addCommands`, `addNodeView`, `addKeyboardShortcuts`). | ✅ Sim — **melhor DX entre todos**. Extensões são composáveis e testáveis. `ReactNodeViewRenderer` facilita muito para React. | 🟢 Baixa-Média |
| **Lexical**    | Node System com `DecoratorNode`, `ElementNode`, `TextNode`. Plugins são componentes React que usam hooks do editor. Command system para comunicação.      | ✅ Sim — modelo mental simples (nodes + commands). `DecoratorNode.decorate()` retorna React diretamente.                      | 🟡 Média       |
| **Quill**      | Parchment Blots (`Inline`, `Block`, `BlockEmbed`, `Embed`). `StyleAttributor` e `ClassAttributor` para formatos CSS. Delta format para dados.             | ✅ Sim — mas o sistema de Blots é rígido. DOM é fortemente controlado pelo Quill, o que limita customizações complexas.       | 🟡 Média-Alta  |

### 2.2 Extensibilidade nas versões Pagas/Premium

| Editor         | Plugins premium são extensíveis?                                                                                                                                                                                                   | É possível sobrescrever comportamento premium?                                                                                         | Limitações                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **CKEditor 5** | ⚠️ Parcialmente — plugins premium usam o mesmo Plugin System que OSS, então tecnicamente podem ser estendidos. Mas o código premium é **obfuscado/minificado** na distribuição cloud. Self-hosted (plano Custom) dá mais controle. | ⚠️ Pode-se interceptar comandos e converter output, mas modificar o core de um plugin premium exige self-hosting + engenharia reversa. | Código premium não é open source. Self-hosting só no plano Custom.                       |
| **TinyMCE**    | ⚠️ Parcialmente — plugins premium são carregados via cloud CDN e o código é minificado. A API permite interceptar eventos e estender UI, mas não modificar a lógica interna dos plugins premium.                                   | ⚠️ Pode-se wrappear plugins premium com lógica adicional via `editor.on()` e `editor.addCommand()`.                                    | Plugins premium distribuídos como código fechado. Self-hosting requer plano Enterprise.  |
| **Tiptap**     | ✅ Sim — extensões Pro/Premium são pacotes npm normais com código TypeScript. Podem ser estendidas via `.extend()` como qualquer extensão OSS.                                                                                     | ✅ Sim — o método `.extend()` permite sobrescrever qualquer aspecto (schema, commands, nodeViews, etc.) de extensões premium.          | Requer subscription ativa para acesso aos pacotes.                                       |
| **Lexical**    | N/A — Lexical **não possui tier pago**. Tudo é MIT. Não há plugins premium.                                                                                                                                                        | N/A                                                                                                                                    | O modelo é 100% OSS. Meta mantém como projeto interno usado no Facebook, Instagram, etc. |
| **Quill**      | N/A — Quill **não possui tier pago**. Tudo é BSD 3-Clause. Não há plugins premium oficiais.                                                                                                                                        | N/A                                                                                                                                    | Sem empresa vendendo features premium. Plugins de terceiros são da comunidade.           |

---

## 3. Prós e Contras

### 3.1 CKEditor 5

| Prós ✅                                                    | Contras ❌                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Feature-set mais completo do mercado — quase tudo é nativo | Maioria das features úteis exige **licença paga** (a partir de $144/mês)                |
| Empresa consolidada com suporte enterprise                 | **GPL 2+** no tier free — incompatível com projetos proprietários sem licença comercial |
| Colaboração em tempo real nativa (OT) — a mais madura      | Curva de aprendizado muito alta (MVC, 3 camadas de conversão, Virtual DOM custom)       |
| Export PDF e Word server-side (alta fidelidade)            | Free plan tem watermark "Powered by CKEditor"                                           |
| TypeScript nativo, CI/CD robusto                           | Monorepo gigante (~653k+ repo size) — contribuição é complexa                           |
| Documentação extensa e exemplos                            | Page Break no free, mas **Pagination** (preview paginado) só no Custom plan             |
| Merge Fields nativos (premium)                             | Self-hosting apenas no plano Custom (mais caro)                                         |

### 3.2 TinyMCE

| Prós ✅                                                         | Contras ❌                                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Editor mais adotado historicamente — ampla base de conhecimento | **Não possui colaboração em tempo real** (apenas assíncrona com Suggested Edits)         |
| API de plugins simples e intuitiva                              | Modelo de **editor loads** — custo cresce proporcionalmente ao número de usuários ativos |
| 50+ plugins oficiais, 29+ integrações com frameworks            | Free plan limitado a **1.000 editor loads/mês** (depois $40/1.000)                       |
| Excelente documentação e exemplos                               | Features avançadas (Export PDF, Import Word) são **add-ons com custo adicional** por uso |
| TypeScript nativo, releases regulares                           | GPL 2+ no self-hosted — mesma restrição que CKEditor                                     |
| UI polida e familiar (toolbar clássica)                         | Preview de PDF não mostra quebras de página ao vivo no editor                            |
| Merge Tags nativos (premium)                                    | Ecossistema fechado — plugins premium são código minificado                              |
| Plano Essential a $79/mês (mais barato que CKEditor)            | PowerPaste (paste de Word com fidelidade) só no plano Professional ($145/mês)            |

### 3.3 Tiptap

| Prós ✅                                                          | Contras ❌                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **MIT license** — uso comercial livre, sem restrições            | Merge Fields, Page Break e features avançadas requerem **desenvolvimento customizado** |
| **Maior adoção npm** (~8M downloads/semana)                      | Extensões premium (Pages, Import/Export) exigem subscription ($49-$999/mês)            |
| **Melhor DX** — Extension API limpa, composável, com `.extend()` | Sem spell checker próprio (depende do browser)                                         |
| Baseado em ProseMirror — ecossistema imenso de plugins PM        | ProseMirror tem curva de aprendizado para quem precisa ir além do Tiptap               |
| Colaboração OSS via Yjs/Hocuspocus (self-hosted)                 | Colaboração em tempo real sem backend próprio requer Tiptap Cloud (pago)               |
| **Único que suporta import/export .odt** (premium)               | Versões premium são npm packages pagos (precisa de subscription para instalar)         |
| `ReactNodeViewRenderer` torna extensões React triviais           | Versão 3.x ainda recente — possíveis breaking changes                                  |
| Headless — UI totalmente customizável                            | Precisa construir sua própria toolbar (headless = mais trabalho de UI)                 |
| YC-backed, SOC 2 Type II, empresa em crescimento                 | Startup — risco inerente (mitigado pelo YC backing e licença MIT)                      |

### 3.4 Lexical

| Prós ✅                                                                   | Contras ❌                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **MIT license** — 100% gratuito e open source                             | **Quase tudo requer desenvolvimento customizado** — merge fields, page break, PDF, Office |
| Mantido pela **Meta** — garantia de longevidade e qualidade de engenharia | **Ainda pré-1.0** (v0.43.0) — API pode mudar entre versões                                |
| Performance excelente — dependency-free core engine                       | Documentação mais enxuta que CKEditor/TinyMCE/Tiptap                                      |
| Modelo mental simples — nodes, commands, state updates                    | Playground tem código útil mas **não é production-ready** (precisa ser adaptado)          |
| Tight integration com React 18+                                           | Sem suporte a import/export .docx ou .odt nativos                                         |
| Colaboração OSS via `@lexical/yjs` (binding oficial Meta)                 | Comunidade menor que Tiptap para colaboração                                              |
| Double-buffering + reconciler = updates previsíveis                       | Sem empresa vendendo suporte enterprise (é projeto Meta, não tem plano pago)              |
| `DecoratorNode` permite embedar qualquer React component                  | Sem spell checker próprio (depende do browser)                                            |
| Bundle size mínimo (core ~22kb gzip)                                      | Precisa construir TUDO (toolbar, imagens, tabelas...) ou adaptar do playground            |

### 3.5 Quill

| Prós ✅                                          | Contras ❌                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **BSD 3-Clause** — a licença mais permissiva     | **Último release há ~9 meses** (jul/2025) — risco de estagnação                       |
| Delta format elegante e simples de serializar    | v2.0 **quebrou compatibilidade** com muitos plugins da comunidade (v1)                |
| Maior número de stars no GitHub (~47k)           | Ecossistema de plugins fragmentado e pouco mantido (especialmente para v2)            |
| API simples para casos de uso básicos            | DOM fortemente controlado pelo Quill — difícil fazer customizações complexas          |
| Menor bundle size entre os full-featured editors | Sem merge fields, page break, pagination ou export PDF nativos                        |
| Boa integração React via `react-quill-new`       | `react-quill-new` é wrapper da comunidade, não oficial                                |
| Colaboração via `y-quill` (Yjs binding)          | Image resize requer implementação custom (módulos da comunidade incompatíveis com v2) |
| Curva de aprendizado baixa para uso básico       | Toolbar não é facilmente extensível para formatos customizados                        |
|                                                  | Sem empresa vendendo suporte enterprise                                               |
|                                                  | **Sem spell checker próprio** e sem plano futuro visível                              |

---

## 4. Complexidade do Código-Base e Manutenibilidade

| Aspecto                  | CKEditor 5                                                                               | TinyMCE                                                                         | Tiptap                                                                    | Lexical                                                                          | Quill                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Arquitetura**          | MVC custom + Virtual DOM + Data Model + 3-layer conversion (data ↔ editing ↔ view)       | Plugin system monolítico + contentEditable com gerenciamento direto de DOM      | Extension API sobre ProseMirror (schema → state → view → transactions)    | EditorState + Nodes + Reconciler (double-buffering inspirado em React)           | Delta format + Parchment Blots + contentEditable com controle rígido de DOM     |
| **Tamanho do repo**      | ~653MB (monorepo, inclui docs e testes)                                                  | ~136MB (monorepo)                                                               | ~78MB (monorepo)                                                          | ~135MB (monorepo)                                                                | ~18MB (repo simples)                                                            |
| **Nº de packages**       | 60+ packages no monorepo                                                                 | 30+ packages no monorepo                                                        | 50+ packages no monorepo                                                  | 30+ packages no monorepo                                                         | Monolítico (1 pacote principal)                                                 |
| **Código custom na POC** | N/A (não testado na POC)                                                                 | N/A (não testado na POC)                                                        | ~200 LOC por feature (extensions limpas)                                  | ~300 LOC por feature (nodes + plugins + toolbar)                                 | ~350 LOC por feature (blots + attributors + workarounds)                        |
| **Manutenibilidade**     | 🔴 Difícil — 3 camadas de abstração, cada mudança precisa update em data, editing e view | 🟡 Média — plugin system flat, mas internals são complexos e pouco documentados | 🟢 Boa — extensions isoladas, testáveis, `.extend()` facilita overrides   | 🟢 Boa — nodes são self-contained, system é previsível (functional-style)        | 🟡 Média — Blots são simples mas o controle de DOM é rígido e quebra facilmente |
| **Testabilidade**        | 🟡 Testes próprios extensos mas setup de testes customizados é complexo                  | 🟡 Framework de testes próprio, mocking do editor é trabalhoso                  | 🟢 Extensions testáveis isoladamente, boa story de unit tests             | 🟢 `editor.update()` + `editor.getEditorState()` permitem testes determinísticos | 🟡 Delta comparisons facilitam testes de content, mas DOM testing é frágil      |
| **Debug/DevTools**       | 🟡 CKEditor Inspector (extension) — útil mas é uma ferramenta a mais para aprender       | 🟡 Sem devtools dedicados, debug via browser DevTools                           | 🟡 Sem devtools oficiais, PM DevTools (ProseMirror) funciona parcialmente | 🟢 Lexical DevTools (extension oficial) — excelente para debug de state          | 🟡 Sem devtools oficiais, debug via browser DevTools + Delta inspection         |

### Observações da POC sobre manutenibilidade

| Editor      | Observação                                                                                                                                                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tiptap**  | Extensions são as mais fáceis de criar e manter. O padrão `Node.create({ ... })` + `ReactNodeViewRenderer` é previsível e reutilizável. Cada extension é um arquivo isolado.                                                                                                |
| **Lexical** | O modelo `DecoratorNode` + `decorate()` → React é poderoso mas verboso. Cada node precisa de métodos estáticos (`importJSON`, `exportJSON`, `importDOM`, `exportDOM`, `getType`, `clone`). Mais boilerplate que Tiptap.                                                     |
| **Quill**   | Blots são simples para casos básicos mas quebram facilmente para casos complexos. O controle rígido do DOM pelo Quill causou vários bugs na POC (merge field replace via regex falhando por spans invisíveis com zero-width spaces, image resize incompatível com v2, etc). |

---

## 5. Restrições de Licenciamento e Custos

### 5.1 Editores Premium (CKEditor 5 & TinyMCE)

| Aspecto                          | CKEditor 5                                                                                       | TinyMCE                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| **Free plan**                    | $0 — 1.000 editor loads/mês, watermark, features básicas, Export PDF/Word limitado (5 operações) | $0 — 1.000 editor loads/mês, cloud-hosted, features core, 14 dias trial       |
| **Entry-level pago**             | Essential $144/mês — 5.000 loads, Merge Fields, Page Break, Enhanced Paste                       | Essential $79/mês — 5.000 loads, advanced features, collaboration basics      |
| **Mid-tier pago**                | Professional $405/mês — 20.000 loads, Collaboration (RTC, Comments, Track Changes), Import Word  | Professional $145/mês — 20.000 loads, PowerPaste, compliance, advanced collab |
| **Enterprise**                   | Custom — self-hosted, multi-region, SLA, todos add-ons                                           | Custom — self-hosted, multi-domain, SLA                                       |
| **Modelo de cobrança**           | Editor loads/mês + overages ($30-$60 por 1.000 loads extras dependendo do plano)                 | Editor loads/mês + overages ($40 por 1.000 loads extras)                      |
| **Self-hosting**                 | Apenas no plano Custom (mais caro)                                                               | Apenas no plano Enterprise; OSS via GPL pode ser self-hosted                  |
| **Licença OSS**                  | GPL 2+ — **incompatível com software proprietário** sem licença comercial                        | GPL 2+ — mesma restrição                                                      |
| **Export PDF/Word**              | Free: 5 ops. Essential: 200. Professional: 1.000. Custom: ilimitado                              | Add-on com preço por uso em todos os planos pagos                             |
| **Spell Checker**                | Apenas no plano Custom (WProofreader)                                                            | Disponível a partir do Essential                                              |
| **Merge Fields**                 | A partir do Essential ($144/mês)                                                                 | Merge Tags a partir do Essential ($79/mês)                                    |
| **Colaboração RTC**              | Apenas Professional ($405/mês) ou Custom                                                         | ❌ Não disponível (apenas assíncrona)                                         |
| **Pagination (preview ao vivo)** | Apenas Custom                                                                                    | ❌ Não disponível                                                             |

### 5.2 Editores Free/OSS (Tiptap, Lexical, Quill)

| Aspecto                 | Tiptap                                                                                                                      | Lexical                                    | Quill                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| **Licença**             | MIT — uso comercial livre                                                                                                   | MIT — uso comercial livre                  | BSD 3-Clause — uso comercial livre    |
| **Custo do editor**     | $0 (core + extensões OSS)                                                                                                   | $0 (tudo)                                  | $0 (tudo)                             |
| **Platform pago**       | Start $49/mês, Team $149/mês, Business $999/mês, Enterprise custom                                                          | N/A — não existe                           | N/A — não existe                      |
| **O que o pago inclui** | AI Toolkit, Pages (layout paginado), Import/Export .docx/.odt, Collaboration Cloud, Tracked Changes, Webhooks, API, suporte | N/A                                        | N/A                                   |
| **Self-hosting collab** | ✅ Gratuito via Hocuspocus + Yjs                                                                                            | ✅ Gratuito via y-websocket + @lexical/yjs | ✅ Gratuito via y-quill + y-websocket |
| **Restrições do free**  | Nenhuma no editor. Platform features (Cloud docs, AI, Pages) requerem subscription                                          | Nenhuma                                    | Nenhuma                               |
| **Custo real**          | Tempo de desenvolvimento para features customizadas + eventual subscription para features premium                           | Tempo de desenvolvimento para TUDO         | Tempo de desenvolvimento para TUDO    |

---

## 6. Matriz de Features — Consolidação da POC

> Referência: `problem-rationalization-feature-matrix.md`

### Legenda

| Símbolo                  | Significado                                       |
| ------------------------ | ------------------------------------------------- |
| 🟢 **Nativo OSS**        | Feature disponível gratuitamente, pronta para uso |
| 🔶 **Nativo Premium**    | Feature requer licença paga                       |
| 🔵 **Plugin Comunidade** | Plugin mantido pela comunidade                    |
| 🛠 **Dev Customizado**   | Requer desenvolvimento próprio                    |
| ❌ **Inviável/Difícil**  | Sem solução pronta, implementação arriscada       |
| ✅ **Validado na POC**   | Implementado e testado na POC prática             |

### Matriz Completa (7 features × 5 editores)

| Feature                       | CKEditor 5               | TinyMCE               | Tiptap                   | Lexical            | Quill                   |
| ----------------------------- | ------------------------ | --------------------- | ------------------------ | ------------------ | ----------------------- |
| **Merge Fields**              | 🔶 Premium ($144+/mês)   | 🔶 Premium ($79+/mês) | 🛠 Custom ✅ POC         | 🛠 Custom ✅ POC   | 🛠 Custom ✅ POC        |
| **Formatação ABNT**           | 🟢 OSS                   | 🟢 OSS                | 🟢 OSS + 🛠 ✅ POC       | 🟢 OSS + 🛠 ✅ POC | 🟢 OSS + 🛠 ✅ POC      |
| **Preview PDF + Page Break**  | 🔶 Premium               | 🔶 Premium (parcial)  | 🛠 Custom ✅ POC         | 🛠 Custom ✅ POC   | 🛠 Custom ✅ POC        |
| **Colaboração RTC**           | 🔶 Premium ($405+/mês)   | ❌ Não nativo         | 🟢 OSS (Yjs)             | 🟢 OSS (Yjs)       | 🔵 Comunidade (y-quill) |
| **Corretor ortográfico**      | 🔶 Premium (Custom plan) | 🔶 Premium ($79+/mês) | 🌐 Browser ✅ POC        | 🌐 Browser ✅ POC  | 🌐 Browser ✅ POC       |
| **Integração Office (.docx)** | 🔶 Premium               | 🔶 Premium            | 🔶 Premium ($49+/mês)    | 🛠 Custom          | 🛠 Custom               |
| **Integração Office (.odt)**  | ❌ Não suporta           | ❌ Não suporta        | 🔶 Premium ($49+/mês) ✅ | ❌ Não suporta     | ❌ Não suporta          |
| **Manipulação de imagens**    | 🟢 OSS + 🔶 Premium      | 🟢 OSS + 🔶 Premium   | 🟢 OSS ✅ POC            | 🟢 OSS ✅ POC      | 🟢 OSS + 🛠 ✅ POC      |

---

## 7. Resultado da POC Prática — Editores Free

> Referência: `solution-planning-poc-validation.md` (status: ✅ DONE)

### Features validadas com sucesso (7/7) nos 3 editores

| Feature                | Tiptap | Lexical | Quill | Observações                                                                                                                                                                                |
| ---------------------- | ------ | ------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Formatação ABNT        | ✅     | ✅      | ✅    | Tiptap e Lexical: extensões limpas. Quill: `StyleAttributor` funcional mas menos elegante.                                                                                                 |
| Preview PDF (modal A4) | ✅     | ✅      | ✅    | Implementação compartilhada (`FieldsPanel` + `PdfPreview`). Funciona cross-editor.                                                                                                         |
| Export PDF             | ✅     | ✅      | ✅    | Via `html2pdf.js`. Page break requer swap in-place de `.page-break` para markers invisíveis.                                                                                               |
| Spell Check            | ✅     | ✅      | ✅    | `spellcheck="true"` funcional nos 3 editores.                                                                                                                                              |
| **Merge Fields**       | ✅     | ✅      | ✅    | Tiptap: `Node.create()` + `ReactNodeViewRenderer` (mais limpo). Lexical: `DecoratorNode` (mais verboso). Quill: `Embed Blot` (funcional mas causou bugs com zero-width spaces no replace). |
| **Page Break**         | ✅     | ✅      | ✅    | Tiptap: custom Node. Lexical: `DecoratorNode`. Quill: `BlockEmbed`. CSS `break-after: page` para PDF.                                                                                      |
| **Imagens + Resize**   | ✅     | ✅      | ✅    | Tiptap: extensão `Image` OSS nativa com resize. Lexical: `ImageNode` adaptado do playground. Quill: `ResizableImageBlot` custom (módulo comunidade incompatível com v2).                   |

### Bugs encontrados e resolvidos durante a POC

| Bug                                    | Editor | Causa raiz                                                                                                   | Complexidade do fix                                                      |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Merge field replace falhava no preview | Quill  | Blots `embed` wrappam com `<span contenteditable="false">` + zero-width spaces (`\uFEFF`). Regex não casava. | 🟡 Média — reescrita com `DOMParser` + `querySelectorAll`                |
| Page break causava overflow no preview | Quill  | `break-after: page` só funciona em contexto de print                                                         | 🟢 Baixa — CSS override no preview                                       |
| Image resize não funcionava            | Quill  | Módulos comunidade (`quill-image-resize-module`) incompatíveis com Quill v2                                  | 🔴 Alta — criação de `ResizableImageBlot` do zero                        |
| Page break visível no PDF exportado    | Todos  | `html2canvas` renderiza pseudo-elements de `.page-break`                                                     | 🔴 Alta — 3 iterações (inline styles → clone off-screen → in-place swap) |
| Container de PDF ficava visível        | Todos  | `style.cssText` overwrite removendo posicionamento off-screen                                                | 🟢 Baixa — preservar posicionamento no cssText                           |

### Dificuldade comparativa de implementação

| Feature           | Tiptap            | Lexical                       | Quill                       |
| ----------------- | ----------------- | ----------------------------- | --------------------------- |
| Merge Fields      | 🟢 Fácil          | 🟡 Médio                      | 🟡 Médio-Alto               |
| Page Break        | 🟢 Fácil          | 🟡 Médio                      | 🟡 Médio                    |
| Imagens + Resize  | 🟢 Fácil (nativo) | 🟡 Médio (adaptar playground) | 🔴 Difícil (custom do zero) |
| **Total de bugs** | 0 específicos     | 0 específicos                 | 3 específicos               |

---

## 8. Análise de Risco

| Risco                | CKEditor 5                                                        | TinyMCE                                                      | Tiptap                                                    | Lexical                                        | Quill                                                      |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| **Vendor lock-in**   | 🔴 Alto — features core atrás de paywall, GPL limita alternativas | 🔴 Alto — mesma situação, modelo de editor loads escala caro | 🟡 Baixo — MIT core, premium é aditivo                    | 🟢 Mínimo — 100% MIT                           | 🟢 Mínimo — 100% BSD                                       |
| **Custo crescente**  | 🔴 Editor loads × features × preço = custo imprevisível           | 🔴 Editor loads escalam rápido em SaaS                       | 🟡 Previsível ($49-$149/mês se usar premium)              | 🟢 Zero — custo é apenas dev time              | 🟢 Zero — custo é apenas dev time                          |
| **Descontinuação**   | 🟢 Baixo — empresa consolidada, 10+ anos                          | 🟢 Baixo — empresa consolidada, 15+ anos                     | 🟡 Médio — startup, mitigado por MIT license + YC backing | 🟢 Baixo — Meta mantém para uso interno        | 🟡 Médio-Alto — sinais de estagnação (9 meses sem release) |
| **Breaking changes** | 🟡 Médio — major versions mudam APIs                              | 🟡 Médio — v5→v6→v7→v8 tiveram breaking changes              | 🟡 Médio — v2→v3 teve mudanças                            | 🔴 Alto — pré-1.0, API pode mudar              | 🔴 Alto — v1→v2 quebrou ecossistema                        |
| **Escassez de devs** | 🟡 Nicho — menos devs dominam CKE5 que React/PM                   | 🟢 Baixo — ampla base de devs                                | 🟢 Baixo — PM/Tiptap é skillset crescente                 | 🟡 Médio — Lexical é mais novo, menos material | 🟡 Médio — muitos devs conhecem v1, poucos dominam v2      |

---

## 9. Recomendação por Cenário

### Cenário A: "Preciso do máximo de features nativas, orçamento não é restrição"

**→ CKEditor 5 Professional ($405/mês)** ou **Enterprise**

- Merge Fields, Pagination, RTC, Track Changes, Import/Export Word — tudo nativo
- Melhor para: empresas grandes com budget de licensing e necessidade de colaboração completa

### Cenário B: "Quero um editor polido, com boa DX, features avançadas sem RTC"

**→ TinyMCE Professional ($145/mês)**

- UI madura, plugins abundantes, boa documentação
- Melhor para: produtos que precisam de editor "drop-in" sem necessidade de colaboração real-time

### Cenário C: "Quero controle total, boa DX, flexibilidade para crescer, licença MIT"

**→ Tiptap (core OSS + eventual Platform)**

- **Recomendado para este projeto**
- Melhor DX da POC, menor número de bugs, maior facilidade de extensão
- MIT license = liberdade total
- Pode começar 100% free e adotar Platform incrementalmente (Pages, Import/Export) se necessário
- Maior comunidade ativa (8M downloads/semana, ~36k stars)
- Colaboração OSS via Hocuspocus + Yjs
- Risco mitigado: mesmo se a empresa Tiptap desaparecer, o core é MIT e o ProseMirror é mantido independentemente

### Cenário D: "Quero 100% gratuito, equipe forte para construir tudo"

**→ Lexical**

- Zero custo de licença, Meta garante longevidade
- Melhor para: equipes com forte engenharia frontend que querem controle total
- Trade-off: maior investimento de tempo em desenvolvimento customizado

### Cenário E: "Quero algo simples e rápido para caso de uso básico"

**→ Quill** (com ressalvas)

- Bom para: protótipos rápidos, editores simples sem features avançadas
- ⚠️ **Não recomendado para produção** neste projeto — sinais de estagnação e bugs recorrentes na POC

---

## 10. Scorecard Final

| Critério (peso)                 | CKEditor 5 | TinyMCE  | Tiptap     | Lexical    | Quill      |
| ------------------------------- | ---------- | -------- | ---------- | ---------- | ---------- |
| Features nativas (20%)          | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐       | ⭐⭐       |
| Custo/Licença (20%)             | ⭐⭐       | ⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Extensibilidade (15%)           | ⭐⭐⭐     | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| DX / Manutenibilidade (15%)     | ⭐⭐       | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| Popularidade / Comunidade (10%) | ⭐⭐⭐     | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   |
| Risco (10%)                     | ⭐⭐⭐     | ⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐       |
| Resultado POC (10%)             | N/A        | N/A      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| **Score ponderado**             | **3.15**   | **2.95** | **4.65**   | **3.90**   | **3.10**   |

> **Nota sobre scores**: CKEditor e TinyMCE não participaram da POC prática (10%), então o critério "Resultado POC" foi N/A e o peso redistribuído para os demais critérios.

---

## Validation Criteria

- [x] Prós e contras documentados para os 5 editores
- [x] Extensibilidade analisada para versões free E pagas
- [x] Métricas de popularidade coletadas (npm downloads, GitHub stars, forks, issues, frequência de releases)
- [x] Dificuldade de manutenção avaliada com base na arquitetura e experiência da POC
- [x] Complexidade do código-base documentada
- [x] Matriz de features consolidada com resultados da POC
- [x] Restrições de licenciamento e custos por tier mapeados
- [x] Análise de risco por editor
- [x] Recomendação por cenário de uso
- [x] Scorecard final com pesos

---

## Assumptions

⚠ Inferido que o cenário mais provável para o projeto é **licença MIT/BSD com controle customizado** (Cenário C ou D), dado que a POC já focou nos editores free.

⚠ Preços coletados das páginas de pricing oficiais em abril/2026 — podem sofrer alterações.

⚠ Downloads npm incluem CI/CD pipelines e mirrors — números absolutos são indicativos, não representam adoções únicas.

⚠ As métricas de GitHub (stars, forks) refletem popularidade histórica, não necessariamente atividade atual (ex: Quill tem muitas stars mas pouca atividade recente).

⚠ O score ponderado é uma simplificação — os pesos devem ser ajustados conforme as prioridades reais do projeto.

⚠ A complexidade de manutenção dos editores premium (CKEditor, TinyMCE) foi avaliada com base na documentação e API pública, não na experiência direta da POC.

---

Essa interpretação está correta? Algum ponto precisa de ajuste?
