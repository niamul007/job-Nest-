import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 px-8 py-6 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
      <span className="text-base font-medium text-blue-600">JobNest</span>
    </div>

    <div className="flex gap-6">
      <Link to="/jobs"      className="text-sm text-gray-500 hover:text-gray-900 transition">Jobs</Link>
      <Link to="/companies" className="text-sm text-gray-500 hover:text-gray-900 transition">Companies</Link>
      <Link to="/about"     className="text-sm text-gray-500 hover:text-gray-900 transition">About</Link>
      <Link to="/contact"   className="text-sm text-gray-500 hover:text-gray-900 transition">Contact</Link>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex gap-3">
        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">Twitter</a>
        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">LinkedIn</a>
        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">GitHub</a>
      </div>
      <span className="text-xs text-gray-400">© 2026 JobNest. All rights reserved.</span>
    </div>
  </footer>
)

export default Footer
