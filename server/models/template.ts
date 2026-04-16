import { ObjectId } from "mongodb";

/** Allowed template types. */
export type TemplateType = "header" | "body" | "footer";

/** MongoDB document schema for a template. */
export interface Template {
  _id?: ObjectId;
  /** Multi-tenancy: database identifier. */
  databaseId: string;
  /** Multi-tenancy: system identifier. */
  systemId: string;
  /** Display name of the template. */
  name: string;
  /** Template category: header, body, or footer. */
  type: TemplateType;
  /** HTML content that composes this template. */
  definition: string;
  /** Audit: creation timestamp. */
  createdAt: Date;
  /** Audit: last update timestamp. */
  updatedAt: Date;
}

/** Payload for creating a new template (audit fields are auto-generated). */
export type CreateTemplatePayload = Pick<
  Template,
  "databaseId" | "systemId" | "name" | "type" | "definition"
>;

/** Payload for updating an existing template. */
export type UpdateTemplatePayload = Partial<
  Pick<Template, "name" | "type" | "definition">
>;
