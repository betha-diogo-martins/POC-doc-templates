import { useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

import { getTinyMCEMergeTagsList } from "../config/mergeFieldsConfig";
import { DOCUMENT_TEMPLATE } from "../config/templateConfig";

const API_KEY = import.meta.env.VITE_TINY_CLOUD_API_KEY || "";

/** Handle exposed by TinyMCETemplate to the parent (EditorShell). */
export interface TinyMCETemplateHandle {
  getEditorHtml: () => string;
  setEditorHtml: (html: string) => void;
}

interface TinyMCETemplateProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  initialContent?: string;
  editorRef?: React.MutableRefObject<TinyMCETemplateHandle | null>;
}

/**
 * TinyMCE template editor component with merge tags and PDF export.
 */
export default function TinyMCETemplate({
  printRef,
  initialContent,
  editorRef: externalRef,
}: TinyMCETemplateProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const contentToUse = initialContent ?? DOCUMENT_TEMPLATE;
  const mergeTagsList = getTinyMCEMergeTagsList();

  // Expose get/set methods to parent via mutable ref
  useEffect(() => {
    if (externalRef) {
      externalRef.current = {
        getEditorHtml: () => editorRef.current?.getContent() ?? "",
        setEditorHtml: (html: string) => editorRef.current?.setContent(html),
      };
    }
  }, [externalRef]);

  return (
    <div className="editor-wrapper" ref={printRef}>
      <Editor
        apiKey={API_KEY}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          // Re-sync the external ref now that the editor is ready
          if (externalRef) {
            externalRef.current = {
              getEditorHtml: () => editor.getContent(),
              setEditorHtml: (html: string) => editor.setContent(html),
            };
          }
        }}
        initialValue={contentToUse}
        init={{
          height: 700,
          menubar: "file edit view insert format tools table help",
          browser_spellcheck: true,
          language: 'pt_BR',
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "preview",
            "help",
            "wordcount",
            "mergetags",
            "exportpdf",
            "pagebreak",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic underline forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "mergetags | exportpdf | " +
            "removeformat | help",
          mergetags_prefix: "{{",
          mergetags_suffix: "}}",
          mergetags_list: mergeTagsList,
          exportpdf_converter_options: {
            format: "A4",
            margin_top: "20mm",
            margin_bottom: "20mm",
            margin_right: "15mm",
            margin_left: "15mm",
          },
          content_style: `
            body {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 14px;
              max-width: 800px;
              margin: 0 auto;
              padding: 16px;
            }
          `,
        setup: (editor) => {
          editor.on('init', () => {
            editor.getBody().setAttribute('lang', 'pt-BR'); // 🔥 ESSENCIAL
          });
        },
          pagebreak_separator: '<div style="break-after: page"></div>',
          pagebreak_split_block: true,
        }}
      />
    </div>
  );
}
