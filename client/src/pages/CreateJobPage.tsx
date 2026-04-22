import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { createJob } from '../api/jobs.api'
import { getAllCompanies } from '../api/companies.api'
import type { Company } from '../types'
import { JobType } from '../types'

const CreateJobPage = () => {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    description: '',
    location: '',
    type: JobType.FullTime,
    category: '',
    salary_min: '',
    salary_max: '',
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await getAllCompanies()
      if (response.success && response.data) {
        setCompanies(response.data)
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, company_id: response.data![0].id }))
        }
      }
    } catch {
      setError('Failed to load companies')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await createJob({
        ...formData,
        salary_min: formData.salary_min ? Number(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? Number(formData.salary_max) : undefined,
      })
      if (response.success) {
        navigate('/dashboard/jobs')
      } else {
        setError(response.message)
      }
    } catch {
      setError('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 mb-1">Post a Job</h1>
        <p className="text-sm text-gray-500">Fill in the details to create a new job listing</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">

          {/* Company */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Company</label>
            <select
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              required
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 cursor-pointer"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {companies.length === 0 && (
              <p className="text-xs text-amber-600">
                You need to create a company first before posting a job.
              </p>
            )}
          </div>

          {/* Title */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Job title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              required
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          {/* Description */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities and requirements..."
              required
              rows={5}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 resize-none"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote or New York"
              required
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Engineering, Design"
              required
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          {/* Job type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Job type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 cursor-pointer"
            >
              {Object.values(JobType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Salary min */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Salary min (k)</label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              placeholder="e.g. 80"
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          {/* Salary max */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Salary max (k)</label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              placeholder="e.g. 120"
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="text-sm text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/jobs')}
            className="text-sm text-gray-500 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </DashboardLayout>
  )
}

export default CreateJobPage