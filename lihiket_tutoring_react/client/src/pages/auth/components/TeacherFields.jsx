import FormInput from './FormInput';
import { FiUploadCloud, FiFileText, FiTrash2 } from 'react-icons/fi';

export default function TeacherFields({ form, onChange, cvFile, onFileChange, onRemoveFile, fieldErrors, theme }) {
  return (
    <>
      <FormInput
        label="Specialized Subject *"
        type="text"
        value={form.specializedSubject}
        onChange={onChange('specializedSubject')}
        placeholder="e.g., Mathematics, Physics"
        error={fieldErrors.specializedSubject}
        theme={theme}
      />
      
      <FormInput
        label="Qualifications"
        type="text"
        value={form.qualifications}
        onChange={onChange('qualifications')}
        placeholder="e.g., B.Sc. in Mathematics, M.Ed."
        theme={theme}
      />
      
      <FormInput
        label="Years of Experience"
        type="number"
        value={form.experience}
        onChange={onChange('experience')}
        placeholder="e.g., 5"
        theme={theme}
      />
      
      <FormInput
        label="Country"
        type="text"
        value={form.country}
        onChange={onChange('country')}
        placeholder="e.g., United States"
        theme={theme}
      />
      
      <div>
        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
          CV/Resume (PDF, max 50MB)
        </label>
        <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
          theme === 'dark' ? 'border-slate-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'
        } transition`}>
          {cvFile ? (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FiFileText className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {cvFile.name}
                </span>
              </div>
              <button
                type="button"
                onClick={onRemoveFile}
                className="text-red-500 hover:text-red-600"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <FiUploadCloud className={`w-10 h-10 mx-auto mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                Drag & drop or click to upload
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={onFileChange}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Browse files
              </label>
            </div>
          )}
        </div>
        {fieldErrors.cv && <p className="text-xs text-red-500 mt-1">{fieldErrors.cv}</p>}
      </div>
    </>
  );
}
