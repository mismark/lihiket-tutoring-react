import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiClock, FiTag, FiArrowRight, FiBookOpen } from 'react-icons/fi';

const POSTS = [
  {
    slug: 'why-online-tutoring-works',
    tag: 'Learning',
    tagColor: '#10b981',
    title: 'Why Online Tutoring Works — and How to Get the Most From It',
    excerpt: 'Online tutoring has transformed how Ethiopian students access quality education. Here\'s what the research says and how to maximize your sessions.',
    author: 'Lihiket Team',
    date: 'September 28, 2026',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop&auto=format',
    featured: true,
  },
  {
    slug: 'how-to-prepare-ethiopian-university-entrance',
    tag: 'Exams',
    tagColor: '#3b82f6',
    title: 'A Complete Guide to Preparing for the Ethiopian University Entrance Exam',
    excerpt: 'The EUEE is one of the most important milestones for Ethiopian high school students. Here\'s a proven study strategy to help you score higher.',
    author: 'Academic Team',
    date: 'September 15, 2026',
    readTime: '8 min read',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&auto=format',
    featured: false,
  },
  {
    slug: 'teachers-guide-creating-effective-live-classes',
    tag: 'For Teachers',
    tagColor: '#8b5cf6',
    title: 'A Teacher\'s Guide to Running Effective Live Classes on Lihiket',
    excerpt: 'From setting up your session to keeping students engaged, here are practical tips every Lihiket teacher should know.',
    author: 'Mekuanit Misganaw',
    date: 'September 3, 2026',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=450&fit=crop&auto=format',
    featured: false,
  },
  {
    slug: 'benefits-of-home-tutoring',
    tag: 'Home Tutoring',
    tagColor: '#f59e0b',
    title: 'The Benefits of One-on-One Home Tutoring for School-Age Children',
    excerpt: 'Personalized attention, flexible scheduling, and familiar surroundings — home tutoring offers advantages that group classes can\'t replicate.',
    author: 'Lihiket Team',
    date: 'August 20, 2026',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=450&fit=crop&auto=format',
    featured: false,
  },
  {
    slug: 'study-habits-that-actually-work',
    tag: 'Learning',
    tagColor: '#10b981',
    title: '7 Study Habits That Actually Work — Backed by Science',
    excerpt: 'Cramming the night before rarely works. These evidence-based techniques will help you retain more and study smarter, not harder.',
    author: 'Academic Team',
    date: 'August 8, 2026',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop&auto=format',
    featured: false,
  },
  {
    slug: 'lihiket-certificates-why-they-matter',
    tag: 'Certificates',
    tagColor: '#ec4899',
    title: 'Lihiket Certificates: What They Mean and Why They Matter',
    excerpt: 'Learn how Lihiket\'s verified certificates work, what they cover, and how students are using them to stand out in school and job applications.',
    author: 'Mekuanit Misganaw',
    date: 'July 25, 2026',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=450&fit=crop&auto=format',
    featured: false,
  },
];

const ALL_TAGS = ['All', ...Array.from(new Set(POSTS.map(p => p.tag)))];

function PostCard({ post, delay, large }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden group flex flex-col ${large ? 'lg:flex-row' : ''}`}
      style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity:0, y:30 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.2 }}
      transition={{ duration:0.55, delay }}
      whileHover={{ borderColor:'rgba(255,255,255,0.14)', y:-3 }}
    >
      <div className={`overflow-hidden flex-shrink-0 ${large ? 'lg:w-1/2' : 'aspect-video w-full'}`}
        style={large ? { height:280 } : {}}>
        <img src={post.img} alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          style={{ filter:'brightness(0.85)' }}
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background:`${post.tagColor}18`, border:`1px solid ${post.tagColor}30`, color:post.tagColor }}>
            <FiTag className="inline w-3 h-3 mr-1" />{post.tag}
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color:'#64748b' }}>
            <FiClock className="w-3 h-3" />{post.readTime}
          </span>
        </div>
        <h3 className={`font-black text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors ${large ? 'text-2xl' : 'text-base'}`}>
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color:'#94a3b8' }}>{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-xs font-semibold text-white">{post.author}</p>
            <p className="text-xs" style={{ color:'#64748b' }}>{post.date}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color:'#34d399' }}>
            Read more <FiArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BlogPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [activeTag, setActiveTag] = useState('All');

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured && (activeTag === 'All' || p.tag === activeTag));

  return (
    <div style={{ background:bg, color:txt, minHeight:'100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'5%', left:'5%', width:480, height:480, borderRadius:'50%', background:'rgba(16,185,129,0.05)', filter:'blur(80px)' }} />
          <div style={{ position:'absolute', bottom:'0', right:'5%', width:380, height:380, borderRadius:'50%', background:'rgba(59,130,246,0.05)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            <FiBookOpen className="w-3.5 h-3.5" /> The Lihiket Blog
          </motion.div>
          <motion.h1
            className="font-black leading-tight mb-4"
            style={{ fontSize:'clamp(2.4rem,6vw,4rem)', color:txt }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            Insights for{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              learners &amp; teachers
            </span>
          </motion.h1>
          <motion.p className="text-lg leading-relaxed" style={{ color:txtSub }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            Tips, guides, and news from the Lihiket team to help you study smarter and teach better.
          </motion.p>
          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color:'#34d399' }}>Blog</span>
          </motion.div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────────────── */}
      {featured && (
        <section style={{ padding:'2rem 1rem 4rem', borderTop:`1px solid ${bdSect}` }}>
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color:'#64748b' }}>Featured Article</p>
            <PostCard post={featured} delay={0} large />
          </div>
        </section>
      )}

      {/* ── All posts ────────────────────────────────────────────────────────── */}
      <section style={{ padding:'2rem 1rem 7rem', borderTop:`1px solid ${bdSect}` }}>
        <div className="max-w-5xl mx-auto">
          {/* Tag filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {ALL_TAGS.map(tag => {
              const post = POSTS.find(p => p.tag === tag);
              const color = post ? post.tagColor : '#10b981';
              return (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: activeTag === tag ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border: activeTag === tag ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
                    color: activeTag === tag ? color : '#64748b',
                  }}>
                  {tag}
                </button>
              );
            })}
          </div>

          {rest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => <PostCard key={post.slug} post={post} delay={i * 0.07} large={false} />)}
            </div>
          ) : (
            <p className="text-center py-16" style={{ color:'#64748b' }}>No posts in this category yet. Check back soon.</p>
          )}
        </div>
      </section>

      {/* ── Newsletter / CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1rem', background:bgAlt, borderTop:`1px solid ${bdSect}` }}>
        <motion.div className="max-w-xl mx-auto text-center p-10 rounded-3xl"
          style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(59,130,246,0.07))', border:'1px solid rgba(16,185,129,0.18)' }}
          initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.4 }} transition={{ duration:0.7 }}>
          <h2 className="text-2xl font-black text-white mb-3">Stay in the loop</h2>
          <p className="text-sm mb-6" style={{ color:'#94a3b8' }}>
            Get the latest articles, tips, and Lihiket news delivered to your inbox.
          </p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input type="email" placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#f1f5f9' }}
            />
            <motion.button
              className="px-6 py-3 rounded-xl font-bold text-sm text-white flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
              Subscribe
            </motion.button>
          </div>
          <p className="text-xs mt-3" style={{ color:'#475569' }}>No spam. Unsubscribe anytime.</p>
        </motion.div>
      </section>
    </div>
  );
}
