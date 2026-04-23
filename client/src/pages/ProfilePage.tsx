import DashboardLayout from '../components/DashboardLayout'
import { useAuthStore } from '../store/authStore'

const ProfilePage = () => {
  const { user } = useAuthStore()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 mb-1">My Profile</h1>
        <p className="text-sm text-gray-500">Your account information</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-5 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-medium text-blue-600">
            {user?.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">Full name</p>
            <p className="text-sm text-gray-900">{user?.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{user?.email}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">Role</p>
            <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">Member since</p>
            <p className="text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage