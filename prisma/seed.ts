import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hashPassword('Admin123!')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@igrs.edu' },
    update: {},
    create: {
      email: 'admin@igrs.edu',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create teacher user
  const teacherPassword = await hashPassword('Teacher123!')
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@igrs.edu' },
    update: {},
    create: {
      email: 'teacher@igrs.edu',
      name: 'Dr. John Smith',
      password: teacherPassword,
      role: 'TEACHER'
    }
  })
  console.log('✅ Teacher user created:', teacher.email)

  // Create student user
  const studentPassword = await hashPassword('Student123!')
  const student = await prisma.user.upsert({
    where: { email: 'student@igrs.edu' },
    update: {},
    create: {
      email: 'student@igrs.edu',
      name: 'Jane Doe',
      password: studentPassword,
      role: 'STUDENT'
    }
  })
  console.log('✅ Student user created:', student.email)

  // Create sample courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to GIS',
      description: 'Learn the fundamentals of Geographic Information Systems, including spatial data, mapping, and analysis techniques.',
      category: 'GIS',
      level: 'Beginner',
      duration: '8 weeks',
      price: 0,
      status: 'PUBLISHED',
      teacherId: teacher.id,
      lessons: {
        create: [
          {
            title: 'What is GIS?',
            content: 'An introduction to Geographic Information Systems and their applications in the real world.',
            duration: '45 min',
            order: 1
          },
          {
            title: 'Understanding Spatial Data',
            content: 'Learn about different types of spatial data including vector and raster formats.',
            duration: '60 min',
            order: 2
          },
          {
            title: 'Map Projections and Coordinate Systems',
            content: 'Understanding how to represent the 3D earth on a 2D map.',
            duration: '50 min',
            order: 3
          },
          {
            title: 'GIS Software Overview',
            content: 'Introduction to popular GIS software tools and platforms.',
            duration: '40 min',
            order: 4
          }
        ]
      }
    }
  })
  console.log('✅ Course created:', course1.title)

  const course2 = await prisma.course.create({
    data: {
      title: 'Remote Sensing Fundamentals',
      description: 'Master the basics of remote sensing technology, satellite imagery analysis, and environmental monitoring.',
      category: 'Remote Sensing',
      level: 'Intermediate',
      duration: '10 weeks',
      price: 99,
      status: 'PUBLISHED',
      teacherId: teacher.id,
      lessons: {
        create: [
          {
            title: 'Introduction to Remote Sensing',
            content: 'Overview of remote sensing principles and electromagnetic spectrum.',
            duration: '55 min',
            order: 1
          },
          {
            title: 'Satellite Platforms and Sensors',
            content: 'Learn about different satellite systems and imaging sensors.',
            duration: '65 min',
            order: 2
          },
          {
            title: 'Image Processing Techniques',
            content: 'Basic image enhancement and classification methods.',
            duration: '70 min',
            order: 3
          }
        ]
      }
    }
  })
  console.log('✅ Course created:', course2.title)

  const course3 = await prisma.course.create({
    data: {
      title: 'Advanced Spatial Analysis',
      description: 'Deep dive into advanced GIS analysis techniques, including network analysis, spatial statistics, and modeling.',
      category: 'GIS',
      level: 'Advanced',
      duration: '12 weeks',
      price: 149,
      status: 'PUBLISHED',
      teacherId: teacher.id,
      lessons: {
        create: [
          {
            title: 'Spatial Statistics Overview',
            content: 'Introduction to spatial autocorrelation and statistical methods.',
            duration: '75 min',
            order: 1
          },
          {
            title: 'Network Analysis',
            content: 'Learn routing, service areas, and location-allocation analysis.',
            duration: '80 min',
            order: 2
          }
        ]
      }
    }
  })
  console.log('✅ Course created:', course3.title)

  // Enroll student in first course
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course1.id,
      progress: 50
    }
  })
  console.log('✅ Enrollment created for student in:', course1.title)

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:')
  console.log('  Email: admin@igrs.edu')
  console.log('  Password: Admin123!')
  console.log('\nTeacher:')
  console.log('  Email: teacher@igrs.edu')
  console.log('  Password: Teacher123!')
  console.log('\nStudent:')
  console.log('  Email: student@igrs.edu')
  console.log('  Password: Student123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
