"use client";
import { useMemo, useState } from "react";

const CANADA_PROVINCES = [
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"
];

export default function HomeContent({ name }) {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [draft, setDraft] = useState({ address: "", city: "", province: "", postal: "" });
  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [activeTab, setActiveTab] = useState("properties");
  const isValid = useMemo(() => {
    return (
      draft.address.trim() &&
      draft.city.trim() &&
      CANADA_PROVINCES.includes((draft.province || "").toUpperCase()) &&
      /^(?:[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d)$/.test(draft.postal.trim())
    );
  }, [draft]);

  function openAdd() {
    setEditingId("");
    setDraft({ address: "", city: "", province: "", postal: "" });
    setOpen(true);
  }

  function openEdit() {
    if (!selectedId) return;
    const row = properties.find(p => p.id === selectedId);
    if (!row) return;
    setEditingId(row.id);
    setDraft({ address: row.address, city: row.city, province: row.province, postal: row.postal });
    setOpen(true);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setProperties(properties.filter(p => p.id !== selectedId));
    setSelectedId("");
  }

  function saveDraft() {
    if (!isValid) return;
    const normalized = {
      address: draft.address.trim(),
      city: draft.city.trim(),
      province: draft.province.toUpperCase(),
      postal: draft.postal.toUpperCase().replace(/\s+/g, ""),
    };

    if (editingId) {
      setProperties(properties.map(p => (p.id === editingId ? { ...p, ...normalized } : p)));
      setEditingId("");
    } else {
      const row = { id: crypto.randomUUID(), ...normalized };
      setProperties([row, ...properties]);
      setSelectedId(row.id);
    }
    setDraft({ address: "", city: "", province: "", postal: "" });
    setOpen(false);
  }

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "24px auto", padding: "0 16px" }}>
      <div className="toolbar">
        <div className="toolbar-spacer" />
        <div className="toolbar-actions">
          <button className="icon-button" aria-label="Add property" title="Add property" onClick={openAdd}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
          </button>
          <button className="icon-button" aria-label="Edit property" title="Edit property" disabled={!selectedId} onClick={openEdit}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-11.04c.39-.39.39-1.02 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66Z"/></svg>
          </button>
          <button className="icon-button danger" aria-label="Delete property" title="Delete property" disabled={!selectedId} onClick={deleteSelected}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 7h12v2H6V7Zm2 3h8l-1 9H9L8 10Zm3-6h2l1 1h4v2H6V5h4l1-1Z"/></svg>
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h1 className="title" style={{ marginBottom: 6, textAlign: "left" }}>Welcome {name || "Home"}!</h1>

        <div className="tabs">
          <button className={`tab${activeTab === "properties" ? " active" : ""}`} onClick={()=>setActiveTab("properties")}>Properties</button>
          <button className={`tab${activeTab === "tenants" ? " active" : ""}`} onClick={()=>setActiveTab("tenants")}>Tenants</button>
          <button className={`tab${activeTab === "rent" ? " active" : ""}`} onClick={()=>setActiveTab("rent")}>Rent</button>
          <button className={`tab${activeTab === "maintenance" ? " active" : ""}`} onClick={()=>setActiveTab("maintenance")}>Maintenance</button>
        </div>

        {activeTab === "properties" && (
          <div className="grid" role="table" aria-label="Properties">
            <div className="grid-row grid-header" role="row">
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Address</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>City</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Province</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Postal Code</div>
            </div>
            {properties.length === 0 ? (
              <div className="grid-row" role="row">
                <div className="grid-cell" role="cell" colSpan={4} style={{ gridColumn: "1 / span 4", textAlign: "center", color: "#5f6368" }}>No properties yet. Click + to add one.</div>
              </div>
            ) : properties.map(p => (
              <div
                className={`grid-row${p.id === selectedId ? " selected" : ""}`}
                role="row"
                key={p.id}
                onClick={()=>setSelectedId(p.id)}
                aria-selected={p.id === selectedId}
                style={{ cursor: "pointer" }}
              >
                <div className="grid-cell" role="cell" style={{ textAlign: "center" }}p.address}</div>
                <div className="grid-cell" role="cell" style={{ textAlign: "center" }}p.city}</div>
                <div className="grid-cell" role="cell" style={{ textAlign: "center" }}p.province}</div>
                <div className="grid-cell" role="cell" style={{ textAlign: "center" }}p.postal}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tenants" && (
          <div className="grid" role="table" aria-label="Tenants">
            <div className="grid-row grid-header" role="row">
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Name</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Unit</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Phone</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Email</div>
            </div>
            <div className="grid-row" role="row"><div className="grid-cell" role="cell" style={{ gridColumn: "1 / span 4", color: "#5f6368", textAlign: "center" }}>No tenants yet.</div></div>
          </div>
        )}

        {activeTab === "rent" && (
          <div className="grid" role="table" aria-label="Rent">
            <div className="grid-row grid-header" role="row">
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Property</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Month</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Amount</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Status</div>
            </div>
            <div className="grid-row" role="row"><div className="grid-cell" role="cell" style={{ gridColumn: "1 / span 4", color: "#5f6368", textAlign: "center" }}>No rent records.</div></div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="grid" role="table" aria-label="Maintenance">
            <div className="grid-row grid-header" role="row">
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Property</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Issue</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Priority</div>
              <div className="grid-cell" role="columnheader" style={{ textAlign: "center" }}>Status</div>
            </div>
            <div className="grid-row" role="row"><div className="grid-cell" role="cell" style={{ gridColumn: "1 / span 4", color: "#5f6368", textAlign: "center" }}>No tickets.</div></div>
          </div>
        )}
      </div>

      {open && (
        <div className="dialog-backdrop" onClick={()=>setOpen(false)}>
          <div className="dialog" onClick={(e)=>e.stopPropagation()}>
            <h2 className="title" style={{ marginTop: 0 }}>Add Property</h2>
            <div className="inputs">
              <input className="input" placeholder="Street address" value={draft.address} onChange={(e)=>setDraft({...draft, address: e.target.value})} />
              <input className="input" placeholder="City" value={draft.city} onChange={(e)=>setDraft({...draft, city: e.target.value})} />
              <select className="input" value={draft.province} onChange={(e)=>setDraft({...draft, province: e.target.value})}>
                <option value="">Province</option>
                {CANADA_PROVINCES.map(p => <option key={p} value={p}p}</option>)}
              </select>
              <input className="input" placeholder="Postal code (A1A 1A1)" value={draft.postal} onChange={(e)=>setDraft({...draft, postal: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
              <button className="icon-text" onClick={()=>setOpen(false)}>Cancel</button>
              <button className="primary" disabled={!isValid} onClick={saveDraft}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


