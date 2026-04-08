import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import CKEditorPage from "./pages/CKEditorPage";
import TinyMCEPage from "./pages/TinyMCEPage";
import TiptapPage from "./pages/TiptapPage";
import LexicalPage from "./pages/LexicalPage";
import QuillPage from "./pages/QuillPage";
import "./App.css";

/**
 * Main application component with navigation between editor pages.
 * Organized in two sections: Premium (Trial/GPL) and MIT/BSD (Free).
 */
export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">📝 POC — Document Templates</h1>
          <p className="app-subtitle">
            Comparação de Rich Text Editors: Premium vs MIT/BSD
          </p>
        </div>
        <nav className="app-nav">
          <div className="nav-section">
            <span className="nav-section-label">GPL 2+ (Trial)</span>
            <NavLink
              to="/ckeditor"
              className={({ isActive }) =>
                `nav-link nav-link-premium ${isActive ? "active" : ""}`
              }
            >
              CKEditor 5
            </NavLink>
            <NavLink
              to="/tinymce"
              className={({ isActive }) =>
                `nav-link nav-link-premium ${isActive ? "active" : ""}`
              }
            >
              TinyMCE
            </NavLink>
          </div>
          <div className="nav-divider" />
          <div className="nav-section">
            <span className="nav-section-label">MIT / BSD (Free)</span>
            <NavLink
              to="/tiptap"
              className={({ isActive }) =>
                `nav-link nav-link-free ${isActive ? "active" : ""}`
              }
            >
              Tiptap
            </NavLink>
            <NavLink
              to="/lexical"
              className={({ isActive }) =>
                `nav-link nav-link-free ${isActive ? "active" : ""}`
              }
            >
              Lexical
            </NavLink>
            <NavLink
              to="/quill"
              className={({ isActive }) =>
                `nav-link nav-link-free ${isActive ? "active" : ""}`
              }
            >
              Quill
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/ckeditor" element={<CKEditorPage />} />
          <Route path="/tinymce" element={<TinyMCEPage />} />
          <Route path="/tiptap" element={<TiptapPage />} />
          <Route path="/lexical" element={<LexicalPage />} />
          <Route path="/quill" element={<QuillPage />} />
          <Route path="*" element={<Navigate to="/tiptap" replace />} />
        </Routes>
      </main>
    </div>
  );
}
