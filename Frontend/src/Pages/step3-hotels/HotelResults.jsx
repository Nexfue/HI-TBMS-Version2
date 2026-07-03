import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Star, BedDouble, Bath, Maximize, ChevronRight, SlidersHorizontal } from 'lucide-react';

// ── Static data ──────────────────────────────────────────────────────────
const PRICE_BANDS = [
  { id: '0-1000', label: '₹0 - ₹1000', count: 151 },
  { id: '1000-2000', label: '₹1000 - ₹2000', count: 780 },
  { id: '2000-2500', label: '₹2000 - ₹2500', count: 219 },
  { id: '2500-4000', label: '₹2500 - ₹4000', count: 378 },
  { id: '4000-5500', label: '₹4000 - ₹5500', count: 119 },
  { id: '5500+', label: '₹5500+', count: 174 },
];

const STAR_CATEGORIES = [
  { id: '3', label: '3 Star', count: 883 },
  { id: '4', label: '4 Star', count: 231 },
  { id: '5', label: '5 Star', count: 33 },
];

const USER_RATINGS = [
  { id: 'excellent', label: 'Excellent: 4.2+', count: 292 },
  { id: 'verygood', label: 'Very Good: 3.5+', count: 1013 },
  { id: 'good', label: 'Good: 3+', count: 812 },
];

