import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import {
  FiHome, FiBook, FiMapPin, FiClock, FiCalendar,
  FiLoader, FiAlertCircle, FiNavigation, FiExternalLink,
  FiArrowRight,
} from 'react-icons/fi';
import { getMyBookings } from '../../api/hometutorsubject.api';

const STATUS_STYLES = {
  pending:   { bg:'rgba(245,158,11,0.12)',  color:'#f59e0b',  label:'Pending Review' },
  reviewed:  { bg:'rgba(59,130,246,0.12)',  color:'#3b82f6',  label:'Reviewed'       },
  confirmed: { bg:'rgba(16,185,129,0.12)',  color:'#10b981',  label:'Confirmed'      },
  assigned:  { bg:'rgba(139,92,246,0.12)',  color:'#8b5cf6',  label:'Tutor Assigned' },
  cancelled: { bg:'rgba(239,68,68,0.12)',   color:'#ef4444',  label:'Cancelled'      },
  completed: { bg:'rgba(100,116,139,0.12)', color:'#64748b',  label:'Completed'      },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background:s.bg, color:s.color }}>{s.label}</span>
  );
}

export default function MyBookings() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const txtMute = dark ? '#64748b' : '#94a3b8';
  const bg      = dark ? '#020817' : '#f8fafc';
  const bgCard  = dark ? 'rgba(15,23,42,0.7)' : '#ffffff';
  const bdCard  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(res => setBookings(res.data || []))
      .catch(err => toast.error(err.message || 'Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: txt }}>My Home Tutoring Bookings</h1>
            <p className="text-sm mt-0.5" style={{ color: txtSub }}>
              Track all your home tutoring session requests
            </p>
          </div>
          <Link to="/home-tutor"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
            <FiBook className="w-4 h-4" /> Browse Subjects <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color:'#10b981' }} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4" style={{ background:bgCard, borderRadius:16, border:`1px solid ${bdCard}` }}>
            <FiAlertCircle className="w-12 h-12 opacity-20" style={{ color: txtMute }} />
            <p className="font-semibold text-lg" style={{ color: txtSub }}>No bookings yet</p>
            <p className="text-sm" style={{ color: txtMute }}>Browse subjects and book your first home tutoring session.</p>
            <Link to="/home-tutor"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
              <FiHome className="w-4 h-4" /> Browse Subjects
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b._id} className="rounded-2xl overflow-hidden"
                style={{ background:bgCard, border:`1px solid ${bdCard}` }}>

                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3"
                  style={{ borderBottom:`1px solid ${bdCard}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'rgba(16,185,129,0.12)' }}>
                      <FiBook style={{ color:'#10b981', width:18, height:18 }} />
                    </div>
                    <div>
                      <p className="font-black" style={{ color: txt }}>{b.subjectName}</p>
                      <p className="text-xs" style={{ color: txtMute }}>
                        {b.gradeLevel} · ETB {b.pricePerHour}/hr
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                {/* Body */}
                <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2" style={{ color: txtSub }}>
                    <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color:'#f59e0b' }} />
                    <span>{b.address}{b.city ? `, ${b.city}` : ''}</span>
                  </div>
                  {b.mapLink && (
                    <div className="flex items-center gap-2">
                      <FiNavigation className="w-4 h-4 flex-shrink-0" style={{ color:'#60a5fa' }} />
                      <a href={b.mapLink} target="_blank" rel="noreferrer"
                        className="text-sm font-semibold hover:underline" style={{ color:'#60a5fa' }}>
                        View Location on Map <FiExternalLink className="inline w-3.5 h-3.5 ml-0.5" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2" style={{ color: txtSub }}>
                    <FiClock className="w-4 h-4" style={{ color:'#8b5cf6' }} />
                    <span>{b.hoursPerWeek} hrs/week</span>
                    {b.preferredSchedule && <span className="opacity-70">· {b.preferredSchedule}</span>}
                  </div>
                  {b.startDate && (
                    <div className="flex items-center gap-2" style={{ color: txtSub }}>
                      <FiCalendar className="w-4 h-4" style={{ color:'#10b981' }} />
                      <span>Starts {new Date(b.startDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
                    </div>
                  )}

                  {/* Assigned teacher */}
                  {b.assignedTeacher && (
                    <div className="sm:col-span-2 flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background:'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                        {b.assignedTeacher.firstName?.[0]}{b.assignedTeacher.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color:'#a78bfa' }}>Your assigned tutor</p>
                        <p className="text-sm font-semibold" style={{ color: txt }}>
                          {b.assignedTeacher.firstName} {b.assignedTeacher.lastName}
                        </p>
                        {b.assignedTeacher.phone && (
                          <a href={`tel:${b.assignedTeacher.phone}`}
                            className="text-xs hover:underline" style={{ color: txtSub }}>
                            {b.assignedTeacher.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop:`1px solid ${bdCard}` }}>
                  <p className="text-xs" style={{ color: txtMute }}>
                    Booked {new Date(b.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                  <p className="text-sm font-bold" style={{ color:'#10b981' }}>
                    ~ETB {b.pricePerHour * b.hoursPerWeek}/week
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
