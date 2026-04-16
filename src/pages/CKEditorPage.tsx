import { useRef } from "react";
import CKEditorTemplate, {
  type CKEditorTemplateHandle,
} from "../components/CKEditorTemplate";
import EditorShell from "../components/EditorShell";

/**
 * Page for testing the CKEditor 5 template editor.
 */
export default function CKEditorPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<CKEditorTemplateHandle | null>(null);

  return (
    <EditorShell
      getEditorHtml={() => editorRef.current?.getEditorHtml() ?? ""}
      setEditorHtml={(html) => editorRef.current?.setEditorHtml(html)}
      printRef={printRef}
      editorName="CKEditor 5"
      editorDescription="Editor com Merge Fields, Export to PDF, Page Break e Pagination. Use os botões na toolbar para inserir campos e quebras de página."
    >
      <CKEditorTemplate printRef={printRef} editorRef={editorRef} />
    </EditorShell>
  );
}
