import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-between">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        <span className="text-xl font-medium text-blue-600">JobNest</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900 transition">
          Jobs
        </Link>
        <Link to="/companies" className="text-sm text-gray-500 hover:text-gray-900 transition">
          Companies
        </Link>
        <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900 transition">
          About
        </Link>

        <div className="w-px h-5 bg-gray-200"></div>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Dashboard
            </Link>
            <div className="w-px h-5 bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                {user?.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 transition"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm text-white bg-blue-600 rounded-lg px-4 py-2 hover:bg-blue-700 transition"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar