/**
 * Shared dropdown component for inserting merge fields into any editor.
 * Displays available fields grouped by category from MERGE_FIELDS config.
 * Editor-agnostic — receives an `onSelect` callback for insertion.
 */

import { useState, useRef, useEffect } from "react";
import {
  type MergeFieldDefinition,
} from "../../config/mergeFieldsConfig";
import { getFieldsByGroup } from "../../utils/customMergeFields";

export interface MergeFieldDropdownProps {
  /** Called when a field is selected from the dropdown. */
  onSelect: (fieldId: string, label: string) => void;
}

export default function MergeFieldDropdown({
  onSelect,
}: MergeFieldDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fieldsByGroup = getFieldsByGroup();

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (field: MergeFieldDefinition) => {
    onSelect(field.id, field.label);
    setIsOpen(false);
  };

  return (
    <div className="merge-field-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="merge-field-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Inserir campo dinâmico"
      >
        📎 Inserir Campo ▾
      </button>

      {isOpen && (
        <div className="merge-field-dropdown-menu">
          {Array.from(fieldsByGroup.entries()).map(([groupName, fields]) => (
            <div key={groupName}>
              <div className="merge-field-dropdown-group-title">
                {groupName}
              </div>
              {fields.map((field) => (
                <button
                  key={field.id}
                  type="button"
                  className="merge-field-dropdown-item"
                  onClick={() => handleSelect(field)}
                >
                  {field.label}
                  <code>{`{{${field.id}}}`}</code>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
