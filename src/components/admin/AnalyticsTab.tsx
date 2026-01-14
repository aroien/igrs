'use client'

interface AnalyticsTabProps {
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
  enrollments: any[]
}

export default function AnalyticsTab({ stats, users, courses, enrollments }: AnalyticsTabProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* User Analytics */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">User Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300">Students</span>
                <span className="text-white font-medium">{stats.totalStudents}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.totalStudents / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300">Teachers</span>
                <span className="text-white font-medium">{stats.totalTeachers}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.totalTeachers / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300">Admins</span>
                <span className="text-white font-medium">{users.filter(u => u.role === 'admin').length}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totalUsers > 0 ? (users.filter(u => u.role === 'admin').length / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Analytics */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Course Categories</h3>
          <div className="space-y-2">
            {['GIS', 'Remote Sensing', 'Data Science', 'Cartography', 'Programming'].map(category => {
              const count = courses.filter(c => c.category === category).length
              return count > 0 ? (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{category}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Revenue Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Enrollments</p>
            <p className="text-2xl font-bold text-white">{enrollments.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Avg. per Course</p>
            <p className="text-2xl font-bold text-white">${courses.length > 0 ? (stats.totalRevenue / courses.length).toFixed(2) : '0.00'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-white">
              {enrollments.length > 0
                ? Math.round((enrollments.filter(e => e.completed).length / enrollments.length) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
