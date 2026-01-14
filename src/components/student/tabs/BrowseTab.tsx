'use client'

import React, { useMemo } from 'react'
import { Search } from '@/lib/icons'
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

interface BrowseTabProps {
  allCourses: Course[]
  enrolledCourses: Course[]
  searchQuery: string
  filterCategory: string
  filterLevel: string
  sortBy: string
  categories: string[]
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onLevelChange: (level: string) => void
  onSortChange: (sort: string) => void
  onEnroll: (courseId: string) => void
}

export const BrowseTab: React.FC<BrowseTabProps> = ({
  allCourses,
  enrolledCourses,
  searchQuery,
  filterCategory,
  filterLevel,
  sortBy,
  categories,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
  onSortChange,
  onEnroll
}) => {
  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory
      const matchesLevel = filterLevel === 'all' || course.level === filterLevel
      return matchesSearch && matchesCategory && matchesLevel
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'price':
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
        case 'duration':
          return a.duration.localeCompare(b.duration)
        default:
          return 0
      }
    })

    return filtered
  }, [allCourses, searchQuery, filterCategory, filterLevel, sortBy])

  return (
    <div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Browse All Courses</h1>

      {/* Search and Filters */}
      <div className="bg-slate-800 rounded-lg p-3 sm:p-4 md:p-5 border border-slate-700 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search courses..."
              className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700">
          <div className="text-xs sm:text-sm text-slate-400">
            Showing {filteredAndSortedCourses.length} course{filteredAndSortedCourses.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 md:p-12 border border-slate-700 text-center">
          <Search className="w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-3 sm:mb-4 text-slate-600" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No courses found</h3>
          <p className="text-xs sm:text-sm text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filteredAndSortedCourses.map((course) => {
            const isEnrolled = enrolledCourses.some(c => c.id === course.id)
            return (
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
                isEnrolled={isEnrolled}
                onEnroll={() => onEnroll(course.id)}
                variant="browse"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
