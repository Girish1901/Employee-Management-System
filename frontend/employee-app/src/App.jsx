import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8080/api/employees";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  position: "",
  salary: "",
};

// ── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// ── Icons (inline SVG) ───────────────────────────────────────────────────────
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconUser = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

// ── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <button onClick={onClose} style={styles.closeBtn}><IconX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Employee Form ────────────────────────────────────────────────────────────
function EmployeeForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) return;
    onSubmit({ ...form, salary: form.salary ? parseFloat(form.salary) : null });
  };

  const fields = [
    { key: "firstName", label: "First Name", placeholder: "Jane", half: true },
    { key: "lastName", label: "Last Name", placeholder: "Smith", half: true },
    { key: "email", label: "Email", placeholder: "jane@company.com", type: "email" },
    { key: "department", label: "Department", placeholder: "Engineering", half: true },
    { key: "position", label: "Position", placeholder: "Senior Dev", half: true },
    { key: "salary", label: "Salary (USD)", placeholder: "85000", type: "number" },
  ];

  return (
    <div style={styles.formBody}>
      <div style={styles.formGrid}>
        {fields.map(f => (
          <div key={f.key} style={{ gridColumn: f.half ? "span 1" : "span 2" }}>
            <label style={styles.label}>{f.label}</label>
            <input
              type={f.type || "text"}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => set(f.key, e.target.value)}
              style={styles.input}
            />
          </div>
        ))}
      </div>
      <div style={styles.formActions}>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
          {loading ? "Saving…" : initial ? "Update Employee" : "Add Employee"}
        </button>
      </div>
    </div>
  );
}

