import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return Response.json([])
    }

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query
            }
          },
          {
            description: {
              contains: query
            }
          },
          {
            category: {
              contains: query
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        price: true,
        status: true,
        teacher: {
          select: {
            name: true
          }
        }
      },
      take: 5
    })

    return Response.json(courses)
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
