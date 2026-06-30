import React, { useState } from 'react';
import { Plane, Armchair, HelpCircle } from 'lucide-react';

interface SeatSelectorProps {
  travelType: 'flight' | 'train' | 'bus';
  occupiedSeats: string[];
  maxPassengers: number;
  onSeatSelect: (seats: string[]) => void;
  selectedSeats: string[];
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  travelType,
  occupiedSeats,
  maxPassengers,
  onSeatSelect,
  selectedSeats
}) => {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      onSeatSelect(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= maxPassengers) {
        alert(`You can only select up to ${maxPassengers} seat${maxPassengers > 1 ? 's' : ''} for this booking.`);
        return;
      }
      onSeatSelect([...selectedSeats, seatId]);
    }
  };

  // 1. FLIGHT SEAT MAP GENERATION
  const renderFlightSelector = () => {
    const rows = 12;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    return (
      <div className="flex flex-col items-center select-none space-y-4">
        {/* Cockpit Indicator */}
        <div className="w-40 h-16 border-t-4 border-x-4 border-slate-300 dark:border-slate-800 rounded-t-full flex items-center justify-center bg-slate-100 dark:bg-slate-900/60 relative">
          <Plane className="h-5 w-5 text-slate-400 rotate-180" />
          <span className="absolute -top-6 text-[9px] uppercase font-bold tracking-widest text-slate-400">Aircraft Nose</span>
        </div>

        {/* Seat grid */}
        <div className="border-x-4 border-slate-200 dark:border-slate-800/80 px-8 py-6 rounded-b-3xl bg-white dark:bg-slate-950 shadow space-y-3">
          {Array.from({ length: rows }).map((_, rIdx) => {
            const rowNo = rIdx + 1;
            const isPremium = rowNo <= 3; // Business Class rows

            return (
              <div key={rowNo} className="flex items-center gap-4">
                <span className="w-4 text-center text-[10px] font-bold text-slate-400">{rowNo}</span>
                
                {/* Left 3 seats (A, B, C) */}
                <div className="flex gap-2">
                  {cols.slice(0, 3).map(col => {
                    const seatId = `${rowNo}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    
                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seatId)}
                        className={`w-7 h-7 text-[9px] font-bold rounded-lg flex items-center justify-center transition-all ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                            : isSelected
                            ? 'bg-primary-600 text-white shadow shadow-primary-500/35 hover:bg-primary-500'
                            : isPremium
                            ? 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200 dark:bg-purple-950/20 dark:border-purple-800/40 dark:text-purple-400'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                        }`}
                        title={`${seatId} ${isOccupied ? '(Occupied)' : isPremium ? '(Business Class)' : '(Economy Class)'}`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-6 flex items-center justify-center text-[8px] font-bold text-slate-300 dark:text-slate-750 uppercase tracking-widest pointer-events-none select-none">
                  Aisle
                </div>

                {/* Right 3 seats (D, E, F) */}
                <div className="flex gap-2">
                  {cols.slice(3, 6).map(col => {
                    const seatId = `${rowNo}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    
                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seatId)}
                        className={`w-7 h-7 text-[9px] font-bold rounded-lg flex items-center justify-center transition-all ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                            : isSelected
                            ? 'bg-primary-600 text-white shadow shadow-primary-500/35 hover:bg-primary-500'
                            : isPremium
                            ? 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200 dark:bg-purple-950/20 dark:border-purple-800/40 dark:text-purple-400'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                        }`}
                        title={`${seatId} ${isOccupied ? '(Occupied)' : isPremium ? '(Business Class)' : '(Economy Class)'}`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. TRAIN COMPARTMENT BERTH SELECTOR
  const renderTrainSelector = () => {
    // Train coach berths: 1-8 Lower, Middle, Upper, Side Lower, Side Upper
    // We render 4 bays (sections of berths)
    const bays = 4;
    
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-950 space-y-6">
          <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center block border-b pb-2 mb-4">
            IRCTC Standard Coach Compartment
          </span>

          {Array.from({ length: bays }).map((_, bayIdx) => {
            const startNo = bayIdx * 8 + 1;
            
            // Bay layouts:
            // Left: Lower (startNo), Middle (startNo+1), Upper (startNo+2)
            // Right: Lower (startNo+3), Middle (startNo+4), Upper (startNo+5)
            // Side: Side Lower (startNo+6), Side Upper (startNo+7)
            const berths = [
              { label: 'Lower', id: `${startNo}-L` },
              { label: 'Middle', id: `${startNo + 1}-M` },
              { label: 'Upper', id: `${startNo + 2}-U` },
              { label: 'Lower', id: `${startNo + 3}-L` },
              { label: 'Middle', id: `${startNo + 4}-M` },
              { label: 'Upper', id: `${startNo + 5}-U` },
              { label: 'Side L', id: `${startNo + 6}-SL` },
              { label: 'Side U', id: `${startNo + 7}-SU` }
            ];

            return (
              <div key={bayIdx} className="border border-slate-100 dark:border-slate-850 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <p className="text-[9px] font-bold text-slate-400 mb-3">Compartment Bay {bayIdx + 1}</p>
                
                <div className="grid grid-cols-3 gap-3">
                  
                  {/* Left Cubicle Berths */}
                  <div className="flex flex-col gap-2">
                    {berths.slice(0, 3).map(b => {
                      const isOccupied = occupiedSeats.includes(b.id);
                      const isSelected = selectedSeats.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(b.id)}
                          className={`p-2 rounded-xl text-left border flex flex-col transition-all active:scale-95 ${
                            isOccupied
                              ? 'bg-slate-200 border-slate-300 text-slate-450 dark:bg-slate-805 dark:border-slate-700'
                              : isSelected
                              ? 'bg-primary-600 border-primary-500 text-white shadow shadow-primary-500/20'
                              : 'bg-white hover:bg-slate-105 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold">{b.id}</span>
                          <span className="text-[8px] font-semibold text-slate-400 mt-0.5">{b.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Cubicle Berths */}
                  <div className="flex flex-col gap-2">
                    {berths.slice(3, 6).map(b => {
                      const isOccupied = occupiedSeats.includes(b.id);
                      const isSelected = selectedSeats.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(b.id)}
                          className={`p-2 rounded-xl text-left border flex flex-col transition-all active:scale-95 ${
                            isOccupied
                              ? 'bg-slate-200 border-slate-300 text-slate-450 dark:bg-slate-805 dark:border-slate-700'
                              : isSelected
                              ? 'bg-primary-600 border-primary-500 text-white shadow shadow-primary-500/20'
                              : 'bg-white hover:bg-slate-105 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold">{b.id}</span>
                          <span className="text-[8px] font-semibold text-slate-400 mt-0.5">{b.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Side Berths */}
                  <div className="flex flex-col gap-2 justify-center border-l border-slate-200/50 dark:border-slate-800/40 pl-3">
                    {berths.slice(6, 8).map(b => {
                      const isOccupied = occupiedSeats.includes(b.id);
                      const isSelected = selectedSeats.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(b.id)}
                          className={`p-2 rounded-xl text-left border flex flex-col transition-all active:scale-95 ${
                            isOccupied
                              ? 'bg-slate-200 border-slate-300 text-slate-450 dark:bg-slate-805 dark:border-slate-700'
                              : isSelected
                              ? 'bg-primary-600 border-primary-500 text-white shadow shadow-primary-500/20'
                              : 'bg-white hover:bg-slate-105 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold">{b.id}</span>
                          <span className="text-[8px] font-semibold text-slate-450 mt-0.5">{b.label}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. BUS SEAT LAYOUT SELECTOR (LOWER / UPPER DECK 2X2 SLEEPER)
  const renderBusSelector = () => {
    // Generate seats: L1 to L20, U1 to U20
    const prefix = activeDeck === 'lower' ? 'L' : 'U';
    const rows = 5; // 5 rows of 2x2 sleepers

    return (
      <div className="w-full max-w-sm mx-auto space-y-4">
        
        {/* Deck selectors */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 justify-center gap-1 w-fit mx-auto">
          <button
            type="button"
            onClick={() => setActiveDeck('lower')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDeck === 'lower'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Lower Deck
          </button>
          <button
            type="button"
            onClick={() => setActiveDeck('upper')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDeck === 'upper'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upper Deck
          </button>
        </div>

        {/* Bus Cabin Layout */}
        <div className="border-2 border-slate-250 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-950 shadow">
          
          {/* Driver Cabin Indicator */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-850 mb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Front / Driver Cabin</span>
            <div className="h-6 w-6 border-2 border-slate-350 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400">
              {/* Steer Wheel icon approximation */}
              <HelpCircle className="h-4.5 w-4.5 rotate-90" />
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: rows }).map((_, rIdx) => {
              const startSeat = rIdx * 4 + 1;
              const seatIds = [
                `${prefix}${startSeat}`,
                `${prefix}${startSeat + 1}`,
                `${prefix}${startSeat + 2}`,
                `${prefix}${startSeat + 3}`
              ];

              return (
                <div key={rIdx} className="flex justify-between items-center gap-4">
                  
                  {/* Left window and aisle seats (Seat 1 and Seat 2) */}
                  <div className="flex gap-3">
                    {seatIds.slice(0, 2).map((seatId, idx) => {
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seatId)}
                          className={`w-12 h-8 text-[9px] font-bold rounded-lg border flex items-center justify-center flex-col transition-all active:scale-95 ${
                            isOccupied
                              ? 'bg-slate-200 border-slate-300 text-slate-450 dark:bg-slate-805 dark:border-slate-750'
                              : isSelected
                              ? 'bg-primary-600 border-primary-500 text-white shadow shadow-primary-500/20'
                              : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
                          }`}
                          title={`${seatId} ${idx === 0 ? '(Window)' : ''}`}
                        >
                          <span className="font-extrabold">{seatId}</span>
                          <span className="text-[7px] text-slate-400 scale-[0.8]">{idx === 0 ? 'Window' : 'Aisle'}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle Spacer */}
                  <div className="w-4 border-r-2 border-dashed border-slate-100 dark:border-slate-900 h-8"></div>

                  {/* Right aisle and window seats (Seat 3 and Seat 4) */}
                  <div className="flex gap-3">
                    {seatIds.slice(2, 4).map((seatId, idx) => {
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seatId)}
                          className={`w-12 h-8 text-[9px] font-bold rounded-lg border flex items-center justify-center flex-col transition-all active:scale-95 ${
                            isOccupied
                              ? 'bg-slate-200 border-slate-300 text-slate-450 dark:bg-slate-805 dark:border-slate-750'
                              : isSelected
                              ? 'bg-primary-600 border-primary-500 text-white shadow shadow-primary-500/20'
                              : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
                          }`}
                          title={`${seatId} ${idx === 1 ? '(Window)' : ''}`}
                        >
                          <span className="font-extrabold">{seatId}</span>
                          <span className="text-[7px] text-slate-400 scale-[0.8]">{idx === 1 ? 'Window' : 'Aisle'}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs font-semibold py-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl max-w-sm mx-auto">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-primary-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-850 rounded"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Render layout */}
      {travelType === 'flight' && renderFlightSelector()}
      {travelType === 'train' && renderTrainSelector()}
      {travelType === 'bus' && renderBusSelector()}

      {/* Helper text */}
      <p className="text-[10px] text-slate-400 text-center font-medium">
        Select exactly {maxPassengers} seat{maxPassengers > 1 ? 's' : ''} to proceed with checkout.
      </p>

    </div>
  );
};
