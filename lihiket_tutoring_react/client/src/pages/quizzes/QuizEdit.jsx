import { useState } from 'react';
import { updateQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';
import QuizForm from './QuizForm';

export default function QuizEdit({ quiz, subjects, questions, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!quiz) return null;
  const handleSubmit = async (data) => {
    setSaving(true);
    try { await updateQuiz(quiz._id, data); toast.success('Quiz updated'); onUpdated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to update quiz'); }
    finally { setSaving(false); }
  };
  return <QuizForm title="Edit Quiz" initial={quiz} subjects={subjects} questions={questions} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
