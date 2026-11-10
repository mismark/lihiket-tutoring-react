import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import { getFeed }  from '../../api/post.api';
import PostCard         from './PostCard';
import CreatePostModal  from './CreatePostModal';
import toast from 'react-hot-toast';
import {
  FiPlus, FiRefreshCw, FiLoader, FiRss,
  FiImage, FiEdit3, FiArrowUp,
} from 'react-icons/fi';

// Auto-refresh interval in ms (10 seconds — checks for new posts silently)
const REFRESH_INTERVAL = 10_000;

export default function FeedPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark = theme === 'dark';

  const bg      = dark ? '#020817'             : '#f0f2f5';
  const cardBg  = dark ? 'rgba(15,23,42,0.8)'  : '#ffffff';
  const bd      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#f0f2f5';

  const [posts,       setPosts]       = useState([]);
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadMore,    setLoadMore]    = useState(false);
  const [newCount,    setNewCount]    = useState(0);   // unseen posts since last refresh
  const [showCreate,  setShowCreate]  = useState(false);
  const [editPost,    setEditPost]    = useState(null);
  const loaderRef   = useRef(null);
  const latestIdRef = useRef(null);  // _id of the most recent post we've seen
  const intervalRef = useRef(null);

  // ── Initial load ─────────────────────────────────────────────────────────────
  const loadFeed = useCallback(async (p = 1, append = false) => {
    try {
      if (p === 1) setLoading(true); else setLoadMore(true);
      const res = await getFeed({ page: p, limit: 15 });
      setPosts(prev => append ? [...prev, ...res.data] : res.data);
      setPage(res.page);
      setPages(res.pages);
      setNewCount(0);
      // Track the newest post id so polling can detect new ones
      if (res.data.length > 0) latestIdRef.current = res.data[0]._id;
    } catch (err) {
      toast.error(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
      setLoadMore(false);
    }
  }, []);

  useEffect(() => { loadFeed(1); }, [loadFeed]);

  // ── Silent background polling — checks for new posts every 10s ───────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await getFeed({ page: 1, limit: 5 });
        if (!res.data?.length) return;
        const newestId = res.data[0]._id;
        if (latestIdRef.current && newestId !== latestIdRef.current) {
          // Count how many new posts appeared at the top
          const knownIds = new Set(posts.map(p => p._id));
          const brandNew = res.data.filter(p => !knownIds.has(p._id));
          if (brandNew.length > 0) {
            setNewCount(c => c + brandNew.length);
          }
        }
      } catch { /* silent — don't show error for background poll */ }
    };

    intervalRef.current = setInterval(poll, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [posts]);

  // ── Infinite scroll observer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < pages && !loadMore) {
        loadFeed(page + 1, true);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [page, pages, loadMore, loadFeed]);

  const handleDeleted = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleEdit    = (post) => { setEditPost(post); setShowCreate(true); };

  // Load fresh feed and dismiss the "new posts" banner
  const handleShowNew = () => { setNewCount(0); loadFeed(1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)' }}>
              <FiRss style={{ color: '#3b82f6', width: 18, height: 18 }} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: txt }}>Posts</h1>
              <p className="text-xs" style={{ color: txtSub }}>Share ideas with the Lihiket community</p>
            </div>
          </div>
          <button onClick={() => loadFeed(1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-70"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb' }}>
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              style={{ color: txtSub }} />
          </button>
        </div>

        {/* ── "New posts" banner ── */}
        <AnimatePresence>
          {newCount > 0 && (
            <motion.button
              onClick={handleShowNew}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                         text-sm font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                       boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
              <FiArrowUp className="w-4 h-4" />
              {newCount} new post{newCount !== 1 ? 's' : ''} — tap to refresh
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Create post prompt ── */}
        <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer group transition"
          style={{ background: cardBg, border: `1px solid ${bd}` }}
          onClick={() => { setEditPost(null); setShowCreate(true); }}>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
            {user?.profilePicture
              ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white font-black text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>}
          </div>
          <div className="flex-1 rounded-2xl px-4 py-2.5 text-sm"
            style={{ background: inputBg,
                     border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                     color: dark ? '#475569' : '#9ca3af' }}>
            What's on your mind, {user?.firstName}?
          </div>
          <div className="flex gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                            hover:opacity-80 transition"
              style={{ background: dark ? 'rgba(16,185,129,0.12)' : '#ecfdf5', color: '#10b981' }}>
              <FiImage className="w-3.5 h-3.5" /> Photo
            </span>
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                            hover:opacity-80 transition"
              style={{ background: dark ? 'rgba(59,130,246,0.12)' : '#eff6ff', color: '#3b82f6' }}>
              <FiEdit3 className="w-3.5 h-3.5" /> Post
            </span>
          </div>
        </div>

        {/* ── Feed ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16" style={{ color: txtSub }}>
            <FiRss className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-lg">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share something!</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
              <FiPlus className="w-4 h-4" /> Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.id || user?._id}
                onDeleted={handleDeleted}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="h-4 flex justify-center">
          {loadMore && <FiLoader className="w-5 h-5 animate-spin" style={{ color: '#3b82f6' }} />}
        </div>
      </div>

      {/* ── Floating create button (mobile) ── */}
      <button
        onClick={() => { setEditPost(null); setShowCreate(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center
                   shadow-2xl text-white z-30 sm:hidden transition hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                 boxShadow: '0 4px 24px rgba(59,130,246,0.5)' }}>
        <FiPlus className="w-6 h-6" />
      </button>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCreate && (
          <CreatePostModal
            editPost={editPost}
            onClose={() => { setShowCreate(false); setEditPost(null); }}
            onCreated={() => loadFeed(1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
