import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

/**
 * Navbar — persistent top navigation bar.
 * Reads auth state from Zustand — changes based on login status.
 *
 * Not logged in → shows Login + Get Started buttons
 * Logged in     → shows Dashboard link + user avatar + Logout button
 */
const Navbar = () => {
  // Read auth state from global store — no props needed
  const { isAuthenticated, user, logout } = useAuthStore()

  // useNavigate for programmatic redirect after logout
  const navigate = useNavigate()

  /**
   * Handles logout:
   * 1. Clears Zustand state (user, token, isAuthenticated)
   * 2. Clears localStorage (token, user)
   * 3. Redirects to login page
   */
  const handleLogout = () => {
    logout()           // clears Zustand + localStorage
    navigate('/login') // redirect — can't use Link here, this runs in code
  }

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-between">

      {/* Logo — links back to home */}
      <Link to="/" className="flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
        <span className="text-xl font-medium text-blue-600">JobNest</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6">

        {/* Public links — always visible */}
        <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900 transition">
          Jobs
        </Link>
        <Link to="/companies" className="text-sm text-gray-500 hover:text-gray-900 transition">
          Companies
        </Link>
        <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900 transition">
          About
        </Link>
        <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition">
          Contact
        </Link>

        {/* Vertical divider */}
        <div className="w-px h-5 bg-gray-200"></div>

        {/* Conditional rendering based on auth state */}
        {isAuthenticated ? (
          <>
            {/* Logged in — show dashboard + user info + logout */}
            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Dashboard
            </Link>

            <div className="w-px h-5 bg-gray-200"></div>

            <div className="flex items-center gap-3">
              {/* Avatar — first 2 letters of name as initials */}
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                {user?.name.slice(0, 2).toUpperCase()}
              </div>

              {/* User name with chevron */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>

              {/* Logout button — clears auth + redirects to login */}
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
            {/* Not logged in — show login + register buttons */}
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