const ROOMS = [
  { id: 1, name: 'Standard Rooms', tag: 'Luxury Room', price: 12500, rating: 4.9, reviews: 245, stars: 3, beds: 1, baths: 1, sqft: 350, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
  { id: 2, name: 'Deluxe Rooms', tag: 'Luxury Room', price: 20500, rating: 5.0, reviews: 189, stars: 4, beds: 1, baths: 1, sqft: 420, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80' },
  { id: 3, name: 'The Pearl Suite', tag: 'Luxury Room', price: 37500, rating: 4.9, reviews: 312, stars: 4, beds: 2, baths: 1, sqft: 560, img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80' },
  { id: 4, name: 'Golden Horizon Suite', tag: 'Luxury Suites', price: 45500, rating: 4.9, reviews: 201, stars: 5, beds: 2, baths: 2, sqft: 680, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' },
  { id: 5, name: 'The Haven Room', tag: 'Luxury Suites', price: 25000, rating: 5.0, reviews: 176, stars: 4, beds: 1, baths: 1, sqft: 400, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
  { id: 6, name: 'The Executive Deluxe', tag: 'Luxury Suites', price: 37500, rating: 5.0, reviews: 224, stars: 5, beds: 2, baths: 1, sqft: 520, img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' },
  { id: 7, name: 'The Prestige Room', tag: 'Luxury Rooms', price: 45500, rating: 5.0, reviews: 158, stars: 5, beds: 2, baths: 2, sqft: 610, img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80' },
  { id: 8, name: 'Royal Suite', tag: 'Luxury Suites', price: 49500, rating: 5.0, reviews: 267, stars: 5, beds: 3, baths: 2, sqft: 720, img: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80' },
  { id: 9, name: 'Family Suites', tag: 'Luxury Suites', price: 62000, rating: 5.0, reviews: 293, stars: 5, beds: 4, baths: 2, sqft: 850, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' },
];

const todayISO = () => new Date().toISOString().split('T')[0];

const addDays = (isoDate, days) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const formatDisplayDate = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { weekday: 'short' }) + ', ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRupees = (n) => `₹${n.toLocaleString('en-IN')}`;

// ── Checkbox row used across all filter groups ──────────────────────────
function FilterCheckbox({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
        />
        <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
      </span>
      <span className="text-xs text-gray-400">({count})</span>
    </label>
  );
}

// ── Filter sidebar ───────────────────────────────────────────────────────
function FilterSidebar({ filters, setFilters }) {
  const toggle = (group, id) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(id) ? prev[group].filter((x) => x !== id) : [...prev[group], id],
    }));
  };

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-base">Filters</h3>
        </div>

        {/* Preference */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-3">Preference</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="pricePreference"
                checked={filters.preference === 'perNight'}
                onChange={() => setFilters((p) => ({ ...p, preference: 'perNight' }))}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Price per Night</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="pricePreference"
                checked={filters.preference === 'total'}
                onChange={() => setFilters((p) => ({ ...p, preference: 'total' }))}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Total Price</span>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">new</span>
            </label>
            {filters.preference === 'total' && (
              <p className="text-xs text-gray-400 pl-6 -mt-1">All nights &amp; rooms excluding taxes</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 mb-5">
          <p className="text-sm font-bold text-gray-800 mb-3">
            {filters.preference === 'total' ? 'Total Price' : 'Price Per Night'}
          </p>
          <div className="flex flex-col">
            {PRICE_BANDS.map((band) => (
              <FilterCheckbox
                key={band.id}
                label={band.label}
                count={band.count}
                checked={filters.priceBands.includes(band.id)}
                onChange={() => toggle('priceBands', band.id)}
              />
            ))}
          </div>
        </div>

        {/* Your budget */}
        <div className="border-t border-gray-100 pt-5 mb-5">
          <p className="text-sm font-bold text-gray-800 mb-3">Your Budget</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) => setFilters((p) => ({ ...p, budgetMin: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) => setFilters((p) => ({ ...p, budgetMax: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              className="shrink-0 w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Apply budget"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Star category */}
        <div className="border-t border-gray-100 pt-5 mb-5">
          <p className="text-sm font-bold text-gray-800 mb-3">Star Category</p>
          <div className="flex flex-col">
            {STAR_CATEGORIES.map((s) => (
              <FilterCheckbox
                key={s.id}
                label={s.label}
                count={s.count}
                checked={filters.stars.includes(s.id)}
                onChange={() => toggle('stars', s.id)}
              />
            ))}
          </div>
        </div>

        {/* User rating */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm font-bold text-gray-800 mb-3">User Rating</p>
          <div className="flex flex-col">
            {USER_RATINGS.map((r) => (
              <FilterCheckbox
                key={r.id}
                label={r.label}
                count={r.count}
                checked={filters.ratings.includes(r.id)}
                onChange={() => toggle('ratings', r.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Room card ────────────────────────────────────────────────────────────
function RoomCard({ room }) {
  const navigate = useNavigate();

  const goToDetails = () => {
    navigate(`/room/${room.id}`, { state: { room } });
  };

  return (
    <div
      onClick={goToDetails}
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={room.img}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          {room.tag}
        </span>
        <span className="absolute top-3 right-3 bg-white/95 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {room.rating.toFixed(1)}
        </span>
      </div>

      <div className="p-5">
        <h4 className="text-lg font-bold text-gray-900">{room.name}</h4>

        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> {room.beds} Bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" /> {room.baths} Bath
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" /> {room.sqft} sqft
          </span>
        </div>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xl font-black text-gray-900">{formatRupees(room.price)}</p>
            <p className="text-[11px] text-gray-400">per night, excl. taxes</p>
          </div>
          <button
            type="button"
            className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compact search bar (no trending row, ends at Search button) ─────────
function SearchBar({ initialCriteria, onSearch }) {
  const today = todayISO();
  const [location, setLocation] = useState(initialCriteria?.location || 'Delhi');
  const [checkIn, setCheckIn] = useState(initialCriteria?.checkIn || today);
  const [checkOut, setCheckOut] = useState(initialCriteria?.checkOut || addDays(today, 6));
  const [rooms, setRooms] = useState(
    initialCriteria?.rooms
      ? { count: initialCriteria.rooms.length, adults: initialCriteria.rooms.reduce((s, r) => s + r.adults, 0) }
      : { count: 1, adults: 2 }
  );

  const triggerDatePicker = (id) => {
    const el = document.getElementById(id);
    try {
      el?.showPicker?.();
    } catch {
      /* no-op */
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.({
      location,
      checkIn,
      checkOut,
      rooms: [{ adults: rooms.adults, children: 0 }],
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white border border-gray-200 rounded-2xl shadow-md p-3 md:p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1.2fr_1.4fr_auto] divide-y md:divide-y-0 md:divide-x divide-gray-200 items-stretch">

        {/* City */}
        <div className="p-3 md:p-4 text-left">
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">City, Area or Property</p>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full text-lg font-bold text-gray-800 bg-transparent outline-none mt-1"
          />
        </div>

        {/* Check-in */}
        <div
          className="p-3 md:p-4 text-left cursor-pointer hover:bg-gray-50 transition relative"
          onClick={() => triggerDatePicker('results-checkin')}
        >
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Check-In</p>
          <p className="text-lg font-bold text-gray-800 mt-1 truncate">{formatDisplayDate(checkIn)}</p>
          <input
            id="results-checkin"
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
        <div
          className="p-3 md:p-4 text-left cursor-pointer hover:bg-gray-50 transition relative"
          onClick={() => triggerDatePicker('results-checkout')}
        >
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Check-Out</p>
          <p className="text-lg font-bold text-gray-800 mt-1 truncate">{formatDisplayDate(checkOut)}</p>
          <input
            id="results-checkout"
            type="date"
            min={addDays(checkIn, 1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Rooms & Guests */}
        <div className="p-3 md:p-4 text-left">
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Rooms &amp; Guests</p>
          <p className="text-lg font-bold text-gray-800 mt-1">
            {rooms.count} Room{rooms.count !== 1 ? 's' : ''}, {rooms.adults} Adult{rooms.adults !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search button */}
        <div className="p-3 md:p-4 flex items-center justify-center">
          <button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md hover:from-blue-600 hover:to-blue-700 tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function HotelResults() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  // Criteria passed from Landing.jsx via:
  // navigate('/step3/results', { state: { location, checkIn, checkOut, rooms, priceBands } })
  const criteria = routeLocation.state;

  const [filters, setFilters] = useState({
    preference: 'perNight',
    priceBands: criteria?.priceBands || [],
    budgetMin: '',
    budgetMax: '',
    stars: [],
    ratings: [],
  });

  // If someone lands here without state (e.g. direct URL visit), send them
  // back to search instead of showing an empty/undefined criteria page.
  useEffect(() => {
    if (!criteria) {
      navigate('/', { replace: true });
    }
  }, [criteria, navigate]);

  // Re-run the search: pushes fresh criteria into route state so this page
  // (and a browser refresh/back button) always reflects the current search.
  const handleNewSearch = (newCriteria) => {
    navigate('/step3/results', { state: { ...newCriteria, priceBands: filters.priceBands } });
  };

  const filteredRooms = useMemo(() => {
    return ROOMS.filter((room) => {
      if (filters.budgetMin && room.price < Number(filters.budgetMin)) return false;
      if (filters.budgetMax && room.price > Number(filters.budgetMax)) return false;

      if (filters.stars.length > 0 && !filters.stars.includes(String(room.stars))) return false;

      if (filters.ratings.length > 0) {
        const bucket = room.rating >= 4.2 ? 'excellent' : room.rating >= 3.5 ? 'verygood' : 'good';
        if (!filters.ratings.includes(bucket)) return false;
      }

      return true;
    });
  }, [filters.budgetMin, filters.budgetMax, filters.stars, filters.ratings]);

  if (!criteria) return null;

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 py-6">

        <SearchBar initialCriteria={criteria} onSearch={handleNewSearch} />

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <FilterSidebar filters={filters} setFilters={setFilters} />

          <main className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  Luxury Rooms &amp; Suites {criteria.location ? `in ${criteria.location}` : ''}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{filteredRooms.length} properties found</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-sm">
                No rooms match your budget. Try adjusting your filters.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
