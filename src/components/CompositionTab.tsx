/**
 * Composition tab — build a complete document by combining template parts.
 * Embedded inside EditorShell as the COMPOSIÇÃO tab.
 */

import { useEffect, useRef, useState } from "react";
import type { TemplateDoc } from "../types/template";
import { fetchTemplates } from "../services/templateService";
import { exportWithHtml2Pdf } from "../utils/pdfExport";
import PdfPreview from "./PdfPreview";

export default function CompositionTab() {
  const [headers, setHeaders] = useState<TemplateDoc[]>([]);
  const [bodies, setBodies] = useState<TemplateDoc[]>([]);
  const [footers, setFooters] = useState<TemplateDoc[]>([]);

  const [selectedHeader, setSelectedHeader] = useState<string>("");
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);
  const [selectedFooter, setSelectedFooter] = useState<string>("");

  const [repeatHeaderFooter, setRepeatHeaderFooter] = useState(false);

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

  const addBody = () => setSelectedBodies((prev) => [...prev, ""]);

  const removeBody = (index: number) =>
    setSelectedBodies((prev) => prev.filter((_, i) => i !== index));

  const updateBody = (index: number, value: string) =>
    setSelectedBodies((prev) => prev.map((v, i) => (i === index ? value : v)));

  const composeWithPageHeaders = (
    bodyHtml: string,
    headerHtml: string | null,
    footerHtml: string | null,
  ): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<div>${bodyHtml}</div>`,
      "text/html",
    );
    const container = doc.body.firstElementChild!;

    // Find all page break elements (may be nested)
    const pageBreaks = container.querySelectorAll(
      '.page-break, [data-type="page-break"]',
    );

    if (pageBreaks.length === 0) return "";

    // Replace each page break with a top-level sentinel marker
    // so we can split on it easily
    const SENTINEL = "<!--PB_SPLIT-->";
    pageBreaks.forEach((pb) => {
      // Walk up: if the page break is the only child of its parent(s),
      // remove the parent wrapper too (editors often wrap in a <p> or <div>)
      let target: Element = pb;
      while (
        target.parentElement &&
        target.parentElement !== container &&
        target.parentElement.childNodes.length === 1
      ) {
        target = target.parentElement;
      }
      target.replaceWith(doc.createComment("PB_SPLIT"));
    });

    // Serialize and split
    const html = container.innerHTML;
    const segments = html
      .split(SENTINEL)
      .map((s) => s.trim())
      .filter((s) => s && s !== "<br>" && s !== "<p></p>");

    // Build composed pages
    const pages = segments.map((segment, index) => {
      const parts: string[] = [];
      // Add top padding on pages after the first to match PDF margin
      const pageStyle = index > 0 ? ' style="padding-top: 10mm;"' : '';
      parts.push(`<div class="composed-page"${pageStyle}>`);
      if (headerHtml) {
        parts.push(`<div class="composed-header">${headerHtml}</div>`);
      }
      parts.push(`<div class="composed-body">${segment}</div>`);
      if (footerHtml) {
        parts.push(`<div class="composed-footer">${footerHtml}</div>`);
      }
      parts.push("</div>");
      return parts.join("\n");
    });

    return pages.join('\n<div class="page-break" data-type="page-break" style="page-break-after:always;"></div>\n');
  };

  const getComposedHtml = (): string => {
    const header = headers.find((h) => h._id === selectedHeader);
    const footer = footers.find((f) => f._id === selectedFooter);
    const headerHtml = header?.definition ?? null;
    const footerHtml = footer?.definition ?? null;

    // Concatenate all body HTML
    const bodyParts: string[] = [];
    for (const id of selectedBodies) {
      const body = bodies.find((b) => b._id === id);
      if (body) bodyParts.push(body.definition);
    }
    const allBodyHtml = bodyParts.join("\n");

    // Check if repeat is enabled and there are page breaks
    if (repeatHeaderFooter && (headerHtml || footerHtml)) {
      const hasPageBreaks =
        allBodyHtml.includes("page-break") ||
        allBodyHtml.includes('data-type="page-break"');
      if (hasPageBreaks) {
        const result = composeWithPageHeaders(allBodyHtml, headerHtml, footerHtml);
        if (result) return result;
      }
    }

    // Default: sequential composition
    const parts: string[] = [];
    if (headerHtml) {
      parts.push(`<div class="composed-header">${headerHtml}</div>`);
    }
    if (allBodyHtml) {
      parts.push(`<div class="composed-body">${allBodyHtml}</div>`);
    }
    if (footerHtml) {
      parts.push(`<div class="composed-footer">${footerHtml}</div>`);
    }
    return parts.join("\n");
  };

  const handlePreview = () => {
    setPreviewHtml(getComposedHtml());
    setIsPreviewOpen(true);
  };

  const handleExportPdf = async () => {
    const html = getComposedHtml();
    if (!pdfContainerRef.current) return;
    pdfContainerRef.current.innerHTML = html;
    pdfContainerRef.current.style.cssText = `
      position: fixed; left: 0; top: 0; z-index: -9999; opacity: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2c3e50; line-height: 1.6; font-size: 14px;
      padding: 0; width: 718px; max-width: 718px;
    `;

    // Aguarda imagens
    const images = Array.from(pdfContainerRef.current.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    );

    try {
      await exportWithHtml2Pdf(pdfContainerRef.current, "documento-composto.pdf");
    } finally {
      pdfContainerRef.current.innerHTML = "";
    }
  };

  const hasSelection =
    selectedHeader || selectedBodies.some(Boolean) || selectedFooter;

  return (
    <div className="composition-tab">
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

          {/* Repeat header/footer toggle */}
          {(selectedHeader || selectedFooter) && (
            <div className="compose-repeat-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={repeatHeaderFooter}
                  onChange={(e) => setRepeatHeaderFooter(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
              <span className="toggle-label">
                Repetir cabeçalho e rodapé em todas as páginas
              </span>
            </div>
          )}

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
