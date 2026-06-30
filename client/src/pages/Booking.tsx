import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth, Passenger } from '../context/AuthContext';
import { SeatSelector } from '../components/SeatSelector/SeatSelector';
import { api } from '../services/api';
import { ArrowLeft, UserPlus, Info, Users, CreditCard, Ticket, CheckCircle2, ChevronRight, QrCode } from 'lucide-react';

export const Booking: React.FC = () => {
  const {
    activeTab,
    selectedItem,
    searchQuery,
    selectedSeats,
    setSelectedSeats,
    selectedPassengers,
    setSelectedPassengers,
    coupon,
    setCoupon,
    setBookingComplete,
    resetBooking
  } = useBooking();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if no item selected
  useEffect(() => {
    if (!selectedItem) {
      navigate('/');
    }
  }, [selectedItem, navigate]);

  const totalPassengers = searchQuery?.passengers || 1;

  // Passenger state
  const [passengersList, setPassengersList] = useState<Passenger[]>(() => {
    // Initialize with empty details
    return Array.from({ length: totalPassengers }).map(() => ({
      name: '',
      age: 0,
      gender: 'Male'
    }));
  });

  // Saved passengers auto-loader
  const handleLoadSavedPassenger = (index: number, saved: Passenger) => {
    const updated = [...passengersList];
    updated[index] = { ...saved };
    setPassengersList(updated);
  };

  // Forms update
  const handleFormChange = (index: number, field: keyof Passenger, value: any) => {
    const updated = [...passengersList];
    updated[index] = {
      ...updated[index],
      [field]: field === 'age' ? parseInt(value) || 0 : value
    };
    setPassengersList(updated);
  };

  // Coupons state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'NetBanking' | 'Wallet'>('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Pricing calculations
  const baseFare = (selectedItem?.price || 0) * totalPassengers;
  const taxes = Math.round(baseFare * 0.05); // 5% GST
  const convenienceFee = 150;
  const discount = coupon ? coupon.discount : 0;
  const totalAmount = baseFare - discount + taxes + convenienceFee;

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCoupon(null);
    if (!couponCode) return;

    setCouponLoading(true);
    try {
      const result = await api.post<{ code: string; discount: number; description: string }>('/bookings/coupon/validate', {
        code: couponCode,
        amount: baseFare
      });
      setCoupon(result);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSeatSelectionChange = (seats: string[]) => {
    setSelectedSeats(seats);
  };

  // Submit booking
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final Validations
    const allPassengersFilled = passengersList.every(p => p.name.trim() && p.age > 0);
    if (!allPassengersFilled) {
      alert('Please fill in all passenger details before booking.');
      return;
    }

    if (activeTab !== 'train' && selectedSeats.length !== totalPassengers) {
      alert(`Please select exactly ${totalPassengers} seat${totalPassengers > 1 ? 's' : ''}.`);
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        travelType: activeTab,
        itemId: selectedItem._id,
        passengers: passengersList,
        selectedSeats: activeTab === 'train' ? passengersList.map((_, i) => `${i + 1}-CoachSeat`) : selectedSeats,
        paymentMethod,
        baseFare,
        couponCode: coupon ? coupon.code : undefined,
        trainClass: activeTab === 'train' ? selectedItem.selectedClass : undefined
      };

      const result = await api.post<any>('/bookings/create', payload);
      setBookingComplete(result);
      navigate('/confirmation');
    } catch (err: any) {
      alert(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (!selectedItem) return null;

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </button>

      {/* Grid: Forms + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Forms (Passengers, Seats) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. Travel Details Summary */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 text-slate-800 dark:text-slate-200">
              Trip Details Summary
            </h3>
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {activeTab === 'flight' && `${selectedItem.airline} • ${selectedItem.flightNumber}`}
                  {activeTab === 'train' && `${selectedItem.trainName} • Train #${selectedItem.trainNumber}`}
                  {activeTab === 'bus' && `${selectedItem.operator} • ${selectedItem.busType}`}
                </p>
                <p className="text-slate-400 mt-1">Class: {selectedItem.selectedClass || selectedItem.class || selectedItem.busType}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{searchQuery?.from} ➔ {searchQuery?.to}</p>
                <p className="text-slate-400 mt-1">{searchQuery?.date} | Dep: {selectedItem.departureTime}</p>
              </div>
            </div>
          </div>

          {/* 2. Passenger Forms */}
          <div className="glass-panel p-5 space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-500" />
                <span>Passenger Details</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''} Required
              </span>
            </div>

            {passengersList.map((pass, index) => (
              <div key={index} className="space-y-4 p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-500">Passenger #{index + 1}</h4>
                  
                  {/* Load from Saved Profile dropdown */}
                  {user && user.savedPassengers.length > 0 && (
                    <div className="relative group">
                      <button
                        type="button"
                        className="text-[9px] bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-650 font-bold border border-slate-200 dark:border-slate-800"
                      >
                        Quick Load Saved
                      </button>
                      <div className="absolute right-0 mt-1 hidden group-hover:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg p-1 z-20 w-44">
                        {user.savedPassengers.map((saved, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleLoadSavedPassenger(index, saved)}
                            className="w-full text-left px-2.5 py-1 text-[10px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded truncate"
                          >
                            {saved.name} ({saved.age}, {saved.gender})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500">Full Name</label>
                    <input
                      type="text"
                      required
                      value={pass.name}
                      onChange={(e) => handleFormChange(index, 'name', e.target.value)}
                      placeholder="Passenger Name"
                      className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500">Age</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={pass.age || ''}
                      onChange={(e) => handleFormChange(index, 'age', e.target.value)}
                      placeholder="Age"
                      className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500">Gender</label>
                    <select
                      value={pass.gender}
                      onChange={(e) => handleFormChange(index, 'gender', e.target.value)}
                      className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Seat Selection Layout */}
          {activeTab !== 'train' && (
            <div className="glass-panel p-5 space-y-6">
              <h3 className="font-extrabold text-sm border-b pb-2 text-slate-800 dark:text-slate-200">
                Interactive Cabin Seat Selection
              </h3>
              
              <SeatSelector
                travelType={activeTab}
                occupiedSeats={selectedItem.availableSeats ? [] : []} // We can mock occupied seats from availability
                maxPassengers={totalPassengers}
                onSeatSelect={handleSeatSelectionChange}
                selectedSeats={selectedSeats}
              />
            </div>
          )}

        </div>

        {/* Right Summary Columns */}
        <div className="space-y-6">
          
          {/* Fare Details Panel */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary-500" />
              <span>Fare Details Breakdown</span>
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Fare ({totalPassengers} Ticket{totalPassengers > 1 ? 's' : ''})</span>
                <span className="font-bold">₹{baseFare}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-400">GST / Fuel Surcharge (5%)</span>
                <span className="font-bold">₹{taxes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Booking Convenience Fee</span>
                <span className="font-bold">₹{convenienceFee}</span>
              </div>
              
              <div className="border-t border-slate-200/50 dark:border-slate-800/40 my-3 pt-3 flex justify-between text-sm font-extrabold">
                <span>Grand Total</span>
                <span className="text-primary-650 dark:text-primary-400">₹{totalAmount}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                const allFilled = passengersList.every(p => p.name.trim() && p.age > 0);
                if (!allFilled) {
                  alert('Please fill in passenger names and ages before proceeding.');
                  return;
                }
                if (activeTab !== 'train' && selectedSeats.length !== totalPassengers) {
                  alert(`Please select ${totalPassengers} seat${totalPassengers > 1 ? 's' : ''} in the seat layout.`);
                  return;
                }
                setShowPaymentModal(true);
              }}
              className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Coupon Code Selection */}
          <div className="glass-panel p-5 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500">Apply Promo Code</h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-450" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="PROMOCODE"
                  className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs px-4 rounded-xl shadow active:scale-95 transition-all"
              >
                Apply
              </button>
            </div>
            {coupon && (
              <div className="text-[10px] text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-2.5 rounded-lg font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Coupon Applied! Discount: ₹{coupon.discount}</span>
              </div>
            )}
            {couponError && (
              <p className="text-[10px] text-rose-500 font-semibold">{couponError}</p>
            )}
          </div>

        </div>

      </div>

      {/* Payment Drawer Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-lg p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-base border-b pb-3 text-slate-850 dark:text-slate-100 flex items-center justify-between">
              <span>Secure Ticket Checkout Payment</span>
              <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">Total: ₹{totalAmount}</span>
            </h3>

            {/* Selection of Payment Mode */}
            <div className="flex border-b border-slate-200 dark:border-slate-850 mt-4 gap-2 pb-2 overflow-x-auto text-xs font-semibold">
              {(['Card', 'UPI', 'NetBanking', 'Wallet'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    paymentMethod === method
                      ? 'bg-primary-600 text-white shadow shadow-primary-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {method === 'Card' && 'Debit/Credit Card'}
                  {method === 'UPI' && 'UPI / GooglePay'}
                  {method === 'NetBanking' && 'Net Banking'}
                  {method === 'Wallet' && 'Mobile Wallet'}
                </button>
              ))}
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
              
              {/* CREDIT CARD INPUTS */}
              {paymentMethod === 'Card' && (
                <div className="space-y-4">
                  {/* Card visual rendering (Nice final project effect!) */}
                  <div className="bg-gradient-to-br from-primary-700 to-secondary-700 text-white rounded-2xl p-5 shadow-lg space-y-6 relative overflow-hidden">
                    <div className="absolute right-4 top-4 font-extrabold italic opacity-60 text-sm">TripEase Pay</div>
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest opacity-60">Card Number</p>
                      <p className="font-bold tracking-widest text-lg h-7">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="space-y-0.5">
                        <p className="text-[7px] uppercase tracking-widest opacity-65">Card Holder</p>
                        <p className="font-semibold text-xs uppercase h-5 truncate max-w-[150px]">
                          {cardHolder || 'Your Name'}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <p className="text-[7px] uppercase tracking-widest opacity-65">Expires</p>
                        <p className="font-semibold text-xs h-5">
                          {cardExpiry || 'MM/YY'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">CVV Code</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="•••"
                          className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI INPUTS */}
              {paymentMethod === 'UPI' && (
                <div className="text-center space-y-4 py-4 bg-slate-50 dark:bg-slate-900/30 border border-dashed rounded-2xl">
                  <QrCode className="h-28 w-28 mx-auto text-slate-750 dark:text-slate-300" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold">Scan QR Code using any UPI App</p>
                    <p className="text-[10px] text-slate-400">BHIM, GooglePay, PhonePe, Paytm, or AmazonPay</p>
                  </div>
                  <div className="relative max-w-xs mx-auto">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">@</div>
                    <input
                      type="text"
                      placeholder="upiId@okaxis"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none text-center"
                    />
                  </div>
                </div>
              )}

              {/* NET BANKING / WALLET MOCK */}
              {(paymentMethod === 'NetBanking' || paymentMethod === 'Wallet') && (
                <div className="grid grid-cols-2 gap-3 py-4">
                  {paymentMethod === 'NetBanking' ? (
                    ['SBI', 'HDFC', 'ICICI', 'AXIS'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => alert(`Redirecting to ${bank} secure portal... (Simulated)`)}
                        className="p-3 border rounded-xl hover:border-primary-500 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-905"
                      >
                        {bank} Bank
                      </button>
                    ))
                  ) : (
                    ['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Google Pay Wallet'].map(wallet => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => alert(`Redirecting to ${wallet} checkout... (Simulated)`)}
                        className="p-3 border rounded-xl hover:border-primary-500 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-905"
                      >
                        {wallet}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-200 dark:border-slate-850 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 btn-primary text-xs shadow-glow"
                >
                  {bookingLoading ? 'Processing...' : `Pay ₹${totalAmount}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
