'use client'

import React from 'react'
import { BookOpen } from '@/lib/icons'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  price: string
  thumbnail?: string
  teacherId: string
  instructor: string
  lessons: number
  progress?: number
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

interface CertificatesTabProps {
  enrolledCourses: Course[]
  enrollments: Enrollment[]
  onDownloadClick: () => void
}

export const CertificatesTab: React.FC<CertificatesTabProps> = ({
  enrolledCourses,
  enrollments,
  onDownloadClick
}) => {
  const completedCourses = enrolledCourses.filter(c => c.progress === 100)

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">My Certificates</h1>

      {completedCourses.length === 0 ? (
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-16 border border-slate-700 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Certificates Yet</h3>
          <p className="text-slate-400 mb-6">Complete courses to earn certificates</p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
          >
            View My Courses
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {completedCourses.map((course) => {
            const enrollment = enrollments.find(e => e.courseId === course.id)
            return (
              <div key={course.id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-3xl">
                      🎓
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                      <p className="text-slate-400 text-sm">{course.category} - {course.level}</p>
                      <p className="text-green-400 text-xs mt-1">✓ Completed</p>
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Enrolled</div>
                        <div className="text-white font-semibold">
                          {enrollment ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Completed</div>
                        <div className="text-white font-semibold">
                          {enrollment?.lastAccessedAt ? new Date(enrollment.lastAccessedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onDownloadClick}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
                  >
                    Download Certificate
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
