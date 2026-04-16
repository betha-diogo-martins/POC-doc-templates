/**
 * Templates management page.
 * Lists templates with filter by type (header, body, footer).
 * Provides edit and delete actions per template.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TemplateDoc, TemplateType } from "../types/template";
import { fetchTemplates, deleteTemplate } from "../services/templateService";

const TYPE_LABELS: Record<TemplateType, string> = {
  header: "🔝 Header",
  body: "📄 Body",
  footer: "🔚 Footer",
};

const ALL_TYPES: TemplateType[] = ["header", "body", "footer"];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [filterType, setFilterType] = useState<TemplateType | "">("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTemplates(filterType || undefined);
        setTemplates(data);
      } catch (err) {
        console.error("Failed to load templates", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filterType]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir template "${name}"?`)) return;
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete template", err);
    }
  };

  const handleEdit = (template: TemplateDoc) => {
    // Navigate to the tiptap editor with the template ID as a query param
    navigate(`/tiptap?templateId=${template._id}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>📋 Templates</h2>
        <p className="page-description">
          Gerencie seus templates de documentos. Filtre por tipo e edite ou
          exclua.
        </p>
      </div>

      {/* Filters */}
      <div className="templates-filters">
        <button
          className={`btn ${filterType === "" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFilterType("")}
          type="button"
        >
          Todos
        </button>
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            className={`btn ${filterType === t ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterType(t)}
            type="button"
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="templates-loading">Carregando...</div>
      ) : templates.length === 0 ? (
        <div className="templates-empty">
          <p>Nenhum template encontrado.</p>
          <p className="text-muted">
            Crie um template usando um dos editores disponíveis.
          </p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((tmpl) => (
            <div key={tmpl._id} className="template-card">
              <div className="template-card-header">
                <span className={`template-type-badge type-${tmpl.type}`}>
                  {tmpl.type.toUpperCase()}
                </span>
                <span className="template-date">
                  {new Date(tmpl.updatedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h3 className="template-card-title">{tmpl.name}</h3>
              <div
                className="template-card-preview"
                dangerouslySetInnerHTML={{
                  __html: tmpl.definition.slice(0, 200) + "...",
                }}
              />
              <div className="template-card-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(tmpl)}
                  type="button"
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(tmpl._id, tmpl.name)}
                  type="button"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
