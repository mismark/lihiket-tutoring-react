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
import SetupAdminPage      from './pages/auth/SetupAdminPage';

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
import PaymentVerifyPage   from './pages/payments/PaymentVerifyPage';
import PaymentHistoryPage  from './pages/payments/PaymentHistoryPage';
import PaymentCheckoutPage from './pages/payments/PaymentCheckoutPage';

// Question Bank
import QuestionBankPage from './pages/questionbank/QuestionBankPage';

// Documents
import DocumentsPage from './pages/documents/DocumentsPage';

// Exams
import ExamsPage        from './pages/exams/ExamsPage';
import SubjectExamsPage from './pages/exams/SubjectExamsPage';

// Quizzes
import QuizzesPage        from './pages/quizzes/QuizzesPage';
import SubjectQuizzesPage from './pages/quizzes/SubjectQuizzesPage';

// Assignments
import AssignmentsPage        from './pages/assignments/AssignmentsPage';
import SubjectAssignmentsPage from './pages/assignments/SubjectAssignmentsPage';

// Live Classes
import LiveClassesPage        from './pages/liveclasses/LiveClassesPage';
import SubjectLiveClassesPage from './pages/liveclasses/SubjectLiveClassesPage';

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
    <div className="flex h-screen items-center justify-center text-slate-400 dark:bg-slate-950">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center text-slate-400">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (user?.role === 'admin')   return <AdminSubjects />;
  if (user?.role === 'teacher') return <TeacherSubjects />;
  if (user?.role === 'student') return <StudentSubjects />;
  if (user?.role === 'parent')  return <StudentSubjects />; // parents can browse subjects too
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

            {/* First-time admin setup — auto-disables after first admin created */}
            <Route path="/setup" element={<SetupAdminPage />} />

            {/* Protected */}
            <Route path="/dashboard"       element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
            <Route path="/profile"         element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/payment/verify"   element={<PrivateRoute><PaymentVerifyPage /></PrivateRoute>} />
            <Route path="/payment/checkout" element={<PrivateRoute><PaymentCheckoutPage /></PrivateRoute>} />
            <Route path="/payment/history"  element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>} />

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
            <Route path="/subjects/:subjectSlug/courses/:courseSlug/documents"
              element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
            <Route path="/exams"         element={<PrivateRoute><ExamsPage /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/exams"
              element={<PrivateRoute><SubjectExamsPage /></PrivateRoute>} />
            <Route path="/quizzes"       element={<PrivateRoute><QuizzesPage /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/quizzes"
              element={<PrivateRoute><SubjectQuizzesPage /></PrivateRoute>} />
            <Route path="/assignments"   element={<PrivateRoute><AssignmentsPage /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/assignments"
              element={<PrivateRoute><SubjectAssignmentsPage /></PrivateRoute>} />
            <Route path="/live-classes"  element={<PrivateRoute><LiveClassesPage /></PrivateRoute>} />
            <Route path="/subjects/:subjectSlug/live-classes"
              element={<PrivateRoute><SubjectLiveClassesPage /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            <Route path="/search"        element={<PrivateRoute><SearchPage /></PrivateRoute>} />
            <Route path="/chats"         element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/users"         element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
            <Route path="/my-subjects"   element={<PrivateRoute><TeacherSubjects /></PrivateRoute>} />

            {/* Admin legacy URLs → redirect to current pages */}
            <Route path="/admin/pending-users" element={<Navigate to="/users" replace />} />
            <Route path="/admin/*"             element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </ContentArea>
    </div>
  );
}
