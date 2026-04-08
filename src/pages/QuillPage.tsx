import QuillTemplate from "../components/QuillTemplate";

/**
 * Page for testing the Quill editor (BSD 3-Clause license).
 */
export default function QuillPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Quill <span className="license-badge bsd">BSD 3-Clause</span>
        </h2>
        <p className="page-description">
          Editor WYSIWYG popular e maduro (47k ⭐, via{" "}
          <strong>react-quill-new</strong>). Toolbar nativa com formatação
          completa, campos dinâmicos via <code>{"{{}}"}</code> placeholders com
          replace por regex, e export PDF via <strong>html2pdf.js</strong>{" "}
          (client-side) ou <strong>react-to-print</strong> (browser print).
        </p>
      </div>
      <QuillTemplate />
    </div>
  );
}
