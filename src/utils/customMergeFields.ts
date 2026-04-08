/**
 * Custom merge fields utilities for editors without native merge field support.
 * Uses regex-based placeholder replacement ({{field}}) in HTML content.
 */

import { useState, useCallback } from "react";
import {
  MERGE_FIELDS,
  type MergeFieldDefinition,
} from "../config/mergeFieldsConfig";

/** Regex that matches {{fieldId}} placeholders in text/HTML. */
const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Replaces all {{field}} placeholders in HTML with provided values.
 * Fields without a corresponding value are left unchanged.
 */
export function replacePlaceholders(
  html: string,
  values: Record<string, string>,
): string {
  return html.replace(PLACEHOLDER_REGEX, (match, fieldId: string) => {
    return values[fieldId] !== undefined && values[fieldId] !== ""
      ? values[fieldId]
      : match;
  });
}

/**
 * Restores all field values back to {{field}} placeholders in HTML.
 * Searches for known field values and replaces them with placeholders.
 */
export function restorePlaceholders(
  html: string,
  values: Record<string, string>,
): string {
  let result = html;
  for (const [fieldId, value] of Object.entries(values)) {
    if (value) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "g"), `{{${fieldId}}}`);
    }
  }
  return result;
}

/** Extracts all unique placeholder field IDs from HTML content. */
export function extractPlaceholders(html: string): string[] {
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(PLACEHOLDER_REGEX.source, "g");
  while ((match = regex.exec(html)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

/**
 * Returns CSS string to visually highlight {{field}} placeholders inside editors.
 * Designed to work with content_style or injected <style> tags.
 */
export function getPlaceholderHighlightCSS(): string {
  return `
    /* Placeholder highlighting is handled by the FieldsPanel badges */
  `;
}

/** Groups MERGE_FIELDS by their group property. */
export function getFieldsByGroup(): Map<string, MergeFieldDefinition[]> {
  const groups = new Map<string, MergeFieldDefinition[]>();
  for (const field of MERGE_FIELDS) {
    const group = field.group ?? "Geral";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(field);
  }
  return groups;
}

/**
 * React hook to manage field values state.
 * Initializes with default values from MERGE_FIELDS config.
 */
export function useFieldValues() {
  const buildDefaults = useCallback((): Record<string, string> => {
    const defaults: Record<string, string> = {};
    for (const field of MERGE_FIELDS) {
      defaults[field.id] = field.defaultValue;
    }
    return defaults;
  }, []);

  const [values, setValues] = useState<Record<string, string>>(buildDefaults);

  const updateField = useCallback((fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setValues(buildDefaults());
  }, [buildDefaults]);

  const clearAll = useCallback(() => {
    const empty: Record<string, string> = {};
    for (const field of MERGE_FIELDS) {
      empty[field.id] = "";
    }
    setValues(empty);
  }, []);

  return { values, updateField, resetToDefaults, clearAll };
}
