import { useRef } from "react";
import QuillTemplate, {
  type QuillTemplateHandle,
} from "../components/QuillTemplate";
import EditorShell from "../components/EditorShell";

/**
 * Page for testing the Quill editor (BSD 3-Clause license).
 */
export default function QuillPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<QuillTemplateHandle | null>(null);

  return (
    <EditorShell
      getEditorHtml={() => editorRef.current?.getEditorHtml() ?? ""}
      setEditorHtml={(html) => editorRef.current?.setEditorHtml(html)}
      printRef={printRef}
      useBadges
      editorName="Quill"
      editorDescription="Editor WYSIWYG popular e maduro (BSD 3-Clause). Toolbar nativa com formatação completa, campos dinâmicos via {{}} placeholders, e export PDF."
    >
      <QuillTemplate printRef={printRef} editorRef={editorRef} />
    </EditorShell>
  );
}
