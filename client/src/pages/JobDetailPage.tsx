import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, Tag, DollarSign, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompanyAvatar from '../components/CompanyAvatar'
import LoadingSpinner from '../components/LoadingSpinner'
import { getJobById } from '../api/jobs.api'
import { applyForJob } from '../api/applications.api'
import { useAuthStore } from '../store/authStore'
import type { Job } from '../types'
import { UserRole } from '../types'

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (id) fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await getJobById(id!)
      if (response.success && response.data) {
        setJob(response.data)
      }
    } catch {
      setError('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setApplying(true)
    setError(null)
    try {
      const response = await applyForJob({
        job_id: id!,
        cover_letter: coverLetter
      })
      if (response.success) {
        setSuccess('Application submitted successfully!')
        setShowForm(false)
      } else {
        setError(response.message)
      }
    } catch {
      setError('Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <><Navbar /><LoadingSpinner /></>
  if (!job) return <><Navbar /><div className="text-center py-20 text-gray-400">Job not found</div></>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-3 gap-6">

          {/* Left — Job details */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Header card */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CompanyAvatar name={job.company?.name || job.title} logo_url={job.company?.logo_url} size="lg" />
                <div className="flex-1">
                  <h1 className="text-xl font-medium text-gray-900 mb-1">{job.title}</h1>

                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    {job.location}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.type}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {job.category}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700">
                      {job.status}
                    </span>
                  </div>

                  {job.created_at && (
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Posted {formatDate(job.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Job description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Right — Apply card */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">

              {/* Salary */}
              {job.salary_min && job.salary_max && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Salary range</p>
                  <p className="text-lg font-medium text-blue-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salary_min}k – {job.salary_max}k
                  </p>
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-2 rounded-lg mb-4">
                  {success}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Apply button or form */}
              {user?.role === UserRole.Applicant && (
                <>
                  {!showForm ? (
                    <button
                      onClick={() => isAuthenticated ? setShowForm(true) : navigate('/login')}
                      className="w-full text-sm text-white bg-blue-600 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                      Apply now
                    </button>
                  ) : (
                    <form onSubmit={handleApply} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-700">Cover letter (optional)</label>
                        <textarea
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={4}
                          placeholder="Tell the employer why you're a great fit..."
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applying}
                        className="w-full text-sm text-white bg-blue-600 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                      >
                        {applying ? 'Submitting...' : 'Submit application'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="w-full text-sm text-gray-500 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              )}

              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-sm text-white bg-blue-600 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  Login to apply
                </button>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm text-gray-500 hover:text-gray-900 transition cursor-pointer text-center"
            >
              ← Back to jobs
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default JobDetailPage
