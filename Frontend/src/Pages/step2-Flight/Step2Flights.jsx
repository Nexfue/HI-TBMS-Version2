import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlaneTakeoff,
  PlaneLanding,
  Plane,
  Edit,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  Bell,
  ArrowLeft,
  ArrowRight,
  RectangleHorizontal,
  RectangleVertical,
  Armchair,
  Loader2,
} from 'lucide-react';
import { searchFlights } from '../../Service/api';
import { setFlights, setMultiCityFlights, setSelectedSeat } from '../../Store/slice/travelSlice';

const SORT_TABS = [
  { value: 'price-asc', label: 'Cheapest' },
  { value: 'duration', label: 'Fastest' },
  { value: 'price-desc', label: 'Recommended' },
];

const SEAT_OPTIONS = [
  { value: 'window', label: 'Window', icon: RectangleHorizontal },
  { value: 'middle', label: 'Middle', icon: RectangleVertical },
  { value: 'aisle', label: 'Aisle', icon: Armchair },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const stopsLabel = (stops) => (stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`);

const addDays = (isoDate, days) => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

function sortAndFilter(list, sortBy, filterAirline) {
  return list
    .filter((f) => filterAirline === 'all' || f.airline === filterAirline)
    .slice()
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.duration.localeCompare(b.duration);
    });
}

// Reused for departure / return / multi-city leg cards — same markup, different data.
function FlightCard({ flight, fromLabel, toLabel, selected, onSelect, icon: Icon = Plane }) {
  return (
    <div
      onClick={() => onSelect(flight)}
      className={`bg-white rounded-xl p-5 flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-5 cursor-pointer relative overflow-hidden transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-[1.5px] ${
        selected
          ? 'border-[#003ec7] bg-[#003ec7]/[0.03] shadow-[0_0_0_1px_#003ec7,0_4px_16px_rgba(0,62,199,0.12)]'
          : 'border-[#c3c5d9]/35 hover:border-[#003ec7]/45 hover:shadow-[0_4px_16px_rgba(0,62,199,0.1)]'
      }`}
    >
      {/* Airline */}
      <div className="flex items-center gap-3 w-full md:w-[200px] flex-shrink-0">
        <div className="w-11 h-11 bg-[#eceef0] rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-[22px] h-[22px] text-[#003ec7]" />
        </div>
        <div>
          <p className="font-bold text-[15px] text-[#191c1e] mb-0.5">{flight.airline}</p>
          <p className="font-mono text-[11px] tracking-wide text-[#434656]">{flight.flightNo}</p>
        </div>
      </div>

      {/* Times */}
      <div className="flex-1 w-full flex items-center gap-2">
        <div className="text-left flex-shrink-0">
          <p className="text-[22px] font-bold text-[#191c1e] leading-none mb-0.5">{flight.departure}</p>
          <p className="text-xs text-[#434656]">{fromLabel}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 px-2">
          <p className="text-xs text-[#434656] whitespace-nowrap">
            {flight.duration} &middot; {stopsLabel(flight.stops)}
          </p>
          <div className="relative w-full h-px bg-[#c3c5d9]/60 flex items-center justify-center">
            {flight.stops > 0 && <div className="absolute w-2 h-2 bg-[#c3c5d9] rounded-full z-10" />}
            <Plane className="w-[18px] h-[18px] text-[#003ec7] bg-white px-1.5 relative z-10" />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[22px] font-bold text-[#191c1e] leading-none mb-0.5">{flight.arrival}</p>
          <p className="text-xs text-[#434656]">{toLabel}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2.5 md:gap-2.5 pl-0 md:pl-5 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-[#c3c5d9]/25 flex-shrink-0 w-full md:w-auto md:min-w-[130px]">
        <div className="text-right">
          <p className="text-[22px] font-bold text-[#003ec7] mb-0.5">₹{new Intl.NumberFormat('en-IN').format(flight.price)}</p>
          <p className="text-[11px] text-[#434656]">per person</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(flight);
          }}
          className={`px-[22px] py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-opacity hover:opacity-90 ${
            selected ? 'bg-[#10b981] text-white' : 'bg-[#003ec7] text-white'
          }`}
        >
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}

export default function Step2Flights() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const travelDetails = useSelector((s) => s.travel.travelDetails);
  const savedDeparture = useSelector((s) => s.travel.departureFlight);
  const savedReturn = useSelector((s) => s.travel.returnFlight);
  const savedSeat = useSelector((s) => s.travel.selectedSeat);
  const savedMultiCityFlights = useSelector((s) => s.travel.multiCityFlights);

  const isRoundTrip = travelDetails?.tripType === 'round-trip';
  const isMultiCity = travelDetails?.tripType === 'multi-city';

  // ── One-way / round-trip local state ──────────────────────────────────
  const [allFlights, setAllFlights] = useState([]);
  const [allReturnFlights, setAllReturnFlights] = useState([]);
  const [departureFlight, setDepartureFlight] = useState(null);
  const [returnFlight, setReturnFlight] = useState(null);
  const [showReturn, setShowReturn] = useState(false);

  // ── Multi-city local state ────────────────────────────────────────────
  const [segmentFlights, setSegmentFlights] = useState([]);
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [activeSegment, setActiveSegment] = useState(0);

  // ── Shared ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterAirline, setFilterAirline] = useState('all');
  const [selectedSeat, setSelectedSeatLocal] = useState('window');

  const fetchOneWayOrRoundTrip = useCallback(async () => {
    if (!travelDetails) return;
    const depDate = travelDetails.departureDate;
    const retDate = travelDetails.returnDate || addDays(travelDetails.departureDate, 7);
    setLoading(true);
    setApiError(false);
    try {
      const result = await searchFlights(travelDetails.from, travelDetails.to, depDate, retDate, travelDetails.travelers);
      setAllFlights(result.departures ?? []);
      setAllReturnFlights(result.returns ?? []);
      if (!result.departures?.length && !result.returns?.length) setApiError(true);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [travelDetails]);

  const loadMultiCity = useCallback(async () => {
    if (!travelDetails?.multiCitySegments) return;
    const segs = travelDetails.multiCitySegments;

    setSelectedFlights(
      savedMultiCityFlights.length === segs.length ? [...savedMultiCityFlights] : segs.map(() => null)
    );
    setSegmentFlights(segs.map(() => []));
    setLoading(true);
    setApiError(false);

    try {
      const results = await Promise.all(
        segs.map((s) => searchFlights(s.from, s.to, s.departureDate, addDays(s.departureDate, 1), travelDetails.travelers))
      );
      setSegmentFlights(results.map((r) => r.departures ?? []));
      if (results.every((r) => !r.departures?.length)) setApiError(true);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [travelDetails, savedMultiCityFlights]);

  // ngOnInit equivalent
  useEffect(() => {
    if (!travelDetails) {
      navigate('/step1');
      return;
    }

    if (isMultiCity) {
      loadMultiCity();
      return;
    }

    // Restore saved selections when navigating back
    if (savedDeparture) {
      setDepartureFlight(savedDeparture);
      setReturnFlight(savedReturn);
      setSelectedSeatLocal(savedSeat || 'window');
      if (isRoundTrip && savedDeparture) setShowReturn(true);
    }

    fetchOneWayOrRoundTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const airlines = useMemo(() => {
    const pool = isMultiCity ? segmentFlights[activeSegment] ?? [] : [...allFlights, ...allReturnFlights];
    return ['all', ...new Set(pool.map((f) => f.airline))];
  }, [isMultiCity, segmentFlights, activeSegment, allFlights, allReturnFlights]);

  const filteredFlights = useMemo(() => sortAndFilter(allFlights, sortBy, filterAirline), [allFlights, sortBy, filterAirline]);
  const filteredReturnFlights = useMemo(
    () => sortAndFilter(allReturnFlights, sortBy, filterAirline),
    [allReturnFlights, sortBy, filterAirline]
  );
  const filteredSegmentFlights = useMemo(
    () => sortAndFilter(segmentFlights[activeSegment] ?? [], sortBy, filterAirline),
    [segmentFlights, activeSegment, sortBy, filterAirline]
  );

  const canContinue = isMultiCity
    ? selectedFlights.length > 0 && selectedFlights.every((f) => f !== null)
    : !!departureFlight && !(isRoundTrip && !returnFlight);

  const totalPrice = isMultiCity
    ? selectedFlights.reduce((s, f) => s + (f?.price ?? 0), 0)
    : (departureFlight?.price ?? 0) + (returnFlight?.price ?? 0);

  const anySegmentSelected = selectedFlights.some((f) => f !== null);
  const selectedSegmentCount = selectedFlights.filter((f) => f !== null).length;

  // ── Selection handlers ────────────────────────────────────────────────
  const selectDeparture = (flight) => {
    setDepartureFlight(flight);
    if (isRoundTrip) setShowReturn(true);
    else setReturnFlight(null);
  };

  const selectReturnFlight = (flight) => setReturnFlight(flight);

  const selectSegmentFlight = (flight) => {
    setSelectedFlights((prev) => {
      const next = [...prev];
      next[activeSegment] = flight;
      const nextUnselected = next.findIndex((f, i) => i > activeSegment && !f);
      if (nextUnselected !== -1) setActiveSegment(nextUnselected);
      return next;
    });
  };

  const segmentLabel = (i) => {
    const segs = travelDetails?.multiCitySegments;
    if (!segs?.[i]) return `Leg ${i + 1}`;
    return `${segs[i].from} → ${segs[i].to}`;
  };

  const retrySearch = () => {
    if (!travelDetails) {
      navigate('/step1');
      return;
    }
    if (isMultiCity) loadMultiCity();
    else fetchOneWayOrRoundTrip();
  };

  const handleContinue = () => {
    if (!canContinue) return;

    if (isMultiCity) {
      dispatch(setMultiCityFlights(selectedFlights));
      dispatch(setFlights({ departure: selectedFlights[0], return: null }));
      dispatch(setSelectedSeat(selectedSeat));
      navigate('/step3');
      return;
    }

    dispatch(setFlights({ departure: departureFlight, return: isRoundTrip ? returnFlight : null }));
    dispatch(setSelectedSeat(selectedSeat));
    navigate('/step3');
  };

  if (!travelDetails) return null; // redirecting to /step1

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Hanken_Grotesk','Inter',sans-serif] pb-20">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-200 bg-white font-['Inter',sans-serif]">
        <div className="text-2xl font-bold tracking-tighter uppercase">Holiday Infinite</div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-wide">
          <Link className="hover:text-blue-600 transition-colors" to="/">Package</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Contact</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Home</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Tour</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">About</Link>
        </nav>
        <Link to="/" className="bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-bold uppercase hover:bg-zinc-800 transition-all">
          Book Trip
        </Link>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 pt-10 pb-8">
        {/* ── Search Summary Banner ────────────────────────────────────── */}
        <section className="bg-[#0052ff] rounded-xl px-5 md:px-7 py-5 mb-8 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 rounded-lg w-[52px] h-[52px] flex items-center justify-center flex-shrink-0">
              <PlaneTakeoff className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                {isMultiCity ? 'Multi-City Trip' : `${travelDetails.from} → ${travelDetails.to}`}
              </h1>
              <p className="text-sm text-white/80">
                {isMultiCity
                  ? `${travelDetails.multiCitySegments?.length ?? 0} Legs \u2022 `
                  : `${isRoundTrip ? 'Round Trip' : 'One Way'} \u2022 `}
                {travelDetails.travelers} Adult{travelDetails.travelers > 1 ? 's' : ''} &bull;{' '}
                {travelDetails.travelClass?.charAt(0).toUpperCase() + travelDetails.travelClass?.slice(1)} &bull;{' '}
                {formatDate(travelDetails.departureDate)}
              </p>
              {isMultiCity && travelDetails.multiCitySegments && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {travelDetails.multiCitySegments.map((seg, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-white/[0.18] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/30"
                    >
                      <PlaneTakeoff className="w-[13px] h-[13px]" />
                      {seg.from} → {seg.to}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link
            to="/step1"
            className="inline-flex items-center gap-1.5 border-[1.5px] border-white/50 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <Edit className="w-[18px] h-[18px]" /> Modify Search
          </Link>
        </section>

        {/* ── Status rows ────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center gap-2.5 py-2.5 pb-4 text-sm text-[#434656]">
            <Loader2 className="w-5 h-5 animate-spin text-[#003ec7]" />
            <span>Loading available flights&hellip;</span>
          </div>
        )}
        {!loading && apiError && (
          <div className="flex items-center gap-2.5 py-2.5 pb-4 text-sm text-[#b45309]">
            <AlertCircle className="w-[18px] h-[18px]" />
            <span>No flights found for this route. Try major airports (e.g. Delhi, Mumbai, London).</span>
            <button
              onClick={retrySearch}
              className="inline-flex items-center gap-1 border border-current px-3 py-1 rounded-md text-[13px] font-semibold hover:opacity-75 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
            <div className="bg-white border border-[#c3c5d9]/40 rounded-xl p-5 shadow-sm">
              <h3 className="font-mono text-[11px] font-medium tracking-widest uppercase text-[#434656] mb-2.5">Sort By</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: 'price-asc', label: 'Cheapest First' },
                  { value: 'price-desc', label: 'Price: High → Low' },
                  { value: 'duration', label: 'Shortest Duration' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors ${
                      sortBy === opt.value ? 'bg-[#003ec7]/[0.07] text-[#003ec7] font-semibold' : 'hover:bg-[#eceef0]'
                    }`}
                  >
                    <input type="radio" name="sort" value={opt.value} checked={sortBy === opt.value} onChange={() => setSortBy(opt.value)} className="hidden" />
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        sortBy === opt.value ? 'bg-[#003ec7] border-[#003ec7]' : 'border-[#c3c5d9]'
                      }`}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className="h-px bg-[#c3c5d9]/30 my-4" />

              <h3 className="font-mono text-[11px] font-medium tracking-widest uppercase text-[#434656] mb-2.5">Airline</h3>
              <div className="flex flex-col gap-1.5">
                {airlines.map((a) => (
                  <label
                    key={a}
                    className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors ${
                      filterAirline === a ? 'bg-[#003ec7]/[0.07] text-[#003ec7] font-semibold' : 'hover:bg-[#eceef0]'
                    }`}
                  >
                    <input type="radio" name="airline" value={a} checked={filterAirline === a} onChange={() => setFilterAirline(a)} className="hidden" />
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        filterAirline === a ? 'bg-[#003ec7] border-[#003ec7]' : 'border-[#c3c5d9]'
                      }`}
                    />
                    {a === 'all' ? 'All Airlines' : a}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#0ea5e9]/[0.08] border border-[#0ea5e9]/25 rounded-xl px-5 py-4">
              <p className="text-sm text-[#191c1e] mb-2.5">Get fare alerts for this route</p>
              <button className="w-full flex items-center justify-center gap-1.5 bg-[#0ea5e9] text-white rounded-lg py-2 text-sm font-bold hover:opacity-90 transition-opacity">
                <Bell className="w-[18px] h-[18px]" /> Track Prices
              </button>
            </div>
          </aside>

          {/* ── Results column ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Sort top bar */}
            <div className="bg-white border border-[#c3c5d9]/30 rounded-[10px] px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex gap-5">
                {SORT_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSortBy(tab.value)}
                    className={`bg-transparent border-b-2 pb-0.5 text-sm font-medium transition-colors ${
                      sortBy === tab.value ? 'text-[#003ec7] font-bold border-[#003ec7]' : 'text-[#434656] border-transparent hover:text-[#191c1e]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="text-[13px] text-[#434656] whitespace-nowrap">
                {isMultiCity
                  ? `${filteredSegmentFlights.length} result${filteredSegmentFlights.length !== 1 ? 's' : ''} found`
                  : `${filteredFlights.length} result${filteredFlights.length !== 1 ? 's' : ''} found`}
              </span>
            </div>

            {/* ══════════════ MULTI-CITY ══════════════ */}
            {isMultiCity && (
              <>
                <div className="flex gap-2.5 flex-wrap mb-2">
                  {travelDetails.multiCitySegments.map((seg, i) => {
                    const isActive = activeSegment === i;
                    const isDone = selectedFlights[i] !== null && selectedFlights[i] !== undefined;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveSegment(i)}
                        className={`flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-[10px] border-2 min-w-[140px] relative transition-colors ${
                          isActive
                            ? 'border-[#003ec7] bg-[#003ec7]/[0.06]'
                            : isDone
                            ? 'border-[#10b981] bg-[#10b981]/[0.06]'
                            : 'border-[#c3c5d9] bg-white'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-[#003ec7]' : 'text-[#434656]'}`}>
                          Leg {i + 1}
                        </span>
                        <span className={`text-[13px] font-bold ${isDone && !isActive ? 'text-[#0d9668]' : 'text-[#191c1e]'}`}>
                          {seg.from} → {seg.to}
                        </span>
                        {isDone && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#10b981]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 font-bold text-base">
                  <PlaneTakeoff className="w-5 h-5 text-[#003ec7]" />
                  Leg {activeSegment + 1} — {segmentLabel(activeSegment)}
                  <span className="font-mono text-[11px] font-medium bg-[#003ec7]/[0.08] text-[#003ec7] border border-[#003ec7]/20 rounded-full px-2.5 py-0.5">
                    {formatDate(travelDetails.multiCitySegments[activeSegment]?.departureDate ?? '')}
                  </span>
                </div>

                {!loading && !apiError && filteredSegmentFlights.length === 0 && (
                  <div className="flex items-center gap-2.5 py-2.5 text-sm text-[#434656]">
                    <Info className="w-[18px] h-[18px]" />
                    <span>No flights found for this leg. Try modifying your search.</span>
                  </div>
                )}

                {filteredSegmentFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    fromLabel={travelDetails.multiCitySegments[activeSegment]?.from}
                    toLabel={travelDetails.multiCitySegments[activeSegment]?.to}
                    selected={selectedFlights[activeSegment]?.id === flight.id}
                    onSelect={selectSegmentFlight}
                  />
                ))}
              </>
            )}

            {/* ══════════════ ONE-WAY / ROUND-TRIP ══════════════ */}
            {!isMultiCity && (
              <>
                <div className="flex items-center gap-2 font-bold text-base">
                  <PlaneTakeoff className="w-5 h-5 text-[#003ec7]" />
                  Departure Flights
                  {travelDetails && (
                    <span className="font-mono text-[11px] font-medium bg-[#003ec7]/[0.08] text-[#003ec7] border border-[#003ec7]/20 rounded-full px-2.5 py-0.5">
                      {travelDetails.from} → {travelDetails.to}
                    </span>
                  )}
                </div>

                {filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    fromLabel={travelDetails.from}
                    toLabel={travelDetails.to}
                    selected={departureFlight?.id === flight.id}
                    onSelect={selectDeparture}
                  />
                ))}

                {isRoundTrip && showReturn && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-base mt-8">
                      <PlaneLanding className="w-5 h-5 text-[#003ec7]" />
                      Return Flights
                      <span className="font-mono text-[11px] font-medium bg-[#003ec7]/[0.08] text-[#003ec7] border border-[#003ec7]/20 rounded-full px-2.5 py-0.5">
                        {travelDetails.to} → {travelDetails.from}
                      </span>
                    </div>

                    {filteredReturnFlights.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        fromLabel={travelDetails.to}
                        toLabel={travelDetails.from}
                        selected={returnFlight?.id === flight.id}
                        onSelect={selectReturnFlight}
                        icon={PlaneLanding}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* ── Seat preference ──────────────────────────────────────── */}
            {(departureFlight || (isMultiCity && selectedFlights[0])) && (
              <div className="bg-white border border-[#c3c5d9]/35 rounded-xl px-6 py-5 shadow-sm mt-2">
                <h3 className="flex items-center gap-2 text-base font-bold mb-4">
                  <Armchair className="w-5 h-5 text-[#003ec7]" /> Seat Preference
                </h3>
                <div className="flex gap-4 flex-wrap">
                  {SEAT_OPTIONS.map(({ value, label, icon: SeatIcon }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center gap-2 px-7 py-4 rounded-[10px] border-[1.5px] cursor-pointer transition-all bg-[#eceef0] ${
                        selectedSeat === value ? 'border-[#003ec7] bg-[#003ec7]/[0.06] shadow-[0_0_0_1px_#003ec7]' : 'border-[#c3c5d9]/50 hover:border-[#003ec7] hover:bg-[#003ec7]/[0.04]'
                      }`}
                    >
                      <input type="radio" name="seat" value={value} checked={selectedSeat === value} onChange={() => setSelectedSeatLocal(value)} className="hidden" />
                      <SeatIcon className="w-7 h-7 text-[#003ec7]" />
                      <span className="text-[13px] font-semibold text-[#191c1e]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Bottom Action Bar ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#c3c5d9]/40 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-6 md:px-10 py-3 flex items-center justify-between gap-4 flex-wrap z-40">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          {isMultiCity ? (
            anySegmentSelected ? (
              <>
                <PlaneTakeoff className="w-[18px] h-[18px] text-[#003ec7]" />
                <span>
                  {selectedSegmentCount} / {selectedFlights.length} legs selected
                </span>
                <span className="font-bold text-[#003ec7] text-[17px]">₹{new Intl.NumberFormat('en-IN').format(totalPrice)}</span>
              </>
            ) : (
              <span className="font-normal text-[#434656]">Select a flight for each leg to continue</span>
            )
          ) : departureFlight ? (
            <>
              <PlaneTakeoff className="w-[18px] h-[18px] text-[#003ec7]" />
              <span>
                {departureFlight.airline} {departureFlight.flightNo}
                {returnFlight && <>&nbsp;&bull;&nbsp;Return: {returnFlight.flightNo}</>}
              </span>
              <span className="font-bold text-[#003ec7] text-[17px]">₹{new Intl.NumberFormat('en-IN').format(totalPrice)}</span>
            </>
          ) : (
            <span className="font-normal text-[#434656]">Select a departure flight to continue</span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/step1"
            className="inline-flex items-center gap-1.5 border-[1.5px] border-[#c3c5d9]/70 text-[#434656] px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[#434656] hover:text-[#191c1e] transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px]" /> Back
          </Link>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="inline-flex items-center gap-1.5 bg-[#0052ff] text-white px-7 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:not-disabled:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
