'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Search, Target, Award } from '@/lib/icons'
import Link from 'next/link'
import { StatCard } from '../cards/StatCard'
import { CourseCard } from '../cards/CourseCard'

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

interface DashboardTabProps {
  enrolledCourses: Course[]
  allCourses: Course[]
  stats: {
    totalEnrolled: number
    avgProgress: number
    completed: number
    inProgress: number
    certificates: number
  }
  onAddToCart: (courseId: string) => void
  onAddToWishlist: (courseId: string) => void
  onEnrollClick: (courseId: string) => void
  wishlist: string[]
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  enrolledCourses,
  allCourses,
  stats,
  onAddToCart,
  onAddToWishlist,
  onEnrollClick,
  wishlist
}) => {
  const router = useRouter()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-slate-400">Here's your learning overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Enrolled Courses" value={stats.totalEnrolled} Icon={BookOpen} />
        <StatCard label="In Progress" value={stats.inProgress} Icon={Target} />
        <StatCard label="Completed" value={stats.completed} Icon={Award} />
        <StatCard label="Certificates" value={stats.certificates} Icon={Award} />
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.filter(c => c.progress! > 0 && c.progress! < 100).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {enrolledCourses
              .filter(c => c.progress! > 0 && c.progress! < 100)
              .slice(0, 3)
              .map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnail={course.thumbnail}
                  category={course.category}
                  level={course.level}
                  price={course.price}
                  instructor={course.instructor}
                  duration={course.duration}
                  progress={course.progress}
                  variant="continue"
                />
              ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      {allCourses.filter(c => !enrolledCourses.some(ec => ec.id === c.id)).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recommended for You</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allCourses
              .filter(c => !enrolledCourses.some(ec => ec.id === c.id))
              .slice(0, 4)
              .map((course) => (
                <div key={course.id} className="group relative cursor-pointer" onClick={() => router.push(`/course/${course.id}`)}>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700 h-full flex flex-col">
                    {course.thumbnail && (
                      <div className="h-32 overflow-hidden relative">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddToWishlist(course.id)
                          }}
                          className={`absolute top-2 right-2 p-2 rounded-full transition ${
                            wishlist.includes(course.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-900/70 text-slate-300 hover:text-red-400'
                          }`}
                          title={wishlist.includes(course.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <svg className="w-4 h-4" fill={wishlist.includes(course.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full mb-2 w-fit">
                        {course.category}
                      </span>
                      <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 flex-1">{course.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400">{course.level}</span>
                        <span className="text-sm text-teal-400 font-semibold">{course.price}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEnrollClick(course.id)
                        }}
                        className="w-full px-3 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition font-semibold text-xs"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
