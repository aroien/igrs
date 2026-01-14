'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 10000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const styles = {
    success: 'bg-green-500/95 border-green-400',
    error: 'bg-red-500/95 border-red-400',
    info: 'bg-blue-500/95 border-blue-400',
    warning: 'bg-yellow-500/95 border-yellow-400'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto animate-in zoom-in-95 fade-in duration-300">
        <div className={`${styles[type]} border-2 backdrop-blur-md rounded-xl px-6 py-4 shadow-2xl flex items-center gap-4 min-w-[400px] max-w-lg`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
            <span className="text-3xl text-white">{icons[type]}</span>
          </div>
          <p className="text-white text-base font-semibold flex-1 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all rounded-lg p-2"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
