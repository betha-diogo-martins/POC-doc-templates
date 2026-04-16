import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TiptapTemplate, {
  type TiptapTemplateHandle,
} from "../components/TiptapTemplate";
import EditorShell from "../components/EditorShell";
import { fetchTemplateById } from "../services/templateService";
import type { TemplateDoc } from "../types/template";
import { DOCUMENT_TEMPLATE_WITH_BADGES } from "../config/templateConfig";

/**
 * Page for testing the Tiptap editor (MIT license, ProseMirror-based).
 */
export default function TiptapPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<TiptapTemplateHandle | null>(null);
  const [searchParams] = useSearchParams();
  const [activeTemplate, setActiveTemplate] = useState<TemplateDoc | null>(
    null,
  );
  const [initialContent, setInitialContent] = useState<string | undefined>(
    undefined,
  );

  // Load template when templateId query param is present
  useEffect(() => {
    const templateId = searchParams.get("templateId");
    if (templateId) {
      fetchTemplateById(templateId)
        .then((tmpl) => {
          setActiveTemplate(tmpl);
          setInitialContent(tmpl.definition);
          // Also set the editor content if already mounted
          editorRef.current?.setEditorHtml(tmpl.definition);
        })
        .catch(console.error);
    }
  }, [searchParams]);

  return (
    <EditorShell
      getEditorHtml={() => editorRef.current?.getEditorHtml() ?? ""}
      setEditorHtml={(html) => editorRef.current?.setEditorHtml(html)}
      printRef={printRef}
      useBadges
      activeTemplate={activeTemplate}
      onSaved={(doc) => setActiveTemplate(doc)}
      onNew={() => {
        setActiveTemplate(null);
        editorRef.current?.setEditorHtml(DOCUMENT_TEMPLATE_WITH_BADGES);
      }}
      editorName="Tiptap"
      editorDescription="Editor headless baseado em ProseMirror (MIT). Toolbar customizada, campos dinâmicos via {{}} placeholders, e export PDF."
    >
      <TiptapTemplate
        printRef={printRef}
        editorRef={editorRef}
        initialContent={initialContent}
      />
    </EditorShell>
  );
}
