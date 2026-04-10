/**
 * Custom Tiptap extension for Merge Fields.
 *
 * Renders dynamic fields as inline atomic badges (e.g. {{nome}})
 * that cannot be partially edited. The user inserts a field via a
 * toolbar dropdown, and it appears as a styled chip.
 *
 * Data attribute `data-field-id` stores the field identifier.
 */

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TiptapMergeFieldView from "../../components/merge-fields/TiptapMergeFieldView";

export interface MergeFieldOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mergeField: {
      insertMergeField: (fieldId: string, label: string) => ReturnType;
    };
  }
}

export const MergeField = Node.create<MergeFieldOptions>({
  name: "mergeField",

  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fieldId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-field-id"),
        renderHTML: (attributes) => ({
          "data-field-id": attributes.fieldId,
        }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => ({
          "data-label": attributes.label,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="merge-field"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "merge-field",
        class: "merge-field-badge",
      }),
      `{{${HTMLAttributes["data-field-id"]}}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapMergeFieldView);
  },

  addCommands() {
    return {
      insertMergeField:
        (fieldId: string, label: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { fieldId, label },
          });
        },
    };
  },
});
