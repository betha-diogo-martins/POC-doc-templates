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
          Editor com <strong>Merge Fields</strong> (campos dinâmicos) e{" "}
          <strong>Export to PDF</strong>. Use o botão{" "}
          <em>Insert Merge Field</em> na toolbar ou digite <code>{"{{"}</code>{" "}
          para inserir campos. Alterne entre visualização de labels e preview de
          dados.
        </p>
      </div>
      <CKEditorTemplate />
    </div>
  );
}
