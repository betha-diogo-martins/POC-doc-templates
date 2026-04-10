/**
 * Reusable panel for managing dynamic field values across all editors.
 * Provides inputs grouped by category, apply/reset actions, and PDF export buttons.
 */

import { useRef, useState, type ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import { MERGE_FIELDS } from "../config/mergeFieldsConfig";
import {
  DOCUMENT_TEMPLATE,
  DOCUMENT_TEMPLATE_WITH_BADGES,
} from "../config/templateConfig";
import { getFieldsByGroup, useFieldValues } from "../utils/customMergeFields";
import { exportWithHtml2Pdf } from "../utils/pdfExport";
import PdfPreview from "./PdfPreview";

export interface FieldsPanelProps {
  /** Returns the current HTML content from the editor. */
  getEditorHtml: () => string;
  /** Sets the editor content with new HTML. */
  setEditorHtml: (html: string) => void;
  /** Reference to the printable content area (for react-to-print). */
  printRef: React.RefObject<HTMLDivElement | null>;
  /**
   * When true, the panel uses badge-aware replace logic:
   * it replaces both plain `{{campo}}` AND `<span data-type="merge-field">` badges.
   * On reset, it restores the template with badge HTML.
   * Used by free editors (Tiptap, Lexical, Quill).
   */
  useBadges?: boolean;
  /** Optional extra content to render in the panel footer. */
  children?: ReactNode;
}

export default function FieldsPanel({
  getEditorHtml,
  setEditorHtml,
  printRef,
  useBadges = false,
  children,
}: FieldsPanelProps) {
  const { values, updateField, resetToDefaults } = useFieldValues();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const fieldsByGroup = getFieldsByGroup();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  /**
   * Replaces merge field placeholders in the HTML with their current values.
   * When `useBadges` is true, also replaces `<span data-type="merge-field"...>` badge
   * elements. Works with Tiptap (flat span), Lexical (span with text nodes), and
   * Quill (span wrapping inner `<span contenteditable="false">` with zero-width
   * spaces) by using DOMParser for reliable cross-editor matching.
   */
  const replaceMergeFields = (html: string): string => {
    let result = html;

    // 1. Always replace plain {{campo}} placeholders
    for (const field of MERGE_FIELDS) {
      const value = values[field.id];
      if (!value) continue;
      const plainRegex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
      result = result.replace(plainRegex, value);
    }

    // 2. When badges are enabled, use DOMParser so we correctly match badges
    //    regardless of how the editor wraps the inner content.
    if (useBadges) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(result, "text/html");

      for (const field of MERGE_FIELDS) {
        const value = values[field.id];
        if (!value) continue;

        const badges = doc.querySelectorAll(
          `span[data-type="merge-field"][data-field-id="${field.id}"]`,
        );
        badges.forEach((badge) => {
          const text = doc.createTextNode(value);
          badge.parentNode?.replaceChild(text, badge);
        });
      }

      result = doc.body.innerHTML;
    }

    return result;
  };

  const handleApply = () => {
    const html = getEditorHtml();
    setEditorHtml(replaceMergeFields(html));
  };

  const handleReset = () => {
    resetToDefaults();
    setEditorHtml(
      useBadges ? DOCUMENT_TEMPLATE_WITH_BADGES : DOCUMENT_TEMPLATE,
    );
  };

  const handleExportPdf = async () => {
    if (!pdfContainerRef.current) return;

    const html = replaceMergeFields(getEditorHtml());

    pdfContainerRef.current.innerHTML = html;
    // Apply font styles while keeping the container off-screen
    pdfContainerRef.current.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2c3e50;
      line-height: 1.6;
      padding: 20px;
      max-width: 800px;
    `;

    try {
      await exportWithHtml2Pdf(pdfContainerRef.current, "documento-template.pdf");
    } finally {
      // Clear the container content after export to avoid leftover rendering
      pdfContainerRef.current.innerHTML = "";
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handlePreview = () => {
    const html = replaceMergeFields(getEditorHtml());
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

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
          className="btn btn-preview"
          onClick={handlePreview}
          type="button"
        >
          👁️ Preview PDF
        </button>
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

      {/* PDF Preview Modal */}
      <PdfPreview
        htmlContent={previewHtml}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
