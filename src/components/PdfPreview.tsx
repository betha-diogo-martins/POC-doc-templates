/**
 * PDF Preview modal component.
 * Renders editor HTML content inside an A4-sized container to simulate the final PDF output.
 * Shared across all editors via FieldsPanel.
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { exportWithHtml2Pdf } from "../utils/pdfExport";

export interface PdfPreviewProps {
  /** The HTML content to preview. */
  htmlContent: string;
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
}

export default function PdfPreview({
  htmlContent,
  isOpen,
  onClose,
}: PdfPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    await exportWithHtml2Pdf(contentRef.current, "documento-preview.pdf");
  };

  return createPortal(
    <div
      className="pdf-preview-overlay"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="pdf-preview-modal">
        {/* Header */}
        <div className="pdf-preview-header">
          <h3 className="pdf-preview-title">👁️ Preview do Documento</h3>
          <div className="pdf-preview-actions">
            <button
              type="button"
              className="btn btn-export"
              onClick={handleExportPdf}
            >
              📄 Exportar PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary pdf-preview-close"
              onClick={onClose}
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        {/* A4 Page Container */}
        <div className="pdf-preview-scroll">
          <div
            className="pdf-preview-page"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
