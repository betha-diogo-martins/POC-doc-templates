/**
 * Custom Tiptap extension for paragraph spacing (margin-top / margin-bottom).
 * Adds setSpacingBefore/setSpacingAfter commands with inline style rendering.
 * Follows the same globalAttributes pattern as TextAlign.
 */

import { Extension } from "@tiptap/core";

export interface ParagraphSpacingOptions {
  types: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setSpacingBefore: (value: string) => ReturnType;
      setSpacingAfter: (value: string) => ReturnType;
      unsetSpacing: () => ReturnType;
    };
  }
}

export const ParagraphSpacing = Extension.create<ParagraphSpacingOptions>({
  name: "paragraphSpacing",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          spacingBefore: {
            default: null,
            parseHTML: (element) => {
              return element.style.marginTop || null;
            },
            renderHTML: (attributes) => {
              if (!attributes.spacingBefore) return {};
              return { style: `margin-top: ${attributes.spacingBefore}` };
            },
          },
          spacingAfter: {
            default: null,
            parseHTML: (element) => {
              return element.style.marginBottom || null;
            },
            renderHTML: (attributes) => {
              if (!attributes.spacingAfter) return {};
              return { style: `margin-bottom: ${attributes.spacingAfter}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setSpacingBefore:
        (value: string) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          let changed = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  spacingBefore: value,
                });
              }
              changed = true;
            }
          });

          return changed;
        },

      setSpacingAfter:
        (value: string) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          let changed = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  spacingAfter: value,
                });
              }
              changed = true;
            }
          });

          return changed;
        },

      unsetSpacing:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          let changed = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  spacingBefore: null,
                  spacingAfter: null,
                });
              }
              changed = true;
            }
          });

          return changed;
        },
    };
  },
});
