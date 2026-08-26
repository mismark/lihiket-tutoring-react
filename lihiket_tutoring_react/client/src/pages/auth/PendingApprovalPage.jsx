import { Link, useLocation } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiMail, FiShield, FiArrowRight, FiHome, FiHelpCircle } from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';

const VERIFICATION_TIMELINE = [
  {
    step: '1',
    title: 'Application Submitted',
    desc: 'Your registration information has been encrypted and recorded in the verification queue.',
    status: 'completed',
  },
  {
    step: '2',
    title: 'Admin Review & Document Verification',
    desc: 'An administrator reviews your grade level, subject assignments, or uploaded credentials.',
    status: 'active',
  },
  {
    step: '3',
    title: 'Activation & Notification',
    desc: 'Once approved, an email confirmation is sent and your account login is unlocked.',
    status: 'upcoming',
  },
];

export default function PendingApprovalPage() {
  const location = useLocation();
  const { theme } = useTheme();
  const userEmail = location.state?.email;
  const userName = location.state?.name;
  const userRole = location.state?.role;

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Glow effects */}
      <div className={`absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-amber-600/10' : 'bg-amber-400/20'}`} />
      <div className={`absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Card */}
        <div className={`backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 text-center ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700/70' : 'bg-white border-slate-200'}`}>
          {/* Status Badge */}
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/10' : 'bg-amber-100 border-amber-200 text-amber-600 shadow-amber-500/10'}`}>
            <FiClock className="w-8 h-8 animate-pulse" />
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-100 border-amber-200 text-amber-600'}`}>
            Verification In Progress
          </span>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Account Pending Approval
          </h1>

          <p className={`mt-3 text-sm max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Thank you for joining Lihiket{userName ? `, ${userName}` : ''}! To maintain quality and academic integrity, all new accounts are verified by an administrator before access is granted.
          </p>

          {/* User Info Capsule (if available) */}
          {userEmail && (
            <div className={`mt-4 p-3 rounded-2xl inline-flex items-center gap-2.5 text-xs ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <FiMail className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <span>Registered Email: <strong>{userEmail}</strong></span>
              {userRole && (
                <span className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                  {userRole}
                </span>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className={`mt-8 pt-6 border-t text-left space-y-4 ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Verification Workflow
            </h3>
            <div className="space-y-3">
              {VERIFICATION_TIMELINE.map((item, index) => (
                <div
                  key={index}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    item.status === 'completed'
                      ? theme === 'dark' ? 'bg-slate-900/40 border-emerald-500/20 text-slate-300' : 'bg-emerald-50 border-emerald-200 text-slate-700'
                      : item.status === 'active'
                      ? theme === 'dark' ? 'bg-amber-500/5 border-amber-500/30 text-white' : 'bg-amber-50 border-amber-200 text-slate-900'
                      : theme === 'dark' ? 'bg-slate-900/20 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : item.status === 'active'
                        ? 'bg-amber-500 text-slate-900'
                        : theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {item.status === 'completed' ? <FiCheckCircle className="w-4 h-4" /> : item.step}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{item.title}</h4>
                    <p className={`text-xs mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <Link
              to="/login"
              className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
            >
              <FiArrowRight className="w-4 h-4" /> Back to Login
            </Link>
            <Link
              to="/"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <FiHome className="w-4 h-4" /> Go Home
            </Link>
          </div>

          {/* Support Note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <FiHelpCircle className="w-3.5 h-3.5" />
            <span>Need immediate verification? Contact support@lihiket.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
