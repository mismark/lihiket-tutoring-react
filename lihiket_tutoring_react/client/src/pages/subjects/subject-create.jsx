import { useState } from 'react';
import { createSubject } from '../../api/subject.api';
import toast from 'react-hot-toast';
import { FiX, FiPlus } from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const CATEGORIES   = ['STEM','Languages','Arts','Social Studies','Physical Education','Other'];

export default function SubjectCreate({ isOpen, onClose, onSuccess, theme }) {
  const dark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '', code: '', description: '', gradeLevel: '', category: '', price: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name || !formData.code) { toast.error('Name and code are required'); return; }
    setLoading(true);
    try {
      await createSubject(formData);
      toast.success('Subject created successfully');
      setFormData({ name: '', code: '', description: '', gradeLevel: '', category: '', price: '' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  const labelCls = `block text-sm font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal shell — flex column with fixed max height */}
      <div className={`flex flex-col w-full max-w-md max-h-[90vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* ── Sticky header ── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Create New Subject</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            <div>
              <label className={labelCls}>Subject Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required
                placeholder="e.g., Mathematics" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Subject Code *</label>
              <input name="code" value={formData.code} onChange={handleChange} required
                placeholder="e.g., MATH101" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={3} placeholder="Brief description of the subject"
                className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Grade Level</label>
                <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className={inputCls}>
                  <option value="">Select grade</option>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputCls}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Price (ETB)</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${dark ? 'text-slate-400' : 'text-gray-500'}`}>ETB</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange}
                  min="0" step="0.01" placeholder="0.00  (leave blank for free)"
                  className={`${inputCls} pl-14`} />
              </div>
            </div>
          </div>

          {/* ── Sticky footer ── */}
          <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
            <button type="button" onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                : <><FiPlus className="w-4 h-4" /> Create Subject</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
