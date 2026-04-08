/**
 * Lexical rich text editor template component (MIT license, Meta).
 * Features a custom toolbar plugin, placeholder-based merge fields, and PDF export.
 */

import { useRef, useEffect, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";

import { DOCUMENT_TEMPLATE } from "../config/templateConfig";
import FieldsPanel from "./FieldsPanel";

/** Theme for Lexical editor styling. */
const LEXICAL_THEME = {
  root: "lexical-root",
  paragraph: "lexical-paragraph",
  heading: {
    h1: "lexical-h1",
    h2: "lexical-h2",
    h3: "lexical-h3",
  },
  text: {
    bold: "lexical-bold",
    italic: "lexical-italic",
    underline: "lexical-underline",
    strikethrough: "lexical-strikethrough",
    code: "lexical-code",
  },
  list: {
    ul: "lexical-ul",
    ol: "lexical-ol",
    listitem: "lexical-li",
  },
  link: "lexical-link",
  quote: "lexical-quote",
  table: "lexical-table",
  tableCell: "lexical-table-cell",
  tableCellHeader: "lexical-table-cell-header",
  tableRow: "lexical-table-row",
};

/** Plugin to load initial HTML content into the editor. */
function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.selectEnd();
      $insertNodes(nodes);
    });
  }, [editor, html]);

  return null;
}

/** Toolbar plugin for Lexical editor. */
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = (level: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  return (
    <div className="lexical-toolbar">
      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          title="Sublinhado"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }
          title="Tachado"
        >
          <s>S</s>
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatHeading("h1")}
          title="Título 1"
        >
          H1
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatHeading("h2")}
          title="Título 2"
        >
          H2
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatHeading("h3")}
          title="Título 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatQuote()}
          title="Citação"
        >
          ❝
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Desfazer"
        >
          ↩
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Refazer"
        >
          ↪
        </button>
      </div>
    </div>
  );
}

/**
 * Bridge plugin that exposes editor HTML get/set to the parent component
 * via callback refs.
 */
function EditorBridgePlugin({
  getHtmlRef,
  setHtmlRef,
}: {
  getHtmlRef: React.MutableRefObject<(() => string) | null>;
  setHtmlRef: React.MutableRefObject<((html: string) => void) | null>;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    getHtmlRef.current = () => {
      let html = "";
      editor.getEditorState().read(() => {
        html = $generateHtmlFromNodes(editor);
      });
      return html;
    };

    setHtmlRef.current = (html: string) => {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.selectEnd();
        $insertNodes(nodes);
      });
    };
  }, [editor, getHtmlRef, setHtmlRef]);

  return null;
}

export default function LexicalTemplate() {
  const printRef = useRef<HTMLDivElement>(null);
  const getHtmlRef = useRef<(() => string) | null>(null);
  const setHtmlRef = useRef<((html: string) => void) | null>(null);

  const initialConfig = {
    namespace: "LexicalPOC",
    theme: LEXICAL_THEME,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  const getEditorHtml = useCallback(() => getHtmlRef.current?.() ?? "", []);

  const setEditorHtml = useCallback(
    (html: string) => setHtmlRef.current?.(html),
    [],
  );

  return (
    <div className="editor-with-panel">
      <div className="editor-main">
        <div className="editor-wrapper">
          <LexicalComposer initialConfig={initialConfig}>
            <ToolbarPlugin />
            <div className="lexical-editor-container" ref={printRef}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="lexical-content-editable" />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <TablePlugin />
            <InitialContentPlugin html={DOCUMENT_TEMPLATE} />
            <EditorBridgePlugin
              getHtmlRef={getHtmlRef}
              setHtmlRef={setHtmlRef}
            />
          </LexicalComposer>
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
