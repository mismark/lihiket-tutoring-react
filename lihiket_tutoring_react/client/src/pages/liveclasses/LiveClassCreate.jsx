import { useState } from 'react';
import { createLiveClass } from '../../api/liveclass.api';
import toast from 'react-hot-toast';
import LiveClassForm from './LiveClassForm';

export default function LiveClassCreate({ subjects, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (data) => {
    setSaving(true);
    try { await createLiveClass(data); toast.success('Live class scheduled'); onCreated(); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to create'); }
    finally { setSaving(false); }
  };
  return <LiveClassForm title="Schedule Live Class" subjects={subjects} onSubmit={handleSubmit} onCancel={onClose} saving={saving} theme={theme} />;
}
