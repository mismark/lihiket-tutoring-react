import { Link } from 'react-router-dom';
import { FiVideo, FiClock, FiFileText, FiAward, FiCreditCard, FiUsers, FiBookOpen, FiCheckCircle, FiPlayCircle, FiTrendingUp, FiStar } from 'react-icons/fi';

const FEATURES = [
  { icon: FiVideo, title: 'Live Classes', description: 'Interactive real-time sessions with experienced teachers' },
  { icon: FiClock, title: 'Timed Exams', description: 'Practice with timed tests to improve your speed and accuracy' },
  { icon: FiFileText, title: 'Assignments', description: 'Regular homework and assignments to track progress' },
  { icon: FiAward, title: 'Certificates', description: 'Earn certificates upon course completion' },
  { icon: FiCreditCard, title: 'Secure Payments', description: 'Safe and convenient payment options' },
  { icon: FiUsers, title: 'Expert Tutors', description: 'Learn from qualified and experienced educators' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create Account', description: 'Sign up as a student, teacher, or parent in minutes' },
  { step: '2', title: 'Choose Your Path', description: 'Browse courses and select subjects that match your goals' },
  { step: '3', title: 'Start Learning', description: 'Join live classes, access materials, and track progress' },
];

const STATS = [
  { value: '500+', label: 'Students' },
  { value: '50+', label: 'Expert Tutors' },
  { value: '100+', label: 'Courses' },
  { value: '95%', label: 'Success Rate' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white px-4 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-8 border border-white/20">
            <FiStar className="w-4 h-4 text-yellow-300" />
            <span>Trusted by 500+ students</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Learn Smarter,
            <span className="block text-blue-200">Teach Better</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            A professional online tutoring platform connecting students with expert teachers. 
            Transform your learning journey with live classes, interactive tools, and personalized attention.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border-2 border-white/70 text-white font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-1"
            >
              Sign In
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {['Live Classes', 'Timed Exams', 'Assignments', 'Certificates'].map((f) => (
              <span
                key={f}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white/90 font-medium border border-white/20"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our platform provides comprehensive tools and features to enhance your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 hover:-translate-y-1 hover:rounded-3xl border border-slate-200 dark:border-slate-700"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rounded-2xl transition-all duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                About Lihiket Tutoring
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Lihiket Tutoring is a comprehensive online learning platform designed to bridge the gap between students and quality education. We believe that every student deserves access to excellent teaching resources and personalized attention.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Our platform brings together experienced teachers, interactive learning tools, and a supportive community to create an environment where learning thrives. Whether you're preparing for exams, learning new skills, or seeking academic support, we're here to help you achieve your goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  <span>Qualified Teachers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  <span>Interactive Learning</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  <span>Progress Tracking</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <FiBookOpen className="w-8 h-8 mb-3" />
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-blue-200 text-sm">Courses Available</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <FiVideo className="w-8 h-8 mb-3" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-blue-200 text-sm">Live Sessions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <FiTrendingUp className="w-8 h-8 mb-3" />
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-blue-200 text-sm">Success Rate</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <FiUsers className="w-8 h-8 mb-3" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-blue-200 text-sm">Active Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already achieving their academic goals with Lihiket Tutoring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all duration-300 hover:-translate-y-1 shadow-xl"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
