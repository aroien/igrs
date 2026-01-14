'use client'

import { useState } from 'react'

interface LessonFormProps {
  onSave: (lesson: any) => void
  onCancel: () => void
  editingLesson?: any
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
  }
}

export default function LessonForm({ onSave, onCancel, editingLesson, showToast }: LessonFormProps) {
  const [formData, setFormData] = useState({
    title: editingLesson?.title || '',
    duration: editingLesson?.duration || '',
    type: editingLesson?.type || 'video',
    videoUrl: editingLesson?.videoUrl || '',
    content: editingLesson?.content || '',
    filePreview: editingLesson?.filePreview || null as string | null,
    fileName: editingLesson?.fileName || ''
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'document') => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = fileType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024))
      showToast?.error(`File too large. Maximum size: ${sizeMB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData({
        ...formData,
        filePreview: result,
        fileName: file.name,
        videoUrl: fileType === 'video' ? result : formData.videoUrl,
        content: fileType === 'document' ? result : formData.content
      })
      showToast?.success(`${file.name} uploaded successfully`)
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setFormData({
      ...formData,
      videoUrl: '',
      content: '',
      filePreview: null,
      fileName: ''
    })
  }

  const handleSave = () => {
    if (!formData.title?.trim()) {
      showToast?.error('Please enter a lesson title')
      return
    }
    if (!formData.duration?.trim()) {
      showToast?.error('Please enter lesson duration')
      return
    }
    if (formData.type === 'video' && !formData.videoUrl && !formData.filePreview) {
      showToast?.error('Please add video URL or upload a video file')
      return
    }
    if ((formData.type === 'reading' || formData.type === 'quiz') && !formData.content && !formData.filePreview) {
      showToast?.error('Please add content or upload a file')
      return
    }

    const newLesson = {
      id: editingLesson?.id || `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      type: formData.type,
      duration: formData.duration,
      videoUrl: formData.videoUrl,
      content: formData.content,
      fileName: formData.fileName
      // Note: filePreview is intentionally NOT saved to avoid localStorage quota issues
      // filePreview is only used for UI preview during editing
    }
    onSave(newLesson)
    showToast?.success(editingLesson ? 'Lesson updated!' : 'Lesson added!')
  }

  return (
    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <h5 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>📝</span>
          <span>{editingLesson ? 'Edit Lesson' : 'New Lesson'}</span>
        </h5>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">📌 Lesson Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            placeholder="e.g., Getting Started"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">⏱️ Duration *</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            placeholder="e.g., 10 min"
            required
          />
        </div>
      </div>

      {/* Lesson Type */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">🎯 Lesson Type *</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        >
          <option value="video">🎥 Video Lesson</option>
          <option value="reading">📖 Reading Material</option>
          <option value="quiz">✏️ Quiz/Assessment</option>
        </select>
      </div>

      {/* Video Content */}
      {formData.type === 'video' && (
        <div className="space-y-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700">
          <label className="block text-xs font-medium text-slate-300">🎬 Video Content</label>

          {formData.fileName && (
            <div className="flex items-center justify-between p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
              <div className="flex items-center gap-2 text-sm text-teal-400">
                <span>🎥</span>
                <span className="truncate max-w-[200px] font-medium">{formData.fileName}</span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-400 hover:text-red-300 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-teal-500/50 rounded-lg text-sm text-slate-300 hover:text-white transition-all cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>{formData.fileName ? 'Change Video' : '📁 Upload Video from PC'}</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'video')}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-500">Max size: 50MB • MP4, WebM, OGG supported</p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-800 text-slate-400 font-medium">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">🔗 Video URL</label>
            <input
              type="text"
              value={formData.videoUrl && !formData.fileName ? formData.videoUrl : ''}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value, fileName: '', filePreview: null })}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://youtube.com/embed/... or video URL"
              disabled={!!formData.fileName}
            />
          </div>
        </div>
      )}

      {/* Reading/Quiz Content */}
      {(formData.type === 'reading' || formData.type === 'quiz') && (
        <div className="space-y-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700">
          <label className="block text-xs font-medium text-slate-300">📚 Content Material</label>

          {formData.fileName && (
            <div className="flex items-center justify-between p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
              <div className="flex items-center gap-2 text-sm text-teal-400">
                <span>📄</span>
                <span className="truncate max-w-[200px] font-medium">{formData.fileName}</span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-400 hover:text-red-300 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-teal-500/50 rounded-lg text-sm text-slate-300 hover:text-white transition-all cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>{formData.fileName ? 'Change Document' : '📁 Upload Document from PC'}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,image/*"
              onChange={(e) => handleFileUpload(e, 'document')}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-500">Max size: 10MB • PDF, DOC, DOCX, TXT, Images</p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-800 text-slate-400 font-medium">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">✍️ Text Content</label>
            <textarea
              value={formData.content && !formData.fileName ? formData.content : ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value, fileName: '', filePreview: null })}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
              placeholder="Write lesson content here..."
              disabled={!!formData.fileName}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all"
        >
          {editingLesson ? '✓ Update Lesson' : '✓ Add Lesson'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
