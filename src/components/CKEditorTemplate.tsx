import { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Essentials,
  Bold,
  Italic,
  Underline,
  Heading,
  Paragraph,
  Alignment,
  FontColor,
  FontSize,
  FontFamily,
  Link,
  Table,
  TableToolbar,
  Indent,
  IndentBlock,
  List,
  BlockQuote,
  Undo,
  Mention,
  SourceEditing,
  GeneralHtmlSupport,
  ImageResizeHandles,
  ImageResizeEditing,
  Image,
  DecoupledEditor,
  PageBreak,
} from "ckeditor5";
import { MergeFields, ExportPdf, Pagination } from "ckeditor5-premium-features";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";

import {
  getCKEditorMergeFieldsConfig,
  MERGE_FIELDS,
} from "../config/mergeFieldsConfig";
import { DOCUMENT_TEMPLATE } from "../config/templateConfig";

const LICENSE_KEY = import.meta.env.VITE_CK_EDITOR_LICENSE_KEY || "";

/**
 * CKEditor 5 template editor component with merge fields, PDF export,
 * page break and pagination support (DecoupledEditor with manual toolbar mount).
 */
export default function CKEditorTemplate() {
  const editorRef = useRef<DecoupledEditor | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const mergeFieldsDefinitions = getCKEditorMergeFieldsConfig();
  const dataSets = [
    {
      id: "example-data",
      label: "Dados de Exemplo",
      values: Object.fromEntries(
        MERGE_FIELDS.map((f) => [f.id, f.defaultValue]),
      ),
    },
  ];

  return (
    <div className="editor-wrapper">
      <div ref={toolbarRef} className="ck-toolbar-container" />
      <div className="ck-editor-body">
          <CKEditor
        editor={DecoupledEditor}
        config={{
          licenseKey: LICENSE_KEY,
          plugins: [
            Pagination,
            PageBreak,
            Image,
            ImageResizeEditing,
            ImageResizeHandles,
            Essentials,
            Bold,
            Italic,
            Underline,
            Heading,
            Paragraph,
            Alignment,
            FontColor,
            FontSize,
            FontFamily,
            Link,
            Table,
            TableToolbar,
            Indent,
            IndentBlock,
            List,
            BlockQuote,
            Undo,
            Mention,
            SourceEditing,
            GeneralHtmlSupport,
            MergeFields,
            ExportPdf,
          ],
          toolbar: {
            items: [
              "undo",
              "redo",
              "|",
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "|",
              "fontSize",
              "fontFamily",
              "fontColor",
              "|",
              "alignment",
              "|",
              "bulletedList",
              "numberedList",
              "outdent",
              "indent",
              "|",
              "link",
              "insertTable",
              "blockQuote",
              "pageBreak",
              "|",
              "previousPage",
              "nextPage",
              "pageNavigation",
              "|",
              "insertMergeField",
              "previewMergeFields",
              "|",
              "exportPdf",
              "|",
              "sourceEditing",
            ],
          },
          htmlSupport: {
            allow: [
              {
                name: /^(div|span|p|h[1-6]|br|strong|em|a|img|table|tr|td|th|thead|tbody|ul|ol|li)$/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          mergeFields: {
            definitions: mergeFieldsDefinitions,
            dataSets,
            previewModes: ["$labels", "$defaultValues", "$dataSets"],
          },
          exportPdf: {
            fileName: "documento-template.pdf",
            converterOptions: {
              document: {
                size: "A4",
                orientation: "portrait",
                margins: {
                  top: "20mm",
                  bottom: "20mm",
                  right: "15mm",
                  left: "15mm",
                },
              },
            },
          },
          pagination: {
            pageWidth: "21cm",
            pageHeight: "29.7cm",
            pageMargins: {
              top: "20mm",
              bottom: "20mm",
              right: "15mm",
              left: "15mm",
            },
          },
          initialData: DOCUMENT_TEMPLATE,
        }}
        onReady={(editor) => {
          editorRef.current = editor;
          // DecoupledEditor requires manual toolbar mounting
          const toolbarElement = editor.ui.view.toolbar.element;
          if (toolbarElement && toolbarRef.current) {
            toolbarRef.current.appendChild(toolbarElement);
          }
        }}
        onAfterDestroy={() => {
          // Clean up toolbar container on destroy/re-init
          if (toolbarRef.current) {
            Array.from(toolbarRef.current.children).forEach((child) =>
              child.remove(),
            );
          }
        }}
      />
      </div>
    </div>
  );
}
