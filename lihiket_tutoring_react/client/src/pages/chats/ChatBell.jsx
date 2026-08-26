import { Link } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../../store/auth/AuthContext';
import { useChat } from '../../store/chat/ChatContext';

export default function ChatBell({ theme }) {
  const { isAuthenticated } = useAuth();
  const { totalUnread }     = useChat();
  const dark = theme === 'dark';

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/chats"
      title="Messages"
      className={`relative p-2 rounded-xl transition ${
        dark
          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <FiMessageSquare className="w-5 h-5" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center px-1 leading-none shadow-sm animate-bounce">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </Link>
  );
}
