'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  instructor?: string
  teacherId?: string
  students?: number
  rating?: number
  lessons?: number
  modules?: Module[]
  resources?: Resource[]
}

interface Resource {
  id: string
  title: string
  url: string
  type: 'document' | 'link' | 'video' | 'other'
}

interface Lesson {
  id: number
  title: string
  duration: string
  type: 'video' | 'reading' | 'quiz'
  videoUrl?: string
  content?: string
}

interface Module {
  id: number
  title: string
  description: string
  lessons: Lesson[]
}

export default function CourseDetail() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [expandedModules, setExpandedModules] = useState<number[]>([0])
  const [showSidebar, setShowSidebar] = useState(true)
  const [modules, setModules] = useState<Module[]>([])
  const [watermarkPosition, setWatermarkPosition] = useState<string>('top-4 right-4')
  const [showResources, setShowResources] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState<Course | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          
          // Transform API data to match frontend format
          const foundCourse = {
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            level: data.level,
            duration: data.duration,
            price: data.price.toString(),
            instructor: data.teacher?.name,
            teacherId: data.teacherId,
            students: data._count?.enrollments || 0,
            lessons: data.lessons?.length || 0,
            modules: data.modules || [],
            resources: data.resources || [],
          };
          
          // Load modules from course data
          const courseModules = foundCourse.modules || [];
          
          setCourse(foundCourse);
          setModules(courseModules);
          
          // Check enrollment status
          if (currentUser) {
            const enrollmentsRes = await fetch(`/api/enrollments?studentId=${currentUser.id}`);
            if (enrollmentsRes.ok) {
              const enrollments = await enrollmentsRes.json();
              const enrollment = enrollments.find((e: any) => e.courseId === params.id); // Find enrollment for this course
              
              if (enrollment) {
                setEnrolled(true);
                setCompletedLessons(enrollment.completedLessons || []);
                
                // Load first lesson or first uncompleted lesson
                if (courseModules.length > 0) {
                  const allLessons = courseModules.flatMap((m: Module) => m.lessons);
                  if (allLessons.length > 0) {
                    const firstUncompleted = allLessons.find((l: Lesson) => !enrollment.completedLessons?.includes(l.id));
                    if (firstUncompleted) {
                      setCurrentLesson(firstUncompleted);
                      // Find which module this lesson belongs to
                      let lessonCount = 0;
                      for (let i = 0; i < courseModules.length; i++) {
                        const moduleEnd = lessonCount + courseModules[i].lessons.length;
                        if (firstUncompleted.id > lessonCount && firstUncompleted.id <= moduleEnd) {
                          setExpandedModules([i]);
                          break;
                        }
                        lessonCount = moduleEnd;
                      }
                    } else {
                      setCurrentLesson(allLessons[0]);
                      setExpandedModules([0]);
                    }
                  }
                }
              } else {
                setEnrolled(false);
              }
            }
          }
        } else {
          console.error('Course not found');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [params.id, currentUser]);

  // Set random watermark position when lesson changes
  useEffect(() => {
    const positions = [
      'top-4 right-4',
      'top-4 left-4',
      'bottom-4 right-4',
      'bottom-4 left-4',
      'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    ]
    const randomPos = positions[Math.floor(Math.random() * positions.length)]
    setWatermarkPosition(randomPos)
  }, [currentLesson?.id])

  // Change watermark position every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const positions = [
        'top-4 right-4',
        'top-4 left-4',
        'bottom-4 right-4',
        'bottom-4 left-4',
        'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      ]
      const randomPos = positions[Math.floor(Math.random() * positions.length)]
      setWatermarkPosition(randomPos)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleEnroll = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Check if already enrolled
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]')
    const existingEnrollment = enrollments.find(
      (e: { userId: string; courseId: string; completedLessons?: number[] }) => 
        e.userId === currentUser.id && e.courseId === params.id
    )

    if (existingEnrollment) {
      // Already enrolled, just update the view
      setEnrolled(true)
      setCompletedLessons(existingEnrollment.completedLessons || [])
      if (modules.length > 0) {
        const allLessons = modules.flatMap(m => m.lessons)
        if (allLessons.length > 0) {
          // Find first uncompleted or first lesson
          const firstUncompleted = allLessons.find(l => !existingEnrollment.completedLessons?.includes(l.id))
          const lessonToSet = firstUncompleted || allLessons[0]
          setCurrentLesson(lessonToSet)
          setExpandedModules([0])
        }
      }
      return
    }

    // Add to cart and navigate to payment
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (!cart.includes(params.id)) {
      cart.push(params.id)
      localStorage.setItem('cart', JSON.stringify(cart))
    }
    
    router.push('/payment')
  }

  const markAsComplete = () => {
    if (!currentLesson || !currentUser) return

    // Check if already completed
    if (completedLessons.includes(currentLesson.id)) {
      alert('This lesson is already marked as complete!')
      return
    }

    const newCompleted = [...completedLessons, currentLesson.id]
    setCompletedLessons(newCompleted)

    // Update enrollment in localStorage
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]')
    const enrollmentIndex = enrollments.findIndex(
      (e: { userId: string; courseId: string }) => 
        e.userId === currentUser.id && e.courseId === params.id
    )

    if (enrollmentIndex !== -1) {
      const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
      const progress = Math.round((newCompleted.length / totalLessons) * 100)
      enrollments[enrollmentIndex].completedLessons = newCompleted
      enrollments[enrollmentIndex].progress = progress
      localStorage.setItem('enrollments', JSON.stringify(enrollments))
      
      // Show completion message
      alert(`✓ Lesson completed! Progress: ${progress}%`)
      
      // Auto-advance to next lesson
      const allLessons = modules.flatMap(m => m.lessons)
      const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id)
      if (currentIndex < allLessons.length - 1) {
        setTimeout(() => {
          navigateLesson('next')
        }, 500)
      } else {
        // Course completed!
        if (progress === 100) {
          alert('🎉 Congratulations! You have completed the course! Your certificate is now available.')
        }
      }
    }
  }

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!currentLesson) return
    
    const allLessons = modules.flatMap(m => m.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id)
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1])
      updateActiveModule(currentIndex - 1)
    } else if (direction === 'next' && currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1])
      updateActiveModule(currentIndex + 1)
    }
  }

  const updateActiveModule = (lessonIndex: number) => {
    let lessonCount = 0
    for (let i = 0; i < modules.length; i++) {
      lessonCount += modules[i].lessons.length
      if (lessonIndex < lessonCount) {
        if (!expandedModules.includes(i)) {
          setExpandedModules([...expandedModules, i])
        }
        break
      }
    }
  }

  const selectLesson = (lesson: Lesson, moduleIndex: number) => {
    setCurrentLesson(lesson)
    if (!expandedModules.includes(moduleIndex)) {
      setExpandedModules([...expandedModules, moduleIndex])
    }
  }

  const toggleModule = (moduleIndex: number) => {
    if (expandedModules.includes(moduleIndex)) {
      setExpandedModules(expandedModules.filter(i => i !== moduleIndex))
    } else {
      setExpandedModules([...expandedModules, moduleIndex])
    }
  }

  const getProgress = () => {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
    return Math.round((completedLessons.length / totalLessons) * 100)
  }

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => completedLessons.includes(l.id)).length
    return `${completed}/${module.lessons.length}`
  }

  const handleEditCourse = () => {
    if (course) {
      setEditFormData({ ...course })
      setIsEditMode(true)
    }
  }

  const handleSaveEdit = () => {
    if (!editFormData) return

    // Update course in localStorage
    const courses = JSON.parse(localStorage.getItem('courses') || '[]')
    const updatedCourses = courses.map((c: Course) =>
      c.id === params.id ? editFormData : c
    )
    localStorage.setItem('courses', JSON.stringify(updatedCourses))
    
    setCourse(editFormData)
    setIsEditMode(false)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditFormData(null)
  }

  // Show loading screen while checking enrollment
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Course...</h2>
          <p className="text-slate-400">Please wait</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-slate-400 mb-4">The course you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/courses" className="text-teal-400 hover:text-teal-300 transition">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  // Show learning interface for enrolled students with content
  if (enrolled && modules.length > 0 && currentLesson) {
    const allLessons = modules.flatMap(m => m.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id)
    const isCompleted = completedLessons.includes(currentLesson.id)
    const progress = getProgress()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Top Navigation Bar */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-40">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden p-2 hover:bg-slate-700 rounded text-white transition flex-shrink-0"
                >
                  ☰
                </button>
                <Link href="/student" className="text-teal-400 hover:text-teal-300 flex items-center gap-1 transition text-xs sm:text-sm flex-shrink-0">
                  ← Dashboard
                </Link>
                <div className="hidden md:block text-xs sm:text-sm text-slate-300 truncate">
                  {course.title}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                <div className="text-xs sm:text-sm text-slate-300 flex-shrink-0">
                  Progress: <span className="font-semibold bg-linear-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">{progress}%</span>
                </div>
                <div className="w-20 sm:w-24 md:w-32 h-2 bg-slate-700 rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                  <div 
                    className="h-full bg-linear-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - Course Content */}
          <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[57px] left-0 w-64 sm:w-72 lg:w-80 h-[calc(100vh-57px)] bg-slate-800/90 backdrop-blur-xl border-r border-slate-700 overflow-y-auto transition-transform duration-200 z-30`}>
            <div className="p-2 sm:p-3 lg:p-4">
              <h2 className="font-bold text-xs sm:text-sm lg:text-lg mb-2 sm:mb-3 lg:mb-4 text-white">Course</h2>
              
              {modules.map((module, moduleIndex) => (
                <div key={module.id} className="mb-3">
                  <button
                    onClick={() => toggleModule(moduleIndex)}
                    className="w-full text-left p-2 sm:p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 text-white truncate">
                          {expandedModules.includes(moduleIndex) ? '▼' : '▶'} M{module.id}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {getModuleProgress(module)} lessons
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {expandedModules.includes(moduleIndex) && (
                    <div className="ml-2 mt-2 space-y-1">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isActive = currentLesson?.id === lesson.id
                        const isDone = completedLessons.includes(lesson.id)
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson, moduleIndex)}
                            className={`w-full text-left p-1.5 sm:p-2 rounded text-xs sm:text-sm transition-colors ${
                              isActive 
                                ? 'bg-teal-500/20 border-l-4 border-teal-500 text-teal-400' 
                                : 'hover:bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                isDone ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'
                              }`}>
                                {isDone ? '✓' : lessonIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={isDone ? 'line-through text-slate-500 truncate' : 'truncate'}>
                                  {lesson.title}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                  <span className="flex-shrink-0">{lesson.duration}</span>
                                  <span className="flex-shrink-0">•</span>
                                  <span className="capitalize flex-shrink-0">{lesson.type}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 lg:ml-0">
            <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
              {/* Lesson Header */}
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white line-clamp-2">{currentLesson.title}</h1>
                  {isCompleted && (
                    <span className="px-2 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0">
                      ✓ Done
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 flex-shrink-0">
                    ⏱️ {currentLesson.duration}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    {currentLesson.type === 'video' && '🎥 Video'}
                    {currentLesson.type === 'reading' && '📄 Reading'}
                    {currentLesson.type === 'quiz' && '✏️ Quiz'}
                  </span>
                  <span className="text-gray-400 flex-shrink-0">
                    Lesson {currentIndex + 1} of {allLessons.length}
                  </span>
                </div>
              </div>

              {/* Lesson Content */}
              <div 
                className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 overflow-hidden mb-4 sm:mb-6"
                onContextMenu={(e) => {
                  e.preventDefault()
                  alert('Video download is not allowed')
                  return false
                }}
              >
                {currentLesson.type === 'video' && (
                  <div className="relative w-full bg-black" onContextMenu={(e) => e.preventDefault()}>
                    {currentLesson.videoUrl || currentLesson.content ? (
                      <>
                        <div style={{ paddingBottom: '56.25%', position: 'relative', height: 0, overflow: 'hidden' }}>
                          {/* YouTube Video */}
                          {currentLesson.videoUrl && (currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be')) && (
                            <iframe
                              src={
                                currentLesson.videoUrl.includes('youtube.com')
                                  ? currentLesson.videoUrl.replace('watch?v=', 'embed/')
                                  : currentLesson.videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                              }
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                              }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={currentLesson.title}
                            ></iframe>
                          )}
                          
                          {/* Vimeo Video */}
                          {currentLesson.videoUrl && currentLesson.videoUrl.includes('vimeo.com') && (
                            <iframe
                              src={currentLesson.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                              }}
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              title={currentLesson.title}
                            ></iframe>
                          )}
                          
                          {/* Local Video File or Direct URL */}
                          {(
                            !currentLesson.videoUrl ||
                            (!currentLesson.videoUrl.includes('youtube.com') && 
                             !currentLesson.videoUrl.includes('youtu.be') && 
                             !currentLesson.videoUrl.includes('vimeo.com'))
                          ) && (currentLesson.videoUrl || currentLesson.content) && (
                            <video
                              controls
                              autoPlay
                              controlsList="nodownload"
                              onContextMenu={(e) => {
                                e.preventDefault()
                                alert('Video download is not allowed')
                                return false
                              }}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000',
                                userSelect: 'none'
                              } as React.CSSProperties}
                            >
                              <source src={currentLesson.videoUrl || currentLesson.content} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                        {/* Email Watermark Protection - Random Position */}
                        <div 
                          className={`absolute ${watermarkPosition} bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs text-white pointer-events-none font-mono z-20 shadow-lg`}
                          style={{
                            transition: 'all 0.5s ease-in-out'
                          }}
                        >
                          {currentUser?.email || 'student@igrs.com'}
                        </div>
                        
                        {/* Additional Watermark Layer for Protection */}
                        <div className="absolute inset-0 pointer-events-none z-0" style={{
                          backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 35px,
                            rgba(255, 255, 255, 0.03) 35px,
                            rgba(255, 255, 255, 0.03) 70px
                          )`,
                          opacity: 0.5
                        }}></div>
                      </>
                    ) : (
                      <div className="w-full bg-black py-32 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl mb-3">🎥</div>
                          <p className="text-slate-400 text-lg">No video available for this lesson</p>
                          <p className="text-slate-500 text-sm mt-2">Upload a video in the lesson editor</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(currentLesson.type === 'reading' || currentLesson.type === 'quiz') && (
                  <div className="p-3 sm:p-4 md:p-6 lg:p-8 prose prose-invert max-w-none">
                    {currentLesson.content?.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 mt-4 sm:mt-6 md:mt-8 text-white">{line.slice(2)}</h1>
                      } else if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 mt-3 sm:mt-4 md:mt-6 text-white">{line.slice(3)}</h2>
                      } else if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 mt-2 sm:mt-3 md:mt-4 text-teal-400">{line.slice(4)}</h3>
                      } else if (line.startsWith('- ')) {
                        return <li key={idx} className="ml-4 sm:ml-6 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base text-slate-300">{line.slice(2)}</li>
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx} className="font-bold mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base text-white">{line.slice(2, -2)}</p>
                      } else if (line.startsWith('*') && line.endsWith('*')) {
                        return <p key={idx} className="italic text-slate-400 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">{line.slice(1, -1)}</p>
                      } else if (line.trim()) {
                        return <p key={idx} className="mb-2 sm:mb-3 text-xs sm:text-sm md:text-base text-slate-300">{line}</p>
                      } else {
                        return <br key={idx} />
                      }
                    })}
                  </div>
                )}
              </div>

              {/* Lesson Resources */}
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-white">📎 Resources</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <a href="#" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition truncate">
                    📄 Lesson Notes
                  </a>
                  <a href="#" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition truncate">
                    💾 Source Code
                  </a>
                  <a href="#" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition truncate">
                    🔗 References
                  </a>
                </div>
              </div>

              {/* Navigation & Actions */}
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => navigateLesson('prev')}
                    disabled={currentIndex === 0}
                    className="px-4 sm:px-6 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto text-xs sm:text-sm text-slate-300 font-medium"
                  >
                    ← Previous
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={markAsComplete}
                      className="px-4 sm:px-6 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium w-full sm:w-auto text-xs sm:text-sm shadow-lg"
                    >
                      ✓ Mark Complete
                    </button>
                  )}

                  {isCompleted && (
                    <div className="px-4 sm:px-6 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg font-medium w-full sm:w-auto text-center text-xs sm:text-sm">
                      ✓ Completed
                    </div>
                  )}

                  <button
                    onClick={() => navigateLesson('next')}
                    disabled={currentIndex === allLessons.length - 1}
                    className="px-4 sm:px-6 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto text-xs sm:text-sm shadow-lg font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Course Completion Banner */}
              {progress === 100 && (
                <div className="relative bg-linear-to-r from-green-500 to-teal-500 rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 mt-4 sm:mt-6 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-green-400/20 to-teal-400/20 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4">🎉</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Congratulations!</h2>
                    <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4">You&apos;ve completed the course!</p>
                    <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-white text-teal-600 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-slate-100 transition-colors shadow-lg">
                      📜 Certificate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    )
  }

  // Show message for enrolled students if course has no modules yet
  if (enrolled && modules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <nav className="bg-slate-800/90 backdrop-blur-xl shadow-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/student" className="text-teal-400 hover:text-teal-300 transition">
                ← Back to Dashboard
              </Link>
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                IGRS LMS
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-4">Course Content Coming Soon</h2>
            <p className="text-slate-400 mb-6">
              This course is still being prepared. The instructor hasn&apos;t added any modules or lessons yet.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              You&apos;re enrolled in <span className="text-white font-semibold">{course?.title}</span>
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/student"
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show enrollment page for non-enrolled users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/90 backdrop-blur-xl shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/courses" className="text-teal-400 hover:text-teal-300 transition">
              ← Back to Courses
            </Link>
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              IGRS
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="md:col-span-8">
            {/* Course Header */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
              <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs sm:text-sm font-medium rounded-full">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs sm:text-sm font-medium rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{course.title}</h1>
                </div>
                {currentUser && currentUser.id === course.teacherId && (
                  <button
                    onClick={handleEditCourse}
                    className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
              <p className="text-slate-300 mb-3 sm:mb-4 text-sm sm:text-base">{course.description}</p>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">👤</span>
                  <span className="hidden xs:inline">{course.instructor || 'Expert Instructor'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">👥</span>
                  <span>{course.students || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">📚</span>
                  <span>{modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">⏱️</span>
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>

            {/* Course Image */}
            {course.thumbnail && (
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 overflow-hidden mb-4 sm:mb-6">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-40 sm:h-48 md:h-64 object-cover"
                />
              </div>
            )}

            {/* What You'll Learn */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">What You&apos;ll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 text-lg flex-shrink-0">✓</span>
                  <span className="text-slate-300 text-sm">Master fundamental concepts and principles</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 text-lg flex-shrink-0">✓</span>
                  <span className="text-slate-300 text-sm">Apply knowledge through practical exercises</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 text-lg flex-shrink-0">✓</span>
                  <span className="text-slate-300 text-sm">Learn advanced techniques and best practices</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 text-lg flex-shrink-0">✓</span>
                  <span className="text-slate-300 text-sm">Build real-world projects and portfolio</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">📚 Course Content</h2>
              {modules.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
                      {/* Module Header */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-700/50 p-3 sm:p-4 border-b border-slate-600">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                                {moduleIndex + 1}
                              </span>
                              <h3 className="text-base sm:text-lg font-bold text-white truncate">{module.title}</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 ml-8 line-clamp-2">{module.description}</p>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-2 ml-8 flex-wrap">
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <span>🎓</span>
                                <span>{module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}</span>
                              </span>
                              {module.lessons.length > 0 && (
                                <span className="flex items-center gap-1 flex-shrink-0">
                                  <span>⏱️</span>
                                  <span>{module.lessons.reduce((total: number, l: any) => total + (parseInt(l.duration) || 0), 0)} min</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lessons List */}
                      {module.lessons.length > 0 ? (
                        <div className="p-3 sm:p-4 space-y-2">
                          {module.lessons.map((lesson: any, lessonIdx: number) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all"
                            >
                              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400 flex items-center justify-center text-xs font-bold border border-teal-500/30">
                                {lessonIdx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h5 className="text-xs sm:text-sm font-semibold text-white truncate">{lesson.title}</h5>
                                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                    lesson.type === 'video' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    lesson.type === 'reading' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  }`}>
                                    {lesson.type === 'video' ? '🎥' : lesson.type === 'reading' ? '📖' : '✏️'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 flex-wrap">
                                  <span className="flex items-center gap-1 flex-shrink-0">
                                    <span>⏱️</span>
                                    <span>{lesson.duration}</span>
                                  </span>
                                  {lesson.fileName && (
                                    <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                                      <span className="flex-shrink-0">📎</span>
                                      <span className="truncate text-xs">{lesson.fileName}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 sm:p-6 text-center">
                          <div className="text-2xl sm:text-3xl mb-2 opacity-50">📝</div>
                          <p className="text-xs sm:text-sm text-slate-400">No lessons in this module yet</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⏳</div>
                  <p className="text-xs sm:text-sm text-slate-400">Course content is being prepared by the instructor.</p>
                  <p className="text-slate-500 text-xs mt-1 sm:mt-2">Modules and lessons will appear here once added.</p>
                </div>
              )}
            </div>

            {/* Course Resources Section */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6">
              <button
                onClick={() => setShowResources(!showResources)}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-700/50 to-slate-700/30 hover:from-slate-700 hover:to-slate-700/50 rounded-lg transition-all"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  📚 Resources
                  <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">
                    {course.resources?.length || 0}
                  </span>
                </h2>
                <span className={`text-xl transition-transform ${showResources ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showResources && (
                <div className="mt-4 space-y-2">
                  {course.resources && course.resources.length > 0 ? (
                    course.resources.map((resource: any, idx: number) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-teal-500/50 transition-all group"
                      >
                        <span className="text-lg flex-shrink-0">
                          {resource.type === 'document' && '📄'}
                          {resource.type === 'link' && '🔗'}
                          {resource.type === 'video' && '🎥'}
                          {resource.type === 'other' && '📦'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-white group-hover:text-teal-400 transition-colors truncate">
                            {resource.title}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">{resource.type}</p>
                        </div>
                        <span className="text-teal-400 flex-shrink-0">↗</span>
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400">
                      <p className="text-sm">No resources available yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-4 sm:p-5 md:p-6 sticky top-20 md:top-24 lg:top-28">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                {course.price === 'Free' ? 'Free' : `৳${course.price}`}
              </div>
              
              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg mb-3 sm:mb-4"
                >
                  Enroll Now
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg mb-3 sm:mb-4"
                >
                  ✓ Continue Learning
                </button>
              )}

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Instructor</span>
                  <span className="font-medium text-white truncate ml-2">{course.instructor || 'Expert'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-medium text-white truncate ml-2">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Lessons</span>
                  <span className="font-medium text-white">{modules.length > 0 ? modules.reduce((acc, m) => acc + m.lessons.length, 0) : 'Coming soon'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Enrolled</span>
                  <span className="font-medium text-white">{course.students || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Certificate</span>
                  <span className="font-medium text-teal-400">✓ Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      {isEditMode && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Course</h2>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Course description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GIS">GIS</option>
                    <option value="Remote Sensing">Remote Sensing</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Geospatial Analysis">Geospatial Analysis</option>
                    <option value="Cartography">Cartography</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                  <select
                    value={editFormData.level}
                    onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4 weeks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                  <div className="flex items-center">
                    <span className="text-slate-400 mr-2">৳</span>
                    <input
                      type="text"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Instructor Name</label>
                <input
                  type="text"
                  value={editFormData.instructor || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, instructor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={editFormData.thumbnail || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-4 sm:p-6 flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
