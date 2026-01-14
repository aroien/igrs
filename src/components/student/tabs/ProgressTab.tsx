'use client'

import React from 'react'
import { BookOpen, BarChart3, Award, Target } from '@/lib/icons'
import { StatCard } from '../cards/StatCard'

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

interface ProgressTabProps {
  enrolledCourses: Course[]
  stats: {
    totalEnrolled: number
    avgProgress: number
    completed: number
    inProgress: number
    certificates: number
  }
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  enrolledCourses,
  stats
}) => {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">My Learning Progress</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Courses Enrolled" value={stats.totalEnrolled} Icon={BookOpen} />
        <StatCard label="Average Progress" value={`${stats.avgProgress}%`} Icon={BarChart3} />
        <StatCard label="Completed" value={stats.completed} Icon={Award} />
        <StatCard label="In Progress" value={stats.inProgress} Icon={Target} />
      </div>

      {/* Detailed Progress */}
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Course Progress Details</h3>
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No courses enrolled yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{course.title}</h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{course.category}</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">{course.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{course.progress}%</div>
                      <div className="text-xs text-slate-400">Complete</div>
                    </div>
                    {course.progress === 100 && (
                      <div className="text-green-400 text-2xl">✓</div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      course.progress === 100
                        ? 'bg-gradient-to-r from-green-500 to-teal-500'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
