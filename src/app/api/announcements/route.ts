import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const announcements = await prisma.userAnnouncementRead.findMany({
      where: { userId },
      include: {
        announcement: {
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            status: true,
            createdAt: true,
            admin: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return Response.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminId = request.headers.get('x-admin-id')
    const userRole = request.headers.get('x-user-role')
    if (!adminId || userRole?.toUpperCase() !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, imageUrl, target } = body

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        status: 'PUBLISHED',
        target: target || 'ALL',
        createdBy: adminId
      }
    })

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true }
    })

    // Create read records for all users individually (SQLite doesn't support skipDuplicates)
    for (const user of allUsers) {
      try {
        await prisma.userAnnouncementRead.create({
          data: {
            userId: user.id,
            announcementId: announcement.id,
            isRead: false
          }
        })
      } catch (err) {
        // Skip if already exists (duplicate)
        continue
      }
    }

    return Response.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return Response.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
