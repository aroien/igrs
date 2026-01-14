'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Mail, ArrowLeft, Image as ImageIcon, Clock, User, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AnnouncementRecord {
  id: string
  isRead: boolean
  readAt?: string
  announcement: {
    id: string
    title: string
    content: string
    imageUrl?: string
    target?: string
    createdAt: string
    admin: {
      name: string
    }
  }
}

export default function InboxPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const unreadCount = announcements.filter(a => !a.isRead).length

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements', {
        headers: {
          'x-user-id': currentUser?.id || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Filter announcements that should show in inbox
        const inboxAnnouncements = data.filter((record: AnnouncementRecord) => 
          record.announcement.target === 'ALL' || record.announcement.target === 'INBOX'
        )
        setAnnouncements(inboxAnnouncements)
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (announcementId: string) => {
    try {
      await fetch(`/api/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: {
          'x-user-id': currentUser?.id || ''
        }
      })
      
      setAnnouncements(prev =>
        prev.map(ann =>
          ann.announcement?.id === announcementId
            ? { ...ann, isRead: true, readAt: new Date().toISOString() }
            : ann
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    loadAnnouncements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, router])

  if (!currentUser) {
    return null
  }

  const selected = selectedId ? announcements.find(a => a.id === selectedId) : null

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Mail className="w-6 h-6 text-teal-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-teal-500 items-center justify-center text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">My Inbox</h1>
            </div>
            {announcements.length > 0 && (
              <span className="ml-auto text-sm text-slate-400">{announcements.length} {announcements.length === 1 ? 'message' : 'messages'}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <ScrollArea className="h-[calc(100vh-240px)]">
                {loading ? (
                  <div className="p-6 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
                    <p className="mt-2">Loading...</p>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No announcements yet</p>
                    <p className="text-sm mt-1">Check back later for updates</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {announcements.map(record => (
                      <button
                        key={record.id}
                        onClick={() => {
                          setSelectedId(record.id)
                          if (!record.isRead) {
                            markAsRead(record.announcement.id)
                          }
                        }}
                        className={`w-full text-left p-4 transition-all duration-200 hover:bg-slate-700/50 ${
                          selectedId === record.id 
                            ? 'bg-teal-900/30 border-l-4 border-teal-400' 
                            : 'border-l-4 border-transparent'
                        } ${!record.isRead ? 'bg-slate-700/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {!record.isRead && (
                            <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate text-sm">
                              {record.announcement.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(record.announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          {/* Announcement Details */}
          <div className="lg:col-span-2">
            {selected ? (
              <Card className="bg-slate-800 border-slate-700 shadow-xl">
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-white mb-3">
                        {selected.announcement.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <User className="w-4 h-4" />
                          <span>From: <span className="font-medium text-slate-300">{selected.announcement.admin.name}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          {new Date(selected.announcement.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {!selected.isRead && (
                      <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                        New
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  {/* Image */}
                  {selected.announcement.imageUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 bg-slate-900/50">
                      <div className="relative group h-80">
                        <Image
                          src={selected.announcement.imageUrl}
                          alt={selected.announcement.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm">Announcement Image</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                      {selected.announcement.content}
                    </p>
                  </div>

                  {/* Read Status */}
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-teal-400" />
                      {selected.isRead && selected.readAt
                        ? `Read on ${new Date(selected.readAt).toLocaleString()}`
                        : 'Marked as read'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 shadow-xl p-12 text-center">
                <Mail className="w-20 h-20 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg">Select an announcement to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
