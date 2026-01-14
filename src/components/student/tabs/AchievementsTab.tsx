'use client'

import React from 'react'
import { BookOpen, Target, Award, Star, BarChart3 } from '@/lib/icons'
import { AchievementCard } from '../cards/CertificateCard'

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

interface AchievementsTabProps {
  enrolledCourses: Course[]
  stats: {
    totalEnrolled: number
    avgProgress: number
    completed: number
    inProgress: number
    certificates: number
  }
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  enrolledCourses,
  stats
}) => {
  const achievements = [
    { 
      id: 'first-course', 
      name: 'First Step', 
      description: 'Enroll in your first course',
      Icon: Target,
      unlocked: stats.totalEnrolled >= 1,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'three-courses', 
      name: 'Learning Enthusiast', 
      description: 'Enroll in 3 courses',
      Icon: BookOpen,
      unlocked: stats.totalEnrolled >= 3,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'first-complete', 
      name: 'Course Master', 
      description: 'Complete your first course',
      Icon: Award,
      unlocked: stats.completed >= 1,
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      id: 'halfway', 
      name: 'Halfway There', 
      description: 'Reach 50% in any course',
      Icon: Target,
      unlocked: enrolledCourses.some(c => (c.progress || 0) >= 50),
      gradient: 'from-green-500 to-teal-500'
    },
    { 
      id: 'three-complete', 
      name: 'Achiever', 
      description: 'Complete 3 courses',
      Icon: Star,
      unlocked: stats.completed >= 3,
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      id: 'diverse', 
      name: 'Diverse Learner', 
      description: 'Enroll in 3 different categories',
      Icon: BarChart3,
      unlocked: new Set(enrolledCourses.map(c => c.category)).size >= 3,
      gradient: 'from-pink-500 to-red-500'
    },
  ]

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Achievements & Badges</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            id={achievement.id}
            name={achievement.name}
            description={achievement.description}
            Icon={achievement.Icon}
            unlocked={achievement.unlocked}
            gradient={achievement.gradient}
          />
        ))}
      </div>

      {/* Progress towards achievements */}
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Courses Enrolled</span>
              <span className="text-blue-400 font-semibold">{stats.totalEnrolled}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Courses Completed</span>
              <span className="text-green-400 font-semibold">{stats.completed}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Different Categories</span>
              <span className="text-purple-400 font-semibold">{new Set(enrolledCourses.map(c => c.category)).size}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Average Progress</span>
              <span className="text-yellow-400 font-semibold">{stats.avgProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
