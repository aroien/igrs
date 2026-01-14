import React from 'react'

interface AchievementCardProps {
  id: string
  name: string
  description: string
  Icon: React.ComponentType<{ className: string }>
  unlocked: boolean
  gradient: string
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  id,
  name,
  description,
  Icon,
  unlocked,
  gradient
}) => {
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-${unlocked ? '30' : '10'} group-hover:opacity-60 transition duration-300`}></div>
      <div className={`relative bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 ${!unlocked && 'opacity-50'}`}>
        <Icon className={`w-16 h-16 mb-4 ${unlocked ? 'text-white' : 'text-slate-600'}`} />
        <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
        <p className="text-slate-400 text-sm mb-3">{description}</p>
        {unlocked ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Unlocked!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Locked</span>
          </div>
        )}
      </div>
    </div>
  )
}
