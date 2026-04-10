/**
 * React component rendered by Lexical ImageNode.decorate().
 * Provides an <img> with a drag-to-resize handle that maintains aspect ratio.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
import { $isImageNode } from "../../extensions/lexical";

export interface LexicalImageComponentProps {
  src: string;
  altText: string;
  width: number | null;
  height: number | null;
  nodeKey: string;
}

export default function LexicalImageComponent({
  src,
  altText,
  width,
  height,
  nodeKey,
}: LexicalImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);

  // Select node on click
  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        if (imgRef.current && imgRef.current.contains(event.target as Node)) {
          clearSelection();
          setSelected(true);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, clearSelection, setSelected]);

  /** Drag-to-resize with aspect ratio lock. */
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
        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = Math.round(newWidth / aspectRatio);
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

        // Persist into the Lexical node
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.setDimensions(newWidth, newHeight);
          }
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [editor, nodeKey],
  );

  return (
    <div
      className={`editor-image-container${isSelected ? " selected" : ""}${isResizing ? " resizing" : ""}`}
    >
      <img
        ref={imgRef}
        src={src}
        alt={altText}
        width={width ?? undefined}
        height={height ?? undefined}
        draggable={false}
      />
      {(isSelected || isResizing) && (
        <div
          className="editor-image-resizer"
          onMouseDown={handleMouseDown}
          title="Arrastar para redimensionar"
        />
      )}
    </div>
  );
}
