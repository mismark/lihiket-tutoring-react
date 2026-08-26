export default function RoleBadge({ role, theme }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
      {role === 'student' && '🎓 Student Registration'}
      {role === 'teacher' && '👨‍🏫 Teacher Registration'}
      {role === 'parent' && '👪 Parent Registration'}
    </div>
  );
}
