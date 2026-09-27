import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import {
  FiRefreshCw, FiTrash2, FiX, FiSave, FiLoader,
  FiAlertCircle, FiFilter, FiChevronLeft, FiChevronRight,
  FiMapPin, FiNavigation, FiPhone, FiMail, FiBook,
  FiClock, FiExternalLink, FiUser, FiCopy, FiEye,
  FiCalendar, FiMessageSquare, FiCheckCircle,
} from 'react-icons/fi';
import {
  getAllRegistrations,
  updateRegistration,
  deleteRegistration,
} from '../../api/hometutorregistration.api';

// ─── Constants ─────────────────────────────────────────────────────────────────
const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6',
                      'G7','G8','G9','G10','G11','G12','HL'];
const GRADE_LABEL  = {
  KG1:'Kindergarten 1', KG2:'Kindergarten 2',
  G1:'Grade 1',  G2:'Grade 2',  G3:'Grade 3',  G4:'Grade 4',
  G5:'Grade 5',  G6:'Grade 6',  G7:'Grade 7',  G8:'Grade 8',
  G9:'Grade 9',  G10:'Grade 10', G11:'Grade 11', G12:'Grade 12',
  HL:'Higher Level',
};

const STATUS_OPTIONS = ['pending','reviewed','confirmed','assigned','cancelled','completed'];
const STATUS_STYLE   = {
  pending:   { bg:'rgba(245,158,11,0.12)',  color:'#f59e0b',  label:'Pending'        },
  reviewed:  { bg:'rgba(59,130,246,0.12)',  color:'#3b82f6',  label:'Reviewed'       },
  confirmed: { bg:'rgba(16,185,129,0.12)',  color:'#10b981',  label:'Confirmed'      },
  assigned:  { bg:'rgba(139,92,246,0.12)',  color:'#8b5cf6',  label:'Tutor Assigned' },
  cancelled: { bg:'rgba(239,68,68,0.12)',   color:'#ef4444',  label:'Cancelled'      },
  completed: { bg:'rgba(100,116,139,0.12)', color:'#64748b',  label:'Completed'      },
};

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

