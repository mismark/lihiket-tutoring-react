import { useRef, useState } from 'react';
import { FiCheckCircle, FiCamera, FiLoader, FiX } from 'react-icons/fi';
import { ROLE_STYLE, ROLE_ICON, AVATAR_GRADIENT } from './profile.utils.jsx';
import { uploadAvatar } from '../../../api/auth.api';
import { useAuth }       from '../../../store/auth/AuthContext';
import toast from 'react-hot-toast';

/**
 * Profile avatar card — shows photo (or initials), name, badges, bio.
 * Camera button lets users upload / replace their profile photo.
 */
export default function ProfileAvatar({ profile, fetching, theme, onUpdated }) {
  const { updateUser } = useAuth();
  const dark  = theme === 'dark';
  const role  = profile?.role || 'student';

  const RoleIcon  = ROLE_ICON[role]     || ROLE_ICON.student;
  const gradient  = AVATAR_GRADIENT[role] || AVATAR_GRADIENT.student;
  const roleStyle = ROLE_STYLE[role]    || '';

  const fileRef = useRef();
  const [preview,   setPreview]   = useState(null);   // blob URL while picking
  const [uploading, setUploading] = useState(false);

  // ── Step 1: user picks a file → show preview ─────────────────────────────
  const handlePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    if (!/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.type)) {
      toast.error('Only JPEG, PNG, GIF, or WebP images are allowed'); return;
    }
    setPreview(URL.createObjectURL(file));
    // auto-upload immediately
    handleUpload(file);
  };

  // ── Step 2: upload to Cloudinary via server ───────────────────────────────
  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      if (res.success && res.data?.profilePicture) {
        const cloudUrl = res.data.profilePicture;
        // Clear the local blob preview — show the real Cloudinary URL instead
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        // Update auth context → header + sidebar update instantly
        updateUser({ profilePicture: cloudUrl });
        toast.success('Profile photo updated!');
        onUpdated?.();
      } else {
        throw new Error('Server did not return a photo URL. Check Cloudinary config.');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed. Please try again.');
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  // Show only Cloudinary URL (from profile or auth context) — never a blob
  // blob preview is only used as the uploading overlay src, not as the stored photo
  const photoSrc = profile?.profilePicture || null;

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

        {/* ── Avatar with camera button ── */}
        <div className="relative flex-shrink-0">
          {/* Photo or initials */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            {photoSrc ? (
              <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient}
                              flex items-center justify-center text-white text-3xl font-extrabold`}>
                {(profile?.firstName || '?')[0]}
                {(profile?.lastName  || '')[0]}
              </div>
            )}
          </div>

          {/* Uploading overlay — shows the local preview while Cloudinary processes */}
          {uploading && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {preview && (
                <img src={preview} alt="uploading" className="w-full h-full object-cover opacity-60" />
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                <FiLoader className="w-6 h-6 text-white animate-spin" />
                <span className="text-white text-xs font-semibold">Uploading…</span>
              </div>
            </div>
          )}

          {/* Camera button — always visible in bottom-right corner */}
          {!uploading && (
            <button
              onClick={() => fileRef.current?.click()}
              title="Change profile photo"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full
                         flex items-center justify-center shadow-lg border-2 transition
                         hover:scale-110 active:scale-95"
              style={{
                background: '#3b82f6',
                borderColor: dark ? '#0f172a' : '#ffffff',
              }}>
              <FiCamera className="w-4 h-4 text-white" />
            </button>
          )}

          {/* Cancel preview (if blob preview is shown but upload hasn't started yet) */}
          {preview && !uploading && (
            <button
              onClick={cancelPreview}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500
                         flex items-center justify-center shadow">
              <FiX className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handlePick}
          />
        </div>

        {/* ── Info ── */}
        <div className="flex-1 text-center sm:text-left">
          {fetching ? (
            <div className="space-y-2">
              <div className={`h-6 w-48 rounded-lg animate-pulse ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className={`h-4 w-32 rounded-lg animate-pulse ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
            </div>
          ) : (
            <>
              <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                @{profile?.username}
              </p>

              {/* Upload hint */}
              <p className="text-xs mt-1" style={{ color: dark ? '#475569' : '#9ca3af' }}>
                Tap <FiCamera className="inline w-3 h-3" /> to change your photo
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleStyle}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>

                {profile?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                                   bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}

                {profile?.userId && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono
                                   bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                    {profile.userId}
                  </span>
                )}

                {profile?.gradeLevel && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold
                                   bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    {profile.gradeLevel}
                  </span>
                )}

                {profile?.specializedSubject && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold
                                   bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                    {profile.specializedSubject}
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {profile.bio}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
