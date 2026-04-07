import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import CKEditorPage from "./pages/CKEditorPage";
import TinyMCEPage from "./pages/TinyMCEPage";
import "./App.css";

/**
 * Main application component with navigation between CKEditor and TinyMCE pages.
 */
export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">📝 POC — Document Templates</h1>
          <p className="app-subtitle">Comparação CKEditor 5 vs TinyMCE</p>
        </div>
        <nav className="app-nav">
          <NavLink
            to="/ckeditor"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            CKEditor 5
          </NavLink>
          <NavLink
            to="/tinymce"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            TinyMCE
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/ckeditor" element={<CKEditorPage />} />
          <Route path="/tinymce" element={<TinyMCEPage />} />
          <Route path="*" element={<Navigate to="/ckeditor" replace />} />
        </Routes>
      </main>
    </div>
  );
}
