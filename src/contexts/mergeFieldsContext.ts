/**
 * Context + hook for sharing the unified merge fields map
 * (standard + custom) from EditorShell down to MergeFieldDropdown.
 *
 * Separated from the Provider component to satisfy Vite Fast Refresh
 * (contexts and hooks must not live in the same file as components).
 */

import { createContext, useContext } from "react";
import type { MergeFieldDefinition } from "../config/mergeFieldsConfig";
import { getFieldsByGroup } from "../utils/customMergeFields";

export interface MergeFieldsContextValue {
  fieldsByGroup: Map<string, MergeFieldDefinition[]>;
}

export const MergeFieldsContext =
  createContext<MergeFieldsContextValue | null>(null);

/**
 * Consumes the MergeFieldsContext.
 * Falls back to the static `getFieldsByGroup()` if the context
 * is not available (e.g. component rendered outside EditorShell).
 */
export function useMergeFields(): MergeFieldsContextValue {
  const ctx = useContext(MergeFieldsContext);
  if (ctx) return ctx;
  return { fieldsByGroup: getFieldsByGroup() };
}
