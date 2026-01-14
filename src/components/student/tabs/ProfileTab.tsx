'use client'

import React, { useState } from 'react'

interface ProfileData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  password: string
}

interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  progress: number
  completedLessons: number[]
  lastAccessedAt: string
  certificateIssued?: boolean
}

interface ProfileTabProps {
  currentUser: User
  stats: {
    totalEnrolled: number
    completed: number
  }
  enrollments: Enrollment[]
  onUpdateProfile: (profileData: ProfileData) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  stats,
  enrollments,
  onUpdateProfile,
  onError,
  onSuccess
}) => {
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: currentUser.name,
    email: currentUser.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      onError('Please enter a valid email address')
      return
    }

    // Check if changing password
    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        onError('New passwords do not match')
        return
      }
      if (profileData.newPassword.length < 6) {
        onError('Password must be at least 6 characters long')
        return
      }
      if (profileData.currentPassword !== currentUser.password) {
        onError('Current password is incorrect')
        return
      }
    }

    onUpdateProfile(profileData)
    setShowProfileEdit(false)
    setProfileData({
      ...profileData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleCancel = () => {
    setShowProfileEdit(false)
    setProfileData({
      name: currentUser.name,
      email: currentUser.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-4xl mb-4">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{currentUser.name}</h3>
            <p className="text-slate-400 text-sm mb-2">{currentUser.email}</p>
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-semibold">
              Student
            </span>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalEnrolled}</div>
                  <div className="text-xs text-slate-400">Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                  <div className="text-xs text-slate-400">Completed</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfileEdit(true)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="md:col-span-2">
          {!showProfileEdit ? (
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <div className="px-4 py-3 bg-slate-700/30 rounded-lg text-white">{currentUser.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                  <div className="px-4 py-3 bg-slate-700/30 rounded-lg text-white">{currentUser.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Account Type</label>
                  <div className="px-4 py-3 bg-slate-700/30 rounded-lg text-white capitalize">{currentUser.role}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Member Since</label>
                  <div className="px-4 py-3 bg-slate-700/30 rounded-lg text-white">
                    {enrollments[0] ? new Date(enrollments[0].enrolledAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Change Password (Optional)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
