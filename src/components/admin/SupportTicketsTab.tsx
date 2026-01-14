'use client'

import { useState, useEffect } from 'react'

interface SupportTicketsTabProps {
  showToast?: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

export default function SupportTicketsTab({ showToast }: SupportTicketsTabProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = () => {
    const stored = JSON.parse(localStorage.getItem('supportTickets') || '[]')
    setTickets(stored)
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const updateTicketStatus = (ticketId: number, newStatus: string) => {
    const updated = tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    )
    setTickets(updated)
    localStorage.setItem('supportTickets', JSON.stringify(updated))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
    showToast?.success(`Ticket status updated to ${newStatus}`)
  }

  const addReply = () => {
    if (!replyText.trim()) {
      showToast?.error('Please enter a reply message')
      return
    }

    const newReply = {
      id: Date.now(),
      author: 'Admin',
      message: replyText,
      timestamp: new Date().toISOString()
    }

    const updated = tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, replies: [...(t.replies || []), newReply], updatedAt: new Date().toISOString(), status: 'in_progress' }
        : t
    )
    setTickets(updated)
    localStorage.setItem('supportTickets', JSON.stringify(updated))
    
    setSelectedTicket({ ...selectedTicket, replies: [...(selectedTicket.replies || []), newReply] })
    setReplyText('')
    showToast?.success('Reply sent successfully')
  }

  const deleteTicket = (ticketId: number) => {
    if (confirm('Delete this ticket?')) {
      const updated = tickets.filter(t => t.id !== ticketId)
      setTickets(updated)
      localStorage.setItem('supportTickets', JSON.stringify(updated))
      if (selectedTicket?.id === ticketId) setSelectedTicket(null)
      showToast?.success('Ticket deleted')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Support Tickets</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Total Tickets</span>
            <span className="text-2xl">🎫</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Open</span>
            <span className="text-2xl">🆕</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.open}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">In Progress</span>
            <span className="text-2xl">⚙️</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Resolved</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          {/* Filters */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-4 space-y-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search tickets..."
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Tickets */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
                  <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h4>
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{ticket.userName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">🎟️</div>
                <p className="text-slate-400 text-sm font-medium">No support tickets found</p>
                <p className="text-slate-500 text-xs mt-1">All customer inquiries will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{selectedTicket.ticketNumber}</span>
                    <span>•</span>
                    <span>{selectedTicket.userName}</span>
                    <span>•</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTicket(selectedTicket.id)}
                  className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-medium rounded hover:bg-red-600/30 transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Status Update */}
              <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                <label className="block text-xs font-medium text-slate-300 mb-2">Update Status</label>
                <div className="flex gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateTicketStatus(selectedTicket.id, status)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                        selectedTicket.status === status
                          ? getStatusColor(status)
                          : 'bg-slate-700/30 text-slate-400 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-4 p-4 bg-slate-700/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {selectedTicket.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{selectedTicket.userName}</div>
                    <div className="text-xs text-slate-400">{selectedTicket.userEmail}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{selectedTicket.description}</p>
              </div>

              {/* Replies */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="mb-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Replies</h3>
                  {selectedTicket.replies.map((reply: any) => (
                    <div key={reply.id} className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-green-400">{reply.author}</span>
                        <span className="text-xs text-slate-400">{new Date(reply.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-300">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Add Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 rounded-md border border-slate-600 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Type your reply here..."
                  required
                />
                <button
                  onClick={addReply}
                  disabled={!replyText.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-12 text-center">
              <p className="text-slate-400">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
