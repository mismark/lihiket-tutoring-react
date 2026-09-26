import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiLoader,
  FiAlertCircle, FiRefreshCw, FiToggleLeft, FiToggleRight,
  FiBook, FiDollarSign, FiTag, FiList, FiSearch,
} from 'react-icons/fi';
import {
  getAllSubjectsAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../../api/hometutorsubject.api';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const CATEGORIES   = ['General','STEM','Sciences','Mathematics','Languages','Arts','Social Studies','Physical Education','Other'];

const EMPTY_FORM = {
  name: '', gradeLevel: '', pricePerHour: '', currency: 'ETB',
  description: '', outcomes: '', category: 'General',
  maxStudentsPerDay: 5, isActive: true, imageUrl: '',
};

// ── Subject form (create / edit) ──────────────────────────────────────────────
function SubjectForm({ initial, dark, onClose, onSaved }) {
  const [form,   setForm]   = useState(initial ? {
    ...initial,
    outcomes: Array.isArray(initial.outcomes) ? initial.outcomes.join('\n') : '',
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const bdCard  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inputStyle = { background: inputBg, border: `1px solid ${inputBd}`, color: txt };
  const inputCls   = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40';
  const labelCls   = 'block text-xs font-semibold mb-1.5';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())    return toast.error('Subject name is required.');
    if (!form.gradeLevel)     return toast.error('Grade level is required.');
    if (form.pricePerHour === '' || form.pricePerHour === undefined)
      return toast.error('Price per hour is required.');

    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerHour:      Number(form.pricePerHour),
        maxStudentsPerDay: Number(form.maxStudentsPerDay),
        outcomes: form.outcomes
          ? form.outcomes.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        imageUrl: form.imageUrl?.trim() || null,
      };
      if (initial) {
        await updateSubject(initial._id, payload);
        toast.success('Subject updated!');
      } else {
        await createSubject(payload);
        toast.success('Subject created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(2,8,23,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl rounded-3xl shadow-2xl my-6"
        style={{ background: dark ? '#0f172a' : '#ffffff', border: `1px solid ${bdCard}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${bdCard}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <FiBook style={{ color: '#10b981', width: 16, height: 16 }} />
            </div>
            <h2 className="font-black text-lg" style={{ color: txt }}>
              {initial ? 'Edit Subject' : 'New Home Tutoring Subject'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10">
            <FiX className="w-5 h-5" style={{ color: '#ef4444' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name + Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Subject Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. English, Physics" className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Grade Level *</label>
              <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}
                className={inputCls} style={{ ...inputStyle, appearance: 'none' }} required>
                <option value="">Select grade</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Currency + Category */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Price / Hour *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: txtSub }}>ETB</span>
                <input type="number" min="0" value={form.pricePerHour}
                  onChange={e => set('pricePerHour', e.target.value)}
                  placeholder="250" className={inputCls} style={{ ...inputStyle, paddingLeft: '2.8rem' }} required />
              </div>
            </div>
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Max Students/Day</label>
              <input type="number" min="1" max="50" value={form.maxStudentsPerDay}
                onChange={e => set('maxStudentsPerDay', e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className={inputCls} style={{ ...inputStyle, appearance: 'none' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls} style={{ color: txtSub }}>Description</label>
            <textarea rows={3} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What this subject covers, learning goals, ideal student…"
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>

          {/* Outcomes */}
          <div>
            <label className={labelCls} style={{ color: txtSub }}>
              Learning Outcomes <span className="font-normal opacity-60">(one per line)</span>
            </label>
            <textarea rows={3} value={form.outcomes}
              onChange={e => set('outcomes', e.target.value)}
              placeholder={"Understand algebra basics\nSolve quadratic equations\nPrepare for national exams"}
              className={`${inputCls} resize-none font-mono text-xs`} style={inputStyle} />
          </div>

          {/* Image URL + Active toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Cover Image URL (optional)</label>
              <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                placeholder="https://images.unsplash.com/…" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: txtSub }}>Status</label>
              <button type="button" onClick={() => set('isActive', !form.isActive)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={form.isActive
                  ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981' }
                  : { background: inputBg, border: `1px solid ${inputBd}`, color: txtSub }}>
                <span>{form.isActive ? 'Active (visible to students)' : 'Inactive (hidden)'}</span>
                {form.isActive
                  ? <FiToggleRight className="w-5 h-5" />
                  : <FiToggleLeft  className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
              style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txtSub }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
              {saving
                ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving…</>
                : <><FiSave className="w-4 h-4" /> {initial ? 'Save Changes' : 'Create Subject'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminSubjects() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const txtMute = dark ? '#64748b' : '#94a3b8';
  const bg      = dark ? '#020817' : '#f8fafc';
  const bgCard  = dark ? 'rgba(15,23,42,0.7)' : '#ffffff';
  const bdCard  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSubjectsAdmin({
        ...(filterGrade ? { gradeLevel: filterGrade } : {}),
        ...(search      ? { search }                  : {}),
      });
      setSubjects(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [filterGrade, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete subject "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteSubject(id);
      toast.success('Subject deleted.');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: txt }}>Home Tutoring Subjects</h1>
            <p className="text-sm mt-0.5" style={{ color: txtSub }}>
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
              <FiPlus className="w-4 h-4" /> New Subject
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects…"
              className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txt, width: 200 }} />
          </div>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txt }}>
            <option value="">All Grades</option>
            {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color: '#10b981' }} />
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <FiAlertCircle className="w-12 h-12 opacity-20" style={{ color: txtMute }} />
            <p className="font-semibold text-lg" style={{ color: txtSub }}>No subjects yet</p>
            <p className="text-sm" style={{ color: txtMute }}>Click "New Subject" to add the first one.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-2 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
              <FiPlus className="w-4 h-4" /> Add First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(s => (
              <div key={s._id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: bgCard, border: `1px solid ${bdCard}` }}>

                {/* Cover image */}
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name}
                    className="w-full h-36 object-cover"
                    style={{ filter: s.isActive ? 'none' : 'grayscale(60%) opacity(0.7)' }} />
                ) : (
                  <div className="w-full h-36 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(59,130,246,0.08))' }}>
                    <FiBook className="w-12 h-12 opacity-20" style={{ color: '#10b981' }} />
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                      {s.gradeLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
                      style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: txtMute }}>
                      {s.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold ml-auto"
                      style={s.isActive
                        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                        : { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-black text-base mb-1" style={{ color: txt }}>{s.name}</h3>

                  {s.description && (
                    <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: txtSub }}>
                      {s.description}
                    </p>
                  )}

                  {s.outcomes?.length > 0 && (
                    <ul className="mb-3 space-y-0.5">
                      {s.outcomes.slice(0, 3).map((o, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: txtSub }}>
                          <span className="text-emerald-500 mt-0.5">✓</span> {o}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between"
                    style={{ borderTop: `1px solid ${bdCard}` }}>
                    <span className="font-black text-lg" style={{ color: '#10b981' }}>
                      ETB {s.pricePerHour}<span className="text-xs font-medium ml-0.5" style={{ color: txtMute }}>/hr</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditTarget(s); setShowForm(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-500/10"
                        title="Edit">
                        <FiEdit2 className="w-4 h-4" style={{ color: '#3b82f6' }} />
                      </button>
                      <button onClick={() => handleDelete(s._id, s.name)}
                        disabled={deleting === s._id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 disabled:opacity-50"
                        title="Delete">
                        {deleting === s._id
                          ? <FiLoader className="w-4 h-4 animate-spin" style={{ color: '#ef4444' }} />
                          : <FiTrash2 className="w-4 h-4" style={{ color: '#ef4444' }} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <SubjectForm
          initial={editTarget}
          dark={dark}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); load(); }}
        />
      )}
    </div>
  );
}
