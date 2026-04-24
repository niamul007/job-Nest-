import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getJobsByCompany } from '../api/jobs.api'
import { getApplicationsByJob, updateApplicationStatus } from '../api/applications.api'
import { getAllCompanies } from '../api/companies.api'
import { useAuthStore } from '../store/authStore'
import type { Application, Job } from '../types'
import { ApplicationStatus } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    reviewed: 'bg-blue-50 text-blue-800',
    accepted: 'bg-green-50 text-green-800',
    rejected: 'bg-red-50 text-red-800',
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

const ApplicantsPage = () => {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyJobs()
  }, [])

  useEffect(() => {
    if (selectedJob) fetchApplications(selectedJob)
  }, [selectedJob])

  const fetchMyJobs = async () => {
    try {
      setLoading(true)
      const companyResponse = await getAllCompanies()
      if (!companyResponse.success || !companyResponse.data) return

      const myCompany = companyResponse.data.find(
        (c) => c.owner_id === user?.id
      )
      if (!myCompany) return

      const jobsResponse = await getJobsByCompany(myCompany.id)
      if (jobsResponse.success && jobsResponse.data) {
        setJobs(jobsResponse.data)
        if (jobsResponse.data.length > 0) {
          setSelectedJob(jobsResponse.data[0].id)
        }
      }
    } catch {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (jobId: string) => {
    try {
      setLoading(true)
      const response = await getApplicationsByJob(jobId)
      if (response.success && response.data) {
        setApplications(response.data)
      }
    } catch {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: ApplicationStatus) => {
    try {
      await updateApplicationStatus(id, { status })
      fetchApplications(selectedJob)
    } catch {
      setError('Failed to update status')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 mb-1">Applicants</h1>
        <p className="text-sm text-gray-500">Review applications for your jobs</p>
      </div>

      {/* Job selector */}
      {jobs.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">You have no active job listings</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No applications for this job yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Applicant ID</span>
            <span>Cover letter</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {applications.map((app) => (
            <div key={app.id} className="grid grid-cols-4 px-5 py-4 border-t border-gray-100 text-sm items-center">
              <span className="text-gray-900 font-medium text-xs">
                {app.applicant_id.slice(0, 8)}...
              </span>
              <span className="text-gray-500 truncate pr-4">
                {app.cover_letter || '—'}
              </span>
              <Badge status={app.status} />
              <div className="flex gap-2">
                {app.status !== 'accepted' && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, ApplicationStatus.Accepted)}
                    className="text-xs text-white bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 transition cursor-pointer"
                  >
                    Accept
                  </button>
                )}
                {app.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, ApplicationStatus.Rejected)}
                    className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default ApplicantsPage