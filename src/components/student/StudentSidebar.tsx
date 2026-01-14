'use client'

import React from 'react'
import { X, Menu, LogOut, BookOpen, Search, BarChart3, Target, Award } from '@/lib/icons'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className: string }>
}

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  activeTab: string
  onTabChange: (tab: string) => void
  userName: string
  userInitial: string
  onLogout: () => void
}

export const StudentSidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  userName,
  userInitial,
  onLogout
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'enrolled', label: 'My Courses', icon: BookOpen },
    { id: 'browse', label: 'Browse Courses', icon: Search },
    { id: 'progress', label: 'Progress & Stats', icon: BarChart3 },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Target },
    { id: 'profile', label: 'Profile', icon: Award },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`w-64 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 fixed left-0 top-16 md:top-20 bottom-0 z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 flex flex-col h-full">
          {/* User Profile */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {userInitial}
              </div>
              <div>
                <div className="font-semibold text-white">{userName}</div>
                <div className="text-xs text-blue-400">Student</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    onToggle(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => onToggle(false)}
        />
      )}
    </>
  )
}
