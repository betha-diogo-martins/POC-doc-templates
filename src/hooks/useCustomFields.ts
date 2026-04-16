/**
 * Hook for managing custom merge field sections and fields.
 * Custom fields are session-local (not persisted to the backend).
 */

import { useState, useCallback, useMemo } from "react";
import {
  MERGE_FIELDS,
  type MergeFieldDefinition,
} from "../config/mergeFieldsConfig";

/** Standard group names that cannot be removed. */
const STANDARD_GROUPS = new Set(
  MERGE_FIELDS.map((f) => f.group ?? "Geral"),
);

export interface CustomField {
  id: string;
  label: string;
  defaultValue: string;
  group: string;
}

export interface UseCustomFieldsReturn {
  customFields: CustomField[];
  customGroups: string[];
  addGroup: (groupName: string) => boolean;
  removeGroup: (groupName: string) => void;
  addField: (field: Omit<CustomField, "id">) => CustomField | null;
  removeField: (fieldId: string) => void;
  /**
   * Returns a unified Map of standard + custom fields grouped by section name.
   */
  getAllFieldsByGroup: () => Map<string, MergeFieldDefinition[]>;
  /** Returns true when the given group is user-created (removable). */
  isCustomGroup: (groupName: string) => boolean;
  /** Returns true when the given field id belongs to a custom field. */
  isCustomField: (fieldId: string) => boolean;
}

/**
 * Generates a slug-style id from a label.
 * Example: "Nome Fantasia" → "nome_fantasia"
 */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
}

export function useCustomFields(): UseCustomFieldsReturn {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customGroups, setCustomGroups] = useState<string[]>([]);

  /** Set of all existing field ids (standard + custom) for uniqueness checks. */
  const allFieldIds = useMemo(() => {
    const ids = new Set(MERGE_FIELDS.map((f) => f.id));
    for (const f of customFields) {
      ids.add(f.id);
    }
    return ids;
  }, [customFields]);

  const isCustomGroup = useCallback(
    (groupName: string) => !STANDARD_GROUPS.has(groupName),
    [],
  );

  const isCustomField = useCallback(
    (fieldId: string) => customFields.some((f) => f.id === fieldId),
    [customFields],
  );

  const addGroup = useCallback(
    (groupName: string): boolean => {
      const trimmed = groupName.trim();
      if (!trimmed) return false;
      // Check uniqueness against standard groups AND custom groups
      if (STANDARD_GROUPS.has(trimmed)) return false;
      if (customGroups.includes(trimmed)) return false;
      setCustomGroups((prev) => [...prev, trimmed]);
      return true;
    },
    [customGroups],
  );

  const removeGroup = useCallback((groupName: string) => {
    if (STANDARD_GROUPS.has(groupName)) return; // safety guard
    setCustomGroups((prev) => prev.filter((g) => g !== groupName));
    setCustomFields((prev) => prev.filter((f) => f.group !== groupName));
  }, []);

  const addField = useCallback(
    (field: Omit<CustomField, "id">): CustomField | null => {
      const baseId = slugify(field.label);
      if (!baseId) return null;

      // Ensure uniqueness — append counter if needed
      let candidateId = baseId;
      let counter = 1;
      while (allFieldIds.has(candidateId)) {
        candidateId = `${baseId}_${counter}`;
        counter++;
      }

      const newField: CustomField = { ...field, id: candidateId };
      setCustomFields((prev) => [...prev, newField]);
      return newField;
    },
    [allFieldIds],
  );

  const removeField = useCallback((fieldId: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== fieldId));
  }, []);

  const getAllFieldsByGroup = useCallback((): Map<
    string,
    MergeFieldDefinition[]
  > => {
    const groups = new Map<string, MergeFieldDefinition[]>();

    // Standard fields first
    for (const field of MERGE_FIELDS) {
      const group = field.group ?? "Geral";
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(field);
    }

    // Custom groups (ensure they appear even if empty)
    for (const groupName of customGroups) {
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
    }

    // Custom fields
    for (const field of customFields) {
      const group = field.group;
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push({
        id: field.id,
        label: field.label,
        defaultValue: field.defaultValue,
        group: field.group,
      });
    }

    return groups;
  }, [customFields, customGroups]);

  return {
    customFields,
    customGroups,
    addGroup,
    removeGroup,
    addField,
    removeField,
    getAllFieldsByGroup,
    isCustomGroup,
    isCustomField,
  };
}
