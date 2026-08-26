import { useState } from 'react';
import { createDocument } from '../../api/document.api';
import toast from 'react-hot-toast';
import DocumentForm from './DocumentForm';

export default function DocumentCreate({ subjects, onClose, onCreated, theme }) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (fd) => {
    setSaving(true);
    try {
      await createDocument(fd);
      toast.success('Document uploaded successfully');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DocumentForm
      title="Upload Document"
      subjects={subjects}
      onSubmit={handleSubmit}
      onCancel={onClose}
      saving={saving}
      theme={theme}
    />
  );
}
