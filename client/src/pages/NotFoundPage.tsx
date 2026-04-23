import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="w-2 h-2 rounded-full bg-blue-600 mb-6"></div>
      <h1 className="text-6xl font-medium text-gray-900 mb-4">404</h1>
      <p className="text-lg text-gray-500 mb-2">Page not found</p>
      <p className="text-sm text-gray-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="text-sm text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        Back to home
      </Link>
    </div>
  )
}

export default NotFoundPage