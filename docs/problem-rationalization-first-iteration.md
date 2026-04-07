# POC — Validação de Rich Text Editors para Templates de Documentos (CKEditor vs TinyMCE)

## Problem

É necessário validar qual rich text editor — **CKEditor** ou **TinyMCE** — é mais adequado para a criação de **templates de documentos** contendo:

- **Cabeçalho** (header fixo do template)
- **Corpo** com **campos editáveis/dinâmicos** que podem ser preenchidos via placeholder ou digitação direta nos campos
- **Rodapé** (footer fixo do template)

A POC precisa permitir:

1. Criar e editar templates visualmente nos dois editores
2. Preencher os campos do template (via placeholders ou digitação direta)
3. Exportar o documento como PDF utilizando os recursos nativos de exportação de cada biblioteca (ex: Export to PDF do CKEditor)

O **foco principal** é a criação dos templates e a validação da experiência de edição — a geração de PDF é secundária e deve usar as capacidades nativas dos editores, com download direto do arquivo.

## Expected Output

Um **repositório funcional** com:

- Uma aplicação web simples (SPA) com **duas rotas/páginas** — uma para cada editor
- Cada página deve permitir:
  - Criar um template com header, body (com campos dinâmicos) e footer
  - Preencher os campos via placeholder ou digitação direta
  - Exportar e **baixar** o resultado como PDF usando os recursos nativos da biblioteca
- Setup mínimo: `npm install` → `npm run dev`

## Validation Criteria

- [x] Os dois editores estão funcionando lado a lado na mesma aplicação
- [x] É possível criar um template com header, body com campos dinâmicos e footer em **ambos** os editores
- [x] Os campos dinâmicos podem ser preenchidos via placeholder e via digitação direta
- [x] A exportação para PDF funciona usando os recursos nativos de cada editor e o arquivo é baixado pelo navegador
- [x] O setup é simples: `npm install` → `npm run dev` sem configuração extra
- [x] O código segue o style guide Google JS/TS conforme definido no AGENTS.MD

## Assumptions

⚠ Inferido que a stack será **TypeScript** com um framework leve (ex: Vite + React) — dado o foco em rapidez da POC e as conventions do AGENTS.MD mencionando JS/TS

⚠ Inferido que "CKEditor" refere-se ao **CKEditor 5** (versão atual) e "Tiny" ao **TinyMCE 6/7**

⚠ Inferido que não há necessidade de persistência em banco de dados — templates podem ser mantidos em memória ou localStorage para fins de validação

⚠ Inferido que a funcionalidade de Export to PDF do CKEditor utiliza o plugin premium — pode exigir licença ou trial key. Para o TinyMCE, será avaliada a alternativa nativa equivalente ou fallback simples

⚠ Inferido que o padrão de campos dinâmicos não precisa seguir uma convenção específica — será definido conforme o que cada editor suportar nativamente (ex: merge fields, content blocks, etc.)
