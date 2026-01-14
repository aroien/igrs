'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useStudentToast } from '@/hooks/useStudentToast'
import Toast from '@/components/student/Toast'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { DashboardTab } from '@/components/student/tabs/DashboardTab'
import { EnrolledTab } from '@/components/student/tabs/EnrolledTab'
import { BrowseTab } from '@/components/student/tabs/BrowseTab'
import { ProgressTab } from '@/components/student/tabs/ProgressTab'
import { CertificatesTab } from '@/components/student/tabs/CertificatesTab'
import { AchievementsTab } from '@/components/student/tabs/AchievementsTab'
import { ProfileTab } from '@/components/student/tabs/ProfileTab'
import { CheckoutModal } from '@/components/student/CheckoutModal'

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

export default function StudentDashboard() {
  const router = useRouter()
  const { currentUser, logout } = useAuth()
  const { toasts, removeToast, success, error, info } = useStudentToast()
  
  // ============ STATE ============
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [cart, setCart] = useState<string[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null)
  const [coursesPage, setCoursesPage] = useState(1)
  const [enrollmentsPage, setEnrollmentsPage] = useState(1)
  const [coursesPagination, setCoursesPagination] = useState({ total: 0, pages: 1, hasMore: false })
  const [enrollmentsPagination, setEnrollmentsPagination] = useState({ total: 0, pages: 1, hasMore: false })
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // ============ AUTH & DATA LOADING ============
  useEffect(() => {
    if (!currentUser || currentUser.role?.toLowerCase() !== 'student') {
      router.push('/login')
      return
    }
    loadData()
  }, [currentUser, router, coursesPage, enrollmentsPage])

  const loadData = async () => {
    try {
      const coursesRes = await fetch(`/api/courses?page=${coursesPage}&limit=12`)
      let coursesData: Course[] = []
      if (coursesRes.ok) {
        const coursesResponse = await coursesRes.json()
        coursesData = coursesResponse.data || coursesResponse
        setCoursesPagination(coursesResponse.pagination || { total: coursesData.length, pages: 1, hasMore: false })
        setAllCourses(coursesData)
      }

      const enrollmentsRes = await fetch(`/api/enrollments?studentId=${currentUser?.id}&page=${enrollmentsPage}&limit=20`)
      if (enrollmentsRes.ok) {
        const enrollmentsResponse = await enrollmentsRes.json()
        const enrollmentsData = enrollmentsResponse.data || enrollmentsResponse
        setEnrollmentsPagination(enrollmentsResponse.pagination || { total: enrollmentsData.length, pages: 1, hasMore: false })
        setEnrollments(enrollmentsData)

        const enrolled = coursesData.filter((c: Course) =>
          enrollmentsData.some((e: any) => e.courseId === c.id)
        ).map((c: Course) => {
          const enrollment = enrollmentsData.find((e: any) => e.courseId === c.id)
          return {
            ...c,
            progress: enrollment?.progress || 0
          }
        })
        
        setEnrolledCourses(enrolled)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      const courses = JSON.parse(localStorage.getItem('courses') || '[]')
      setAllCourses(courses)

      const enrollmentsData = JSON.parse(localStorage.getItem('enrollments') || '[]')
      const studentEnrollments = enrollmentsData.filter((e: any) => e.userId === currentUser?.id)
      setEnrollments(studentEnrollments)

      const enrolled = courses.filter((c: Course) =>
        studentEnrollments.some((e: any) => e.courseId === c.id)
      ).map((c: Course) => {
        const enrollment = studentEnrollments.find((e: any) => e.courseId === c.id)
        return {
          ...c,
          progress: enrollment?.progress || 0
        }
      })
      
      setEnrolledCourses(enrolled)
    }
    
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setCart(savedCart)
    setWishlist(savedWishlist)
  }

  // ============ COURSE ENROLLMENT HANDLERS ============
  const enrollCourse = (courseId: string) => {
    if (!currentUser) return

    const enrollmentsData = JSON.parse(localStorage.getItem('enrollments') || '[]')
    
    if (enrollmentsData.some((e: any) => e.userId === currentUser.id && e.courseId === courseId)) {
      error('Already enrolled in this course')
      return
    }

    const newEnrollment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      lastAccessedAt: new Date().toISOString()
    }

    enrollmentsData.push(newEnrollment)
    localStorage.setItem('enrollments', JSON.stringify(enrollmentsData))

    const course = allCourses.find(c => c.id === courseId)
    if (course) {
      setEnrolledCourses([...enrolledCourses, { ...course, progress: 0 }])
      setEnrollments([...enrollments, newEnrollment])
      success(`Successfully enrolled in ${course.title}!`)
      setActiveTab('enrolled')
    }
  }

  const addToCart = (courseId: string) => {
    if (cart.includes(courseId)) {
      error('Course already in cart')
      return
    }

    const updatedCart = [...cart, courseId]
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))

    const course = allCourses.find(c => c.id === courseId)
    success(`${course?.title} added to cart!`)
  }

  const addToWishlist = (courseId: string) => {
    if (wishlist.includes(courseId)) {
      const updatedWishlist = wishlist.filter(id => id !== courseId)
      setWishlist(updatedWishlist)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    } else {
      const course = allCourses.find(c => c.id === courseId)
      const updatedWishlist = [...wishlist, courseId]
      setWishlist(updatedWishlist)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      success(`${course?.title} added to wishlist!`)
    }
  }

  const handleEnrollClick = (courseId: string) => {
    const course = allCourses.find(c => c.id === courseId)
    if (course) {
      setCheckoutCourse(course)
    }
  }

  const handleCheckoutSuccess = (courseId: string) => {
    setCheckoutCourse(null)
    loadData()
    success('Successfully enrolled! Welcome to your new course.')
    setActiveTab('enrolled')
  }

  const unenrollCourse = (courseId: string) => {
    const enrollmentsData = JSON.parse(localStorage.getItem('enrollments') || '[]')
    const filtered = enrollmentsData.filter((e: any) => e.courseId !== courseId)
    localStorage.setItem('enrollments', JSON.stringify(filtered))

    setEnrolledCourses(enrolledCourses.filter(c => c.id !== courseId))
    setEnrollments(filtered.filter((e: any) => e.userId === currentUser?.id))
    success('Successfully unenrolled from course')
  }

  // ============ PROFILE HANDLERS ============
  const updateProfile = (e: any) => {
    e.preventDefault()
    
    if (!currentUser) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      error('Please enter a valid email address')
      return
    }

    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        error('New passwords do not match')
        return
      }
      if (profileData.newPassword.length < 6) {
        error('Password must be at least 6 characters long')
        return
      }
      if (profileData.currentPassword !== (currentUser as any).password) {
        error('Current password is incorrect')
        return
      }
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const updatedUsers = users.map((u: any) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          name: profileData.name,
          email: profileData.email,
          ...(profileData.newPassword && { password: profileData.newPassword })
        }
      }
      return u
    })
    
    localStorage.setItem('users', JSON.stringify(updatedUsers))
    
    const updatedUser = updatedUsers.find((u: any) => u.id === currentUser.id)
    if (updatedUser) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }
    
    success('Profile updated successfully!')
    setShowProfileEdit(false)
    setProfileData({
      name: profileData.name,
      email: profileData.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // ============ COMPUTED VALUES ============
  const stats = useMemo(() => {
    const totalEnrolled = enrolledCourses.length
    const completed = enrolledCourses.filter(c => c.progress === 100).length
    const inProgress = enrolledCourses.filter(c => (c.progress || 0) > 0 && c.progress !== 100).length
    const avgProgress = totalEnrolled === 0 ? 0 : Math.round(
      enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalEnrolled
    )
    const certificates = enrolledCourses.filter(c => c.progress === 100).length

    return { totalEnrolled, completed, inProgress, avgProgress, certificates }
  }, [enrolledCourses])

  const categories = useMemo(() => {
    const cats = new Set(allCourses.map(c => c.category))
    return ['all', ...Array.from(cats)]
  }, [allCourses])

  // ============ FILTER & SORT LOGIC ============
  const filteredCourses = useMemo(() => {
    let filtered = allCourses

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory)
    }

    if (filterLevel !== 'all') {
      filtered = filtered.filter(c => c.level === filterLevel)
    }

    filtered.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price)
      if (sortBy === 'duration') return a.duration.localeCompare(b.duration)
      return 0
    })

    return filtered
  }, [allCourses, searchQuery, filterCategory, filterLevel, sortBy])

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} onClick={() => removeToast(toast.id)}>
            <Toast {...toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
      
      <div className="flex h-full relative">
        {/* Sidebar */}
        <StudentSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userName={currentUser?.name || 'Student'}
          userInitial={currentUser?.name?.[0]?.toUpperCase() || 'S'}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-3 sm:p-4 md:p-6 lg:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              enrolledCourses={enrolledCourses}
              allCourses={allCourses}
              stats={stats}
              wishlist={wishlist}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
              onEnrollClick={handleEnrollClick}
            />
          )}

          {/* Enrolled Courses Tab */}
          {activeTab === 'enrolled' && (
            <EnrolledTab
              enrolledCourses={enrolledCourses}
              onBrowseClick={() => setActiveTab('browse')}
            />
          )}

          {/* Browse Courses Tab */}
          {activeTab === 'browse' && (
            <BrowseTab
              allCourses={filteredCourses}
              enrolledCourses={enrolledCourses}
              searchQuery={searchQuery}
              filterCategory={filterCategory}
              filterLevel={filterLevel}
              sortBy={sortBy}
              categories={categories}
              onSearchChange={setSearchQuery}
              onCategoryChange={setFilterCategory}
              onLevelChange={setFilterLevel}
              onSortChange={setSortBy}
              onEnroll={handleEnrollClick}
            />
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <ProgressTab
              enrolledCourses={enrolledCourses}
              stats={stats}
            />
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <CertificatesTab
              enrolledCourses={enrolledCourses}
              enrollments={enrollments}
              onDownloadClick={() => info('Certificate download feature coming soon!')}
            />
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <AchievementsTab
              enrolledCourses={enrolledCourses}
              stats={stats}
            />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && currentUser && (
            <ProfileTab
              currentUser={currentUser as any}
              stats={stats}
              enrollments={enrollments}
              onUpdateProfile={updateProfile}
              onError={error}
              onSuccess={success}
            />
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutCourse && currentUser && (
        <CheckoutModal
          course={checkoutCourse}
          onClose={() => setCheckoutCourse(null)}
          onSuccess={handleCheckoutSuccess}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
