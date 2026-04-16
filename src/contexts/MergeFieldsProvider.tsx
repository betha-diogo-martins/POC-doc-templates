/**
 * Provider component for the MergeFieldsContext.
 * Wraps children with the shared merge fields map.
 */

import type { ReactNode } from "react";
import type { MergeFieldDefinition } from "../config/mergeFieldsConfig";
import { MergeFieldsContext } from "./mergeFieldsContext";

export interface MergeFieldsProviderProps {
  fieldsByGroup: Map<string, MergeFieldDefinition[]>;
  children: ReactNode;
}

export default function MergeFieldsProvider({
  fieldsByGroup,
  children,
}: MergeFieldsProviderProps) {
  return (
    <MergeFieldsContext.Provider value={{ fieldsByGroup }}>
      {children}
    </MergeFieldsContext.Provider>
  );
}
