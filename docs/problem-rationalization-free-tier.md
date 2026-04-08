# POC — Alternativas Free/Open-Source para Export to PDF em Rich Text Editors (CKEditor 5 & TinyMCE)

## Problem

Na primeira iteração da POC, validamos que **CKEditor 5** e **TinyMCE** funcionam corretamente para criação de templates de documentos (header, corpo com campos dinâmicos e footer) utilizando licenças pagas/trial. Ambos os editores possuem **Export to PDF como plugin premium/pago**:

- **CKEditor 5**: `ExportPdf` é um plugin premium que utiliza CKEditor Cloud Services para conversão. No plano Free, o limite é de **5 conversões/mês**. Nos planos Essential ($144/mês) e Professional ($405/mês), o limite sobe para 200 e 1.000 respectivamente.
- **TinyMCE**: `exportpdf` é um plugin pago disponível como add-on (priced by usage) a partir do plano Essential ($79/mês). No plano Free, funciona apenas em **trial de 14 dias com watermark**.

Além do Export to PDF, a pesquisa revelou que **outras funcionalidades relevantes para templates também são premium/pagas** em ambos os editores:

### CKEditor 5 — Features premium relevantes (indisponíveis no plano Free)

| Feature                                 | Plano mínimo                       |
| --------------------------------------- | ---------------------------------- |
| **Merge Fields** (inline, block, image) | Essential ($144/mês)               |
| **Export to PDF**                       | Free (5/mês) → Essential (200/mês) |
| Templates (plugin)                      | Essential                          |
| Find and Replace                        | Essential                          |
| Restricted Editing                      | Essential                          |
| Page Break                              | Essential                          |
| Full Page HTML                          | Essential                          |

### TinyMCE — Features premium relevantes (indisponíveis no plano Free)

| Feature            | Plano mínimo                         |
| ------------------ | ------------------------------------ |
| **Merge Tags**     | Essential ($79/mês) — premium plugin |
| **Export to PDF**  | Essential — add-on pago por uso      |
| Templates (plugin) | Essential                            |
| Enhanced Tables    | Essential                            |
| Full Page          | Essential                            |
| Page Break         | Open-source ✅                       |

**Conclusão da análise**: A limitação **não é apenas** Export to PDF. Os **Merge Fields / Merge Tags** — funcionalidade central para campos dinâmicos em templates — **também são premium/pagos em ambos os editores**. Isso significa que uma abordagem 100% gratuita requer substituir **duas funcionalidades** (campos dinâmicos + geração de PDF), não apenas uma.

### O problema a resolver

Validar quais alternativas **gratuitas e open-source** existem para substituir as funcionalidades premium dos editores, mantendo a mesma experiência de criação de templates com campos dinâmicos e exportação para PDF. As abordagens a avaliar incluem:

1. **Abordagem client-side**: Usar bibliotecas JavaScript open-source para gerar PDF a partir do conteúdo HTML do editor (ex: `html2pdf.js`, `jsPDF`, `react-to-print`)
2. **Abordagem de campos dinâmicos**: Implementar merge fields/tags de forma customizada sem depender dos plugins premium (ex: placeholders com regex, custom plugins, ou abordagens alternativas)
3. **Abordagem mista**: Combinar os editores com plugins free + bibliotecas externas para PDF + implementação customizada de campos dinâmicos

## Expected Output

Um **documento de análise comparativa** (e, se viável, uma segunda iteração funcional da POC) que responda:

1. **Viabilidade técnica**: É possível ter uma experiência de templates com campos dinâmicos + Export to PDF **sem nenhum plugin pago** dos editores? Com qual nível de qualidade comparado à versão premium?
2. **Comparativo de abordagens PDF**: Análise das opções open-source para geração de PDF, incluindo:
   - `html2pdf.js` (MIT, ~900k downloads/semana) — client-side, usa html2canvas + jsPDF
   - `jsPDF` (MIT, 31.2k stars) — geração programática de PDF, suporte a HTML via `.html()` method
   - `react-to-print` (MIT, ~1.1M downloads/semana) — usa `window.print()` do browser, gera PDF via "Print to PDF" do navegador
   - `@react-pdf/renderer` — geração de PDF com componentes React, não adequado para conteúdo WYSIWYG
3. **Comparativo de abordagens para campos dinâmicos sem plugins premium**:
   - Placeholders customizados com regex/replace no HTML do editor
   - CKEditor com `licenseKey: 'GPL'` + custom plugin de merge fields
   - TinyMCE self-hosted open-source + custom plugin de merge tags
