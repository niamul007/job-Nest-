import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { User, Mail, MessageSquare, FileText, Phone, MapPin, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      setSubmitted(true)
    } catch {
      setError('Failed to send message. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-16 flex-1 w-full">

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
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-base font-medium text-gray-900 mb-2">Message sent!</h2>
            <p className="text-sm text-gray-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
              className="mt-6 text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Full name
                </label>
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
                <label className="text-sm text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email address
                </label>
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
                <label className="text-sm text-gray-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-gray-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Message
                </label>
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

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="text-sm text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer mt-2 disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        )}

        {/* Contact info */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: Phone,  label: 'Phone',    value: '+1 (555) 000-0000' },
            { icon: Mail,   label: 'Email',    value: 'hello@jobnest.com' },
            { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-5 text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                <div className="text-sm font-medium text-gray-900">{item.value}</div>
              </div>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ContactPage
