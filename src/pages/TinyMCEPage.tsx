import { useRef } from "react";
import TinyMCETemplate, {
  type TinyMCETemplateHandle,
} from "../components/TinyMCETemplate";
import EditorShell from "../components/EditorShell";

/**
 * Page for testing the TinyMCE template editor.
 */
export default function TinyMCEPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<TinyMCETemplateHandle | null>(null);

  return (
    <EditorShell
      getEditorHtml={() => editorRef.current?.getEditorHtml() ?? ""}
      setEditorHtml={(html) => editorRef.current?.setEditorHtml(html)}
      printRef={printRef}
      editorName="TinyMCE"
      editorDescription="Editor com Merge Tags (campos dinâmicos) e Export to PDF. Use o botão Merge Tags na toolbar ou digite {{ para inserir campos."
    >
      <TinyMCETemplate printRef={printRef} editorRef={editorRef} />
    </EditorShell>
  );
}
