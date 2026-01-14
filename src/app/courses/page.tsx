'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  price: string
  thumbnail?: string
  instructor?: string
  students?: number
  rating?: number
  lessons?: number
  modules?: any[]
}

function CoursesContent() {
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses?limit=100');
        if (response.ok) {
          const result = await response.json();
          // Handle paginated response
          const coursesData = result.data || result;
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.category === filter
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                          course.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-8 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Our Courses</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Master geospatial technologies with expert-led courses designed for all skill levels
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          />
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Courses' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-10 md:py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400">
                Showing <span className="text-white font-semibold">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'course' : 'courses'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300">
                    {course.thumbnail && (
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-semibold">
                          {course.category}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                          {course.level}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition">{course.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                        <span>👨‍🎓 {course.students || 0} students</span>
                        <span>📚 {course.lessons || 0} lessons</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          {course.instructor && (
                            <span className="text-sm text-slate-400">{course.instructor}</span>
                          )}
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">{course.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Courses() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoursesContent />
    </Suspense>
  )
}
