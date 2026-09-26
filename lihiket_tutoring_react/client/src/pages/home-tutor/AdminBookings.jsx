import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import {
  FiHome, FiRefreshCw, FiEdit2, FiTrash2, FiX, FiSave,
  FiLoader, FiAlertCircle, FiFilter, FiChevronLeft,
  FiChevronRight, FiMapPin, FiNavigation, FiExternalLink,
  FiPhone, FiMail, FiBook, FiClock,
} from 'react-icons/fi';
import {
  getAllBookings,
  updateBooking,
  deleteBooking,
} from '../../api/hometutorsubject.api';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const STATUS_OPTIONS = ['pending','reviewed','confirmed','assigned','cancelled','completed'];

const STATUS_STYLES = {
  pending:   { bg:'rgba(245,158,11,0.12)',  color:'#f59e0b',  label:'Pending'        },
  reviewed:  { bg:'rgba(59,130,246,0.12)',  color:'#3b82f6',  label:'Reviewed'       },
  confirmed: { bg:'rgba(16,185,129,0.12)',  color:'#10b981',  label:'Confirmed'      },
  assigned:  { bg:'rgba(139,92,246,0.12)',  color:'#8b5cf6',  label:'Tutor Assigned' },
  cancelled: { bg:'rgba(239,68,68,0.12)',   color:'#ef4444',  label:'Cancelled'      },
  completed: { bg:'rgba(100,116,139,0.12)', color:'#64748b',  label:'Completed'      },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background:s.bg, color:s.color }}>{s.label}</span>;
}

