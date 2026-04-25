import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompanyAvatar from '../components/CompanyAvatar'
import { getAllJobs } from '../api/jobs.api'
import type { Job } from '../types'
import { JobType } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

const JobCard = ({ job }: { job: Job }) => (
  <Link
    to={`/jobs/${job.id}`}
    className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition"
  >
    <div className="flex items-start gap-4">
      <CompanyAvatar name={job.company?.name || job.title} logo_url={job.company?.logo_url} size="md" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 mb-1">{job.title}</h3>
        <p className="text-xs text-gray-500 mb-3">{job.location}</p>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
            {job.type}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
            {job.category}
          </span>
          {job.salary_min && job.salary_max && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
              ${job.salary_min}k – ${job.salary_max}k
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-blue-600 shrink-0 mt-1">View →</span>
    </div>
  </Link>
)

const typeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Full-time', value: JobType.FullTime },
  { label: 'Part-time', value: JobType.PartTime },
  { label: 'Contract', value: JobType.Contract },
  { label: 'Freelance', value: JobType.Freelance },
]

const JobsPage = () => {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await getAllJobs()
      if (response.success && response.data) {
        setJobs(response.data)
      }
    } catch {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const filtered = jobs.filter((job) => {
    const q = search.toLowerCase()
    const matchesSearch =
      q === '' ||
      job.title.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.category.toLowerCase().includes(q)
    const matchesType = typeFilter === 'all' || job.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Browse Jobs</h1>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${jobs.length} active listing${jobs.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, location, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`text-xs px-4 py-2 rounded-full border transition cursor-pointer ${
                typeFilter === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Job list */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-gray-400 text-sm">
              {search || typeFilter !== 'all' ? 'No jobs match your search' : 'No jobs available right now'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default JobsPage
