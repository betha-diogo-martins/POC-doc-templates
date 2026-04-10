# POC — Testar Versões Legadas de TinyMCE (MIT) e CKEditor 4 (LGPL) na Aba Free

## Problem

A POC atual possui dois grupos de editores: **Premium/GPL** (CKEditor 5 v48, TinyMCE v7/8) e **Free/MIT/BSD** (Tiptap, Lexical, Quill). Ambos os editores premium atuais utilizam licença **GPL 2+**, que possui implicações de copyleft forte para uso em produtos proprietários.

Entretanto, versões anteriores desses mesmos editores possuíam licenças mais permissivas:

1. **TinyMCE v6.x** — Licença **MIT** (confirmado: npm `tinymce@6.8.5` mostra "License: MIT"). A v7+ mudou para GPL 2+.
2. **CKEditor 4.22.x e anteriores** — Licença **GPL/LGPL/MPL** (triple-license). A opção **LGPL 2.1** permite uso em produtos proprietários sem obrigação de copyleft viral sobre o produto inteiro, desde que o próprio CKEditor (se modificado) seja distribuído sob LGPL. A partir da v4.23.0-lts, a licença mudou para comercial exclusiva.

O objetivo é adicionar esses dois editores na **aba de editores Free** da POC e tentar implementar as mesmas features que já existem nos outros editores free (Tiptap, Lexical, Quill):

- ✅ Formatação rica (bold, italic, underline, headings, alinhamento, listas, indentação)
- ✅ Merge Fields (campos dinâmicos `{{campo}}` com badges visuais)
- ✅ Page Break (quebra de página visual)
- ✅ Inserção e redimensionamento de imagens
- ✅ Line Height e Paragraph Spacing customizáveis
- ✅ Export PDF (via html2pdf.js client-side)
- ✅ Preview PDF (modal com renderização A4)
- ✅ Spellcheck (via browser nativo)
- ✅ Painel de campos com apply/reset

## Expected Output

1. **Duas novas páginas** na POC: `TinyMCE 6 (MIT)` e `CKEditor 4 (LGPL)`, integradas na aba **Free**
2. **Implementação das features** listadas acima, usando:
   - Plugins nativos/OSS de cada editor quando disponíveis
   - Implementação customizada quando não houver plugin nativo
   - Documentação clara quando uma feature **não for possível** ou tiver limitações
3. **Tabela comparativa** ao final indicando: feature, como foi implementada (nativa, customizada, plugin comunidade), e observações

## Validation Criteria

- [ ] TinyMCE v6 carrega usando o pacote npm `tinymce@6.8.5` (self-hosted, sem API key)
- [ ] CKEditor 4 carrega usando o pacote npm `ckeditor4@4.22.1` (LGPL, sem license key)
- [ ] Ambos aparecem na aba "Free" da navegação
- [ ] Cada feature implementada ou limitação está documentada na tabela final
- [ ] O projeto continua funcionando com `npm install` → `npm run dev`
- [ ] O código segue as code conventions do projeto (Google JS/TS style)

## Assumptions

⚠ Inferido que "versão anterior a 4.x.x" do CKEditor se refere ao **CKEditor 4** (não CKEditor 3), pois o CKEditor 4 é a versão que possui licença LGPL e é viável para integração moderna. O CKEditor 3 (FCKEditor) é extremamente obsoleto e não possui pacote npm.

⚠ Inferido que TinyMCE v6.8.5 é a versão-alvo por ser a última release da linha v6 com licença MIT.

⚠ CKEditor 4 não é um editor React nativo — precisa de wrapper manual ou uso de `ckeditor4-react` (que também está na versão LGPL para v4.22.x). Pode haver limitações na integração com React 19.

⚠ CKEditor 4 é um editor "legacy" (baseado em iframe/contenteditable antigo) com API completamente diferente do CKEditor 5. Plugins e extensões não são compatíveis entre v4 e v5.

⚠ TinyMCE v6 self-hosted não requer API key — o pacote npm inclui todos os plugins open-source. Plugins premium (mergetags, exportpdf) **NÃO estão incluídos** no pacote MIT.

⚠ A implementação de Merge Fields em ambos os editores legados será via abordagem customizada (regex/replace + badges HTML), já que os plugins nativos de merge fields/tags são premium em ambos.

---

Essa interpretação está correta? Algum ponto precisa de ajuste?
