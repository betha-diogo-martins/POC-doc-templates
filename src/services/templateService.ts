import type {
  TemplateDoc,
  TemplateType,
  CreateTemplateInput,
  UpdateTemplateInput,
} from "../types/template";

const API_BASE = "/api/templates";

/** Default multi-tenancy values for the POC. */
const DEFAULT_TENANT = {
  databaseId: "poc-db",
  systemId: "poc-system",
};

/** Fetches all templates, optionally filtered by type. */
export async function fetchTemplates(
  type?: TemplateType,
): Promise<TemplateDoc[]> {
  const params = new URLSearchParams({
    databaseId: DEFAULT_TENANT.databaseId,
    systemId: DEFAULT_TENANT.systemId,
  });
  if (type) params.set("type", type);

  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

/** Fetches a single template by ID. */
export async function fetchTemplateById(id: string): Promise<TemplateDoc> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json();
}

/** Creates a new template. */
export async function createTemplate(
  input: CreateTemplateInput,
): Promise<TemplateDoc> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...DEFAULT_TENANT, ...input }),
  });
  if (!res.ok) throw new Error("Failed to create template");
  return res.json();
}

/** Updates an existing template. */
export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput,
): Promise<TemplateDoc> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update template");
  return res.json();
}

/** Deletes a template by ID. */
export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete template");
}
