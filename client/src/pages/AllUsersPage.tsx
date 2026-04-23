import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

const AllUsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-50 text-purple-800',
      employer: 'bg-blue-50 text-blue-800',
      applicant: 'bg-green-50 text-green-800',
    }
    return (
      <span className={`text-xs px-3 py-1 rounded-full capitalize ${styles[role] || 'bg-gray-100 text-gray-600'}`}>
        {role}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 mb-1">All Users</h1>
          <p className="text-sm text-gray-500">Manage platform users</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 w-64"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No users found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
          </div>
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-4 px-5 py-4 border-t border-gray-100 text-sm items-center">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-gray-900 font-medium">{user.name}</span>
              </div>
              <span className="text-gray-500">{user.email}</span>
              <RoleBadge role={user.role} />
              <span className="text-gray-400 text-xs">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default AllUsersPage