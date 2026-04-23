import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'
import { getMyApplications } from '../api/applications.api'
import { getJobsByCompany } from '../api/jobs.api'
import { getAllCompanies } from '../api/companies.api'
import type { Application, Job } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'

// ── Stat Card ─────────────────────────────────────
const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub: string }) => (
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
    closed: 'bg-red-50 text-red-800',
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

// ── Applicant Dashboard ───────────────────────────
const ApplicantDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await getMyApplications()
      if (response.success && response.data) {
        setApplications(response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const pending = applications.filter(a => a.status === 'pending').length
  const accepted = applications.filter(a => a.status === 'accepted').length

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-1">My Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Track your job search progress</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total applications" value={applications.length} sub="All time" />
        <StatCard label="Pending review" value={pending} sub="Awaiting response" />
        <StatCard label="Accepted" value={accepted} sub="Congratulations!" />
      </div>

      <h2 className="text-sm font-medium text-gray-900 mb-3">Recent applications</h2>
      {applications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">You haven't applied to any jobs yet</p>
          <Link to="/jobs" className="text-sm text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Job title</span>
            <span>Applied on</span>
            <span>Status</span>
          </div>
          {applications.slice(0, 5).map((app) => (
            <div key={app.id} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100 text-sm">
              <span className="text-gray-900">{app.job?.title || 'Job listing'}</span>
              <span className="text-gray-400 text-xs">
                {new Date(app.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              <Badge status={app.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Employer Dashboard ────────────────────────────
const EmployerDashboard = () => {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const companyResponse = await getAllCompanies()
      if (!companyResponse.success || !companyResponse.data) return

      const myCompany = companyResponse.data.find(
        (c) => c.owner_id === user?.id
      )
      if (!myCompany) return

      const jobsResponse = await getJobsByCompany(myCompany.id)
      if (jobsResponse.success && jobsResponse.data) {
        setJobs(jobsResponse.data)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const activeJobs = jobs.filter(j => j.status === 'active').length
  const draftJobs = jobs.filter(j => j.status === 'draft').length
  const pendingJobs = jobs.filter(j => j.status === 'pending').length

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-1">My Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your job listings</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total jobs" value={jobs.length} sub="All listings" />
        <StatCard label="Active jobs" value={activeJobs} sub="Live on platform" />
        <StatCard label="Pending approval" value={pendingJobs + draftJobs} sub="Awaiting review" />
      </div>

      <h2 className="text-sm font-medium text-gray-900 mb-3">My job listings</h2>
      {jobs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">You haven't posted any jobs yet</p>
          <Link to="/dashboard/jobs/create" className="text-sm text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer">
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Job title</span>
            <span>Location</span>
            <span>Status</span>
          </div>
          {jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100 text-sm">
              <span className="text-gray-900">{job.title}</span>
              <span className="text-gray-500">{job.location}</span>
              <Badge status={job.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────
const AdminDashboard = () => (
  <div>
    <h1 className="text-lg font-medium text-gray-900 mb-1">Admin Dashboard</h1>
    <p className="text-sm text-gray-500 mb-6">Manage the platform</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total users" value="—" sub="Coming soon" />
      <StatCard label="Pending jobs" value="—" sub="Coming soon" />
      <StatCard label="Total jobs" value="—" sub="Coming soon" />
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