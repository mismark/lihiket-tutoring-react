import { Link, useLocation } from 'react-router-dom';
import {
  FiMail, FiPhone, FiMapPin,
  FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiSend,
  FiBookOpen,
} from 'react-icons/fi';

const AUTH_PAGES = [
  '/login', '/register', '/forgot-password',
  '/verify-otp', '/set-new-password', '/pending-approval',
];

const INNER_PAGES = [
  '/dashboard', '/subjects', '/my-subjects', '/courses',
  '/lessons', '/assignments', '/quizzes', '/exams',
  '/live-classes', '/documents', '/notifications',
  '/search', '/profile', '/payment', '/users',
  '/chats', '/question-bank',
];

export default function Footer() {
  const location = useLocation();
  const path     = location.pathname;

  // Hide on auth pages entirely
  if (AUTH_PAGES.includes(path)) return null;

  // Minimal footer on authenticated inner pages
  const isInner = INNER_PAGES.some(p => path.startsWith(p));

  const currentYear = new Date().getFullYear();

  if (isInner) {
    return (
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(2,8,23,0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-slate-600">
            © {currentYear} Lihiket. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for public/marketing pages
  return (
    <footer style={{ background: 'rgba(2,8,23,0.98)', borderTop: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                <FiBookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">
                Lihiket<span style={{ color: '#34d399' }}>.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              A professional online tutoring platform connecting students with expert teachers for personalized learning.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2 mt-5">
              {[
                { href: '#facebook',  icon: FiFacebook,  label: 'Facebook'  },
                { href: '#twitter',   icon: FiTwitter,   label: 'Twitter'   },
                { href: 'https://www.linkedin.com/in/mekuanit-misganaw-b0aa16384/', icon: FiLinkedin, label: 'LinkedIn' },
                { href: '#instagram', icon: FiInstagram, label: 'Instagram' },
                { href: 'https://t.me/mismarkol', icon: FiSend, label: 'Telegram' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-slate-500 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='linear-gradient(135deg,#10b981,#0d9488)'; e.currentTarget.style.borderColor='transparent'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',     href: '/'         },
                { label: 'Features', href: '#features' },
                { label: 'Pricing',  href: '#pricing'  },
                { label: 'FAQ',      href: '#faq'      },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '#about'   },
                { label: 'Blog',     href: '#blog'    },
                { label: 'Careers',  href: '#careers' },
                { label: 'Contact',  href: '#contact' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@lihiket.com"
                  className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <FiMail className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  info@lihiket.com
                </a>
              </li>
              <li>
                <a href="tel:+251918854070"
                  className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <FiPhone className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  +251 918 854 070
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <FiMapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs text-slate-500">
            © {currentYear} <span className="text-slate-400 font-medium">Lihiket</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span aria-hidden="true">·</span>
            <a href="#terms"   className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
