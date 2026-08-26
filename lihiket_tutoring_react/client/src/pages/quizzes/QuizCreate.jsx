import { useState } from 'react';
import { createQuiz } from '../../api/quiz.api';
import toast from 'react-hot-toast';
import QuizForm from './QuizForm';

export default function QuizCreate({ subjects, questions, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (data) => {
    setSaving(true);
    try { await createQuiz(data); toast.success('Quiz created'); onCreated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to create quiz'); }
    finally { setSaving(false); }
  };
  return <QuizForm title="Create Quiz" subjects={subjects} questions={questions} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
