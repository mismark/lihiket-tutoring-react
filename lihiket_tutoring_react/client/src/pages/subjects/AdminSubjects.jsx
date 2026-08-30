import { useState, useEffect } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import axios from '../../api/axios';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

import SubjectList            from './subject-list';
import SubjectCreate          from './subject-create';
import SubjectUpdate          from './subject-update';
import SubjectDelete          from './subject-delete';
import SubjectRead            from './subject-read';
import AssignTeacherModal     from './components/AssignTeacherModal';
import SubjectStudentsModal   from './components/SubjectStudentsModal';
import SubjectCoursesModal    from './components/SubjectCoursesModal';

export default function AdminSubjects() {
  const { theme } = useTheme();

  const [subjects,         setSubjects]         = useState([]);
  const [teachers,         setTeachers]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedSubject,  setSelectedSubject]  = useState(null);
  const [filters,          setFilters]          = useState({ gradeLevel: '', category: '', search: '' });

  // modal visibility flags
  const [showCreate,   setShowCreate]   = useState(false);
  const [showUpdate,   setShowUpdate]   = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [showRead,     setShowRead]     = useState(false);
  const [showAssign,   setShowAssign]   = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showCourses,  setShowCourses]  = useState(false);

  useEffect(() => { fetchSubjects(); fetchTeachers(); }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res  = await getAllSubjects(filters);
      const data = res.data;
      setSubjects(data);
      if (selectedSubject) {
        const updated = data.find(s => s._id === selectedSubject._id);
        if (updated) setSelectedSubject(updated);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/users/teachers');
      setTeachers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err.message);
    }
  };

  // â”€â”€ generic opener â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const open = (setter, subject) => {
    setSelectedSubject(subject);
    setter(true);
  };

  // â”€â”€ teacher assignment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAssignTeacher = async (teacherId) => {
    try {
      await axios.post(`/subjects/${selectedSubject._id}/assign`, { teacherId });
      toast.success('Teacher assigned');
      fetchSubjects();
    } catch (err) { toast.error(err.message || 'Failed to assign teacher'); }
  };

  const handleRemoveTeacher = async (teacherId) => {
    try {
      await axios.delete(`/subjects/${selectedSubject._id}/assign/${teacherId}`);
      toast.success('Teacher removed');
      fetchSubjects();
    } catch (err) { toast.error(err.message || 'Failed to remove teacher'); }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* â”€â”€ Page header â”€â”€ */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Subject Management
            </h1>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              Create and manage subjects, assign teachers
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <FiPlus className="w-4 h-4" /> Create Subject
          </button>
        </div>

        <SubjectList
          subjects={subjects}
          loading={loading}
          filters={filters}
          onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
          onResetFilters={() => setFilters({ gradeLevel: '', category: '', search: '' })}
          onView={s    => open(setShowRead,     s)}
          onEdit={s    => open(setShowUpdate,   s)}
          onAssign={s  => open(setShowAssign,   s)}
          onDelete={s  => open(setShowDelete,   s)}
          onViewStudents={s  => open(setShowStudents, s)}
          onCreateCourse={s  => open(setShowCourses,  s)}
          theme={theme}
        />
      </div>

      {/* â”€â”€ Modals â”€â”€ */}
      <SubjectCreate
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchSubjects}
        theme={theme}
      />

      <SubjectUpdate
        isOpen={showUpdate}
        onClose={() => setShowUpdate(false)}
        subject={selectedSubject}
        onSuccess={fetchSubjects}
        theme={theme}
      />

      <SubjectDelete
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        subject={selectedSubject}
        onSuccess={fetchSubjects}
        theme={theme}
      />

      {showRead && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <SubjectRead
              subjectId={selectedSubject._id}
              theme={theme}
              onBack={() => setShowRead(false)}
            />
          </div>
        </div>
      )}

      <AssignTeacherModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        teachers={teachers}
        onAssign={handleAssignTeacher}
        onRemove={handleRemoveTeacher}
        selectedSubject={selectedSubject}
        theme={theme}
      />

      <SubjectStudentsModal
        isOpen={showStudents}
        onClose={() => setShowStudents(false)}
        subject={selectedSubject}
        theme={theme}
      />

      <SubjectCoursesModal
        isOpen={showCourses}
        onClose={() => setShowCourses(false)}
        subject={selectedSubject}
        theme={theme}
      />
    </div>
  );
}

