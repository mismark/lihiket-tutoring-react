import { useState } from 'react';
import { updateQuestion } from '../../api/question.api';
import toast from 'react-hot-toast';
import QuestionForm from './QuestionForm';

export default function QuestionEdit({ question, subjects, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!question) return null;

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await updateQuestion(question._id, payload);
      toast.success('Question updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <QuestionForm
      title="Edit Question"
      initial={question}
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
