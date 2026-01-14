'use client'

import { useState, useEffect } from 'react'

interface PaymentManagementTabProps {
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function PaymentManagementTab({ showToast }: PaymentManagementTabProps) {
  const [payments, setPayments] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingPayments: 0
  })

  const loadData = () => {
    const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]')
    setPayments(storedPayments)

    // Calculate stats
    const totalRevenue = storedPayments.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? p.amount : 0), 0)
    const currentMonth = new Date().getMonth()
    const monthlyRevenue = storedPayments
      .filter((p: any) => new Date(p.date).getMonth() === currentMonth && p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.amount, 0)
    
    setStats({
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions: storedPayments.filter((p: any) => p.status === 'completed').length,
      pendingPayments: storedPayments.filter((p: any) => p.status === 'pending').length
    })

    // Load subscriptions
    const storedSubs = JSON.parse(localStorage.getItem('subscriptions') || '[]')
    setSubscriptions(storedSubs)
  }

  useEffect(() => {
    loadData()

    // Refresh data every 5 seconds to catch new transactions
    const interval = setInterval(() => {
      loadData()
    }, 5000)

    // Also refresh on window focus
    const handleFocus = () => {
      loadData()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleRefund = (paymentId: number) => {
    if (confirm('Are you sure you want to refund this payment?')) {
      const updated = payments.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p)
      setPayments(updated)
      localStorage.setItem('payments', JSON.stringify(updated))
      showToast?.success('Payment refunded successfully')
      loadData()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'refunded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return '💳'
      case 'paypal': return '🅿️'
      case 'bank_transfer': return '🏦'
      default: return '💰'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Payment & Subscription Management</h1>
        {payments.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all payment data? This cannot be undone.')) {
                localStorage.removeItem('payments')
                localStorage.removeItem('subscriptions')
                setPayments([])
                setSubscriptions([])
                setStats({
                  totalRevenue: 0,
                  monthlyRevenue: 0,
                  activeSubscriptions: 0,
                  pendingPayments: 0
                })
                showToast?.success('Payment data cleared')
              }
            }}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/30"
          >
            🗑️ Clear All Data
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Revenue</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">All time</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Monthly Revenue</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-green-400">${stats.monthlyRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">This month</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Active Payments</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.activeSubscriptions}</div>
          <div className="text-xs text-slate-400 mt-1">Completed</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Pending</span>
            <span className="text-2xl">⏳</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pendingPayments}</div>
          <div className="text-xs text-slate-400 mt-1">Awaiting confirmation</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Search Payments</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by user, course, or transaction ID..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="text-6xl mb-3">💳</div>
                    <p className="text-slate-400 text-sm font-medium">No payment transactions found</p>
                    <p className="text-slate-500 text-xs mt-1">Payment history will appear here</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-300 font-mono">{payment.transactionId}</td>
                    <td className="px-4 py-3 text-sm text-white">{payment.userName}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{payment.courseName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">${payment.amount}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-1 text-slate-300">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefund(payment.id)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded transition-colors"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
