import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Building2, Users, TrendingUp,
  UserPlus, Search, CheckCircle, FileText, Bell, LayoutDashboard, ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompanyAvatar from '../components/CompanyAvatar'
import { getAllJobs } from '../api/jobs.api'
import type { Job } from '../types'
import { UserRole } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuthStore } from '../store/authStore'

// ── Hero Section ──────────────────────────────────
const Hero = () => {
  const { isAuthenticated, user } = useAuthStore()
  const postJobPath = isAuthenticated && user?.role === UserRole.Employer
    ? '/dashboard/jobs/create'
    : '/register'

  return (
    <section className="bg-white border-b border-gray-100 px-8 py-20 flex flex-col items-center text-center">
      <span className="text-xs text-blue-600 bg-blue-50 px-4 py-1 rounded-full mb-6">
        Trusted by 10,000+ professionals
      </span>
      <h1 className="text-4xl font-medium text-gray-900 leading-tight max-w-xl mb-4">
        Find your next <span className="text-blue-600">dream job</span> with JobNest
      </h1>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
        Connect with top employers and discover opportunities that match your skills and ambitions.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/jobs"
          className="text-sm text-white bg-blue-600 font-medium px-7 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Browse Jobs
        </Link>
        <Link
          to={postJobPath}
          className="text-sm text-blue-600 bg-blue-50 font-medium px-7 py-3 rounded-lg hover:bg-blue-100 transition border border-blue-200"
        >
          Post a Job
        </Link>
      </div>
    </section>
  )
}

// ── Trusted By ────────────────────────────────────
const TrustedBy = () => (
  <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 flex items-center justify-center gap-8">
    <span className="text-xs text-gray-400 whitespace-nowrap">Trusted by teams at</span>
    {['Google', 'Stripe', 'Airbnb', 'Netflix', 'Shopify'].map((company) => (
      <span key={company} className="text-sm font-medium text-gray-400">{company}</span>
    ))}
  </div>
)

// ── Stats ─────────────────────────────────────────
const statItems: { icon: LucideIcon; number: string; label: string }[] = [
  { icon: Briefcase,   number: '12k+', label: 'Active jobs' },
  { icon: Building2,   number: '3.5k+', label: 'Companies' },
  { icon: Users,       number: '50k+', label: 'Job seekers' },
  { icon: TrendingUp,  number: '98%',  label: 'Success rate' },
]

