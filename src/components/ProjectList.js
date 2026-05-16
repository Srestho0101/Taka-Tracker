import React, { useState } from 'react';
import { Plus, FolderOpen, Trash2, ChevronRight, Cpu, Calendar, Package } from 'lucide-react';
import './ProjectList.css';

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function ProjectList({ projects, onSelect, onUpdate }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  function handleCreate() {
    if (!name.trim()) return;
    const project = {
      id: genId(),
      name: name.trim(),
      description: desc.trim(),
      createdAt: new Date().toISOString(),
      components: [],
    };
    onUpdate(prev => ({ ...prev, projects: [project, ...prev.projects] }));
    setName(''); setDesc(''); setCreating(false);
  }

  function handleDelete(id) {
    onUpdate(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    setDeleteId(null);
  }

  function getTotalBudget(project) {
    let total = 0;
    for (const comp of project.components) {
      const selectedStore = comp.selectedStore;
      if (selectedStore) {
        const price = comp.prices?.find(p => p.store === selectedStore)?.price || 0;
        total += price * (comp.quantity || 1);
      } else if (comp.prices && comp.prices.length > 0) {
        const minPrice = Math.min(...comp.prices.map(p => p.price));
        total += minPrice * (comp.quantity || 1);
      }
    }
    return total;
  }

  return (
    <div className="pl-root fade-in">
      <div className="pl-hero">
        <div className="pl-hero-badge mono">MAKER TOOL</div>
        <h1 className="pl-hero-title">Your Build Projects</h1>
        <p className="pl-hero-sub">Plan components, compare store prices in Taka, and share your purchase checklist.</p>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {creating && (
        <div className="pl-create-card fade-in">
          <h3 className="pl-create-title">New Project</h3>
          <input
            autoFocus
            placeholder="Project name (e.g. Quad Drone v1)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="pl-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="pl-input pl-textarea"
            rows={2}
          />
          <div className="pl-create-actions">
            <button className="btn-primary" onClick={handleCreate}>Create Project</button>
            <button className="btn-ghost" onClick={() => { setCreating(false); setName(''); setDesc(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !creating && (
        <div className="pl-empty">
          <div className="pl-empty-icon"><Cpu size={40} /></div>
          <p>No projects yet. Create your first build project!</p>
        </div>
      )}

      <div className="pl-grid">
        {projects.map((project, i) => {
          const budget = getTotalBudget(project);
          const comps = project.components?.length || 0;
          const date = new Date(project.createdAt).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric' });
          return (
            <div
              key={project.id}
              className="pl-card fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="pl-card-header">
                <div className="pl-card-icon"><FolderOpen size={18} /></div>
                <button
                  className="pl-delete-btn"
                  onClick={e => { e.stopPropagation(); setDeleteId(project.id); }}
                  title="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h2 className="pl-card-name" onClick={() => onSelect(project.id)}>{project.name}</h2>
              {project.description && <p className="pl-card-desc">{project.description}</p>}
              <div className="pl-card-meta">
                <span className="pl-meta-item"><Package size={12} /> {comps} component{comps !== 1 ? 's' : ''}</span>
                <span className="pl-meta-item"><Calendar size={12} /> {date}</span>
              </div>
              {budget > 0 && (
                <div className="pl-card-budget mono">
                  ৳{budget.toLocaleString('en-BD')}
                  <span className="pl-budget-label">est. total</span>
                </div>
              )}
              <button className="pl-open-btn" onClick={() => onSelect(project.id)}>
                Open Project <ChevronRight size={14} />
              </button>

              {deleteId === project.id && (
                <div className="pl-confirm-overlay" onClick={e => e.stopPropagation()}>
                  <p>Delete <strong>{project.name}</strong>?</p>
                  <div className="pl-confirm-btns">
                    <button className="btn-danger" onClick={() => handleDelete(project.id)}>Delete</button>
                    <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
