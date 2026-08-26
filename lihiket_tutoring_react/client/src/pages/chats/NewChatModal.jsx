import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiSend, FiUser } from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';
import { getChatableUsers, startConversation } from '../../api/chat.api';

const ROLE_COLORS = {
  admin:   'from-amber-500 to-orange-500',
  teacher: 'from-blue-500 to-indigo-500',
  student: 'from-emerald-500 to-teal-500',
  parent:  'from-purple-500 to-violet-500',
};

const ROLE_LABELS = {
  admin: 'Admin', teacher: 'Teacher', student: 'Student', parent: 'Parent',
};

export default function NewChatModal({ onClose, onCreated }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [message,  setMessage]  = useState('');
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    getChatableUsers()
      .then((r) => setUsers(r.data?.data || []))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
    searchRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)  ||
      u.email?.toLowerCase().includes(q)     ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const handleStart = async () => {
    if (!selected) return;
    setSending(true);
    setError('');
    try {
      const res = await startConversation({
        recipientId:    selected._id,
        recipientModel: selected.userModel,
        text:           message.trim() || undefined,
      });
      onCreated(res.data?.data?.conversation);
    } catch (err) {
      setError(err.message || 'Failed to start conversation');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${
        dark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
          <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>New Conversation</h2>
          <button onClick={onClose} className={`p-2 rounded-xl transition ${dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className={`px-4 py-3 border-b flex-shrink-0 ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${dark ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or role…"
              className={`flex-1 bg-transparent text-sm outline-none ${dark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className={`flex flex-col items-center py-10 gap-2 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              <FiUser className="w-8 h-8 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            filtered.map((u) => {
              const isSelected = selected?._id === u._id;
              const grad = ROLE_COLORS[u.role] || 'from-slate-400 to-slate-500';
              return (
                <button
                  key={u._id}
                  onClick={() => setSelected(isSelected ? null : u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isSelected
                      ? dark ? 'bg-blue-500/20' : 'bg-blue-50'
                      : dark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {u.firstName} {u.lastName}
                    </p>
                    <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{u.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Optional first message + send */}
        {selected && (
          <div className={`px-4 py-4 border-t flex-shrink-0 space-y-3 ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
            <p className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Starting chat with <strong className={dark ? 'text-white' : 'text-gray-900'}>{selected.firstName} {selected.lastName}</strong>
            </p>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional first message…"
              className={`w-full text-sm rounded-xl px-3 py-2 resize-none outline-none border transition ${
                dark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400'
              }`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleStart}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              <FiSend className="w-4 h-4" />
              {sending ? 'Starting…' : 'Start Conversation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
