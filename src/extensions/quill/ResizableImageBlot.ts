/**
 * Quill Block Embed Blot for resizable images.
 *
 * Wraps each image inside a `.editor-image-container` with a
 * `.editor-image-resizer` drag handle — reusing the same CSS classes
 * that Tiptap and Lexical already use so the look & feel is consistent.
 *
 * Stores `src`, `width`, and `height` in the blot value so resized
 * dimensions persist across serialisation.
 */

import { Quill } from "react-quill-new";

const BaseImage = Quill.import(
  "formats/image",
) as typeof import("parchment").EmbedBlot;

export interface ResizableImageValue {
  src: string;
  width?: number;
  height?: number;
}

class ResizableImageBlot extends BaseImage {
  static override blotName = "image";
  static override tagName = "SPAN";
  static override className = "editor-image-container";

  /** Aspect ratio cached during drag. */
  private static _ratio = 1;
  private static _startW = 0;
  private static _startX = 0;
  private static _activeContainer: HTMLElement | null = null;
  private static _activeImg: HTMLImageElement | null = null;

  // ─── Lifecycle ──────────────────────────────────────────────

  static override create(value: string | ResizableImageValue): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.classList.add("editor-image-container");
    wrapper.setAttribute("contenteditable", "false");

    const img = document.createElement("img");
    const src = typeof value === "string" ? value : value.src;
    img.setAttribute("src", src);
    img.setAttribute("draggable", "false");

    if (typeof value !== "string") {
      if (value.width) {
        img.setAttribute("width", String(value.width));
        wrapper.style.width = `${value.width}px`;
      }
      if (value.height) {
        img.setAttribute("height", String(value.height));
      }
    }

    // Click → toggle selection
    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".editor-image-container.selected")
        .forEach((el) => el.classList.remove("selected"));
      wrapper.classList.add("selected");
    });

    // Deselect on outside click
    const deselect = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        wrapper.classList.remove("selected");
      }
    };
    document.addEventListener("click", deselect);

    // Resize handle
    const handle = document.createElement("span");
    handle.classList.add("editor-image-resizer");
    handle.addEventListener("mousedown", (e) =>
      ResizableImageBlot._onResizeStart(e, wrapper, img),
    );

    wrapper.appendChild(img);
    wrapper.appendChild(handle);

    return wrapper;
  }

  static override value(domNode: HTMLElement): string | ResizableImageValue {
    const img = domNode.querySelector("img");
    if (!img) return "";
    const src = img.getAttribute("src") ?? "";
    const width = img.getAttribute("width");
    const height = img.getAttribute("height");
    if (width || height) {
      return {
        src,
        ...(width ? { width: Number(width) } : {}),
        ...(height ? { height: Number(height) } : {}),
      };
    }
    return src;
  }

  // ─── Resize logic ──────────────────────────────────────────

  private static _onResizeStart(
    e: MouseEvent,
    container: HTMLElement,
    img: HTMLImageElement,
  ): void {
    e.preventDefault();
    e.stopPropagation();

    const w = img.clientWidth || img.naturalWidth;
    const h = img.clientHeight || img.naturalHeight;

    ResizableImageBlot._ratio = h / (w || 1);
    ResizableImageBlot._startW = w;
    ResizableImageBlot._startX = e.clientX;
    ResizableImageBlot._activeContainer = container;
    ResizableImageBlot._activeImg = img;

    container.classList.add("resizing");

    document.addEventListener("mousemove", ResizableImageBlot._onResizeMove);
    document.addEventListener("mouseup", ResizableImageBlot._onResizeEnd);
  }

  private static _onResizeMove = (e: MouseEvent): void => {
    const img = ResizableImageBlot._activeImg;
    const container = ResizableImageBlot._activeContainer;
    if (!img || !container) return;

    const dx = e.clientX - ResizableImageBlot._startX;
    const newW = Math.max(50, ResizableImageBlot._startW + dx);
    const newH = Math.round(newW * ResizableImageBlot._ratio);

    img.setAttribute("width", String(Math.round(newW)));
    img.setAttribute("height", String(newH));
    container.style.width = `${Math.round(newW)}px`;
  };

  private static _onResizeEnd = (): void => {
    const container = ResizableImageBlot._activeContainer;
    if (container) container.classList.remove("resizing");

    ResizableImageBlot._activeContainer = null;
    ResizableImageBlot._activeImg = null;

    document.removeEventListener("mousemove", ResizableImageBlot._onResizeMove);
    document.removeEventListener("mouseup", ResizableImageBlot._onResizeEnd);
  };
}

export default ResizableImageBlot;
