/**
 * Tiptap NodeView component for the PageBreak extension.
 * Renders a dashed-line separator with a "Quebra de Página" label.
 */

import { NodeViewWrapper } from "@tiptap/react";

export default function TiptapPageBreakView() {
  return (
    <NodeViewWrapper className="page-break" contentEditable={false}>
      <span className="page-break-label">Quebra de Página</span>
    </NodeViewWrapper>
  );
}
