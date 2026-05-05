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
  children: React.ReactNode // page content rendered inside the layout
}

/**
 * NavItem — shape of each sidebar navigation link.
 * label → display text
 * path  → route to navigate to
 * icon  → Lucide icon component
 */
interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

// ── Nav items per role ────────────────────────────────────────────────────────
// Each role sees different sidebar links — mirrors backend route authorization

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

// ── Sidebar component ─────────────────────────────────────────────────────────
/**
 * Sidebar — role-based navigation panel.
 * Desktop: always visible (lg:translate-x-0)
 * Mobile: hidden by default, slides in when isOpen is true
 *
 * Shows different nav items based on user role:
 *   Admin    → adminNav
 *   Employer → employerNav
 *   Applicant → applicantNav (default)
 */
const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation() // used for active link highlighting

  // Pick nav array based on user role
  const navItems =
    user?.role === UserRole.Admin    ? adminNav :
    user?.role === UserRole.Employer ? employerNav :
    applicantNav

  const handleLogout = () => {
    logout()           // clears Zustand + localStorage
    navigate('/login') // redirect immediately
  }

  return (
    <>
      {/* Mobile overlay — dark background behind sidebar
          Clicking it closes the sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel
          Mobile: slides in/out with translate-x
          Desktop: always visible with lg:translate-x-0 lg:static */}
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
        
        {/* Navigation links — rendered from navItems array */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose} // close sidebar on mobile after clicking
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                  // Active link: highlight blue if current path matches
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

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition cursor-pointer w-full mb-3"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        {/* User info — avatar + name + role at bottom of sidebar */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          {/* Avatar — first 2 letters of name */}
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

// ── DashboardLayout ───────────────────────────────────────────────────────────
/**
 * DashboardLayout — wrapper for all dashboard pages.
 * Provides sidebar + scrollable content area + footer.
 *
 * Usage:
 *   const AnyDashboardPage = () => (
 *     <DashboardLayout>
 *       <h1>Page content here</h1>
 *     </DashboardLayout>
 *   )
 *
 * Desktop: sidebar always visible on left, content on right
 * Mobile: sidebar hidden, toggled by hamburger menu button
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Controls mobile sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar — receives open state and close handler */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile topbar — only visible on small screens (hidden on lg+)
            Shows hamburger menu button to open sidebar */}
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

        {/* Page content — scrollable, renders children passed to layout */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-6">
            {children} {/* actual page content rendered here */}
          </div>
          <Footer />
        </main>

      </div>
    </div>
  )
}

export default DashboardLayout