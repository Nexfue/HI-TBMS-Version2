import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, CalendarDays, Users, Minus, Plus, Search, X } from 'lucide-react';
import { todayISO } from '../../utils/dateHelpers';

const PRICE_BANDS = [
  { id: '0-1500', label: '₹0 – ₹1,500' },
  { id: '1500-2500', label: '₹1,500 – ₹2,500' },
  { id: '2500-4000', label: '₹2,500 – ₹4,000' },
  { id: '4000-6000', label: '₹4,000 – ₹6,000' },
  { id: '6000+', label: '₹6,000+' },
];

const TRENDING = ['New York, United States', 'London, United Kingdom', 'Bangkok, Thailand', 'Goa, India'];

const addDays = (isoDate, days) => {
  const d = isoDate ? new Date(isoDate) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

const dayName = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-IN', { weekday: 'long' });
};

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
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#c3c5d9]/40 z-50 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[#191c1e]">
          {rooms.length} Room{rooms.length !== 1 ? 's' : ''} &bull; {totalAdults} Adult{totalAdults !== 1 ? 's' : ''}
          {totalChildren > 0 && `, ${totalChildren} Child${totalChildren !== 1 ? 'ren' : ''}`}
        </span>
        {rooms.length < 4 && (
          <button
            type="button"
            onClick={addRoom}
            className="text-xs font-bold text-[#003ec7] border border-[#003ec7] rounded px-2.5 py-1 hover:bg-[#003ec7]/5 transition-colors"
          >
            + Add Room
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
        {rooms.map((room, i) => (
          <div key={i} className="border border-[#c3c5d9]/40 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#434656] uppercase tracking-wide">Room {i + 1}</span>
              {rooms.length > 1 && (
                <button type="button" onClick={() => removeRoom(i)} className="text-[#434656] hover:text-[#ba1a1a] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#191c1e]">Adults</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'adults', -1, 1)}
                  className="w-7 h-7 rounded-full border border-[#c3c5d9] flex items-center justify-center text-[#434656] hover:border-[#003ec7] hover:text-[#003ec7]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{room.adults}</span>
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'adults', 1, 1)}
                  className="w-7 h-7 rounded-full border border-[#c3c5d9] flex items-center justify-center text-[#434656] hover:border-[#003ec7] hover:text-[#003ec7]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#191c1e]">Children</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'children', -1, 0)}
                  className="w-7 h-7 rounded-full border border-[#c3c5d9] flex items-center justify-center text-[#434656] hover:border-[#003ec7] hover:text-[#003ec7]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{room.children}</span>
                <button
                  type="button"
                  onClick={() => updateRoom(i, 'children', 1, 0)}
                  className="w-7 h-7 rounded-full border border-[#c3c5d9] flex items-center justify-center text-[#434656] hover:border-[#003ec7] hover:text-[#003ec7]"
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
        className="w-full mt-3 bg-[#0052ff] text-white rounded-lg py-2 text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Apply
      </button>
    </div>
  );
}

