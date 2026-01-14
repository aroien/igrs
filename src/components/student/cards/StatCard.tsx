import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  Icon: React.ComponentType<{ className: string }>
  variant?: 'default' | 'gradient'
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  Icon,
  variant = 'default'
}) => {
  return (
    <div className="relative">
      <div className="relative bg-slate-800 rounded-lg p-4 md:p-5 border border-slate-700 hover:border-slate-600 transition duration-300">
        <Icon className="w-7 h-7 mb-2 text-teal-400" />
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {value}
        </div>
        <div className="text-slate-400 text-xs md:text-sm">{label}</div>
      </div>
    </div>
  )
}
