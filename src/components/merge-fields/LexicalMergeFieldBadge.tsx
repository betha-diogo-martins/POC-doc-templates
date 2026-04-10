/**
 * React badge component rendered by Lexical MergeFieldNode.decorate().
 * Displays the field label inside a styled inline badge.
 */

export interface LexicalMergeFieldBadgeProps {
  fieldId: string;
  label: string;
}

export default function LexicalMergeFieldBadge({
  fieldId,
  label,
}: LexicalMergeFieldBadgeProps) {
  return (
    <span className="merge-field-badge" title={`Campo: {{${fieldId}}}`}>
      {label || `{{${fieldId}}}`}
    </span>
  );
}
