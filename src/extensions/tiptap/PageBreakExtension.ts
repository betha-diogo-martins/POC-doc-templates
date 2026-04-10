/**
 * Custom Tiptap extension for Page Break.
 *
 * Inserts a block-level, non-editable separator that represents a manual
 * page break. Uses CSS `break-after: page` so html2pdf.js respects it
 * when generating the PDF.
 */

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TiptapPageBreakView from "../../components/page-break/TiptapPageBreakView";

export interface PageBreakOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create<PageBreakOptions>({
  name: "pageBreak",

  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="page-break"]' },
      { tag: "hr.page-break" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "page-break",
        class: "page-break",
        style: "break-after: page",
      }),
      ["hr"],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapPageBreakView);
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
