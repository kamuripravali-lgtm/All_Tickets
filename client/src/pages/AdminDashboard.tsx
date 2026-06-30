import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ShieldCheck, Plus, Trash2, Landmark, Tag, Users, Ticket, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Metrics {
  totalBookings: number;
  successfulBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalRefunds: number;
  totalUsers: number;
  flightsCount: number;
  trainsCount: number;
  busesCount: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    if (!token) {
      navigate('/auth?redirect=/admin');
      return;
    }
    if (user && user.role !== 'admin') {
      alert("Access Denied: Admin role required.");
      navigate('/');
    }
  }, [user, token, navigate]);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'flights' | 'trains' | 'buses' | 'coupons'>('stats');
  const [loading, setLoading] = useState(true);

  // Lists states
  const [flights, setFlights] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Form states for additions
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'percentage', discountValue: 10, minBookingValue: 500, description: '' });
  const [newFlight, setNewFlight] = useState({ flightNumber: '', airline: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: 120, price: 4000 });
  const [newTrain, setNewTrain] = useState({ trainNumber: '', trainName: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: 600, priceSleeper: 400, price3A: 1000 });
  const [newBus, setNewBus] = useState({ busNumber: '', operator: '', busType: 'AC Seater', from: '', to: '', departureTime: '', arrivalTime: '', duration: 400, price: 800 });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Get core statistics
      const stats = await api.get<{ metrics: Metrics; recentBookings: any[] }>('/admin/stats');
      setMetrics(stats.metrics);
      setRecentBookings(stats.recentBookings);

      // Get transport logs (we search flights between major hubs to load lists)
      const flightList = await api.get<any[]>('/search/flights?from=Delhi&to=Mumbai');
      setFlights(flightList.slice(0, 10)); // Limit to first 10 for view

      const trainList = await api.get<any[]>('/search/trains?from=Delhi&to=Mumbai');
      setTrains(trainList.slice(0, 10));

      const busList = await api.get<any[]>('/search/buses?from=Delhi&to=Mumbai');
      setBuses(busList.slice(0, 10));

      const couponList = await api.get<any[]>('/bookings/coupons/list');
      setCoupons(couponList);

    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Actions CRUD
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.post<any>('/admin/coupon', newCoupon);
      setCoupons(prev => [...prev, added]);
      setNewCoupon({ code: '', discountType: 'percentage', discountValue: 10, minBookingValue: 500, description: '' });
      alert('Coupon created successfully!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this promo coupon?")) return;
    try {
      await api.delete(`/admin/coupon/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
      alert('Coupon deleted successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.post<any>('/admin/flight', {
        ...newFlight,
        stops: 0,
        availableSeats: Array.from({ length: 40 }).map((_, i) => `${i + 1}A`),
        refundable: true
      });
      setFlights(prev => [added, ...prev]);
      setNewFlight({ flightNumber: '', airline: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: 120, price: 4000 });
      alert('Flight schedule created!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add flight');
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (!window.confirm("Delete this flight schedule?")) return;
    try {
      await api.delete(`/admin/flight/${id}`);
      setFlights(prev => prev.filter(f => f._id !== id));
      alert('Flight deleted');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete flight');
    }
  };

  const handleAddTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.post<any>('/admin/train', {
        trainNumber: newTrain.trainNumber,
        trainName: newTrain.trainName,
        from: newTrain.from,
        to: newTrain.to,
        departureTime: newTrain.departureTime,
        arrivalTime: newTrain.arrivalTime,
        duration: newTrain.duration,
        prices: { Sleeper: newTrain.priceSleeper, '3A': newTrain.price3A },
        availableSeats: { Sleeper: 120, '3A': 60 },
        quota: ['General', 'Tatkal']
      });
      setTrains(prev => [added, ...prev]);
      setNewTrain({ trainNumber: '', trainName: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: 600, priceSleeper: 400, price3A: 1000 });
      alert('Train schedule created!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add train');
    }
  };

  const handleDeleteTrain = async (id: string) => {
    if (!window.confirm("Delete this train schedule?")) return;
    try {
      await api.delete(`/admin/train/${id}`);
      setTrains(prev => prev.filter(t => t._id !== id));
      alert('Train deleted');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete train');
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.post<any>('/admin/bus', {
        ...newBus,
        amenities: ['WiFi', 'Water Bottle'],
        availableSeats: Array.from({ length: 30 }).map((_, i) => `L${i + 1}`)
      });
      setBuses(prev => [added, ...prev]);
      setNewBus({ busNumber: '', operator: '', busType: 'AC Seater', from: '', to: '', departureTime: '', arrivalTime: '', duration: 400, price: 800 });
      alert('Bus schedule created!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add bus');
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!window.confirm("Delete this bus schedule?")) return;
    try {
      await api.delete(`/admin/bus/${id}`);
      setBuses(prev => prev.filter(b => b._id !== id));
      alert('Bus deleted');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete bus');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-8">
      
      {/* Admin Panel Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-red-650/5 to-primary-650/5 border-red-500/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-450"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-1.5">
              <span>Admin Management Dashboard</span>
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase">Secure Console</span>
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Control transport vehicles inventories, promo coupons, and sales statistics.</p>
          </div>
        </div>

        {/* Console sub-navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 flex-wrap text-xs font-semibold">
          {[
            { label: 'Metrics', tab: 'stats' },
            { label: 'Flights', tab: 'flights' },
            { label: 'Trains', tab: 'trains' },
            { label: 'Buses', tab: 'buses' },
            { label: 'Coupons', tab: 'coupons' }
          ].map(btn => (
            <button
              key={btn.tab}
              onClick={() => setActiveTab(btn.tab as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === btn.tab
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 space-y-4">
          <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-450">Loading administrative ledger...</p>
        </div>
      )}

      {/* METRICS VIEW */}
      {!loading && activeTab === 'stats' && metrics && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Dashboard Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-center text-slate-400"><span className="text-[10px] font-bold uppercase tracking-wider">Gross Sales Revenue</span> <BarChart3 className="h-4 w-4 text-emerald-500" /></div>
              <h3 className="text-xl font-extrabold">₹{metrics.totalRevenue}</h3>
              <p className="text-[9px] text-emerald-500 font-bold">Successful bookings</p>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-center text-slate-400"><span className="text-[10px] font-bold uppercase tracking-wider">Tickets Booked</span> <Ticket className="h-4 w-4 text-primary-500" /></div>
              <h3 className="text-xl font-extrabold">{metrics.totalBookings}</h3>
              <p className="text-[9px] text-slate-400 font-bold">Total PNR generated</p>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-center text-slate-400"><span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span> <Users className="h-4 w-4 text-purple-500" /></div>
              <h3 className="text-xl font-extrabold">{metrics.totalUsers}</h3>
              <p className="text-[9px] text-slate-400 font-bold">Registered travelers</p>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-center text-slate-400"><span className="text-[10px] font-bold uppercase tracking-wider">Cancelled (Refunds)</span> <ShieldCheck className="h-4 w-4 text-rose-500" /></div>
              <h3 className="text-xl font-extrabold">{metrics.cancelledBookings}</h3>
              <p className="text-[9px] text-rose-500 font-bold">Refunded: ₹{metrics.totalRefunds}</p>
            </div>

          </div>

          {/* Recent Bookings List */}
          <div className="glass-panel p-5">
            <h3 className="font-extrabold text-sm border-b pb-3 mb-4 text-slate-805 dark:text-slate-200">
              Recent Activity - Last 5 Bookings
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Route</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-0 hover:bg-slate-50/20">
                      <td className="py-3 font-bold">{b.bookingId}</td>
                      <td className="py-3">{b.userEmail}</td>
                      <td className="py-3 capitalize font-bold text-primary-500">{b.travelType}</td>
                      <td className="py-3 font-semibold">{b.item.from} ➔ {b.item.to}</td>
                      <td className="py-3 font-bold">₹{b.paymentDetails.amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          b.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FLIGHTS MANAGEMENT */}
      {!loading && activeTab === 'flights' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Add Flight Form */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-primary-500" /> Add Flight Route
            </h3>
            <form onSubmit={handleAddFlight} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Flight Number</label>
                <input type="text" required value={newFlight.flightNumber} onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value.toUpperCase() })} placeholder="AI-102" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Airline</label>
                  <input type="text" required value={newFlight.airline} onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })} placeholder="Air India" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Price (₹)</label>
                  <input type="number" required value={newFlight.price} onChange={(e) => setNewFlight({ ...newFlight, price: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">From</label>
                  <input type="text" required value={newFlight.from} onChange={(e) => setNewFlight({ ...newFlight, from: e.target.value })} placeholder="Delhi" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">To</label>
                  <input type="text" required value={newFlight.to} onChange={(e) => setNewFlight({ ...newFlight, to: e.target.value })} placeholder="Mumbai" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Dep. Time</label>
                  <input type="text" required value={newFlight.departureTime} onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })} placeholder="09:30" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Arr. Time</label>
                  <input type="text" required value={newFlight.arrivalTime} onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })} placeholder="11:45" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2" />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-xs">Create Flight Schedule</button>
            </form>
          </div>

          {/* Flights Table */}
          <div className="md:col-span-2 glass-panel p-5">
            <h3 className="font-extrabold text-sm border-b pb-3 mb-4">Active Flights Route Grid (Hub pairs)</h3>
            <div className="overflow-y-auto max-h-[350px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-205 dark:border-slate-800 font-bold text-slate-400">
                    <th className="pb-2">Flight #</th>
                    <th className="pb-2">Airline</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((f) => (
                    <tr key={f._id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-0 hover:bg-slate-50/20">
                      <td className="py-2.5 font-bold">{f.flightNumber}</td>
                      <td className="py-2.5">{f.airline}</td>
                      <td className="py-2.5 font-semibold text-primary-600">{f.from} ➔ {f.to}</td>
                      <td className="py-2.5">{f.departureTime} - {f.arrivalTime}</td>
                      <td className="py-2.5 font-bold">₹{f.price}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteFlight(f._id)} className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-50 rounded"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRAINS MANAGEMENT */}
      {!loading && activeTab === 'trains' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Add Train Form */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-primary-500" /> Add Train Schedule
            </h3>
            <form onSubmit={handleAddTrain} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Train Number</label>
                <input type="text" required value={newTrain.trainNumber} onChange={(e) => setNewTrain({ ...newTrain, trainNumber: e.target.value })} placeholder="12625" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Train Name</label>
                <input type="text" required value={newTrain.trainName} onChange={(e) => setNewTrain({ ...newTrain, trainName: e.target.value })} placeholder="NDLS Rajdhani Exp" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">From</label>
                  <input type="text" required value={newTrain.from} onChange={(e) => setNewTrain({ ...newTrain, from: e.target.value })} placeholder="Delhi" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">To</label>
                  <input type="text" required value={newTrain.to} onChange={(e) => setNewTrain({ ...newTrain, to: e.target.value })} placeholder="Mumbai" className="w-full bg-slate-100/50 dark:bg-slate-805 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Price (SL)</label>
                  <input type="number" required value={newTrain.priceSleeper} onChange={(e) => setNewTrain({ ...newTrain, priceSleeper: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Price (3A)</label>
                  <input type="number" required value={newTrain.price3A} onChange={(e) => setNewTrain({ ...newTrain, price3A: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Dep. Time</label>
                  <input type="text" required value={newTrain.departureTime} onChange={(e) => setNewTrain({ ...newTrain, departureTime: e.target.value })} placeholder="16:00" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Arr. Time</label>
                  <input type="text" required value={newTrain.arrivalTime} onChange={(e) => setNewTrain({ ...newTrain, arrivalTime: e.target.value })} placeholder="08:30" className="w-full bg-slate-100/50 dark:bg-slate-850 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-xs">Create Train Schedule</button>
            </form>
          </div>

          {/* Trains Table */}
          <div className="md:col-span-2 glass-panel p-5">
            <h3 className="font-extrabold text-sm border-b pb-3 mb-4">Active Trains Route Grid (Hub pairs)</h3>
            <div className="overflow-y-auto max-h-[350px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-205 dark:border-slate-800 font-bold text-slate-400">
                    <th className="pb-2">Train #</th>
                    <th className="pb-2">Train Name</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Fare (SL/3A)</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.map((t) => (
                    <tr key={t._id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-0 hover:bg-slate-50/20">
                      <td className="py-2.5 font-bold">{t.trainNumber}</td>
                      <td className="py-2.5 truncate max-w-[120px]">{t.trainName}</td>
                      <td className="py-2.5 font-semibold text-primary-600">{t.from} ➔ {t.to}</td>
                      <td className="py-2.5">{t.departureTime} - {t.arrivalTime}</td>
                      <td className="py-2.5 font-bold">₹{t.prices.Sleeper} / ₹{t.prices['3A']}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteTrain(t._id)} className="text-rose-500 hover:text-rose-605 p-1 hover:bg-rose-50 rounded"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BUSES MANAGEMENT */}
      {!loading && activeTab === 'buses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Add Bus Form */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-primary-500" /> Add Bus Route
            </h3>
            <form onSubmit={handleAddBus} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Bus Code</label>
                  <input type="text" required value={newBus.busNumber} onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value.toUpperCase() })} placeholder="VRL-55" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Operator</label>
                  <input type="text" required value={newBus.operator} onChange={(e) => setNewBus({ ...newBus, operator: e.target.value })} placeholder="VRL Travels" className="w-full bg-slate-100/50 dark:bg-slate-805 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Bus Type</label>
                <select value={newBus.busType} onChange={(e) => setNewBus({ ...newBus, busType: e.target.value })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2">
                  <option value="AC Seater">AC Seater</option>
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="Non-AC Seater">Non-AC Seater</option>
                  <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">From</label>
                  <input type="text" required value={newBus.from} onChange={(e) => setNewBus({ ...newBus, from: e.target.value })} placeholder="Delhi" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">To</label>
                  <input type="text" required value={newBus.to} onChange={(e) => setNewBus({ ...newBus, to: e.target.value })} placeholder="Mumbai" className="w-full bg-slate-100/50 dark:bg-slate-805 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Price (₹)</label>
                  <input type="number" required value={newBus.price} onChange={(e) => setNewBus({ ...newBus, price: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Dep. Time</label>
                  <input type="text" required value={newBus.departureTime} onChange={(e) => setNewBus({ ...newBus, departureTime: e.target.value })} placeholder="19:30" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-xs">Create Bus Schedule</button>
            </form>
          </div>

          {/* Buses Table */}
          <div className="md:col-span-2 glass-panel p-5">
            <h3 className="font-extrabold text-sm border-b pb-3 mb-4">Active Buses Route Grid (Hub pairs)</h3>
            <div className="overflow-y-auto max-h-[350px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-205 dark:border-slate-800 font-bold text-slate-400">
                    <th className="pb-2">Bus Code</th>
                    <th className="pb-2">Operator</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Fare</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((b) => (
                    <tr key={b._id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-0 hover:bg-slate-50/20">
                      <td className="py-2.5 font-bold">{b.busNumber}</td>
                      <td className="py-2.5">{b.operator}</td>
                      <td className="py-2.5 font-semibold text-primary-600">{b.from} ➔ {b.to}</td>
                      <td className="py-2.5">{b.busType}</td>
                      <td className="py-2.5 font-bold">₹{b.price}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteBus(b._id)} className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-50 rounded"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COUPONS MANAGEMENT */}
      {!loading && activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Add Coupon Form */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-primary-500" /> Create Coupon Promo
            </h3>
            <form onSubmit={handleAddCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Coupon Code</label>
                <input type="text" required value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="FESTIVE50" className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Discount Type</label>
                  <select value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })} className="w-full bg-slate-100/50 dark:bg-slate-850 rounded-xl px-3 py-2">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Value</label>
                  <input type="number" required value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Min Booking Value (₹)</label>
                <input type="number" required value={newCoupon.minBookingValue} onChange={(e) => setNewCoupon({ ...newCoupon, minBookingValue: parseInt(e.target.value) || 0 })} className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Description banner</label>
                <input type="text" required value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} placeholder="Flat ₹500 Off on flights" className="w-full bg-slate-100/50 dark:bg-slate-805 rounded-xl px-3 py-2" />
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-xs">Create Active Coupon</button>
            </form>
          </div>

          {/* Coupons Table */}
          <div className="md:col-span-2 glass-panel p-5">
            <h3 className="font-extrabold text-sm border-b pb-3 mb-4">Active Promo Discount List</h3>
            <div className="overflow-y-auto max-h-[350px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-205 dark:border-slate-800 font-bold text-slate-400">
                    <th className="pb-2">Promo Code</th>
                    <th className="pb-2">Discount</th>
                    <th className="pb-2">Min. Booking Value</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-0 hover:bg-slate-50/20">
                      <td className="py-2.5 font-bold flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-primary-500" /> <span>{c.code}</span></td>
                      <td className="py-2.5 font-semibold text-emerald-600">{c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}</td>
                      <td className="py-2.5">₹{c.minBookingValue}</td>
                      <td className="py-2.5 truncate max-w-[200px]">{c.description}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteCoupon(c._id)} className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-50 rounded"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
