/**
 * Lexical DecoratorNode for merge field badges.
 * Renders as an inline, non-editable badge that displays the field label.
 * Supports importDOM (parses <span data-type="merge-field">) and exportDOM.
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
  type Spread,
  $applyNodeReplacement,
  createCommand,
  type LexicalCommand,
} from "lexical";
import { createElement } from "react";
import LexicalMergeFieldBadge from "../../components/merge-fields/LexicalMergeFieldBadge";

// ── Command ────────────────────────────────────────────────────────────
export type InsertMergeFieldPayload = {
  fieldId: string;
  label: string;
};

export const INSERT_MERGE_FIELD_COMMAND: LexicalCommand<InsertMergeFieldPayload> =
  createCommand("INSERT_MERGE_FIELD_COMMAND");

// ── Serialization type ─────────────────────────────────────────────────
export type SerializedMergeFieldNode = Spread<
  { fieldId: string; label: string },
  SerializedLexicalNode
>;

// ── Node ───────────────────────────────────────────────────────────────
export class MergeFieldNode extends DecoratorNode<JSX.Element> {
  __fieldId: string;
  __label: string;

  static getType(): string {
    return "merge-field";
  }

  static clone(node: MergeFieldNode): MergeFieldNode {
    return new MergeFieldNode(node.__fieldId, node.__label, node.__key);
  }

  constructor(fieldId: string, label: string, key?: NodeKey) {
    super(key);
    this.__fieldId = fieldId;
    this.__label = label;
  }

  // ── Creation helpers ─────────────────────────────────────────────────
  static importJSON(json: SerializedMergeFieldNode): MergeFieldNode {
    return $createMergeFieldNode(json.fieldId, json.label);
  }

  exportJSON(): SerializedMergeFieldNode {
    return {
      ...super.exportJSON(),
      fieldId: this.__fieldId,
      label: this.__label,
      type: "merge-field",
      version: 1,
    };
  }

  // ── DOM import (used by $generateNodesFromDOM) ───────────────────────
  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (domNode.getAttribute("data-type") !== "merge-field") return null;
        return {
          conversion: convertMergeFieldElement,
          priority: 1,
        };
      },
    };
  }

  // ── DOM export (used by $generateHtmlFromNodes) ──────────────────────
  exportDOM(): DOMExportOutput {
    const span = document.createElement("span");
    span.setAttribute("data-type", "merge-field");
    span.setAttribute("data-field-id", this.__fieldId);
    span.setAttribute("data-label", this.__label);
    span.className = "merge-field-badge";
    span.textContent = `{{${this.__fieldId}}}`;
    return { element: span };
  }

  // ── DOM creation (for editor rendering) ──────────────────────────────
  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.style.display = "inline";
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  // ── Inline behavior ──────────────────────────────────────────────────
  isInline(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return true;
  }

  // ── React rendering ──────────────────────────────────────────────────
  decorate(): JSX.Element {
    return createElement(LexicalMergeFieldBadge, {
      fieldId: this.__fieldId,
      label: this.__label,
    });
  }
}

// ── Conversion helper ──────────────────────────────────────────────────
function convertMergeFieldElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const fieldId = domNode.getAttribute("data-field-id");
  const label =
    domNode.getAttribute("data-label") ?? fieldId ?? "campo";
  if (!fieldId) return null;
  return { node: $createMergeFieldNode(fieldId, label) };
}

// ── Public factory ─────────────────────────────────────────────────────
export function $createMergeFieldNode(
  fieldId: string,
  label: string,
): MergeFieldNode {
  return $applyNodeReplacement(new MergeFieldNode(fieldId, label));
}

export function $isMergeFieldNode(node: LexicalNode): node is MergeFieldNode {
  return node instanceof MergeFieldNode;
}
