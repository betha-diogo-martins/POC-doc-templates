/**
 * React component rendered by Lexical PageBreakNode.decorate().
 * Shows a visual page break separator.
 */

export default function LexicalPageBreakView() {
  return (
    <div className="page-break" contentEditable={false}>
      <span className="page-break-label">Quebra de Página</span>
    </div>
  );
}
