import { useRef } from "react";
import LexicalTemplate, {
  type LexicalTemplateHandle,
} from "../components/LexicalTemplate";
import EditorShell from "../components/EditorShell";

/**
 * Page for testing the Lexical editor (MIT license, Meta).
 */
export default function LexicalPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<LexicalTemplateHandle | null>(null);

  return (
    <EditorShell
      getEditorHtml={() => editorRef.current?.getEditorHtml() ?? ""}
      setEditorHtml={(html) => editorRef.current?.setEditorHtml(html)}
      printRef={printRef}
      useBadges
      editorName="Lexical"
      editorDescription="Editor extensível do Meta/Facebook (MIT). Arquitetura baseada em plugins, campos dinâmicos via {{}} placeholders, e export PDF."
    >
      <LexicalTemplate printRef={printRef} editorRef={editorRef} />
    </EditorShell>
  );
}
