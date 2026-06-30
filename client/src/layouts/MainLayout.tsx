import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { AIAssistant } from '../components/AIAssistant';
import { Sun, Moon, Globe, User, LogOut, ChevronDown, Menu, X, Landmark, Percent, Calendar, Heart, Ticket } from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  const getLangName = (lang: Language) => {
    switch (lang) {
      case 'hi': return 'हिन्दी';
      case 'te': return 'తెలుగు';
      case 'ta': return 'தமிழ்';
      case 'kn': return 'ಕನ್ನಡ';
      case 'ml': return 'മലയാളം';
      default: return 'English';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-glass border-b border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            <Landmark className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <span>{t('brand')}</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`transition-all hover:text-primary-500 ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-350'}`}>
              {t('home')}
            </Link>
            <Link to="/search?type=flight" className={`transition-all hover:text-primary-500 ${isActive('/search') && location.search.includes('flight') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-350'}`}>
              {t('flights')}
            </Link>
            <Link to="/search?type=train" className={`transition-all hover:text-primary-500 ${isActive('/search') && location.search.includes('train') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-350'}`}>
              {t('trains')}
            </Link>
            <Link to="/search?type=bus" className={`transition-all hover:text-primary-500 ${isActive('/search') && location.search.includes('bus') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-350'}`}>
              {t('buses')}
            </Link>
            <Link to="/offers" className={`transition-all hover:text-primary-500 ${isActive('/offers') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-350'}`}>
              {t('offers')}
            </Link>
            <Link to="/support" className={`transition-all hover:text-primary-500 ${isActive('/support') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-350'}`}>
              {t('support')}
            </Link>
          </nav>

          {/* Actions / Toggles */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>

            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all text-xs font-medium"
              >
                <Globe className="h-4 w-4" />
                <span>{getLangName(language)}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 glass-panel p-1.5 shadow-xl border border-slate-200/60 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
                  {(['en', 'hi', 'te', 'ta', 'kn', 'ml'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        language === lang 
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
                      }`}
                    >
                      {getLangName(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-semibold border border-primary-500/20 active:scale-95 transition-all"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-panel p-2 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-1.5 border-b border-slate-200/60 dark:border-slate-800/40 mb-1.5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <Ticket className="h-4 w-4" />
                      {t('myBookings')}
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        <User className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary flex items-center gap-1.5 text-sm !py-2"
              >
                <User className="h-4 w-4" />
                {t('login')}
              </Link>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-650" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-850 p-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-2.5">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('home')}</Link>
              <Link to="/search?type=flight" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('flights')}</Link>
              <Link to="/search?type=train" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('trains')}</Link>
              <Link to="/search?type=bus" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('buses')}</Link>
              <Link to="/offers" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('offers')}</Link>
              <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('support')}</Link>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">{t('myBookings')}</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-805 text-sm font-medium">Admin Panel</Link>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex flex-col gap-3">
              {/* Language Selection Mobile */}
              <div className="flex items-center justify-between px-3">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Globe className="h-4 w-4" /> Language</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  className="bg-transparent text-xs font-semibold focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="te">తెలుగు</option>
                  <option value="ta">தமிழ்</option>
                  <option value="kn">ಕನ್ನಡ</option>
                  <option value="ml">മലയാളം</option>
                </select>
              </div>

              {/* Login / Logout */}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/auth');
                  }}
                  className="w-full btn-secondary text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-center"
                >
                  {t('logout')}
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary text-center block"
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-primary-600 dark:text-primary-400 mb-4">
              <Landmark className="h-5 w-5" />
              <span>{t('brand')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Your comprehensive travel booking partner. Compare flights, trains, and buses to find the fastest and cheapest tickets instantly.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4">Bookings</h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/search?type=flight" className="hover:text-primary-500 transition-colors">Flights Search</Link></li>
              <li><Link to="/search?type=train" className="hover:text-primary-500 transition-colors">Trains Search</Link></li>
              <li><Link to="/search?type=bus" className="hover:text-primary-500 transition-colors">Buses Search</Link></li>
              <li><Link to="/offers" className="hover:text-primary-500 transition-colors">Promo Discounts</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4">Support & Help</h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/support" className="hover:text-primary-500 transition-colors">Help Center / FAQs</Link></li>
              <li><Link to="/support" className="hover:text-primary-500 transition-colors">Raise a Support Ticket</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-500 transition-colors">Track Refund Status</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-4">Company</h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><span className="cursor-default">About Us</span></li>
              <li><span className="cursor-default">Careers</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Contact: support@tripease.com</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} TripEase Ltd. All-in-One Travel Booking Platform. Final Year Project.</span>
          <span>Designed with Premium HSL Colors & Glassmorphism</span>
        </div>
      </footer>

      {/* Floating AI Chatbot Assistant */}
      <AIAssistant />

    </div>
  );
};
