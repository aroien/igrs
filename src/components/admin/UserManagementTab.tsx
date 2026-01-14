'use client'

import { useState, useMemo } from 'react'

interface UserManagementTabProps {
  users: any[]
  currentUser: any
  onUpdateUsers: (users: any[]) => void
  enrollments?: any[]
  courses?: any[]
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function UserManagementTab({ users, currentUser, onUpdateUsers, enrollments = [], courses = [], showToast }: UserManagementTabProps) {
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedStudentForCourses, setSelectedStudentForCourses] = useState<any>(null)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesRole
    })

    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'email':
          aVal = a.email.toLowerCase()
          bVal = b.email.toLowerCase()
          break
        case 'role':
          aVal = a.role
          bVal = b.role
          break
        case 'date':
          aVal = new Date(a.createdAt || 0).getTime()
          bVal = new Date(b.createdAt || 0).getTime()
          break
        default:
          return 0
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchTerm, filterRole, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column: 'name' | 'email' | 'role' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!validateEmail(userFormData.email)) {
        showToast?.error('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!editingUser && !validatePassword(userFormData.password)) {
        showToast?.error('Password must be at least 6 characters')
        setLoading(false)
        return
      }
    
      if (!editingUser && users.some(u => u.email === userFormData.email)) {
        showToast?.error('A user with this email already exists!')
        setLoading(false)
        return
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editingUser) {
        const updated = users.map(u =>
          u.id === editingUser.id
            ? { ...u, name: userFormData.name, email: userFormData.email, role: userFormData.role }
            : u
        )
        onUpdateUsers(updated)
        localStorage.setItem('users', JSON.stringify(updated))
        showToast?.success(`User "${userFormData.name}" updated successfully`)
      } else {
        const newUser = {
          id: Date.now().toString(),
          ...userFormData,
          createdAt: new Date().toISOString()
        }
        const updated = [...users, newUser]
        onUpdateUsers(updated)
        localStorage.setItem('users', JSON.stringify(updated))
        showToast?.success(`User "${userFormData.name}" created successfully`)
      }

      setShowUserForm(false)
      setEditingUser(null)
      setUserFormData({ name: '', email: '', password: '', role: 'student' })
    } catch (err) {
      showToast?.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowUserForm(true)
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      showToast?.error('You cannot delete your own account!')
      return
    }
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const updated = users.filter(u => u.id !== userId)
      onUpdateUsers(updated)
      localStorage.setItem('users', JSON.stringify(updated))
      showToast?.success(`User "${userName}" deleted successfully`)
    } catch (err) {
      showToast?.error('Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const getStudentCourses = (studentId: string) => {
    return enrollments
      .filter(e => e.userId === studentId)
      .map(e => {
        const course = courses.find(c => c.id === e.courseId)
        return { ...e, courseTitle: course?.title || 'Unknown Course', courseCategory: course?.category }
      })
  }

  const handleCancelCourseEnrollment = (enrollmentId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to cancel this student's enrollment from "${courseTitle}"?`)) {
      return
    }

    // Remove enrollment from localStorage
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]')
    const updatedEnrollments = storedEnrollments.filter((e: any) => e.id !== enrollmentId)
    localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments))

    // Update the modal to reflect the change
    const updatedCourses = getStudentCourses(selectedStudentForCourses.id).filter(e => e.id !== enrollmentId)
    if (updatedCourses.length === 0) {
      setSelectedStudentForCourses(null)
    } else {
      // Force re-render by updating selected student
      setSelectedStudentForCourses({ ...selectedStudentForCourses })
    }

    showToast?.success(`Enrollment cancelled for "${courseTitle}"`)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Joined']
    const rows = filteredAndSortedUsers.map(u => [
      u.name,
      u.email,
      u.role,
      new Date(u.createdAt || Date.now()).toLocaleDateString()
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast?.success('Users exported successfully')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
          <p className="text-sm text-slate-400">
            {filteredAndSortedUsers.length} of {users.length} users
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={() => {
              setShowUserForm(!showUserForm)
              if (!showUserForm) {
                setEditingUser(null)
                setUserFormData({ name: '', email: '', password: '', role: 'student' })
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            {showUserForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 pl-10 bg-slate-800/50 rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {showUserForm && (
        <div className="mb-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingUser ? 'Edit User' : 'Create New User'}</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password {editingUser && '(leave empty to keep current)'}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  required={!editingUser}
                  disabled={loading}
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
                {!editingUser && <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
              </button>
              <button
                type="button"
                onClick={() => setShowUserForm(false)}
                disabled={loading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-slate-300 transition"
                >
                  <div className="flex items-center gap-1">
                    User
                    {sortBy === 'name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell cursor-pointer hover:text-slate-300 transition"
                >
                  <div className="flex items-center gap-1">
                    Email
                    {sortBy === 'email' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('role')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-slate-300 transition"
                >
                  <div className="flex items-center gap-1">
                    Role
                    {sortBy === 'role' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('date')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden lg:table-cell cursor-pointer hover:text-slate-300 transition"
                >
                  <div className="flex items-center gap-1">
                    Joined
                    {sortBy === 'date' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-slate-400 text-sm mb-2">No users found</p>
                      <p className="text-slate-500 text-xs">
                        {searchTerm || filterRole !== 'all' 
                          ? 'Try adjusting your filters' 
                          : 'Get started by adding a new user'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-white truncate">{user.name}</span>
                          <span className="text-xs text-slate-400 md:hidden truncate">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        user.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 hidden lg:table-cell">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'student' && (
                          <button
                            onClick={() => setSelectedStudentForCourses(user)}
                            disabled={loading}
                            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-700/50 rounded transition disabled:opacity-50"
                            title="View Courses"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={loading}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded transition disabled:opacity-50"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.name)}
                          disabled={loading}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                  })
                  .map((page, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== page - 1) {
                      return [
                        <span key={`ellipsis-${page}`} className="px-2 py-1 text-slate-500">...</span>,
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded transition ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-white'
                          }`}
                        >
                          {page}
                        </button>
                      ]
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded transition ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Courses Modal */}
      {selectedStudentForCourses && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedStudentForCourses.name}'s Courses</h2>
                <p className="text-sm text-slate-400 mt-1">{selectedStudentForCourses.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForCourses(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const studentCourses = getStudentCourses(selectedStudentForCourses.id)
                return studentCourses.length > 0 ? (
                  <div className="space-y-3">
                    {studentCourses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700 hover:border-slate-600 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm">{enrollment.courseTitle}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {enrollment.courseCategory && (
                              <span className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded text-xs font-medium">
                                {enrollment.courseCategory}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              enrollment.completed
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {enrollment.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-right mb-2">
                              <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-400 mt-1 block">{enrollment.progress || 0}%</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCancelCourseEnrollment(enrollment.id, enrollment.courseTitle)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition flex-shrink-0"
                            title="Cancel Enrollment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-slate-400 text-sm font-medium">No courses enrolled</p>
                    <p className="text-slate-500 text-xs mt-1">This student hasn't enrolled in any courses yet</p>
                  </div>
                )
              })()}
            </div>

            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedStudentForCourses(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