function CopyBtn({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} title={`Copy ${label}`}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-500/10">
      {copied
        ? <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        : <FiCopy        className="w-3.5 h-3.5 text-blue-400" />}
    </button>
  );
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ reg, dark, onClose, onUpdated, onDeleted }) {
  const [status,     setStatus]     = useState(reg.status);
  const [adminNotes, setAdminNotes] = useState(reg.adminNotes || '');
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const txtMute= dark ? '#64748b' : '#9ca3af';
  const iBg    = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const iBd    = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const bd     = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const bg     = dark ? '#0f172a' : '#ffffff';

  const save = async () => {
    setSaving(true);
    try {
      await updateRegistration(reg._id, { status, adminNotes });
      toast.success('Status updated.');
      onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete registration for ${reg.fullName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteRegistration(reg._id);
      toast.success('Registration deleted.');
      onDeleted();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally { setDeleting(false); }
  };

  // ── Section card ────────────────────────────────────────────────────────────
  const Sec = ({ title, color, children }) => (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1px solid ${bd}` }}>
      <div className="px-4 py-2.5" style={{ background: `${color}0d`, borderBottom: `1px solid ${bd}` }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );

  // ── Row with copy / action buttons ──────────────────────────────────────────
  const Row = ({ icon: Icon, iconColor, label, value, href, copyValue }) => (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: iconColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: txtMute }}>{label}</p>
        {href
          ? <a href={href} className="text-sm font-semibold break-all hover:underline" style={{ color: '#60a5fa' }}>{value}</a>
          : <p className="text-sm font-semibold break-all" style={{ color: txt }}>{value || '—'}</p>}
      </div>
      {copyValue && <CopyBtn value={copyValue} label={label} />}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(2,8,23,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="h-full w-full max-w-lg overflow-y-auto flex flex-col"
        style={{ background: bg, borderLeft: `1px solid ${bd}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10 flex-shrink-0"
          style={{ background: bg, borderBottom: `1px solid ${bd}` }}>
          <div>
            <h3 className="font-black text-lg" style={{ color: txt }}>{reg.fullName}</h3>
            <p className="text-xs mt-0.5" style={{ color: txtMute }}>
              {GRADE_LABEL[reg.gradeLevel] ?? reg.gradeLevel} · Registered {new Date(reg.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10">
            <FiX className="w-5 h-5 text-red-400" />
          </button>
        </div>

        {/* Quick-action bar ─ Call · Mail · Copy phone · Copy email */}
        <div className="px-5 py-3 flex items-center gap-2 flex-wrap flex-shrink-0"
          style={{ borderBottom: `1px solid ${bd}`, background: dark ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>

          <a href={`tel:${reg.phone}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
            <FiPhone className="w-3.5 h-3.5" /> Call
          </a>

          <a href={`mailto:${reg.email}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
            <FiMail className="w-3.5 h-3.5" /> Email
          </a>

          {/* WhatsApp */}
          <a href={`https://wa.me/${reg.phone?.replace(/\D/g,'')}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
            <FiMessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </a>

          {/* Copy phone */}
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: iBg, border: `1px solid ${iBd}`, color: txtSub }}>
            <span className="font-mono">{reg.phone}</span>
            <CopyBtn value={reg.phone} label="Phone" />
          </div>

          {/* Copy email */}
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: iBg, border: `1px solid ${iBd}`, color: txtSub }}>
            <span className="font-mono truncate max-w-[120px]">{reg.email}</span>
            <CopyBtn value={reg.email} label="Email" />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ── Personal ── */}
          <Sec title="Personal Information" color="#3b82f6">
            <Row icon={FiUser}  iconColor="#3b82f6" label="Full Name" value={reg.fullName}  copyValue={reg.fullName} />
            <Row icon={FiUser}  iconColor="#3b82f6" label="Age"       value={reg.age ? `${reg.age} years` : '—'} />
            <Row icon={FiUser}  iconColor="#3b82f6" label="Sex"       value={reg.sex ? reg.sex.charAt(0).toUpperCase() + reg.sex.slice(1) : '—'} />
            <Row icon={FiPhone} iconColor="#10b981" label="Phone"     value={reg.phone}   href={`tel:${reg.phone}`}   copyValue={reg.phone} />
            <Row icon={FiMail}  iconColor="#3b82f6" label="Email"     value={reg.email}   href={`mailto:${reg.email}`} copyValue={reg.email} />
          </Sec>

          {/* ── Academic ── */}
          <Sec title="Academic Details" color="#10b981">
            <Row icon={FiBook} iconColor="#10b981" label="Grade Level"
              value={`${reg.gradeLevel} — ${GRADE_LABEL[reg.gradeLevel] ?? ''}`} />
            {reg.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {reg.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>{s}</span>
                ))}
              </div>
            )}
          </Sec>

          {/* ── Schedule ── */}
          <Sec title="Schedule Preferences" color="#8b5cf6">
            <Row icon={FiClock}    iconColor="#8b5cf6" label="Hours/Week"   value={`${reg.hoursPerWeek} hours`} />
            <Row icon={FiCalendar} iconColor="#8b5cf6" label="Start Date"   value={reg.startDate ? new Date(reg.startDate).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : 'Not specified'} />
            <Row icon={FiClock}    iconColor="#8b5cf6" label="Preferred Schedule" value={reg.preferredSchedule || 'Not specified'} />
          </Sec>

          {/* ── Location ── */}
          <Sec title="Location" color="#f59e0b">
            {[
              ['City',        reg.city],
              ['Sub-city',    reg.subcity],
              ['Street',      reg.street],
              ['House No.',   reg.address],
              ['Additional',  reg.additionalAddress],
            ].filter(([, v]) => v).map(([label, value]) => (
              <Row key={label} icon={FiMapPin} iconColor="#f59e0b"
                label={label} value={value} copyValue={value} />
            ))}

            {/* Full address one-liner to copy */}
            {(reg.city || reg.address) && (
              <div className="flex items-center gap-2 mt-1 pt-2" style={{ borderTop: `1px solid ${bd}` }}>
                <p className="text-xs flex-1 font-mono" style={{ color: txtMute }}>
                  {[reg.address, reg.street, reg.subcity, reg.city].filter(Boolean).join(', ')}
                </p>
                <CopyBtn value={[reg.address, reg.street, reg.subcity, reg.city].filter(Boolean).join(', ')} label="Address" />
              </div>
            )}

            {/* GPS */}
            {reg.location?.lat && (
              <div className="flex items-center gap-2 flex-wrap pt-2" style={{ borderTop: `1px solid ${bd}` }}>
                <FiNavigation className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                <code className="text-xs font-mono flex-1" style={{ color: txtSub }}>
                  {reg.location.lat.toFixed(6)}, {reg.location.lng.toFixed(6)}
                </code>
                <CopyBtn value={`${reg.location.lat.toFixed(6)}, ${reg.location.lng.toFixed(6)}`} label="GPS" />
              </div>
            )}
            {reg.mapLink && (
              <a href={reg.mapLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline mt-1"
                style={{ color: '#60a5fa' }}>
                <FiExternalLink className="w-3.5 h-3.5" /> Open in Google Maps ↗
              </a>
            )}
          </Sec>

          {/* ── Notes from student ── */}
          {reg.message && (
            <Sec title="Student's Message" color="#64748b">
              <p className="text-sm leading-relaxed" style={{ color: txtSub }}>{reg.message}</p>
            </Sec>
          )}

          {/* ── Status update ── */}
          <Sec title="Admin Actions" color="#a78bfa">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: txtSub }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: iBg, border: `1px solid ${iBd}`, color: txt }}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{STATUS_STYLE[s]?.label ?? s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: txtSub }}>
                  Admin Notes <span className="font-normal" style={{ color: txtMute }}>(internal only)</span>
                </label>
                <textarea rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Notes visible only to admins — assigned tutor name, call outcome, etc."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none
                             focus:ring-2 focus:ring-purple-500/40"
                  style={{ background: iBg, border: `1px solid ${iBd}`, color: txt }} />
              </div>

              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                             text-sm font-bold text-white disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
                  {saving
                    ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><FiSave className="w-4 h-4" /> Save Changes</>}
                </button>

                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                             text-sm font-bold disabled:opacity-60 transition-all hover:bg-red-500/10"
                  style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  {deleting
                    ? <FiLoader className="w-4 h-4 animate-spin" />
                    : <FiTrash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Sec>

        </div>{/* end scrollable */}
      </div>
    </div>
  );
}

// ─── Main admin page ────────────────────────────────────────────────────────────
export default function AdminHomeTutorRegistrations() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const txtMute= dark ? '#64748b' : '#9ca3af';
  const bg     = dark ? '#020817' : '#f8fafc';
  const cardBg = dark ? 'rgba(15,23,42,0.7)' : '#ffffff';
  const bd     = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const [regs,         setRegs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [pages,        setPages]        = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGrade,  setFilterGrade]  = useState('');
  const [searchTxt,    setSearchTxt]    = useState('');
  const [selected,     setSelected]     = useState(null);  // open in drawer

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRegistrations({
        page, limit: 15,
        ...(filterStatus ? { status:     filterStatus } : {}),
        ...(filterGrade  ? { gradeLevel: filterGrade  } : {}),
      });
      let data = res.data || [];
      // Client-side text search (name / phone / email) — quick UX
      if (searchTxt.trim()) {
        const q = searchTxt.toLowerCase();
        data = data.filter(r =>
          r.fullName?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q)    ||
          r.email?.toLowerCase().includes(q)
        );
      }
      setRegs(data);
      setTotal(res.total  || 0);
      setPages(res.pages  || 1);
    } catch (err) {
      toast.error(err.message || 'Failed to load registrations.');
    } finally { setLoading(false); }
  }, [page, filterStatus, filterGrade, searchTxt]);

  useEffect(() => { load(); }, [load]);

  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const iSty    = { background: inputBg, border: `1px solid ${inputBd}`, color: txt };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: txt }}>
              Home Tutoring Registrations
            </h1>
            <p className="text-sm mt-0.5" style={{ color: txtSub }}>
              {total} total · click any row to view details, call, or email
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981' }}>
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
            <input value={searchTxt} onChange={e => setSearchTxt(e.target.value)}
              placeholder="Search name, phone, email…"
              className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ ...iSty, width: 210 }} />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: cardBg, border: `1px solid ${bd}` }}>
            <FiFilter className="w-4 h-4" style={{ color: txtMute }} />
            <select value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm" style={{ color: txt }}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s =>
                <option key={s} value={s}>{STATUS_STYLE[s]?.label}</option>
              )}
            </select>
          </div>

          {/* Grade filter */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: cardBg, border: `1px solid ${bd}` }}>
            <FiBook className="w-4 h-4" style={{ color: txtMute }} />
            <select value={filterGrade}
              onChange={e => { setFilterGrade(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm" style={{ color: txt }}>
              <option value="">All Grades</option>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {(filterStatus || filterGrade || searchTxt) && (
            <button onClick={() => { setFilterStatus(''); setFilterGrade(''); setSearchTxt(''); }}
              className="text-xs font-semibold hover:underline text-red-400">
              Clear all
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${bd}` }}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <FiLoader className="w-6 h-6 animate-spin" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: txtSub }}>Loading registrations…</span>
            </div>

          ) : regs.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <FiAlertCircle className="w-10 h-10 opacity-20" style={{ color: txtMute }} />
              <p className="font-semibold" style={{ color: txtSub }}>No registrations found</p>
              <p className="text-sm" style={{ color: txtMute }}>
                {filterStatus || filterGrade || searchTxt
                  ? 'Try adjusting your filters.'
                  : 'Registrations will appear once students submit the form.'}
              </p>
            </div>

          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${bd}` }}>
                    {['Student','Age / Sex','Grade','Subjects','Location','Hrs/wk','Registered','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: txtMute }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r, i) => (
                    <tr key={r._id}
                      onClick={() => setSelected(r)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                        background: i % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)'),
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = (dark ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.04)')}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)')}>

                      {/* Student name + contact */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center
                                          text-white text-sm font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#3b82f6,#10b981)' }}>
                            {r.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold leading-tight truncate" style={{ color: txt }}>{r.fullName}</p>
                            {/* Inline contact buttons — stop row-click propagation */}
                            <div className="flex items-center gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
                              <a href={`tel:${r.phone}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                                style={{ color: '#10b981' }}>
                                <FiPhone className="w-3 h-3" /> {r.phone}
                              </a>
                              <CopyBtn value={r.phone} label="Phone" />
                            </div>
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <a href={`mailto:${r.email}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold hover:underline truncate max-w-[160px]"
                                style={{ color: '#60a5fa' }}>
                                <FiMail className="w-3 h-3" /> {r.email}
                              </a>
                              <CopyBtn value={r.email} label="Email" />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age / Sex */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: txtSub }}>
                        {r.age ? `${r.age}y` : '—'} {r.sex ? `· ${r.sex}` : ''}
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{ background:'rgba(59,130,246,0.12)', color:'#3b82f6' }}>
                          {r.gradeLevel}
                        </span>
                      </td>

                      {/* Subjects */}
                      <td className="px-4 py-3 text-xs max-w-[140px]" style={{ color: txtSub }}>
                        <span className="truncate block">
                          {r.subjects?.length ? r.subjects.slice(0,3).join(', ') + (r.subjects.length > 3 ? '…' : '') : '—'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="text-xs truncate" style={{ color: txtSub }}>
                          {[r.address, r.subcity, r.city].filter(Boolean).join(', ') || '—'}
                        </p>
                        {r.mapLink && (
                          <a href={r.mapLink} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                            style={{ color:'#60a5fa' }}>
                            <FiNavigation className="w-3 h-3" /> Map ↗
                          </a>
                        )}
                      </td>

                      {/* Hours */}
                      <td className="px-4 py-3 text-center font-semibold text-sm" style={{ color: txt }}>
                        {r.hoursPerWeek}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: txtMute }}>
                        {new Date(r.createdAt).toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3"><Badge status={r.status} /></td>

                      {/* View button */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelected(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                          style={{ background:'rgba(59,130,246,0.12)', color:'#60a5fa' }}>
                          <FiEye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background: cardBg, border: `1px solid ${bd}`, color: txt }}>
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold" style={{ color: txtSub }}>
              Page {page} of {pages}
            </span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background: cardBg, border: `1px solid ${bd}`, color: txt }}>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selected && (
        <DetailDrawer
          reg={selected}
          dark={dark}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); load(); }}
          onDeleted={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}
