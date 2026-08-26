import { FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function ErrorBanner({ message, isPendingApproval }) {
  return (
    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-fade-in">
      <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {isPendingApproval && (
          <Link
            to="/pending-approval"
            className="inline-flex items-center gap-1.5 mt-2 font-semibold text-xs text-amber-400 hover:text-amber-300 underline"
          >
            View verification status <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
