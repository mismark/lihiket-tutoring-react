import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiYoutube, FiActivity } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  // Hide footer on auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/verify-otp', '/set-new-password', '/pending-approval'];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden text-white dark:text-slate-100">
      {/* Animated Gradient Background - Light Mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 opacity-80 dark:opacity-60 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}></div>
      
      {/* Secondary Gradient Layer - Light Mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 opacity-60 dark:opacity-40 mix-blend-multiply animate-gradient-shift" style={{ backgroundSize: '200% 200%', animationDelay: '2s' }}></div>
      
      {/* Dark Mode Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 dark:block hidden"></div>
      
      {/* Animated Shapes - Floating Bubbles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-5 w-24 h-24 bg-pink-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-400 rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-purple-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
      
      {/* Animated Glow Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      
      {/* Content Wrapper - Relative positioning */}
      <div className="relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold transform group-hover:scale-110 transition-transform duration-300 animate-bounce">
                <span>L</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">Lihiket</h3>
                <p className="text-xs text-white/70">Tutoring Platform</p>
              </div>
            </Link>
            <p className="text-sm text-white/80 mt-2">
              Connecting students with expert tutors for personalized learning experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/90 hover:text-yellow-300 hover:translate-x-1 transition-all inline-block">
                  🏠 Home
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm text-white/90 hover:text-cyan-300 hover:translate-x-1 transition-all inline-block">
                  ⭐ Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-white/90 hover:text-pink-300 hover:translate-x-1 transition-all inline-block">
                  💰 Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-white/90 hover:text-purple-300 hover:translate-x-1 transition-all inline-block">
                  ❓ FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-sm text-white/90 hover:text-yellow-300 hover:translate-x-1 transition-all inline-block">
                  👥 About Us
                </a>
              </li>
              <li>
                <a href="#blog" className="text-sm text-white/90 hover:text-cyan-300 hover:translate-x-1 transition-all inline-block">
                  📝 Blog
                </a>
              </li>
              <li>
                <a href="#careers" className="text-sm text-white/90 hover:text-pink-300 hover:translate-x-1 transition-all inline-block">
                  🎯 Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-white/90 hover:text-purple-300 hover:translate-x-1 transition-all inline-block">
                  📧 Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></span>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 group">
                <FiMail className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0 group-hover:animate-bounce" />
                <a href="mailto:info@lihiket.com" className="text-sm text-white/90 hover:text-yellow-300 transition-colors">
                  info@lihiket.com
                </a>
              </li>
              <li className="flex items-start gap-2 group">
                <FiPhone className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0 group-hover:animate-bounce" />
                <a href="tel:+251918854070" className="text-sm text-white/90 hover:text-cyan-300 transition-colors">
                  +251 918854070
                </a>
              </li>
              <li className="flex items-start gap-2 group">
                <FiMapPin className="w-4 h-4 mt-0.5 text-pink-400 flex-shrink-0 group-hover:animate-bounce" />
                <span className="text-sm text-white/90">Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-white/80">
            © {currentYear} <span className="font-bold text-yellow-300">Lihiket</span>. All rights reserved. 🎓
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#facebook"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-500 text-white flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12 backdrop-blur-sm"
              aria-label="Facebook"
            >
              <FiFacebook className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-cyan-400 text-white flex items-center justify-center transition-all transform hover:scale-110 hover:-rotate-12 backdrop-blur-sm"
              aria-label="Twitter"
            >
              <FiTwitter className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/mekuanit-misganaw-b0aa16384/"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-700 text-white flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12 backdrop-blur-sm"
              aria-label="LinkedIn"
            >
              <FiLinkedin className="w-4 h-4" />
            </a>
            <a
              href="#instagram"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-pink-500 text-white flex items-center justify-center transition-all transform hover:scale-110 hover:-rotate-12 backdrop-blur-sm"
              aria-label="Instagram"
            >
              <FiInstagram className="w-4 h-4" />
            </a>

            <a
              href="https://t.me/mismarkol"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-500 text-white flex items-center justify-center transition-all transform hover:scale-110 hover:-rotate-12 backdrop-blur-sm"
              aria-label="Telegram"
            >
              <FiActivity className="w-4 h-4" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm">
            <a href="#privacy" className="text-white/80 hover:text-yellow-300 transition-colors">
              🔒 Privacy
            </a>
            <span className="text-white/50">•</span>
            <a href="#terms" className="text-white/80 hover:text-cyan-300 transition-colors">
              📋 Terms
            </a>
          </div>
        </div>
      </div>
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute bottom-5 left-5 text-4xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>🎓</div>
      <div className="absolute top-1/4 right-10 text-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>📚</div>
      <div className="absolute bottom-1/3 right-5 text-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>✨</div>
    </footer>
  );
}
