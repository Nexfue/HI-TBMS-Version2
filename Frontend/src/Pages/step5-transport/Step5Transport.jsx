import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle, RefreshCw, Star, CheckCircle2, User, Snowflake, Wifi,
  Navigation, Zap, ShieldCheck, Wine, Luggage, Music, Video, Baby,
  Bus, Truck, Car, CalendarCheck2, ArrowLeft, ArrowRight, PartyPopper,
} from 'lucide-react';

import {
  selectTravelDetails, selectNights, selectTransport, setTransport,
  selectDepartureFlight, selectReturnFlight, selectHotel, selectSelectedRoom,
  selectSelectedSeat, selectSelectedActivities, selectMealPlan,
  setItineraryResult,
} from '../../store/travelSlice';
import {
  getTransports, generateItinerary,
  getBackendFlight, getBackendHotel, getBackendActivity, getBackendTransport,
} from '../../services/apiService';
// Swap the import above for './apiService.mock' to develop against fake
// data + a fake PDF before the real backend endpoints exist.
import SuccessDialog from '../common/SuccessDialog';

const FILTERS = ['All', 'Normal', 'Premium', 'Luxury'];

const CAT_GRADIENTS = {
  Normal: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 55%, #0288d1 100%)',
  Premium: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  Luxury: 'linear-gradient(135deg, #212121 0%, #37474f 50%, #263238 100%)',
};

function catGradient(cat) {
  return CAT_GRADIENTS[cat] ?? CAT_GRADIENTS.Normal;
}
function catLabel(cat) {
  return cat === 'Normal' ? 'Standard' : cat;
}

function featureIcon(feature) {
  const f = feature.toLowerCase();
  if (f.includes('ac') || f.includes('air')) return Snowflake;
  if (f.includes('wifi') || f.includes('wi-fi')) return Wifi;
  if (f.includes('gps') || f.includes('navig')) return Navigation;
  if (f.includes('electric') || f.includes('ev')) return Zap;
  if (f.includes('autopilot') || f.includes('auto')) return RefreshCw;
  if (f.includes('vip') || f.includes('secure')) return ShieldCheck;
  if (f.includes('water') || f.includes('refresh')) return Wine;
  if (f.includes('driver') || f.includes('chauffeur')) return User;
  if (f.includes('luggage') || f.includes('bag')) return Luggage;
  if (f.includes('music') || f.includes('sound')) return Music;
  if (f.includes('camera') || f.includes('dash')) return Video;
  if (f.includes('child') || f.includes('seat')) return Baby;
  return CheckCircle2;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatInr(value) {
  return value.toLocaleString('en-IN');
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// All component styles live here instead of a separate .css file.
const STYLES = `
.page-wrapper {
  --primary: #003ec7;
  --primary-container: #0052ff;
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
}

.main-content { max-width: 1280px; margin: 0 auto; padding: 48px 40px 64px; }

.generating-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.generating-card {
  background: var(--white);
  border-radius: 16px;
  padding: 40px 56px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.generating-card p { margin: 20px 0 4px; font-size: 17px; font-weight: 600; color: var(--on-surface); }
.generating-card small { font-size: 13px; color: var(--on-surface-var); }

.spinner-lg {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 62, 199, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: step5-spin 0.8s linear infinite;
  margin: 0 auto;
}
@keyframes step5-spin { to { transform: rotate(360deg); } }

.page-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 40px; flex-wrap: wrap; }
.header-left { flex: 1; min-width: 260px; }

.fleet-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 10px;
}

.page-title { font-size: 48px; line-height: 56px; font-weight: 700; letter-spacing: -0.02em; color: var(--on-surface); margin: 0 0 10px; }
.page-sub { font-size: 18px; line-height: 28px; color: var(--on-surface-var); margin: 0; max-width: 580px; }

.cat-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(236, 238, 240, 0.8);
  border: 1px solid rgba(195, 197, 217, 0.35);
  border-radius: 10px;
  padding: 4px;
  flex-shrink: 0;
}

.cat-btn {
  padding: 8px 20px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--on-surface-var);
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.cat-btn:hover { color: var(--primary); }
.cat-btn--active { background: var(--white); color: var(--primary); font-weight: 700; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }

.status-row { display: flex; align-items: center; gap: 10px; padding: 0 0 24px; font-size: 14px; color: var(--on-surface-var); }
.status-row--warn { color: #b45309; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 62, 199, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: step5-spin 0.7s linear infinite;
}

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

.transport-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; margin-bottom: 32px; }

.tc-name { font-size: 20px; font-weight: 600; color: var(--on-surface); margin: 0 0 4px; }
.tc-sub { font-size: 13px; color: var(--on-surface-var); margin: 0; }

.tc-featured {
  grid-column: span 8;
  background: var(--white);
  border: 1px solid rgba(195, 197, 217, 0.4);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.tc-featured:hover { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1); border-color: rgba(0, 62, 199, 0.4); }
.tc-featured--selected { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 6px 24px rgba(0, 62, 199, 0.12); }

.tcf-image { flex: 0 0 60%; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; min-height: 300px; }
.tcf-image:hover { filter: brightness(1.06); }

.tcf-initial { font-size: 100px; font-weight: 800; color: rgba(255, 255, 255, 0.1); user-select: none; }

.tcf-popular-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--warning-amber);
  color: var(--white);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 12px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tcf-detail { flex: 1; padding: 28px 28px 24px; display: flex; flex-direction: column; justify-content: space-between; }
.tcf-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.tcf-desc { font-size: 15px; line-height: 24px; color: var(--on-surface-var); margin: 0 0 18px; }

.tcf-features { list-style: none; padding: 0; margin: 0 0 20px; display: flex; flex-direction: column; gap: 8px; }
.tcf-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--on-surface); }
.feat-check { color: var(--success); flex-shrink: 0; }

.tcf-footer { padding-top: 16px; border-top: 1px solid rgba(195, 197, 217, 0.25); }
.tc-price-block { margin-bottom: 12px; }
.tc-price { font-size: 24px; font-weight: 700; color: var(--primary); }
.tc-per { font-size: 14px; color: var(--on-surface-var); margin-left: 4px; }

.tc-card {
  grid-column: span 4;
  background: var(--white);
  border: 1px solid rgba(195, 197, 217, 0.4);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
}
.tc-card:hover { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.09); transform: translateY(-2px); border-color: rgba(0, 62, 199, 0.35); }
.tc-card--selected { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 6px 24px rgba(0, 62, 199, 0.1); transform: translateY(-2px); }

.tc-image { aspect-ratio: 16 / 10; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.tc-initial { font-size: 72px; font-weight: 800; color: rgba(255, 255, 255, 0.1); user-select: none; }

.tc-sel-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--success);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tc-body { padding: 18px 18px 20px; }
.tc-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 14px; }

.tc-price-tag {
  background: rgba(0, 62, 199, 0.08);
  color: var(--primary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tc-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.tc-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(208, 225, 251, 0.4);
  color: #54647a;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.tc-footer-price { margin-bottom: 14px; font-size: 13px; color: var(--on-surface-var); }
.tc-total { font-weight: 700; color: var(--on-surface); font-size: 14px; }
.tc-nights { margin-left: 4px; }

.tc-quote {
  grid-column: span 4;
  background: var(--primary);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--white);
}

.quote-title { font-size: 20px; font-weight: 600; color: var(--white); margin: 0 0 12px; }
.quote-sub { font-size: 15px; line-height: 24px; color: rgba(255, 255, 255, 0.78); margin: 0 0 20px; }
.quote-list { display: flex; flex-direction: column; gap: 10px; }
.quote-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255, 255, 255, 0.9); }

.btn-select-filled {
  width: 100%;
  padding: 11px 0;
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-select-filled:hover { opacity: 0.88; }
.btn-select-filled.btn-selected { background: var(--success); }

.btn-select-outline {
  width: 100%;
  padding: 10px 0;
  background: transparent;
  color: var(--primary);
  border: 1.5px solid var(--primary);
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-select-outline:hover { background: rgba(0, 62, 199, 0.08); }
.btn-select-outline.btn-selected-outline { background: var(--primary); color: var(--white); }
.btn-select-outline.btn-selected-outline:hover { opacity: 0.88; }

.btn-quote {
  width: 100%;
  margin-top: 28px;
  padding: 12px 0;
  background: var(--white);
  color: var(--primary);
  border: none;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-quote:hover { opacity: 0.9; }

.empty-state { text-align: center; padding: 64px 24px; grid-column: span 12; }
.empty-state .empty-icon { width: 56px; height: 56px; color: rgba(195, 197, 217, 0.7); display: block; margin: 0 auto 16px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: var(--on-surface); margin: 0 0 8px; }
.empty-state p { font-size: 14px; color: var(--on-surface-var); margin: 0; }

.itinerary-card {
  background: var(--white);
  border: 1px solid rgba(195, 197, 217, 0.4);
  border-radius: 12px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.it-left { display: flex; align-items: center; gap: 16px; }

.it-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.it-icon-wrap svg { color: var(--primary); }

.it-title { font-size: 16px; font-weight: 700; color: var(--on-surface); margin: 0 0 3px; }
.it-sub { font-size: 13px; color: var(--on-surface-var); margin: 0; }

.it-right { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.it-total { text-align: right; }

.it-total-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--on-surface-var);
  margin-bottom: 2px;
}

.it-total-price { font-size: 24px; font-weight: 700; color: var(--on-surface); margin: 0; }

.it-actions { display: flex; gap: 12px; align-items: center; }

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid rgba(195, 197, 217, 0.7);
  background: transparent;
  color: var(--on-surface-var);
  padding: 10px 20px;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.btn-back:hover { border-color: var(--on-surface-var); color: var(--on-surface); }

.btn-book {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: var(--white);
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  box-shadow: 0 4px 16px rgba(0, 62, 199, 0.25);
}
.btn-book:hover:not(:disabled) { opacity: 0.88; }
.btn-book:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

@media (max-width: 1024px) {
  .tc-featured { grid-column: span 12; flex-direction: column; }
  .tcf-image { min-height: 220px; flex: none; width: 100%; }
  .tc-card { grid-column: span 6; }
  .tc-quote { grid-column: span 6; }
}

@media (max-width: 768px) {
  .main-content { padding: 28px 16px 48px; }
  .page-title { font-size: 32px; line-height: 40px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .tc-card { grid-column: span 12; }
  .tc-quote { grid-column: span 12; }
  .itinerary-card { flex-direction: column; align-items: flex-start; }
  .it-right { width: 100%; justify-content: space-between; }
}
`;

export default function Step5Transport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const travelDetails = useSelector(selectTravelDetails);
  const nights = useSelector(selectNights);
  const storedTransport = useSelector(selectTransport);
  const departureFlight = useSelector(selectDepartureFlight);
  const returnFlight = useSelector(selectReturnFlight);
  const hotel = useSelector(selectHotel);
  const selectedRoom = useSelector(selectSelectedRoom);
  const selectedSeat = useSelector(selectSelectedSeat);
  const selectedActivities = useSelector(selectSelectedActivities);
  const mealPlan = useSelector(selectMealPlan);

  const [allTransports, setAllTransports] = useState([]);
  const [filterCat, setFilterCat] = useState('All');
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [dialog, setDialog] = useState({ open: false, success: true, message: '', pdfBase64: undefined });

  const filtered = useMemo(() => {
    if (filterCat === 'All') return allTransports;
    return allTransports.filter((t) => t.category === filterCat);
  }, [allTransports, filterCat]);

  const isFeaturedPremium = useCallback((t) => {
    if (filterCat !== 'All') return false;
    const firstPremium = filtered.find((x) => x.category === 'Premium');
    return !!firstPremium && firstPremium.id === t.id;
  }, [filterCat, filtered]);

  const totalCost = selected ? selected.pricePerDay * nights : 0;

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchTransports = useCallback(async () => {
    const to = travelDetails?.to;
    const travelers = travelDetails?.travelers;
    if (!to) {
      navigate('/step1');
      return;
    }

    setLoading(true);
    setApiError(false);

    try {
      const transports = await getTransports(to, travelers);
      setAllTransports(transports);
      setApiError(transports.length === 0);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [travelDetails, navigate]);

  const retrySearch = useCallback(() => {
    fetchTransports();
  }, [fetchTransports]);

  const select = useCallback((t) => {
    setSelected(t);
  }, []);

  // ── Booking ──────────────────────────────────────────────────────────
  const openFallbackDialog = useCallback(() => {
    setDialog({ open: true, success: true, message: 'Your itinerary has been created!', pdfBase64: undefined });
  }, []);

  const bookItinerary = useCallback(async () => {
    if (!selected) return;
    dispatch(setTransport(selected));

    if (!travelDetails) {
      openFallbackDialog();
      return;
    }
    if (!departureFlight || !hotel) {
      openFallbackDialog();
      return;
    }

    // Build a return flight placeholder if one-way trip
    const returnFlightDto = returnFlight
      ? getBackendFlight(returnFlight.id, returnFlight, travelDetails.returnDate || travelDetails.departureDate)
      : getBackendFlight(departureFlight.id, departureFlight, travelDetails.returnDate || travelDetails.departureDate);

    const request = {
      travelDetails: {
        name: travelDetails.name,
        email: travelDetails.email,
        origin: travelDetails.from,
        destination: travelDetails.to,
        travelDate: travelDetails.departureDate,
        returnDate: travelDetails.returnDate || addDays(travelDetails.departureDate, 7),
        adults: travelDetails.travelers,
        children: 0,
        preferences: [],
      },
      departureFlight: getBackendFlight(departureFlight.id, departureFlight, travelDetails.departureDate),
      returnFlight: returnFlightDto,
      seatPreference: selectedSeat || 'Window',
      classPreference: travelDetails.travelClass ?? 'economy',
      selectedHotel: getBackendHotel(hotel.id, hotel),
      roomType: selectedRoom?.name ?? 'Standard',
      mealPlan,
      selectedActivities: selectedActivities.map((a) => getBackendActivity(a.id, a)),
      selectedTransport: getBackendTransport(selected.id, selected),
    };

    setGenerating(true);

    try {
      const response = await generateItinerary(request);
      setGenerating(false);

      if (response.pdfBase64) {
        dispatch(setItineraryResult({ pdfBase64: response.pdfBase64, itineraryId: response.itineraryId ?? null }));
      }

      setDialog({
        open: true,
        success: response.success,
        message: response.message,
        pdfBase64: response.pdfBase64,
      });
    } catch {
      setGenerating(false);
      setDialog({
        open: true,
        success: false,
        message: 'Something went wrong generating your itinerary. Please try again.',
        pdfBase64: undefined,
      });
    }
  }, [selected, dispatch, travelDetails, departureFlight, returnFlight, hotel, selectedRoom, selectedSeat, selectedActivities, mealPlan, openFallbackDialog]);

  const closeDialog = useCallback(() => {
    setDialog((d) => ({ ...d, open: false }));
    navigate('/confirmation');
  }, [navigate]);

  // ── Lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    if (storedTransport) setSelected(storedTransport);
    fetchTransports();
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

      {generating && (
        <div className="generating-overlay">
          <div className="generating-card">
            <div className="spinner-lg" aria-hidden="true" />
            <p>Generating your itinerary PDF…</p>
            <small>This may take a few seconds</small>
          </div>
        </div>
      )}

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <span className="fleet-label">Fleet Selection</span>
            <h1 className="page-title">Choose Your Transport</h1>
            <p className="page-sub">
              Select the perfect ride for your journey. From economical city commuters to executive luxury,
              our fleet is ready for your itinerary.
            </p>
          </div>
          <div className="cat-toggle">
            {FILTERS.map((cat) => (
              <button
                key={cat}
                className={`cat-btn ${filterCat === cat ? 'cat-btn--active' : ''}`}
                onClick={() => setFilterCat(cat)}
              >
                {catLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Status rows */}
        {loading && (
          <div className="status-row">
            <span className="spinner" aria-hidden="true" />
            <span>Loading available transports…</span>
          </div>
        )}
        {!loading && apiError && (
          <div className="status-row status-row--warn">
            <AlertCircle size={18} />
            <span>No transport options found. The backend may still be starting up.</span>
            <button className="btn-retry" onClick={retrySearch}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* Bento Vehicle Grid */}
        <div className="transport-grid">
          {filtered.map((t) =>
            isFeaturedPremium(t) ? (
              <div
                key={t.id}
                className={`tc-featured ${selected?.id === t.id ? 'tc-featured--selected' : ''}`}
                onClick={() => select(t)}
              >
                <div className="tcf-image" style={{ background: catGradient(t.category) }}>
                  <div className="tcf-initial">{t.name.charAt(0)}</div>
                  <div className="tcf-popular-badge">
                    <Star size={14} /> MOST POPULAR
                  </div>
                </div>

                <div className="tcf-detail">
                  <div>
                    <div className="tcf-header">
                      <div>
                        <h3 className="tc-name">{t.name}</h3>
                        <p className="tc-sub">{t.vehicleType} • {catLabel(t.category)}</p>
                      </div>
                    </div>
                    <p className="tcf-desc">
                      {t.vehicleType} with {t.capacity}-seat capacity, perfect for premium travel with
                      professional-grade comfort and reliability for your itinerary.
                    </p>
                    <ul className="tcf-features">
                      {t.features.map((f) => (
                        <li key={f}>
                          <CheckCircle2 className="feat-check" size={18} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="tcf-footer">
                    <div className="tc-price-block">
                      <span className="tc-price">₹{formatInr(t.pricePerDay)}</span>
                      <span className="tc-per">/ per day</span>
                    </div>
                    <button
                      className={`btn-select-filled ${selected?.id === t.id ? 'btn-selected' : ''}`}
                      onClick={(e) => { e.stopPropagation(); select(t); }}
                    >
                      {selected?.id === t.id ? 'Selected ✓' : 'Select Premium'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={t.id}
                className={`tc-card ${selected?.id === t.id ? 'tc-card--selected' : ''}`}
                onClick={() => select(t)}
              >
                <div className="tc-image" style={{ background: catGradient(t.category) }}>
                  <div className="tc-initial">{t.name.charAt(0)}</div>
                  {selected?.id === t.id && (
                    <div className="tc-sel-badge">
                      <CheckCircle2 size={13} /> Selected
                    </div>
                  )}
                </div>

                <div className="tc-body">
                  <div className="tc-top">
                    <div>
                      <h3 className="tc-name">{t.name}</h3>
                      <p className="tc-sub">{t.vehicleType}</p>
                    </div>
                    <div className="tc-price-tag">₹{formatInr(t.pricePerDay)}/DAY</div>
                  </div>

                  <div className="tc-chips">
                    {t.features.slice(0, 4).map((f) => {
                      const Icon = featureIcon(f);
                      return (
                        <div className="tc-chip" key={f}>
                          <Icon size={16} />
                          <span>{f}</span>
                        </div>
                      );
                    })}
                    <div className="tc-chip">
                      <User size={16} />
                      <span>{t.capacity} Seats</span>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="tc-footer-price">
                      <span className="tc-total">₹{formatInr(t.pricePerDay * nights)}</span>
                      <span className="tc-nights">for {nights} day{nights > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  <button
                    className={`btn-select-outline ${selected?.id === t.id ? 'btn-selected-outline' : ''}`}
                    onClick={(e) => { e.stopPropagation(); select(t); }}
                  >
                    {selected?.id === t.id ? 'Selected ✓' : 'Select Vehicle'}
                  </button>
                </div>
              </div>
            )
          )}

          {/* Custom Quote static card */}
          <div className="tc-quote">
            <div>
              <h3 className="quote-title">Need something specific?</h3>
              <p className="quote-sub">
                For group travels, multi-day excursions, or specialized cargo needs, we offer custom fleet
                solutions tailored to your itinerary.
              </p>
              <div className="quote-list">
                <div className="quote-item">
                  <Bus size={20} />
                  <span>Mini Buses (12-24 seats)</span>
                </div>
                <div className="quote-item">
                  <Truck size={20} />
                  <span>Cargo Transporters</span>
                </div>
              </div>
            </div>
            <button className="btn-quote">Get Custom Quote</button>
          </div>
        </div>

        {/* Empty state */}
        {!loading && !apiError && filtered.length === 0 && (
          <div className="empty-state">
            <Car className="empty-icon" />
            <h3>No vehicles in this category</h3>
            <p>Try selecting a different category</p>
          </div>
        )}

        {/* Itinerary Summary Card */}
        <div className="itinerary-card">
          <div className="it-left">
            <div className="it-icon-wrap">
              <CalendarCheck2 size={28} />
            </div>
            <div>
              <h4 className="it-title">Your Selected Itinerary</h4>
              {travelDetails && (
                <p className="it-sub">
                  {travelDetails.to} Tour • {formatDate(travelDetails.departureDate)}
                  {travelDetails.returnDate && <> – {formatDate(travelDetails.returnDate)}</>}
                  {' • '}{travelDetails.travelers} Adult{travelDetails.travelers > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="it-right">
            {selected && (
              <div className="it-total">
                <span className="it-total-label">ESTIMATED TOTAL</span>
                <p className="it-total-price">₹{formatInr(totalCost)}</p>
              </div>
            )}
            <div className="it-actions">
              <Link to="/step4" className="btn-back">
                <ArrowLeft size={18} /> Back
              </Link>
              <button className="btn-book" disabled={!selected} onClick={bookItinerary}>
                <PartyPopper size={18} />
                Book Itinerary
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <SuccessDialog
        open={dialog.open}
        success={dialog.success}
        message={dialog.message}
        pdfBase64={dialog.pdfBase64}
        onClose={closeDialog}
      />
    </div>
  );
}
