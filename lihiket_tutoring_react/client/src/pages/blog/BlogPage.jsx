import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiTag, FiArrowRight, FiBookOpen } from 'react-icons/fi';

const POSTS = [
  { slug:'why-online-tutoring-works',                  tag:'Learning',       tagColor:'#10b981', featured:true,
    title:'Why Online Tutoring Works — and How to Get the Most From It',
    excerpt:"Online tutoring has transformed how Ethiopian students access quality education. Here's what the research says and how to maximize your sessions.",
    author:'Lihiket Team', date:'September 28, 2026', readTime:'5 min read',
    img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop&auto=format' },
  { slug:'how-to-prepare-ethiopian-university-entrance', tag:'Exams',         tagColor:'#3b82f6', featured:false,
    title:'A Complete Guide to Preparing for the Ethiopian University Entrance Exam',
    excerpt:'The EUEE is one of the most important milestones for Ethiopian high school students. Here is a proven study strategy to help you score higher.',
    author:'Academic Team', date:'September 15, 2026', readTime:'8 min read',
    img:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&auto=format' },
  { slug:'teachers-guide-creating-effective-live-classes', tag:'For Teachers', tagColor:'#8b5cf6', featured:false,
    title:"A Teacher's Guide to Running Effective Live Classes on Lihiket",
    excerpt:"From setting up your session to keeping students engaged, here are practical tips every Lihiket teacher should know.",
    author:'Mekuanit Misganaw', date:'September 3, 2026', readTime:'6 min read',
    img:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=450&fit=crop&auto=format' },
  { slug:'benefits-of-home-tutoring',                  tag:'Home Tutoring',  tagColor:'#f59e0b', featured:false,
    title:'The Benefits of One-on-One Home Tutoring for School-Age Children',
    excerpt:"Personalized attention, flexible scheduling, and familiar surroundings — home tutoring offers advantages that group classes can't replicate.",
    author:'Lihiket Team', date:'August 20, 2026', readTime:'4 min read',
    img:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=450&fit=crop&auto=format' },
  { slug:'study-habits-that-actually-work',             tag:'Learning',       tagColor:'#10b981', featured:false,
    title:'7 Study Habits That Actually Work — Backed by Science',
    excerpt:'Cramming the night before rarely works. These evidence-based techniques will help you retain more and study smarter, not harder.',
    author:'Academic Team', date:'August 8, 2026', readTime:'6 min read',
    img:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop&auto=format' },
  { slug:'lihiket-certificates-why-they-matter',        tag:'Certificates',   tagColor:'#ec4899', featured:false,
    title:'Lihiket Certificates: What They Mean and Why They Matter',
    excerpt:"Learn how Lihiket's verified certificates work and how students are using them to stand out in school and job applications.",
    author:'Mekuanit Misganaw', date:'July 25, 2026', readTime:'4 min read',
    img:'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=450&fit=crop&auto=format' },
];

const ALL_TAGS = ['All', ...Array.from(new Set(POSTS.map(p => p.tag)))];

function PostCard({ post, delay, large }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden group flex flex-col ${large ? 'lg:flex-row' : ''}`}
      style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.15 }}
      transition={{ duration:0.55, delay }}
      whileHover={{ borderColor:'rgba(255,255,255,0.16)', y:-4, boxShadow:`0 0 40px ${post.tagColor}22` }}>

      <div className={`overflow-hidden flex-shrink-0 relative ${large ? 'lg:w-1/2' : 'aspect-video w-full'}`}
        style={large ? { height:280 } : {}}>
        <img src={post.img} alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(2,8,23,0.7) 0%,transparent 60%)' }} />
        {/* Tag chip on image */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1"
            style={{ background:`${post.tagColor}22`, border:`1px solid ${post.tagColor}50`, color:post.tagColor }}>
            <FiTag className="w-3 h-3" />{post.tag}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs flex items-center gap-1 text-slate-500">
            <FiClock className="w-3 h-3" />{post.readTime}
          </span>
        </div>
        <h3 className={`font-black text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors ${large ? 'text-2xl' : 'text-base'}`}>
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed flex-1 mb-4 text-slate-400">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto pt-3"
          style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs font-semibold text-white">{post.author}</p>
            <p className="text-xs text-slate-500">{post.date}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            Read more <FiArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('All');
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured && (activeTag === 'All' || p.tag === activeTag));

  return (
    <div style={{ background:'linear-gradient(135deg,#020817 0%,#0a0f1e 50%,#020817 100%)', minHeight:'100vh' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position:'absolute', top:'-10%', left:'-5%', width:560, height:560, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)', filter:'blur(40px)' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)', filter:'blur(40px)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <FiBookOpen className="w-3.5 h-3.5" /> The Lihiket Blog
          </motion.div>

          <motion.h1 className="font-black leading-tight mb-4 text-white"
            style={{ fontSize:'clamp(2.2rem,6vw,3.8rem)' }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}>
            Insights for{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              learners &amp; teachers
            </span>
          </motion.h1>

          <motion.p className="text-lg leading-relaxed text-slate-400"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            Tips, guides, and news from the Lihiket team to help you study smarter and teach better.
          </motion.p>

          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6 text-slate-500"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span><span className="text-emerald-400">Blog</span>
          </motion.div>
        </div>
      </section>

      {/* ── Featured ── */}
      {featured && (
        <section className="px-4 pb-10" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-5xl mx-auto pt-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-5 text-slate-500">Featured Article</p>
            <PostCard post={featured} delay={0} large />
          </div>
        </section>
      )}

      {/* ── All posts ── */}
      <section className="px-4 pb-24" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto pt-10">
          {/* Tag filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {ALL_TAGS.map(tag => {
              const post = POSTS.find(p => p.tag === tag);
              const color = post ? post.tagColor : '#10b981';
              const active = activeTag === tag;
              return (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: active ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border:     active ? `1px solid ${color}45` : '1px solid rgba(255,255,255,0.07)',
                    color:      active ? color : '#64748b',
                  }}>
                  {tag}
                </button>
              );
            })}
          </div>

          {rest.length > 0
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((post, i) => <PostCard key={post.slug} post={post} delay={i*0.07} large={false} />)}
              </div>
            : <p className="text-center py-16 text-slate-500">No posts in this category yet. Check back soon.</p>}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="px-4 pb-24" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <motion.div className="max-w-xl mx-auto text-center p-10 rounded-3xl"
          style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.08))', border:'1px solid rgba(16,185,129,0.2)', boxShadow:'0 0 50px rgba(16,185,129,0.07)' }}
          initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}>
          <h2 className="text-2xl font-black text-white mb-3">Stay in the loop</h2>
          <p className="text-sm mb-6 text-slate-400">Get the latest articles, tips, and Lihiket news delivered to your inbox.</p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input type="email" placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none text-white placeholder-slate-500"
              style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }} />
            <motion.button
              className="px-6 py-3 rounded-xl font-bold text-sm text-white flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 20px rgba(16,185,129,0.35)' }}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
              Subscribe
            </motion.button>
          </div>
          <p className="text-xs mt-3 text-slate-600">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </section>
    </div>
  );
}
