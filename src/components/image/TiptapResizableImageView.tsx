/**
 * Tiptap NodeView for resizable images.
 * Renders an <img> with a drag handle at the bottom-right corner.
 * Resize maintains aspect ratio to prevent stretching.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function TiptapResizableImageView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Read persisted dimensions (or fall back to natural size / auto)
  const width = node.attrs.width as number | null;
  const height = node.attrs.height as number | null;
  const alignment = (node.attrs.alignment as string) ?? null;
  const src = node.attrs.src as string;
  const alt = (node.attrs.alt as string) ?? "";
  const title = (node.attrs.title as string) ?? "";

  /**
   * Start resize on mousedown on the handle.
   * We track initial pointer position + image dimensions, then compute
   * the new width on every mousemove, deriving height from the
   * original aspect ratio.
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const img = imgRef.current;
      if (!img) return;

      const startX = e.clientX;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;
      const aspectRatio = startWidth / startHeight;

      setIsResizing(true);

      const onMouseMove = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX); // min 50px
        const newHeight = Math.round(newWidth / aspectRatio);

        // Apply live preview via style (not attributes, to avoid ProseMirror re-render flicker)
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        setIsResizing(false);

        const deltaX = ev.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = Math.round(newWidth / aspectRatio);

        // Persist final size into node attributes (triggers ProseMirror transaction)
        updateAttributes({ width: newWidth, height: newHeight });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes],
  );

  // When the natural image loads and no width/height is persisted, store the natural size
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    if (!width && !height) {
      // Clamp to max 100% of container via CSS, but store natural values for aspect ratio
      // Don't persist to attributes unless the user explicitly resizes
    }
  }, [width, height]);

  // Disable browser drag on the image while resizing
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const preventDrag = (e: DragEvent) => {
      if (isResizing) e.preventDefault();
    };
    img.addEventListener("dragstart", preventDrag);
    return () => img.removeEventListener("dragstart", preventDrag);
  }, [isResizing]);

  return (
    <NodeViewWrapper
      as="div"
      className={`editor-image-container${selected ? " selected" : ""}${isResizing ? " resizing" : ""}`}
      draggable={!isResizing}
      data-drag-handle=""
      data-align={alignment || undefined}
    >
      {selected && (
        <div className="image-align-toolbar">
          <button type="button" title="Alinhar à esquerda" className={alignment === "left" ? "active" : ""} onClick={() => updateAttributes({ alignment: "left" })}>⬅</button>
          <button type="button" title="Centralizar" className={alignment === "center" ? "active" : ""} onClick={() => updateAttributes({ alignment: "center" })}>⬛</button>
          <button type="button" title="Alinhar à direita" className={alignment === "right" ? "active" : ""} onClick={() => updateAttributes({ alignment: "right" })}>➡</button>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        title={title}
        width={width ?? undefined}
        height={height ?? undefined}
        onLoad={handleImageLoad}
        draggable={false}
      />
      {/* Resize handle — only visible when the node is selected or hovered */}
      <div
        className="editor-image-resizer"
        onMouseDown={handleMouseDown}
        title="Arrastar para redimensionar"
      />
    </NodeViewWrapper>
  );
}
