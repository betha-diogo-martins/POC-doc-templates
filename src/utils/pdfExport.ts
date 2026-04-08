/**
 * PDF export utilities using html2pdf.js (client-side HTML → Canvas → PDF).
 */

import html2pdf from "html2pdf.js";

/** Default configuration for A4 PDF generation. */
const DEFAULT_PDF_OPTIONS = {
  margin: [10, 10, 10, 10] as [number, number, number, number],
  filename: "documento.pdf",
  image: { type: "jpeg" as const, quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true,
  },
  jsPDF: {
    unit: "mm" as const,
    format: "a4" as const,
    orientation: "portrait" as const,
  },
};

/**
 * Generates a PDF from an HTML element using html2pdf.js.
 * The PDF is rendered as a rasterized image (text is NOT selectable).
 */
export async function exportWithHtml2Pdf(
  element: HTMLElement,
  filename?: string,
): Promise<void> {
  const options = {
    ...DEFAULT_PDF_OPTIONS,
    filename: filename ?? DEFAULT_PDF_OPTIONS.filename,
  };

  await html2pdf().set(options).from(element).save();
}

/**
 * Generates a PDF from an HTML string using html2pdf.js.
 * Creates a temporary container, renders the HTML, then generates the PDF.
 */
export async function exportHtmlStringToPdf(
  htmlContent: string,
  filename?: string,
): Promise<void> {
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.cssText = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #2c3e50;
    line-height: 1.6;
    padding: 20px;
    max-width: 800px;
  `;

  document.body.appendChild(container);

  try {
    await exportWithHtml2Pdf(container, filename);
  } finally {
    document.body.removeChild(container);
  }
}
