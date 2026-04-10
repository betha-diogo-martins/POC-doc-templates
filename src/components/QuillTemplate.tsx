/**
 * Quill rich text editor template component (BSD 3-Clause license).
 * Uses react-quill-new wrapper with merge field badges, page break,
 * image upload with file picker, PDF export, advanced formatting
 * (indent, line-height, spacing), and spellcheck.
 */

import { useRef, useState, useCallback, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DOCUMENT_TEMPLATE_WITH_BADGES } from "../config/templateConfig";
import {
  registerQuillFormattingAttributors,
  QUILL_MODULES,
  QUILL_FORMATS,
} from "../extensions/quill";
import SpacingControls from "./SpacingControls";
import FieldsPanel from "./FieldsPanel";
import MergeFieldDropdown from "./merge-fields/MergeFieldDropdown";

/* Register Parchment Attributors (idempotent — safe at module scope). */
registerQuillFormattingAttributors();

export default function QuillTemplate() {
  const [content, setContent] = useState(DOCUMENT_TEMPLATE_WITH_BADGES);
  const printRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageHandlerRegistered = useRef(false);

  const getEditorHtml = useCallback(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      return editor.root.innerHTML;
    }
    return content;
  }, [content]);

  const setEditorHtml = useCallback((html: string) => {
    setContent(html);
  }, []);

  const handleLineHeight = (value: string) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (!range) return;
    editor.formatLine(range.index, range.length || 1, "lineHeight", value);
  };

  const handleSpacing = (value: string) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (!range) return;
    editor.formatLine(range.index, range.length || 1, "spacingBefore", value);
    editor.formatLine(range.index, range.length || 1, "spacingAfter", value);
  };

  /** Insert a merge field badge at the current cursor position. */
  const handleInsertMergeField = (fieldId: string, label: string) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    editor.insertEmbed(range.index, "merge-field", { fieldId, label }, "user");
    editor.setSelection(range.index + 1, 0);
  };

  /** Insert a page break at the current cursor position. */
  const handleInsertPageBreak = () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    // Insert a newline first to ensure the embed is on its own line
    editor.insertText(range.index, "\n", "user");
    editor.insertEmbed(range.index + 1, "page-break", true, "user");
    editor.setSelection(range.index + 2, 0);
  };

  /** Handle image file selection → insert as base64 embed. */
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.insertEmbed(range.index, "image", src, "user");
      editor.setSelection(range.index + 1, 0);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /**
   * Override the native Quill image toolbar button handler.
   * Instead of prompting for a URL, opens a file picker dialog.
   */
  useEffect(() => {
    if (!quillRef.current || imageHandlerRegistered.current) return;
    const editor = quillRef.current.getEditor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolbar = editor.getModule("toolbar") as any;
    if (toolbar) {
      toolbar.addHandler("image", () => {
        fileInputRef.current?.click();
      });
      imageHandlerRegistered.current = true;
    }
  });

  return (
    <div className="editor-with-panel">
      <div className="editor-main">
        <div className="editor-wrapper">
          {/* Custom toolbar row — spacing + merge fields + page break */}
          <div className="quill-custom-toolbar">
            <SpacingControls
              onLineHeight={handleLineHeight}
              onSpacing={handleSpacing}
            />

            <div className="toolbar-separator" />

            <MergeFieldDropdown onSelect={handleInsertMergeField} />

            <div className="toolbar-separator" />

            <button
              type="button"
              className="toolbar-btn"
              onClick={handleInsertPageBreak}
              title="Inserir quebra de página"
            >
              📄 Page Break
            </button>
          </div>

          {/* Hidden file input for image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileSelected}
          />

          <div ref={printRef} lang="pt-BR">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              className="quill-editor"
            />
          </div>
        </div>
      </div>

      <FieldsPanel
        getEditorHtml={getEditorHtml}
        setEditorHtml={setEditorHtml}
        printRef={printRef}
        useBadges
      />
    </div>
  );
}
