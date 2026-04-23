import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getMyApplications } from '../api/applications.api'
import type { Application } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'

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

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await getMyApplications()
      if (response.success && response.data) {
        setApplications(response.data)
      }
    } catch {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 mb-1">My Applications</h1>
        <p className="text-sm text-gray-500">Track all your job applications</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">You haven't applied to any jobs yet</p>
          <Link
            to="/jobs"
            className="text-sm text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Job title</span>
            <span>Cover letter</span>
            <span>Applied on</span>
            <span>Status</span>
          </div>
          {applications.map((app) => (
            <div key={app.id} className="grid grid-cols-4 px-5 py-4 border-t border-gray-100 text-sm items-center">
              <span className="text-gray-900 font-medium">
                {app.job?.title || 'Job listing'}
              </span>
              <span className="text-gray-500 truncate pr-4">
                {app.cover_letter || '—'}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(app.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <Badge status={app.status} />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default MyApplicationsPage