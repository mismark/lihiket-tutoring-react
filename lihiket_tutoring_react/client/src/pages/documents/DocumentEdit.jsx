import { useState } from 'react';
import { updateDocument } from '../../api/document.api';
import toast from 'react-hot-toast';
import DocumentForm from './DocumentForm';

export default function DocumentEdit({ doc, subjects, onClose, onUpdated, theme }) {
  const [saving, setSaving] = useState(false);
  if (!doc) return null;

  const handleSubmit = async (fd) => {
    setSaving(true);
    try {
      await updateDocument(doc._id, fd);
      toast.success('Document updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DocumentForm
      title="Edit Document"
      initial={doc}
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
