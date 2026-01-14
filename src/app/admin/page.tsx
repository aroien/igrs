'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from '@/lib/icons'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'
import AdminSidebar from '@/components/admin/AdminSidebar'
import OverviewTab from '@/components/admin/OverviewTab'
import UserManagementTab from '@/components/admin/UserManagementTab'
import CourseManagementTab from '@/components/admin/CourseManagementTab'
import EnrollmentsTab from '@/components/admin/EnrollmentsTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'
import SettingsTab from '@/components/admin/SettingsTab'
import CategoryManagementTab from '@/components/admin/CategoryManagementTab'
import PaymentManagementTab from '@/components/admin/PaymentManagementTab'
import CouponManagementTab from '@/components/admin/CouponManagementTab'
import SupportTicketsTab from '@/components/admin/SupportTicketsTab'
import AuditLogsTab from '@/components/admin/AuditLogsTab'
import AnnouncementsTab from '@/components/admin/AnnouncementsTab'
import Toast from '@/components/admin/Toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { toasts, removeToast, success, error, info, warning } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalRevenue: 0
  })

  const updateStats = (userList: any[], courseList: any[], enrollmentList: any[]) => {
    setStats({
      totalUsers: userList.length,
      totalCourses: courseList.length,
      totalEnrollments: enrollmentList.length,
      totalTeachers: userList.filter((u: any) => u.role === 'teacher').length,
      totalStudents: userList.filter((u: any) => u.role === 'student').length,
      totalRevenue: enrollmentList.length * 299
    })
  }

  const loadData = async () => {
    try {
      // Fetch courses from database API
      const coursesRes = await fetch('/api/courses');
      const coursesData = coursesRes.ok ? await coursesRes.json() : [];
      setCourses(coursesData);

      // For now, load users and enrollments from localStorage (can be migrated later)
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      setUsers(storedUsers);
      setEnrollments(storedEnrollments);

      updateStats(storedUsers, coursesData, storedEnrollments);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  const handleUpdateUsers = (updatedUsers: any[]) => {
    setUsers(updatedUsers)
    updateStats(updatedUsers, courses, enrollments)
  }

  const handleUpdateCourses = (updatedCourses: any[]) => {
    setCourses(updatedCourses)
    updateStats(users, updatedCourses, enrollments)
  }

  useEffect(() => {
    if (!currentUser || currentUser.role?.toLowerCase() !== 'admin') {
      router.push('/login')
      return
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, router])

  if (!currentUser || currentUser.role?.toLowerCase() !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" aria-hidden />
            ) : (
              <Menu className="w-6 h-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex pt-14 md:pt-0">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab)
            setSidebarOpen(false)
          }} 
          sidebarOpen={sidebarOpen}
          stats={{
            totalUsers: stats.totalUsers,
            totalCourses: stats.totalCourses,
            totalEnrollments: stats.totalEnrollments,
            totalRevenue: stats.totalRevenue
          }}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              users={users} 
              courses={courses}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementTab 
              users={users} 
              currentUser={currentUser}
              onUpdateUsers={handleUpdateUsers}
              enrollments={enrollments}
              courses={courses}
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'courses' && (
            <CourseManagementTab 
              courses={courses}
              currentUser={currentUser}
              onUpdateCourses={handleUpdateCourses}
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'enrollments' && (
            <EnrollmentsTab 
              enrollments={enrollments}
              users={users}
              courses={courses}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              stats={stats}
              users={users}
              courses={courses}
              enrollments={enrollments}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              stats={{
                totalUsers: stats.totalUsers,
                totalCourses: stats.totalCourses,
                totalEnrollments: stats.totalEnrollments
              }}
              currentUser={currentUser}
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManagementTab 
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentManagementTab 
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponManagementTab 
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'support' && (
            <SupportTicketsTab 
              showToast={{ success, error, info, warning }}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogsTab 
              currentUser={currentUser}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsTab />
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}
