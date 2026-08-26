import { useState } from 'react';
import { updateLesson } from '../../api/lesson.api';
import toast from 'react-hot-toast';
import LessonForm from './LessonForm';

export default function LessonEdit({ lesson, courses, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!lesson) return null;

  const handleSubmit = async (fd) => {
    setSaving(true);
    try {
      await updateLesson(lesson._id, fd);
      toast.success('Lesson updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LessonForm
      title="Edit Lesson"
      courses={courses}
      initial={lesson}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
