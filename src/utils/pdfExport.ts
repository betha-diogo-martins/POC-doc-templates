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
    width: 718,
  },
  jsPDF: {
    unit: "mm" as const,
    format: "a4" as const,
    orientation: "portrait" as const,
  },
  /**
   * Page break configuration for html2pdf.js.
   * Elements with the `html2pdf-page-break-after` class act as invisible
   * markers that tell html2pdf where to split pages.
   */
  pagebreak: {
    mode: ["css", "legacy"] as string[],
    after: [".html2pdf-page-break-after"],
  },
};

/**
 * Generates a PDF from an HTML element using html2pdf.js.
 * The PDF is rendered as a rasterized image (text is NOT selectable).
 *
 * Page-break elements are temporarily replaced with invisible markers so
 * html2pdf can split pages without the dashed line / label appearing in
 * the final PDF.
 */
export async function exportWithHtml2Pdf(
  element: HTMLElement,
  filename?: string,
): Promise<void> {
  const options = {
    ...DEFAULT_PDF_OPTIONS,
    filename: filename ?? DEFAULT_PDF_OPTIONS.filename,
  };

  // Snapshot the original page-break elements and swap them with invisible
  // markers. We keep a list of [marker, originalHtml] so we can restore later.
  const pageBreaks = Array.from(
    element.querySelectorAll<HTMLElement>(".page-break"),
  );
  const originals: Array<{ marker: HTMLElement; original: HTMLElement }> = [];

  for (const pb of pageBreaks) {
    const marker = document.createElement("div");
    marker.className = "html2pdf-page-break-after";
    marker.style.cssText =
      "height:0;overflow:hidden;margin:0;padding:0;border:none;page-break-after:always;";
    pb.replaceWith(marker);
    originals.push({ marker, original: pb });
  }

  // Apply inline table styles so they render correctly in the off-screen container
  for (const table of Array.from(element.querySelectorAll("table"))) {
    (table as HTMLElement).style.cssText += "border-collapse:collapse;width:100%;margin:12px 0;";
  }
  for (const cell of Array.from(element.querySelectorAll("th,td"))) {
    (cell as HTMLElement).style.cssText += "border:1px solid #ddd;padding:8px 12px;text-align:left;";
  }
  for (const th of Array.from(element.querySelectorAll("th"))) {
    (th as HTMLElement).style.cssText += "background:#f8f9fa;font-weight:600;";
  }

  try {
    await html2pdf().set(options).from(element).save();
  } finally {
    // Restore the original page-break elements so the editor/preview is
    // unaffected after the export finishes.
    for (const { marker, original } of originals) {
      marker.replaceWith(original);
    }
  }
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
    padding: 0;
    max-width: 718px;
    width: 718px;
  `;

  document.body.appendChild(container);

  try {
    await exportWithHtml2Pdf(container, filename);
  } finally {
    document.body.removeChild(container);
  }
}
