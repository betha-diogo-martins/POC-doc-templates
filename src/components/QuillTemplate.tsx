/**
 * Quill rich text editor template component (BSD 3-Clause license).
 * Uses react-quill-new wrapper with placeholder-based merge fields and PDF export.
 */

import { useRef, useState, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DOCUMENT_TEMPLATE } from "../config/templateConfig";
import FieldsPanel from "./FieldsPanel";

/** Quill toolbar modules configuration. */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "link", "image"],
    ["clean"],
  ],
};

/** Quill formats allowed. */
const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "color",
  "background",
  "blockquote",
  "link",
  "image",
];

export default function QuillTemplate() {
  const [content, setContent] = useState(DOCUMENT_TEMPLATE);
  const printRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);

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

  return (
    <div className="editor-with-panel">
      <div className="editor-main">
        <div className="editor-wrapper">
          <div ref={printRef}>
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
      />
    </div>
  );
}
