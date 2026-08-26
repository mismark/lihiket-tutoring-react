import { useState } from 'react';
import { updateAssignment } from '../../api/assignment.api';
import toast from 'react-hot-toast';
import AssignmentForm from './AssignmentForm';

export default function AssignmentEdit({ assignment, subjects, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!assignment) return null;
  const handleSubmit = async (fd) => {
    setSaving(true);
    try { await updateAssignment(assignment._id, fd); toast.success('Assignment updated'); onUpdated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to update'); }
    finally { setSaving(false); }
  };
  return <AssignmentForm title="Edit Assignment" initial={assignment} subjects={subjects} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