// ── Edit drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ booking, dark, onClose, onSaved }) {
  const [status,     setStatus]     = useState(booking.status);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [saving,     setSaving]     = useState(false);

  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const bdCard  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const save = async () => {
    setSaving(true);
    try {
      await updateBooking(booking._id, { status, adminNotes });
      toast.success('Booking updated.');
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const rowStyle = { background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border:`1px solid ${bdCard}` };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background:'rgba(2,8,23,0.6)', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="h-full w-full max-w-md overflow-y-auto"
        style={{ background: dark ? '#0f172a' : '#ffffff', borderLeft:`1px solid ${bdCard}` }}>

        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: dark ? '#0f172a' : '#ffffff', borderBottom:`1px solid ${bdCard}` }}>
          <h3 className="font-black" style={{ color: txt }}>Manage Booking</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10">
            <FiX className="w-5 h-5" style={{ color:'#ef4444' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Subject */}
          <div className="rounded-xl p-4" style={rowStyle}>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color:'#34d399' }}>Subject</p>
            <p className="font-bold" style={{ color: txt }}>{booking.subjectName}</p>
            <p className="text-xs mt-0.5" style={{ color: txtSub }}>
              {booking.gradeLevel} · ETB {booking.pricePerHour}/hr
            </p>
          </div>

          {/* Student */}
          <div className="rounded-xl p-4 space-y-1.5" style={rowStyle}>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color:'#60a5fa' }}>Student</p>
            <p className="font-semibold text-sm" style={{ color: txt }}>{booking.fullName}</p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: txtSub }}>
              <FiMail className="w-3.5 h-3.5" />{booking.email}
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: txtSub }}>
              <FiPhone className="w-3.5 h-3.5" />{booking.phone}
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: txtSub }}>
              <FiClock className="w-3.5 h-3.5" />{booking.hoursPerWeek} hrs/week
              {booking.preferredSchedule && ` · ${booking.preferredSchedule}`}
            </p>
          </div>

          {/* Location */}
          <div className="rounded-xl p-4 space-y-1.5" style={rowStyle}>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color:'#f59e0b' }}>Location</p>
            <p className="text-xs flex items-start gap-1.5" style={{ color: txtSub }}>
              <FiMapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {booking.address}{booking.city ? `, ${booking.city}` : ''}
            </p>
            {booking.location?.lat && (
              <p className="text-xs font-mono flex items-center gap-1.5" style={{ color: txtSub }}>
                <FiNavigation className="w-3.5 h-3.5" />
                {booking.location.lat.toFixed(5)}, {booking.location.lng.toFixed(5)}
              </p>
            )}
            {booking.mapLink && (
              <a href={booking.mapLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color:'#60a5fa' }}>
                <FiExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
              </a>
            )}
          </div>

          {/* Message */}
          {booking.message && (
            <div className="rounded-xl p-4" style={rowStyle}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color:'#a78bfa' }}>Student Message</p>
              <p className="text-xs leading-relaxed" style={{ color: txtSub }}>{booking.message}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: txtSub }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:inputBg, border:`1px solid ${inputBd}`, color:txt, appearance:'none' }}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_STYLES[s]?.label ?? s}</option>
              ))}
            </select>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: txtSub }}>Admin Notes (internal)</label>
            <textarea rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
              placeholder="Internal notes visible only to admins…"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-emerald-500/40"
              style={{ background:inputBg, border:`1px solid ${inputBd}`, color:txt }} />
          </div>

          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
            {saving ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving…</> : <><FiSave className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminBookings() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const txtMute = dark ? '#64748b' : '#94a3b8';
  const bg      = dark ? '#020817' : '#f8fafc';
  const bgCard  = dark ? 'rgba(15,23,42,0.7)' : '#ffffff';
  const bdCard  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const [bookings, setBookings]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [total,    setTotal]      = useState(0);
  const [page,     setPage]       = useState(1);
  const [pages,    setPages]      = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGrade,  setFilterGrade]  = useState('');
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleting,     setDeleting]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllBookings({
        page, limit:15,
        ...(filterStatus ? { status:filterStatus }     : {}),
        ...(filterGrade  ? { gradeLevel:filterGrade }  : {}),
      });
      setBookings(res.data || []);
      setTotal(res.total  || 0);
      setPages(res.pages  || 1);
    } catch (err) {
      toast.error(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterGrade]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteBooking(id);
      toast.success('Booking deleted.');
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
            <h1 className="text-2xl font-extrabold" style={{ color: txt }}>Home Tutoring Bookings</h1>
            <p className="text-sm mt-0.5" style={{ color: txtSub }}>{total} total booking{total !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981' }}>
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background:bgCard, border:`1px solid ${bdCard}` }}>
            <FiFilter className="w-4 h-4" style={{ color:txtMute }} />
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm" style={{ color:txt }}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s]?.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background:bgCard, border:`1px solid ${bdCard}` }}>
            <FiBook className="w-4 h-4" style={{ color:txtMute }} />
            <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm" style={{ color:txt }}>
              <option value="">All Grades</option>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background:bgCard, border:`1px solid ${bdCard}` }}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <FiLoader className="w-6 h-6 animate-spin" style={{ color:'#10b981' }} />
              <span className="text-sm" style={{ color:txtSub }}>Loading bookings…</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <FiAlertCircle className="w-10 h-10 opacity-20" style={{ color:txtMute }} />
              <p className="font-semibold" style={{ color:txtSub }}>No bookings found</p>
              <p className="text-sm" style={{ color:txtMute }}>
                {filterStatus || filterGrade ? 'Try clearing filters.' : 'Bookings will appear once students submit them.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom:`1px solid ${bdCard}` }}>
                    {['Student','Subject','Grade','Price/hr','Location','Hrs/wk','Date','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color:txtMute }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b._id}
                      style={{ borderBottom:`1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, background: i%2===0?'transparent':(dark?'rgba(255,255,255,0.015)':'rgba(0,0,0,0.015)') }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background:'linear-gradient(135deg,#10b981,#3b82f6)' }}>
                            {b.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold leading-tight" style={{ color:txt }}>{b.fullName}</p>
                            <p className="text-xs" style={{ color:txtMute }}>{b.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold max-w-[120px] truncate" style={{ color:txt }}>
                        {b.subjectName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{ background:'rgba(59,130,246,0.12)', color:'#3b82f6' }}>{b.gradeLevel}</span>
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color:'#10b981' }}>
                        ETB {b.pricePerHour}
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="text-xs truncate" style={{ color:txtSub }}>{b.address}</p>
                        {b.mapLink && (
                          <a href={b.mapLink} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                            style={{ color:'#60a5fa' }}>
                            <FiNavigation className="w-3 h-3" /> Map ↗
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold" style={{ color:txt }}>
                        {b.hoursPerWeek}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color:txtMute }}>
                        {new Date(b.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditTarget(b)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-500/10" title="Edit">
                            <FiEdit2 className="w-4 h-4" style={{ color:'#3b82f6' }} />
                          </button>
                          <button onClick={() => handleDelete(b._id)} disabled={deleting === b._id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 disabled:opacity-50" title="Delete">
                            {deleting === b._id
                              ? <FiLoader className="w-4 h-4 animate-spin" style={{ color:'#ef4444' }} />
                              : <FiTrash2 className="w-4 h-4" style={{ color:'#ef4444' }} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background:bgCard, border:`1px solid ${bdCard}`, color:txt }}>
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold" style={{ color:txtSub }}>Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background:bgCard, border:`1px solid ${bdCard}`, color:txt }}>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {editTarget && (
        <EditDrawer
          booking={editTarget}
          dark={dark}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}
    </div>
  );
}
