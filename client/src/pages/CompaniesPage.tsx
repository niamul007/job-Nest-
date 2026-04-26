import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Globe } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompanyAvatar from '../components/CompanyAvatar'
import { getAllCompanies } from '../api/companies.api'
import type { Company } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

const CompanyCard = ({ company }: { company: Company }) => {
  const navigate = useNavigate()

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition cursor-pointer"
      onClick={() => navigate(`/companies/${company.id}`)}
    >
      <div className="flex items-start gap-4">
        <CompanyAvatar name={company.name} logo_url={company.logo_url} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{company.name}</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{company.description}</p>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-3 h-3 shrink-0" />
              {company.website}
            </a>
          )}
        </div>
        <span className="text-xs text-blue-600 shrink-0 mt-1">View →</span>
      </div>
    </div>
  )
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await getAllCompanies()
      if (response.success && response.data) {
        setCompanies(response.data)
      }
    } catch {
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const filtered = companies.filter((c) =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-10 flex-1 w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Companies</h1>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'} on the platform`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
          />
        </div>

        {/* Company list */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-gray-400 text-sm">
              {search ? 'No companies match your search' : 'No companies on the platform yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default CompaniesPage
