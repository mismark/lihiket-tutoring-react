import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiBookOpen, FiPlusCircle, FiBook, FiChevronRight, FiUsers, FiEye } from 'react-icons/fi';
import { getCoursesBySubject, createCourse } from '../../../api/course.api';
import toast from 'react-hot-toast';

export default function SubjectCoursesModal({ isOpen, onClose, subject, theme }) {
  const dark = theme === 'dark';
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title: '', description: '' });

  useEffect(() => {
    if (!isOpen || !subject?._id) return;
    setLoading(true);
    getCoursesBySubject(subject._id)
      .then(res => setCourses(res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [isOpen, subject?._id]);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Course title is required'); return; }
    setCreating(true);
    try {
      await createCourse({ title: form.title, description: form.description, subjectId: subject._id });
      toast.success('Course created');
      setForm({ title: '', description: '' });
      setShowForm(false);
      // Reload
      const res = await getCoursesBySubject(subject._id);
      setCourses(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Courses</h2>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {subject.name} Â· {subject.gradeLevel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <FiPlusCircle className="w-3.5 h-3.5" /> New Course
            </button>
            <button onClick={onClose} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className={`px-6 py-4 border-b flex-shrink-0 space-y-3 ${dark ? 'bg-slate-700/30 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
            <input
              type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Course title *"
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'}`}
            />
            <input
              type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'}`}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="flex-1 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50">
                {creating ? 'Creatingâ€¦' : 'Create'}
              </button>
            </div>
          </form>
        )}

        {/* Course list */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-10">
              <FiBookOpen className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No courses yet</p>
              <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>Click "+ New Course" to add the first one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map(course => (
                <div key={course._id} className={`flex items-center gap-3 p-4 rounded-xl border transition ${dark ? 'bg-slate-700/40 border-slate-600 hover:border-slate-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <FiBook className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{course.title}</p>
                    <p className={`text-xs mt-0.5 flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <FiBookOpen className="w-3 h-3" /> {course.lessons?.length || 0} lesson{course.lessons?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 space-y-2 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <Link
            to={`/subjects/${subject.slug || subject._id}/courses`}
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            <FiBookOpen className="w-4 h-4" /> Manage Courses
          </Link>
          <Link
            to={`/subjects/${subject.slug || subject._id}/classroom`}
            onClick={onClose}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${
              dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiEye className="w-4 h-4" /> Preview as Student
          </Link>
          <button onClick={onClose} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

