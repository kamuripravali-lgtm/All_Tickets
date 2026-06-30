import React, { createContext, useState, useContext } from 'react';
import { Passenger } from './AuthContext';

export type TravelType = 'flight' | 'train' | 'bus';

export interface SearchQuery {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
  oneWay: boolean;
}

interface BookingContextType {
  activeTab: TravelType;
  setActiveTab: (tab: TravelType) => void;
  searchQuery: SearchQuery | null;
  setSearchQuery: (query: SearchQuery) => void;
  selectedItem: any | null; // flight, train, or bus object
  setSelectedItem: (item: any) => void;
  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;
  selectedPassengers: Passenger[];
  setSelectedPassengers: (passengers: Passenger[]) => void;
  coupon: { code: string; discount: number; description: string } | null;
  setCoupon: (coupon: { code: string; discount: number; description: string } | null) => void;
  bookingComplete: any | null; // final API response booking object
  setBookingComplete: (booking: any) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const defaultSearchQuery = (): SearchQuery => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    from: 'Delhi',
    to: 'Mumbai',
    date: tomorrow.toISOString().split('T')[0],
    passengers: 1,
    travelClass: 'Economy',
    oneWay: true
  };
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TravelType>('flight');
  const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(defaultSearchQuery());
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPassengers, setSelectedPassengers] = useState<Passenger[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [bookingComplete, setBookingComplete] = useState<any | null>(null);

  const resetBooking = () => {
    setSelectedItem(null);
    setSelectedSeats([]);
    setSelectedPassengers([]);
    setCoupon(null);
    setBookingComplete(null);
  };

  return (
    <BookingContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedItem,
        setSelectedItem,
        selectedSeats,
        setSelectedSeats,
        selectedPassengers,
        setSelectedPassengers,
        coupon,
        setCoupon,
        bookingComplete,
        setBookingComplete,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
