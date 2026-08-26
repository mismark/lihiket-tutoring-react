import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiUsers, FiBook, FiSettings, FiLogOut, FiActivity } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // quick actions 
  const quickActions = [
    {
      title: 'Manage Subjects',
      description: 'Create and assign subjects to teachers',
      icon: FiBook,
      link: '/subjects',
      color: 'blue',
    },
    {
      title: 'Manage Users',
      description: 'View and manage teachers, students, and parents',
      icon: FiUsers,
      link: '/users',
      color: 'emerald',
    },
    {
      title: 'Settings',
      description: 'Configure platform settings and preferences',
      icon: FiSettings,
      link: '#',
      color: 'purple',
    },

    {
      title: 'manage Courses',
      description: 'managing courses created by a users ',
      icon: FiActivity,
      link: '#',
      color: 'purple',
    },


  ];

  return (
    <div className={`min-h-screen p-6 md:p-10 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🛡️ Admin Dashboard</h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Welcome back, <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{user?.firstName} {user?.lastName}</span>
            </p>
          </div>
          
          <button onClick={logout} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-300'} rounded-2xl border shadow-sm p-6 transition-all hover:shadow-md group`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                action.color === 'blue' 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-110 transition-transform'
                  : action.color === 'emerald'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-110 transition-transform'
                  : 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 group-hover:scale-110 transition-transform'
              }`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{action.title}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Stats Overview */}
        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl border shadow-sm p-6`}>
          <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Platform Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>0</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Total Subjects</p>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>0</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Active Teachers</p>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>0</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Active Students</p>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>0</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Pending Approvals</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
