'use client'

interface EnrollmentsTabProps {
  enrollments: any[]
  users: any[]
  courses: any[]
}

export default function EnrollmentsTab({ enrollments, users, courses }: EnrollmentsTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Enrollments</h1>
          <p className="text-sm text-slate-400">{enrollments.length} total enrollments</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden lg:table-cell">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const student = users.find(u => u.id === enrollment.userId)
                const course = courses.find(c => c.id === enrollment.courseId)
                return (
                  <tr key={enrollment.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{student?.name || 'Unknown Student'}</span>
                        <span className="text-xs text-slate-400 md:hidden">{course?.title || 'Unknown Course'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 hidden md:table-cell">
                      {course?.title || 'Unknown Course'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{enrollment.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        enrollment.completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {enrollment.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 hidden lg:table-cell">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {enrollments.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-3">📝</div>
              <p className="text-slate-400 text-sm font-medium">No enrollments found</p>
              <p className="text-slate-500 text-xs mt-1">Student enrollments will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
