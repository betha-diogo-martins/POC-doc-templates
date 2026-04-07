# POC — Document Templates (CKEditor 5 vs TinyMCE)

Repositório de POC para validar o uso de rich text editors — **CKEditor 5** e **TinyMCE** — na criação de templates de documentos com cabeçalho, corpo com campos dinâmicos e rodapé.

## Objetivos

- Criar templates com header, body (campos editáveis/dinâmicos) e footer
- Preencher campos via placeholder (`{{campo}}`) ou digitação direta
- Exportar o documento como PDF usando os recursos nativos de cada editor
- Comparar a experiência de desenvolvimento e uso entre os dois editores

## Stack

- **Vite** + **React** + **TypeScript**
- **CKEditor 5** (Merge Fields + Export to PDF — premium, trial)
- **TinyMCE** (Merge Tags + Export to PDF — premium, trial)
- **React Router DOM** para navegação entre páginas

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/betha-diogo-martins/POC-doc-templates.git
cd POC-doc-templates
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com suas chaves:

```env
VITE_CK_EDITOR_LICENSE_KEY=sua_license_key_do_ckeditor
VITE_TINY_CLOUD_API_KEY=sua_api_key_do_tinymce
```

- **CKEditor**: Obtenha em [portal.ckeditor.com](https://portal.ckeditor.com/checkout?plan=free) (trial gratuito de 14 dias)
- **TinyMCE**: Obtenha em [tiny.cloud](https://www.tiny.cloud/auth/signup/) (API key gratuita)

### 3. Rodar

```bash
npm run dev
```

Acesse `http://localhost:5173` e navegue entre as abas **CKEditor 5** e **TinyMCE**.

## Estrutura do Projeto

```
src/
├── main.tsx                        # Entrypoint com Router
├── App.tsx                         # Layout com navegação
├── pages/
│   ├── CKEditorPage.tsx            # Página CKEditor
│   └── TinyMCEPage.tsx             # Página TinyMCE
├── components/
│   ├── CKEditorTemplate.tsx        # Editor CKEditor configurado
│   └── TinyMCETemplate.tsx         # Editor TinyMCE configurado
├── config/
│   ├── mergeFieldsConfig.ts        # Campos dinâmicos compartilhados
│   └── templateConfig.ts           # Template HTML inicial
└── index.css                       # Estilos globais
```

## Campos Dinâmicos Disponíveis

| Campo                  | Label               | Exemplo                |
| ---------------------- | ------------------- | ---------------------- |
| `{{nome}}`             | Nome Completo       | João da Silva          |
| `{{cargo}}`            | Cargo               | Analista de Sistemas   |
| `{{departamento}}`     | Departamento        | Tecnologia             |
| `{{email}}`            | E-mail              | joao.silva@empresa.com |
| `{{data}}`             | Data do Documento   | 07/04/2026             |
| `{{numero_documento}}` | Número do Documento | DOC-2026-001           |
| `{{empresa}}`          | Nome da Empresa     | Betha Sistemas         |
| `{{cnpj}}`             | CNPJ                | 00.000.000/0001-00     |

## Documentação

- [`docs/problem-rationalization.md`](docs/problem-rationalization.md) — Definição estruturada do problema e critérios de validação
- [`docs/solution-planning.md`](docs/solution-planning.md) — Plano de implementação, ADRs e log de implementação

## Licenciamento

- **CKEditor 5**: Merge Fields e Export to PDF são plugins **premium**. Trial gratuito de 14 dias em [portal.ckeditor.com](https://portal.ckeditor.com/checkout?plan=free).
- **TinyMCE**: Merge Tags e Export to PDF são plugins **pagos**. API key gratuita em [tiny.cloud](https://www.tiny.cloud/auth/signup/). Export PDF no trial gera PDFs com watermark (sem JWT).
