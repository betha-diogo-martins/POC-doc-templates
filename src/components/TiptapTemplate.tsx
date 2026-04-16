/**
 * Tiptap rich text editor template component (MIT license).
 * Features a custom toolbar, merge field badges, page break, image upload,
 * advanced formatting (indent, line-height, spacing), and spellcheck.
 * Designed to be wrapped by EditorShell.
 */

import { useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { ResizableImage } from "../extensions/tiptap/ResizableImageExtension";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Indent } from "../extensions/tiptap/IndentExtension";
import { LineHeight } from "../extensions/tiptap/LineHeightExtension";
import { ParagraphSpacing } from "../extensions/tiptap/ParagraphSpacingExtension";
import { MergeField } from "../extensions/tiptap/MergeFieldExtension";
import { PageBreak } from "../extensions/tiptap/PageBreakExtension";
import { DOCUMENT_TEMPLATE_WITH_BADGES } from "../config/templateConfig";
import SpacingControls from "./SpacingControls";
import MergeFieldDropdown from "./merge-fields/MergeFieldDropdown";

/** Handle exposed by TiptapTemplate to the parent (EditorShell). */
export interface TiptapTemplateHandle {
  getEditorHtml: () => string;
  setEditorHtml: (html: string) => void;
}

interface TiptapTemplateProps {
  /** Reference to the printable content area. */
  printRef: React.RefObject<HTMLDivElement | null>;
  /** Optional initial HTML content (e.g. loaded from a template). */
  initialContent?: string;
}

/** Toolbar button helper. */
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`toolbar-btn ${isActive ? "is-active" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export default function TiptapTemplate({
  printRef,
  initialContent,
  editorRef: externalRef,
}: TiptapTemplateProps & {
  editorRef?: React.MutableRefObject<TiptapTemplateHandle | null>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentToUse = initialContent ?? DOCUMENT_TEMPLATE_WITH_BADGES;

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
      ResizableImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Indent,
      LineHeight,
      ParagraphSpacing,
      MergeField,
      PageBreak,
    ],
    content: contentToUse,
    editorProps: {
      attributes: {
        spellcheck: "true",
        lang: "pt-BR",
      },
    },
  });

  // Expose get/set methods to parent via mutable ref
  useEffect(() => {
    if (externalRef && editor) {
      externalRef.current = {
        getEditorHtml: () => editor.getHTML(),
        setEditorHtml: (html: string) => editor.commands.setContent(html),
      };
    }
  }, [editor, externalRef]);

  if (!editor) {
    return <div className="editor-loading">Carregando editor...</div>;
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="editor-wrapper">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileSelected}
      />
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
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Alinhar esquerda"
          >
            ⬅
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Centralizar"
          >
            ⬌
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
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
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Adicionar coluna"
          >
            +Col
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Remover coluna"
          >
            −Col
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Adicionar linha"
          >
            +Row
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Remover linha"
          >
            −Row
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Remover tabela"
          >
            🗑️
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        {/* Indent / Outdent */}
        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().indent().run()}
            title="Aumentar indentação"
          >
            →⇥
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().outdent().run()}
            title="Diminuir indentação"
          >
            ⇤←
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

        <div className="toolbar-separator" />

        {/* Merge Fields, Page Break, Image */}
        <div className="toolbar-group">
          <MergeFieldDropdown
            onSelect={(fieldId, label) =>
              editor.chain().focus().insertMergeField(fieldId, label).run()
            }
          />
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().insertPageBreak().run()}
            title="Inserir quebra de página"
          >
            📄 Page Break
          </ToolbarButton>
          <ToolbarButton onClick={handleImageUpload} title="Inserir imagem">
            🖼️ Imagem
          </ToolbarButton>
        </div>
      </div>

      <SpacingControls
        onLineHeight={(value) =>
          editor.chain().focus().setLineHeight(value).run()
        }
        onSpacing={(value) =>
          editor
            .chain()
            .focus()
            .setSpacingBefore(value)
            .setSpacingAfter(value)
            .run()
        }
      />

      {/* Editor content */}
      <div ref={printRef}>
        <EditorContent editor={editor} className="tiptap-editor-content" />
      </div>
    </div>
  );
}
