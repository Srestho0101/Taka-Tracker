import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Download, Store, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import ComponentRow from './ComponentRow';
import ExportCard from './ExportCard';
import './ProjectView.css';

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const STORES = ['TechshopBD', 'RoboticsBD', 'StarTech', 'UltraTech', 'RyansComputers', 'DarazBD', 'AliExpress', 'Custom'];

export default function ProjectView({ project, onBack, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newCat, setNewCat] = useState('');
  const [globalStore, setGlobalStore] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  function updateProject(fn) {
    onUpdate(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === project.id ? fn(p) : p)
    }));
  }

  function addComponent() {
    if (!newName.trim()) return;
    const comp = {
      id: genId(),
      name: newName.trim(),
      quantity: parseInt(newQty) || 1,
      category: newCat.trim(),
      prices: [],
      selectedStore: '',
      notes: '',
      checked: false,
    };
    updateProject(p => ({ ...p, components: [...p.components, comp] }));
    setNewName(''); setNewQty(1); setNewCat('');
    setAdding(false);
  }

  function updateComponent(id, changes) {
    updateProject(p => ({
      ...p,
      components: p.components.map(c => c.id === id ? { ...c, ...changes } : c)
    }));
  }

  function deleteComponent(id) {
    updateProject(p => ({ ...p, components: p.components.filter(c => c.id !== id) }));
  }

  // Summary calculations
  const { totalSelected, totalMin, totalMax, allStores, completeness } = useMemo(() => {
    let totalSelected = 0, totalMin = 0, totalMax = 0;
    const storeSet = new Set();
    let withPrice = 0;
    const comps = project.components || [];

    for (const comp of comps) {
      const qty = comp.quantity || 1;
      if (comp.prices && comp.prices.length > 0) {
        withPrice++;
        const prices = comp.prices.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          totalMin += Math.min(...prices) * qty;
          totalMax += Math.max(...prices) * qty;
        }
        const storeKey = globalStore || comp.selectedStore;
        if (storeKey) {
          const match = comp.prices.find(p => p.store === storeKey);
          if (match) totalSelected += match.price * qty;
          else {
            const fallback = comp.prices.find(p => p.store === comp.selectedStore);
            if (fallback) totalSelected += fallback.price * qty;
            else totalSelected += Math.min(...prices) * qty;
          }
        } else {
          totalSelected += Math.min(...prices) * qty;
        }
        comp.prices.forEach(p => storeSet.add(p.store));
      }
    }

    return {
      totalSelected,
      totalMin,
      totalMax,
      allStores: [...storeSet].sort(),
      completeness: comps.length > 0 ? Math.round((withPrice / comps.length) * 100) : 0
    };
  }, [project.components, globalStore]);

  const categories = useMemo(() => {
    const cats = new Set(project.components.map(c => c.category).filter(Boolean));
    return [...cats].sort();
  }, [project.components]);

  const filteredComponents = useMemo(() => {
    if (!filterCat) return project.components;
    return project.components.filter(c => c.category === filterCat);
  }, [project.components, filterCat]);

  const checkedCount = project.components.filter(c => c.checked).length;

  return (
    <div className="pv-root fade-in">
      {/* Top bar */}
      <div className="pv-topbar">
        <button className="pv-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Projects
        </button>
        <div className="pv-title-block">
          <h1 className="pv-title">{project.name}</h1>
          {project.description && <p className="pv-desc">{project.description}</p>}
        </div>
        <div className="pv-topbar-actions">
          <button className="btn-export" onClick={() => setShowExport(true)}>
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="pv-summary-row">
        <div className="pv-sum-card">
          <div className="pv-sum-label mono">ESTIMATED TOTAL</div>
          <div className="pv-sum-value accent mono">৳{totalSelected.toLocaleString('en-BD')}</div>
          {totalMin !== totalMax && (
            <div className="pv-sum-range">৳{totalMin.toLocaleString()} – ৳{totalMax.toLocaleString()}</div>
          )}
        </div>
        <div className="pv-sum-card">
          <div className="pv-sum-label mono">COMPONENTS</div>
          <div className="pv-sum-value mono">{project.components.length}</div>
          <div className="pv-sum-range">{checkedCount} purchased</div>
        </div>
        <div className="pv-sum-card">
          <div className="pv-sum-label mono">PRICE COVERAGE</div>
          <div className="pv-sum-value mono" style={{ color: completeness === 100 ? 'var(--accent3)' : completeness > 50 ? 'var(--accent)' : 'var(--danger)' }}>
            {completeness}%
          </div>
          <div className="pv-sum-range">components with prices</div>
        </div>
        <div className="pv-sum-card pv-store-picker">
          <div className="pv-sum-label mono">EVALUATE BY STORE</div>
          <div className="pv-store-sel-wrap">
            <Store size={14} className="pv-store-icon" />
            <select
              value={globalStore}
              onChange={e => setGlobalStore(e.target.value)}
              className="pv-store-select"
            >
              <option value="">Best price (auto)</option>
              {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              {allStores.filter(s => !STORES.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {globalStore && (
            <div className="pv-sum-range" style={{ color: 'var(--accent3)' }}>
              Total from {globalStore}: ৳{totalSelected.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Controls row */}
      <div className="pv-controls">
        <div className="pv-filter-tabs">
          <button className={`pv-tab ${!filterCat ? 'active' : ''}`} onClick={() => setFilterCat('')}>All</button>
          {categories.map(cat => (
            <button key={cat} className={`pv-tab ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>
              {cat}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add Component
        </button>
      </div>

      {/* Add component form */}
      {adding && (
        <div className="pv-add-form fade-in">
          <div className="pv-add-row">
            <input
              autoFocus
              placeholder="Component name (e.g. ESP32 DevKit)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComponent()}
              className="pv-add-name"
            />
            <input
              type="number"
              min={1}
              placeholder="Qty"
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              className="pv-add-qty"
            />
            <input
              placeholder="Category (e.g. MCU, Sensor)"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="pv-add-cat"
            />
          </div>
          <div className="pv-add-actions">
            <button className="btn-primary" onClick={addComponent}>Add</button>
            <button className="btn-ghost" onClick={() => { setAdding(false); setNewName(''); setNewQty(1); setNewCat(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Components list */}
      {project.components.length === 0 ? (
        <div className="pv-empty">
          <ShoppingCart size={40} />
          <p>No components yet. Add your first component!</p>
        </div>
      ) : filteredComponents.length === 0 ? (
        <div className="pv-empty">
          <AlertCircle size={32} />
          <p>No components in this category.</p>
        </div>
      ) : (
        <div className="pv-comp-list">
          <div className="pv-comp-header">
            <span>Component</span>
            <span className="pv-hd-prices">Prices by Store</span>
            <span className="pv-hd-total">Line Total</span>
            <span className="pv-hd-actions"></span>
          </div>
          {filteredComponents.map((comp, i) => (
            <ComponentRow
              key={comp.id}
              comp={comp}
              globalStore={globalStore}
              stores={STORES}
              index={i}
              onUpdate={(changes) => updateComponent(comp.id, changes)}
              onDelete={() => deleteComponent(comp.id)}
            />
          ))}
        </div>
      )}

      {/* Purchase progress */}
      {project.components.length > 0 && (
        <div className="pv-progress-bar-wrap">
          <div className="pv-progress-label">
            <Check size={13} /> Purchase Progress: {checkedCount}/{project.components.length}
          </div>
          <div className="pv-progress-track">
            <div
              className="pv-progress-fill"
              style={{ width: `${project.components.length > 0 ? (checkedCount / project.components.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExport && (
        <ExportCard
          project={project}
          globalStore={globalStore}
          totalSelected={totalSelected}
          stores={STORES}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
