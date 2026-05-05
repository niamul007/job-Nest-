import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

/**
 * Local User interface — defined here instead of importing from types
 * because this page only needs basic user fields for display.
 */
interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

/**
 * AllUsersPage — admin only page showing all registered users.
 * Protected by ProtectedRoute allowedRoles={[UserRole.Admin]} in App.tsx.
 *
 * Features:
 *   - Fetches all users from GET /api/users on mount
 *   - Client-side search by name or email (no extra API calls)
 *   - Role badges with color coding per role
 *   - Four render states: loading, error, empty, data
 */
const AllUsersPage = () => {
  // Local state — only this page needs users, no need for global store
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('') // client-side search term

  // Fetch users once when component mounts
  useEffect(() => {
    fetchUsers()
  }, []) // empty array = run once only

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users') // token added by interceptor
      if (response.data.success) {
        setUsers(response.data.data) // store users in local state
      }
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false) // always runs — prevents infinite loading on error
    }
  }

  /**
   * Client-side filtering — no API call needed.
   * Filters already loaded users by name OR email.
   * Case insensitive — both sides converted to lowercase.
   * Recalculates every time search or users changes.
   */
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  /**
   * RoleBadge — inline component for displaying role with color coding.
   * Lookup map pattern: role string → Tailwind classes.
   * Fallback to gray if role not in map.
   */
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
      {/* Header — title + search input */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 mb-1">All Users</h1>
          <p className="text-sm text-gray-500">Manage platform users</p>
        </div>
        {/* Search — filters filteredUsers on every keystroke */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 w-64"
        />
      </div>

      {/* Four render states — loading → error → empty → data */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No users found</p>
        </div>
      ) : (
        // Users table
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
          </div>

          {/* Table rows — one per user */}
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-4 px-5 py-4 border-t border-gray-100 text-sm items-center">

              {/* Name — avatar initials + full name */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-gray-900 font-medium">{user.name}</span>
              </div>

              <span className="text-gray-500">{user.email}</span>

              {/* Role badge — color coded by role */}
              <RoleBadge role={user.role} />

              {/* Date — convert ISO string to readable format */}
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