import TinyMCETemplate from "../components/TinyMCETemplate";

/**
 * Page for testing the TinyMCE template editor.
 */
export default function TinyMCEPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>TinyMCE</h2>
        <p className="page-description">
          Editor com <strong>Merge Tags</strong> (campos dinâmicos) e{" "}
          <strong>Export to PDF</strong>. Use o botão <em>Merge Tags</em> na
          toolbar ou digite <code>{"{{"}</code> para inserir campos. Os campos
          são exibidos como tags não-editáveis no conteúdo.
        </p>
      </div>
      <TinyMCETemplate />
    </div>
  );
}
