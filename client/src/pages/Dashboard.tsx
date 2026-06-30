import React, { useState, useEffect } from 'react';
import { useAuth, Passenger } from '../context/AuthContext';
import { api } from '../services/api';
import { Ticket, User, UserPlus, Trash2, ShieldAlert, Sparkles, Download, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, token, updatePassengers } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/auth?redirect=/dashboard');
    }
  }, [token, navigate]);

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Saved passenger form states
  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState<number>(0);
  const [passengerGender, setPassengerGender] = useState('Male');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      setLoadingBookings(true);
      try {
        const data = await api.get<any[]>('/bookings');
        setBookings(data);
      } catch (err) {
        console.error('Failed to load user bookings', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [token]);

  const handleCancelBooking = async (bookingId: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this ticket? Cancellations are subject to convenience charge, and refunds are processed instantly.");
    if (!confirm) return;

    try {
      const response = await api.post<{ message: string; booking: any }>(`/bookings/cancel/${bookingId}`, {});
      alert(response.message);
      
      // Update local list
      setBookings(prev => prev.map(b => b._id === bookingId ? response.booking : b));
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  const handleAddPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim() || passengerAge <= 0) {
      alert('Please fill in valid passenger name and age.');
      return;
    }

    const newPassenger: Passenger = {
      name: passengerName,
      age: passengerAge,
      gender: passengerGender
    };

    const currentList = user?.savedPassengers || [];
    try {
      await updatePassengers([...currentList, newPassenger]);
      setPassengerName('');
      setPassengerAge(0);
      setPassengerGender('Male');
      alert('Passenger profile added successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save passenger profile');
    }
  };

  const handleDeletePassenger = async (indexToDelete: number) => {
    if (!user) return;
    const confirm = window.confirm("Delete this passenger profile?");
    if (!confirm) return;

    const updated = user.savedPassengers.filter((_, idx) => idx !== indexToDelete);
    try {
      await updatePassengers(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete passenger profile');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      
      {/* Profile Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-600/5 to-secondary-600/5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{user.name}</h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>
        
        {/* TABS SELECTOR */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Saved Profiles
          </button>
        </div>
      </div>

      {/* RENDER BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary-500" />
            <span>Travel Bookings Ledger</span>
          </h3>

          {loadingBookings && (
            <div className="text-center py-12 space-y-4">
              <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-450">Fetching booking history...</p>
            </div>
          )}

          {!loadingBookings && bookings.length === 0 && (
            <div className="glass-panel p-12 text-center text-slate-500">
              <p className="text-sm font-bold">You have no travel bookings recorded.</p>
              <button onClick={() => navigate('/')} className="btn-primary mt-4 text-xs">Book Tickets Now</button>
            </div>
          )}

          {!loadingBookings && bookings.map((booking) => {
            const isCancelled = booking.status === 'Cancelled';
            const isCompleted = booking.status === 'Completed';

            return (
              <div key={booking._id} className="glass-panel p-5 space-y-4 relative overflow-hidden">
                {/* Visual indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isCancelled ? 'bg-rose-500' : isCompleted ? 'bg-slate-400' : 'bg-emerald-500'
                }`}></div>

                {/* Top details */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {booking.travelType} Booking
                    </span>
                    <h4 className="font-extrabold text-sm mt-0.5">
                      {booking.travelType === 'flight' && `${booking.item.airline} • ${booking.item.flightNumber}`}
                      {booking.travelType === 'train' && `${booking.item.trainName} • #${booking.item.trainNumber}`}
                      {booking.travelType === 'bus' && `${booking.item.operator} • ${booking.item.busType}`}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      PNR: {booking.pnr} | Booking ID: {booking.bookingId}
                    </p>
                  </div>
                  
                  {/* Status pills */}
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isCancelled 
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-900/30' 
                      : isCompleted 
                      ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-250 dark:border-emerald-900/30'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* Timeline and Route */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs py-2 border-y border-slate-200/50 dark:border-slate-800/20 items-center">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">From</p>
                    <p className="font-bold text-slate-700 dark:text-slate-350">{booking.item.from}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dep: {booking.item.departureTime}</p>
                  </div>
                  <div className="text-center text-[10px] text-slate-400 font-bold">
                    ➔
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">To</p>
                    <p className="font-bold text-slate-700 dark:text-slate-350">{booking.item.to}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Arr: {booking.item.arrivalTime}</p>
                  </div>
                </div>

                {/* Cost & Passengers */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs pt-1">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Passenger(s)</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {booking.passengers.map((p: any) => p.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Amount Paid</p>
                    <p className="font-extrabold text-sm text-primary-650 mt-0.5">₹{booking.paymentDetails.amount}</p>
                  </div>
                </div>

                {/* Refund tracker timeline for cancelled bookings */}
                {isCancelled && (
                  <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-900/20 rounded-2xl p-4 text-[10px] space-y-2 mt-2">
                    <p className="font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Cancelled - Instant Refund Status Track
                    </p>
                    <div className="relative pl-6 space-y-3 mt-2">
                      <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">Cancellation Initiated</p>
                        <p className="text-slate-450">Seats released back to inventory.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">Refund Approved & Processed</p>
                        <p className="text-slate-450">Instant refund of ₹{booking.paymentDetails.amount} processed back to {booking.paymentDetails.method}.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isCancelled && (
                  <div className="flex gap-2 justify-end border-t border-slate-200/50 dark:border-slate-800/20 pt-3">
                    <button
                      onClick={() => {
                        alert("Simulation: E-Ticket PDF generated and starting download!");
                      }}
                      className="flex items-center gap-1 hover:text-primary-500 font-bold text-[10px] text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF Ticket
                    </button>
                    {booking.status === 'Upcoming' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center gap-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-rose-200/40 dark:border-rose-900/20 transition-all"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* RENDER PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Saved passengers listings */}
          <div className="md:col-span-2 glass-panel p-5 space-y-6">
            <h3 className="font-extrabold text-sm border-b pb-2 text-slate-805 dark:text-slate-200">
              Saved Traveler Profiles ({user.savedPassengers.length})
            </h3>
            
            {user.savedPassengers.length === 0 ? (
              <p className="text-xs text-slate-450 text-center py-6">
                No passenger profiles saved. Save passengers to load them quickly during checkout.
              </p>
            ) : (
              <div className="space-y-3">
                {user.savedPassengers.map((pass, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-250/50 dark:border-slate-800/45 rounded-xl hover:bg-slate-50/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-550"><User className="h-4 w-4" /></div>
                      <div>
                        <p className="font-bold text-xs text-slate-700 dark:text-slate-300">{pass.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{pass.gender} | Age: {pass.age}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePassenger(idx)}
                      className="text-rose-500 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add passenger profile form */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 text-slate-805 dark:text-slate-200 flex items-center gap-1.5">
              <UserPlus className="h-4.5 w-4.5 text-primary-500" />
              <span>Add New Profile</span>
            </h3>

            <form onSubmit={handleAddPassenger} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={passengerAge || ''}
                    onChange={(e) => setPassengerAge(parseInt(e.target.value) || 0)}
                    placeholder="Age"
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender</label>
                  <select
                    value={passengerGender}
                    onChange={(e) => setPassengerGender(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-255 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold"
              >
                Save Profile
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
