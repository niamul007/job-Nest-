import Navbar from '../components/Navbar'

// ── Hero Section ──────────────────────────────────
const Hero = () => (
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

    {/* Search bar */}
    <div className="flex gap-2 w-full max-w-lg mb-5">
      <input
        type="text"
        placeholder="Job title, keyword or company..."
        className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-400"
      />
      <button className="text-sm text-white bg-blue-600 px-5 py-3 rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
        Search jobs
      </button>
    </div>

    {/* Filter pills */}
    <div className="flex gap-2 flex-wrap justify-center">
      {['Remote', 'Full-time', 'Part-time', 'Contract', 'Tech', 'Design', 'Marketing'].map((tag) => (
        <span
          key={tag}
          className="text-xs px-4 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition"
        >
          {tag}
        </span>
      ))}
    </div>
  </section>
)

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
const Stats = () => (
  <section className="bg-white border-b border-gray-100 grid grid-cols-4">
    {[
      { number: '12k+', label: 'Active jobs' },
      { number: '3.5k+', label: 'Companies' },
      { number: '50k+', label: 'Job seekers' },
      { number: '98%', label: 'Success rate' },
    ].map((stat, i) => (
      <div key={i} className={`py-8 text-center ${i < 3 ? 'border-r border-gray-100' : ''}`}>
        <div className="text-3xl font-medium text-blue-600 mb-1">{stat.number}</div>
        <div className="text-sm text-gray-500">{stat.label}</div>
      </div>
    ))}
  </section>
)

// ── How It Works ──────────────────────────────────
const applicantSteps = [
  { num: 1, title: 'Create your profile', desc: 'Sign up and build your professional profile in minutes.' },
  { num: 2, title: 'Browse and apply', desc: 'Search thousands of jobs and apply with one click.' },
  { num: 3, title: 'Get hired', desc: 'Track your applications and land your dream job.' },
]

const employerSteps = [
  { num: 1, title: 'Create your company', desc: 'Register and set up your company profile on JobNest.' },
  { num: 2, title: 'Post a job', desc: 'Create detailed job listings and reach thousands of candidates.' },
  { num: 3, title: 'Hire the best', desc: 'Review applications and find your perfect candidate fast.' },
]

const HowItWorks = () => {
  const [tab, setTab] = React.useState<'applicant' | 'employer'>('applicant')
  const steps = tab === 'applicant' ? applicantSteps : employerSteps

  return (
    <section className="bg-gray-50 border-b border-gray-100 px-8 py-16">
      <p className="text-xs text-blue-600 uppercase tracking-widest text-center mb-2">How it works</p>
      <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">Get started in 3 simple steps</h2>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-10">
        {(['applicant', 'employer'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-5 py-2 rounded-full border transition ${
              tab === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-500 hover:border-blue-400'
            }`}
          >
            {t === 'applicant' ? 'For job seekers' : 'For employers'}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        {steps.map((step) => (
          <div key={step.num} className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-sm font-medium text-blue-600 mx-auto mb-4">
              {step.num}
            </div>
            <div className="text-sm font-medium text-gray-900 mb-2">{step.title}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────
const features = [
  { title: 'Smart job search', desc: 'Filter by location, salary, type and category to find exactly what you need.' },
  { title: 'Top employers', desc: 'Connect directly with verified companies actively looking for talent.' },
  { title: 'Easy applications', desc: 'Apply in minutes and track all applications from one clean dashboard.' },
  { title: 'Real time alerts', desc: 'Get instant notifications when your application status changes.' },
  { title: 'Employer dashboard', desc: 'Post jobs, manage applicants and grow your team from one place.' },
  { title: 'Verified listings', desc: 'Every job posting is reviewed and approved before going live.' },
]

const Features = () => (
  <section className="bg-white border-b border-gray-100 px-8 py-16">
    <p className="text-xs text-blue-600 uppercase tracking-widest text-center mb-2">Why JobNest</p>
    <h2 className="text-2xl font-medium text-gray-900 text-center mb-10">Everything you need to land your next role</h2>
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
      {features.map((f) => (
        <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6">
          <div className="w-9 h-9 rounded-lg bg-blue-50 mb-4"></div>
          <div className="text-sm font-medium text-gray-900 mb-2">{f.title}</div>
          <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
        </div>
      ))}
    </div>
  </section>
)

// ── Latest Jobs ───────────────────────────────────
const jobs = [
  { company: 'G', title: 'Senior Frontend Developer', location: 'Google · Remote', tags: ['Full-time', 'React', 'TypeScript'], salary: '$120k – $150k' },
  { company: 'S', title: 'Backend Engineer', location: 'Stripe · New York', tags: ['Full-time', 'Node.js', 'PostgreSQL'], salary: '$130k – $160k' },
  { company: 'A', title: 'Product Designer', location: 'Airbnb · San Francisco', tags: ['Full-time', 'Figma', 'UX'], salary: '$110k – $140k' },
  { company: 'N', title: 'DevOps Engineer', location: 'Netflix · Remote', tags: ['Contract', 'Docker', 'AWS'], salary: '$140k – $180k' },
]

const LatestJobs = () => (
  <section className="bg-gray-50 border-b border-gray-100 px-8 py-16">
    <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-gray-900">Latest job openings</h2>
      <span className="text-sm text-blue-600 cursor-pointer hover:underline">View all jobs →</span>
    </div>
    <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
      {jobs.map((job) => (
        <div key={job.title} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0">
              {job.company}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{job.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{job.location}</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {job.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-blue-600">{job.salary}</span>
            <button className="text-xs text-white bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
              Apply now
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)

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
      <button className="text-sm text-blue-600 bg-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-50 transition">
        Create free account
      </button>
      <button className="text-sm text-white border border-white/30 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition">
        Post a job
      </button>
    </div>
  </section>
)

// ── Footer ────────────────────────────────────────
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 px-8 py-6 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
      <span className="text-base font-medium text-blue-600">JobNest</span>
    </div>
    <div className="flex gap-6">
      {['Jobs', 'Companies', 'About', 'Contact'].map((link) => (
        <span key={link} className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition">
          {link}
        </span>
      ))}
    </div>
    <span className="text-xs text-gray-400">© 2026 JobNest. All rights reserved.</span>
  </footer>
)

// ── HomePage ──────────────────────────────────────
import React from 'react'

const HomePage = () => {
  return (
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
}

export default HomePage