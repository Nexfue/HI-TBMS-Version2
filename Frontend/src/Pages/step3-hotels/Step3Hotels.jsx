import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Minus, Plus, X } from 'lucide-react';
import { todayISO } from '../../utils/dateHelpers';
import ServiceTabs from '../../Components/serviceTabs';
import HeaderHero from '../../Components/HeaderHero';
import Footer from '../../Components/Footer';

import { searchHotels } from "../../api/hotelApi";
import { useDispatch } from "react-redux";
import { setHotelResults } from "../../Store/slices/travelSlice";

import TravelSections from '../../Components/Component';
import { getFilteredHotelLocations } from "../../Data/hotelLocation";

// ── Small shared icon ────────────────────────────────────────────────────
const PinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      clipRule="evenodd"
      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
      fillRule="evenodd"
    />
  </svg>
);

// ── Hotel booking helpers/constants ─────────────────────────────────────────
const PRICE_BANDS = [
  { id: '0-1500', label: '₹0-₹1500' },
  { id: '1500-2500', label: '₹1500-₹2500' },
  { id: '2500-4000', label: '₹2500-₹4000' },
  { id: '4000-6000', label: '₹4000-₹6000' },
  { id: '6000+', label: '₹6000+' },
];

const TRENDING = [
  { city: 'London', country: 'United Kingdom' },
  { city: 'Dubai', country: 'United Arab Emirates' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Goa', country: 'India' }
];

const addDays = (isoDate, days) => {
  const d = isoDate ? new Date(isoDate) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { day: 'numeric' }) + " " + d.toLocaleDateString('en-IN', { month: 'short' }) + "'" + d.toLocaleDateString('en-IN', { year: '2-digit' });
};

const dayName = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-IN', { weekday: 'long' });
};

