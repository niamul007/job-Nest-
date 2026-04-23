import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { getAllCompanies, createCompany, updateCompany } from '../api/companies.api'
import type { Company } from '../types'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'

const CompanyPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      setLoading(true)
      const response = await getAllCompanies()
      if (response.success && response.data) {
        const myCompany = response.data.find(
          (c) => c.owner_id === user?.id
        )
        if (myCompany) {
          setCompany(myCompany)
          setFormData({
            name: myCompany.name,
            description: myCompany.description,
            website: myCompany.website || '',
            logo_url: myCompany.logo_url || '',
          })
        }
      }
    } catch {
      setError('Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      if (company) {
        const response = await updateCompany(company.id, {
          name: formData.name,
          description: formData.description,
          website: formData.website || undefined,
          logo_url: formData.logo_url || undefined,
        })
        if (response.success) {
          setSuccess('Company updated successfully!')
          setIsEditing(false)
          await fetchCompany()
        } else {
          setError(response.message)
        }
      } else {
        const response = await createCompany({
          name: formData.name,
          description: formData.description,
          website: formData.website || undefined,
          logo_url: formData.logo_url || undefined,
        })
        if (response.success) {
          setSuccess('Company created successfully!')
          await fetchCompany()
        } else {
          setError(response.message)
        }
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 mb-1">
            {company ? 'My Company' : 'Create Company'}
          </h1>
          <p className="text-sm text-gray-500">
            {company ? 'Manage your company profile' : 'Set up your company to start posting jobs'}
          </p>
        </div>
        {company && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-white bg-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Edit company
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {company && !isEditing ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-lg font-medium text-blue-600">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-900">{company.name}</h2>
              {company.website && (
                <p className="text-xs text-blue-600">{company.website}</p>
              )}
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{company.description}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard/jobs/create')}
              className="text-sm text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Post a job
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Company name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                required
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell applicants about your company..."
                required
                rows={4}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Website (optional)</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Logo URL (optional)</label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://yourcompany.com/logo.png"
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="text-sm text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : company ? 'Save changes' : 'Create company'}
            </button>
            {company && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}

export default CompanyPage