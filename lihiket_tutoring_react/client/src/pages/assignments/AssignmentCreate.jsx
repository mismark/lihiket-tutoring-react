import { useState } from 'react';
import { createAssignment } from '../../api/assignment.api';
import toast from 'react-hot-toast';
import AssignmentForm from './AssignmentForm';

export default function AssignmentCreate({ subjects, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (fd) => {
    setSaving(true);
    try { await createAssignment(fd); toast.success('Assignment created'); onCreated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to create'); }
    finally { setSaving(false); }
  };
  return <AssignmentForm title="Create Assignment" subjects={subjects} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
