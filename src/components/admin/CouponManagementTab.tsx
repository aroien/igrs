'use client'

import { useState, useEffect } from 'react'

interface CouponManagementTabProps {
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function CouponManagementTab({ showToast }: CouponManagementTabProps) {
  const [coupons, setCoupons] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    maxUses: '',
    expiryDate: '',
    description: '',
    isActive: true
  })

  const loadCoupons = () => {
    const stored = JSON.parse(localStorage.getItem('coupons') || '[]')
    setCoupons(stored)
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleSave = () => {
    if (!formData.code.trim()) {
      showToast?.error('Coupon code is required')
      return
    }
    if (!formData.value) {
      showToast?.error('Discount value is required')
      return
    }

    if (editingCoupon) {
      const updated = coupons.map(c => c.id === editingCoupon.id ? { ...c, ...formData, usedCount: c.usedCount } : c)
      setCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      showToast?.success('Coupon updated successfully')
    } else {
      const newCoupon = { 
        id: Date.now(), 
        ...formData, 
        usedCount: 0,
        createdAt: new Date().toISOString()
      }
      const updated = [...coupons, newCoupon]
      setCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      showToast?.success('Coupon created successfully')
    }

    setFormData({ code: '', type: 'percentage', value: '', maxUses: '', expiryDate: '', description: '', isActive: true })
    setEditingCoupon(null)
    setShowForm(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this coupon?')) {
      const updated = coupons.filter(c => c.id !== id)
      setCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      showToast?.success('Coupon deleted')
    }
  }

  const toggleActive = (id: number) => {
    const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    setCoupons(updated)
    localStorage.setItem('coupons', JSON.stringify(updated))
    showToast?.info('Coupon status updated')
  }

  const isExpired = (date: string) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const getStatusColor = (coupon: any) => {
    if (!coupon.isActive) return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    if (isExpired(coupon.expiryDate)) return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (coupon.maxUses && coupon.usedCount >= parseInt(coupon.maxUses)) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    return 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Coupon & Discount Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Coupons</span>
            <span className="text-2xl">🎟️</span>
          </div>
          <div className="text-2xl font-bold text-white">{coupons.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Active</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Uses</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Expired</span>
            <span className="text-2xl">⏰</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{coupons.filter(c => isExpired(c.expiryDate)).length}</div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingCoupon(null)
            setFormData({ code: '', type: 'percentage', value: '', maxUses: '', expiryDate: '', description: '', isActive: true })
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? '✕ Cancel' : '➕ Create Coupon'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="e.g., SAVE20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Discount Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Discount Value *</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Uses (optional)</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Expiry Date (optional)</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {editingCoupon ? '✓ Update Coupon' : '✓ Create Coupon'}
          </button>
        </div>
      )}

      {/* Coupons List */}
      <div className="space-y-3">
        {coupons.length === 0 && !showForm ? (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
            <div className="text-6xl mb-3">🎟️</div>
            <p className="text-slate-400 text-sm font-medium">No coupons available</p>
            <p className="text-slate-500 text-xs mt-1">Create your first discount coupon to boost sales</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white font-mono">{coupon.code}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(coupon)}`}>
                      {!coupon.isActive ? 'Inactive' : isExpired(coupon.expiryDate) ? 'Expired' : 
                       coupon.maxUses && coupon.usedCount >= parseInt(coupon.maxUses) ? 'Used Up' : 'Active'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">
                    {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}
                    {coupon.description && ` - ${coupon.description}`}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Used: {coupon.usedCount || 0}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}</span>
                    {coupon.expiryDate && <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>}
                    <span>Created: {new Date(coupon.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(coupon.id)}
                    className={`px-3 py-1 ${coupon.isActive ? 'bg-yellow-600/20 text-yellow-400' : 'bg-green-600/20 text-green-400'} text-xs font-medium rounded transition-colors`}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon)
                      setFormData({
                        code: coupon.code,
                        type: coupon.type,
                        value: coupon.value,
                        maxUses: coupon.maxUses,
                        expiryDate: coupon.expiryDate,
                        description: coupon.description,
                        isActive: coupon.isActive
                      })
                      setShowForm(true)
                    }}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-medium rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