const Stats = () => (
  <section className="bg-white border-b border-gray-100 grid grid-cols-4">
    {statItems.map((stat, i) => {
      const Icon = stat.icon
      return (
        <div key={i} className={`py-8 text-center ${i < 3 ? 'border-r border-gray-100' : ''}`}>
          <div className="flex justify-center mb-2">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-medium text-blue-600 mb-1">{stat.number}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      )
    })}
  </section>
)

// ── How It Works ──────────────────────────────────
interface Step { num: number; icon: LucideIcon; title: string; desc: string }

const applicantSteps: Step[] = [
  { num: 1, icon: UserPlus,     title: 'Create your profile', desc: 'Sign up and build your professional profile in minutes.' },
  { num: 2, icon: Search,       title: 'Browse and apply',    desc: 'Search thousands of jobs and apply with one click.' },
  { num: 3, icon: CheckCircle,  title: 'Get hired',           desc: 'Track your applications and land your dream job.' },
]

const employerSteps: Step[] = [
  { num: 1, icon: Building2,    title: 'Create your company', desc: 'Register and set up your company profile on JobNest.' },
  { num: 2, icon: FileText,     title: 'Post a job',          desc: 'Create detailed job listings and reach thousands of candidates.' },
  { num: 3, icon: CheckCircle,  title: 'Hire the best',       desc: 'Review applications and find your perfect candidate fast.' },
]

const HowItWorks = () => {
  const [tab, setTab] = useState<'applicant' | 'employer'>('applicant')
  const steps = tab === 'applicant' ? applicantSteps : employerSteps

  return (
    <section className="bg-gray-50 border-b border-gray-100 px-8 py-16">
      <p className="text-xs text-blue-600 uppercase tracking-widest text-center mb-2">How it works</p>
      <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">Get started in 3 simple steps</h2>

      <div className="flex gap-2 justify-center mb-10">
        {(['applicant', 'employer'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-5 py-2 rounded-full border transition cursor-pointer ${
              tab === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-500 hover:border-blue-400'
            }`}
          >
            {t === 'applicant' ? 'For job seekers' : 'For employers'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.num} className="bg-white border border-gray-100 rounded-xl p-6 text-center">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-2">{step.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{step.desc}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────
const features: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Search,          title: 'Smart job search',    desc: 'Filter by location, salary, type and category to find exactly what you need.' },
  { icon: Building2,       title: 'Top employers',       desc: 'Connect directly with verified companies actively looking for talent.' },
  { icon: FileText,        title: 'Easy applications',   desc: 'Apply in minutes and track all applications from one clean dashboard.' },
  { icon: Bell,            title: 'Real time alerts',    desc: 'Get instant notifications when your application status changes.' },
  { icon: LayoutDashboard, title: 'Employer dashboard',  desc: 'Post jobs, manage applicants and grow your team from one place.' },
  { icon: ShieldCheck,     title: 'Verified listings',   desc: 'Every job posting is reviewed and approved before going live.' },
]

const Features = () => (
  <section className="bg-white border-b border-gray-100 px-8 py-16">
    <p className="text-xs text-blue-600 uppercase tracking-widest text-center mb-2">Why JobNest</p>
    <h2 className="text-2xl font-medium text-gray-900 text-center mb-10">Everything you need to land your next role</h2>
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
      {features.map((f) => {
        const Icon = f.icon
        return (
          <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6">
            <div className="w-9 h-9 rounded-lg bg-blue-50 mb-4 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900 mb-2">{f.title}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
          </div>
        )
      })}
    </div>
  </section>
)

// ── Latest Jobs ───────────────────────────────────
const LatestJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllJobs()
      .then((res) => {
        if (res.success && res.data) {
          const complete = res.data.filter(
            (j) => j.title?.trim() && j.location?.trim() && j.type && j.category?.trim()
          )
          setJobs(complete.slice(0, 4))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-gray-50 border-b border-gray-100 px-8 py-16">
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium text-gray-900">Latest job openings</h2>
        <Link to="/jobs" className="text-sm text-blue-600 hover:underline">View all jobs →</Link>
      </div>

      {loading ? (
        <div className="max-w-4xl mx-auto"><LoadingSpinner /></div>
      ) : jobs.length === 0 ? (
        <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No active jobs right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 hover:border-blue-200 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <CompanyAvatar name={job.company?.name || job.title} logo_url={job.company?.logo_url} size="sm" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{job.location}</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
                  {job.type}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
                  {job.category}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {job.salary_min && job.salary_max ? (
                  <span className="text-sm font-medium text-blue-600">
                    ${job.salary_min}k – ${job.salary_max}k
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Salary not specified</span>
                )}
                <span className="text-xs text-blue-600">View job →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Testimonials ──────────────────────────────────
const testimonials = [
  { text: 'JobNest helped me land my dream job at a top tech company within 3 weeks. The process was smooth and notifications kept me updated throughout.', name: 'Sarah R.', role: 'Frontend Developer at Google', initials: 'SR' },
  { text: 'As an employer, JobNest made hiring so much easier. We found the perfect candidate in under a week. The dashboard is clean and intuitive.', name: 'James M.', role: 'CTO at Stripe', initials: 'JM' },
  { text: 'I applied to 5 jobs and got 3 interviews in my first week. The real time notifications are a game changer — I never missed an update.', name: 'Aisha N.', role: 'Product Designer at Airbnb', initials: 'AN' },
]

const Testimonials = () => (
  <section className="bg-white border-b border-gray-100 px-8 py-16">
    <p className="text-xs text-blue-600 uppercase tracking-widest text-center mb-2">Testimonials</p>
    <h2 className="text-2xl font-medium text-gray-900 text-center mb-10">What our users say</h2>
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
      {testimonials.map((t) => (
        <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-xs text-gray-500 leading-relaxed italic">"{t.text}"</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
              {t.initials}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-900">{t.name}</div>
              <div className="text-xs text-gray-400">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

// ── CTA ───────────────────────────────────────────
const CTA = () => (
  <section className="bg-blue-600 px-8 py-16 text-center">
    <h2 className="text-2xl font-medium text-white mb-3">Ready to find your next opportunity?</h2>
    <p className="text-sm text-blue-200 mb-8">Join thousands of professionals already using JobNest</p>
    <div className="flex gap-3 justify-center">
      <Link
        to="/register"
        className="text-sm text-blue-600 bg-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-50 transition"
      >
        Create free account
      </Link>
      <Link
        to="/register"
        className="text-sm text-white border border-white/30 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
      >
        Post a job
      </Link>
    </div>
  </section>
)

// ── HomePage ──────────────────────────────────────
const HomePage = () => (
  <div className="min-h-screen bg-white">
    <Navbar />
    <Hero />
    <TrustedBy />
    <Stats />
    <HowItWorks />
    <Features />
    <LatestJobs />
    <Testimonials />
    <CTA />
    <Footer />
  </div>
)

export default HomePage
