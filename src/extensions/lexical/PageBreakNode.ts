/**
 * Lexical DecoratorNode for page breaks.
 * Renders as a block-level separator with break-after: page for PDF export.
 * Supports importDOM (parses <div data-type="page-break">) and exportDOM.
 */

import type { JSX } from "react";
import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  $applyNodeReplacement,
  createCommand,
  type LexicalCommand,
} from "lexical";
import { createElement } from "react";
import LexicalPageBreakView from "../../components/page-break/LexicalPageBreakView";

// ── Command ────────────────────────────────────────────────────────────
export const INSERT_PAGE_BREAK_COMMAND: LexicalCommand<void> = createCommand(
  "INSERT_PAGE_BREAK_COMMAND",
);

// ── Node ───────────────────────────────────────────────────────────────
export class PageBreakNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "page-break";
  }

  static clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  // ── Serialization ────────────────────────────────────────────────────
  static importJSON(): PageBreakNode {
    return $createPageBreakNode();
  }

  exportJSON(): SerializedLexicalNode {
    return {
      ...super.exportJSON(),
      type: "page-break",
      version: 1,
    };
  }

  // ── DOM import ───────────────────────────────────────────────────────
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (domNode.getAttribute("data-type") !== "page-break") return null;
        return {
          conversion: (): DOMConversionOutput => ({
            node: $createPageBreakNode(),
          }),
          priority: 1,
        };
      },
      hr: (domNode: HTMLElement) => {
        if (!domNode.classList.contains("page-break")) return null;
        return {
          conversion: (): DOMConversionOutput => ({
            node: $createPageBreakNode(),
          }),
          priority: 1,
        };
      },
    };
  }

  // ── DOM export ───────────────────────────────────────────────────────
  exportDOM(): DOMExportOutput {
    const div = document.createElement("div");
    div.setAttribute("data-type", "page-break");
    div.className = "page-break";
    div.style.breakAfter = "page";

    const hr = document.createElement("hr");
    div.appendChild(hr);

    return { element: div };
  }

  // ── DOM creation ─────────────────────────────────────────────────────
  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  // ── Block behavior ───────────────────────────────────────────────────
  isInline(): boolean {
    return false;
  }

  // ── React rendering ──────────────────────────────────────────────────
  decorate(): JSX.Element {
    return createElement(LexicalPageBreakView);
  }
}

// ── Public factory ─────────────────────────────────────────────────────
export function $createPageBreakNode(): PageBreakNode {
  return $applyNodeReplacement(new PageBreakNode());
}

export function $isPageBreakNode(node: LexicalNode): node is PageBreakNode {
  return node instanceof PageBreakNode;
}
