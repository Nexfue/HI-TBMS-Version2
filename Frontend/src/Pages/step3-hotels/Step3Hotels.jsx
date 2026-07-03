import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Minus, Plus, X } from 'lucide-react';
import { todayISO } from '../../utils/dateHelpers';
import ServiceTabs from '../../Components/serviceTabs';
import HeaderHero from '../../Components/HeaderHero';
import Footer from '../../Components/Footer';

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
  const [showRoomsPanel, setShowRoomsPanel] = useState(false);
  const [showPricePanel, setShowPricePanel] = useState(false);

  const roomsWrapperRef = useRef(null);
  const priceWrapperRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (roomsWrapperRef.current && !roomsWrapperRef.current.contains(e.target)) setShowRoomsPanel(false);
      if (priceWrapperRef.current && !priceWrapperRef.current.contains(e.target)) setShowPricePanel(false);
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);

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

  const handleHotelSearch = (e) => {
    e.preventDefault();
    const criteria = {
      location,
      checkIn,
      checkOut,
      rooms,
      priceBands: selectedPriceBands,
    };
    navigate('/step3/results', { state: criteria });
  };

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
              <div className="p-2 md:p-5 text-left cursor-pointer hover:bg-gray-50 transition rounded-l-xl">
                <p className="text-xs text-gray-500 font-medium">City, Property Name Or Location</p>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Where are you headed?"
                  className="w-full text-2xl font-bold text-gray-800 bg-transparent outline-none mt-2 placeholder:font-normal placeholder:text-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">India</p>
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

      {/* ── Destinations ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Olhuveli Beach Resort', place: 'Male, Maldives', rating: '4.1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJlgntdG-ASh6THKUMCmtFiHNJZP7L74lwCHr7q704W0wq8F6XI1CCGz0r8sfRhDrJAU-SsdxBUWvyNemGUz9GEVp17YYsBl2DfqXDMbBZttikg017QAQCnIJ5T9bNOyz3SVqamPczos4ImLGq-hh5_Zpkllly4AtUsey2oygGN1lZhxYcRv_spoyIofO5siuvz2kIbbRv6bIgSkRTsZWXc_UluPzTah4VCsXLhow9ODJzbRvLvo0D4TEUtPUSeEQkP1NXGPQ4Bg' },
            { name: 'Sigiriya', place: 'Dambulla, Sri Lanka', rating: '4.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFUHUUjo2KiINmORPWasr-0brUstXSD1W-nYJxkmFu7tdFoxfql5PyECMzKAIk4BjntwERBJSBdAj6HvD8YvZsVwWd4ZBIn6qBnYTgBvPBO-Y_UhFqIjkhWmWAdf_2N2_obfXO1pu2HvqoX6rafN3DMslpLf09Vaf_ofKHKzFf0RYIgqVmoXA67MwPGfJ7e7m5T-2uEKlZ68bBCEZIdXiDG1SBBmFhgRJhIyEkpkcoP4J-I4pNKiwkMp5BQFXDbwXGpzM61mYVsQ' },
            { name: 'Grand Canal', place: 'Venice, Italy', rating: '4.4', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbGMnYDb4G-n9-dJVAlj0Mayb4i2FwROPGCJrnJeIQ9SskicFcL0KtBjMIfKPJeu8zNYECbOB7FQrRgNkCaA_w43eqg3Zde0IYLT_LPFEE3Pr2zv856BM26bsXgT6fgZzh_QSbZ31jCk1gFwPARyGuNxtuRjMONa3t5GymS0bc6MtAIdX51ntovrQtLJe7_uNS0V7iGIZU2-PpJyArIsNzoy1eZ29vGfUJ5iKE6L1YZJJn-EV9xgPgkk-C4UgUb0ds_AbbiXkq1A' },
          ].map((dest) => (
            <div key={dest.name} className="group cursor-pointer">
              <div className="rounded-3xl overflow-hidden h-72 mb-4 relative shadow-lg">
                <img alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={dest.img} />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                  <p className="text-slate-400 text-sm flex items-center mt-1">
                    <PinIcon className="w-4 h-4 mr-1 text-blue-500" />
                    {dest.place}
                  </p>
                </div>
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">&#9733; {dest.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Journey Simple ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Journey The Skies Made Simple</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16">
          Seamless Flight Booking And Travel Planning At Your Fingertips&#8212;Effortless, Affordable, And Stress-Free Journeys Await You!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h4 className="text-xl font-bold mb-4">Find Your<br />Destination</h4>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-1 text-white relative overflow-hidden group">
            <div className="p-10 flex flex-col h-full text-left">
              <div className="mb-8 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold mb-4">Book A Ticket</h4>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                Traveling A Wonderful Way To Travel Different Places. Learn About Different Cultures And Gain New Experiences!!
              </p>
              <button type="button" className="mt-auto text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform">
                Learn More
              </button>
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-[10px] border-white/20 overflow-hidden">
                <img className="w-full h-full object-cover scale-150 translate-x-4" src="https://lh3.googleusercontent.com/aida/ADBb0ugrwK_AGzzRpI_euPW2uJy65B11RWhwxbSFXDVgyva37DuBZ0TS3lhjZha5rQ9PVgQ00f5qe8-KjgeydmDr-7_0HbW5T5_OHDc1Ibxo6hswidnJfPvwTp3_22_SWtUvRn2Pjb8MCTjAErPc3cxa8IsPeczZubQydTc1Rh5Tae9eC_aITguBUadbcw4xc0euKEpHzGMuH1oOocCd4NFKFdQ-iBHROwOoYTT5BzyatrQz4--mNM1Brtqz1g" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h4 className="text-xl font-bold mb-4">Play &amp;<br />Journey</h4>
          </div>
        </div>
      </section>

      {/* ── Wanderlust Promo ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 relative">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl">
              <img alt="Coastline View" className="w-full h-[600px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq7iAHOrb4sYU45NBeZuLX6RILkk7xY1X7Qf5o8xl9_6AFW61aE4zzm4VogDiVh7G9jqUN2KhoqSJPF_KtucUer2RmDe3EEXtg0RJefejXi_RZEfE0y7i3UrGFZJFzteH11D15T9B9tIakek9dgNNk4AJuXNOAyPirFHYgYZhPwUnZKTBU6sFzd3TFriFKHi88iCq8f6dNgTRR953ky9n4s17E-Nj2f9xcYk9jQu_ENEHPwhtnNpYXUF3VsYMECD4PdmIDEB9_3w" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
              <p className="text-blue-600 text-3xl font-black">20% OFF</p>
              <p className="text-xs font-bold text-slate-400 mt-1">Till 28th Of March 2025</p>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-5xl lg:text-7xl font-black leading-none uppercase">Unleash</h2>
              <p className="text-[10px] leading-tight text-slate-500 uppercase font-medium">
                Discover A World Without Limits, Whether<br />You're Chasing Sunsets On Tropical Beaches Or<br />Exploring Vibrant Cityscapes
              </p>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black leading-none uppercase mb-4">Wanderlust With</h2>
            <div className="flex items-baseline space-x-6">
              <p className="text-[10px] leading-tight text-slate-500 uppercase font-medium">
                From Breathtaking Landscapes To<br />Cultural Wonders, The World Is Yours<br />To Explore.
              </p>
              <h2 className="text-5xl lg:text-7xl font-black leading-none uppercase italic -tracking-[0.02em]">Skewing's</h2>
            </div>
            <div className="mt-12 w-full h-40 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjNeMrMc2AJXxZ8z3LsmXTf0QBuP1AD-1_UxORL4zJwNCnCe-4ub3i4Oy2PKqT74K7dPlbXHjgDfdb7Wf73T652Un7x68ujMFU7e_mgHUl8k8hwfVqPBJnrjCXveKJh-8bu73o4hdC3TXjWt3IkGGEF6hVvCnNrT5m-OijezsPJzsyLNsC41-NT2PwgC7SJRB0cW9OKLRiGZHnanZMl4YNSE-ic3mUH3Ge9_e4OmCLdDr6zg-i2Snz0RQGc8KFLdfbsxoRU3Gj4g" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
