import { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
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
} from "ckeditor5";
import { MergeFields, ExportPdf } from "ckeditor5-premium-features";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";

import {
  getCKEditorMergeFieldsConfig,
  MERGE_FIELDS,
} from "../config/mergeFieldsConfig";
import { DOCUMENT_TEMPLATE } from "../config/templateConfig";

const LICENSE_KEY = import.meta.env.VITE_CK_EDITOR_LICENSE_KEY || "";

/**
 * CKEditor 5 template editor component with merge fields and PDF export.
 */
export default function CKEditorTemplate() {
  const editorRef = useRef<ClassicEditor | null>(null);

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
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: LICENSE_KEY,
          plugins: [
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
          initialData: DOCUMENT_TEMPLATE,
        }}
        onReady={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
}
