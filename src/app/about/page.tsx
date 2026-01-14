import Link from 'next/link'
import { ChevronLeft, Target, Telescope, Star, BookOpen } from '@/lib/icons'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 lg:px-8">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-8"
          >
            <ChevronLeft className="w-5 h-5 mr-2" aria-hidden />
            Back to Home
          </Link>
          
          <h1 className="text-5xl font-serif font-bold text-white mb-6">
            About <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">IGRS</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Empowering the next generation of geospatial professionals through innovative online education
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Mission Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 hover:shadow-lg hover:shadow-teal-500/10 transition">
            <Target className="w-10 h-10 text-teal-400 mb-4" aria-hidden />
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed">
              To democratize access to high-quality geospatial education and empower learners worldwide 
              with the skills they need to succeed in the rapidly evolving field of GIS and remote sensing.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 hover:shadow-lg hover:shadow-purple-500/10 transition">
            <Telescope className="w-10 h-10 text-purple-400 mb-4" aria-hidden />
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Our Vision</h2>
            <p className="text-slate-300 leading-relaxed">
              To become the world's leading platform for geospatial education, fostering a global community 
              of professionals who leverage technology to solve real-world challenges.
            </p>
          </div>

          {/* Values Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 hover:shadow-lg hover:shadow-cyan-500/10 transition lg:col-span-2">
            <Star className="w-10 h-10 text-cyan-400 mb-4" aria-hidden />
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-teal-400 mb-2">Excellence</h3>
                <p className="text-slate-300 text-sm">
                  Delivering the highest quality courses taught by industry experts
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cyan-400 mb-2">Innovation</h3>
                <p className="text-slate-300 text-sm">
                  Continuously updating our curriculum with the latest technologies
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">Community</h3>
                <p className="text-slate-300 text-sm">
                  Building a supportive network of learners and professionals
                </p>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 lg:col-span-2">
            <BookOpen className="w-10 h-10 text-blue-400 mb-4" aria-hidden />
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Our Story</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Founded by a team of passionate geospatial professionals and educators, IGRS was created to bridge 
              the gap between academic knowledge and practical industry skills. We recognized that traditional 
              education often falls short in preparing students for the dynamic world of GIS and remote sensing.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Today, we serve thousands of students worldwide, offering courses ranging from beginner-friendly 
              introductions to advanced professional certifications. Our commitment to excellence and innovation 
              has made us a trusted name in geospatial education.
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <div className="text-slate-400 text-sm">Active Students</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-2">
              50+
            </div>
            <div className="text-slate-400 text-sm">Expert Instructors</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent mb-2">
              100+
            </div>
            <div className="text-slate-400 text-sm">Courses Available</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-2">
              95%
            </div>
            <div className="text-slate-400 text-sm">Satisfaction Rate</div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Meet Our Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:border-teal-500/50 transition-all duration-300 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                DS
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dr. Sarah Johnson</h3>
              <p className="text-teal-400 text-sm mb-3">Founder & CEO</p>
              <p className="text-slate-300 text-sm">
                PhD in Geospatial Sciences with 15+ years of experience in GIS and remote sensing education.
              </p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                MC
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Prof. Michael Chen</h3>
              <p className="text-purple-400 text-sm mb-3">Chief Academic Officer</p>
              <p className="text-slate-300 text-sm">
                Former NASA researcher specializing in satellite imagery analysis and environmental monitoring.
              </p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                ER
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dr. Emily Rodriguez</h3>
              <p className="text-cyan-400 text-sm mb-3">Director of Innovation</p>
              <p className="text-slate-300 text-sm">
                Leading expert in geospatial data science and machine learning applications for GIS.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-16 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose IGRS?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Industry-Recognized Certifications</h3>
                <p className="text-slate-300 text-sm">Earn certificates that are valued by employers worldwide.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Expert Instructors</h3>
                <p className="text-slate-300 text-sm">Learn from professionals actively working in the field.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Hands-On Projects</h3>
                <p className="text-slate-300 text-sm">Apply your knowledge through real-world case studies and projects.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Lifetime Community Access</h3>
                <p className="text-slate-300 text-sm">Join our global network of geospatial professionals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-teal-500/10 to-purple-500/10 rounded-2xl p-12 border border-slate-700 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Start your learning journey today and become part of our growing community of geospatial professionals
          </p>
          <Link
            href="/courses"
            className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition font-semibold"
          >
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Footer */}
     
    </div>
  )
}
