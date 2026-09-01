import { Link } from 'react-router-dom';
import {
  FiVideo, FiClock, FiFileText, FiAward, FiCreditCard,
  FiUsers, FiBookOpen, FiCheckCircle, FiTrendingUp,
  FiArrowRight, FiStar, FiZap, FiShield,
} from 'react-icons/fi';

const FEATURES = [
  { icon: FiVideo,      title: 'Live Classes',     description: 'Join real-time sessions with experienced teachers and ask questions instantly.',   color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { icon: FiClock,      title: 'Timed Exams',      description: 'Practice under exam conditions with auto-graded timed tests and instant results.',  color: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' },
  { icon: FiFileText,   title: 'Assignments',       description: 'Complete homework, receive teacher feedback, and track improvement over time.',    color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { icon: FiAward,      title: 'Certificates',      description: 'Earn verified certificates upon completing courses to showcase your skills.',       color: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
  { icon: FiCreditCard, title: 'Secure Payments',   description: 'Pay safely via Chapa, mobile money, or bank transfer — fully encrypted.',          color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' },
  { icon: FiUsers,      title: 'Expert Tutors',     description: 'Learn from qualified, vetted educators with years of teaching experience.',         color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Account',   description: 'Sign up as a student, teacher, or parent in under two minutes.' },
  { step: '02', title: 'Choose Subjects',  description: 'Browse available subjects, preview teachers, and enroll instantly.' },
  { step: '03', title: 'Start Learning',   description: 'Join live classes, take quizzes, submit assignments, and track progress.' },
];

const STATS = [
  { value: '500+', label: 'Active Students',  icon: FiUsers },
  { value: '50+',  label: 'Expert Tutors',    icon: FiStar },
  { value: '100+', label: 'Courses',          icon: FiBookOpen },
  { value: '95%',  label: 'Success Rate',     icon: FiTrendingUp },
];

const TRUST = [
  { icon: FiShield,    title: 'Secure & Private',   desc: 'End-to-end encryption. Your data never leaves our servers.' },
  { icon: FiZap,       title: 'Always Available',   desc: 'Access lessons, materials, and recordings 24/7 on any device.' },
  { icon: FiCheckCircle, title: 'Verified Teachers', desc: 'Every tutor is background-checked and credentials-verified.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 lg:pt-32 lg:pb-28">
        {/* subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] pointer-events-none" />
        {/* glow blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-8">
            <FiStar className="w-4 h-4" />
            Trusted by 500+ students across Ethiopia
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Learn Smarter,
            <span className="block text-emerald-500 mt-1">Achieve More</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A professional online tutoring platform connecting Ethiopian students with expert teachers.
            Live classes, smart assessments, and personalized feedback — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base hover:bg-slate-700 dark:hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 shadow-xl shadow-slate-900/20">
              Get Started Free <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-base hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
              Sign In
            </Link>
          </div>

          {/* feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Live Classes', 'Timed Exams', 'Assignments', 'Certificates', 'Progress Tracking'].map(f => (
              <span key={f}
                className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="px-4 py-16 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-3 mx-auto">
                <s.icon className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools designed to make learning effective, engaging, and measurable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              No complicated setup. From sign-up to your first lesson in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[33%] right-[33%] h-px bg-slate-200 dark:bg-slate-700" />

            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mx-auto mb-5 relative z-10">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">About Us</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
              Built for Ethiopian Students & Teachers
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Lihiket Tutoring bridges the gap between students and quality education in Ethiopia.
              We believe every student deserves access to excellent teaching, regardless of location.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Our platform brings together verified teachers, interactive tools, and a supportive
              community — making it possible to learn, grow, and achieve academic goals from anywhere.
            </p>
            <div className="space-y-3">
              {['Qualified, vetted teachers', 'Interactive live sessions', 'Real-time progress tracking', 'Multi-method secure payments'].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/register"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-lg">
              Join Lihiket Today <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FiBookOpen,   value: '100+', label: 'Courses Available',  color: 'from-emerald-500 to-teal-600' },
              { icon: FiVideo,      value: '24/7',  label: 'Live Sessions',      color: 'from-violet-500 to-indigo-600' },
              { icon: FiTrendingUp, value: '95%',   label: 'Success Rate',       color: 'from-amber-500 to-orange-600' },
              { icon: FiUsers,      value: '500+',  label: 'Active Students',    color: 'from-rose-500 to-pink-600' },
            ].map((c, i) => (
              <div key={i}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{c.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST.map((t, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center flex-shrink-0">
                <t.icon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-8">
            <FiZap className="w-4 h-4" />
            Free to get started
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            Ready to Start Your<br />Learning Journey?
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
            Join thousands of students already achieving their goals with Lihiket Tutoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base hover:bg-slate-700 dark:hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-xl">
              Create Free Account <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-base hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
