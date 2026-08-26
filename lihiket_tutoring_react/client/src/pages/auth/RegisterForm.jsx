import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';
import AuthHeader from './components/AuthHeader';
import RoleBadge from './components/RoleBadge';
import ErrorBanner from './components/ErrorBanner';
import FormInput from './components/FormInput';
import PasswordStrength from './components/PasswordStrength';
import TeacherFields from './components/TeacherFields';
import StudentFields from './components/StudentFields';
import SubmitButton from './components/SubmitButton';

export default function RegisterForm({ role, onBack, onSubmit, loading, apiError }) {
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    role,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gradeLevel: '',
    parentFullName: '',
    parentEmail: '',
    parentPhone: '',
    parentCountry: '',
    specializedSubject: '',
    qualifications: '',
    experience: '',
    country: '',
  });

  const [cvFile, setCvFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, cv: 'File size exceeds 50MB limit.' }));
        return;
      }
      setCvFile(file);
      setFieldErrors((prev) => ({ ...prev, cv: '' }));
    }
  };

  const handleRemoveFile = () => {
    setCvFile(null);
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Valid email is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    if (!form.password || form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (role === 'student' && !form.gradeLevel) {
      errors.gradeLevel = 'Please select your grade level';
    }
    if (role === 'teacher' && !form.specializedSubject.trim()) {
      errors.specializedSubject = 'Specialized subject is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== 'confirmPassword' && val !== '') {
        formData.append(key, val);
      }
    });

    if (cvFile) {
      formData.append('cv', cvFile);
    }

    onSubmit(formData);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <AuthHeader theme={theme} toggleTheme={toggleTheme} />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            <FiArrowLeft className="w-4 h-4" /> Change Role
          </button>
          <RoleBadge role={role} theme={theme} />
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-xl rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5`}>
          <div className="mb-6 animate-[fadeIn_0.4s_ease-out]">
            <h2 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Create your account</h2>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Fill in your details below. Your account will undergo admin verification before access.
            </p>
          </div>

          {apiError && <ErrorBanner message={apiError} />}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b mb-4 ${theme === 'dark' ? 'text-blue-400 border-slate-700' : 'text-blue-500 border-slate-200'}`}>
                1. Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="First Name *"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  placeholder="e.g. Abebe"
                  icon={FiUser}
                  error={fieldErrors.firstName}
                  theme={theme}
                />
                <FormInput
                  label="Last Name *"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  placeholder="e.g. Kebede"
                  icon={FiUser}
                  error={fieldErrors.lastName}
                  theme={theme}
                />
                <FormInput
                  label="Username *"
                  type="text"
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder="abebe.kebede"
                  error={fieldErrors.username}
                  theme={theme}
                />
                <FormInput
                  label="Phone Number *"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+251 911 234 567"
                  icon={FiPhone}
                  error={fieldErrors.phone}
                  theme={theme}
                />
                <div className="sm:col-span-2">
                  <FormInput
                    label="Email Address *"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="you@example.com"
                    icon={FiMail}
                    error={fieldErrors.email}
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            {role === 'student' && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b mb-4 ${theme === 'dark' ? 'text-sky-400 border-slate-700' : 'text-sky-500 border-slate-200'}`}>
                  2. Student & Guardian Details
                </h3>
                <StudentFields 
                  form={form} 
                  onChange={handleChange} 
                  fieldErrors={fieldErrors} 
                  theme={theme} 
                />
              </div>
            )}

            {role === 'teacher' && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b mb-4 ${theme === 'dark' ? 'text-emerald-400 border-slate-700' : 'text-emerald-500 border-slate-200'}`}>
                  2. Teacher Qualifications & CV
                </h3>
                <TeacherFields 
                  form={form} 
                  onChange={handleChange} 
                  cvFile={cvFile} 
                  onFileChange={handleFileChange} 
                  onRemoveFile={handleRemoveFile} 
                  fieldErrors={fieldErrors} 
                  theme={theme} 
                />
              </div>
            )}

            {role === 'parent' && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b mb-4 ${theme === 'dark' ? 'text-purple-400 border-slate-700' : 'text-purple-500 border-slate-200'}`}>
                  2. Parent Location
                </h3>
                <FormInput
                  label="Country / Residence"
                  type="text"
                  value={form.country}
                  onChange={handleChange('country')}
                  placeholder="e.g. Ethiopia"
                  theme={theme}
                />
              </div>
            )}

            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b mb-4 ${theme === 'dark' ? 'text-blue-400 border-slate-700' : 'text-blue-500 border-slate-200'}`}>
                3. Security & Password
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Password *"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 8 characters"
                  showToggle
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  error={fieldErrors.password}
                  theme={theme}
                />
                {form.password && <PasswordStrength password={form.password} theme={theme} />}
                <FormInput
                  label="Confirm Password *"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Repeat password"
                  showToggle
                  showPassword={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={fieldErrors.confirmPassword}
                  theme={theme}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
              <FiAlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Admin Approval Protocol:</strong> Upon submitting, your registration enters the admin review queue. You will receive an approval confirmation email before logging in.
              </span>
            </div>

            <SubmitButton loading={loading} />

            <p className={`text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
