import { useState, useEffect } from 'react';
import {
  FiVideo, FiClock, FiCalendar, FiEdit2, FiTrash2,
  FiExternalLink, FiBook, FiUser, FiUsers, FiRadio,
  FiCheckCircle, FiXCircle, FiEye,
} from 'react-icons/fi';

// Deterministic gradient — same pattern as CourseCard
const GRADIENTS = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
];
function gradientFor(id = '') {
  const sum = (id + '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

const PLATFORM_COLOR = {
  zoom:  'from-blue-500 to-blue-700',
  meet:  'from-green-500 to-emerald-600',
  jitsi: 'from-indigo-500 to-violet-600',
  teams: 'from-purple-500 to-indigo-600',
  other: 'from-slate-500 to-slate-700',
};
const PLATFORM_LABEL = { zoom: 'Zoom', meet: 'Google Meet', jitsi: 'Jitsi', teams: 'Teams', other: 'Meeting' };

const STATUS = {
  scheduled: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',       label: 'Scheduled'  },
  live:      { cls: 'bg-red-100  text-red-700  dark:bg-red-500/20  dark:text-red-400',         label: 'Live Now'   },
  ended:     { cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',       label: 'Ended'      },
  cancelled: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',    label: 'Cancelled'  },
};

// Live countdown ticker
function Countdown({ scheduledAt }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(scheduledAt) - Date.now();
      if (diff <= 0) { setText('Starting now'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) setText(`in ${Math.floor(h/24)}d ${h%24}h`);
      else if (h > 0) setText(`in ${h}h ${m}m`);
      else if (m > 0) setText(`in ${m}m ${s}s`);
      else setText(`in ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [scheduledAt]);
  return <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">{text}</span>;
}

export default function LiveClassCard({ lc, canManage, onView, onEdit, onDelete, theme }) {
  const dark  = theme === 'dark';
  const grad  = lc.status === 'live' ? PLATFORM_COLOR[lc.platform] || PLATFORM_COLOR.other : gradientFor(lc._id);
  const st    = STATUS[lc.status] || STATUS.scheduled;
  const plat  = PLATFORM_LABEL[lc.platform] || 'Meeting';
  const initials = lc.title.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

  const scheduledDate = lc.scheduledAt ? new Date(lc.scheduledAt) : null;
  const dateLabel = scheduledDate
    ? scheduledDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    : '';
  const timeLabel = scheduledDate
    ? scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
      lc.status === 'live'
        ? 'bg-white dark:bg-slate-800 border-red-300 dark:border-red-500/40 ring-1 ring-red-400/20'
        : lc.status === 'scheduled'
          ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
          : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 opacity-80'
    }`}>

      {/* ── Colour banner ── */}
      <div className={`h-24 bg-gradient-to-br ${grad} relative flex items-end px-5 pb-4`}>
        <div className="absolute inset-0 bg-black/10" />

        {/* Live pulsing badge */}
        {lc.status === 'live' && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                           bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}

        {/* Status badge */}
        {lc.status !== 'live' && (
          <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm ${
            lc.status === 'scheduled' ? 'bg-black/20 text-white' : st.cls
          }`}>
            {st.label}
          </span>
        )}

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
            {lc.status === 'live' ? <FiRadio className="w-5 h-5 animate-pulse" /> : initials}
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium">{plat}</p>
            <p className="text-white/55 text-xs">{lc.duration} min</p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {lc.title}
          </h3>
          {lc.subject && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <FiBook className="w-3 h-3" /> {lc.subject.name}
              {lc.subject.gradeLevel && <span className="opacity-60">· {lc.subject.gradeLevel}</span>}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex flex-col gap-1">
            {scheduledDate && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                <FiCalendar className="w-3 h-3 text-blue-500" />
                {dateLabel}
              </span>
            )}
            {timeLabel && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                <FiClock className="w-3 h-3 text-blue-500" />
                {timeLabel} · {lc.duration} min
              </span>
            )}
          </div>
          {lc.createdBy && (
            <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
              <FiUser className="w-3 h-3" />
              {lc.createdBy.firstName} {lc.createdBy.lastName}
            </span>
          )}
        </div>

        {/* Countdown or ended info */}
        {lc.status === 'scheduled' && scheduledDate && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
            dark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
          }`}>
            <FiClock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className={dark ? 'text-slate-300' : 'text-slate-600'}>Starts </span>
            <Countdown scheduledAt={lc.scheduledAt} />
          </div>
        )}
        {lc.status === 'live' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs
                          bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-red-700 dark:text-red-400">Class is live right now</span>
          </div>
        )}
        {lc.status === 'ended' && lc.recordingUrl && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs
                          bg-purple-50 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20">
            <FiVideo className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
            <span className={`${dark ? 'text-slate-300' : 'text-slate-600'}`}>Recording available</span>
          </div>
        )}

        {/* Progress bar — visual duration indicator */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 dark:text-slate-500">Duration</span>
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">{lc.duration} minutes</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700 ${
                lc.status === 'live' ? 'animate-pulse' : ''
              }`}
              style={{ width: `${Math.min(100, (lc.duration / 120) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700">

        {/* Join button */}
        {(lc.status === 'live' || lc.status === 'scheduled') && lc.meetingLink && (
          <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition ${
              lc.status === 'live'
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
            }`}>
            <FiExternalLink className="w-3.5 h-3.5" />
            {lc.status === 'live' ? 'Join Now' : 'Join Class'}
          </a>
        )}

        {/* Recording */}
        {lc.status === 'ended' && lc.recordingUrl && (
          <a href={lc.recordingUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                       text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/10 transition">
            <FiVideo className="w-3.5 h-3.5" /> Recording
          </a>
        )}

        {/* Details */}
        <button onClick={() => onView(lc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                     text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700 transition">
          <FiEye className="w-3.5 h-3.5" /> Details
        </button>

        {canManage && (
          <>
            <button onClick={() => onEdit(lc)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700 transition">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(lc)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold
                         text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
