import { FiVideo, FiClock, FiCalendar, FiEdit2, FiTrash2,
         FiExternalLink, FiBook, FiUser, FiYoutube } from 'react-icons/fi';

const STATUS = {
  scheduled: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',     label: '📅 Scheduled'  },
  live:      { cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',          label: '🔴 Live Now'   },
  ended:     { cls: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',       label: '✓ Ended'      },
  cancelled: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',  label: '✕ Cancelled'  },
};

const PLATFORM_ICON = {
  zoom: '📹', meet: '🟦', jitsi: '🎙️', teams: '🟣', other: '🎥',
};

function timeUntil(dt) {
  const diff = new Date(dt) - Date.now();
  if (diff < 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `in ${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0)  return `in ${h}h ${m}m`;
  return `in ${m} min`;
}

export default function LiveClassCard({ lc, canManage, onView, onEdit, onDelete, theme }) {
  const dark   = theme === 'dark';
  const st     = STATUS[lc.status] || STATUS.scheduled;
  const until  = lc.status === 'scheduled' ? timeUntil(lc.scheduledAt) : null;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${
      lc.status === 'live'
        ? 'border-red-400/60 bg-red-50/30 dark:bg-red-500/5 dark:border-red-500/30'
        : dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
               : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{PLATFORM_ICON[lc.platform] || '🎥'}</span>
            <h3 className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{lc.title}</h3>
          </div>
          {lc.subject && (
            <p className={`text-xs mt-0.5 flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              <FiBook className="w-3 h-3" /> {lc.subject.name}
            </p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${st.cls}`}>
          {st.label}
        </span>
      </div>

      {/* Schedule */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          <FiCalendar className="w-3 h-3" /> {new Date(lc.scheduledAt).toLocaleString()}
        </span>
        <span className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          <FiClock className="w-3 h-3" /> {lc.duration} min
        </span>
        {until && (
          <span className="text-xs font-semibold text-blue-500">{until}</span>
        )}
      </div>

      {/* Teacher */}
      {lc.createdBy && (
        <p className={`flex items-center gap-1.5 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          <FiUser className="w-3 h-3" /> {lc.createdBy.firstName} {lc.createdBy.lastName}
        </p>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-2 pt-2 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
        {/* Join button — for active or live */}
        {(lc.status === 'live' || lc.status === 'scheduled') && (
          <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
              lc.status === 'live'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30'
            }`}>
            <FiExternalLink className="w-3.5 h-3.5" />
            {lc.status === 'live' ? 'Join Now' : 'Join'}
          </a>
        )}

        {/* Recording link */}
        {lc.status === 'ended' && lc.recordingUrl && (
          <a href={lc.recordingUrl} target="_blank" rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${dark ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
            <FiYoutube className="w-3.5 h-3.5" /> Recording
          </a>
        )}

        <button onClick={() => onView(lc)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Details
        </button>

        {canManage && (
          <>
            <button onClick={() => onEdit(lc)}
              className={`p-2 rounded-xl text-xs transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(lc)}
              className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
