import { useState } from 'react';
import { createQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';
import QuizForm from './QuizForm';

export default function QuizCreate({ subjects, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await createQuiz(data);
      toast.success('Quiz created successfully');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <QuizForm
      title="Create Quiz"
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
