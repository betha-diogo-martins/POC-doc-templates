/** Template type enum shared between frontend and backend. */
export type TemplateType = "header" | "body" | "footer";

/** Template document as returned by the API. */
export interface TemplateDoc {
  _id: string;
  databaseId: string;
  systemId: string;
  name: string;
  type: TemplateType;
  definition: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new template. */
export interface CreateTemplateInput {
  name: string;
  type: TemplateType;
  definition: string;
}

/** Payload for updating an existing template. */
export interface UpdateTemplateInput {
  name?: string;
  type?: TemplateType;
  definition?: string;
}
