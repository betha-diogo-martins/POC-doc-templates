/**
 * Tiptap rich text editor template component (MIT license).
 * Features a custom toolbar, placeholder-based merge fields, and PDF export.
 */

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { DOCUMENT_TEMPLATE } from "../config/templateConfig";
import FieldsPanel from "./FieldsPanel";

/** Toolbar button helper. */
function ToolbarButton({
  onClick,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`toolbar-btn ${isActive ? "is-active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

export default function TiptapTemplate() {
  const printRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: DOCUMENT_TEMPLATE,
  });

  if (!editor) {
    return <div className="editor-loading">Carregando editor...</div>;
  }

  const getEditorHtml = () => editor.getHTML();
  const setEditorHtml = (html: string) => editor.commands.setContent(html);

  return (
    <div className="editor-with-panel">
      <div className="editor-main">
        <div className="editor-wrapper">
          {/* Toolbar */}
          <div className="tiptap-toolbar">
            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Negrito"
              >
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Itálico"
              >
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Sublinhado"
              >
                <u>U</u>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Tachado"
              >
                <s>S</s>
              </ToolbarButton>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive("heading", { level: 1 })}
                title="Título 1"
              >
                H1
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive("heading", { level: 2 })}
                title="Título 2"
              >
                H2
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive("heading", { level: 3 })}
                title="Título 3"
              >
                H3
              </ToolbarButton>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                isActive={editor.isActive({ textAlign: "left" })}
                title="Alinhar esquerda"
              >
                ⬅
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                isActive={editor.isActive({ textAlign: "center" })}
                title="Centralizar"
              >
                ⬌
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                isActive={editor.isActive({ textAlign: "right" })}
                title="Alinhar direita"
              >
                ➡
              </ToolbarButton>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Lista com marcadores"
              >
                • Lista
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Lista numerada"
              >
                1. Lista
              </ToolbarButton>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Citação"
              >
                ❝
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Linha horizontal"
              >
                ―
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("URL do link:");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                isActive={editor.isActive("link")}
                title="Link"
              >
                🔗
              </ToolbarButton>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
                title="Inserir tabela"
              >
                📊
              </ToolbarButton>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                title="Desfazer"
              >
                ↩
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                title="Refazer"
              >
                ↪
              </ToolbarButton>
            </div>
          </div>

          {/* Editor content */}
          <div ref={printRef}>
            <EditorContent editor={editor} className="tiptap-editor-content" />
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
