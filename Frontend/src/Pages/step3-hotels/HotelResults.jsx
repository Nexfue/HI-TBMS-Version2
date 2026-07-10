import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Star, BedDouble, Bath, Maximize, ChevronRight, SlidersHorizontal } from 'lucide-react';

import { selectHotels, setHotelResults } from "../../Store/slices/travelSlice";
import { searchHotels } from "../../api/hotelApi";
import { getFilteredHotelLocations } from "../../Data/hotelLocation";

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

const todayISO = () => new Date().toISOString().split('T')[0];

const addDays = (isoDate, days) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const formatDisplayDate = (isoDate) => {
  const d = new Date(isoDate);
  return (
    d.toLocaleDateString('en-IN', { weekday: 'short' }) +
    ', ' +
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  );
};

function formatRupees(price) {
  if (!price) return 'N/A';
  return price; // API already returns "₹1,256"
}

// ── City / Location search popover (shared style with Landing page) ─────
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
        placeholder="Search city, area or property..."
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
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-50"
            >
              <span className="block text-sm font-semibold text-gray-800">{label}</span>
              {subtext && <span className="block text-xs text-gray-400">{subtext}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
    navigate(`/room/${encodeURIComponent(room.name)}`, {
      state: { room },
    });
  };

  return (
    <div
      onClick={goToDetails}
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          {room.type}
        </span>
        <span className="absolute top-3 right-3 bg-white/95 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {room.rating?.toFixed(1)}
        </span>
      </div>

      <div className="p-5">
        <h4 className="text-lg font-bold text-gray-900">{room.name}</h4>

        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
          <span>{room.reviews} reviews</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {room.amenities?.slice(0, 3).map((item) => (
            <span key={item} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xl font-black text-gray-900">{formatRupees(room.pricePerNight)}</p>
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
function SearchBar({ initialCriteria, onSearch, isSearching }) {
  const today = todayISO();
  const [location, setLocation] = useState(initialCriteria?.location || 'Delhi');
  const [checkIn, setCheckIn] = useState(initialCriteria?.checkIn || today);
  const [checkOut, setCheckOut] = useState(initialCriteria?.checkOut || addDays(today, 6));
  const [rooms, setRooms] = useState(
    initialCriteria?.rooms
      ? { count: initialCriteria.rooms.length, adults: initialCriteria.rooms.reduce((s, r) => s + r.adults, 0) }
      : { count: 1, adults: 2 }
  );

  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [touched, setTouched] = useState({ location: false, checkIn: false, checkOut: false });
  const locationWrapperRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(e.target)) {
        setShowLocationPanel(false);
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);

  const selectLocation = (label) => {
    setLocation(label);
    setShowLocationPanel(false);
    setLocationSearch('');
    setTouched((t) => ({ ...t, location: false }));
  };

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

    if (!location || !checkIn || !checkOut || checkOut <= checkIn) {
      setTouched({ location: true, checkIn: true, checkOut: true });
      return;
    }

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
        <div
          ref={locationWrapperRef}
          className="p-3 md:p-4 text-left cursor-pointer hover:bg-gray-50 transition relative"
          onClick={(e) => {
            e.stopPropagation();
            setLocationSearch('');
            setShowLocationPanel((v) => !v);
          }}
        >
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">City, Area or Property</p>
          <p className={`text-lg font-bold mt-1 truncate ${location ? 'text-gray-800' : 'text-gray-300'}`}>
            {location || 'Where are you headed?'}
          </p>
          {touched.location && !location && <p className="text-[11px] text-red-500 mt-1">Required</p>}
          {showLocationPanel && (
            <LocationDropdown
              search={locationSearch}
              onSearchChange={setLocationSearch}
              onSelect={selectLocation}
            />
          )}
        </div>

        {/* Check-in */}
        <div
          className="p-3 md:p-4 text-left cursor-pointer hover:bg-gray-50 transition relative"
          onClick={() => triggerDatePicker('results-checkin')}
        >
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Check-In</p>
          <p className="text-lg font-bold text-gray-800 mt-1 truncate">{formatDisplayDate(checkIn)}</p>
          {touched.checkIn && !checkIn && <p className="text-[11px] text-red-500 mt-1">Required</p>}
          <input
            id="results-checkin"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              const v = e.target.value;
              setCheckIn(v);
              if (checkOut <= v) setCheckOut(addDays(v, 1));
              setTouched((t) => ({ ...t, checkIn: false }));
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
          {touched.checkOut && (!checkOut || checkOut <= checkIn) && (
            <p className="text-[11px] text-red-500 mt-1">
              {checkOut ? 'Must be after Check-In' : 'Required'}
            </p>
          )}
          <input
            id="results-checkout"
            type="date"
            min={addDays(checkIn, 1)}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setTouched((t) => ({ ...t, checkOut: false }));
            }}
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
            disabled={isSearching}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md hover:from-blue-600 hover:to-blue-700 tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function HotelResults() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hotels = useSelector(selectHotels);

  const [filters, setFilters] = useState({
    preference: 'perNight',
    priceBands: [],
    budgetMin: '',
    budgetMax: '',
    stars: [],
    ratings: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Re-run the search: actually calls the hotel search API and pushes the
  // fresh results into redux — same backend wiring as the Landing page.
  const handleNewSearch = async (criteria) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const searchData = {
        destination: criteria.location,
        checkInDate: criteria.checkIn,
        checkOutDate: criteria.checkOut,
        adults: criteria.rooms[0].adults,
        children: criteria.rooms[0].children,
      };

      const response = await searchHotels(searchData);

      dispatch(setHotelResults(response.data.data));

      // Keep the URL/route state in sync so refresh / back button reflect
      // the latest search criteria too.
      navigate('/hotel/results', { state: { ...criteria, priceBands: filters.priceBands } });
    } catch (error) {
      console.error(error);
      setSearchError('Something went wrong while searching hotels. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // hotels from Redux may be undefined on first render before the API call resolves
  const filteredRooms = hotels || [];

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <SearchBar onSearch={handleNewSearch} isSearching={isSearching} />

        {searchError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            {searchError}
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <FilterSidebar filters={filters} setFilters={setFilters} />

          <main className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Luxury Rooms &amp; Suites</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isSearching ? 'Searching...' : `${filteredRooms.length} properties found`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <RoomCard key={`${room.name}-${index}`} room={room} />
              ))}
            </div>

            {!isSearching && filteredRooms.length === 0 && (
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