// ── Employee Card ────────────────────────────────────────────────────────────
function EmployeeCard({ emp, onEdit, onDelete }) {
  const initials = (emp.firstName?.[0] || "") + (emp.lastName?.[0] || "");
  const hue = ((emp.id || 1) * 67) % 360;

  return (
    <div style={styles.card}>
      <div style={{ ...styles.avatar, background: `hsl(${hue},60%,55%)` }}>
        {initials || <IconUser />}
      </div>
      <div style={styles.cardInfo}>
        <div style={styles.cardName}>{emp.firstName} {emp.lastName}</div>
        <div style={styles.cardSub}>{emp.position || "—"} · {emp.department || "—"}</div>
        <div style={styles.cardEmail}>{emp.email}</div>
        {emp.salary && (
          <div style={styles.cardSalary}>${emp.salary.toLocaleString()}</div>
        )}
      </div>
      <div style={styles.cardActions}>
        <button onClick={() => onEdit(emp)} style={styles.editBtn} title="Edit">
          <IconEdit />
        </button>
        <button onClick={() => onDelete(emp.id)} style={styles.deleteBtn} title="Delete">
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function EmployeeApp() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(API_BASE);
      setEmployees(data);
    } catch {
      setError("Failed to load employees. Is the Spring Boot server running on port 8080?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      const created = await apiFetch(API_BASE, { method: "POST", body: JSON.stringify(form) });
      setEmployees(prev => [...prev, created]);
      setModal(null);
    } catch {
      setError("Failed to create employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const updated = await apiFetch(`${API_BASE}/${editing.id}`, {
        method: "PUT", body: JSON.stringify(form),
      });
      setEmployees(prev => prev.map(e => e.id === editing.id ? updated : e));
      setModal(null);
      setEditing(null);
    } catch {
      setError("Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setEmployees(prev => prev.filter(e => e.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError("Failed to delete employee.");
    }
  };

  const openEdit = (emp) => { setEditing(emp); setModal("edit"); };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return !q || `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.position}`.toLowerCase().includes(q);
  });

  return (
    <div style={styles.root}>
      {/* Background decoration */}
      <div style={styles.bgDeco1} />
      <div style={styles.bgDeco2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <div style={styles.headerLabel}>SYSTEM</div>
            <h1 style={styles.heading}>Employee Management</h1>
          </div>
          <button onClick={() => setModal("add")} style={styles.addBtn}>
            <IconPlus /> Add Employee
          </button>
        </header>

        {/* Stats bar */}
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statNum}>{employees.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNum}>
              {[...new Set(employees.map(e => e.department).filter(Boolean))].length}
            </span>
            <span style={styles.statLabel}>Departments</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNum}>
              {employees.length
                ? "$" + Math.round(employees.reduce((s, e) => s + (e.salary || 0), 0) / employees.length).toLocaleString()
                : "—"}
            </span>
            <span style={styles.statLabel}>Avg Salary</span>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <input
            style={styles.search}
            placeholder="Search by name, email, department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={styles.clearSearch}>
              <IconX />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBanner}>
            ⚠ {error}
            <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={styles.loading}>Loading employees…</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            {search ? "No employees match your search." : "No employees yet. Add one!"}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(emp => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                onEdit={openEdit}
                onDelete={id => setDeleteConfirm(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modal === "add" && (
        <Modal title="New Employee" onClose={() => setModal(null)}>
          <EmployeeForm onSubmit={handleAdd} onClose={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === "edit" && editing && (
        <Modal title="Edit Employee" onClose={() => { setModal(null); setEditing(null); }}>
          <EmployeeForm
            initial={editing}
            onSubmit={handleUpdate}
            onClose={() => { setModal(null); setEditing(null); }}
            loading={saving}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
          <div style={{ padding: "24px 28px" }}>
            <p style={{ color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to remove this employee? This action cannot be undone.
            </p>
            <div style={styles.formActions}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ ...styles.submitBtn, background: "#ef4444" }}>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgDeco1: {
    position: "fixed", top: -200, right: -200, width: 600, height: 600,
    borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgDeco2: {
    position: "fixed", bottom: -150, left: -150, width: 500, height: 500,
    borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: 1100, margin: "0 auto", padding: "48px 24px",
    position: "relative", zIndex: 1,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 36,
  },
  headerLabel: {
    fontSize: 11, letterSpacing: 4, color: "#6366f1", fontWeight: 600,
    marginBottom: 6, textTransform: "uppercase",
  },
  heading: {
    fontSize: 36, fontWeight: 700, color: "#f1f5f9",
    margin: 0, letterSpacing: -0.5,
  },
  addBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "12px 22px", fontSize: 14, fontWeight: 600,
    cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  statsBar: {
    display: "flex", alignItems: "center", gap: 0,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "18px 28px", marginBottom: 28,
  },
  stat: { display: "flex", flexDirection: "column", gap: 3, flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: 700, color: "#f1f5f9" },
  statLabel: { fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase" },
  statDivider: { width: 1, height: 40, background: "rgba(255,255,255,0.08)", margin: "0 8px" },
  searchWrap: { position: "relative", marginBottom: 28 },
  search: {
    width: "100%", padding: "14px 48px 14px 18px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  },
  clearSearch: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "transparent", border: "none", color: "#64748b", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  errorBanner: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10, padding: "12px 16px", color: "#fca5a5",
    fontSize: 13, marginBottom: 20,
  },
  errorClose: {
    background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 18,
  },
  loading: { textAlign: "center", color: "#64748b", padding: 64, fontSize: 15 },
  empty: { textAlign: "center", color: "#475569", padding: 80, fontSize: 15 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
  },
  card: {
    display: "flex", alignItems: "center", gap: 16,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "20px 20px",
    transition: "border-color 0.2s, transform 0.15s",
  },
  avatar: {
    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 18, color: "#fff",
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontWeight: 600, color: "#f1f5f9", fontSize: 15, marginBottom: 2 },
  cardSub: { fontSize: 12, color: "#64748b", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardEmail: { fontSize: 12, color: "#6366f1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardSalary: { fontSize: 12, color: "#14b8a6", fontWeight: 600, marginTop: 4 },
  cardActions: { display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 },
  editBtn: {
    background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
    color: "#818cf8", borderRadius: 8, padding: "6px 8px",
    cursor: "pointer", display: "flex", alignItems: "center",
  },
  deleteBtn: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171", borderRadius: 8, padding: "6px 8px",
    cursor: "pointer", display: "flex", alignItems: "center",
  },
  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#111827", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20, width: "100%", maxWidth: 540,
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)", margin: 16,
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 28px 0",
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#f1f5f9" },
  closeBtn: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8", borderRadius: 8, padding: 6,
    cursor: "pointer", display: "flex", alignItems: "center",
  },
  formBody: { padding: "20px 28px 24px" },
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20,
  },
  label: { display: "block", fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  input: {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  },
  formActions: { display: "flex", gap: 10, justifyContent: "flex-end" },
  cancelBtn: {
    padding: "10px 20px", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#94a3b8", fontSize: 14, cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none", borderRadius: 10, color: "#fff",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
};