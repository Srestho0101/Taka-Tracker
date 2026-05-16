import React, { useState } from 'react';
import { Trash2, Plus, X, ChevronDown, ChevronUp, Check, Edit2, Tag } from 'lucide-react';
import './ComponentRow.css';

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function ComponentRow({ comp, globalStore, stores, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(comp.name);
  const [addingPrice, setAddingPrice] = useState(false);
  const [priceStore, setPriceStore] = useState('');
  const [priceVal, setPriceVal] = useState('');
  const [priceCustomStore, setPriceCustomStore] = useState('');
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPriceDraft, setEditPriceDraft] = useState('');

  const effectiveStore = globalStore || comp.selectedStore;
  const effectivePrice = comp.prices?.length > 0
    ? (() => {
        const match = comp.prices.find(p => p.store === effectiveStore);
        if (match) return match.price;
        return Math.min(...comp.prices.map(p => p.price));
      })()
    : 0;
  const lineTotal = effectivePrice * (comp.quantity || 1);

  const selectedStoreName = effectiveStore || (comp.prices?.length > 0 ? 'best' : '—');

  function saveName() {
    if (nameDraft.trim()) onUpdate({ name: nameDraft.trim() });
    setEditingName(false);
  }

  function addPrice() {
    const storeName = priceStore === 'Custom' ? priceCustomStore.trim() : priceStore;
    if (!storeName || !priceVal) return;
    const price = parseFloat(priceVal);
    if (isNaN(price) || price < 0) return;
    const existing = comp.prices?.find(p => p.store === storeName);
    if (existing) {
      onUpdate({ prices: comp.prices.map(p => p.store === storeName ? { ...p, price } : p) });
    } else {
      const newEntry = { id: genId(), store: storeName, price };
      onUpdate({ prices: [...(comp.prices || []), newEntry] });
    }
    setPriceVal(''); setPriceStore(''); setPriceCustomStore(''); setAddingPrice(false);
  }

  function removePrice(priceId) {
    const newPrices = comp.prices.filter(p => p.id !== priceId);
    onUpdate({
      prices: newPrices,
      selectedStore: newPrices.find(p => p.store === comp.selectedStore) ? comp.selectedStore : ''
    });
  }

  function saveEditPrice(priceId) {
    const val = parseFloat(editPriceDraft);
    if (isNaN(val) || val < 0) return;
    onUpdate({ prices: comp.prices.map(p => p.id === priceId ? { ...p, price: val } : p) });
    setEditingPriceId(null);
  }

  function selectStore(storeName) {
    onUpdate({ selectedStore: comp.selectedStore === storeName ? '' : storeName });
  }

  const minPrice = comp.prices?.length > 0 ? Math.min(...comp.prices.map(p => p.price)) : null;

  return (
    <div className={`cr-root slide-in ${comp.checked ? 'cr-checked' : ''}`} style={{ animationDelay: `${index * 0.03}s` }}>
      <div className="cr-main" onClick={() => setExpanded(e => !e)}>
        {/* Checkbox */}
        <button
          className={`cr-check-btn ${comp.checked ? 'cr-check-active' : ''}`}
          onClick={e => { e.stopPropagation(); onUpdate({ checked: !comp.checked }); }}
          title="Mark as purchased"
        >
          {comp.checked && <Check size={11} />}
        </button>

        {/* Name + meta */}
        <div className="cr-info">
          {editingName ? (
            <input
              autoFocus
              className="cr-name-input"
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameDraft(comp.name); } }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="cr-name-row">
              <span className="cr-name">{comp.name}</span>
              <button className="cr-edit-name" onClick={e => { e.stopPropagation(); setEditingName(true); }} title="Edit name">
                <Edit2 size={11} />
              </button>
            </div>
          )}
          <div className="cr-meta-row">
            <span className="cr-qty mono">×{comp.quantity || 1}</span>
            {comp.category && <span className="cr-cat"><Tag size={10} /> {comp.category}</span>}
            {comp.prices?.length > 0 && (
              <span className="cr-store-badge">{selectedStoreName}</span>
            )}
          </div>
        </div>

        {/* Prices summary */}
        <div className="cr-prices-summary">
          {comp.prices?.length === 0 ? (
            <span className="cr-no-price">No prices yet</span>
          ) : (
            <div className="cr-price-pills">
              {comp.prices.slice(0, 3).map(p => (
                <span
                  key={p.id}
                  className={`cr-price-pill ${(effectiveStore === p.store || (!effectiveStore && p.price === minPrice)) ? 'cr-price-pill-active' : ''}`}
                  onClick={e => { e.stopPropagation(); selectStore(p.store); }}
                  title={`${p.store}: ৳${p.price.toLocaleString()}`}
                >
                  <span className="cr-pill-store">{p.store.replace('BD','').replace('Computers','').replace('Tech','T')}</span>
                  <span className="cr-pill-price mono">৳{p.price.toLocaleString()}</span>
                </span>
              ))}
              {comp.prices.length > 3 && <span className="cr-price-more">+{comp.prices.length - 3}</span>}
            </div>
          )}
        </div>

        {/* Line total */}
        <div className="cr-total">
          {lineTotal > 0 ? (
            <span className="cr-total-val mono">৳{lineTotal.toLocaleString('en-BD')}</span>
          ) : (
            <span className="cr-total-empty">—</span>
          )}
        </div>

        {/* Expand toggle */}
        <button className="cr-expand-btn" onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="cr-detail fade-in">
          <div className="cr-detail-section">
            <div className="cr-detail-head">
              <span className="cr-detail-title mono">STORE PRICES</span>
              <button className="cr-add-price-btn" onClick={() => setAddingPrice(a => !a)}>
                <Plus size={13} /> Add Price
              </button>
            </div>

            {addingPrice && (
              <div className="cr-add-price-form fade-in">
                <select
                  value={priceStore}
                  onChange={e => setPriceStore(e.target.value)}
                  className="cr-form-sel"
                >
                  <option value="">Select store...</option>
                  {stores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {priceStore === 'Custom' && (
                  <input
                    placeholder="Store name"
                    value={priceCustomStore}
                    onChange={e => setPriceCustomStore(e.target.value)}
                    className="cr-form-inp"
                  />
                )}
                <input
                  type="number"
                  placeholder="Price (৳)"
                  value={priceVal}
                  onChange={e => setPriceVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addPrice()}
                  className="cr-form-inp cr-price-inp"
                  min={0}
                />
                <div className="cr-form-actions">
                  <button className="btn-primary btn-sm" onClick={addPrice}>Save</button>
                  <button className="btn-ghost btn-sm" onClick={() => { setAddingPrice(false); setPriceStore(''); setPriceVal(''); setPriceCustomStore(''); }}>Cancel</button>
                </div>
              </div>
            )}

            <div className="cr-price-rows">
              {(!comp.prices || comp.prices.length === 0) && !addingPrice && (
                <div className="cr-no-prices-msg">No prices added. Click "Add Price" to compare stores.</div>
              )}
              {comp.prices?.map(p => {
                const isSelected = comp.selectedStore === p.store;
                const isGlobal = globalStore === p.store;
                const isCheapest = p.price === minPrice;
                return (
                  <div key={p.id} className={`cr-price-row ${isSelected || isGlobal ? 'cr-price-row-selected' : ''}`}>
                    <button
                      className={`cr-select-store-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => selectStore(p.store)}
                      title="Select as default store for this component"
                    >
                      {isSelected ? <Check size={11} /> : <div className="cr-sel-circle" />}
                    </button>
                    <span className="cr-price-store-name">{p.store}</span>
                    {isCheapest && <span className="cr-cheapest-badge">CHEAPEST</span>}
                    {editingPriceId === p.id ? (
                      <div className="cr-edit-price-wrap">
                        <span className="cr-taka">৳</span>
                        <input
                          autoFocus
                          type="number"
                          value={editPriceDraft}
                          onChange={e => setEditPriceDraft(e.target.value)}
                          onBlur={() => saveEditPrice(p.id)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEditPrice(p.id); if (e.key === 'Escape') setEditingPriceId(null); }}
                          className="cr-edit-price-input mono"
                        />
                      </div>
                    ) : (
                      <button
                        className="cr-price-val-btn mono"
                        onClick={() => { setEditingPriceId(p.id); setEditPriceDraft(String(p.price)); }}
                        title="Click to edit price"
                      >
                        ৳{p.price.toLocaleString('en-BD')}
                        <Edit2 size={10} className="cr-edit-icon" />
                      </button>
                    )}
                    <span className="cr-price-unit-total mono">
                      ×{comp.quantity || 1} = ৳{(p.price * (comp.quantity || 1)).toLocaleString('en-BD')}
                    </span>
                    <button className="cr-rm-price-btn" onClick={() => removePrice(p.id)} title="Remove price">
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra controls */}
          <div className="cr-detail-footer">
            <div className="cr-qty-control">
              <label className="cr-qty-label mono">QTY</label>
              <div className="cr-qty-btns">
                <button onClick={() => onUpdate({ quantity: Math.max(1, (comp.quantity || 1) - 1) })}>−</button>
                <span className="mono">{comp.quantity || 1}</span>
                <button onClick={() => onUpdate({ quantity: (comp.quantity || 1) + 1 })}>+</button>
              </div>
            </div>
            <div className="cr-notes-wrap">
              <input
                placeholder="Notes (optional)"
                value={comp.notes || ''}
                onChange={e => onUpdate({ notes: e.target.value })}
                className="cr-notes-input"
              />
            </div>
            <button className="cr-delete-btn" onClick={onDelete}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
