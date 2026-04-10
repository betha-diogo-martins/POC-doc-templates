/**
 * Shared toolbar controls for line-height and paragraph spacing.
 *
 * Provides preset quick-select buttons plus a custom input field so users
 * can specify any value (e.g. "2.33cm", "18pt", "1.8").
 *
 * Used by Tiptap, Lexical, and Quill editor templates.
 */

import { useState } from "react";

export interface SpacingControlsProps {
  /** Apply line-height to the current selection. */
  onLineHeight: (value: string) => void;
  /** Apply paragraph spacing (margin-top + margin-bottom) to the current selection. */
  onSpacing: (value: string) => void;
}

/** Preset line-height values. */
const LINE_HEIGHT_PRESETS = [
  { label: "1.0", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "2.0", value: "2" },
];

/** Preset paragraph spacing values. */
const SPACING_PRESETS = [
  { label: "Nenhum", value: "0" },
  { label: "0.5em", value: "0.5em" },
  { label: "1em", value: "1em" },
  { label: "1.5em", value: "1.5em" },
  { label: "2em", value: "2em" },
];

export default function SpacingControls({
  onLineHeight,
  onSpacing,
}: SpacingControlsProps) {
  const [customLineHeight, setCustomLineHeight] = useState("");
  const [customSpacing, setCustomSpacing] = useState("");

  const applyCustomLineHeight = () => {
    const v = customLineHeight.trim();
    if (v) {
      onLineHeight(v);
      setCustomLineHeight("");
    }
  };

  const applyCustomSpacing = () => {
    const v = customSpacing.trim();
    if (v) {
      onSpacing(v);
      setCustomSpacing("");
    }
  };

  return (
    <div className="spacing-controls">
      {/* Line Height */}
      <div className="spacing-controls-group">
        <span className="toolbar-label">Entrelinha:</span>
        <div className="spacing-presets">
          {LINE_HEIGHT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className="spacing-preset-btn"
              onClick={() => onLineHeight(p.value)}
              title={`Line-height ${p.value}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="spacing-custom-input">
          <input
            type="text"
            className="spacing-input"
            placeholder="Ex: 1.8"
            value={customLineHeight}
            onChange={(e) => setCustomLineHeight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCustomLineHeight();
            }}
            title="Valor personalizado de line-height (ex: 1.8, 2.5)"
          />
          <button
            type="button"
            className="spacing-apply-btn"
            onClick={applyCustomLineHeight}
            title="Aplicar"
          >
            ✓
          </button>
        </div>
      </div>

      {/* Paragraph Spacing */}
      <div className="spacing-controls-group">
        <span className="toolbar-label">Espaçamento:</span>
        <div className="spacing-presets">
          {SPACING_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className="spacing-preset-btn"
              onClick={() => onSpacing(p.value)}
              title={`Margin-top/bottom: ${p.value}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="spacing-custom-input">
          <input
            type="text"
            className="spacing-input"
            placeholder="Ex: 2.33cm"
            value={customSpacing}
            onChange={(e) => setCustomSpacing(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCustomSpacing();
            }}
            title="Valor personalizado com unidade CSS (ex: 2.33cm, 18pt, 1.5em)"
          />
          <button
            type="button"
            className="spacing-apply-btn"
            onClick={applyCustomSpacing}
            title="Aplicar"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}
