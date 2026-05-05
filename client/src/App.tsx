import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserRole } from "./types";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import MyJobsPage from "./pages/MyJobsPage";
import CreateJobPage from "./pages/CreateJobPage";
import CompanyPage from "./pages/CompanyPage";
import ApplicantsPage from "./pages/ApplicantsPage";
import ProfilePage from "./pages/ProfilePage";
import PendingJobsPage from "./pages/PendingJobsPage";
import AllUsersPage from "./pages/AllUsersPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/**
 * App — root component, defines all application routes.
 *
 * Two route types:
 *   Public    → anyone can visit, no auth required
 *   Protected → wrapped in ProtectedRoute, requires login
 *
 * ProtectedRoute mirrors backend middleware:
 *   <ProtectedRoute>                    = protect middleware
 *   allowedRoles={[UserRole.Employer]}  = authorize(UserRole.Employer)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────
            No authentication required                               */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        {/* ── Protected Routes ──────────────────────────────────────
            Any authenticated user — no role restriction             */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Any authenticated user */}
        <Route
          path="/dashboard/applications"
          element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />

        {/* Employer only — view jobs they posted */}
        <Route
          path="/dashboard/jobs"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Employer]}>
              <MyJobsPage />
            </ProtectedRoute>
          }
        />

        {/* Employer only — create a new job listing */}
        <Route
          path="/dashboard/jobs/create"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Employer]}>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />

        {/* Employer only — manage company profile */}
        <Route
          path="/dashboard/company"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Employer]}>
              <CompanyPage />
            </ProtectedRoute>
          }
        />

        {/* Employer only — view applicants for their jobs */}
        <Route
          path="/dashboard/applicants"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Employer]}>
              <ApplicantsPage />
            </ProtectedRoute>
          }
        />

        {/* Any authenticated user — view own profile */}
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin only — review and approve pending jobs */}
        <Route
          path="/dashboard/pending"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <PendingJobsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin only — view all registered users */}
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <AllUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Public — company browsing */}
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />

        {/* Public — static pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* 404 — must be last, catches any unmatched URL */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;