// ── City / Location search popover ──────────────────────────────────────────
function LocationDropdown({ search, onSearchChange, onSelect }) {
  const filtered = getFilteredHotelLocations(search);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 text-left"
    >
      <input
        autoFocus
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search city, property or location..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="max-h-60 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-3">No locations found</p>
        )}
        {filtered.map((item, idx) => {
          const label = typeof item === 'string' ? item : item.city || item.name || item.label;
          const subtext = typeof item === 'string' ? '' : item.subtext || item.country || '';
          return (
            <button
              key={`${label}-${idx}`}
              type="button"
              onClick={() => onSelect(label)}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50 flex items-start gap-2"
            >
              <PinIcon className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
              <span>
                <span className="block text-sm font-semibold text-gray-800">{label}</span>
                {subtext && <span className="block text-xs text-gray-400">{subtext}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Rooms & Guests popover ─────────────────────────────────────────────────
function RoomsGuestsPopover({ rooms, onChange, onClose }) {
  const totalAdults = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children, 0);

  const updateRoom = (index, field, delta, min = 0, max = 6) => {
    onChange(
      rooms.map((r, i) => (i === index ? { ...r, [field]: Math.min(max, Math.max(min, r[field] + delta)) } : r))
    );
  };

  const addRoom = () => {
    if (rooms.length >= 4) return;
    onChange([...rooms, { adults: 1, children: 0 }]);
  };

  const removeRoom = (index) => {
    if (rooms.length <= 1) return;
    onChange(rooms.filter((_, i) => i !== index));
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 text-left"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-800">
          {rooms.length} Room{rooms.length !== 1 ? 's' : ''} &bull; {totalAdults} Adult{totalAdults !== 1 ? 's' : ''}
          {totalChildren > 0 && `, ${totalChildren} Child${totalChildren !== 1 ? 'ren' : ''}`}
        </span>
        {rooms.length < 4 && (
          <button
            type="button"
            onClick={addRoom}
            className="text-xs font-bold text-blue-600 border border-blue-600 rounded px-2.5 py-1 hover:bg-blue-50 transition-colors"
          >
            + Add Room
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
        {rooms.map((room, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Room {i + 1}</span>
              {rooms.length > 1 && (
                <button type="button" onClick={() => removeRoom(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Adults</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'adults', -1, 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-600 hover:text-blue-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{room.adults}</span>
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'adults', 1, 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-600 hover:text-blue-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Children</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'children', -1, 0)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-600 hover:text-blue-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{room.children}</span>
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'children', 1, 0)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-600 hover:text-blue-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full mt-3 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Apply
      </button>
    </div>
  );
}

// ── Price Bands popover ─────────────────────────────────────────────────────
function PriceBandsPopover({ selected, onToggle, onClose }) {
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 text-left"
    >
      <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Select Budget</p>
      <div className="flex flex-col gap-1">
        {PRICE_BANDS.map((band) => {
          const active = selected.includes(band.id);
          return (
            <button
              key={band.id}
              type="button"
              onClick={() => onToggle(band.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center justify-between ${
                active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{band.label}</span>
              {active && <span className="text-xs">✓</span>}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-2 bg-gray-100 text-gray-700 rounded py-1 text-xs font-bold hover:bg-gray-200 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
   const dispatch = useDispatch();
  const bookingSectionRef = useRef(null);
  const travelDetails = useSelector((s) => s.travel.travelDetails);
  const today = todayISO();

  // ── Hotel booking form state ─────────────────────────────────────────
  const [location, setLocation] = useState(travelDetails?.to || 'Goa');
  const [checkIn, setCheckIn] = useState(travelDetails?.departureDate?.split('T')[0] || today);
  const [checkOut, setCheckOut] = useState(travelDetails?.returnDate?.split('T')[0] || addDays(today, 1));
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [selectedPriceBands, setSelectedPriceBands] = useState([]);
  
  // Panel triggers
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showRoomsPanel, setShowRoomsPanel] = useState(false);
  const [showPricePanel, setShowPricePanel] = useState(false);

  const locationWrapperRef = useRef(null);
  const roomsWrapperRef = useRef(null);
  const priceWrapperRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(e.target)) setShowLocationPanel(false);
      if (roomsWrapperRef.current && !roomsWrapperRef.current.contains(e.target)) setShowRoomsPanel(false);
      if (priceWrapperRef.current && !priceWrapperRef.current.contains(e.target)) setShowPricePanel(false);
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);

  const selectLocation = (label) => {
    setLocation(label);
    setShowLocationPanel(false);
    setLocationSearch('');
  };

  const totalAdults = rooms.reduce((s, r) => s + r.adults, 0);

  const priceSummaryText = useMemo(() => {
    if (selectedPriceBands.length === 0) return 'Select range...';
    return selectedPriceBands.map(id => PRICE_BANDS.find(b => b.id === id)?.label).join(', ');
  }, [selectedPriceBands]);

  const togglePriceBand = (id) => {
    setSelectedPriceBands((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const triggerDatePicker = (id) => {
    const el = document.getElementById(id);
    try {
      el?.showPicker?.();
    } catch {
      /* Fallback handling */
    }
  };

  const handleHotelSearch = async (e) => {
  e.preventDefault();

  try {
   const searchData = {
  destination: location,
  checkInDate: checkIn,
  checkOutDate: checkOut,
  adults: rooms[0].adults,
  children: rooms[0].children,
};

    console.log(searchData);

    const response = await searchHotels(searchData);

    console.log("Connected ✅");
    console.log(response.data);

   dispatch(setHotelResults(response.data.data));

console.log("Before navigate");

navigate("/hotel/results");

console.log("After navigate");

  } catch (error) {
    console.error(error);
  }
};
console.log("rooms:", rooms);
console.log("typeof rooms:", typeof rooms);
console.log(rooms[0]);
  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased font-['Inter',sans-serif]">
      <HeaderHero onBookClick={scrollToBooking} />

      {/* ── Service Tabs ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-3">
        <ServiceTabs activeService="hotels" />
      </div>

      {/* ── Booking Section ────────────────────────────────────────────── */}
      <section ref={bookingSectionRef} className="max-w-7xl mx-auto px-4 relative z-20 mb-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Utility Row */}
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 mb-3 px-2">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1 font-semibold cursor-pointer text-blue-600">
                <input type="radio" name="roomTypeOption" defaultChecked className="w-4 h-4 accent-blue-600" />
                <span>Upto 4 Rooms</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                <input type="radio" name="roomTypeOption" className="w-4 h-4 accent-blue-600" />
                <span>Group Deals</span>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1 rounded">new</span>
              </label>
            </div>
            <div className="hidden sm:block">
              <span>Book Domestic and International Property Online. To list your property </span>
              <a href="#" className="text-blue-600 font-medium hover:underline">Click Here</a>
            </div>
          </div>

          {/* Main Booking Panel Box — bigger, more spacious, trending searches now live inside it */}
          <form onSubmit={handleHotelSearch} className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              
              {/* Box 1: City & Location input */}
              <div
                ref={locationWrapperRef}
                className="p-2 md:p-5 text-left cursor-pointer hover:bg-gray-50 transition rounded-l-xl relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocationSearch('');
                  setShowLocationPanel((v) => !v);
                  setShowRoomsPanel(false);
                  setShowPricePanel(false);
                }}
              >
                <p className="text-xs text-gray-500 font-medium">City, Property Name Or Location</p>
                <p className={`text-2xl font-bold mt-2 truncate ${location ? 'text-gray-800' : 'text-gray-300'}`}>
                  {location || 'Where are you headed?'}
                </p>
                <p className="text-xs text-gray-400 mt-1">India</p>
                {showLocationPanel && (
                  <LocationDropdown
                    search={locationSearch}
                    onSearchChange={setLocationSearch}
                    onSelect={selectLocation}
                  />
                )}
              </div>

              {/* Box 2: Check-In Date */}
              <div 
                className="p-2 md:p-5 text-left cursor-pointer hover:bg-gray-50 transition relative" 
                onClick={() => triggerDatePicker('hotel-checkin-widget')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">Check-In</p>
                  <span className="text-blue-500 text-[10px]">▼</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">{formatDisplayDate(checkIn)}</p>
                <p className="text-xs text-gray-400 mt-1">{dayName(checkIn)}</p>
                <input
                  id="hotel-checkin-widget"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCheckIn(v);
                    if (checkOut <= v) setCheckOut(addDays(v, 1));
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Box 3: Check-Out Date */}
              <div 
                className="p-2 md:p-5 text-left cursor-pointer hover:bg-gray-50 transition relative"
                onClick={() => triggerDatePicker('hotel-checkout-widget')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">Check-Out</p>
                  <span className="text-blue-500 text-[10px]">▼</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">{formatDisplayDate(checkOut)}</p>
                <p className="text-xs text-gray-400 mt-1">{dayName(checkOut)}</p>
                <input
                  id="hotel-checkout-widget"
                  type="date"
                  min={addDays(checkIn, 1)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Box 4: Rooms & Guests custom dropdown wrapper */}
              <div 
                ref={roomsWrapperRef}
                className="p-4 md:p-5 text-left cursor-pointer hover:bg-gray-50 transition relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRoomsPanel(v => !v);
                  setShowPricePanel(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">Rooms &amp; Guests</p>
                  <span className="text-blue-500 text-[10px]">▼</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {rooms.length} <span className="text-sm font-normal text-gray-500">Rooms</span> {totalAdults} <span className="text-sm font-normal text-gray-500">Adults</span>
                </p>
                {showRoomsPanel && (
                  <RoomsGuestsPopover rooms={rooms} onChange={setRooms} onClose={() => setShowRoomsPanel(false)} />
                )}
              </div>

              {/* Box 5: Price Per Night selection */}
              <div 
                ref={priceWrapperRef}
                className="p-4 md:p-5 text-left cursor-pointer hover:bg-gray-50 transition rounded-r-xl relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPricePanel(v => !v);
                  setShowRoomsPanel(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">Price Per Night</p>
                  <span className="text-blue-500 text-[10px]">▼</span>
                </div>
                <p className="text-base font-bold text-gray-700 mt-3 truncate max-w-[200px]">{priceSummaryText}</p>
                {showPricePanel && (
                  <PriceBandsPopover selected={selectedPriceBands} onToggle={togglePriceBand} onClose={() => setShowPricePanel(false)} />
                )}
              </div>

            </div>

            {/* Trending Searches — now inside the box, below the fields */}
            <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-2.5 px-1">
              <span className="font-semibold text-gray-400 text-sm">Trending Searches:</span>
              {TRENDING.map((place, idx) => (
                <button 
                  key={idx} 
                  type="button"
                  onClick={() => setLocation(`${place.city}, ${place.country}`)}
                  className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 px-4 py-2 rounded-full transition duration-150 font-medium text-sm"
                >
                  {place.city}, {place.country}
                </button>
              ))}
            </div>

            {/* Floating Absolute Search Button centered at bottom */}
            <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 z-30">
              <button 
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg px-16 py-2.5 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 tracking-wide uppercase transition-all duration-200"
              >
                Search
              </button>
            </div>
          </form>

        </div>
      </section>
       <TravelSections />

    </div>
  );
}
