import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiShield } from 'react-icons/fi';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly — such as your name, email address, and role (student, teacher, or parent) — when you create an account. We also collect usage data such as pages visited, features used, quiz scores, and session attendance to improve the platform and track your learning progress.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to operate and improve Lihiket, personalize your learning experience, send important notifications (class reminders, assignment deadlines, results), process payments securely, and communicate with you about your account or our services. We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Data Sharing',
    body: `We share data only as necessary to operate the platform — for example, sharing your progress with teachers enrolled in your subjects, or sharing your name with a home tutor you have requested. We may share data with trusted service providers (payment processors, hosting providers) under strict confidentiality agreements.`,
  },
  {
    title: '4. Data Security',
    body: `We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and role-based access control to protect your data. No system is perfectly secure, and we cannot guarantee absolute security, but we take your privacy seriously and continuously review our practices.`,
  },
  {
    title: '5. Cookies',
    body: `Lihiket uses cookies and similar technologies to keep you logged in, remember your preferences, and understand how the platform is used. You can disable cookies in your browser settings, though this may affect some functionality.`,
  },
  {
    title: '6. Children\'s Privacy',
    body: `Lihiket is designed to be used by students of all ages under parental or institutional supervision. If a child under 13 registers, we request parental consent. Parents may contact us to review, update, or delete their child's data at any time.`,
  },
  {
    title: '7. Your Rights',
    body: `You have the right to access, correct, or delete your personal data at any time by visiting your Profile settings or contacting us at info@lihiket.com. You may also request a copy of all data we hold about you.`,
  },
  {
    title: '8. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we make significant changes we will notify you via email or an in-app notice. Continued use of Lihiket after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact Us',
    body: `If you have any questions about this Privacy Policy or how your data is handled, please contact us at info@lihiket.com or write to us at our office in Addis Ababa, Ethiopia.`,
  },
];

export default function PrivacyPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const bgCard = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const bdCard = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background: bg, color: txt, minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4"
        style={{ background: bgAlt, borderBottom: `1px solid ${bdSect}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          >
            <FiShield style={{ color: '#34d399', width: 26, height: 26 }} />
          </motion.div>
          <motion.h1
            className="font-black mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: txt }}
            initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p className="text-base leading-relaxed mb-4" style={{ color: txtSub }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Last updated: October 2026
          </motion.p>
          <motion.p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: txtSub }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
            Lihiket is committed to protecting your privacy. This policy explains what data we collect,
            how we use it, and your rights.
          </motion.p>
          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color: '#64748b' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#34d399' }}>Privacy Policy</span>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ padding: '4rem 1rem 7rem' }}>
        <div className="max-w-3xl mx-auto space-y-6">
          {SECTIONS.map(({ title, body }, i) => (
            <motion.div key={title}
              className="p-7 rounded-2xl"
              style={{ background: bgCard, border: `1px solid ${bdCard}` }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            >
              <h2 className="font-bold text-base mb-3" style={{ color: txt }}>{title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: txtSub }}>{body}</p>
            </motion.div>
          ))}

          <p className="text-center text-sm pt-4" style={{ color: '#64748b' }}>
            Questions?{' '}
            <Link to="/contact" className="font-semibold transition-colors" style={{ color: '#34d399' }}>
              Contact us →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
