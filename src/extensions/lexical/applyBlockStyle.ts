/**
 * Utility to apply inline CSS styles to block-level elements in the current
 * Lexical selection. Used for line-height and paragraph spacing formatting
 * that Lexical doesn't support natively.
 *
 * @example
 * ```ts
 * import { applyBlockStyle } from "../extensions/lexical/applyBlockStyle";
 *
 * // Inside a toolbar handler:
 * applyBlockStyle(editor, "line-height", "1.5");
 * applyBlockStyle(editor, "margin-top", "1em");
 * ```
 */

import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  type LexicalEditor,
} from "lexical";

/**
 * Applies an inline CSS property/value to every block-level node in the
 * current range selection. Deduplicates blocks so each is styled only once.
 */
export function applyBlockStyle(
  editor: LexicalEditor,
  property: string,
  value: string,
): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const nodes = selection.getNodes();
    const visited = new Set<string>();

    for (const node of nodes) {
      const block = $isElementNode(node) ? node : node.getParent();
      if (block && $isElementNode(block) && !visited.has(block.getKey())) {
        visited.add(block.getKey());
        const el = editor.getElementByKey(block.getKey());
        if (el) {
          el.style.setProperty(property, value);
        }
      }
    }
  });
}
