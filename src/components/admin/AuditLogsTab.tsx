'use client'

import { useState, useEffect, useMemo } from 'react'

interface AuditLogsTabProps {
  currentUser: any
}

export default function AuditLogsTab({ currentUser }: AuditLogsTabProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [filterType, setFilterType] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('all')

  const loadLogs = () => {
    const stored = JSON.parse(localStorage.getItem('auditLogs') || '[]')
    setLogs(stored)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const addLog = (action: string, type: string, details: string) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id,
      userName: currentUser?.name || 'Admin',
      action,
      type,
      details,
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }
    const updated = [newLog, ...logs]
    setLogs(updated)
    localStorage.setItem('auditLogs', JSON.stringify(updated))
  }

  const clearOldLogs = () => {
    if (confirm('Clear logs older than 30 days?')) {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      const filtered = logs.filter(log => new Date(log.timestamp).getTime() > thirtyDaysAgo)
      setLogs(filtered)
      localStorage.setItem('auditLogs', JSON.stringify(filtered))
      addLog('logs_cleared', 'system', 'Cleared logs older than 30 days')
    }
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    addLog('logs_exported', 'system', 'Exported audit logs')
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesUser = filterUser === 'all' || log.userId?.toString() === filterUser
    
    let matchesDate = true
    if (dateRange !== 'all') {
      const logDate = new Date(log.timestamp).getTime()
      const now = new Date().getTime()
      switch (dateRange) {
        case 'today':
          matchesDate = logDate > now - 86400000
          break
        case 'week':
          matchesDate = logDate > now - 7 * 86400000
          break
        case 'month':
          matchesDate = logDate > now - 30 * 86400000
          break
      }
    }
    
    return matchesSearch && matchesType && matchesUser && matchesDate
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'authentication': return 'bg-blue-500/20 text-blue-400'
      case 'course': return 'bg-purple-500/20 text-purple-400'
      case 'user': return 'bg-green-500/20 text-green-400'
      case 'system': return 'bg-orange-500/20 text-orange-400'
      case 'payment': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'authentication': return '🔐'
      case 'course': return '📚'
      case 'user': return '👤'
      case 'system': return '⚙️'
      case 'payment': return '💰'
      default: return '📋'
    }
  }

  const uniqueUsers = Array.from(new Set(logs.map(log => log.userId))).map(id => {
    const log = logs.find(l => l.userId === id)
    return { id, name: log?.userName }
  })

  const logStats = useMemo(() => {
    const now = new Date().getTime()
    const oneDayAgo = now - 86400000
    const oneWeekAgo = now - 7 * 86400000
    
    return {
      today: logs.filter(l => new Date(l.timestamp).getTime() > oneDayAgo).length,
      week: logs.filter(l => new Date(l.timestamp).getTime() > oneWeekAgo).length,
      actions: logs.filter(l => !l.action.includes('view')).length
    }
  }, [logs])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Audit Logs & System Activity</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Logs</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-white">{logs.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Today</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {logStats.today}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">This Week</span>
            <span className="text-2xl">📆</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {logStats.week}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Unique Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{uniqueUsers.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Actions</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {logStats.actions}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📥 Export Logs
        </button>
        <button
          onClick={clearOldLogs}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg border border-red-600/30 transition-colors"
        >
          🗑️ Clear Old Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search logs..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="authentication">Authentication</option>
              <option value="course">Course</option>
              <option value="user">User</option>
              <option value="system">System</option>
              <option value="payment">Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user.id} value={user.id?.toString()}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">📋</div>
              <p className="text-slate-400 text-sm font-medium">No audit logs found</p>
              <p className="text-slate-500 text-xs mt-1">System activities will be recorded here</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getActionIcon(log.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-white">{log.userName}</span>
                        <span className="mx-2 text-slate-500">•</span>
                        <span className="text-sm text-slate-400">{log.action.replace(/_/g, ' ')}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{log.details}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>🕐 {new Date(log.timestamp).toLocaleString()}</span>
                      <span>🌐 {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
