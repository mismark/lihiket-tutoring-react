import { useState } from 'react';
import { createQuestion } from '../../api/question.api';
import toast from 'react-hot-toast';
import QuestionForm from './QuestionForm';

export default function QuestionCreate({ subjects, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await createQuestion(payload);
      toast.success('Question created');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <QuestionForm
      title="Add Question"
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
