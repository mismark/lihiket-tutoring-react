import { FiMessageSquare, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { deleteConversation } from '../../api/chat.api';

const ROLE_COLORS = {
  admin:   'from-amber-500 to-orange-500',
  teacher: 'from-blue-500 to-indigo-500',
  student: 'from-emerald-500 to-teal-500',
  parent:  'from-purple-500 to-violet-500',
};

function Avatar({ user, size = 'md' }) {
  const grad = ROLE_COLORS[user?.role] || 'from-slate-400 to-slate-500';
  const sz   = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  );
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ChatList({ conversations, activeId, onSelect, onNew, onDelete, loading }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [search,    setSearch]    = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filtered = conversations.filter((c) => {
    const name = `${c.otherUser?.firstName} ${c.otherUser?.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteConversation(id);
      onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`flex flex-col h-full border-r ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>

      {/* Header */}
      <div className={`px-4 py-4 border-b flex items-center justify-between flex-shrink-0 ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <FiMessageSquare className={`w-5 h-5 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
        </div>
        <button
          onClick={onNew}
          title="New conversation"
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className={`px-3 py-2 border-b flex-shrink-0 ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${dark ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className={`flex-1 bg-transparent text-sm outline-none ${dark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 px-4 text-center gap-3 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            <FiMessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">
              {search ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!search && (
              <button onClick={onNew} className="text-xs text-blue-500 hover:underline">
                Start one
              </button>
            )}
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv._id === activeId;
            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group border-b ${
                  dark ? 'border-slate-800/50' : 'border-gray-50'
                } ${
                  isActive
                    ? dark ? 'bg-blue-500/15' : 'bg-blue-50'
                    : dark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                }`}
              >
                <Avatar user={conv.otherUser} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                    </p>
                    <span className={`text-xs flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                      {timeAgo(conv.lastSentAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs capitalize mt-0.5 ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
                    {conv.otherUser?.role}
                  </p>
                </div>

                {/* Delete — show on hover */}
                <button
                  onClick={(e) => handleDelete(e, conv._id)}
                  disabled={deletingId === conv._id}
                  title="Delete conversation"
                  className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all flex-shrink-0 ${
                    dark ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-300 hover:text-red-500'
                  }`}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
