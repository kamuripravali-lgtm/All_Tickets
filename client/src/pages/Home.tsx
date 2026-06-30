import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking, TravelType, SearchQuery } from '../context/BookingContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Plane, Train, Bus, MapPin, Calendar, Users, Briefcase, Search, ShieldCheck, Tag, Zap, Headphones, Map, ArrowLeftRight } from 'lucide-react';

interface PromoCoupon {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
}

export const Home: React.FC = () => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, resetBooking } = useBooking();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fromCity, setFromCity] = useState(searchQuery?.from || 'Delhi');
  const [toCity, setToCity] = useState(searchQuery?.to || 'Mumbai');
  const [date, setDate] = useState(searchQuery?.date || new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(searchQuery?.returnDate || '');
  const [passengers, setPassengers] = useState(searchQuery?.passengers || 1);
  const [travelClass, setTravelClass] = useState(searchQuery?.travelClass || 'Economy');
  const [oneWay, setOneWay] = useState(searchQuery?.oneWay ?? true);
  
  const [cities, setCities] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const citiesList = await api.get<string[]>('/search/cities');
        setCities(citiesList);
        const couponList = await api.get<PromoCoupon[]>('/bookings/coupons/list');
        setCoupons(couponList);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      }
    };
    fetchHomeData();
  }, []);

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity || !toCity) {
      alert('Please fill in both cities');
      return;
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      alert('From and To cities cannot be the same');
      return;
    }

    resetBooking();
    const query: SearchQuery = {
      from: fromCity,
      to: toCity,
      date,
      returnDate: oneWay ? undefined : returnDate,
      passengers,
      travelClass,
      oneWay
    };
    
    setSearchQuery(query);
    navigate(`/search?type=${activeTab}&from=${fromCity}&to=${toCity}&date=${date}`);
  };

  const selectPopularDestination = (city: string) => {
    if (fromCity === city) {
      // Swap or select different
      setFromCity(city === 'Delhi' ? 'Mumbai' : 'Delhi');
    }
    setToCity(city);
    // Smooth scroll to search bar
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-900 to-secondary-900 text-white p-8 md:p-12 shadow-2xl grid-bg border border-white/10">
        
        {/* Animated Glow Backdrops */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
          <span className="bg-primary-500/20 text-primary-300 font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary-500/30 inline-block animate-pulse">
            Seamless Bookings
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Search, Compare, and Book <br />
            <span className="bg-gradient-to-r from-primary-400 via-secondary-300 to-primary-300 bg-clip-text text-transparent">
              Flights, Trains & Buses
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-350 max-w-xl mx-auto leading-relaxed">
            All your travel ticketing requirements managed in one interface. Lowest fares, instant confirmation, and live tracking status.
          </p>
        </div>

        {/* Search Panel Container */}
        <div className="max-w-5xl mx-auto glass-panel p-6 shadow-2xl relative z-10 text-slate-800 dark:text-slate-200">
          
          {/* Transport Tabs */}
          <div className="flex border-b border-slate-200/50 dark:border-slate-800/40 pb-4 mb-6 gap-2">
            {(['flight', 'train', 'bus'] as TravelType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Adjust travel class defaults
                  setTravelClass(tab === 'flight' ? 'Economy' : tab === 'train' ? 'Sleeper' : 'AC Seater');
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab === 'flight' && <Plane className="h-4 w-4" />}
                {tab === 'train' && <Train className="h-4 w-4" />}
                {tab === 'bus' && <Bus className="h-4 w-4" />}
                <span className="capitalize">{t((tab + 's') as any)}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-6">
            
            {/* Round trip / One way selectors for flights */}
            {activeTab === 'flight' && (
              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={oneWay}
                    onChange={() => setOneWay(true)}
                    className="text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-750"
                  />
                  <span>One Way</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!oneWay}
                    onChange={() => setOneWay(false)}
                    className="text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-750"
                  />
                  <span>Round Trip</span>
                </label>
              </div>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* FROM */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">{t('from')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={fromCity}
                    onChange={(e) => {
                      setFromCity(e.target.value);
                      setShowFromSuggestions(true);
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    placeholder="Depart City"
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Suggestions */}
                {showFromSuggestions && cities.length > 0 && (
                  <div className="absolute left-0 right-0 z-30 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl p-1 max-h-48 overflow-y-auto">
                    {cities
                      .filter(c => c.toLowerCase().includes(fromCity.toLowerCase()))
                      .map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setFromCity(city);
                            setShowFromSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {city}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* SWAP BUTTON (visually centered between From & To) */}
              <div className="hidden md:flex items-end justify-center pb-2 z-10 pointer-events-none">
                <button
                  type="button"
                  onClick={swapCities}
                  className="pointer-events-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 p-2.5 rounded-full shadow hover:scale-105 active:scale-95 transition-all duration-200"
                  title="Swap Cities"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              {/* TO */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">{t('to')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={toCity}
                    onChange={(e) => {
                      setToCity(e.target.value);
                      setShowToSuggestions(true);
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    placeholder="Arrive City"
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Suggestions */}
                {showToSuggestions && cities.length > 0 && (
                  <div className="absolute left-0 right-0 z-30 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl p-1 max-h-48 overflow-y-auto">
                    {cities
                      .filter(c => c.toLowerCase().includes(toCity.toLowerCase()))
                      .map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setToCity(city);
                            setShowToSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {city}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* DATES */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">{t('depDate')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* RETURN DATE (FLIGHT ONLY) */}
              {!oneWay && activeTab === 'flight' && (
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">{t('retDate')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      min={date}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Travel Details Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/30">
              
              {/* PASSENGERS COUNT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">{t('passengers')}</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TRAVEL CLASS */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">{t('travelClass')}</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    {activeTab === 'flight' && (
                      <>
                        <option value="Economy">Economy Class</option>
                        <option value="Business">Business Class</option>
                      </>
                    )}
                    {activeTab === 'train' && (
                      <>
                        <option value="Sleeper">Sleeper Class (SL)</option>
                        <option value="3A">AC 3 Tier (3A)</option>
                        <option value="2A">AC 2 Tier (2A)</option>
                        <option value="1A">AC First Class (1A)</option>
                      </>
                    )}
                    {activeTab === 'bus' && (
                      <>
                        <option value="AC Seater">AC Seater</option>
                        <option value="AC Sleeper">AC Sleeper</option>
                        <option value="Non-AC Seater">Non-AC Seater</option>
                        <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl shadow-glow active:scale-95"
                >
                  <Search className="h-5 w-5" />
                  <span>{t('search')}</span>
                </button>
              </div>

            </div>

          </form>

        </div>

      </section>

      {/* Popular Destinations Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('popularDestinations')}</h2>
            <p className="text-xs text-slate-500 mt-1">Direct bookings to major cities. Click to fill arrival destination immediately.</p>
          </div>
          <Map className="h-6 w-6 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { name: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80' },
            { name: 'Mumbai', img: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=300&q=80' },
            { name: 'Bangalore', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=300&q=80' },
            { name: 'Hyderabad', img: 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&w=300&q=80' },
            { name: 'Chennai', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80' },
            { name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=300&q=80' }
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => selectPopularDestination(dest.name)}
              className="group glass-card overflow-hidden hover:scale-[1.03] text-left relative h-40 flex flex-col justify-end p-4 transition-all"
            >
              <img
                src={dest.img}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-[0.7]"
              />
              <span className="relative z-10 text-white font-bold text-sm drop-shadow-md">{dest.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Promos / Offers Banner */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('offers')}</h2>
            <p className="text-xs text-slate-500 mt-1">Apply promo codes on the checkout page to get instant discounts.</p>
          </div>
          <Tag className="h-6 w-6 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.code} className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between border-dashed border-2 border-primary-500/20">
              <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl">
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-primary-650 bg-primary-50 dark:bg-primary-950/20 px-2.5 py-1 rounded-md border border-primary-500/10">
                  ACTIVE PROMO
                </span>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2">{coupon.description}</h3>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/30 mt-4 pt-4">
                <code className="text-sm font-extrabold text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                  {coupon.code}
                </code>
                <button
                  onClick={() => handleCopyCoupon(coupon.code)}
                  className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline"
                >
                  Copy Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="glass-panel p-8 text-center grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><ShieldCheck className="h-6 w-6" /></div>
          <h4 className="font-bold text-sm">{t('lowestPrices')}</h4>
          <p className="text-[10px] text-slate-500">Guaranteed lowest fares</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-500"><Zap className="h-6 w-6" /></div>
          <h4 className="font-bold text-sm">{t('securePayments')}</h4>
          <p className="text-[10px] text-slate-500">SSL encrypted gateways</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-secondary-500/10 rounded-2xl text-secondary-500"><Tag className="h-6 w-6" /></div>
          <h4 className="font-bold text-sm">{t('instantBooking')}</h4>
          <p className="text-[10px] text-slate-500">PDF & QR tickets generated</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500"><MapPin className="h-6 w-6" /></div>
          <h4 className="font-bold text-sm">{t('liveTracking')}</h4>
          <p className="text-[10px] text-slate-500">Real-time status updates</p>
        </div>
        <div className="flex flex-col items-center space-y-2 col-span-2 md:col-span-1">
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500"><Headphones className="h-6 w-6" /></div>
          <h4 className="font-bold text-sm">24/7 Support</h4>
          <p className="text-[10px] text-slate-500">Fast ticket resolutions</p>
        </div>
      </section>

    </div>
  );
};
