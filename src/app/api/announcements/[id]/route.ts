import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const updated = await prisma.userAnnouncementRead.updateMany({
      where: {
        userId,
        announcementId: id
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return Response.json(updated)
  } catch (error) {
    console.error('Error marking announcement as read:', error)
    return Response.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const record = await prisma.userAnnouncementRead.findUnique({
      where: {
        userId_announcementId: {
          userId,
          announcementId: id
        }
      },
      include: {
        announcement: true
      }
    })

    if (!record) {
      return Response.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return Response.json(record)
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return Response.json({ error: 'Failed to fetch announcement' }, { status: 500 })
  }
}
