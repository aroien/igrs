'use client'

import React from 'react'
import { BookOpen } from '@/lib/icons'
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

interface EnrolledTabProps {
  enrolledCourses: Course[]
  onBrowseClick: () => void
}

export const EnrolledTab: React.FC<EnrolledTabProps> = ({
  enrolledCourses,
  onBrowseClick
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">My Enrolled Courses</h1>
        <button
          onClick={onBrowseClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
        >
          + Browse Courses
        </button>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-16 border border-slate-700 text-center">
          <BookOpen className="w-24 h-24 mx-auto mb-4 text-slate-600" />
          <h3 className="text-2xl font-bold text-white mb-2">No Enrolled Courses</h3>
          <p className="text-slate-400 mb-6">Start your learning journey today!</p>
          <button
            onClick={onBrowseClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
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
              isEnrolled={true}
              variant="enrolled"
            />
          ))}
        </div>
      )}
    </div>
  )
}
