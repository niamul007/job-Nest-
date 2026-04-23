import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { approveJob } from '../api/jobs.api'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Job } from '../types'
import api from '../api/axios'

const PendingJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingJobs()
  }, [])

  const fetchPendingJobs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/jobs/pending')
      if (response.data.success) {
        setJobs(response.data.data)
      }
    } catch {
      setError('Failed to load pending jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveJob(id)
      setJobs(jobs.filter(job => job.id !== id))
    } catch {
      setError('Failed to approve job')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 mb-1">Pending Jobs</h1>
        <p className="text-sm text-gray-500">Review and approve job listings</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No pending jobs to review</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Job title</span>
            <span>Location</span>
            <span>Type</span>
            <span>Action</span>
          </div>
          {jobs.map((job) => (
            <div key={job.id} className="grid grid-cols-4 px-5 py-4 border-t border-gray-100 text-sm items-center">
              <span className="text-gray-900 font-medium">{job.title}</span>
              <span className="text-gray-500">{job.location}</span>
              <span className="text-gray-500 capitalize">{job.type}</span>
              <button
                onClick={() => handleApprove(job.id)}
                className="text-xs text-white bg-green-600 px-4 py-1.5 rounded-lg hover:bg-green-700 transition cursor-pointer w-fit"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default PendingJobsPage