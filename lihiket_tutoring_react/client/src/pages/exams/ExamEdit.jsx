import { useState } from 'react';
import { updateExam } from '../../api/exam.api';
import toast from 'react-hot-toast';
import ExamForm from './ExamForm';

export default function ExamEdit({ exam, subjects, questions, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!exam) return null;
  const handleSubmit = async (data) => {
    setSaving(true);
    try { await updateExam(exam._id, data); toast.success('Exam updated'); onUpdated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to update exam'); }
    finally { setSaving(false); }
  };
  return <ExamForm title="Edit Exam" initial={exam} subjects={subjects} questions={questions} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
