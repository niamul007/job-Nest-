import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const AboutPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />

    <div className="max-w-3xl mx-auto px-8 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs text-blue-600 bg-blue-50 px-4 py-1 rounded-full">About us</span>
        <h1 className="text-3xl font-medium text-gray-900 mt-4 mb-4">
          Built for the modern job market
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
          JobNest connects talented professionals with the companies that need them most.
          We believe finding the right job — or the right candidate — should be simple, transparent, and fast.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 mb-6">
        <h2 className="text-base font-medium text-gray-900 mb-3">Our mission</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          We're on a mission to remove friction from the hiring process. Whether you're a fresh graduate
          looking for your first role, an experienced professional seeking a new challenge, or an employer
          trying to build a world-class team — JobNest is the platform built for you.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { title: 'Transparency', desc: 'Every job listing is reviewed before going live. No ghost postings, no misleading titles.' },
          { title: 'Speed', desc: 'Apply in minutes. Employers review and respond quickly. No endless back-and-forth.' },
          { title: 'Fairness', desc: 'We surface opportunities based on fit, not connections. Everyone gets a fair shot.' },
        ].map((v) => (
          <div key={v.title} className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 mb-3"></div>
            <div className="text-sm font-medium text-gray-900 mb-2">{v.title}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{v.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 mb-6 grid grid-cols-4 divide-x divide-gray-100">
        {[
          { number: '2023', label: 'Founded' },
          { number: '50k+', label: 'Job seekers' },
          { number: '3.5k+', label: 'Companies' },
          { number: '12k+', label: 'Active jobs' },
        ].map((s) => (
          <div key={s.label} className="text-center px-4">
            <div className="text-2xl font-medium text-blue-600 mb-1">{s.number}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-blue-600 rounded-xl p-8 text-center">
        <h2 className="text-xl font-medium text-white mb-2">Ready to get started?</h2>
        <p className="text-sm text-blue-200 mb-6">Join thousands of professionals already on JobNest</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/register"
            className="text-sm text-blue-600 bg-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-50 transition"
          >
            Create free account
          </Link>
          <Link
            to="/jobs"
            className="text-sm text-white border border-white/30 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
)

export default AboutPage
