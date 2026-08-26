import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  toggleUserActive,
} from '../../api/user.api';
import toast from 'react-hot-toast';
import { FiUsers, FiSearch, FiX } from 'react-icons/fi';
import UserTabs       from './components/UserTabs';
import UserFilters    from './components/UserFilters';
import UserRow        from './components/UserRow';
import UserEditModal  from './components/UserEditModal';
import UserDeleteModal from './components/UserDeleteModal';

// Which fields to include in the search index per role
const SEARCH_FIELDS = {
  pending: ['firstName', 'lastName', 'email', 'phone', 'specializedSubject', 'gradeLevel', 'parentFullName'],
  teacher: ['firstName', 'lastName', 'email', 'phone', 'specializedSubject', 'qualifications'],
  student: ['firstName', 'lastName', 'email', 'phone', 'gradeLevel', 'parentFullName', 'parentEmail', 'parentPhone'],
  parent:  ['firstName', 'lastName', 'email', 'phone', 'country'],
  admin:   ['firstName', 'lastName', 'email', 'phone'],
};

function matchesSearch(user, query, tab) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const fields = SEARCH_FIELDS[tab] || SEARCH_FIELDS.admin;
  return fields.some(f => user[f]?.toString().toLowerCase().includes(q));
}

const DETAILS_LABEL = {
  pending: 'Info',
  teacher: 'Subject / Experience',
  student: 'Grade / Parent',
  parent:  'Country',
  admin:   'Details',
};

export default function AdminUsers() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('pending');
  const [users, setUsers]         = useState([]);
  const [counts, setCounts]       = useState({ pending: 0, teacher: 0, student: 0, parent: 0, admin: 0 });
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ isActive: '' });
  const [search, setSearch]       = useState('');
  const [editingUser, setEditingUser]   = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // ── fetch list for active tab ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];
      if (activeTab === 'pending') {
        const res = await getPendingUsers({});
        data = res.data;
      } else {
        const params = { role: activeTab };
        if (filters.isActive !== '') params.isActive = filters.isActive;
        const res = await getAllUsers(params);
        data = res.data;
      }
      setUsers(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  // ── fetch counts for all tabs ───────────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const [pendingRes, teacherRes, studentRes, parentRes, adminRes] = await Promise.all([
        getPendingUsers({}),
        getAllUsers({ role: 'teacher' }),
        getAllUsers({ role: 'student' }),
        getAllUsers({ role: 'parent' }),
        getAllUsers({ role: 'admin' }),
      ]);
      setCounts({
        pending: pendingRes.data.length,
        teacher: teacherRes.data.length,
        student: studentRes.data.length,
        parent:  parentRes.data.length,
        admin:   adminRes.data.length,
      });
    } catch { /* counts are cosmetic */ }
  }, []);

  useEffect(() => { fetchUsers();  }, [fetchUsers]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // ── client-side search filter ───────────────────────────────────────────────
  const filteredUsers = useMemo(
    () => users.filter(u => matchesSearch(u, search, activeTab)),
    [users, search, activeTab]
  );

  // ── mutations ───────────────────────────────────────────────────────────────
  const handleApprove = async (userId, userType) => {
    try {
      await approveUser(userId, userType);
      toast.success('User approved');
      fetchUsers(); fetchCounts();
    } catch (err) { toast.error(err.message || 'Failed to approve user'); }
  };

  const handleReject = async (userId, userType) => {
    if (!window.confirm('Reject this user? Their account will be permanently deleted.')) return;
    try {
      await rejectUser(userId, userType);
      toast.success('User rejected and deleted');
      fetchUsers(); fetchCounts();
    } catch (err) { toast.error(err.message || 'Failed to reject user'); }
  };

  const handleToggleActive = async (userId, userType) => {
    try {
      await toggleUserActive(userId, userType);
      toast.success('User status updated');
      fetchUsers(); fetchCounts();
    } catch (err) { toast.error(err.message || 'Failed to update user status'); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({ isActive: '' });
    setSearch('');
  };

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const resetFilters = () => { setFilters({ isActive: '' }); setSearch(''); };

  // ── placeholder text per tab ────────────────────────────────────────────────
  const searchPlaceholder = {
    pending: 'Search by name, email, subject, grade…',
    teacher: 'Search by name, email, subject…',
    student: 'Search by name, email, grade, parent…',
    parent:  'Search by name, email, country…',
    admin:   'Search by name or email…',
  }[activeTab];

  const detailsLabel = DETAILS_LABEL[activeTab] || 'Details';
  const isEmpty = !loading && filteredUsers.length === 0;

  return (
    <div className={`min-h-screen p-6 md:p-10 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className={`text-2xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              👥 User Management
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Approve, reject, and manage platform users
            </p>
          </div>
        </div>

        {/* Tabs */}
        <UserTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={counts}
          theme={theme}
        />

        {/* Search bar — always visible */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm mb-4 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <FiSearch className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className={`flex-1 text-sm bg-transparent outline-none placeholder:text-sm ${
              theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className={`p-1 rounded-lg transition ${
                theme === 'dark' ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Clear search"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          {search && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {filteredUsers.length} of {users.length}
            </span>
          )}
        </div>

        {/* Status filter — only for role tabs */}
        {activeTab !== 'pending' && (
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            theme={theme}
            hideRoleFilter
          />
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Loading…</p>
          </div>
        ) : isEmpty ? (
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-12 text-center`}>
            <FiUsers className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
              {search ? `No results for "${search}"` : activeTab === 'pending' ? 'No pending users' : `No ${activeTab}s found`}
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {search ? 'Try a different search term' : activeTab === 'pending' ? 'All registrations have been reviewed' : 'Try adjusting your filters'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}>
                  <tr>
                    {['User', 'Role', detailsLabel, 'Status', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-gray-200'}`}>
                  {filteredUsers.map(user => (
                    <UserRow
                      key={user._id}
                      user={user}
                      activeTab={activeTab}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onToggleActive={handleToggleActive}
                      onEdit={setEditingUser}
                      onDelete={setDeletingUser}
                      theme={theme}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`px-6 py-3 border-t text-xs ${theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'}`}>
              {search
                ? `${filteredUsers.length} of ${users.length} ${activeTab === 'pending' ? 'pending' : activeTab + 's'} match "${search}"`
                : `${users.length} ${activeTab === 'pending' ? 'pending registration' : activeTab}${users.length !== 1 ? 's' : ''}`
              }
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          theme={theme}
          onClose={() => setEditingUser(null)}
          onSaved={() => { fetchUsers(); fetchCounts(); }}
        />
      )}

      {/* Delete modal */}
      {deletingUser && (
        <UserDeleteModal
          user={deletingUser}
          theme={theme}
          onClose={() => setDeletingUser(null)}
          onDeleted={() => { fetchUsers(); fetchCounts(); }}
        />
      )}
    </div>
  );
}
