import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import {
  TYPE_CONFIG, getDeepLink, getSubtitle,
} from '../../components/layout/HeaderSearch';

const STATUS_BADGE = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  live:      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  draft:     'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  ended:     'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400',
  closed:    'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400',
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
};

function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchResultItem({ type, item, query = '', theme }) {
  const dark     = theme === 'dark';
  const navigate = useNavigate();
  const cfg      = TYPE_CONFIG[type] || TYPE_CONFIG.subjects;
  const Icon     = cfg.icon;
  const link     = getDeepLink(type, item);
  const subtitle = getSubtitle(type, item);
  const title    = item.title || item.name || '';
  const status   = item.status || (item.isActive ? 'active' : null);

  return (
    <div
      onClick={() => navigate(link)}
      className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-all ${
        dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.colorBg}`}>
        <Icon className={`w-5 h-5 ${cfg.colorIcon}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-0.5 flex-wrap">
          <p className={`text-sm font-semibold leading-snug ${dark ? 'text-white' : 'text-gray-900'}`}>
            <Highlight text={title} query={query} />
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {status && STATUS_BADGE[status] && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[status]}`}>
                {status}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.colorBg} ${cfg.colorIcon}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {subtitle && (
          <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{subtitle}</p>
        )}

        {item.description && (
          <p className={`text-xs mt-1 line-clamp-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            {item.description}
          </p>
        )}
      </div>

      {/* Navigate arrow */}
      <FiArrowUpRight className={`w-4 h-4 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
        dark ? 'text-slate-400' : 'text-gray-400'
      }`} />
    </div>
  );
}
