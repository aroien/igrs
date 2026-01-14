'use client'

import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  BarChart3,
  Users as UsersIcon,
  BookOpen,
  ClipboardList,
  Tags,
  Wallet,
  TicketPercent,
  MessageCircle,
  FileText,
  Settings,
  LogOut,
  Bell
} from '@/lib/icons'
import { useAuth } from '@/context/AuthContext'

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  stats: {
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
    totalRevenue: number
  }
}

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, stats }: AdminSidebarProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const menuSections: Array<{
    title: string
    items: Array<{ id: string; label: string; icon: LucideIcon; badge?: number }>
  }> = [
    {
      title: 'Main',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'users', label: 'Users', icon: UsersIcon, badge: stats.totalUsers },
        { id: 'courses', label: 'Courses', icon: BookOpen, badge: stats.totalCourses },
        { id: 'enrollments', label: 'Enrollments', icon: ClipboardList, badge: stats.totalEnrollments },
        { id: 'categories', label: 'Categories & Tags', icon: Tags },
      ]
    },
    {
      title: 'Financial',
      items: [
        { id: 'payments', label: 'Payments', icon: Wallet },
        { id: 'coupons', label: 'Coupons', icon: TicketPercent },
      ]
    },
    {
      title: 'Support & System',
      items: [
        { id: 'support', label: 'Support Tickets', icon: MessageCircle },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'logs', label: 'Audit Logs', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ]

  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-50 top-14 md:top-0
      w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col
      transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700 hidden md:block">
        <h2 className="text-lg font-bold text-white mb-1">Admin Panel</h2>
        <p className="text-xs text-slate-400">Manage your platform</p>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-b border-slate-700 space-y-2">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Revenue</span>
            <span className="text-sm font-semibold text-green-400">${stats.totalRevenue.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" aria-hidden />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === item.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        <button
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="w-full px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" aria-hidden />
          Logout
        </button>
        <div className="text-xs text-slate-500 text-center">
          Version 1.0.0
        </div>
      </div>
    </aside>
  )
}
