/**
 * Resizable Image extension for Tiptap.
 * Extends the official @tiptap/extension-image with:
 *   - ReactNodeViewRenderer for interactive resize handles
 *   - Persisted width/height attributes (aspect-ratio locked on resize)
 *   - Serialized as <img width="..." height="..."> for PDF export fidelity
 */

import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TiptapResizableImageView from "../../components/image/TiptapResizableImageView";

export const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const w = element.getAttribute("width");
          return w ? parseInt(w, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const h = element.getAttribute("height");
          return h ? parseInt(h, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapResizableImageView);
  },
});
