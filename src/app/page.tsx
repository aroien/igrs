'use client'

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Target, Users, Zap, Award, Globe, Code } from "@/lib/icons";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  students?: number;
  rating?: number;
  instructor?: string;
  price: string;
  thumbnail?: string;
  lessons?: number;
  status: string;
}

// Place your hero image in the public folder (e.g., public/hero-image.jpg)
// Then it will be accessible at /hero-image.jpg
const HERO_IMAGE_URL = "/hero-image.jpg";

export default function Home() {
  const router = useRouter();
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [storedCourses, setStoredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize courses from localStorage or use sample courses


  useEffect(() => {
    // Fetch courses from API
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setStoredCourses(data);
        } else {
          console.error('Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Derive courses from storedCourses using useMemo
  const courses = useMemo(() => {
    return storedCourses;
  }, [storedCourses]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Thanks, ${contactFormData.name}! We'll reply to ${contactFormData.email}.`
    );
    setContactFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-700/50 py-10 md:py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500 mb-6">
                <p className="text-sm text-teal-400 font-semibold">
                  Institute of GIS & Remote Sensing
                </p>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                Practical Geospatial
                <span className="block mt-2 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                  Education for Today&apos;s World
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
                Learn foundational and advanced GIS, Remote Sensing and Spatial
                Data techniques through hands-on projects, expert instructors,
                and career-focused curriculum.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/register")}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                >
                  <span className="relative z-10">
                    Enroll Now
                  </span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </button>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-600 text-white rounded-xl hover:bg-slate-800 hover:border-teal-500 transition-all duration-300 font-semibold"
                >
                  View All Courses
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  {
                    value: "1K+",
                    label: "Alumni",
                    gradient: "from-teal-500 to-cyan-500",
                  },
                  {
                    value: "95%",
                    label: "Placement Rate",
                    gradient: "from-purple-500 to-pink-500",
                  },
                  {
                    value: "5+",
                    label: "Faculty",
                    gradient: "from-orange-500 to-red-500",
                  },
                  {
                    value: "4.9",
                    label: "Avg Rating",
                    gradient: "from-blue-500 to-indigo-500",
                  },
                ].map((stat, i) => (
                  <div key={i} className="relative group h-full">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-full flex flex-col items-center justify-center hover:border-teal-500 transition-all duration-300">
                      <div
                        className={`font-bold text-3xl bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-slate-300 text-sm font-medium text-center">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-first lg:order-last">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                  <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-teal-900/50 via-slate-800 to-purple-900/50">
                    <Image
                      src={HERO_IMAGE_URL}
                      alt="Geospatial Technology"
                      fill
                      className="object-cover opacity-90"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback icon if image doesn't load */}
                    <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50">
                      🌍
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/95 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                        Featured Program
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      Remote Sensing Mastery
                    </div>
                    <p className="mt-2 text-slate-300 text-sm">
                      Advanced techniques in satellite imagery and analysis —
                      practical projects included.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-slate-700/50 py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                IGRS
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Experience world-class geospatial education with cutting-edge
              tools and industry expertise
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                Icon: Target,
                title: "Hands-on Projects",
                desc: "Real datasets and portfolio-ready work.",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                Icon: Users,
                title: "Industry Mentors",
                desc: "Direct guidance from geospatial professionals.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                Icon: Zap,
                title: "Career Services",
                desc: "Resume review and placement support.",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((f, i) => (
              <div key={i} className="group relative">
                <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 h-full">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 transform group-hover:scale-105 transition-all duration-300`}
                  >
                    <f.Icon size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-white text-xl mb-3">
                    {f.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Programs Section */}
      <section className="py-10 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Popular Programs
              </h2>
              <p className="text-slate-400">
                Explore our most sought-after courses
              </p>
            </div>
            <Link
              href="/courses"
              className="group hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 text-teal-400 rounded-xl hover:bg-slate-700 hover:border-teal-500 transition-all duration-300 font-semibold"
            >
              See all courses
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 h-full">
                  <div className="h-48 bg-slate-700"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <div
                  key={course.id}
                  className="group relative cursor-pointer"
                  onClick={() => router.push(`/course/${course.id}`)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300 h-full flex flex-col">
                    {/* Course Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {course.category === "GIS" ? "🗺️" : course.category === "Remote Sensing" ? "🛰️" : "📊"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                      
                      {/* Level Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold">
                          {course.level || "All Levels"}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-block px-3 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                          {course.category || "Course"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-white text-lg mb-3 group-hover:text-teal-400 transition-colors duration-300 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-slate-400 text-sm mb-4 flex-1 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Instructor */}
                      {course.instructor && (
                        <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs">
                            {course.instructor.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span>{course.instructor}</span>
                        </div>
                      )}

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>{course.lessons || "40+"} Lessons</span>
                        </div>
                        {course.students && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>{course.students.toLocaleString()}</span>
                          </div>
                        )}
                        {course.rating && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-white font-semibold">{course.rating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span>Certificate of completion</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                          {course.price || "Free"}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/course/${course.id}`)
                          }}
                          className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-medium text-sm"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-slate-400 text-lg">
                  No courses available at the moment
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Check back soon for new programs!
                </p>
              </div>
            )}
          </div>

          <Link
            href="/courses"
            className="flex sm:hidden items-center justify-center gap-2 mt-8 px-6 py-3 bg-slate-800 border border-slate-700 text-teal-400 rounded-xl hover:bg-slate-700 hover:border-teal-500 transition-all duration-300 font-semibold"
          >
            See all courses →
          </Link>
        </div>
      </section>

      {/* Student Success Stories */}
      <section className="border-t border-slate-700/50 py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Success{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Stories
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Hear from our alumni who transformed their careers through IGRS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Martinez",
                role: "GIS Analyst at NASA",
                image: "👩‍🚀",
                quote:
                  "IGRS gave me the practical skills and confidence to land my dream job at NASA. The hands-on projects were invaluable.",
                rating: 5,
              },
              {
                name: "David Chen",
                role: "Remote Sensing Engineer",
                image: "👨‍💻",
                quote:
                  "The mentorship program connected me with industry experts who guided me through real-world challenges.",
                rating: 5,
              },
              {
                name: "Priya Patel",
                role: "Spatial Data Scientist",
                image: "👩‍🔬",
                quote:
                  "From beginner to professional in 6 months. The curriculum is comprehensive and industry-relevant.",
                rating: 5,
              },
            ].map((story, i) => (
              <div key={i} className="group relative">
                <div className="relative bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-3xl">
                      {story.image}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{story.name}</h4>
                      <p className="text-teal-400 text-sm">{story.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed flex-1 italic">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="border-t border-slate-700/50 py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-teal-900/10"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Learning{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A structured path from beginner to professional
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 opacity-30"></div>

            {[
              {
                step: "01",
                title: "Foundation",
                desc: "Master GIS basics and spatial concepts",
                icon: "📚",
                color: "from-teal-500 to-cyan-500",
              },
              {
                step: "02",
                title: "Practice",
                desc: "Work on real-world datasets",
                icon: "🛠️",
                color: "from-cyan-500 to-blue-500",
              },
              {
                step: "03",
                title: "Advanced",
                desc: "Learn cutting-edge techniques",
                icon: "🚀",
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "04",
                title: "Career",
                desc: "Get placed with our partners",
                icon: "🎯",
                color: "from-pink-500 to-red-500",
              },
            ].map((phase, i) => (
              <div key={i} className="relative group">
                <div className="relative bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-3xl transform group-hover:scale-105 transition-transform duration-300`}
                  >
                    {phase.icon}
                  </div>

                  <div
                    className={`text-sm font-bold mb-2 bg-gradient-to-br ${phase.color} bg-clip-text text-transparent`}
                  >
                    STEP {phase.step}
                  </div>

                  <h4 className="font-bold text-white text-lg mb-2">
                    {phase.title}
                  </h4>

                  <p className="text-slate-400 text-sm">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Certifications */}
      <section className="border-t border-slate-700/50 py-10 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Industry Leaders
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our students work at top organizations worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "ESRI", icon: "🗺️" },
              { name: "Google Earth", icon: "🌍" },
              { name: "NASA", icon: "🛰️" },
              { name: "Mapbox", icon: "📍" },
              { name: "USGS", icon: "🏔️" },
              { name: "Planet Labs", icon: "🪐" },
              { name: "AWS", icon: "☁️" },
              { name: "Microsoft", icon: "💻" },
            ].map((partner, i) => (
              <div key={i} className="group relative">
                <div className="relative bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-500 transition-all duration-300 flex flex-col items-center justify-center aspect-square">
                  <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {partner.icon}
                  </div>
                  <div className="text-slate-400 text-sm font-medium group-hover:text-teal-400 transition-colors duration-300">
                    {partner.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-slate-700/50 py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to know about our programs
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What prerequisites do I need for GIS courses?",
                a: "Most of our beginner courses require no prior experience. Intermediate and advanced courses may require basic GIS knowledge or completion of prerequisite courses."
              },
              {
                q: "Are certificates recognized by employers?",
                a: "Yes! Our certificates are industry-recognized and valued by top geospatial companies. Many of our graduates have successfully used them to advance their careers."
              },
              {
                q: "Can I access courses on mobile devices?",
                a: "Absolutely! Our platform is fully responsive and works seamlessly on desktops, tablets, and smartphones, allowing you to learn anywhere."
              },
              {
                q: "What is your refund policy?",
                a: "We offer a 14-day money-back guarantee. If you're not satisfied with a course, contact us within 14 days of purchase for a full refund."
              },
              {
                q: "Do you provide job placement assistance?",
                a: "Yes! We offer career services including resume reviews, interview preparation, and connections to our network of hiring partners."
              }
            ].map((faq, i) => (
              <div key={i} className="group relative">
                <div className="relative bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300">
                  <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-3">
                    <span className="text-teal-400">Q:</span>
                    {faq.q}
                  </h3>
                  <p className="text-slate-400 leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="border-t border-slate-700/50 py-10 md:py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get in{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Questions about a program? Drop us a message and we&apos;ll respond
              within 2 business days.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full name
                </label>
                <input
                  value={contactFormData.name}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={contactFormData.email}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  value={contactFormData.subject}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      subject: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                  placeholder="Course inquiry"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={contactFormData.message}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      message: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Tell us about your interests..."
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-semibold"
                >
                  Send message
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="group relative">
                <div className="relative bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl">
                      🏢
                    </div>
                    <h4 className="font-bold text-white text-lg">Office</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    123 Geospatial Drive, Tech City
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <span className="text-teal-400">📧</span> info@igrs.edu
                    </p>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <span className="text-teal-400">📞</span> +1 (555)
                      123-4567
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="relative bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl">
                      🌐
                    </div>
                    <h4 className="font-bold text-white text-lg">Connect</h4>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { name: "Twitter", icon: "𝕏" },
                      { name: "LinkedIn", icon: "in" },
                      { name: "YouTube", icon: "▶" },
                    ].map((social, i) => (
                      <a
                        key={i}
                        href={`https://${social.name.toLowerCase()}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 hover:border-teal-500 hover:text-teal-400 transition-all duration-300 text-center font-semibold text-sm"
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
