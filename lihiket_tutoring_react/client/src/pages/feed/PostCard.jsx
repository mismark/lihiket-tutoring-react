import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal,
  FiEdit2, FiTrash2, FiSend, FiCornerDownRight, FiLoader,
  FiX,
} from 'react-icons/fi';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import {
  toggleLike, sharePost, addComment, deleteComment, toggleCommentLike,
  addReply, deleteReply, toggleReplyLike, deletePost,
} from '../../api/post.api';
import toast from 'react-hot-toast';

// ── Avatar helper ─────────────────────────────────────────────────────────────
function Avatar({ pic, name, size = 9 }) {
  const sz = `w-${size} h-${size}`;
  return (
    <div className={`${sz} rounded-full overflow-hidden flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
      {pic
        ? <img src={pic} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-white font-black text-xs">
            {(name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
          </div>}
    </div>
  );
}

// ── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

// ── Reply row ─────────────────────────────────────────────────────────────────
function ReplyRow({ reply, postId, commentId, currentUserId, dark, onDeleted }) {
  const [liked, setLiked] = useState(reply.likes?.some(l => l?.toString() === currentUserId));
  const [likes, setLikes] = useState(reply.likes?.length || 0);

  const txt   = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';

  const handleLike = async () => {
    try {
      const res = await toggleReplyLike(postId, commentId, reply._id);
      setLiked(res.liked); setLikes(res.likeCount);
    } catch {}
  };

  return (
    <div className="flex gap-2.5 ml-10 mt-2">
      <Avatar pic={reply.authorPic} name={reply.authorName} size={7} />
      <div className="flex-1 min-w-0">
        <div className="rounded-xl px-3 py-2 inline-block"
          style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
          <p className="text-xs font-bold" style={{ color: txt }}>{reply.authorName}</p>
          <p className="text-sm mt-0.5 break-words" style={{ color: txt }}>{reply.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <button onClick={handleLike}
            className={`text-xs font-bold transition ${liked ? 'text-red-500' : ''}`}
            style={{ color: liked ? '#ef4444' : txtSub }}>
            ♥ {likes > 0 ? likes : ''} Like
          </button>
          <span className="text-xs" style={{ color: dark ? '#475569' : '#9ca3af' }}>
            {timeAgo(reply.createdAt)}
          </span>
          {reply.author?.userId?.toString() === currentUserId && (
            <button onClick={() => onDeleted(reply._id)}
              className="text-xs text-red-400 hover:text-red-500 transition">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Comment row ───────────────────────────────────────────────────────────────
function CommentRow({ comment, postId, currentUserId, dark, onDeleted, onPostChanged }) {
  const [liked,       setLiked]       = useState(comment.likes?.some(l => l?.toString() === currentUserId));
  const [likes,       setLikes]       = useState(comment.likes?.length || 0);
  const [showReply,   setShowReply]   = useState(false);
  const [replyText,   setReplyText]   = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [sending,     setSending]     = useState(false);

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const inputBg = dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6';

  const handleLike = async () => {
    try {
      const res = await toggleCommentLike(postId, comment._id);
      setLiked(res.liked); setLikes(res.likeCount);
    } catch {}
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await addReply(postId, comment._id, replyText.trim());
      setReplyText('');
      setShowReply(false);
      setShowReplies(true);
      onPostChanged?.();
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const handleDeleteReply = async (rid) => {
    try {
      await deleteReply(postId, comment._id, rid);
      onPostChanged?.();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2.5">
        <Avatar pic={comment.authorPic} name={comment.authorName} size={8} />
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl px-3 py-2.5"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
            <p className="text-xs font-bold" style={{ color: txt }}>{comment.authorName}
              <span className="font-normal ml-1.5 capitalize opacity-60" style={{ color: txtSub }}>
                {comment.authorRole}
              </span>
            </p>
            <p className="text-sm mt-0.5 break-words" style={{ color: txt }}>{comment.text}</p>
          </div>

          <div className="flex items-center gap-4 mt-1 px-1">
            <button onClick={handleLike}
              className="text-xs font-bold transition"
              style={{ color: liked ? '#ef4444' : txtSub }}>
              ♥ {likes > 0 ? likes : ''} Like
            </button>
            <button onClick={() => setShowReply(v => !v)}
              className="text-xs font-bold transition" style={{ color: txtSub }}>
              Reply
            </button>
            {comment.replies?.length > 0 && (
              <button onClick={() => setShowReplies(v => !v)}
                className="text-xs transition" style={{ color: '#3b82f6' }}>
                {showReplies ? 'Hide' : `${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`}
              </button>
            )}
            <span className="text-xs ml-auto" style={{ color: dark ? '#475569' : '#9ca3af' }}>
              {timeAgo(comment.createdAt)}
            </span>
            {comment.author?.userId?.toString() === currentUserId && (
              <button onClick={() => onDeleted(comment._id)}
                className="text-xs text-red-400 hover:text-red-500">Delete</button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="flex gap-2 mt-2 ml-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="Write a reply…"
                className="flex-1 text-sm px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{ background: inputBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: txt }} />
              <button onClick={handleReply} disabled={sending || !replyText.trim()}
                className="px-3 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
                style={{ background: '#3b82f6' }}>
                {sending ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiSend className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Replies list */}
          {showReplies && comment.replies?.map(r => (
            <ReplyRow key={r._id} reply={r} postId={postId} commentId={comment._id}
              currentUserId={currentUserId} dark={dark}
              onDeleted={handleDeleteReply} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main PostCard ──────────────────────────────────────────────────────────────
export default function PostCard({ post: initialPost, currentUserId, onDeleted, onEdit }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [post,        setPost]        = useState(initialPost);
  const [liked,       setLiked]       = useState(initialPost.likes?.some(l => l?.userId?.toString() === currentUserId));
  const [likeCount,   setLikeCount]   = useState(initialPost.likes?.length || 0);
  const [shareCount,  setShareCount]  = useState(initialPost.shareCount || 0);
  const [showMenu,    setShowMenu]    = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sending,     setSending]     = useState(false);
  const [showComments, setShowComments] = useState(false);

  const txt      = dark ? '#f1f5f9' : '#0f172a';
  const txtSub   = dark ? '#94a3b8' : '#475569';
  const bg       = dark ? 'rgba(15,23,42,0.8)' : '#ffffff';
  const bd       = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';

  const isOwner = post.author?.userId?.toString() === currentUserId;

  const handleLike = async () => {
    try {
      const res = await toggleLike(post._id);
      setLiked(res.liked); setLikeCount(res.likeCount);
    } catch {}
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}/feed/${post._id}`);
      toast.success('Link copied!');
    } catch {}
    try {
      const res = await sharePost(post._id);
      setShareCount(res.shareCount);
    } catch {}
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post._id);
      toast.success('Post deleted.');
      onDeleted?.(post._id);
    } catch (err) { toast.error(err.message); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await addComment(post._id, commentText.trim());
      setCommentText('');
      // Refresh post to get updated comments
      const refreshed = await import('../../api/post.api').then(m => m.getPost(post._id));
      setPost(refreshed.data);
      setShowComments(true);
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const handleDeleteComment = async (cid) => {
    try {
      await deleteComment(post._id, cid);
      const refreshed = await import('../../api/post.api').then(m => m.getPost(post._id));
      setPost(refreshed.data);
    } catch (err) { toast.error(err.message); }
  };

  const refreshPost = async () => {
    try {
      const r = await import('../../api/post.api').then(m => m.getPost(post._id));
      setPost(r.data);
    } catch {}
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm"
      style={{ background: bg, border: `1px solid ${bd}` }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar pic={post.authorPic} name={post.authorName} size={10} />
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: txt }}>{post.authorName}</p>
            <p className="text-xs" style={{ color: txtSub }}>
              <span className="capitalize">{post.authorRole}</span> · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10">
            <FiMoreHorizontal className="w-5 h-5" style={{ color: txtSub }} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute right-0 top-full mt-1 rounded-xl shadow-xl z-20 overflow-hidden"
                style={{ background: dark ? '#1e293b' : '#ffffff', border: `1px solid ${bd}`, minWidth: 140 }}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}>
                {isOwner && (
                  <button onClick={() => { setShowMenu(false); onEdit?.(post); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: txt }}>
                    <FiEdit2 className="w-4 h-4" /> Edit
                  </button>
                )}
                {(isOwner || post.authorRole === 'admin') && (
                  <button onClick={() => { setShowMenu(false); handleDeletePost(); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                <button onClick={() => { handleShare(); setShowMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: txt }}>
                  <FiShare2 className="w-4 h-4" /> Copy link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Content ── */}
      {post.text && (
        <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
          style={{ color: txt }}>{post.text}</p>
      )}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" className="w-full max-h-96 object-cover" />
      )}

      {/* ── Stats bar ── */}
      <div className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ color: txtSub, borderTop: `1px solid ${bd}` }}>
        <span>{likeCount > 0 ? `${likeCount} like${likeCount !== 1 ? 's' : ''}` : ''}</span>
        <div className="flex items-center gap-3">
          {post.comments?.length > 0 && (
            <button onClick={() => setShowComments(v => !v)} className="hover:underline">
              {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </button>
          )}
          {shareCount > 0 && <span>{shareCount} share{shareCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center border-t" style={{ borderColor: bd }}>
        {[
          { icon: FiHeart, label: liked ? 'Liked' : 'Like', action: handleLike,
            color: liked ? '#ef4444' : txtSub, fill: liked },
          { icon: FiMessageCircle, label: 'Comment', action: () => setShowComments(v => !v), color: txtSub },
          { icon: FiShare2, label: `Share${shareCount > 0 ? ` (${shareCount})` : ''}`, action: handleShare, color: txtSub },
        ].map(({ icon: Icon, label, action, color, fill }) => (
          <button key={label} onClick={action}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                       hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ color }}>
            <Icon className="w-4 h-4" style={{ fill: fill ? color : 'none' }} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Comments section ── */}
      {showComments && (
        <div className="px-4 pb-4 space-y-1" style={{ borderTop: `1px solid ${bd}` }}>
          <div className="pt-3">
            {post.comments?.map(c => (
              <CommentRow key={c._id} comment={c} postId={post._id}
                currentUserId={currentUserId} dark={dark}
                onDeleted={handleDeleteComment} onPostChanged={refreshPost} />
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-3 pt-2">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
            </div>
            <div className="flex-1 flex gap-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                placeholder="Write a comment…"
                className="flex-1 text-sm px-4 py-2.5 rounded-2xl outline-none
                           focus:ring-2 focus:ring-blue-500/30 transition-all"
                style={{ background: inputBg,
                         border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                         color: txt }} />
              <button onClick={handleComment} disabled={sending || !commentText.trim()}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white
                           disabled:opacity-50 transition flex-shrink-0"
                style={{ background: '#3b82f6' }}>
                {sending
                  ? <FiLoader className="w-4 h-4 animate-spin" />
                  : <FiSend className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