4. **Trade-offs claros**: O que se ganha e o que se perde em relação à primeira iteração (com plugins premium)
5. **Recomendação**: Qual combinação é mais adequada para uso em produção sem custo de licenciamento

## Validation Criteria

- [ ] A análise identifica e documenta **todas as funcionalidades premium** necessárias para o caso de uso (não apenas Export to PDF)
- [ ] Pelo menos **2 abordagens distintas** para Export to PDF open-source são implementadas e testadas
- [ ] Pelo menos **1 abordagem** para campos dinâmicos sem plugins premium é implementada e testada
- [ ] Os trade-offs de qualidade (fidelidade do PDF, UX dos campos dinâmicos) estão **documentados com evidências** (screenshots ou descrições)
- [ ] O código continua funcionando com `npm install` → `npm run dev` sem licenças/keys pagas
- [ ] O documento final inclui uma **recomendação clara** de qual abordagem adotar

## Análise de Licenciamento Open-Source

### ⚖️ Ambos os editores usam GPL 2+ — isso tem implicações sérias

Tanto o CKEditor 5 quanto o TinyMCE são licenciados sob **GNU General Public License Version 2 or later (GPL 2+)** na sua versão open-source. A GPL é uma licença **copyleft forte**, o que significa:

#### O que a GPL 2+ exige:

| Obrigação                        | Descrição                                                                                                        | Impacto                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Copyleft viral**               | Qualquer software que **incorpore, distribua ou modifique** código GPL deve ser licenciado integralmente sob GPL | Se o produto final é proprietário/closed-source, **não pode usar GPL** |
| **Distribuição do código-fonte** | Se você distribui o software (mesmo compilado), deve disponibilizar o código-fonte completo sob GPL              | Obriga a abrir o código do produto inteiro                             |
| **Sem sublicenciamento**         | Não é possível sublicenciar o código GPL sob outra licença                                                       | Impede uso em produtos com licença proprietária                        |
| **Sem restrições adicionais**    | Não pode impor restrições além das da GPL aos destinatários                                                      | Qualquer pessoa que receba o software pode redistribuí-lo              |

#### CKEditor 5 — Detalhes de licenciamento

- **Open-source**: GPL 2+ — inclui plugins core (formatação, tabelas, listas, etc.) + algumas features extras (Page Break, Find and Replace, Restricted Editing, Full Page HTML, etc. — ver lista completa na documentação)
- **Powered by CKEditor**: Obrigatório exibir badge "Powered by CKEditor" na versão GPL (aparece ao focar o editor)
- **Plugins premium NÃO incluídos no GPL**: Merge Fields, Export to PDF, Export to Word, Import from Word, Collaboration (Comments, Track Changes, Revision History), CKEditor AI, Templates (plugin), etc.
- **Plano Free comercial (licenseKey via portal)**: É comercial (não-GPL), inclui Export to PDF (5/mês) e Export to Word (5/mês), mas **NÃO inclui** Merge Fields, Templates, e outros premium. Permite white-labeling exceto badge removível.
- **Dual-licensing**: CKEditor oferece licença comercial separada para quem não pode/quer usar GPL

#### TinyMCE — Detalhes de licenciamento

- **Open-source**: GPL 2+ — inclui core editor + open-source plugins (formatação, tabelas, listas, pagebreak, search/replace, wordcount, etc.)
- **Self-hosted**: Pode ser instalado via npm/download e hospedado na própria infraestrutura
- **Plugins premium NÃO incluídos no GPL**: Merge Tags, Export to PDF, Export to Word, Import from Word, Templates, Enhanced Tables, Comments, Mentions, PowerPaste, Accessibility Checker, Spell Checker, etc.
- **Cloud CDN (API Key)**: Mesmo com API key gratuita, o uso do cloud está sujeito aos termos comerciais da Tiny Cloud, **não é GPL**
- **Sem programa open-source específico**: Diferente do CKEditor, TinyMCE não tem um programa formal para projetos OSS com licenças incompatíveis com GPL

### 🚨 Implicação crítica para uso em produto proprietário/SaaS

**Se o produto final da Betha é proprietário (closed-source) ou SaaS**, usar CKEditor ou TinyMCE sob GPL **não é uma opção viável**, porque:

