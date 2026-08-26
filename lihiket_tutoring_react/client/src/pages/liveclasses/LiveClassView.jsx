import { FiX, FiExternalLink, FiClock, FiCalendar, FiBook,
         FiUser, FiEdit2, FiYoutube, FiVideo } from 'react-icons/fi';

const STATUS = {
  scheduled: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',    label: '📅 Scheduled' },
  live:      { cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',         label: '🔴 Live Now'  },
  ended:     { cls: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',      label: '✓ Ended'    },
  cancelled: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', label: '✕ Cancelled' },
};

const PLATFORM_LABELS = { zoom:'Zoom', meet:'Google Meet', jitsi:'Jitsi', teams:'MS Teams', other:'Other' };

export default function LiveClassView({ lc, canManage, onClose, onEdit, theme }) {
  const dark = theme === 'dark';
  if (!lc) return null;
  const st = STATUS[lc.status] || STATUS.scheduled;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>

        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{lc.title}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiCalendar, label: 'Scheduled',  value: new Date(lc.scheduledAt).toLocaleString() },
              { icon: FiClock,    label: 'Duration',   value: `${lc.duration} min` },
              { icon: FiVideo,    label: 'Platform',   value: PLATFORM_LABELS[lc.platform] || lc.platform },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}><Icon className="w-3 h-3" />{label}</div>
                <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          {lc.subject && <p className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}><FiBook className="w-4 h-4 text-blue-500" />{lc.subject.name} · {lc.subject.gradeLevel}</p>}
          {lc.createdBy && <p className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}><FiUser className="w-3.5 h-3.5" />By {lc.createdBy.firstName} {lc.createdBy.lastName}</p>}
          {lc.description && <p className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{lc.description}</p>}
          {lc.notes && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Class Notes / Agenda</p>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{lc.notes}</p>
            </div>
          )}
          {lc.recordingUrl && (
            <a href={lc.recordingUrl} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${dark ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              <FiYoutube className="w-4 h-4" /> Watch Recording
            </a>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex-shrink-0 flex gap-3 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          {(lc.status === 'live' || lc.status === 'scheduled') && (
            <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition ${lc.status === 'live' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <FiExternalLink className="w-4 h-4" /> {lc.status === 'live' ? 'Join Now' : 'Join Class'}
            </a>
          )}
          {canManage && <button onClick={onEdit} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><FiEdit2 className="w-4 h-4" /> Edit</button>}
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Close</button>
        </div>
      </div>
    </div>
  );
}
