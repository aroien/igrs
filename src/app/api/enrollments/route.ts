import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/enrollments - Enroll student in course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId } = body

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId
      }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        progress: 0
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { message: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}

// GET /api/enrollments?studentId=xxx - Get student enrollments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID required' },
        { status: 400 }
      )
    }

    // Get total count for pagination
    const total = await prisma.enrollment.count({
      where: { studentId }
    })

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      skip,
      take: limit
    })

    return NextResponse.json({
      data: enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}
