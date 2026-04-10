/**
 * Quill Block Embed Blot for page breaks.
 * Renders as a non-editable <div> with visual separator and CSS break-after: page
 * for PDF export support.
 */

import { Quill } from "react-quill-new";

const BlockEmbed = Quill.import(
  "blots/block/embed",
) as typeof import("parchment").EmbedBlot;

class PageBreakBlot extends BlockEmbed {
  static override blotName = "page-break";
  static override tagName = "DIV";
  static override className = "page-break";

  static override create(): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute("data-type", "page-break");
    node.setAttribute("contenteditable", "false");
    node.style.breakAfter = "page";

    const label = document.createElement("span");
    label.className = "page-break-label";
    label.textContent = "Quebra de Página";
    node.appendChild(label);

    return node;
  }

  static override value(): boolean {
    return true;
  }
}

export default PageBreakBlot;
