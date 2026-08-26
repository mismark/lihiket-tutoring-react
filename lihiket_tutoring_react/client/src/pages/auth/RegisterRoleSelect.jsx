import { Link } from 'react-router-dom';
import { FiBookOpen, FiUserCheck, FiUsers, FiArrowRight, FiCheck, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';

const ROLES = [
  {
    value: 'student',
    icon: <FiBookOpen className="w-8 h-8 text-sky-400" />,
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    title: 'Student Account',
    tagline: 'Learn, practice, and excel in your curriculum',
    perks: ['Interactive video lessons & notes', 'Timed quizzes & scheduled exam rooms', 'Verified completion certificates'],
  },
  {
    value: 'teacher',
    icon: <FiUserCheck className="w-8 h-8 text-emerald-400" />,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    title: 'Teacher / Instructor',
    tagline: 'Teach courses, schedule live classes & grade assignments',
    perks: ['Course & lesson authoring studio', 'Live classroom broadcasting', 'Assignment grading & question banks'],
  },
  {
    value: 'parent',
    icon: <FiUsers className="w-8 h-8 text-purple-400" />,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    title: 'Parent / Guardian',
    tagline: "Track and support your child's academic growth",
    perks: ['Real-time course progress analytics', 'Grade & assessment monitoring', 'Attendance & live schedule alerts'],
  },
];

export default function RegisterRoleSelect({ onSelect }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm border-b`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <span className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Lihiket<span className="text-blue-400">.</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-blue-500 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-600 hover:border-blue-500 hover:text-slate-900'}`}
          >
            {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`mt-4 text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            Choose your account role
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Select the profile that fits your role on the Lihiket platform
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {ROLES.map((role) => (
            <div
              key={role.value}
              onClick={() => onSelect(role.value)}
              className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-blue-500/50 shadow-slate-900/20' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-500/50 shadow-slate-200/50'} border rounded-3xl p-6 shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-0.5`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl border flex-shrink-0 group-hover:scale-105 transition-transform ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'}`}>
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-lg font-bold group-hover:text-blue-500 transition-colors ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {role.title}
                    </h3>
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{role.tagline}</p>
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    {role.perks.map((perk, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <FiCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
