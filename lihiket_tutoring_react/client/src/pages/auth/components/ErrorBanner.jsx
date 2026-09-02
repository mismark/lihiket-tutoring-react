import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorBanner({ message }) {
  return (
    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-fade-in">
      <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="font-medium flex-1">{message}</p>
    </div>
  );
}
