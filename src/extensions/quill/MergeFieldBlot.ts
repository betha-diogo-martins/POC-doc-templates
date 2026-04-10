/**
 * Quill Inline Embed Blot for merge field badges.
 * Renders as a non-editable <span> with data attributes, matching
 * the same HTML format used by Tiptap and Lexical for cross-editor compatibility.
 */

import { Quill } from "react-quill-new";

const InlineEmbed = Quill.import("blots/embed") as typeof import("parchment").EmbedBlot;

export interface MergeFieldValue {
  fieldId: string;
  label: string;
}

class MergeFieldBlot extends InlineEmbed {
  static override blotName = "merge-field";
  static override tagName = "SPAN";
  static override className = "merge-field-badge";

  static override create(value: MergeFieldValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute("data-type", "merge-field");
    node.setAttribute("data-field-id", value.fieldId);
    node.setAttribute("data-label", value.label);
    node.setAttribute("contenteditable", "false");
    node.textContent = value.label || `{{${value.fieldId}}}`;
    return node;
  }

  static override value(domNode: HTMLElement): MergeFieldValue {
    return {
      fieldId: domNode.getAttribute("data-field-id") ?? "",
      label: domNode.getAttribute("data-label") ?? "",
    };
  }
}

export default MergeFieldBlot;
