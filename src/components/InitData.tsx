'use client'

import { useEffect } from 'react'

export default function InitData() {
  useEffect(() => {
    // Only initialize if no data exists
    if (!localStorage.getItem('initialized')) {
      // Sample admin user
      const sampleUsers = [
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@igrs.com',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'teacher-1',
          name: 'Dr. Sarah Johnson',
          email: 'teacher@igrs.com',
          password: 'teacher123',
          role: 'teacher',
          createdAt: new Date().toISOString()
        },
        {
          id: 'student-1',
          name: 'John Student',
          email: 'student@igrs.com',
          password: 'student123',
          role: 'student',
          createdAt: new Date().toISOString()
        }
      ]

      // Sample courses
      const sampleCourses = [
        {
          id: '1767948249266',
          title: 'Advanced GIS Analysis',
          description: 'Master advanced GIS techniques including spatial analysis, geoprocessing, and data visualization using industry-standard tools.',
          category: 'GIS',
          level: 'Advanced',
          duration: '8 weeks',
          price: '$299',
          thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500',
          teacherId: 'teacher-1',
          instructor: 'Dr. Sarah Johnson',
          rating: 4.8,
          students: 234,
          lessons: 24
        },
        {
          id: '1767948249267',
          title: 'Remote Sensing Fundamentals',
          description: 'Learn the basics of remote sensing, satellite imagery analysis, and applications in environmental monitoring.',
          category: 'Remote Sensing',
          level: 'Beginner',
          duration: '6 weeks',
          price: '$199',
          thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500',
          teacherId: 'teacher-1',
          instructor: 'Dr. Sarah Johnson',
          rating: 4.9,
          students: 456,
          lessons: 18
        },
        {
          id: '1767948249268',
          title: 'Geospatial Data Science',
          description: 'Combine GIS with Python, machine learning, and big data analytics for cutting-edge geospatial solutions.',
          category: 'Data Science',
          level: 'Intermediate',
          duration: '10 weeks',
          price: '$399',
          thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
          teacherId: 'teacher-1',
          instructor: 'Dr. Sarah Johnson',
          rating: 4.7,
          students: 189,
          lessons: 32
        }
      ]

      // Sample enrollments
      const sampleEnrollments = [
        {
          id: 'enroll-1',
          userId: 'student-1',
          courseId: '1767948249266',
          enrolledAt: new Date().toISOString(),
          progress: 45
        },
        {
          id: 'enroll-2',
          userId: 'student-1',
          courseId: '1767948249267',
          enrolledAt: new Date().toISOString(),
          progress: 78
        }
      ]

      // Initialize localStorage
      localStorage.setItem('users', JSON.stringify(sampleUsers))
      localStorage.setItem('courses', JSON.stringify(sampleCourses))
      localStorage.setItem('enrollments', JSON.stringify(sampleEnrollments))
      localStorage.setItem('initialized', 'true')

      console.log('Sample data initialized!')
      console.log('Demo accounts:')
      console.log('Admin: admin@igrs.com / admin123')
      console.log('Teacher: teacher@igrs.com / teacher123')
      console.log('Student: student@igrs.com / student123')
    }
  }, [])

  return null
}
