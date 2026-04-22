import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { getAllJobs } from '../api/jobs.api'
import type { Job } from '../types'
import { JobType } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>("")
  const navigate = useNavigate()

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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedType ? job.type === selectedType : true
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-10 text-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Browse <span className="text-blue-600">Jobs</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Find your perfect opportunity from thousands of listings
        </p>

        {/* Search */}
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
          />
          <button className="text-sm text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm text-gray-500">Filter by:</span>
          {['', ...Object.values(JobType)].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-4 py-2 rounded-full border transition cursor-pointer ${
                selectedType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {type === '' ? 'All' : type}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-4">
          {filteredJobs.length} jobs found
        </p>

        {/* Jobs list */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No jobs found</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between hover:border-blue-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Company avatar */}
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0">
                    {job.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{job.location}</p>
                    <div className="flex gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
                        {job.type}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
                        {job.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {job.salary_min && job.salary_max && (
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      ${job.salary_min}k – ${job.salary_max}k
                    </p>
                  )}
                  <button className="text-xs text-white bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                    View job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsPage