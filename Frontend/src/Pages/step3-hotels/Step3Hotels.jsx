import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays, Users, Moon, AlertCircle, RefreshCw, Star, CheckCircle2,
  MapPin, BedDouble, Building2, ArrowLeft, ArrowRight,
} from 'lucide-react';

import {
  selectTravelDetails, selectHotel, selectSelectedRoom, selectNights,
  setHotel, setSelectedRoom,
} from '../../Store/slices/travelSlice';
import { searchHotels } from '../../Service/apiService';
//import { useAmenityIcon } from '../../hooks/useAmenityIcon';

const MAX_PRICE = 15000;

// All component styles live here instead of a separate .css file.
// Rendered once via a <style> tag in the JSX below.
const STYLES = `
.page-wrapper {
  --primary: #003ec7;
  --primary-container: #0052ff;
  --info-sky: #0ea5e9;
  --warning-amber: #f59e0b;
  --on-surface: #191c1e;
  --on-surface-var: #434656;
  --outline-variant: #c3c5d9;
  --surface: #f7f9fb;
  --surface-container: #eceef0;
  --secondary-cont: #d0e1fb;
  --white: #ffffff;
  --success: #10b981;
  --font-headline: 'Hanken Grotesk', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  min-height: 100vh;
  background: var(--surface);
  color: var(--on-surface);
  font-family: var(--font-headline);
  padding-bottom: 80px;
}

.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 40px 32px;
}

.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.hero-left { flex: 1; min-width: 260px; }

.hero-title {
  font-size: 48px;
  line-height: 56px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--on-surface);
  margin: 0 0 8px;
}

.hero-sub {
  font-size: 18px;
  line-height: 28px;
  color: var(--on-surface-var);
  margin: 0;
  max-width: 540px;
}

.context-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(236, 238, 240, 0.7);
  border: 1px solid rgba(195, 197, 217, 0.4);
  border-radius: 12px;
  padding: 16px 24px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.ctx-item { display: flex; align-items: center; gap: 10px; }
.ctx-icon { width: 22px; height: 22px; color: var(--info-sky); flex-shrink: 0; }

.ctx-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--on-surface-var);
  margin: 0 0 2px;
}

.ctx-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
  white-space: nowrap;
}

.ctx-divider { width: 1px; height: 40px; background: rgba(195, 197, 217, 0.4); flex-shrink: 0; }

.filter-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }

.pill {
  padding: 7px 18px;
  border-radius: 999px;
  border: 1.5px solid rgba(195, 197, 217, 0.7);
  background: transparent;
  color: var(--on-surface-var);
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.pill:hover { background: var(--surface-container); border-color: var(--outline-variant); color: var(--on-surface); }
.pill--active {
  background: var(--primary-container);
  border-color: var(--primary-container);
  color: var(--white);
  font-weight: 700;
}
.pill--active:hover { opacity: 0.88; }

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0 20px;
  font-size: 14px;
  color: var(--on-surface-var);
}
.status-row--warn { color: #b45309; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(14, 165, 233, 0.25);
  border-top-color: var(--info-sky);
  border-radius: 50%;
  animation: step3-spin 0.7s linear infinite;
}
@keyframes step3-spin { to { transform: rotate(360deg); } }

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-retry:hover { opacity: 0.75; }

.hotels-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

.hotel-card {
  background: var(--white);
  border: 1px solid rgba(195, 197, 217, 0.45);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.hotel-card:hover { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
.hotel-card--selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary), 0 6px 24px rgba(0, 62, 199, 0.12);
  transform: translateY(-2px);
}

.hc-image {
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}
.hc-image:hover { filter: brightness(1.08); }
.hc-image--0 { background: linear-gradient(135deg, #0a4fa8 0%, #1a73e8 50%, #0d47a1 100%); }
.hc-image--1 { background: linear-gradient(135deg, #006064 0%, #00838f 50%, #004d40 100%); }
.hc-image--2 { background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #311b92 100%); }
.hc-image--3 { background: linear-gradient(135deg, #b71c1c 0%, #e53935 50%, #880e4f 100%); }
.hc-image--4 { background: linear-gradient(135deg, #1b5e20 0%, #388e3c 50%, #004d40 100%); }

.hc-initial {
  font-size: 72px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.15);
  user-select: none;
  letter-spacing: -0.03em;
}

.hc-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
}

.hc-star { color: var(--warning-amber); }

.hc-sel-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--success);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hc-body { padding: 20px 20px 16px; cursor: pointer; }

.hc-name { font-size: 20px; font-weight: 600; color: var(--on-surface); margin: 0 0 6px; }

.hc-location {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  color: var(--on-surface-var);
  margin: 0 0 16px;
}

.hc-amenities { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }

.amenity-tile { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.amenity-tile svg {
  color: #54647a;
  background: rgba(208, 225, 251, 0.4);
  padding: 6px;
  border-radius: 6px;
  box-sizing: content-box;
}
.amenity-tile span { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.04em; color: var(--on-surface-var); }

.hc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(195, 197, 217, 0.3);
}

.hc-price { font-size: 24px; font-weight: 700; color: var(--primary); }
.hc-per-night { font-size: 13px; color: var(--on-surface-var); margin-left: 2px; }

.btn-book {
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 9px 22px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.btn-book:hover { background: var(--primary-container); }
.btn-book--active { background: var(--success); }
.btn-book--active:hover { background: #0ea473; }

.room-panel { background: var(--surface-container); border-top: 1px solid rgba(195, 197, 217, 0.35); padding: 16px 20px; cursor: default; }

.room-panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--on-surface-var);
  margin: 0 0 12px;
}
.room-panel-title svg { color: var(--primary); }

.room-options { display: flex; flex-direction: column; gap: 8px; }

.room-opt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1.5px solid rgba(195, 197, 217, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: var(--white);
  transition: border-color 0.15s, background 0.15s;
}
.room-opt:hover { border-color: var(--primary); }
.room-opt--active {
  border-color: var(--primary);
  background: rgba(0, 62, 199, 0.05);
  box-shadow: 0 0 0 1px var(--primary);
}

.room-info { flex: 1; }
.room-name { font-size: 14px; font-weight: 700; color: var(--on-surface); margin: 0 0 2px; }
.room-desc { font-size: 12px; color: var(--on-surface-var); margin: 0; }
.room-price { font-size: 14px; font-weight: 700; color: var(--primary); white-space: nowrap; margin: 0; }

.room-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(195, 197, 217, 0.3);
  font-size: 13px;
  color: var(--on-surface-var);
}
.room-total strong { font-size: 16px; font-weight: 700; color: var(--primary); }

.empty-state { text-align: center; padding: 64px 24px; }
.empty-state .empty-icon {
  width: 56px;
  height: 56px;
  color: rgba(195, 197, 217, 0.7);
  display: block;
  margin: 0 auto 16px;
}
.empty-state h3 { font-size: 20px; font-weight: 700; color: var(--on-surface); margin: 0 0 8px; }
.empty-state p { font-size: 14px; color: var(--on-surface-var); margin: 0; }

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid rgba(195, 197, 217, 0.4);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  padding: 12px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 40;
}

.bar-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--on-surface);
}
.bar-summary svg { color: var(--primary); }

.bar-hint { font-size: 14px; font-weight: 400; color: var(--on-surface-var); }
.bar-price { font-weight: 700; color: var(--primary); font-size: 17px; }

.bar-actions { display: flex; gap: 12px; align-items: center; }

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid rgba(195, 197, 217, 0.7);
  background: transparent;
  color: var(--on-surface-var);
  padding: 9px 20px;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.btn-back:hover { border-color: var(--on-surface-var); color: var(--on-surface); }

.btn-continue {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-container);
  color: var(--white);
  border: none;
  padding: 10px 28px;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-continue:hover:not(:disabled) { opacity: 0.88; }
.btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }

@media (max-width: 1024px) {
  .hotels-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .main-content { padding: 32px 16px 24px; }
  .hero-title { font-size: 32px; line-height: 40px; }
  .hero-section { flex-direction: column; align-items: flex-start; }
  .context-card { width: 100%; }
  .hotels-grid { grid-template-columns: 1fr; }
  .bottom-bar { padding: 12px 16px; }
}
`;

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatInr(value) {
  return value.toLocaleString('en-IN');
}

export default function Step3Hotels() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { amenityIcon, amenityLabel } = useAmenityIcon();

  const travelDetails = useSelector(selectTravelDetails);
  const storedHotel = useSelector(selectHotel);
  const storedRoom = useSelector(selectSelectedRoom);
  const nights = useSelector(selectNights);

  // ── Local UI state ───────────────────────────────────────────────────
  const [allHotels, setAllHotels] = useState([]);
  const [sortBy, setSortBy] = useState('rating'); // 'price-asc' | 'price-desc' | 'rating'
  const [minRating, setMinRating] = useState(0);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  const [selectedHotel, setSelectedHotelState] = useState(null);
  const [selectedRoom, setSelectedRoomState] = useState(null);

  // ── Derived state ────────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    return [...allHotels]
      .filter((h) => h.rating >= minRating && h.pricePerNight <= MAX_PRICE)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
        if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
        return b.rating - a.rating;
      });
  }, [allHotels, minRating, sortBy]);

  const canContinue = !!selectedHotel && !!selectedRoom;

  const totalRoomCost = useMemo(() => {
    if (!selectedHotel || !selectedRoom) return 0;
    return (selectedHotel.pricePerNight + selectedRoom.extraCharge) * nights;
  }, [selectedHotel, selectedRoom, nights]);

  // ── Actions ──────────────────────────────────────────────────────────
  const handleSelectHotel = useCallback((hotel) => {
    setSelectedHotelState(hotel);
    setSelectedRoomState(hotel.rooms[0] ?? null);
  }, []);

  const handleSelectRoom = useCallback((room) => {
    setSelectedRoomState(room);
  }, []);

  const toggleRating = useCallback((r) => {
    setMinRating((prev) => (prev === r ? 0 : r));
  }, []);

  const loadHotels = useCallback(async () => {
    if (!travelDetails) {
      navigate('/step1');
      return;
    }

    setLoading(true);
    setApiError(false);

    try {
      const hotels = await searchHotels(
        travelDetails.to,
        travelDetails.departureDate,
        travelDetails.returnDate || addDays(travelDetails.departureDate, 7),
        travelDetails.travelers
      );
      setAllHotels(hotels);
      setApiError(hotels.length === 0);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelDetails, navigate]);

  const retrySearch = useCallback(() => {
    loadHotels();
  }, [loadHotels]);

  // `continue` is a reserved word in JS, so the Angular method name
  // becomes `handleContinue` here.
  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    dispatch(setHotel(selectedHotel));
    dispatch(setSelectedRoom(selectedRoom));
    navigate('/step4');
  }, [canContinue, dispatch, selectedHotel, selectedRoom, navigate]);

  // ── Lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    if (storedHotel) {
      setSelectedHotelState(storedHotel);
      setSelectedRoomState(storedRoom);
    }
    loadHotels();
    // Runs once on mount, mirroring Angular's ngOnInit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-wrapper">
      <style>{STYLES}</style>

      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-200 bg-white font-sans">
        <div className="text-2xl font-bold tracking-tighter uppercase">Holiday Infinite</div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-wide">
          <Link className="hover:text-blue-600 transition-colors" to="/">Package</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Contact</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Home</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Tour</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">About</Link>
        </nav>
        <Link
          to="/"
          className="bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-bold uppercase hover:bg-zinc-800 transition-all"
        >
          Book Trip
        </Link>
      </header>

      <main className="main-content">
        {/* Hero / Context */}
        <section className="hero-section">
          <div className="hero-left">
            <h1 className="hero-title">Choose Your Hotel</h1>
            <p className="hero-sub">
              Discover unmatched luxury and comfort in our handpicked selection of premium hotels across the globe.
            </p>
          </div>

          {travelDetails && (
            <div className="context-card">
              <div className="ctx-item">
                <CalendarDays className="ctx-icon" />
                <div>
                  <p className="ctx-label">DATES</p>
                  <p className="ctx-value">
                    {formatDate(travelDetails.departureDate)}
                    {travelDetails.returnDate && <> – {formatDate(travelDetails.returnDate)}</>}
                  </p>
                </div>
              </div>
              <div className="ctx-divider" />
              <div className="ctx-item">
                <Users className="ctx-icon" />
                <div>
                  <p className="ctx-label">GUESTS</p>
                  <p className="ctx-value">
                    {travelDetails.travelers} Adult{travelDetails.travelers > 1 ? 's' : ''}, 1 Room
                  </p>
                </div>
              </div>
              <div className="ctx-divider" />
              <div className="ctx-item">
                <Moon className="ctx-icon" />
                <div>
                  <p className="ctx-label">NIGHTS</p>
                  <p className="ctx-value">{nights} Night{nights !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Filter pills */}
        <div className="filter-pills">
          <button
            className={`pill ${sortBy === 'rating' && minRating === 0 ? 'pill--active' : ''}`}
            onClick={() => { setSortBy('rating'); setMinRating(0); }}
          >
            All Hotels
          </button>
          <button
            className={`pill ${sortBy === 'price-asc' ? 'pill--active' : ''}`}
            onClick={() => setSortBy('price-asc')}
          >
            Price: Low → High
          </button>
          <button
            className={`pill ${sortBy === 'price-desc' ? 'pill--active' : ''}`}
            onClick={() => setSortBy('price-desc')}
          >
            Price: High → Low
          </button>
          <button
            className={`pill ${minRating === 4 ? 'pill--active' : ''}`}
            onClick={() => toggleRating(4)}
          >
            4★ &amp; Above
          </button>
          <button
            className={`pill ${minRating === 4.5 ? 'pill--active' : ''}`}
            onClick={() => toggleRating(4.5)}
          >
            4.5★ &amp; Above
          </button>
        </div>

        {/* Status rows */}
        {loading && (
          <div className="status-row">
            <span className="spinner" aria-hidden="true" />
            <span>Loading available hotels…</span>
          </div>
        )}
        {!loading && apiError && (
          <div className="status-row status-row--warn">
            <AlertCircle size={18} />
            <span>No hotels found. The backend may still be starting up, or no hotels exist for this destination.</span>
            <button className="btn-retry" onClick={retrySearch}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* Hotel grid */}
        <div className="hotels-grid">
          {filteredHotels.map((hotel, i) => (
            <div
              key={hotel.id}
              className={`hotel-card ${selectedHotel?.id === hotel.id ? 'hotel-card--selected' : ''}`}
            >
              {/* Image / visual area */}
              <div className={`hc-image hc-image--${i % 5}`} onClick={() => handleSelectHotel(hotel)}>
                <div className="hc-initial">{hotel.name.charAt(0)}</div>
                <div className="hc-rating">
                  <Star className="hc-star" size={16} />
                  {hotel.rating}
                </div>
                {selectedHotel?.id === hotel.id && (
                  <div className="hc-sel-badge">
                    <CheckCircle2 size={14} /> Selected
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="hc-body" onClick={() => handleSelectHotel(hotel)}>
                <h3 className="hc-name">{hotel.name}</h3>
                <p className="hc-location">
                  <MapPin size={16} /> {hotel.location}
                </p>

                <div className="hc-amenities">
                  {hotel.amenities.slice(0, 5).map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <div className="amenity-tile" title={a} key={a}>
                        <Icon size={20} />
                        <span>{amenityLabel(a)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="hc-footer">
                  <div>
                    <span className="hc-price">₹{formatInr(hotel.pricePerNight)}</span>
                    <span className="hc-per-night">/night</span>
                  </div>
                  <button
                    className={`btn-book ${selectedHotel?.id === hotel.id ? 'btn-book--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSelectHotel(hotel); }}
                  >
                    {selectedHotel?.id === hotel.id ? 'Selected ✓' : 'Book Now'}
                  </button>
                </div>
              </div>

              {/* Room selection panel */}
              {selectedHotel?.id === hotel.id && (
                <div className="room-panel" onClick={(e) => e.stopPropagation()}>
                  <p className="room-panel-title">
                    <BedDouble size={16} /> Select Room Type
                  </p>
                  <div className="room-options">
                    {hotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`room-opt ${selectedRoom?.id === room.id ? 'room-opt--active' : ''}`}
                        onClick={() => handleSelectRoom(room)}
                      >
                        <div className="room-info">
                          <p className="room-name">{room.name}</p>
                          <p className="room-desc">{room.description}</p>
                        </div>
                        <p className="room-price">₹{formatInr(hotel.pricePerNight + room.extraCharge)}/night</p>
                      </div>
                    ))}
                  </div>
                  {selectedRoom && (
                    <div className="room-total">
                      <span>{nights} night{nights !== 1 ? 's' : ''} total</span>
                      <strong>₹{formatInr(totalRoomCost)}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && !apiError && filteredHotels.length === 0 && (
          <div className="empty-state">
            <Building2 className="empty-icon" />
            <h3>No hotels match your filters</h3>
            <p>Try adjusting the rating or price filters</p>
          </div>
        )}
      </main>

      {/* Bottom action bar */}
      <div className="bottom-bar">
        <div className="bar-summary">
          {selectedHotel && selectedRoom && (
            <>
              <Building2 size={18} />
              <span>{selectedHotel.name} — {selectedRoom.name}</span>
              <span className="bar-price">₹{formatInr(totalRoomCost)}</span>
            </>
          )}
          {!selectedHotel && <span className="bar-hint">Select a hotel to continue</span>}
        </div>
        <div className="bar-actions">
          <Link to="/step2" className="btn-back">
            <ArrowLeft size={18} /> Back
          </Link>
          <button className="btn-continue" disabled={!canContinue} onClick={handleContinue}>
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
