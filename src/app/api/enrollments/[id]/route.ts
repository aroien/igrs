import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/enrollments/:id - Get enrollment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            teacher: true,
            lessons: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Get enrollment error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch enrollment' },
      { status: 500 }
    )
  }
}

// PUT /api/enrollments/:id - Update enrollment progress
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { progress } = body

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { progress }
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json(
      { message: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}

// DELETE /api/enrollments/:id - Unenroll student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.enrollment.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Unenrolled successfully' })
  } catch (error) {
    console.error('Unenroll error:', error)
    return NextResponse.json(
      { message: 'Failed to unenroll' },
      { status: 500 }
    )
  }
}
