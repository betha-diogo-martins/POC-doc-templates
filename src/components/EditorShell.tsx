/**
 * Unified editor shell that wraps any rich text editor.
 * Provides a consistent layout with page header, action bar, editor area,
 * collapsible sidebar for dynamic fields, and composition tab.
 */

import { useRef, useState, type ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import {
  DOCUMENT_TEMPLATE,
  DOCUMENT_TEMPLATE_WITH_BADGES,
} from "../config/templateConfig";
import { useFieldValues } from "../utils/customMergeFields";
import { useCustomFields } from "../hooks/useCustomFields";
import { exportWithHtml2Pdf } from "../utils/pdfExport";
import PdfPreview from "./PdfPreview";
import CompositionTab from "./CompositionTab";
import MergeFieldsProvider from "../contexts/MergeFieldsProvider";
import { createTemplate, updateTemplate } from "../services/templateService";
import type { TemplateDoc, TemplateType } from "../types/template";

export interface EditorShellProps {
  /** Toolbar + editor area rendered inside the shell. */
  children: ReactNode;
  /** Returns the current HTML content from the editor. */
  getEditorHtml: () => string;
  /** Sets the editor content with new HTML. */
  setEditorHtml: (html: string) => void;
  /** Reference to the printable content area. */
  printRef: React.RefObject<HTMLDivElement | null>;
  /**
   * When true, replaces both plain {{campo}} AND badge <span> elements.
   * Used by free editors (Tiptap, Lexical, Quill).
   */
  useBadges?: boolean;
  /** Currently loaded template (for edit mode). */
  activeTemplate?: TemplateDoc | null;
  /** Callback after successful save/update. */
  onSaved?: (doc: TemplateDoc) => void;
  /** Callback to create a new document (clears active template). */
  onNew?: () => void;
  /** Editor display name for the header. */
  editorName?: string;
  /** Short description for the page header. */
  editorDescription?: string;
}

type ActiveTab = "editor" | "composition";

export default function EditorShell({
  children,
  getEditorHtml,
  setEditorHtml,
  printRef,
  useBadges = false,
  activeTemplate,
  onSaved,
  onNew,
  editorName = "Editor de documentos",
  editorDescription = "Crie um documento novo ou edite um existente utilizando campos dinâmicos.",
}: EditorShellProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");
  const [docName, setDocName] = useState(activeTemplate?.name ?? "");
  const [docType, setDocType] = useState<TemplateType>(
    activeTemplate?.type ?? "body",
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { values, updateField, resetToDefaults } = useFieldValues();
  const {
    addGroup,
    removeGroup,
    addField,
    removeField,
    getAllFieldsByGroup,
    isCustomGroup,
    isCustomField,
  } = useCustomFields();
  const fieldsByGroup = getAllFieldsByGroup();

  // State for inline "add section" form
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionError, setSectionError] = useState("");

  // State for inline "add field" forms (keyed by group name)
  const [addingFieldGroup, setAddingFieldGroup] = useState<string | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldDefault, setNewFieldDefault] = useState("");
  const [fieldError, setFieldError] = useState("");

  // State for removal confirmations
  const [confirmRemoveGroup, setConfirmRemoveGroup] = useState<string | null>(
    null,
  );
  const [confirmRemoveField, setConfirmRemoveField] = useState<string | null>(
    null,
  );

  // Sync display name/type with active template
  const displayName = activeTemplate?.name ?? docName;
  const displayType = activeTemplate?.type ?? docType;

  /**
   * Replaces merge field placeholders in HTML with current sidebar values.
   * Handles both standard MERGE_FIELDS and custom fields.
   * Used automatically when previewing/exporting PDF.
   */
  const replaceMergeFields = (html: string): string => {
    let result = html;

    // Build unified list of all fields (standard + custom)
    const allFields = Array.from(fieldsByGroup.values()).flat();

    // 1. Replace plain {{field}} placeholders
    for (const field of allFields) {
      const value = values[field.id];
      if (!value) continue;
      const plainRegex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
      result = result.replace(plainRegex, value);
    }

    // 2. Replace badge <span> elements (used by Tiptap, Lexical, Quill)
    if (useBadges) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(result, "text/html");

      for (const field of allFields) {
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

  const handlePreview = () => {
    const html = replaceMergeFields(getEditorHtml());
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

  const handleExportPdf = async () => {
    const html = replaceMergeFields(getEditorHtml());
    if (!pdfContainerRef.current) return;
    pdfContainerRef.current.innerHTML = html;
    pdfContainerRef.current.style.cssText = `
      position: fixed; left: 0; top: 0; z-index: -9999; opacity: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2c3e50; line-height: 1.6; font-size: 14px;
      padding: 0; width: 718px; max-width: 718px;
    `;

    // Wait for all images to load before capturing
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
      await exportWithHtml2Pdf(
        pdfContainerRef.current,
        "documento-template.pdf",
      );
    } finally {
      pdfContainerRef.current.innerHTML = "";
    }
  };

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handleSave = async () => {
    const definition = getEditorHtml();
    const currentName = activeTemplate ? displayName : docName;
    if (!currentName.trim()) {
      setSaveMessage("⚠️ Informe um nome para o documento.");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      let saved: TemplateDoc;
      if (activeTemplate) {
        saved = await updateTemplate(activeTemplate._id, {
          definition,
          name: currentName,
          type: displayType,
        });
        setSaveMessage("✅ Atualizado!");
      } else {
        saved = await createTemplate({
          name: currentName,
          type: docType,
          definition,
        });
        setSaveMessage("✅ Salvo!");
      }
      onSaved?.(saved);
    } catch {
      setSaveMessage("❌ Erro ao salvar.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleNew = () => {
    setDocName("");
    setDocType("body");
    resetToDefaults();
    onNew?.();
    setEditorHtml(
      useBadges ? DOCUMENT_TEMPLATE_WITH_BADGES : DOCUMENT_TEMPLATE,
    );
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const startEditingName = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  /* ── Custom section/field handlers ── */

  const handleAddSection = () => {
    const trimmed = newSectionName.trim();
    if (!trimmed) {
      setSectionError("Informe um nome para a seção.");
      return;
    }
    const success = addGroup(trimmed);
    if (!success) {
      setSectionError("Já existe uma seção com esse nome.");
      return;
    }
    setNewSectionName("");
    setSectionError("");
    setIsAddingSection(false);
  };

  const cancelAddSection = () => {
    setNewSectionName("");
    setSectionError("");
    setIsAddingSection(false);
  };

  const handleAddField = (groupName: string) => {
    const trimmed = newFieldLabel.trim();
    if (!trimmed) {
      setFieldError("Informe o label do campo.");
      return;
    }
    const created = addField({
      label: trimmed,
      defaultValue: newFieldDefault.trim(),
      group: groupName,
    });
    if (!created) {
      setFieldError("Não foi possível gerar um ID válido.");
      return;
    }
    // Register the new field in useFieldValues with its default value
    updateField(created.id, created.defaultValue);
    setNewFieldLabel("");
    setNewFieldDefault("");
    setFieldError("");
    setAddingFieldGroup(null);
  };

  const cancelAddField = () => {
    setNewFieldLabel("");
    setNewFieldDefault("");
    setFieldError("");
    setAddingFieldGroup(null);
  };

  const handleRemoveGroup = (groupName: string) => {
    removeGroup(groupName);
    setConfirmRemoveGroup(null);
  };

  const handleRemoveField = (fieldId: string) => {
    removeField(fieldId);
    setConfirmRemoveField(null);
  };

  return (
    <div className="editor-shell">
      {/* Page header */}
      <div className="shell-header">
        <div className="shell-header-text">
          <h2 className="shell-title">{editorName}</h2>
          <p className="shell-description">{editorDescription}</p>
        </div>
        <div className="shell-tabs">
          <button
            type="button"
            className={`shell-tab ${activeTab === "editor" ? "active" : ""}`}
            onClick={() => setActiveTab("editor")}
          >
            EDITOR
          </button>
          <button
            type="button"
            className={`shell-tab ${activeTab === "composition" ? "active" : ""}`}
            onClick={() => setActiveTab("composition")}
          >
            COMPOSIÇÃO
          </button>
        </div>
      </div>

      {activeTab === "editor" ? (
        <>
          {/* Action bar */}
          <div className="shell-action-bar">
            <div className="shell-doc-info">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  className="shell-doc-name-input"
                  value={activeTemplate ? displayName : docName}
                  onChange={(e) => {
                    if (!activeTemplate) setDocName(e.target.value);
                  }}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingName(false);
                  }}
                  placeholder="Nome do documento"
                  readOnly={!!activeTemplate}
                />
              ) : (
                <button
                  type="button"
                  className="shell-doc-name"
                  onClick={startEditingName}
                  title="Editar nome do documento"
                >
                  {displayName || "Documento sem título"}
                  <span className="shell-edit-icon">✏️</span>
                </button>
              )}
              <select
                className="shell-type-select"
                value={displayType}
                onChange={(e) => {
                  if (!activeTemplate)
                    setDocType(e.target.value as TemplateType);
                }}
                disabled={!!activeTemplate}
              >
                <option value="header">Header</option>
                <option value="body">Body</option>
                <option value="footer">Footer</option>
              </select>
              {saveMessage && (
                <span className="shell-save-message">{saveMessage}</span>
              )}
            </div>
            <div className="shell-actions">
              {activeTemplate && (
                <button
                  type="button"
                  className="shell-btn shell-btn-new"
                  onClick={handleNew}
                >
                  ➕ Novo
                </button>
              )}
              <button
                type="button"
                className="shell-btn shell-btn-preview"
                onClick={handlePreview}
              >
                👁️ Visualizar PDF
              </button>
              <button
                type="button"
                className="shell-btn shell-btn-export"
                onClick={handleExportPdf}
              >
                📄 Exportar PDF
              </button>
              <button
                type="button"
                className="shell-btn shell-btn-print"
                onClick={() => handlePrint()}
              >
                🖨️ Imprimir
              </button>
              <button
                type="button"
                className="shell-btn shell-btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "⏳ Salvando..." : "💾 Salvar"}
              </button>
            </div>
          </div>

          {/* Editor + Sidebar */}
          <div className="shell-body">
            <MergeFieldsProvider fieldsByGroup={fieldsByGroup}>
              <div className="shell-editor-area">{children}</div>

              {/* Dynamic Fields Sidebar */}
              <aside className="shell-sidebar">
                <div className="shell-sidebar-header">
                  <h3 className="shell-sidebar-title">Campos Dinâmicos</h3>
                  <button
                    type="button"
                    className="shell-sidebar-add-btn"
                    onClick={() => {
                      setIsAddingSection(true);
                      setSectionError("");
                    }}
                    title="Adicionar seção"
                  >
                    +
                  </button>
                </div>

                {/* Inline form: add section */}
                {isAddingSection && (
                  <div className="shell-inline-form">
                    <input
                      type="text"
                      className="shell-inline-input"
                      placeholder="Nome da seção"
                      value={newSectionName}
                      onChange={(e) => {
                        setNewSectionName(e.target.value);
                        setSectionError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSection();
                        if (e.key === "Escape") cancelAddSection();
                      }}
                      autoFocus
                    />
                    {sectionError && (
                      <span className="shell-inline-error">{sectionError}</span>
                    )}
                    <div className="shell-inline-actions">
                      <button
                        type="button"
                        className="shell-inline-btn shell-inline-btn-confirm"
                        onClick={handleAddSection}
                      >
                        Criar
                      </button>
                      <button
                        type="button"
                        className="shell-inline-btn shell-inline-btn-cancel"
                        onClick={cancelAddSection}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="shell-sidebar-fields">
                  {Array.from(fieldsByGroup.entries()).map(
                    ([groupName, fields]) => {
                      const isCollapsed = collapsedGroups.has(groupName);
                      const isCustom = isCustomGroup(groupName);
                      return (
                        <div key={groupName} className="shell-field-group">
                          <div className="shell-group-header">
                            <button
                              type="button"
                              className="shell-group-toggle"
                              onClick={() => toggleGroup(groupName)}
                            >
                              <span
                                className={`shell-chevron ${isCollapsed ? "collapsed" : ""}`}
                              >
                                ▾
                              </span>
                              <span className="shell-group-name">
                                {groupName}
                              </span>
                            </button>
                            {isCustom && (
                              <div className="shell-group-actions">
                                {confirmRemoveGroup === groupName ? (
                                  <span className="shell-confirm-popover">
                                    <span className="shell-confirm-text">
                                      Remover?
                                    </span>
                                    <button
                                      type="button"
                                      className="shell-confirm-yes"
                                      onClick={() =>
                                        handleRemoveGroup(groupName)
                                      }
                                    >
                                      Sim
                                    </button>
                                    <button
                                      type="button"
                                      className="shell-confirm-no"
                                      onClick={() =>
                                        setConfirmRemoveGroup(null)
                                      }
                                    >
                                      Não
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="shell-group-remove-btn"
                                    onClick={() =>
                                      setConfirmRemoveGroup(groupName)
                                    }
                                    title="Remover seção"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {!isCollapsed && (
                            <div className="shell-group-content">
                              {fields.map((field) => (
                                <div key={field.id} className="shell-field-row">
                                  <div className="shell-field-header">
                                    <span className="shell-field-label">
                                      {field.label}
                                    </span>
                                    <code className="shell-field-badge">{`{{${field.id}}}`}</code>
                                    {isCustomField(field.id) && (
                                      <>
                                        {confirmRemoveField === field.id ? (
                                          <span className="shell-confirm-popover shell-confirm-popover-sm">
                                            <button
                                              type="button"
                                              className="shell-confirm-yes"
                                              onClick={() =>
                                                handleRemoveField(field.id)
                                              }
                                            >
                                              ✓
                                            </button>
                                            <button
                                              type="button"
                                              className="shell-confirm-no"
                                              onClick={() =>
                                                setConfirmRemoveField(null)
                                              }
                                            >
                                              ✗
                                            </button>
                                          </span>
                                        ) : (
                                          <button
                                            type="button"
                                            className="shell-field-remove-btn"
                                            onClick={() =>
                                              setConfirmRemoveField(field.id)
                                            }
                                            title="Remover campo"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    className="shell-field-input"
                                    value={values[field.id] ?? ""}
                                    onChange={(e) =>
                                      updateField(field.id, e.target.value)
                                    }
                                    placeholder={`Ex.: ${field.defaultValue}`}
                                  />
                                </div>
                              ))}

                              {/* Inline form: add field */}
                              {addingFieldGroup === groupName ? (
                                <div className="shell-inline-form shell-inline-form-field">
                                  <input
                                    type="text"
                                    className="shell-inline-input"
                                    placeholder="Label do campo"
                                    value={newFieldLabel}
                                    onChange={(e) => {
                                      setNewFieldLabel(e.target.value);
                                      setFieldError("");
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Escape") cancelAddField();
                                    }}
                                    autoFocus
                                  />
                                  <input
                                    type="text"
                                    className="shell-inline-input"
                                    placeholder="Valor padrão (opcional)"
                                    value={newFieldDefault}
                                    onChange={(e) =>
                                      setNewFieldDefault(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleAddField(groupName);
                                      if (e.key === "Escape") cancelAddField();
                                    }}
                                  />
                                  {fieldError && (
                                    <span className="shell-inline-error">
                                      {fieldError}
                                    </span>
                                  )}
                                  <div className="shell-inline-actions">
                                    <button
                                      type="button"
                                      className="shell-inline-btn shell-inline-btn-confirm"
                                      onClick={() => handleAddField(groupName)}
                                    >
                                      Adicionar
                                    </button>
                                    <button
                                      type="button"
                                      className="shell-inline-btn shell-inline-btn-cancel"
                                      onClick={cancelAddField}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="shell-add-field-btn"
                                  onClick={() => {
                                    setAddingFieldGroup(groupName);
                                    setFieldError("");
                                    setNewFieldLabel("");
                                    setNewFieldDefault("");
                                  }}
                                >
                                  + Campo
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </aside>
            </MergeFieldsProvider>
          </div>
        </>
      ) : (
        <CompositionTab />
      )}

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
