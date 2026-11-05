import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage, FiSend, FiLoader } from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import { createPost, updatePost } from '../../api/post.api';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose, onCreated, editPost = null }) {
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const dark       = theme === 'dark';

  const [text,     setText]     = useState(editPost?.text || '');
  const [preview,  setPreview]  = useState(editPost?.imageUrl || null);
  const [file,     setFile]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const inputRef = useRef();

  const bd  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const bg  = dark ? '#0f172a' : '#ffffff';
  const txt = dark ? '#f1f5f9' : '#0f172a';

  const handleFile = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeImage = () => { setFile(null); setPreview(null); };

  const handleSubmit = async () => {
    if (!text.trim() && !file && !preview) { toast.error('Write something or add an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('text', text.trim());
      if (file) fd.append('image', file);

      if (editPost) {
        const res = await updatePost(editPost._id, fd);
        if (!res.success) throw new Error(res.message || 'Update failed');
        toast.success('Post updated!');
      } else {
        const res = await createPost(fd);
        if (!res.success) throw new Error(res.message || 'Post failed');
        // If an image was attached, verify it was stored as a Cloudinary URL
        if (file && res.data?.imageUrl) {
          const isCloudinary = res.data.imageUrl.includes('cloudinary.com') ||
                               res.data.imageUrl.startsWith('http');
          if (!isCloudinary) {
            console.warn('Image URL is not a Cloudinary URL:', res.data.imageUrl);
            toast.error('Image may not be visible to others. Check server Cloudinary config.');
          }
        }
        toast.success('Post shared!');
      }
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save post');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: bg, border: `1px solid ${bd}` }}
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${bd}` }}>
          <h2 className="font-black text-base" style={{ color: txt }}>
            {editPost ? 'Edit Post' : 'Create Post'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10">
            <FiX className="w-5 h-5 text-red-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Author row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: txt }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs capitalize" style={{ color: dark ? '#64748b' : '#9ca3af' }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            maxLength={5000}
            className="w-full resize-none outline-none text-sm leading-relaxed rounded-xl px-4 py-3
                       focus:ring-2 focus:ring-blue-500/30 transition-all"
            style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                     border: `1px solid ${bd}`, color: txt }} />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-2xl overflow-hidden">
              <img src={preview} alt="preview" className="w-full max-h-64 object-cover" />
              <button onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                           bg-black/60 hover:bg-black/80 transition">
                <FiX className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
              style={{ background: dark ? 'rgba(59,130,246,0.12)' : '#eff6ff',
                       color: '#3b82f6' }}>
              <FiImage className="w-4 h-4" /> Photo
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: dark ? '#475569' : '#9ca3af' }}>
                {text.length}/5000
              </span>
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white
                           disabled:opacity-60 transition"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
                {saving
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Sharing…</>
                  : <><FiSend className="w-4 h-4" /> {editPost ? 'Save' : 'Post'}</>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
