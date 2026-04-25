import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs text-blue-600 bg-blue-50 px-4 py-1 rounded-full">Contact</span>
          <h1 className="text-3xl font-medium text-gray-900 mt-4 mb-3">Get in touch</h1>
          <p className="text-sm text-gray-500">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <h2 className="text-base font-medium text-gray-900 mb-2">Message sent!</h2>
            <p className="text-sm text-gray-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }) }}
              className="mt-6 text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Your name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  required
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  required
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  required
                  rows={5}
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="text-sm text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer mt-2"
              >
                Send message
              </button>
            </form>
          </div>
        )}

        {/* Contact info */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Email', value: 'hello@jobnest.com' },
            { label: 'Response time', value: 'Within 24 hours' },
            { label: 'Support hours', value: 'Mon – Fri, 9am – 6pm' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">{item.label}</div>
              <div className="text-sm font-medium text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ContactPage
