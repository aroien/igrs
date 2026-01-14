'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

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
  lessons: number
  students: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('my-courses')
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GIS',
    level: 'Beginner',
    duration: '',
    price: '',
    thumbnail: ''
  })

  useEffect(() => {
    if (!currentUser || currentUser.role?.toLowerCase() !== 'teacher') {
      router.push('/login')
      return
    }

    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    const teacherCourses = allCourses.filter((c: Course) => c.teacherId === currentUser.id)
    setMyCourses(teacherCourses)
  }, [currentUser, router])

  const handleCreateCourse = () => {
    if (!formData.title || !formData.description || !formData.duration || !formData.price) {
      alert('Please fill all required fields')
      return
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      ...formData,
      teacherId: currentUser!.id,
      lessons: 0,
      students: 0
    }

    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    allCourses.push(newCourse)
    localStorage.setItem('courses', JSON.stringify(allCourses))
    
    setMyCourses([...myCourses, newCourse])
    setFormData({
      title: '',
      description: '',
      category: 'GIS',
      level: 'Beginner',
      duration: '',
      price: '',
      thumbnail: ''
    })
    alert('Course created successfully!')
  }

  const deleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const updated = allCourses.filter((c: Course) => c.id !== courseId)
      localStorage.setItem('courses', JSON.stringify(updated))
      setMyCourses(myCourses.filter(c => c.id !== courseId))
    }
  }

  if (!currentUser || currentUser.role !== 'teacher') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex">
        <div className="w-64 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 fixed left-0 top-16 md:top-20 bottom-0">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{currentUser.name}</div>
                  <div className="text-xs text-purple-400">Instructor</div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'my-courses', icon: '📚', label: 'My Courses' },
                { id: 'create-course', icon: '➕', label: 'Create Course' },
                { id: 'analytics', icon: '📊', label: 'Analytics' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 ml-64 p-8">
          {activeTab === 'my-courses' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">My Courses</h1>

              {myCourses.length === 0 ? (
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-16 border border-slate-700 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Courses Yet</h3>
                  <p className="text-slate-400 mb-6">Start creating your first course</p>
                  <button
                    onClick={() => setActiveTab('create-course')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
                  >
                    Create Course
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => (
                    <div key={course.id} className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700">
                        {course.thumbnail && (
                          <div className="h-48 overflow-hidden">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                          <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => deleteCourse(course.id)}
                              className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create-course' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Create New Course</h1>
              <div className="max-w-2xl bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Course Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      placeholder="e.g., Advanced GIS Analysis"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      placeholder="Describe what students will learn..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      >
                        <option>GIS</option>
                        <option>Remote Sensing</option>
                        <option>Data Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Level *</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Duration *</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                        placeholder="e.g., 8 weeks"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Price *</label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                        placeholder="e.g., $299"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Thumbnail URL</label>
                    <input
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <button
                    onClick={handleCreateCourse}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-semibold text-lg"
                  >
                    Create Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Courses', value: myCourses.length, icon: '📚', gradient: 'from-purple-500 to-pink-500' },
                  { label: 'Total Students', value: myCourses.reduce((sum, c) => sum + c.students, 0), icon: '👨‍🎓', gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Total Revenue', value: `$${myCourses.reduce((sum, c) => sum + (parseInt(c.price.replace('$', '')) || 0) * c.students, 0)}`, icon: '💰', gradient: 'from-green-500 to-teal-500' },
                ].map((stat, i) => (
                  <div key={i} className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
                    <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
                      <div className="text-3xl mb-4">{stat.icon}</div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-slate-400 text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
