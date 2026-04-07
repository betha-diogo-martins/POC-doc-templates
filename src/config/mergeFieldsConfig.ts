/**
 * Shared merge fields configuration used by both CKEditor and TinyMCE.
 * Defines the dynamic fields available in the document template.
 */

export interface MergeFieldDefinition {
  id: string;
  label: string;
  defaultValue: string;
  group?: string;
}

export const MERGE_FIELDS: MergeFieldDefinition[] = [
  {
    id: "nome",
    label: "Nome Completo",
    defaultValue: "João da Silva",
    group: "Pessoa",
  },
  {
    id: "cargo",
    label: "Cargo",
    defaultValue: "Analista de Sistemas",
    group: "Pessoa",
  },
  {
    id: "departamento",
    label: "Departamento",
    defaultValue: "Tecnologia",
    group: "Pessoa",
  },
  {
    id: "email",
    label: "E-mail",
    defaultValue: "joao.silva@empresa.com",
    group: "Pessoa",
  },
  {
    id: "data",
    label: "Data do Documento",
    defaultValue: "07/04/2026",
    group: "Documento",
  },
  {
    id: "numero_documento",
    label: "Número do Documento",
    defaultValue: "DOC-2026-001",
    group: "Documento",
  },
  {
    id: "empresa",
    label: "Nome da Empresa",
    defaultValue: "Betha Sistemas",
    group: "Empresa",
  },
  {
    id: "cnpj",
    label: "CNPJ",
    defaultValue: "00.000.000/0001-00",
    group: "Empresa",
  },
];

/** CKEditor 5 Merge Fields definitions format. */
export function getCKEditorMergeFieldsConfig() {
  const groups = new Map<string, MergeFieldDefinition[]>();

  for (const field of MERGE_FIELDS) {
    const group = field.group ?? "Geral";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(field);
  }

  return Array.from(groups.entries()).map(([groupLabel, fields]) => ({
    groupId: groupLabel.toLowerCase().replace(/\s+/g, "_"),
    groupLabel,
    definitions: fields.map((f) => ({
      id: f.id,
      label: f.label,
      defaultValue: f.defaultValue,
    })),
  }));
}

/** TinyMCE Merge Tags list format. */
export function getTinyMCEMergeTagsList() {
  const groups = new Map<string, MergeFieldDefinition[]>();

  for (const field of MERGE_FIELDS) {
    const group = field.group ?? "Geral";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(field);
  }

  return Array.from(groups.entries()).map(([title, fields]) => ({
    title,
    menu: fields.map((f) => ({
      value: f.id,
      title: f.label,
    })),
  }));
}
