import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth/AuthContext';
import { useSidebar } from './store/sidebar/SidebarContext';

// Layout
import Header  from './components/layout/Header';
import Footer  from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Auth pages
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage';
import VerifyOTPPage       from './pages/auth/VerifyOTPPage';
import SetNewPasswordPage  from './pages/auth/SetNewPasswordPage';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';

// Main pages
import HomePage from './pages/home/HomePage';

// Dashboard
import AdminDashboard   from './pages/dashboard/AdminDashboard';
import AdminUsers       from './pages/dashboard/AdminUsers';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard  from './pages/dashboard/ParentDashboard';

// Subjects
import AdminSubjects    from './pages/subjects/AdminSubjects';
import TeacherSubjects  from './pages/subjects/TeacherSubjects';
import StudentSubjects  from './pages/subjects/StudentSubjects';

// Classroom
import ClassroomPage    from './pages/courses/classroom/ClassroomPage';
import CourseManagePage from './pages/courses/CourseManagePage';

// Lessons
import LessonsPage from './pages/lessons/LessonsPage';

// File viewer
import FileViewerPage from './pages/viewer/FileViewerPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// Payment
import PaymentVerifyPage  from './pages/payments/PaymentVerifyPage';
import PaymentHistoryPage from './pages/payments/PaymentHistoryPage';

// Question Bank
import QuestionBankPage from './pages/questionbank/QuestionBankPage';

// Documents
import DocumentsPage from './pages/documents/DocumentsPage';

// Exams
import ExamsPage from './pages/exams/ExamsPage';

// Quizzes
import QuizzesPage from './pages/quizzes/QuizzesPage';

// Assignments
import AssignmentsPage from './pages/assignments/AssignmentsPage';

// Live Classes
import LiveClassesPage from './pages/liveclasses/LiveClassesPage';

// Notifications
import NotificationsPage from './pages/notifications/NotificationsPage';

// Search
import SearchPage from './pages/search/SearchPage';

// Chats
import ChatPage from './pages/chats/ChatPage';

// Error pages
import NotFoundPage from './pages/errors/NotFoundPage';

// ─── Guards ───────────────────────────────────────────────────────────────────

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center text-gray-400">
      Loading…
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ─── Dashboard router by role ─────────────────────────────────────────────────

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'admin')   return <AdminDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'parent')  return <ParentDashboard />;
  return <Navigate to="/login" replace />;
};

// ─── Subjects router by role ──────────────────────────────────────────────────

const SubjectsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'admin')   return <AdminSubjects />;
  if (user?.role === 'teacher') return <TeacherSubjects />;
  if (user?.role === 'student') return <StudentSubjects />;
  return <Navigate to="/dashboard" replace />;
};

// ─── Content wrapper — shifts right when sidebar is pinned on desktop ─────────

function ContentArea({ children }) {
  const { isAuthenticated } = useAuth();
  const { open }    = useSidebar();
  const location    = useLocation();

  const shifted    = isAuthenticated && open;
  const hideFooter = location.pathname.startsWith('/chats');

  // Split children into [Header, main, Footer] so we can suppress Footer on /chats
  const childArray  = Array.isArray(children) ? children : [children];
  const header      = childArray[0];
  const main        = childArray[1];
  const footer      = childArray[2];

  return (
    <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${
      shifted ? 'lg:ml-64' : 'lg:ml-0'
    }`}>
      {header}
      {main}
      {!hideFooter && footer}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Persistent sidebar (desktop) / overlay drawer (mobile) */}
      <Sidebar />

      {/* Everything else slides right when sidebar is pinned */}
      <ContentArea>
        <Header />

        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />

            {/* Guest-only */}
            <Route path="/login"            element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register"         element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password"  element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/verify-otp"       element={<GuestRoute><VerifyOTPPage /></GuestRoute>} />
            <Route path="/set-new-password" element={<GuestRoute><SetNewPasswordPage /></GuestRoute>} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />

            {/* Protected */}
            <Route path="/dashboard"       element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
            <Route path="/profile"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/payment/verify"  element={<PrivateRoute><PaymentVerifyPage /></PrivateRoute>} />
            <Route path="/payment/history" element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>} />

            <Route path="/subjects"
              element={<PrivateRoute><SubjectsRouter /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/classroom"
              element={<PrivateRoute><ClassroomPage /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/courses"
              element={<PrivateRoute><CourseManagePage /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/courses/:courseSlug/lessons"
              element={<PrivateRoute><LessonsPage /></PrivateRoute>} />
            <Route path="/subjects/question-bank"
              element={<PrivateRoute><QuestionBankPage /></PrivateRoute>} />

            <Route path="/view"          element={<PrivateRoute><FileViewerPage /></PrivateRoute>} />
            <Route path="/documents"     element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
            <Route path="/exams"         element={<PrivateRoute><ExamsPage /></PrivateRoute>} />
            <Route path="/quizzes"       element={<PrivateRoute><QuizzesPage /></PrivateRoute>} />
            <Route path="/assignments"   element={<PrivateRoute><AssignmentsPage /></PrivateRoute>} />
            <Route path="/live-classes"  element={<PrivateRoute><LiveClassesPage /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            <Route path="/search"        element={<PrivateRoute><SearchPage /></PrivateRoute>} />
            <Route path="/chats"         element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/users"         element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
            <Route path="/my-subjects"   element={<PrivateRoute><TeacherSubjects /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </ContentArea>
    </div>
  );
}
