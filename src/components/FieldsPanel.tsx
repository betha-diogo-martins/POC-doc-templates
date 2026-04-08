/**
 * Reusable panel for managing dynamic field values across all editors.
 * Provides inputs grouped by category, apply/reset actions, and PDF export buttons.
 */

import { useRef, type ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import { MERGE_FIELDS } from "../config/mergeFieldsConfig";
import { DOCUMENT_TEMPLATE } from "../config/templateConfig";
import { getFieldsByGroup, useFieldValues } from "../utils/customMergeFields";
import { exportWithHtml2Pdf } from "../utils/pdfExport";

export interface FieldsPanelProps {
  /** Returns the current HTML content from the editor. */
  getEditorHtml: () => string;
  /** Sets the editor content with new HTML. */
  setEditorHtml: (html: string) => void;
  /** Reference to the printable content area (for react-to-print). */
  printRef: React.RefObject<HTMLDivElement | null>;
  /** Optional extra content to render in the panel footer. */
  children?: ReactNode;
}

export default function FieldsPanel({
  getEditorHtml,
  setEditorHtml,
  printRef,
  children,
}: FieldsPanelProps) {
  const { values, updateField, resetToDefaults } = useFieldValues();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const fieldsByGroup = getFieldsByGroup();

  const handleApply = () => {
    let html = getEditorHtml();
    for (const field of MERGE_FIELDS) {
      const value = values[field.id];
      if (value) {
        const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
        html = html.replace(regex, value);
      }
    }
    setEditorHtml(html);
  };

  const handleReset = () => {
    resetToDefaults();
    setEditorHtml(DOCUMENT_TEMPLATE);
  };

  const handleExportPdf = async () => {
    if (!pdfContainerRef.current) return;

    let html = getEditorHtml();
    for (const field of MERGE_FIELDS) {
      const value = values[field.id];
      if (value) {
        const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
        html = html.replace(regex, value);
      }
    }

    pdfContainerRef.current.innerHTML = html;
    pdfContainerRef.current.style.cssText = `
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2c3e50;
      line-height: 1.6;
      padding: 20px;
      max-width: 800px;
    `;

    await exportWithHtml2Pdf(pdfContainerRef.current, "documento-template.pdf");
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  return (
    <div className="fields-panel">
      <h3 className="fields-panel-title">📋 Campos Dinâmicos</h3>

      {Array.from(fieldsByGroup.entries()).map(([groupName, fields]) => (
        <div key={groupName} className="fields-group">
          <h4 className="fields-group-title">{groupName}</h4>
          {fields.map((field) => (
            <div key={field.id} className="field-row">
              <label className="field-label" htmlFor={`field-${field.id}`}>
                {field.label}
                <code className="field-placeholder">{`{{${field.id}}}`}</code>
              </label>
              <input
                id={`field-${field.id}`}
                type="text"
                className="field-input"
                value={values[field.id]}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder={field.defaultValue}
              />
            </div>
          ))}
        </div>
      ))}

      <div className="fields-actions">
        <button className="btn btn-primary" onClick={handleApply} type="button">
          ✅ Aplicar valores
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          type="button"
        >
          🔄 Resetar template
        </button>
      </div>

      <div className="fields-export">
        <h4 className="fields-group-title">📄 Exportar</h4>
        <button
          className="btn btn-export"
          onClick={handleExportPdf}
          type="button"
        >
          📄 Exportar PDF (html2pdf.js)
        </button>
        <button
          className="btn btn-export"
          onClick={() => handlePrint()}
          type="button"
        >
          🖨️ Imprimir / PDF (browser)
        </button>
      </div>

      {children}

      {/* Hidden container for PDF generation */}
      <div
        ref={pdfContainerRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}
      />
    </div>
  );
}
