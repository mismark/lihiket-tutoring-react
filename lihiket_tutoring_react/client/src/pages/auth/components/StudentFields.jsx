import FormInput from './FormInput';

const GRADE_LEVELS = [
  'KG1', 'KG2',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6',
  'G7', 'G8', 'G9', 'G10', 'G11', 'G12',
  'HL',
];

export default function StudentFields({ form, onChange, fieldErrors, theme }) {
  return (
    <>
      <div>
        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
          Grade Level *
        </label>
        <select
          value={form.gradeLevel}
          onChange={onChange('gradeLevel')}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors.gradeLevel 
              ? 'border-red-500 focus:ring-red-500' 
              : theme === 'dark' 
                ? 'bg-slate-900 border-slate-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select grade level</option>
          {GRADE_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {fieldErrors.gradeLevel && <p className="text-xs text-red-500 mt-1">{fieldErrors.gradeLevel}</p>}
      </div>

      <FormInput
        label="Parent/Guardian Full Name *"
        type="text"
        value={form.parentFullName}
        onChange={onChange('parentFullName')}
        placeholder="Parent's full name"
        error={fieldErrors.parentFullName}
        theme={theme}
      />

      <FormInput
        label="Parent Email *"
        type="email"
        value={form.parentEmail}
        onChange={onChange('parentEmail')}
        placeholder="parent@example.com"
        error={fieldErrors.parentEmail}
        theme={theme}
      />

      <FormInput
        label="Parent Phone *"
        type="tel"
        value={form.parentPhone}
        onChange={onChange('parentPhone')}
        placeholder="+1 234 567 8900"
        error={fieldErrors.parentPhone}
        theme={theme}
      />

      <FormInput
        label="Parent Country"
        type="text"
        value={form.parentCountry}
        onChange={onChange('parentCountry')}
        placeholder="e.g., United States"
        theme={theme}
      />
    </>
  );
}

export { GRADE_LEVELS };
