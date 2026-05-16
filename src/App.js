import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';

const STORAGE_KEY = 'taka-tracker-v1';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { projects: [] };
  } catch { return { projects: [] }; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeProjectId, setActiveProjectId] = useState(null);

  useEffect(() => { saveData(data); }, [data]);

  const activeProject = data.projects.find(p => p.id === activeProjectId) || null;

  const updateData = useCallback((fn) => {
    setData(prev => {
      const next = fn(prev);
      return next;
    });
  }, []);

  return (
    <div className="app-shell">
      <Header onHome={() => setActiveProjectId(null)} activeProject={activeProject} />
      <main className="app-main">
        {!activeProject ? (
          <ProjectList
            projects={data.projects}
            onSelect={setActiveProjectId}
            onUpdate={updateData}
          />
        ) : (
          <ProjectView
            project={activeProject}
            onBack={() => setActiveProjectId(null)}
            onUpdate={updateData}
          />
        )}
      </main>
    </div>
  );
}

function Header({ onHome, activeProject }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <button className="logo-btn" onClick={onHome}>
          <span className="logo-icon">৳</span>
          <span className="logo-text">Taka<strong>Tracker</strong></span>
        </button>
        {activeProject && (
          <div className="header-breadcrumb">
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-name">{activeProject.name}</span>
          </div>
        )}
        <div className="header-tag mono">BD Maker Tool</div>
      </div>
    </header>
  );
}
