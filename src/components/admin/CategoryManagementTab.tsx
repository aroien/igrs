'use client'

import { useState, useEffect } from 'react'

interface CategoryManagementTabProps {
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function CategoryManagementTab({ showToast }: CategoryManagementTabProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '', icon: '' })
  const [tagFormData, setTagFormData] = useState({ name: '', color: '#3B82F6' })

  const loadData = () => {
    const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]')
    const storedTags = JSON.parse(localStorage.getItem('tags') || '[]')
    setCategories(storedCategories)
    setTags(storedTags)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveCategory = () => {
    if (!categoryFormData.name.trim()) {
      showToast?.error('Category name is required')
      return
    }

    if (editingCategory) {
      const updated = categories.map(c => c.id === editingCategory.id ? { ...c, ...categoryFormData } : c)
      setCategories(updated)
      localStorage.setItem('categories', JSON.stringify(updated))
      showToast?.success('Category updated successfully')
    } else {
      const newCategory = { id: Date.now(), ...categoryFormData }
      const updated = [...categories, newCategory]
      setCategories(updated)
      localStorage.setItem('categories', JSON.stringify(updated))
      showToast?.success('Category created successfully')
    }

    setCategoryFormData({ name: '', description: '', icon: '' })
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter(c => c.id !== id)
      setCategories(updated)
      localStorage.setItem('categories', JSON.stringify(updated))
      showToast?.success('Category deleted')
    }
  }

  const handleSaveTag = () => {
    if (!tagFormData.name.trim()) {
      showToast?.error('Tag name is required')
      return
    }

    if (editingTag) {
      const updated = tags.map(t => t.id === editingTag.id ? { ...t, ...tagFormData } : t)
      setTags(updated)
      localStorage.setItem('tags', JSON.stringify(updated))
      showToast?.success('Tag updated successfully')
    } else {
      const newTag = { id: Date.now(), ...tagFormData }
      const updated = [...tags, newTag]
      setTags(updated)
      localStorage.setItem('tags', JSON.stringify(updated))
      showToast?.success('Tag created successfully')
    }

    setTagFormData({ name: '', color: '#3B82F6' })
    setEditingTag(null)
    setShowTagForm(false)
  }

  const handleDeleteTag = (id: number) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      const updated = tags.filter(t => t.id !== id)
      setTags(updated)
      localStorage.setItem('tags', JSON.stringify(updated))
      showToast?.success('Tag deleted')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Categories & Tags Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Categories</h2>
            <button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm)
                setEditingCategory(null)
                setCategoryFormData({ name: '', description: '', icon: '' })
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showCategoryForm ? '✕ Cancel' : '➕ Add Category'}
            </button>
          </div>

          {showCategoryForm && (
            <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Geographic Information Systems"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Brief description of the category"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 🗺️"
                />
              </div>
              <button
                onClick={handleSaveCategory}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editingCategory ? '✓ Update Category' : '✓ Create Category'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-sm font-semibold text-white">{category.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setCategoryFormData({ name: category.name, description: category.description, icon: category.icon })
                        setShowCategoryForm(true)
                      }}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && !showCategoryForm && (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">🏷️</div>
                <p className="text-slate-400 text-sm font-medium">No categories available</p>
                <p className="text-slate-500 text-xs mt-1">Create your first category to organize courses</p>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tags</h2>
            <button
              onClick={() => {
                setShowTagForm(!showTagForm)
                setEditingTag(null)
                setTagFormData({ name: '', color: '#3B82F6' })
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showTagForm ? '✕ Cancel' : '➕ Add Tag'}
            </button>
          </div>

          {showTagForm && (
            <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tag Name *</label>
                <input
                  type="text"
                  value={tagFormData.name}
                  onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Beginner Friendly"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tagFormData.color}
                    onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                    className="w-12 h-10 bg-slate-700/50 rounded-md border border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tagFormData.color}
                    onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveTag}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editingTag ? '✓ Update Tag' : '✓ Create Tag'}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group relative px-3 py-1.5 rounded-full text-xs font-medium text-white border border-slate-600 hover:border-slate-500 transition-colors"
                style={{ backgroundColor: tag.color + '30', borderColor: tag.color }}
              >
                <span style={{ color: tag.color }}>{tag.name}</span>
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => {
                      setEditingTag(tag)
                      setTagFormData({ name: tag.name, color: tag.color })
                      setShowTagForm(true)
                    }}
                    className="w-5 h-5 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {tags.length === 0 && !showTagForm && (
              <div className="w-full text-center py-12">
                <div className="text-6xl mb-3">🔖</div>
                <p className="text-slate-400 text-sm font-medium">No tags available</p>
                <p className="text-slate-500 text-xs mt-1">Create your first tag to label courses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
