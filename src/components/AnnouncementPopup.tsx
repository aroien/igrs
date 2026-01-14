'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Bell } from '@/lib/icons'

interface Announcement {
  id: string
  title: string
  content: string
  imageUrl?: string
  target: string
  createdAt: string
}

export default function AnnouncementPopup() {
  const { currentUser } = useAuth()
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements', {
          headers: {
            'x-user-id': currentUser.id
          }
        })
        if (response.ok) {
          const data = await response.json()
          // Get unread announcements that should show on homepage
          const unread = data
            .filter((record: any) => !record.isRead && 
              (record.announcement.target === 'ALL' || record.announcement.target === 'HOMEPAGE'))
            .map((record: any) => record.announcement)
          setUnreadAnnouncements(unread)
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
    // Poll for new announcements every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [currentUser])

  if (!currentUser || loading || unreadAnnouncements.length === 0) {
    return null
  }

  const visibleAnnouncements = unreadAnnouncements.filter(
    ann => !dismissed.has(ann.id)
  )

  if (visibleAnnouncements.length === 0) {
    return null
  }

  const current = visibleAnnouncements[currentIndex % visibleAnnouncements.length]

  const handleDismiss = () => {
    setDismissed(prev => new Set([...prev, current.id]))
  }

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl border border-blue-500/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/30">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 animate-pulse" />
            <span className="font-semibold text-sm">New Announcement</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-500/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-lg">{current.title}</h3>
          
          {current.imageUrl && (
            <img
              src={current.imageUrl}
              alt={current.title}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          
          <p className="text-sm text-blue-50 line-clamp-3">
            {current.content}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                window.location.href = '/inbox'
              }}
              className="flex-1 px-3 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              View Full
            </button>
            {visibleAnnouncements.length > 1 && (
              <button
                onClick={handleNext}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-sm transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Footer - Pagination */}
        {visibleAnnouncements.length > 1 && (
          <div className="px-4 py-2 bg-blue-500/20 flex items-center justify-center gap-1">
            {visibleAnnouncements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex % visibleAnnouncements.length
                    ? 'bg-white'
                    : 'bg-blue-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
