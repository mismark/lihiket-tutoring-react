import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiFileText } from 'react-icons/fi';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By registering for or using Lihiket ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Platform. These terms apply to all users including students, teachers, parents, and administrators.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 13 years old to use Lihiket. Users under 18 must have parental or guardian consent. By using the Platform, you confirm that you meet these requirements and that the information you provide is accurate.`,
  },
  {
    title: '3. Accounts',
    body: `You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at info@lihiket.com if you suspect unauthorized access. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Acceptable Use',
    body: `You agree not to use Lihiket to post harmful, offensive, or illegal content; attempt to gain unauthorized access to other accounts or systems; disrupt the platform's operation; share your account with others; or engage in academic dishonesty (e.g., cheating on assessments). Violations may result in immediate account suspension.`,
  },
  {
    title: '5. Content Ownership',
    body: `Teachers and content creators retain ownership of the materials they upload. By uploading content to Lihiket, you grant us a non-exclusive license to display, distribute, and use that content within the platform for educational purposes. You are responsible for ensuring you have the rights to any content you upload.`,
  },
  {
    title: '6. Payments and Refunds',
    body: `Paid subscriptions are billed in Ethiopian Birr (ETB) on a monthly or annual basis. Refunds may be issued within 7 days of purchase if you have not consumed a significant portion of the paid features. Refund requests should be submitted to info@lihiket.com with your account details and reason.`,
  },
  {
    title: '7. Certificates',
    body: `Lihiket certificates are issued for completing defined course or exam requirements. They represent your achievement on our platform and are verified digitally. We make no guarantee that external institutions will accept them as formal qualifications, though we work to build recognition.`,
  },
  {
    title: '8. Platform Availability',
    body: `We strive to maintain high availability but cannot guarantee uninterrupted access. The platform may be temporarily unavailable for maintenance, updates, or due to circumstances beyond our control. We will notify users in advance of planned downtime where possible.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `Lihiket is provided "as is." To the fullest extent permitted by Ethiopian law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, missed assessments, or reliance on course content.`,
  },
  {
    title: '10. Changes to Terms',
    body: `We may update these Terms from time to time. We will notify you of material changes via email or an in-app notice at least 14 days in advance. Continued use of Lihiket after the effective date of changes constitutes acceptance.`,
  },
  {
    title: '11. Governing Law',
    body: `These Terms are governed by and construed in accordance with the laws of the Federal Democratic Republic of Ethiopia. Any disputes shall be resolved in the courts of Addis Ababa, Ethiopia.`,
  },
  {
    title: '12. Contact',
    body: `For questions about these Terms, contact us at info@lihiket.com or visit our Contact page.`,
  },
];

export default function TermsPage() {
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
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          >
            <FiFileText style={{ color: '#818cf8', width: 26, height: 26 }} />
          </motion.div>
          <motion.h1
            className="font-black mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: txt }}
            initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p className="text-base leading-relaxed mb-4" style={{ color: txtSub }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Last updated: October 2026
          </motion.p>
          <motion.p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: txtSub }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
            Please read these terms carefully before using Lihiket. By using the platform you agree to be bound by them.
          </motion.p>
          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color: '#64748b' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#34d399' }}>Terms of Service</span>
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
