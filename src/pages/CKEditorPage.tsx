import CKEditorTemplate from "../components/CKEditorTemplate";

/**
 * Page for testing the CKEditor 5 template editor.
 */
export default function CKEditorPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>CKEditor 5</h2>
        <p className="page-description">
          Editor com <strong>Merge Fields</strong> (campos dinâmicos),{" "}
          <strong>Export to PDF</strong>, <strong>Page Break</strong> e{" "}
          <strong>Pagination</strong>. Use o botão <em>Page Break</em> na
          toolbar para inserir quebras de página. A paginação mostra onde cada
          página termina no formato A4. Use <em>Export PDF</em> para validar as
          quebras no documento final.
        </p>
      </div>
      <CKEditorTemplate />
    </div>
  );
}
