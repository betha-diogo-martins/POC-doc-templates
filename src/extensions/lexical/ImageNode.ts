/**
 * Lexical DecoratorNode for images with resizable dimensions.
 * Renders via a React component that provides drag-to-resize with aspect ratio lock.
 * Supports importDOM (<img>) and exportDOM.
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
import LexicalImageComponent from "../../components/image/LexicalImageComponent";

// ── Command ────────────────────────────────────────────────────────────
export type InsertImagePayload = {
  src: string;
  altText?: string;
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

// ── Serialization type ─────────────────────────────────────────────────
export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number | null;
    height: number | null;
  },
  SerializedLexicalNode
>;

// ── Node ───────────────────────────────────────────────────────────────
export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | null;
  __height: number | null;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: number | null,
    height?: number | null,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width ?? null;
    this.__height = height ?? null;
  }

  // ── Dimension setter (called from resize component) ──────────────────
  setDimensions(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  // ── Serialization ────────────────────────────────────────────────────
  static importJSON(json: SerializedImageNode): ImageNode {
    return $createImageNode(json.src, json.altText, json.width, json.height);
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: "image",
      version: 1,
    };
  }

  // ── DOM import ───────────────────────────────────────────────────────
  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  // ── DOM export ───────────────────────────────────────────────────────
  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.setAttribute("src", this.__src);
    img.setAttribute("alt", this.__altText);
    if (this.__width) img.setAttribute("width", String(this.__width));
    if (this.__height) img.setAttribute("height", String(this.__height));
    img.style.maxWidth = "100%";
    return { element: img };
  }

  // ── DOM creation ─────────────────────────────────────────────────────
  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.style.display = "inline-block";
    return span;
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
    return createElement(LexicalImageComponent, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      nodeKey: this.getKey(),
    });
  }
}

// ── Conversion helper ──────────────────────────────────────────────────
function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  const src = domNode.getAttribute("src");
  if (!src) return null;
  const altText = domNode.getAttribute("alt") ?? "";
  const widthAttr = domNode.getAttribute("width");
  const heightAttr = domNode.getAttribute("height");
  const width = widthAttr ? parseInt(widthAttr, 10) : null;
  const height = heightAttr ? parseInt(heightAttr, 10) : null;
  return { node: $createImageNode(src, altText, width, height) };
}

// ── Public factories ───────────────────────────────────────────────────
export function $createImageNode(
  src: string,
  altText: string = "",
  width?: number | null,
  height?: number | null,
): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height));
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
