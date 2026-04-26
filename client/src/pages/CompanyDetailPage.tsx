import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompanyAvatar from '../components/CompanyAvatar'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCompanyById } from '../api/companies.api'
import { getAllJobs } from '../api/jobs.api'
import type { Company, Job } from '../types'
import { JobStatus } from '../types'

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [companyRes, jobsRes] = await Promise.all([
        getCompanyById(id!),
        getAllJobs(),
      ])
      if (companyRes.success && companyRes.data) {
        setCompany(companyRes.data)
      }
      if (jobsRes.success && jobsRes.data) {
        setJobs(
          jobsRes.data.filter(
            (j) => j.company_id === id && j.status === JobStatus.Active
          )
        )
      }
    } catch {
      setError('Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      <Footer />
    </div>
  )

  if (error || !company) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        {error ?? 'Company not found'}
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-10 flex-1 w-full">

        {/* Company header */}
        <div className="bg-white border border-gray-100 rounded-xl p-8 mb-6 flex items-start gap-6">
          <CompanyAvatar name={company.name} logo_url={company.logo_url} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">{company.name}</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{company.description}</p>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {company.website}
              </a>
            )}
          </div>
        </div>

        {/* Active jobs */}
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-medium text-gray-900">Active jobs</h2>
          {jobs.length > 0 && (
            <span className="text-xs text-gray-400">({jobs.length})</span>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-400">No active jobs from this company right now</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-xs text-gray-500">{job.location}</p>
                  </div>
                  <span className="text-xs text-blue-600 shrink-0">View →</span>
                </div>
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
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/companies"
          className="block text-sm text-gray-500 hover:text-gray-900 transition text-center mt-8"
        >
          ← Back to companies
        </Link>
      </div>

      <Footer />
    </div>
  )
}

export default CompanyDetailPage
