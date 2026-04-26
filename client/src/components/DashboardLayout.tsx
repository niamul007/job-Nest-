import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Search, Briefcase, Users,
  Building2, User, Clock, LogOut, Menu,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'
import Footer from './Footer'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

// ── Nav items per role ────────────────────────────
const applicantNav: NavItem[] = [
  { label: 'Overview',        path: '/dashboard',              icon: LayoutDashboard },
  { label: 'My Applications', path: '/dashboard/applications', icon: FileText },
  { label: 'Browse Jobs',     path: '/jobs',                   icon: Search },
  { label: 'Profile',         path: '/dashboard/profile',      icon: User },
]

const employerNav: NavItem[] = [
  { label: 'Overview',   path: '/dashboard',            icon: LayoutDashboard },
  { label: 'My Jobs',    path: '/dashboard/jobs',        icon: Briefcase },
  { label: 'Applicants', path: '/dashboard/applicants',  icon: Users },
  { label: 'Company',    path: '/dashboard/company',     icon: Building2 },
  { label: 'Profile',    path: '/dashboard/profile',     icon: User },
]

const adminNav: NavItem[] = [
  { label: 'Overview',      path: '/dashboard',         icon: LayoutDashboard },
  { label: 'Pending Jobs',  path: '/dashboard/pending', icon: Clock },
  { label: 'All Users',     path: '/dashboard/users',   icon: Users },
]

// ── Sidebar ───────────────────────────────────────
const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems =
    user?.role === UserRole.Admin ? adminNav :
    user?.role === UserRole.Employer ? employerNav :
    applicantNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 z-30
        flex flex-col p-4 transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-2 mb-6">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          <span className="text-lg font-medium text-blue-600">JobNest</span>
        </Link>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-3"></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition cursor-pointer w-full mb-3"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600 shrink-0">
            {user?.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ── DashboardLayout ───────────────────────────────
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            <span className="text-base font-medium text-blue-600">JobNest</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
