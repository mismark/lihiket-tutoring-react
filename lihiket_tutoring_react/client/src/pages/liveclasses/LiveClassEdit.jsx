import { useState } from 'react';
import { updateLiveClass } from '../../api/liveclass.api';
import toast from 'react-hot-toast';
import LiveClassForm from './LiveClassForm';

export default function LiveClassEdit({ liveClass, subjects, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!liveClass) return null;
  const handleSubmit = async (data) => {
    setSaving(true);
    try { await updateLiveClass(liveClass._id, data); toast.success('Updated'); onUpdated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to update'); }
    finally { setSaving(false); }
  };
  return <LiveClassForm title="Edit Live Class" initial={liveClass} subjects={subjects} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
