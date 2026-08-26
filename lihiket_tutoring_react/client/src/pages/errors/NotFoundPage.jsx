import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';

export default function NotFoundPage() {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 text-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <p className="text-9xl font-black leading-none mb-4 text-blue-600">404</p>
      <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Page not found</h1>
      <p className={`text-sm mb-8 max-w-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className={`px-8 py-2.5 text-sm font-semibold rounded-xl transition ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        ← Go Home
      </Link>
    </div>
  );
}
