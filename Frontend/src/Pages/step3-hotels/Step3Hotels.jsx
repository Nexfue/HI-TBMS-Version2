import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, CalendarDays, Users, Minus, Plus, Search, X } from 'lucide-react';
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

// ── Rooms & Guests popover (used inside the hotel booking form) ────────────
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

export default function Landing() {
  const navigate = useNavigate();
  const bookingSectionRef = useRef(null);
  const travelDetails = useSelector((s) => s.travel.travelDetails);
  const today = todayISO();

  // ── Hotel booking form state ─────────────────────────────────────────
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

      {/* ── Service Tabs (Flights / Hotels / Holiday Packages / Visa / Cruise) ─ */}
      <div className="max-w-7xl mx-auto px-4 mb-3">
        <ServiceTabs activeService="hotels" />
      </div>

      {/* ── Booking Bar (Hotel Booking) ────────────────────────────────── */}
      <section ref={bookingSectionRef} className="max-w-7xl mx-auto px-4 relative z-20">
        <form
          onSubmit={handleHotelSearch}
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