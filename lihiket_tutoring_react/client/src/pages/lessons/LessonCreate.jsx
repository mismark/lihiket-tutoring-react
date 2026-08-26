import { useState } from 'react';
import { createLesson } from '../../api/lesson.api';
import toast from 'react-hot-toast';
import LessonForm from './LessonForm';

export default function LessonCreate({ courses, defaultCourseId, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);

  // Pre-inject defaultCourseId if given
  const initial = defaultCourseId ? { course: defaultCourseId } : null;

  const handleSubmit = async (fd) => {
    if (defaultCourseId && !fd.get('courseId')) fd.set('courseId', defaultCourseId);
    setSaving(true);
    try {
      await createLesson(fd);
      toast.success('Lesson created');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create lesson');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LessonForm
      title="Add Lesson"
      courses={courses}
      initial={initial}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