export default function HotelBookingForm({ onSearch }) {
  const navigate = useNavigate();
  const travelDetails = useSelector((s) => s.travel.travelDetails);
  const today = todayISO();

  const [location, setLocation] = useState(travelDetails?.to || '');
  const [checkIn, setCheckIn] = useState(travelDetails?.departureDate?.split('T')[0] || today);
  const [checkOut, setCheckOut] = useState(travelDetails?.returnDate?.split('T')[0] || addDays(today, 1));
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [selectedPriceBands, setSelectedPriceBands] = useState([]);
  const [showRoomsPanel, setShowRoomsPanel] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowRoomsPanel(false);
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);

  const totalAdults = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children, 0);

  const roomsSummary = useMemo(() => {
    const parts = [`${rooms.length} Room${rooms.length !== 1 ? 's' : ''}`, `${totalAdults} Adult${totalAdults !== 1 ? 's' : ''}`];
    if (totalChildren > 0) parts.push(`${totalChildren} Child${totalChildren !== 1 ? 'ren' : ''}`);
    return parts.join(', ');
  }, [rooms.length, totalAdults, totalChildren]);

  const togglePriceBand = (id) => {
    setSelectedPriceBands((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const triggerDatePicker = (id) => {
    const el = document.getElementById(id);
    try {
      el?.showPicker?.();
    } catch {
      /* Safari fallback: input still opens on click */
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const criteria = {
      location,
      checkIn,
      checkOut,
      rooms,
      priceBands: selectedPriceBands,
    };
    if (onSearch) {
      onSearch(criteria);
    } else {
      navigate('/step3/results', { state: criteria });
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-xl border border-[#c3c5d9]/40 p-6 md:p-8 max-w-4xl mx-auto"
    >
      {/* City / Property / Location */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-6 items-end mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-[#434656]">
            <MapPin className="w-[15px] h-[15px] text-[#003ec7]" />
            City, Property Name or Location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="Where are you headed?"
            className="text-lg font-bold text-[#191c1e] placeholder:text-[#c3c5d9] placeholder:font-normal outline-none border-b-2 border-transparent focus:border-[#003ec7] pb-1 transition-colors"
          />
        </div>

        {/* Check-in */}
        <div className="relative flex flex-col gap-1.5 cursor-pointer" onClick={() => triggerDatePicker('hotel-checkin')}>
          <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-[#434656]">
            <CalendarDays className="w-[15px] h-[15px] text-[#003ec7]" />
            Check-In
          </label>
          <div>
            <p className="text-lg font-bold text-[#191c1e] leading-tight">{formatDisplayDate(checkIn)}</p>
            <p className="text-xs text-[#434656]">{dayName(checkIn)}</p>
          </div>
          <input
            id="hotel-checkin"
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

        {/* Check-out */}
        <div className="relative flex flex-col gap-1.5 cursor-pointer" onClick={() => triggerDatePicker('hotel-checkout')}>
          <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-[#434656]">
            <CalendarDays className="w-[15px] h-[15px] text-[#003ec7]" />
            Check-Out
          </label>
          <div>
            <p className="text-lg font-bold text-[#191c1e] leading-tight">{formatDisplayDate(checkOut)}</p>
            <p className="text-xs text-[#434656]">{dayName(checkOut)}</p>
          </div>
          <input
            id="hotel-checkout"
            type="date"
            min={addDays(checkIn, 1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Rooms & Guests + Price bands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative" ref={wrapperRef}>
          <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-[#434656] mb-1.5">
            <Users className="w-[15px] h-[15px] text-[#003ec7]" />
            Rooms &amp; Guests
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowRoomsPanel((v) => !v);
            }}
            className="w-full text-left border border-[#c3c5d9]/70 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#191c1e] hover:border-[#003ec7] transition-colors"
          >
            {roomsSummary}
          </button>
          {showRoomsPanel && (
            <RoomsGuestsPopover rooms={rooms} onChange={setRooms} onClose={() => setShowRoomsPanel(false)} />
          )}
        </div>

        <div>
          <label className="block font-mono text-xs font-medium uppercase tracking-wide text-[#434656] mb-1.5">
            Price Per Night
          </label>
          <div className="flex flex-wrap gap-2">
            {PRICE_BANDS.map((band) => {
              const active = selectedPriceBands.includes(band.id);
              return (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => togglePriceBand(band.id)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#003ec7] bg-[#003ec7]/10 text-[#003ec7]'
                      : 'border-[#c3c5d9]/70 text-[#434656] hover:border-[#003ec7] hover:text-[#003ec7]'
                  }`}
                >
                  {band.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trending searches */}
      <div className="flex flex-wrap items-center gap-2 mb-7">
        <span className="text-xs font-bold text-[#434656] mr-1">Trending Searches:</span>
        {TRENDING.map((place) => (
          <button
            key={place}
            type="button"
            onClick={() => setLocation(place)}
            className="text-xs font-medium text-[#434656] bg-[#eceef0] hover:bg-[#dfe2e5] rounded-full px-3 py-1.5 transition-colors"
          >
            {place}
          </button>
        ))}
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="w-full md:w-auto md:mx-auto md:flex inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0052ff] to-[#0ea5e9] text-white px-16 py-3.5 rounded-full text-base font-bold hover:opacity-90 transition-opacity shadow-lg"
      >
        <Search className="w-5 h-5" />
        Search Hotels
      </button>
    </form>
  );
}

