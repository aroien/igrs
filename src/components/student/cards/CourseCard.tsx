import React from 'react'
import Link from 'next/link'

interface CourseCardProps {
  id: string
  title: string
  description: string
  thumbnail?: string
  category: string
  level: string
  price: string
  instructor: string
  duration: string
  progress?: number
  isEnrolled?: boolean
  onEnroll?: () => void
  onWishlist?: () => void
  isInWishlist?: boolean
  variant?: 'browse' | 'enrolled' | 'continue'
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  category,
  level,
  price,
  instructor,
  duration,
  progress,
  isEnrolled,
  onEnroll,
  onWishlist,
  isInWishlist,
  variant = 'browse'
}) => {
  if (variant === 'continue' && progress !== undefined) {
    return (
      <div className="relative">
        <div className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition duration-300">
          {thumbnail && (
            <div className="h-32 sm:h-40 overflow-hidden bg-slate-700">
              <img src={thumbnail} alt={title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
            </div>
          )}
          <div className="p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-1">{title}</h3>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Progress</span>
                <span className="text-xs text-teal-400 font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <Link
              href={`/course/${id}`}
              className="block w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-semibold text-center text-sm"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'enrolled') {
    return (
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
        <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700">
          {thumbnail && (
            <div className="h-48 overflow-hidden relative">
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
              {progress === 100 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✓ Completed
                </div>
              )}
            </div>
          )}
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm mb-2 line-clamp-2">{description}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{category}</span>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">{level}</span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Progress</span>
                <span className="text-xs text-blue-400 font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <Link
              href={`/course/${id}`}
              className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-semibold text-center text-sm"
            >
              {progress === 100 ? 'Review' : 'Continue'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Default browse variant
  return (
    <div className="group relative">
      <div className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition duration-300">
        {thumbnail && (
          <div className="h-32 sm:h-40 overflow-hidden bg-slate-700">
            <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </div>
        )}
        <div className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-teal-500 text-white rounded-full font-medium">{category}</span>
            <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full font-medium">{level}</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-2">{title}</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow">{description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <span>{instructor}</span>
            <span>•</span>
            <span>{duration}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-teal-400 font-bold text-lg">{price}</span>
          </div>
          {isEnrolled ? (
            <Link
              href={`/course/${id}`}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-500 text-white rounded-lg text-center font-semibold text-sm hover:bg-green-600 transition"
            >
              ✓ Enrolled - View
            </Link>
          ) : (
            <button
              onClick={onEnroll}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
