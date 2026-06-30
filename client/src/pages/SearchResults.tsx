import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking, TravelType } from '../context/BookingContext';
import { api } from '../services/api';
import { SlidersHorizontal, ArrowUpDown, ShieldAlert, Plane, Train, Bus, Info, Check, Clock, ChevronRight } from 'lucide-react';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedItem, setSearchQuery } = useBooking();

  const type = (searchParams.get('type') || 'flight') as TravelType;
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [selectedTrainClass, setSelectedTrainClass] = useState<string>('');
  const [selectedTrainQuota, setSelectedTrainQuota] = useState<string>('');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string[]>([]);
  const [refundableOnly, setRefundableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('lowestPrice');

  // Load results from API
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        let endpoint = `/search/${type}s?from=${from}&to=${to}&date=${date}`;
        
        // Add query parameters for filters
        if (sortBy) endpoint += `&sortBy=${sortBy}`;
        if (refundableOnly) endpoint += `&refundable=true`;
        
        const data = await api.get<any[]>(endpoint);
        setResults(data);

        // Auto-scale slider max price based on results
        if (data.length > 0) {
          const prices = data.map(item => {
            if (type === 'flight' || type === 'bus') return item.price;
            if (type === 'train') return Object.values(item.prices)[0] as number;
            return 0;
          });
          setMaxPrice(Math.max(...prices) + 500);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    if (from && to) {
      fetchResults();
    }
  }, [type, from, to, date, sortBy, refundableOnly]);

  const handleBookItem = (item: any, trainClassSelected?: string) => {
    // If train, add selected class to the item structure
    const selectedCopy = { ...item };
    if (type === 'train' && trainClassSelected) {
      selectedCopy.selectedClass = trainClassSelected;
      selectedCopy.price = item.prices[trainClassSelected];
    } else if (type === 'train') {
      // default sleeper
      selectedCopy.selectedClass = 'Sleeper';
      selectedCopy.price = item.prices.Sleeper;
    }
    
    setSelectedItem(selectedCopy);
    
    // Sync booking query state if not set
    setSearchQuery({
      from,
      to,
      date,
      passengers: 1,
      travelClass: type === 'flight' ? item.class : (type === 'train' ? (trainClassSelected || 'Sleeper') : item.busType),
      oneWay: true
    });

    navigate('/booking');
  };

  // Client-side filtering logic
  const filteredResults = results.filter(item => {
    if (type === 'flight') {
      if (item.price > maxPrice) return false;
      if (selectedStops.length > 0 && !selectedStops.includes(item.stops)) return false;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(item.airline)) return false;
      if (refundableOnly && !item.refundable) return false;
      if (selectedTimeOfDay.length > 0) {
        const hour = parseInt(item.departureTime.split(':')[0]);
        const timeMatch = selectedTimeOfDay.some(t => {
          if (t === 'morning' && hour >= 6 && hour < 12) return true;
          if (t === 'afternoon' && hour >= 12 && hour < 18) return true;
          if (t === 'night' && (hour >= 18 || hour < 6)) return true;
          return false;
        });
        if (!timeMatch) return false;
      }
    } else if (type === 'train') {
      if (selectedTrainQuota && !item.quota.includes(selectedTrainQuota)) return false;
      if (selectedTrainClass && item.prices[selectedTrainClass] === undefined) return false;
    } else if (type === 'bus') {
      if (item.price > maxPrice) return false;
      if (selectedOperators.length > 0 && !selectedOperators.includes(item.operator)) return false;
      if (selectedBusTypes.length > 0) {
        const typeMatch = selectedBusTypes.some(t => item.busType.includes(t));
        if (!typeMatch) return false;
      }
    }
    return true;
  });

  const getUniqueAirlines = () => Array.from(new Set(results.map(r => r.airline)));
  const getUniqueOperators = () => Array.from(new Set(results.map(r => r.operator)));

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours}h ${m > 0 ? m + 'm' : ''}`;
  };

  // Mock historic price prediction
  const getPricePrediction = () => {
    const hash = from.length + to.length;
    if (hash % 3 === 0) {
      return {
        status: 'danger',
        msg: 'Smart Price Prediction: Fares are expected to increase by 18% tomorrow. We recommend booking immediately!',
        color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30'
      };
    } else if (hash % 3 === 1) {
      return {
        status: 'success',
        msg: 'Smart Price Prediction: Fares are currently at their lowest. This is the best time to book!',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30'
      };
    } else {
      return {
        status: 'warning',
        msg: 'Smart Price Prediction: Fares are currently stable. Book now to secure preferred seating.',
        color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30'
      };
    }
  };

  const prediction = getPricePrediction();

  return (
    <div className="space-y-6">
      
      {/* Header Info Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary-650 bg-primary-50 dark:bg-primary-950/25 px-2 py-0.5 rounded uppercase">
            Search Results
          </span>
          <h2 className="text-xl font-extrabold mt-1 flex items-center gap-2">
            <span>{from}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span>{to}</span>
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">
            Travel Type: <span className="capitalize font-semibold">{type}</span> | Date: {date}
          </p>
        </div>
        
        {/* Sort dropdwon */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="lowestPrice">Sort by: Lowest Price</option>
            <option value="fastest">Sort by: Fastest Duration</option>
            <option value="earliest">Sort by: Earliest Departure</option>
          </select>
        </div>
      </div>

      {/* Smart Price Prediction Alert */}
      {results.length > 0 && (
        <div className={`p-4 border rounded-2xl text-xs font-medium flex items-start gap-2.5 shadow-sm transition-all ${prediction.color}`}>
          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <p>{prediction.msg}</p>
        </div>
      )}

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Filter Column */}
        <div className="space-y-6 md:sticky md:top-20 h-fit">
          <div className="glass-panel p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/40">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary-500" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedStops([]);
                  setSelectedAirlines([]);
                  setSelectedOperators([]);
                  setSelectedBusTypes([]);
                  setSelectedTrainClass('');
                  setSelectedTrainQuota('');
                  setSelectedTimeOfDay([]);
                  setRefundableOnly(false);
                }}
                className="text-[10px] text-slate-450 hover:text-primary-500 font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Flights Specific Filters */}
            {type === 'flight' && (
              <>
                {/* Max Price slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Max Price</span>
                    <span className="text-primary-600 dark:text-primary-400">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="20000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                {/* Stops */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Stops</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Non-stop', value: 0 },
                      { label: '1 Stop', value: 1 }
                    ].map(stop => (
                      <label key={stop.value} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStops.includes(stop.value)}
                          onChange={() => {
                            if (selectedStops.includes(stop.value)) {
                              setSelectedStops(selectedStops.filter(s => s !== stop.value));
                            } else {
                              setSelectedStops([...selectedStops, stop.value]);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span>{stop.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Airlines */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Airlines</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {getUniqueAirlines().map(airline => (
                      <label key={airline} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline)}
                          onChange={() => {
                            if (selectedAirlines.includes(airline)) {
                              setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                            } else {
                              setSelectedAirlines([...selectedAirlines, airline]);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span>{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Refundable */}
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer pt-2 border-t border-slate-200/50 dark:border-slate-800/20">
                  <input
                    type="checkbox"
                    checked={refundableOnly}
                    onChange={(e) => setRefundableOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <span>Refundable Flights Only</span>
                </label>
              </>
            )}

            {/* Trains Specific Filters */}
            {type === 'train' && (
              <>
                {/* Train Class */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Travel Class</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Sleeper (SL)', value: 'Sleeper' },
                      { label: 'AC 3 Tier (3A)', value: '3A' },
                      { label: 'AC 2 Tier (2A)', value: '2A' },
                      { label: 'AC First Class (1A)', value: '1A' }
                    ].map(cls => (
                      <label key={cls.value} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="trainClass"
                          checked={selectedTrainClass === cls.value}
                          onChange={() => setSelectedTrainClass(cls.value)}
                          className="h-4 w-4 border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span>{cls.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quota */}
                <div className="space-y-2.5 pt-4 border-t border-slate-200/50 dark:border-slate-800/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Booking Quota</h4>
                  <div className="space-y-2">
                    {['General', 'Tatkal', 'Ladies'].map(quota => (
                      <label key={quota} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="trainQuota"
                          checked={selectedTrainQuota === quota}
                          onChange={() => setSelectedTrainQuota(quota)}
                          className="h-4 w-4 border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span>{quota}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Buses Specific Filters */}
            {type === 'bus' && (
              <>
                {/* Max Price slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Max Price</span>
                    <span className="text-primary-600 dark:text-primary-400">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="4000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                {/* Bus Type AC / Non-AC */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Bus Amenities</h4>
                  <div className="space-y-2">
                    {['AC', 'Non-AC', 'Sleeper', 'Seater'].map(busType => (
                      <label key={busType} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBusTypes.includes(busType)}
                          onChange={() => {
                            if (selectedBusTypes.includes(busType)) {
                              setSelectedBusTypes(selectedBusTypes.filter(b => b !== busType));
                            } else {
                              setSelectedBusTypes([...selectedBusTypes, busType]);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span>{busType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bus Operators */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Operators</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {getUniqueOperators().map(op => (
                      <label key={op} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOperators.includes(op)}
                          onChange={() => {
                            if (selectedOperators.includes(op)) {
                              setSelectedOperators(selectedOperators.filter(o => o !== op));
                            } else {
                              setSelectedOperators([...selectedOperators, op]);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span>{op}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Time of Day Filter (Flights/Buses) */}
            {type !== 'train' && (
              <div className="space-y-2.5 pt-4 border-t border-slate-200/50 dark:border-slate-800/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Departure Time</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Morning (6 AM - 12 PM)', value: 'morning' },
                    { label: 'Afternoon (12 PM - 6 PM)', value: 'afternoon' },
                    { label: 'Night (6 PM - 6 AM)', value: 'night' }
                  ].map(time => (
                    <label key={time.value} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTimeOfDay.includes(time.value)}
                        onChange={() => {
                          if (selectedTimeOfDay.includes(time.value)) {
                            setSelectedTimeOfDay(selectedTimeOfDay.filter(t => t !== time.value));
                          } else {
                            setSelectedTimeOfDay([...selectedTimeOfDay, time.value]);
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                      />
                      <span>{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Cards List Column */}
        <div className="md:col-span-3 space-y-4">
          
          {loading && (
            <div className="text-center py-12 space-y-4">
              <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-450 dark:text-slate-400">Loading schedules...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-6 text-center">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-rose-500" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {!loading && !error && filteredResults.length === 0 && (
            <div className="glass-panel p-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-bold">No travel schedules match your filters.</p>
              <p className="text-xs mt-1">Try resetting some parameters or searching for a different route.</p>
            </div>
          )}

          {!loading && !error && filteredResults.map((item) => {
            const durationFormatted = formatDuration(item.duration);

            return (
              <div key={item._id} className="glass-card p-5 hover:border-primary-500/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                
                {/* 1. Vehicle Details */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className="p-3.5 bg-gradient-to-br from-primary-600/10 to-secondary-600/10 rounded-2xl text-primary-600 dark:text-primary-400">
                    {type === 'flight' && <Plane className="h-6 w-6" />}
                    {type === 'train' && <Train className="h-6 w-6" />}
                    {type === 'bus' && <Bus className="h-6 w-6" />}
                  </div>
                  <div>
                    {type === 'flight' && (
                      <>
                        <h4 className="font-extrabold text-sm">{item.airline}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{item.flightNumber} • {item.class}</p>
                      </>
                    )}
                    {type === 'train' && (
                      <>
                        <h4 className="font-extrabold text-sm truncate max-w-[200px]">{item.trainName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">Train #{item.trainNumber}</p>
                      </>
                    )}
                    {type === 'bus' && (
                      <>
                        <h4 className="font-extrabold text-sm">{item.operator}</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550 font-bold">{item.busType}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Timeline Details */}
                <div className="flex items-center justify-between w-full md:w-1/3 text-center">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-base">{item.departureTime}</h5>
                    <p className="text-[10px] text-slate-450 font-semibold">{from}</p>
                  </div>
                  <div className="flex-1 px-4 relative flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {durationFormatted}
                    </span>
                    <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-800 relative">
                      <div className="absolute -top-1 right-1/2 translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 rounded-full text-slate-400">
                        {type === 'flight' && <Plane className="h-3 w-3" />}
                        {type === 'train' && <Train className="h-3 w-3" />}
                        {type === 'bus' && <Bus className="h-3 w-3" />}
                      </div>
                    </div>
                    {type === 'flight' && (
                      <span className="text-[9px] font-semibold text-slate-400 mt-1">
                        {item.stops === 0 ? 'Non-stop' : `${item.stops} Stop`}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-base">{item.arrivalTime}</h5>
                    <p className="text-[10px] text-slate-450 font-semibold">{to}</p>
                  </div>
                </div>

                {/* 3. Fare and Booking Button */}
                <div className="w-full md:w-1/4 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-slate-800/40 pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 text-right">
                  
                  {type === 'train' ? (
                    /* Train specific seat class grids */
                    <div className="w-full space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {Object.entries(item.prices).map(([cls, price]) => {
                          const seats = item.availableSeats[cls] || 0;
                          return (
                            <button
                              key={cls}
                              onClick={() => handleBookItem(item, cls)}
                              className={`p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 text-left transition-all active:scale-95`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold">{cls}</span>
                                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-250">₹{price as number}</span>
                              </div>
                              <p className={`text-[9px] mt-0.5 font-semibold ${seats > 10 ? 'text-emerald-500' : seats > 0 ? 'text-amber-500 font-bold' : 'text-rose-500'}`}>
                                {seats > 0 ? `${seats} Seats` : 'WL'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Flight / Bus standard price and button */
                    <>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Standard Fare</p>
                        <h4 className="font-extrabold text-xl text-primary-650 dark:text-primary-400">₹{item.price}</h4>
                        {type === 'flight' && item.refundable && (
                          <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                            Refundable
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleBookItem(item)}
                        className="btn-primary flex items-center justify-center gap-1 px-5 py-2 text-xs"
                      >
                        Book Ticket
                      </button>
                    </>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};
