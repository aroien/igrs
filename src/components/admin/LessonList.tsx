'use client'

interface LessonListProps {
  lessons: any[]
  onRemove: (index: number) => void
  onEdit: (index: number) => void
  showToast?: {
    info: (msg: string) => void
  }
}

export default function LessonList({ lessons, onRemove, onEdit, showToast }: LessonListProps) {
  if (lessons.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-400 mb-2">
        Added Lessons ({lessons.length})
      </div>
      {lessons.map((lesson, idx) => (
        <div
          key={lesson.id}
          className="flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600 transition-all group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 text-xs font-bold">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{lesson.title}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>⏱️ {lesson.duration}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full capitalize">
                  {lesson.type === 'video' ? '🎥 Video' : lesson.type === 'reading' ? '📖 Reading' : '✏️ Quiz'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(idx)}
              className="shrink-0 px-3 py-1 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded transition-all text-sm font-semibold"
            >
              ✎ Edit
            </button>
            <button
              type="button"
              onClick={() => {
                onRemove(idx)
                showToast?.info('Lesson removed')
              }}
              className="shrink-0 px-2 py-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded transition-all text-sm font-semibold"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
