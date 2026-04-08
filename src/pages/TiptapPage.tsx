import TiptapTemplate from "../components/TiptapTemplate";

/**
 * Page for testing the Tiptap editor (MIT license, ProseMirror-based).
 */
export default function TiptapPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Tiptap <span className="license-badge mit">MIT</span>
        </h2>
        <p className="page-description">
          Editor headless baseado em <strong>ProseMirror</strong> (36.1k ⭐).
          Toolbar customizada, campos dinâmicos via <code>{"{{}}"}</code>{" "}
          placeholders com replace por regex, e export PDF via{" "}
          <strong>html2pdf.js</strong> (client-side) ou{" "}
          <strong>react-to-print</strong> (browser print).
        </p>
      </div>
      <TiptapTemplate />
    </div>
  );
}
