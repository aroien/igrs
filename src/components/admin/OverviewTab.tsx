'use client'

interface OverviewTabProps {
  stats: {
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
    totalTeachers: number
    totalStudents: number
    totalRevenue: number
  }
  users: any[]
  courses: any[]
  setActiveTab?: (tab: string) => void
}

export default function OverviewTab({ stats, users, courses, setActiveTab }: OverviewTabProps) {
<<<<<<< HEAD
  const recentUsers = users.slice(-5).reverse()
  const recentCourses = courses.slice(-4).reverse()
=======
  const recentUsers = Array.isArray(users) ? users.slice(-5).reverse() : []
  const recentCourses = Array.isArray(courses) ? courses.slice(-4).reverse() : []
>>>>>>> 32f0cbd (auth updated)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setActiveTab?.('users')}
          className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:bg-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 group-hover:text-slate-300">Total Users</span>
            <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          <div className="text-xs text-green-400 mt-1">↑ {stats.totalStudents} students, {stats.totalTeachers} teachers</div>
          <div className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage →</div>
        </button>

        <button
          onClick={() => setActiveTab?.('courses')}
          className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:bg-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 group-hover:text-slate-300">Courses</span>
            <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
          <div className="text-xs text-slate-400 mt-1">Active courses</div>
          <div className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage →</div>
        </button>

        <button
          onClick={() => setActiveTab?.('enrollments')}
          className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:bg-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 group-hover:text-slate-300">Enrollments</span>
            <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalEnrollments}</div>
          <div className="text-xs text-blue-400 mt-1">Total enrollments</div>
          <div className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view →</div>
        </button>

        <button
          onClick={() => setActiveTab?.('analytics')}
          className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:bg-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 group-hover:text-slate-300">Revenue</span>
            <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
          </div>
          <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-green-400 mt-1">Total earnings</div>
          <div className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click for analytics →</div>
        </button>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">👥</div>
                <p className="text-slate-400 text-xs">No users yet</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {recentCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">📚</div>
                <p className="text-slate-400 text-xs">No courses yet</p>
              </div>
            ) : (
              recentCourses.map((course) => (
                <div key={course.id} className="p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white line-clamp-1">{course.title}</h4>
                    <span className="text-xs font-semibold text-blue-400">{course.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">
                      {course.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">
                      {course.level}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
