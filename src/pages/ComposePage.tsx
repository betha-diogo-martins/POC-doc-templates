/**
 * Compose page — build a complete document by combining template parts.
 * Allows selecting 1 header, N bodies, and 1 footer.
 * Preview and export the composed result.
 */

import { useEffect, useRef, useState } from "react";
import type { TemplateDoc } from "../types/template";
import { fetchTemplates } from "../services/templateService";
import { exportWithHtml2Pdf } from "../utils/pdfExport";
import PdfPreview from "../components/PdfPreview";

export default function ComposePage() {
  const [headers, setHeaders] = useState<TemplateDoc[]>([]);
  const [bodies, setBodies] = useState<TemplateDoc[]>([]);
  const [footers, setFooters] = useState<TemplateDoc[]>([]);

  const [selectedHeader, setSelectedHeader] = useState<string>("");
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);
  const [selectedFooter, setSelectedFooter] = useState<string>("");

  const [previewHtml, setPreviewHtml] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAll = async () => {
      const [h, b, f] = await Promise.all([
        fetchTemplates("header"),
        fetchTemplates("body"),
        fetchTemplates("footer"),
      ]);
      setHeaders(h);
      setBodies(b);
      setFooters(f);
    };
    loadAll().catch(console.error);
  }, []);

  const addBody = () => {
    setSelectedBodies((prev) => [...prev, ""]);
  };

  const removeBody = (index: number) => {
    setSelectedBodies((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBody = (index: number, value: string) => {
    setSelectedBodies((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const getComposedHtml = (): string => {
    const parts: string[] = [];

    const header = headers.find((h) => h._id === selectedHeader);
    if (header) {
      parts.push(`<div class="composed-header">${header.definition}</div>`);
    }

    for (const id of selectedBodies) {
      const body = bodies.find((b) => b._id === id);
      if (body) {
        parts.push(`<div class="composed-body">${body.definition}</div>`);
      }
    }

    const footer = footers.find((f) => f._id === selectedFooter);
    if (footer) {
      parts.push(`<div class="composed-footer">${footer.definition}</div>`);
    }

    return parts.join("\n");
  };

  const handlePreview = () => {
    setPreviewHtml(getComposedHtml());
    setIsPreviewOpen(true);
  };

  const handleExportPdf = async () => {
    if (!pdfContainerRef.current) return;
    pdfContainerRef.current.innerHTML = getComposedHtml();
    pdfContainerRef.current.style.cssText = `
      position: absolute; left: -9999px; top: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2c3e50; line-height: 1.6; padding: 0; max-width: 718px; width: 718px;
    `;
    try {
      await exportWithHtml2Pdf(
        pdfContainerRef.current,
        "documento-composto.pdf",
      );
    } finally {
      pdfContainerRef.current.innerHTML = "";
    }
  };

  const hasSelection =
    selectedHeader || selectedBodies.some(Boolean) || selectedFooter;

  return (
    <div className="page">
      <div className="page-header">
        <h2>🧩 Compor Documento</h2>
        <p className="page-description">
          Monte um documento completo selecionando Header, Body(s) e Footer.
        </p>
      </div>

      <div className="compose-layout">
        {/* Selection panel */}
        <div className="compose-panel">
          {/* Header */}
          <div className="compose-section">
            <h3 className="compose-section-title">🔝 Header</h3>
            <select
              className="field-input"
              value={selectedHeader}
              onChange={(e) => setSelectedHeader(e.target.value)}
            >
              <option value="">— Selecione um header —</option>
              {headers.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bodies */}
          <div className="compose-section">
            <div className="compose-section-header">
              <h3 className="compose-section-title">📄 Body</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={addBody}
                type="button"
              >
                ➕ Adicionar Body
              </button>
            </div>
            {selectedBodies.length === 0 && (
              <p className="text-muted compose-hint">
                Clique em "Adicionar Body" para incluir partes do corpo.
              </p>
            )}
            {selectedBodies.map((id, index) => (
              <div key={index} className="compose-body-row">
                <select
                  className="field-input"
                  value={id}
                  onChange={(e) => updateBody(index, e.target.value)}
                >
                  <option value="">— Selecione —</option>
                  {bodies.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeBody(index)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="compose-section">
            <h3 className="compose-section-title">🔚 Footer</h3>
            <select
              className="field-input"
              value={selectedFooter}
              onChange={(e) => setSelectedFooter(e.target.value)}
            >
              <option value="">— Selecione um footer —</option>
              {footers.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="compose-actions">
            <button
              className="btn btn-primary"
              onClick={handlePreview}
              disabled={!hasSelection}
              type="button"
            >
              👁️ Preview
            </button>
            <button
              className="btn btn-export"
              onClick={handleExportPdf}
              disabled={!hasSelection}
              type="button"
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="compose-preview">
          <h3 className="compose-section-title">Prévia do Documento</h3>
          <div
            className="compose-preview-content"
            dangerouslySetInnerHTML={{ __html: getComposedHtml() }}
          />
        </div>
      </div>

      {/* Hidden container for PDF export */}
      <div ref={pdfContainerRef} />

      <PdfPreview
        htmlContent={previewHtml}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
