import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { CheckCircle2, Printer, Home as HomeIcon, Calendar, Ticket, ShieldCheck, Mail, MessageSquare } from 'lucide-react';

export const Confirmation: React.FC = () => {
  const { bookingComplete, resetBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if no booking was completed
    if (!bookingComplete) {
      navigate('/');
    }
  }, [bookingComplete, navigate]);

  if (!bookingComplete) return null;

  const { bookingId, pnr, travelType, item, passengers, selectedSeats, paymentDetails, createdAt } = bookingComplete;

  const handlePrint = () => {
    window.print();
  };

  const handleBackHome = () => {
    resetBooking();
    navigate('/');
  };

  const handleGoToBookings = () => {
    resetBooking();
    navigate('/dashboard');
  };

  // Render a simulated beautiful SVG QR code
  const renderSimulatedQRCode = () => {
    return (
      <svg className="w-32 h-32 mx-auto text-slate-800 dark:text-slate-100" viewBox="0 0 100 100" fill="currentColor">
        {/* Border */}
        <path d="M0 0h30v6H6v24H0V0zm70 0h30v30h-6V6H70V0zM0 70h6v24h24v6H0V70zm100 0v30H70v-6h24V70h6z" />
        {/* Top Left Finder */}
        <path d="M12 12h18v18H12V12zm6 6v6h6v-6h-6z" />
        {/* Top Right Finder */}
        <path d="M70 12h18v18H70V12zm6 6v6h6v-6h-6z" />
        {/* Bottom Left Finder */}
        <path d="M12 70h18v18H12V70zm6 6v6h6v-6h-6z" />
        {/* Mock Matrix patterns */}
        <path d="M38 12h6v6h-6zm0 12h12v6H38zm18-12h12v6H56zm0 18h6v12h-6zm12-6h6v6h-6zm-18 6h6v6h-6zm12 12h6v6h-6zm-24 6h12v6H38zm18 12h12v6H56zm12-6h6v6h-6zm6 6h10v6H74zm-20 6h6v6h-6zm14-18h6v6h-6zM46 56h6v6h-6zm20 0h12v6H66zm0 12h6v12h-6zm-18 6h6v6h-6zm12 12h6v6h-6z" />
      </svg>
    );
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      
      {/* Print stylesheet override (hides everything but the ticket card on print) */}
      <style>{`
        @media print {
          header, footer, nav, button, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .ticket-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Success banner */}
      <div className="text-center space-y-3 no-print animate-in fade-in duration-300">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Booking Confirmed!</h2>
        <p className="text-sm text-slate-450 dark:text-slate-400">
          Your ticket has been booked successfully. A copy has been simulated to your email.
        </p>
      </div>

      {/* Ticket Details Box */}
      <div className="glass-panel p-8 shadow-2xl relative border-2 border-primary-500/20 ticket-card animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Ticket Top branding */}
        <div className="flex justify-between items-center pb-6 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TripEase E-Ticket
            </h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
              Generated: {new Date(createdAt).toLocaleString()}
            </p>
          </div>
          <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Confirmed / Paid
          </span>
        </div>

        {/* Core IDs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-200/50 dark:border-slate-850/50 text-xs">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Booking ID</p>
            <p className="font-extrabold mt-1 text-slate-700 dark:text-slate-300">{bookingId}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Travel PNR</p>
            <p className="font-extrabold mt-1 text-slate-700 dark:text-slate-300">{pnr}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Travel Class</p>
            <p className="font-extrabold mt-1 text-slate-700 dark:text-slate-300">
              {item.selectedClass || item.class || item.busType}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Transaction ID</p>
            <p className="font-semibold truncate mt-1 text-slate-700 dark:text-slate-300">{paymentDetails.txId}</p>
          </div>
        </div>

        {/* Route details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-200/50 dark:border-slate-850/50 items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">From Station / City</p>
            <h4 className="font-extrabold text-lg mt-1">{item.from}</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">Departure: {item.departureTime}</p>
          </div>
          <div className="text-center relative flex flex-col items-center">
            <span className="text-[10px] font-semibold text-slate-400">Duration: {Math.floor(item.duration / 60)}h {item.duration % 60}m</span>
            <div className="w-2/3 border-t border-slate-200 dark:border-slate-800 my-2"></div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-primary-500">{travelType}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">To Station / City</p>
            <h4 className="font-extrabold text-lg mt-1">{item.to}</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">Arrival: {item.arrivalTime}</p>
          </div>
        </div>

        {/* Passengers / Seats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-200/50 dark:border-slate-850/50">
          
          {/* Passenger Names List */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Passenger(s) List</p>
            <div className="space-y-2">
              {passengers.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{idx + 1}. {p.name} ({p.gender}, Age: {p.age})</span>
                  {selectedSeats && selectedSeats[idx] && (
                    <span className="bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 border border-primary-200/50 text-primary-650 dark:text-primary-400 rounded">
                      Seat: {selectedSeats[idx]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket QR Code Display */}
          <div className="border-l border-slate-200/50 dark:border-slate-800/40 pl-6 flex items-center justify-center">
            {renderSimulatedQRCode()}
          </div>

        </div>

        {/* Pricing paid summary */}
        <div className="pt-6 flex justify-between items-center text-xs">
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Payment Method</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 mt-1">{paymentDetails.method}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Grand Total Paid</p>
            <p className="font-extrabold text-base text-primary-650 dark:text-primary-400 mt-1">₹{paymentDetails.amount}</p>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
        <button
          onClick={handlePrint}
          className="btn-secondary flex items-center justify-center gap-2 text-xs py-3 px-6"
        >
          <Printer className="h-4 w-4" />
          <span>Print E-Ticket</span>
        </button>
        <button
          onClick={handleGoToBookings}
          className="btn-secondary flex items-center justify-center gap-2 text-xs py-3 px-6"
        >
          <Ticket className="h-4 w-4" />
          <span>View My Bookings</span>
        </button>
        <button
          onClick={handleBackHome}
          className="btn-primary flex items-center justify-center gap-2 text-xs py-3 px-6 shadow-glow"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Back to Homepage</span>
        </button>
      </div>

      {/* Simulated ticket sending options */}
      <div className="glass-panel p-5 text-center space-y-4 no-print border-dashed border border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500">Simulate Actions</h4>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => alert("Simulation: E-Ticket PDF has been re-sent to your registered email address!")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-650 hover:text-primary-500 transition-colors"
          >
            <Mail className="h-4 w-4" /> Email Ticket
          </button>
          <button
            onClick={() => alert("Simulation: Ticket details PNR & Download Link SMS sent successfully!")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-650 hover:text-primary-500 transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> SMS Ticket
          </button>
        </div>
      </div>

    </div>
  );
};