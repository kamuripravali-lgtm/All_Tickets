import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tag, Check, Copy, Ticket, Percent, Sparkles } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minBookingValue: number;
  description: string;
  isActive: boolean;
}

export const Offers: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await api.get<Coupon[]>('/bookings/coupons/list');
        setCoupons(data);
      } catch (err) {
        console.error('Failed to load coupons', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary-650 via-primary-600 to-secondary-600 text-white p-8 relative overflow-hidden grid-bg border border-white/10 shadow-xl">
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 inline-block animate-pulse">
            Exclusive Deals
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Active Offers & Promo Codes</h2>
          <p className="text-xs text-slate-100 leading-relaxed max-w-sm">
            Save extra on your travel tickets. Copy coupon codes and apply them on the booking review screen for instant discounts.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 space-y-4">
          <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-450">Loading offers...</p>
        </div>
      )}

      {/* Coupon Lists Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="glass-panel p-6 flex flex-col justify-between border-dashed border-2 border-primary-500/20 hover:border-primary-500/50 hover:shadow-xl relative overflow-hidden transition-all duration-300">
              
              {/* Tag style cutouts on left/right for coupon ticket appearance */}
              <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"></div>
              <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"></div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary-650 bg-primary-50 dark:bg-primary-950/20 px-3 py-1 rounded-lg border border-primary-500/10">
                    <Percent className="h-4 w-4" />
                    <span>{coupon.discountType === 'percentage' ? `${coupon.discountValue}% DISCOUNT` : `FLAT ₹${coupon.discountValue} OFF`}</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-secondary-500 animate-pulse" />
                </div>
                
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-250">{coupon.description}</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-400">
                  Minimum booking value: <span className="font-bold text-slate-700 dark:text-slate-300">₹{coupon.minBookingValue}</span>. Valid on flights, trains, and buses.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/30 mt-6 pt-4">
                <code className="text-sm font-extrabold text-slate-750 dark:text-slate-250 bg-slate-100 dark:bg-slate-850 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 tracking-wider">
                  {coupon.code}
                </code>
                
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    copiedCode === coupon.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary-600 hover:bg-primary-500 text-white'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
