/**
 * Custom Parchment StyleAttributor registrations for Quill.
 *
 * Registers three block-level format attributors:
 * - **lineHeight** — `line-height` (any numeric value, e.g. "1.5", "2")
 * - **spacingBefore** — `margin-top` (any CSS length, e.g. "1em", "2.33cm")
 * - **spacingAfter** — `margin-bottom` (any CSS length, e.g. "1em", "2.33cm")
 *
 * No whitelists — the attributors accept any value so users can type custom
 * measurements (e.g. "2.33cm" or "18pt").
 *
 * Must be called **once** before the Quill editor mounts, typically at
 * module scope in the component file.
 *
 * @example
 * ```ts
 * import { registerQuillFormattingAttributors } from "../extensions/quill";
 * registerQuillFormattingAttributors();
 * ```
 */

import { Quill } from "react-quill-new";
import MergeFieldBlot from "./MergeFieldBlot";
import PageBreakBlot from "./PageBreakBlot";
import ResizableImageBlot from "./ResizableImageBlot";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Parchment = Quill.import("parchment") as any;

const LineHeightStyle = new Parchment.StyleAttributor(
  "lineHeight",
  "line-height",
  { scope: Parchment.Scope.BLOCK },
);

const SpacingBeforeStyle = new Parchment.StyleAttributor(
  "spacingBefore",
  "margin-top",
  { scope: Parchment.Scope.BLOCK },
);

const SpacingAfterStyle = new Parchment.StyleAttributor(
  "spacingAfter",
  "margin-bottom",
  { scope: Parchment.Scope.BLOCK },
);

let registered = false;

/**
 * Register custom Parchment StyleAttributors for line-height and paragraph
 * spacing. Safe to call multiple times — registrations are idempotent.
 */
export function registerQuillFormattingAttributors(): void {
  if (registered) return;
  registered = true;

  Quill.register(LineHeightStyle, true);
  Quill.register(SpacingBeforeStyle, true);
  Quill.register(SpacingAfterStyle, true);
  Quill.register(MergeFieldBlot, true);
  Quill.register(PageBreakBlot, true);
  Quill.register(ResizableImageBlot, true);
}
