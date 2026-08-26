import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterRoleSelect from './RegisterRoleSelect';
import RegisterForm from './RegisterForm';
import { registerUser } from '../../api/auth.api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await registerUser(formData);
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/pending-approval', {
        state: {
          email: formData.get('email'),
          name: `${formData.get('firstName')} ${formData.get('lastName')}`,
          role: formData.get('role'),
        },
      });
    } catch (err) {
      setApiError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return <RegisterRoleSelect onSelect={setRole} />;
  }

  return (
    <RegisterForm
      role={role}
      onBack={() => {
        setRole(null);
        setApiError('');
      }}
      onSubmit={handleSubmit}
      loading={loading}
      apiError={apiError}
    />
  );
}
