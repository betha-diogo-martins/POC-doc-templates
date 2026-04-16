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
import MergeFieldDropdown from "./merge-fields/MergeFieldDropdown";

/* Register Parchment Attributors (idempotent — safe at module scope). */
registerQuillFormattingAttributors();

/** Handle exposed by QuillTemplate to the parent (EditorShell). */
export interface QuillTemplateHandle {
  getEditorHtml: () => string;
  setEditorHtml: (html: string) => void;
}

interface QuillTemplateProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  initialContent?: string;
  editorRef?: React.MutableRefObject<QuillTemplateHandle | null>;
}

export default function QuillTemplate({
  printRef,
  initialContent,
  editorRef: externalRef,
}: QuillTemplateProps) {
  const contentToUse = initialContent ?? DOCUMENT_TEMPLATE_WITH_BADGES;
  const [content, setContent] = useState(contentToUse);
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

  // Expose get/set methods to parent via mutable ref
  useEffect(() => {
    if (externalRef) {
      externalRef.current = { getEditorHtml, setEditorHtml };
    }
  }, [externalRef, getEditorHtml, setEditorHtml]);

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

        <div className="toolbar-separator" />

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            if (!quillRef.current) return;
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(true);
            const tableHtml = '<table><thead><tr><th>Col 1</th><th>Col 2</th><th>Col 3</th></tr></thead><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>';
            editor.clipboard.dangerouslyPasteHTML(range.index, tableHtml, 'user');
          }}
          title="Inserir tabela"
        >
          📊
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            if (!quillRef.current) return;
            const sel = window.getSelection();
            if (!sel?.anchorNode) return;
            const td = (sel.anchorNode as HTMLElement).closest?.('td,th') ?? (sel.anchorNode.parentElement as HTMLElement)?.closest?.('td,th');
            if (!td) return;
            const table = td.closest('table');
            if (!table) return;
            const colIndex = Array.from(td.parentElement!.children).indexOf(td);
            table.querySelectorAll('tr').forEach(tr => {
              const cell = document.createElement(tr.parentElement?.tagName === 'THEAD' ? 'th' : 'td');
              cell.innerHTML = '&nbsp;';
              const ref = tr.children[colIndex + 1];
              if (ref) { tr.insertBefore(cell, ref); } else { tr.appendChild(cell); }
            });
          }}
          title="Adicionar coluna"
        >
          +Col
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            if (!quillRef.current) return;
            const sel = window.getSelection();
            if (!sel?.anchorNode) return;
            const td = (sel.anchorNode as HTMLElement).closest?.('td,th') ?? (sel.anchorNode.parentElement as HTMLElement)?.closest?.('td,th');
            if (!td) return;
            const table = td.closest('table');
            if (!table) return;
            const colIndex = Array.from(td.parentElement!.children).indexOf(td);
            table.querySelectorAll('tr').forEach(tr => {
              const cell = tr.children[colIndex];
              if (cell) tr.removeChild(cell);
            });
            // Remove table if no columns left
            if (table.querySelector('tr')?.children.length === 0) table.remove();
          }}
          title="Remover coluna"
        >
          −Col
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            if (!quillRef.current) return;
            const sel = window.getSelection();
            if (!sel?.anchorNode) return;
            const td = (sel.anchorNode as HTMLElement).closest?.('td,th') ?? (sel.anchorNode.parentElement as HTMLElement)?.closest?.('td,th');
            if (!td) return;
            const tr = td.closest('tr');
            if (!tr) return;
            const cols = tr.children.length;
            const newRow = document.createElement('tr');
            for (let i = 0; i < cols; i++) {
              const cell = document.createElement('td');
              cell.innerHTML = '&nbsp;';
              newRow.appendChild(cell);
            }
            tr.after(newRow);
          }}
          title="Adicionar linha"
        >
          +Row
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            if (!quillRef.current) return;
            const sel = window.getSelection();
            if (!sel?.anchorNode) return;
            const td = (sel.anchorNode as HTMLElement).closest?.('td,th') ?? (sel.anchorNode.parentElement as HTMLElement)?.closest?.('td,th');
            if (!td) return;
            const tr = td.closest('tr');
            if (!tr) return;
            const table = tr.closest('table');
            tr.remove();
            // Remove table if no rows left
            if (table && table.querySelectorAll('tr').length === 0) table.remove();
          }}
          title="Remover linha"
        >
          −Row
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            if (!quillRef.current) return;
            const sel = window.getSelection();
            if (!sel?.anchorNode) return;
            const td = (sel.anchorNode as HTMLElement).closest?.('td,th') ?? (sel.anchorNode.parentElement as HTMLElement)?.closest?.('td,th');
            if (!td) return;
            const table = td.closest('table');
            if (table) table.remove();
          }}
          title="Remover tabela"
        >
          🗑️
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
  );
}
