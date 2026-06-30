import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HelpCircle, Plus, Send, ChevronDown, ChevronUp, MessageCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQ {
  q: string;
  a: string;
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: 'Open' | 'Closed';
  messages: Array<{
    sender: 'User' | 'Support';
    content: string;
    createdAt: string;
  }>;
}

export const Support: React.FC = () => {
  const { user, token } = useAuth();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Tickets states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  
  // New ticket form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const faqList = await api.get<FAQ[]>('/support/faqs');
        setFaqs(faqList);
      } catch (err) {
        console.error('Failed to load FAQs', err);
      }
    };
    fetchFAQs();
  }, []);

  const fetchTickets = async () => {
    if (!token) return;
    try {
      const ticketList = await api.get<SupportTicket[]>('/support/tickets');
      setTickets(ticketList);
      
      // Update active ticket if open
      if (activeTicket) {
        const updatedActive = ticketList.find(t => t._id === activeTicket._id);
        if (updatedActive) setActiveTicket(updatedActive);
      }
    } catch (err) {
      console.error('Failed to load support tickets', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTickets();
      // Poll tickets every 5 seconds for simulated support replies
      const interval = setInterval(fetchTickets, 5000);
      return () => clearInterval(interval);
    }
  }, [token, activeTicket?._id]);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmittingTicket(true);
    try {
      const newTicket = await api.post<SupportTicket>('/support/ticket', { subject, description });
      setTickets(prev => [newTicket, ...prev]);
      setActiveTicket(newTicket);
      setSubject('');
      setDescription('');
      setShowCreateForm(false);
      alert('Support Ticket raised successfully! Our support agent will reply shortly.');
    } catch (err: any) {
      alert(err.message || 'Failed to raise support ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTicket) return;

    const msg = chatMessage;
    setChatMessage('');
    
    try {
      const updated = await api.post<SupportTicket>(`/support/ticket/reply/${activeTicket._id}`, {
        content: msg,
        sender: 'User'
      });
      setActiveTicket(updated);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: FAQ lists & Raise Ticket Form */}
      <div className="md:col-span-2 space-y-6">
        
        {/* FAQs */}
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 pb-2 border-b border-slate-205/50 dark:border-slate-800/20">
            Check our standard troubleshooting answers before submitting support tickets.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFAQ === idx;
              return (
                <div key={idx} className="border border-slate-250/50 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-slate-700 dark:text-slate-250"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <div className="p-4 pt-0 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/20 dark:border-slate-800/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Raise Ticket trigger / Form */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-sm text-slate-805 dark:text-slate-200">
              Need assistance? Raise a Ticket
            </h3>
            {!showCreateForm && token && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1 bg-primary-650 hover:bg-primary-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
              >
                <Plus className="h-4 w-4" /> New Ticket
              </button>
            )}
          </div>

          {!token && (
            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border text-center text-xs text-slate-500 space-y-3">
              <p>You must be logged in to raise support tickets and view your ticket logs.</p>
              <Link to="/auth?redirect=/support" className="btn-primary inline-block py-2 text-xs">Log In Account</Link>
            </div>
          )}

          {token && showCreateForm && (
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs animate-in fade-in duration-300">
              <div>
                <label className="block font-bold text-slate-550 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ticket Subject (e.g. Refund issue with TKB-1029)"
                  className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-550 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail. If it is about a booking, include the Booking ID or PNR."
                  className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary text-xs flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="btn-primary text-xs flex-1 shadow-glow"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: User Ticket Logs & Chat threads */}
      <div className="space-y-6">
        <div className="glass-panel p-5 space-y-4 min-h-[400px] flex flex-col">
          <h3 className="font-extrabold text-sm border-b pb-2 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <MessageCircle className="h-4.5 w-4.5 text-primary-500" />
            <span>My Support Tickets</span>
          </h3>

          {!token ? (
            <p className="text-xs text-slate-400 text-center py-12">Login to view support tickets.</p>
          ) : tickets.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No support tickets found.</p>
          ) : !activeTicket ? (
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[350px]">
              {tickets.map(t => (
                <button
                  key={t._id}
                  onClick={() => setActiveTicket(t)}
                  className="w-full text-left p-3.5 border rounded-xl hover:border-primary-500 transition-all flex justify-between items-center gap-4 bg-slate-50/20"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-750 dark:text-slate-250 truncate max-w-[150px]">{t.subject}</h5>
                    <p className="text-[9px] text-slate-400 mt-1">Ticket ID: {t.ticketId}</p>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                    t.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            // Chat details thread inside the panel
            <div className="flex-1 flex flex-col h-[400px]">
              {/* Back to list */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/40 mb-3 text-xs">
                <button
                  onClick={() => setActiveTicket(null)}
                  className="text-primary-500 font-bold hover:underline"
                >
                  ← Tickets List
                </button>
                <span className="text-[10px] text-slate-400 font-bold">{activeTicket.ticketId}</span>
              </div>

              {/* Chat feed */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 max-h-[280px]">
                {activeTicket.messages.map((msg, index) => {
                  const isUser = msg.sender === 'User';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-2.5 text-xs ${
                          isUser
                            ? 'bg-primary-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/50 dark:border-slate-750/30'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              {activeTicket.status === 'Open' ? (
                <form onSubmit={handleSendMessage} className="border-t border-slate-200 dark:border-slate-800 pt-3 flex gap-2">
                  <input
                    type="text"
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-xl transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-dashed text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> Ticket Closed
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
