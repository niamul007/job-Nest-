import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { getAllJobs, deleteJob, submitJob } from '../api/jobs.api'
import { getAllCompanies } from '../api/companies.api'
import { useAuthStore } from '../store/authStore'
import type { Job } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { getJobsByCompany } from '../api/jobs.api'

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-amber-50 text-amber-800',
    active: 'bg-green-50 text-green-800',
    closed: 'bg-red-50 text-red-800',
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

const MyJobsPage = () => {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

const fetchJobs = async () => {
  try {
    setLoading(true)
    const companyResponse = await getAllCompanies()
    if (!companyResponse.success || !companyResponse.data) return

    const myCompany = companyResponse.data.find(
      (c) => c.owner_id === user?.id
    )
    if (!myCompany) {
      setJobs([])
      return
    }

    const jobsResponse = await getJobsByCompany(myCompany.id)
    if (jobsResponse.success && jobsResponse.data) {
      setJobs(jobsResponse.data)
    }
  } catch {
    setError('Failed to load jobs')
  } finally {
    setLoading(false)
  }
}

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      await deleteJob(id)
      setJobs(jobs.filter((job) => job.id !== id))
    } catch {
      setError('Failed to delete job')
    }
  }

  const handleSubmit = async (id: string) => {
    try {
      await submitJob(id)
      fetchJobs()
    } catch {
      setError('Failed to submit job for review')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 mb-1">My Jobs</h1>
          <p className="text-sm text-gray-500">Manage your job listings</p>
        </div>
        <Link
          to="/dashboard/jobs/create"
          className="text-sm text-white bg-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          + Post a job
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">You haven't posted any jobs yet</p>
          <Link
            to="/dashboard/jobs/create"
            className="text-sm text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Job title</span>
            <span>Location</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {jobs.map((job) => (
            <div key={job.id} className="grid grid-cols-4 px-5 py-4 border-t border-gray-100 text-sm items-center">
              <span className="text-gray-900 font-medium">{job.title}</span>
              <span className="text-gray-500">{job.location}</span>
              <Badge status={job.status} />
              <div className="flex gap-2">
                {job.status === 'draft' && (
                  <button
                    onClick={() => handleSubmit(job.id)}
                    className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    Submit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default MyJobsPage