import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, MicOff, Sparkles, Navigation } from 'lucide-react';
import { api } from '../services/api';
import { useBooking, TravelType } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  action?: string;
  data?: any;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I am your **TripEase AI Travel Assistant** 🤖. I can search tickets, apply discounts, or answer policies.\n\nTry asking me:\n* *\"Find the cheapest flight from Delhi to Mumbai\"*\n* *\"Show coupons for discounts\"*\n* *\"Suggest a train from Bangalore to Goa\"*"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { setSearchQuery, setActiveTab, resetBooking } = useBooking();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Setup Web Speech API for voice search
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };
      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.post<{ reply: string; action: string | null; data: any | null }>('/support/ai', { message: text });
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: response.reply,
        action: response.action || undefined,
        data: response.data || undefined
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Sorry, I ran into an error connecting to my servers. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string, data: any) => {
    if (action.startsWith('search-')) {
      const type = data.type as TravelType;
      
      // Update state
      setActiveTab(type);
      resetBooking();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      setSearchQuery({
        from: data.from,
        to: data.to,
        date: tomorrow.toISOString().split('T')[0],
        passengers: 1,
        travelClass: type === 'flight' ? 'Economy' : type === 'train' ? 'Sleeper' : 'AC Seater',
        oneWay: true
      });

      // Redirect to search results page
      navigate(`/search?type=${type}&from=${data.from}&to=${data.to}`);
      setIsOpen(false);
    } else if (action === 'show-coupons') {
      navigate('/offers');
      setIsOpen(false);
    } else if (action === 'show-faqs') {
      navigate('/support');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-medium text-sm">
            AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel w-96 max-w-[calc(100vw-2rem)] h-[500px] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">TripEase AI</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span> Online Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/30'
                  }`}
                >
                  {/* Basic parsing for simple bold format in AI text */}
                  {msg.text.split('**').map((part, i) => (
                    i % 2 === 1 ? <strong key={i} className="font-semibold text-primary-500 dark:text-primary-300">{part}</strong> : part
                  ))}
                  
                  {/* Action Recommendation Button */}
                  {msg.action && msg.data && (
                    <button
                      onClick={() => handleActionClick(msg.action!, msg.data)}
                      className="mt-3 flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-4 py-2 rounded-xl text-xs shadow transition-all active:scale-95"
                    >
                      <Navigation className="h-3 w-3" />
                      Search {msg.data.type === 'flight' ? 'Flights' : msg.data.type === 'train' ? 'Trains' : 'Buses'} Now
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Voice Search"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === ' his' || e.key === 'Enter' ? handleSendMessage() : null}
              placeholder={isListening ? "Listening..." : "Ask something..."}
              disabled={isListening}
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              className="bg-primary-600 hover:bg-primary-500 text-white p-2.5 rounded-xl transition-all active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
