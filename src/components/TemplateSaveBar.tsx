/**
 * Save bar component for persisting the current editor content as a template.
 * Displayed inside the editor pages.
 */

import { useState } from "react";
import { createTemplate, updateTemplate } from "../services/templateService";
import type { TemplateType, TemplateDoc } from "../types/template";

interface TemplateSaveBarProps {
  /** Returns the current HTML content from the editor. */
  getEditorHtml: () => string;
  /** Sets the editor content with new HTML. */
  setEditorHtml: (html: string) => void;
  /** Currently loaded template (for edit mode). */
  activeTemplate?: TemplateDoc | null;
  /** Callback after successful save. */
  onSaved?: (doc: TemplateDoc) => void;
  /** Callback to clear the active template (new document). */
  onNew?: () => void;
}

export default function TemplateSaveBar({
  getEditorHtml,
  activeTemplate,
  onSaved,
  onNew,
}: TemplateSaveBarProps) {
  const [name, setName] = useState(activeTemplate?.name ?? "");
  const [type, setType] = useState<TemplateType>(
    activeTemplate?.type ?? "body",
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /** Sync local state when active template changes externally. */
  const displayName = activeTemplate ? activeTemplate.name : name;
  const displayType = activeTemplate ? activeTemplate.type : type;

  const handleSave = async () => {
    const definition = getEditorHtml();
    const currentName = activeTemplate ? displayName : name;
    if (!currentName.trim()) {
      setMessage("⚠️ Informe um nome para o template.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      let saved: TemplateDoc;
      if (activeTemplate) {
        saved = await updateTemplate(activeTemplate._id, {
          definition,
          name: currentName,
          type: displayType,
        });
        setMessage("✅ Template atualizado!");
      } else {
        saved = await createTemplate({
          name: currentName,
          type,
          definition,
        });
        setMessage("✅ Template criado!");
      }
      onSaved?.(saved);
    } catch {
      setMessage("❌ Erro ao salvar template.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="template-save-bar">
      <div className="save-bar-fields">
        <input
          type="text"
          className="field-input save-bar-name"
          placeholder="Nome do template"
          value={activeTemplate ? displayName : name}
          onChange={(e) => {
            if (!activeTemplate) setName(e.target.value);
          }}
          readOnly={!!activeTemplate}
        />
        <select
          className="field-input save-bar-type"
          value={activeTemplate ? displayType : type}
          onChange={(e) => {
            if (!activeTemplate) setType(e.target.value as TemplateType);
          }}
          disabled={!!activeTemplate}
        >
          <option value="header">Header</option>
          <option value="body">Body</option>
          <option value="footer">Footer</option>
        </select>
      </div>
      <div className="save-bar-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving
            ? "⏳ Salvando..."
            : activeTemplate
              ? "💾 Atualizar"
              : "💾 Salvar"}
        </button>
        {activeTemplate && (
          <button className="btn btn-secondary" onClick={onNew} type="button">
            ➕ Novo
          </button>
        )}
        {message && <span className="save-bar-message">{message}</span>}
      </div>
    </div>
  );
}
