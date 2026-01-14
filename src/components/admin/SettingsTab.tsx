'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface SettingsTabProps {
  stats: {
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
  }
  currentUser: any
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function SettingsTab({ stats, currentUser, showToast }: SettingsTabProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleClearData = () => {
    localStorage.removeItem('users')
    localStorage.removeItem('courses')
    localStorage.removeItem('enrollments')
    showToast?.success('All data cleared successfully')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-4">
        {/* Profile Settings */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Profile Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={currentUser?.name || ''}
                readOnly
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={currentUser?.email || ''}
                readOnly
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <input
                type="text"
                value={currentUser?.role || ''}
                readOnly
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm capitalize"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">System Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Users</span>
              <span className="text-white font-medium">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Courses</span>
              <span className="text-white font-medium">{stats.totalCourses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Enrollments</span>
              <span className="text-white font-medium">{stats.totalEnrollments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Platform Version</span>
              <span className="text-white font-medium">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <button
            onClick={() => {
              logout()
              router.push('/login')
            }}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 rounded-lg border border-red-500/30 p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-xs text-slate-400 mb-3">These actions cannot be undone</p>
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  )
}
