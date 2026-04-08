import LexicalTemplate from "../components/LexicalTemplate";

/**
 * Page for testing the Lexical editor (MIT license, Meta).
 */
export default function LexicalPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Lexical <span className="license-badge mit">MIT</span>
        </h2>
        <p className="page-description">
          Editor extensível do <strong>Meta/Facebook</strong> (23.2k ⭐).
          Arquitetura baseada em plugins, campos dinâmicos via{" "}
          <code>{"{{}}"}</code> placeholders com replace por regex, e export PDF
          via <strong>html2pdf.js</strong> (client-side) ou{" "}
          <strong>react-to-print</strong> (browser print).
        </p>
      </div>
      <LexicalTemplate />
    </div>
  );
}
