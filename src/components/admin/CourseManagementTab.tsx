'use client'

import { useState, useMemo } from 'react'
import LessonForm from './LessonForm'
import LessonList from './LessonList'

interface CourseManagementTabProps {
  courses: any[]
  currentUser: any
  onUpdateCourses: (courses: any[]) => void
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function CourseManagementTab({ courses, currentUser, onUpdateCourses, showToast }: CourseManagementTabProps) {
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null)
  const [modules, setModules] = useState<any[]>([])
  const [currentModule, setCurrentModule] = useState<any>(null)
  const [showCourseContent, setShowCourseContent] = useState(true)
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resources, setResources] = useState<any[]>([])
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    url: '',
    type: 'document'
  })
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    lessons: [] as any[]
  })
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: 'GIS',
    level: 'Beginner',
    duration: '',
    price: '',
    thumbnail: '',
    lessons: '',
    instructor: '',
    modules: [] as any[]
  })

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory
      const matchesLevel = filterLevel === 'all' || course.level === filterLevel
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, searchTerm, filterCategory, filterLevel])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate modules and lessons
      if (modules.length === 0) {
        showToast?.error('Please add at least one module with lessons')
        setLoading(false)
        return
      }

      const hasLessons = modules.some(m => m.lessons && m.lessons.length > 0)
      if (!hasLessons) {
        showToast?.error('Please add lessons to at least one module')
        setLoading(false)
        return
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Calculate total lessons from modules and ensure each lesson has required fields
      const validModules = modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: (m.lessons || []).map((lesson: any) => ({
          id: lesson.id || `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: lesson.title || 'Untitled Lesson',
          type: lesson.type || 'video',
          duration: lesson.duration || '0',
          videoUrl: lesson.videoUrl || '',
          content: lesson.content || '',
          fileName: lesson.fileName || ''
          // Excluding filePreview to reduce storage size
        }))
      }))
      
      const totalLessons = validModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)

      if (editingCourse) {
        const updated = courses.map(c =>
          c.id === editingCourse.id
            ? cleanCourseData({ 
                ...c, 
                ...courseFormData, 
                instructor: courseFormData.instructor || currentUser.name,
                modules: validModules,
                lessons: totalLessons,
                teacherId: c.teacherId || currentUser.id
              })
            : c
        )
        onUpdateCourses(updated)
        localStorage.setItem('courses', JSON.stringify(updated))
        showToast?.success(`Course "${courseFormData.title}" updated successfully`)
      } else {
        const newCourse = cleanCourseData({
          id: Date.now().toString(),
          ...courseFormData,
          instructor: courseFormData.instructor || currentUser.name,
          teacherId: currentUser.id,
          createdAt: new Date().toISOString(),
          students: 0,
          modules: validModules,
          lessons: totalLessons
        })
        const updated = [...courses, newCourse]
        onUpdateCourses(updated)
        localStorage.setItem('courses', JSON.stringify(updated))
        showToast?.success(`Course "${courseFormData.title}" created successfully`)
      }

      resetForm()
    } catch (err) {
      console.error('Error saving course:', err)
      showToast?.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (course: any) => {
    setEditingCourse(course)
    setImagePreview(course.thumbnail || null)
    setModules(course.modules || [])
    setCourseFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      thumbnail: course.thumbnail || '',
      lessons: course.lessons || '',
      instructor: course.instructor || '',
      modules: course.modules || []
    })
    setShowCourseForm(true)
  }

  const deleteCourse = async (courseId: string, courseTitle: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const updated = courses.filter(c => c.id !== courseId)
      onUpdateCourses(updated)
      localStorage.setItem('courses', JSON.stringify(updated))
      showToast?.success(`Course "${courseTitle}" deleted successfully`)
    } catch (err) {
      showToast?.error('Failed to delete course')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Title', 'Category', 'Level', 'Duration', 'Price', 'Lessons', 'Instructor']
    const rows = filteredCourses.map(c => [
      c.title,
      c.category,
      c.level,
      c.duration,
      c.price,
      c.lessons || 0,
      c.instructor
    ])
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `courses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast?.success('Courses exported successfully')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast?.error('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast?.error('Image size should be less than 2MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setImagePreview(base64String)
      setCourseFormData({ ...courseFormData, thumbnail: base64String })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setCourseFormData({ ...courseFormData, thumbnail: '' })
  }

  const resetForm = () => {
    setShowCourseForm(false)
    setEditingCourse(null)
    setImagePreview(null)
    setModules([])
    setCurrentModule(null)
    setShowModuleForm(false)
    setCourseFormData({
      title: '',
      description: '',
      category: 'GIS',
      level: 'Beginner',
      duration: '',
      price: '',
      thumbnail: '',
      lessons: '',
      instructor: '',
      modules: []
    })
    setModuleFormData({
      title: '',
      description: '',
      lessons: []
    })
  }

  // Utility function to clean course data before storage (removes large base64 data)
  const cleanCourseData = (course: any) => {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      thumbnail: course.thumbnail && !course.thumbnail.startsWith('data:') ? course.thumbnail : '', // Only keep URL, not base64
      instructor: course.instructor,
      teacherId: course.teacherId,
      students: course.students || 0,
      createdAt: course.createdAt,
      lessons: course.lessons,
      modules: (course.modules || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: (m.lessons || []).map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          duration: l.duration,
          videoUrl: l.videoUrl,
          content: l.content,
          fileName: l.fileName
        }))
      }))
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Course Management</h1>
          <p className="text-sm text-slate-400">
            {filteredCourses.length} of {courses.length} courses
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={() => {
              if (showCourseForm) {
                resetForm()
              } else {
                setShowCourseForm(true)
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            {showCourseForm ? 'Cancel' : '+ Add Course'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-slate-800/50 rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="GIS">GIS</option>
            <option value="Remote Sensing">Remote Sensing</option>
            <option value="Data Science">Data Science</option>
            <option value="Cartography">Cartography</option>
            <option value="Programming">Programming</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {showCourseForm && (
        <div className="mb-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Course Title *</label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Advanced GIS Analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Instructor</label>
                <input
                  type="text"
                  value={courseFormData.instructor}
                  onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Your name (auto-filled)"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Description *</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!courseFormData.title) {
                      showToast?.error('Please enter a course title first')
                      return
                    }
                    
                    // AI-powered description generator
                    const category = courseFormData.category
                    const level = courseFormData.level
                    const title = courseFormData.title
                    
                    const templates = {
                      Beginner: [
                        `Master the fundamentals of ${category} with this comprehensive ${level.toLowerCase()} course. Perfect for those starting their journey in ${title}. Learn essential concepts, practical techniques, and build a strong foundation through hands-on projects and real-world examples.`,
                        `Start your ${category} journey with this beginner-friendly course designed for ${title}. No prior experience needed! Discover core principles, step-by-step tutorials, and practical applications that will transform you from novice to confident practitioner.`,
                        `Unlock the world of ${category} through this expertly crafted ${level.toLowerCase()} program. ${title} made simple and accessible. Gain practical skills, understand key concepts, and complete engaging exercises that prepare you for real-world challenges.`
                      ],
                      Intermediate: [
                        `Elevate your ${category} expertise with this ${level.toLowerCase()} course on ${title}. Build upon your foundational knowledge, explore advanced techniques, and tackle complex projects. Perfect for those ready to take their skills to the next level.`,
                        `Advance your ${category} capabilities through ${title}. This ${level.toLowerCase()} program deepens your understanding, introduces sophisticated methodologies, and provides professional-grade insights through practical case studies and industry best practices.`,
                        `Take your ${category} skills beyond the basics with this comprehensive ${level.toLowerCase()} training. ${title} explored in depth with advanced concepts, real-world scenarios, and expert strategies that distinguish professionals from beginners.`
                      ],
                      Advanced: [
                        `Master advanced ${category} concepts with this expert-level course on ${title}. Designed for experienced practitioners seeking to achieve mastery. Explore cutting-edge techniques, industry secrets, and sophisticated strategies used by top professionals.`,
                        `Reach the pinnacle of ${category} expertise through this ${level.toLowerCase()} masterclass. ${title} dissected at the highest level, featuring complex problem-solving, advanced methodologies, and professional insights that define industry leaders.`,
                        `Achieve professional mastery in ${category} with this comprehensive ${level.toLowerCase()} program. ${title} taught by experts for experts, covering advanced topics, optimization strategies, and real-world applications that separate the exceptional from the ordinary.`
                      ]
                    }
                    
                    const levelTemplates = templates[level as keyof typeof templates] || templates.Beginner
                    const randomDescription = levelTemplates[Math.floor(Math.random() * levelTemplates.length)]
                    
                    setCourseFormData({ ...courseFormData, description: randomDescription })
                    showToast?.success('AI description generated!')
                  }}
                  disabled={loading || !courseFormData.title}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white text-xs font-medium rounded-md transition-all disabled:cursor-not-allowed"
                >
                  <span>✨</span>
                  <span>Generate with AI</span>
                </button>
              </div>
              <textarea
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                required
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                placeholder="What will students learn?"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
                <select
                  value={courseFormData.category}
                  onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="GIS">GIS</option>
                  <option value="Remote Sensing">Remote Sensing</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cartography">Cartography</option>
                  <option value="Programming">Programming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Level *</label>
                <select
                  value={courseFormData.level}
                  onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration *</label>
                <input
                  type="text"
                  value={courseFormData.duration}
                  onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="8 weeks"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Price *</label>
                <input
                  type="text"
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="$299"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Lessons</label>
                <input
                  type="number"
                  value={courseFormData.lessons}
                  onChange={(e) => setCourseFormData({ ...courseFormData, lessons: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Instructor</label>
                <input
                  type="text"
                  value={courseFormData.instructor}
                  onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Dr. John Doe"
                />
              </div>
            </div>

            {/* Thumbnail Upload Section */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Course Thumbnail</label>
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Course thumbnail preview" 
                      className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={loading}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors disabled:opacity-50"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-md text-sm text-slate-300 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{imagePreview ? 'Change Image' : 'Upload Image from PC'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Optional: URL Input as Alternative */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-800 text-slate-400">Or use a URL</span>
                  </div>
                </div>

                <input
                  type="url"
                  value={courseFormData.thumbnail || ''}
                  onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-slate-400">
                  Max file size: 2MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>

            {/* Course Modules & Lessons Builder */}
            <div className="border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">📚 Course Content</h3>
                  <p className="text-sm text-slate-400">
                    {modules.length} modules • {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(showModuleForm || showLessonForm) && (
                    <button
                      type="button"
                      onClick={() => setShowCourseContent(!showCourseContent)}
                      className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                        showCourseContent
                          ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <span>{showCourseContent ? '👁️ Hide' : '👁️ Show'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentModule(null)
                      setModuleFormData({ title: '', description: '', lessons: [] })
                      setShowModuleForm(true)
                      setShowCourseContent(false)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md flex items-center gap-2"
                  >
                    <span>➕</span>
                    <span>Add Module</span>
                  </button>
                </div>
              </div>

              {/* Modules List (Show First, More Prominent) - Hide when adding/editing */}
              {modules.length > 0 && !showModuleForm && showCourseContent && (
                <div className="space-y-3 mb-4">
                  {modules.map((module, idx) => (
                    <div 
                      key={module.id} 
                      className="group bg-gradient-to-r from-slate-700/30 to-slate-800/30 hover:from-slate-700/50 hover:to-slate-800/50 border border-slate-600 rounded-lg p-4 transition-all cursor-pointer"
                      onClick={() => {
                        setCurrentModule(module)
                        setModuleFormData(module)
                        setShowModuleForm(true)
                        setShowCourseContent(false)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold rounded">
                              Module {idx + 1}
                            </span>
                            <h4 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                              {module.title}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-400 mb-3">{module.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-500">
                              📖 {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500">
                              Click to edit
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentModule(module)
                              setModuleFormData(module)
                              setShowModuleForm(true)
                              setShowCourseContent(false)
                            }}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded text-xs font-medium transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const updatedModules = modules.filter(m => m.id !== module.id)
                              setModules(updatedModules)
                              
                              if (editingCourse) {
                                const totalLessons = updatedModules.reduce((acc, m) => acc + m.lessons.length, 0)
                                const updatedCourses = courses.map(c =>
                                  c.id === editingCourse.id
                                    ? { 
                                        ...c,
                                        modules: updatedModules,
                                        lessons: totalLessons
                                      }
                                    : c
                                )
                                onUpdateCourses(updatedCourses)
                                localStorage.setItem('courses', JSON.stringify(updatedCourses))
                              }
                              
                              showToast?.info('Module removed')
                            }}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded text-xs font-medium transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {modules.length === 0 && !showModuleForm && (
                <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <div className="text-5xl mb-3">📚</div>
                  <h4 className="text-lg font-semibold text-white mb-2">No Modules Yet</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Start building your course by adding modules with lessons
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentModule(null)
                      setModuleFormData({ title: '', description: '', lessons: [] })
                      setShowModuleForm(true)
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md"
                  >
                    ➕ Create First Module
                  </button>
                </div>
              )}

              {/* Module Builder Form */}
              {showModuleForm && (
                <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-2 border-slate-600 rounded-xl p-5 mb-4 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{currentModule ? '✏️' : '➕'}</span>
                      <span>{currentModule ? 'Edit Module' : 'Create New Module'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModuleForm(false)
                        setCurrentModule(null)
                        setModuleFormData({ title: '', description: '', lessons: [] })
                        setShowCourseContent(true)
                      }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">📝 Module Title *</label>
                      <input
                        type="text"
                        value={moduleFormData.title}
                        onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800/50 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="e.g., Introduction & Fundamentals"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-slate-200">📄 Module Description *</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!moduleFormData.title) {
                              showToast?.error('Please enter a module title first')
                              return
                            }
                            
                            // AI-powered module description generator
                            const title = moduleFormData.title
                            const courseTitle = courseFormData.title || 'this course'
                            
                            const templates = [
                              `In this module, you'll ${title.toLowerCase().includes('introduction') ? 'be introduced to the fundamental concepts and' : 'explore'} key principles of ${title}. Through practical examples and hands-on exercises, you'll gain a solid understanding of essential techniques and their real-world applications.`,
                              `This module covers ${title}, providing you with comprehensive knowledge and practical skills. Learn through step-by-step guidance, real-world scenarios, and interactive content designed to build your expertise progressively.`,
                              `Dive into ${title} with this comprehensive module. Master core concepts, develop practical skills, and understand how to apply what you learn to real-world challenges. Perfect for building a strong foundation in ${courseTitle}.`,
                              `Get started with ${title} and unlock new capabilities. This module combines theory with practice, offering clear explanations, hands-on activities, and expert insights to accelerate your learning journey.`,
                              `Explore the essentials of ${title} through engaging content and practical exercises. Build confidence as you progress through carefully structured lessons designed to maximize understanding and retention.`,
                              `Learn ${title} from the ground up with this well-structured module. Understand fundamental principles, practice key techniques, and prepare yourself for advanced topics with a solid knowledge base.`
                            ]
                            
                            const randomDescription = templates[Math.floor(Math.random() * templates.length)]
                            
                            setModuleFormData({ ...moduleFormData, description: randomDescription })
                            showToast?.success('AI description generated!')
                          }}
                          disabled={!moduleFormData.title}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white text-xs font-medium rounded-md transition-all disabled:cursor-not-allowed"
                        >
                          <span>✨</span>
                          <span>AI Generate</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={moduleFormData.description}
                        onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800/50 rounded-lg border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="e.g., Get started with the basics and understand core principles"
                      />
                    </div>
                  </div>

                  {/* Lessons Section */}
                  <div className="border-t border-slate-600 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-white flex items-center gap-2">
                        <span>🎓</span>
                        <span>Lessons</span>
                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full">{moduleFormData.lessons.length}</span>
                      </label>
                      {!showLessonForm && (
                        <button
                          type="button"
                          onClick={() => setShowLessonForm(true)}
                          className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
                        >
                          ➕ Add Lesson
                        </button>
                      )}
                    </div>

                    {/* Lesson Form Component */}
                    {showLessonForm && (
                      <div className="mb-4">
                        <LessonForm
                          editingLesson={editingLessonIndex !== null ? moduleFormData.lessons[editingLessonIndex] : undefined}
                          onSave={(lesson) => {
                            if (editingLessonIndex !== null) {
                              // Update existing lesson
                              const updatedLessons = [...moduleFormData.lessons]
                              updatedLessons[editingLessonIndex] = lesson
                              setModuleFormData({
                                ...moduleFormData,
                                lessons: updatedLessons
                              })
                              setEditingLessonIndex(null)
                            } else {
                              // Add new lesson
                              setModuleFormData({
                                ...moduleFormData,
                                lessons: [...moduleFormData.lessons, lesson]
                              })
                            }
                            setShowLessonForm(false)
                          }}
                          onCancel={() => {
                            setShowLessonForm(false)
                            setEditingLessonIndex(null)
                          }}
                          showToast={showToast}
                        />
                      </div>
                    )}

                    {/* Lesson List Component */}
                    <LessonList
                      lessons={moduleFormData.lessons}
                      onEdit={(idx) => {
                        setEditingLessonIndex(idx)
                        setShowLessonForm(true)
                      }}
                      onRemove={(idx) => {
                        setModuleFormData({
                          ...moduleFormData,
                          lessons: moduleFormData.lessons.filter((_, i) => i !== idx)
                        })
                      }}
                      showToast={showToast}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!moduleFormData.title?.trim() || !moduleFormData.description?.trim()) {
                          showToast?.error('Please fill in module title and description')
                          return
                        }
                        
                        if (currentModule) {
                          // Edit existing module
                          const updatedModules = modules.map(m => 
                            m.id === currentModule.id 
                              ? { ...moduleFormData, id: currentModule.id }
                              : m
                          )
                          setModules(updatedModules)
                          
                          // If we're editing an existing course, update it immediately in localStorage
                          if (editingCourse) {
                            const totalLessons = updatedModules.reduce((acc, m) => acc + m.lessons.length, 0)
                            const updatedCourses = courses.map(c =>
                              c.id === editingCourse.id
                                ? cleanCourseData({ 
                                    ...c,
                                    modules: updatedModules,
                                    lessons: totalLessons
                                  })
                                : c
                            )
                            onUpdateCourses(updatedCourses)
                            localStorage.setItem('courses', JSON.stringify(updatedCourses))
                          }
                          
                          showToast?.success('Module updated')
                        } else {
                          // Add new module
                          const newModules = [...modules, { ...moduleFormData, id: `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
                          setModules(newModules)
                          
                          // If we're editing an existing course, update it immediately in localStorage
                          if (editingCourse) {
                            const totalLessons = newModules.reduce((acc, m) => acc + m.lessons.length, 0)
                            const updatedCourses = courses.map(c =>
                              c.id === editingCourse.id
                                ? cleanCourseData({ 
                                    ...c,
                                    modules: newModules,
                                    lessons: totalLessons
                                  })
                                : c
                            )
                            onUpdateCourses(updatedCourses)
                            localStorage.setItem('courses', JSON.stringify(updatedCourses))
                          }
                          
                          showToast?.success('Module added')
                        }
                        setShowModuleForm(false)
                        setCurrentModule(null)
                        setModuleFormData({ title: '', description: '', lessons: [] })
                      }}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all"
                    >
                      ✅ {currentModule ? 'Update Module' : 'Save Module'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModuleForm(false)
                        setCurrentModule(null)
                        setModuleFormData({ title: '', description: '', lessons: [] })
                        setShowCourseContent(true)
                      }}
                      className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Modules List - Only show when NOT in module form mode */}
              {modules.length > 0 && showCourseContent && !showModuleForm && !showLessonForm && (
                <div className="space-y-4">
                  {modules.map((module, idx) => (
                    <div key={module.id} className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
                      {/* Module Header */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-700/50 p-4 border-b border-slate-600">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <h4 className="text-base font-bold text-white truncate">{module.title}</h4>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2 mb-2">{module.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <span>🎓</span>
                                <span>{module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}</span>
                              </span>
                              {module.lessons.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <span>⏱️</span>
                                  <span>{module.lessons.reduce((total: number, l: any) => total + (parseInt(l.duration) || 0), 0)} min total</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentModule(module)
                                setModuleFormData(module)
                                setShowModuleForm(true)
                              }}
                              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg transition-colors border border-blue-500/30"
                            >
                              ✎ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete module "${module.title}"?`)) {
                                  const updatedModules = modules.filter(m => m.id !== module.id)
                                  setModules(updatedModules)
                                  
                                  if (editingCourse) {
                                    const totalLessons = updatedModules.reduce((acc, m) => acc + m.lessons.length, 0)
                                    const updatedCourses = courses.map(c =>
                                      c.id === editingCourse.id
                                        ? cleanCourseData({ ...c, modules: updatedModules, lessons: totalLessons })
                                        : c
                                    )
                                    onUpdateCourses(updatedCourses)
                                    localStorage.setItem('courses', JSON.stringify(updatedCourses))
                                  }
                                  showToast?.success('Module deleted')
                                }
                              }}
                              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/30"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lessons List */}
                      {module.lessons.length > 0 ? (
                        <div className="p-4 space-y-2">
                          {module.lessons.map((lesson: any, lessonIdx: number) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all group/lesson"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400 flex items-center justify-center text-xs font-bold border border-teal-500/30">
                                {lessonIdx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="text-sm font-semibold text-white truncate">{lesson.title}</h5>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                    lesson.type === 'video' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    lesson.type === 'reading' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  }`}>
                                    {lesson.type === 'video' ? '🎥 Video' : lesson.type === 'reading' ? '📖 Reading' : '✏️ Quiz'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span>{lesson.duration}</span>
                                  </span>
                                  {lesson.fileName && (
                                    <span className="flex items-center gap-1 truncate">
                                      <span>📎</span>
                                      <span className="truncate">{lesson.fileName}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="text-3xl mb-2 opacity-50">📝</div>
                          <p className="text-sm text-slate-400">No lessons in this module yet</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-700 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
              </button>
              <button
                type="button"
                onClick={() => setShowCourseForm(false)}
                disabled={loading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-slate-400 text-lg font-medium mb-2">No courses found</p>
            <p className="text-slate-500 text-sm">
              {searchTerm || filterCategory !== 'all' || filterLevel !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first course'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
              {course.thumbnail && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop'
                    }}
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-medium">
                      {course.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCourse(course)}
                      disabled={loading}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded transition disabled:opacity-50"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id, course.title)}
                      disabled={loading}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition disabled:opacity-50"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white mb-2 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {course.lessons || 0} lessons
                    </span>
                  </div>
                  <span className="text-blue-400 font-semibold">{course.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
