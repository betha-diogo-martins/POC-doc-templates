/**
 * Tiptap NodeView component for the MergeField extension.
 * Renders a styled badge showing the field label inside the editor.
 */

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function TiptapMergeFieldView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper as="span" className="merge-field-badge">
      {node.attrs.label || node.attrs.fieldId}
    </NodeViewWrapper>
  );
}
