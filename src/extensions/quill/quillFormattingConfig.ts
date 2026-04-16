/**
 * Quill toolbar modules and allowed formats configuration.
 *
 * Centralises the toolbar layout and format whitelist so the component
 * stays focused on rendering and state management.
 *
 * Note: lineHeight, spacingBefore, and spacingAfter are NOT in the native
 * toolbar — they are controlled via custom React controls in the extra toolbar.
 * They are still registered as allowed formats so Quill preserves them.
 */

/** Quill toolbar modules configuration. */
export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "link", "image"],
    ["clean"],
  ],
};

/** Quill formats allowed in the editor. */
export const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "indent",
  "lineHeight",
  "spacingBefore",
  "spacingAfter",
  "color",
  "background",
  "blockquote",
  "link",
  "image",
  "merge-field",
  "page-break",
  "table",
  "tr",
  "td",
];
