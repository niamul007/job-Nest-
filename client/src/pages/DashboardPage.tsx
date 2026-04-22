import DashboardLayout from '../components/DashboardLayout'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'

// ── Stat Card ─────────────────────────────────────
const StatCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5">
    <div className="text-xs text-gray-500 mb-2">{label}</div>
    <div className="text-2xl font-medium text-gray-900 mb-1">{value}</div>
    <div className="text-xs text-gray-400">{sub}</div>
  </div>
)

// ── Status Badge ──────────────────────────────────
const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    accepted: 'bg-green-50 text-green-800',
    rejected: 'bg-red-50 text-red-800',
    active: 'bg-green-50 text-green-800',
    draft: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

// ── Applicant Dashboard ───────────────────────────
const ApplicantDashboard = () => (
  <div>
    <h1 className="text-lg font-medium text-gray-900 mb-1">My Dashboard</h1>
    <p className="text-sm text-gray-500 mb-6">Track your job search progress</p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total applications" value="12" sub="+3 this week" />
      <StatCard label="Pending review" value="5" sub="Awaiting response" />
      <StatCard label="Interviews" value="2" sub="Scheduled this week" />
    </div>

    <h2 className="text-sm font-medium text-gray-900 mb-3">Recent applications</h2>
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
        <span>Job title</span>
        <span>Company</span>
        <span>Status</span>
      </div>
      {[
        { title: 'Frontend Developer', company: 'Google', status: 'pending' },
        { title: 'Backend Engineer', company: 'Stripe', status: 'accepted' },
        { title: 'Product Designer', company: 'Airbnb', status: 'rejected' },
      ].map((app) => (
        <div key={app.title} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100 text-sm">
          <span className="text-gray-900">{app.title}</span>
          <span className="text-gray-500">{app.company}</span>
          <Badge status={app.status} />
        </div>
      ))}
    </div>
  </div>
)

// ── Employer Dashboard ────────────────────────────
const EmployerDashboard = () => (
  <div>
    <h1 className="text-lg font-medium text-gray-900 mb-1">My Dashboard</h1>
    <p className="text-sm text-gray-500 mb-6">Manage your job listings and applicants</p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard label="Active jobs" value="4" sub="2 pending approval" />
      <StatCard label="Total applicants" value="48" sub="+12 this week" />
      <StatCard label="Hired" value="3" sub="This month" />
    </div>

    <h2 className="text-sm font-medium text-gray-900 mb-3">My job listings</h2>
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
        <span>Job title</span>
        <span>Applicants</span>
        <span>Status</span>
      </div>
      {[
        { title: 'Senior Developer', applicants: '24', status: 'active' },
        { title: 'UX Designer', applicants: '18', status: 'active' },
        { title: 'DevOps Engineer', applicants: '6', status: 'pending' },
      ].map((job) => (
        <div key={job.title} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100 text-sm">
          <span className="text-gray-900">{job.title}</span>
          <span className="text-gray-500">{job.applicants} applicants</span>
          <Badge status={job.status} />
        </div>
      ))}
    </div>
  </div>
)

// ── Admin Dashboard ───────────────────────────────
const AdminDashboard = () => (
  <div>
    <h1 className="text-lg font-medium text-gray-900 mb-1">Admin Dashboard</h1>
    <p className="text-sm text-gray-500 mb-6">Manage the platform</p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total users" value="1.2k" sub="+24 today" />
      <StatCard label="Pending jobs" value="8" sub="Awaiting approval" />
      <StatCard label="Total jobs" value="342" sub="Active on platform" />
    </div>

    <h2 className="text-sm font-medium text-gray-900 mb-3">Jobs pending approval</h2>
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
        <span>Job title</span>
        <span>Company</span>
        <span>Action</span>
      </div>
      {[
        { title: 'React Developer', company: 'TechCorp' },
        { title: 'Data Analyst', company: 'DataCo' },
        { title: 'Marketing Lead', company: 'BrandX' },
      ].map((job) => (
        <div key={job.title} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100 text-sm items-center">
          <span className="text-gray-900">{job.title}</span>
          <span className="text-gray-500">{job.company}</span>
          <button className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer w-fit">
            Approve
          </button>
        </div>
      ))}
    </div>
  </div>
)

// ── DashboardPage ─────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuthStore()

  const renderDashboard = () => {
    if (user?.role === UserRole.Admin) return <AdminDashboard />
    if (user?.role === UserRole.Employer) return <EmployerDashboard />
    return <ApplicantDashboard />
  }

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  )
}

export default DashboardPage