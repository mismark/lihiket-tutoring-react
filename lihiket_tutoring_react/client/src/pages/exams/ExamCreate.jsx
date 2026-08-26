import { useState } from 'react';
import { createExam } from '../../api/exam.api';
import toast from 'react-hot-toast';
import ExamForm from './ExamForm';

export default function ExamCreate({ subjects, questions, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (data) => {
    setSaving(true);
    try { await createExam(data); toast.success('Exam created'); onCreated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to create exam'); }
    finally { setSaving(false); }
  };
  return <ExamForm title="Create Exam" subjects={subjects} questions={questions} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