1. A GPL exige que **todo o software derivado** seja distribuído sob GPL — isso significaria abrir o código-fonte do produto inteiro
2. Para SaaS: existe debate jurídico sobre se "servir via web" constitui "distribuição" sob GPL 2 (a GPL 3 com AGPL resolve isso explicitamente, mas GPL 2 tem ambiguidade). **Recomendação**: não assumir que SaaS está isento da GPL
3. A alternativa seria usar as **licenças comerciais** (planos pagos) de ambos os editores, o que retorna ao problema original de custo

### 📋 Opções reais para uso sem custo

| Opção                              | Viável para produto proprietário? | Plugins premium?                              | Restrições                                      |
| ---------------------------------- | --------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| CKEditor GPL (`licenseKey: 'GPL'`) | ❌ Não (copyleft)                 | ❌ Não                                        | Obriga abrir código-fonte                       |
| CKEditor Free Plan (comercial)     | ✅ Sim                            | Limitado (Export PDF 5/mês, sem Merge Fields) | 1.000 editor loads/mês, badge "Powered by"      |
| TinyMCE GPL (self-hosted)          | ❌ Não (copyleft)                 | ❌ Não                                        | Obriga abrir código-fonte                       |
| TinyMCE Free Plan (cloud, API key) | ✅ Sim                            | Limitado (trial 14 dias apenas)               | 1.000 editor loads/mês, termos comerciais cloud |
| Editor alternativo MIT/Apache 2.0  | ✅ Sim                            | N/A                                           | Depende do editor escolhido                     |

### 💡 Nota sobre alternativas MIT/Apache

Existem editores rich text com licenças permissivas (MIT, Apache 2.0) que **não têm restrição copyleft**:

- **Tiptap** (MIT) — baseado em ProseMirror, extensível, sem plugins premium bloqueados por licença
- **Quill** (BSD) — editor WYSIWYG popular, mas menos features
- **Slate** (MIT) — framework de low-level, exige mais implementação
- **Lexical** (MIT, Meta) — moderno, mantido pelo Meta/Facebook

Estes podem ser relevantes se a restrição GPL for um impedimento. No entanto, **nenhum deles tem merge fields ou export to PDF nativos**, então a implementação seria totalmente customizada.

## Assumptions

⚠ Inferido que o objetivo é avaliar a viabilidade de **produção sem custo de licenciamento recorrente** — não necessariamente 100% feature-parity com os plugins premium

⚠ Inferido que a qualidade do PDF gerado por soluções client-side (html2pdf.js, jsPDF) pode ser inferior à dos serviços cloud dos editores — isso é um trade-off aceitável a ser documentado

⚠ **IMPORTANTE — Licenciamento GPL**: Inferido que o CKEditor 5 e TinyMCE sob GPL 2+ **não podem ser usados em produtos proprietários/closed-source** sem abrir o código-fonte do produto inteiro. Se o produto da Betha é proprietário, as opções reais são: (a) licenças comerciais pagas, (b) planos Free com limitações, ou (c) editores com licenças permissivas (MIT/Apache)

⚠ Inferido que o CKEditor 5 pode ser usado com `licenseKey: 'GPL'` para fins open-source, o que habilita os plugins core mas exibe o badge "Powered by CKEditor" e **não habilita plugins premium** (Merge Fields, ExportPdf, etc.)

⚠ Inferido que o TinyMCE pode ser self-hosted como open-source (GPL2+), mas os plugins premium (mergetags, exportpdf) **não estão incluídos** na versão open-source

⚠ Inferido que o CKEditor 5 **Free Plan comercial** (não-GPL) permite uso proprietário com 1.000 editor loads/mês e Export to PDF (5/mês), mas **sem Merge Fields** — o que pode ser a opção mais viável sem custo adicional

⚠ Inferido que `react-to-print` é a abordagem mais simples (usa `window.print` nativo do browser) mas pode ter limitações de fidelidade e não gera PDF diretamente (depende do "Save as PDF" do browser)

⚠ Inferido que `html2pdf.js` gera PDF como imagem (rasterizado via canvas) — o texto **não é selecionável** no PDF resultante, o que pode ser uma limitação importante

⚠ Inferido que esta POC continuará no mesmo repositório, como uma segunda iteração, adicionando novas rotas/páginas para as abordagens free

---

Essa interpretação está correta? Algum ponto precisa de ajuste antes de prosseguirmos para o solution-planning?
