// components/BookingFlights.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronDown, Check, X } from 'lucide-react';
import { searchFlights as searchFlightsApi } from "../api/flightApi";
import {
  CLASS_OPTIONS,
  getAirportCode,
  getCityCountry,
  getFilteredLocations,
  getAirportSubtext,
  getCityFromCode
} from "../Data/airports";

import {
  setTravelDetails,
  setFlights,
} from "../Store/slices/travelSlice";

/* ------------------------------------------------------------------ */
/*  Small icons used only inside this form                            */
/* ------------------------------------------------------------------ */

const FlightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.5 21l1.5-5-7-3.5V9l8 2V6a2 2 0 114 0v5l8-2v3.5l-7 3.5 1.5 5-3.5-1.5L10.5 21z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const SwapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M7 16l-4-4m0 0l4-4m-4 4h18m-6 8l4-4m0 0l-4-4m4 4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20.59 13.41L11 3.83A2 2 0 009.59 3.17H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.59 9.59a2 2 0 002.82 0l4.59-4.59a2 2 0 000-2.82z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getDayPart(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.getDate();
}

function getMonthYearPart(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getDayName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

// Compact "Sat, 11 Jul 26" style used in the booking bar
function formatShortDate(dateStr) {
  if (!dateStr) return 'Select date';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Select date';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

/* ------------------------------------------------------------------ */
/*  LocationDropdown                                                    */
/* ------------------------------------------------------------------ */

function LocationDropdown({ search, onSearchChange, onSelect, placeholder }) {
  const filtered = getFilteredLocations(search).map((city) => ({
    city,
    subtext: getAirportSubtext(city),
  }));

  return (
    <div
      className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`Search ${placeholder.toLowerCase()}...`}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="max-h-56 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 px-2 py-3">No cities found</p>
        )}
        {filtered.map((c) => (
          <button
            key={c.city}
            type="button"
            onClick={(e) => onSelect(c.city, e)}
            className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 text-sm"
          >
            <span className="block font-semibold text-slate-800">{c.city}</span>
            <span className="block text-xs text-slate-400">{c.subtext}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TravellersPanel                                                     */
/* ------------------------------------------------------------------ */

function TravellersPanel({
  travelers,
  onIncrement,
  onDecrement,
  travelClass,
  onClassChange,
  onApply,
}) {
  const classes = [
    { value: 'economy', label: 'Economy/Premium Economy' },
    { value: 'business', label: 'Business Class' },
    { value: 'first', label: 'First Class' },
  ];

  return (
    <div
      className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">Travellers</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDecrement}
            className="w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            −
          </button>
          <span className="text-sm font-bold w-4 text-center">{travelers}</span>
          <button
            type="button"
            onClick={onIncrement}
            className="w-7 h-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {classes.map((c) => (
          <label
            key={c.value}
            className="flex items-center gap-2 text-sm cursor-pointer py-1"
          >
            <input
              type="radio"
              name="travelClass"
              checked={travelClass === c.value}
              onChange={() => onClassChange(c.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className={travelClass === c.value ? 'font-semibold' : 'text-slate-600'}>
              {c.label}
            </span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onApply}
        className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TripTypeDropdown — powers the compact "TRIP TYPE" field            */
/* ------------------------------------------------------------------ */

function TripTypeDropdown({ value, onChange, isOpen, onToggle }) {
  const options = [
    { value: 'one-way', label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
    { value: 'multi-city', label: 'Multi City' },
  ];
  const currentLabel = options.find((o) => o.value === value)?.label || 'One Way';

  return (
    <div
      className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        Trip Type <ChevronDown className="h-3 w-3" />
      </p>
      <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{currentLabel}</p>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(o.value);
                onToggle();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 ${
                value === o.value ? 'font-bold text-blue-600' : 'text-slate-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HiddenDateInput                                                     */
/* ------------------------------------------------------------------ */

function HiddenDateInput({ id, value, min, onChange }) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Fare type options (shown as radio pills under the bar)             */
/* ------------------------------------------------------------------ */

const FARE_OPTIONS = [
  { key: 'regular', label: 'Regular' },
  { key: 'student', label: 'Student' },
  { key: 'gst', label: 'Have a GST number?', badge: 'NEW' },
  { key: 'armed', label: 'Armed Forces' },
  { key: 'senior', label: 'Senior Citizen' },
  { key: 'doctor', label: 'Doctor and Nurses' },
];

/* ------------------------------------------------------------------ */
/*  Main BookingFlights component                                      */
/*                                                                      */
/*  FIX #1: this component now actually ACCEPTS the `searchData` prop  */
/*  the parent passes down, and uses it as a fallback when             */
/*  `location.state.searchData` isn't present (e.g. right after a      */
/*  navigate() call that didn't carry state).                          */
/* ------------------------------------------------------------------ */

export default function BookingFlightsSection({ searchData: searchDataProp }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookingSectionRef = useRef(null);
  const today = todayISO();

  const location = useLocation();
  // FIX #1 (cont.): prefer router state, fall back to the prop from the parent.
  const searchData = location.state?.searchData || searchDataProp;

  const [tripType, setTripType] = useState('one-way'); // 'one-way' | 'round-trip' | 'multi-city'
  // FIX #3: removed trailing space in the "Delhi" default — a trailing
  // space could fail to match in getAirportCode() and silently send
  // `from: undefined` to the search API.
  const [from, setFrom] = useState(searchData?.from || "Delhi");
  const [to, setTo] = useState(searchData?.to || "Bangkok");
  const [departureDate, setDepartureDate] = useState(
    searchData?.departureDate || todayISO()
  );
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [travelClass, setTravelClass] = useState('economy');
  const [touched, setTouched] = useState({ from: false, to: false, returnDate: false });
  const [specialFare, setSpecialFare] = useState('regular');
  const [priceDropProtection, setPriceDropProtection] = useState(false);
  const [multiCitySegments, setMultiCitySegments] = useState([
    { from: 'Delhi', to: 'Bangkok', departureDate: '' },
    { from: 'Bangkok', to: '', departureDate: '' },
  ]);

  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);
  const [showTravellersPanel, setShowTravellersPanel] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [activeMCField, setActiveMCField] = useState(null); // 'from' | 'to' | null
  const [activeMCIndex, setActiveMCIndex] = useState(-1);
  const [mcSearch, setMcSearch] = useState('');

  // FIX #5: search is now async-aware so the UI can show a spinner / disable
  // the button, and surface errors instead of silently swallowing them.
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const isRoundTrip = tripType === 'round-trip';
  const isMultiCity = tripType === 'multi-city';
  const minReturnDate = departureDate || today;

  const closeAllPopovers = () => {
    setShowTripTypeDropdown(false);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    setShowTravellersPanel(false);
    setActiveMCField(null);
    setActiveMCIndex(-1);
  };

  useEffect(() => {
    if (!searchData) return;

    setFrom(searchData.fromCity || searchData.from || "");
    setTo(searchData.toCity || searchData.to || "");
    setDepartureDate(searchData.departureDate || todayISO());
    setReturnDate(searchData.returnDate || "");
    setTripType(searchData.tripType || "one-way");
    setTravelers(searchData.adults ?? 1);
    setTravelClass(searchData.travelClass || "economy");
  }, [searchData]);

  useEffect(() => {
    document.addEventListener('click', closeAllPopovers);
    return () => document.removeEventListener('click', closeAllPopovers);
  }, []);

  useEffect(() => {
    setMultiCitySegments((segs) => {
      if (!segs[0]) return segs;
      const next = [...segs];
      next[0] = { ...next[0], from };
      return next;
    });
  }, [from]);

  useEffect(() => {
    setMultiCitySegments((segs) => {
      const next = [...segs];
      if (next[0]) next[0] = { ...next[0], to };
      if (next[1]) next[1] = { ...next[1], from: to };
      return next;
    });
  }, [to]);

  useEffect(() => {
    setMultiCitySegments((segs) => {
      if (!segs[0]) return segs;
      const next = [...segs];
      next[0] = { ...next[0], departureDate };
      return next;
    });
  }, [departureDate]);

  const openFromDropdown = (e) => {
    e.stopPropagation();
    setFromSearch('');
    setShowFromDropdown(true);
    setShowToDropdown(false);
    setShowTripTypeDropdown(false);
    setActiveMCField(null);
  };

  const openToDropdown = (e) => {
    e.stopPropagation();
    setToSearch('');
    setShowToDropdown(true);
    setShowFromDropdown(false);
    setShowTripTypeDropdown(false);
    setActiveMCField(null);
  };

  const openMCDropdown = (field, index, e) => {
    e.stopPropagation();
    setMcSearch('');
    setActiveMCField(field);
    setActiveMCIndex(index);
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const selectFrom = (city, e) => {
    e.stopPropagation();
    setFrom(city);
    setTouched((t) => ({ ...t, from: true }));
    setShowFromDropdown(false);
    setFromSearch('');
  };

  const selectTo = (city, e) => {
    e.stopPropagation();
    setTo(city);
    setTouched((t) => ({ ...t, to: true }));
    setShowToDropdown(false);
    setToSearch('');
  };

  const selectMC = (city, e) => {
    e.stopPropagation();
    if (activeMCField !== null && activeMCIndex >= 0) {
      setMultiCitySegments((segs) => {
        const next = [...segs];
        next[activeMCIndex] = { ...next[activeMCIndex], [activeMCField]: city };
        return next;
      });
    }
    setActiveMCField(null);
    setActiveMCIndex(-1);
    setMcSearch('');
  };

  const showMCDropdown = (field, index) => activeMCField === field && activeMCIndex === index;

  const swapLocations = (e) => {
    e.stopPropagation();
    setFrom(to);
    setTo(from);
  };

  const increment = () => setTravelers((v) => (v < 20 ? v + 1 : v));
  const decrement = () => setTravelers((v) => (v > 1 ? v - 1 : v));

  const addCity = () => {
    setMultiCitySegments((segs) => {
      const last = segs[segs.length - 1];
      return [...segs, { from: last?.to || '', to: '', departureDate: '' }];
    });
  };

  const updateSegmentDate = (index, value) => {
    setMultiCitySegments((segs) => {
      const next = [...segs];
      next[index] = { ...next[index], departureDate: value };
      return next;
    });
  };

  const clearReturn = (e) => {
    e.stopPropagation();
    setReturnDate('');
  };

  const triggerDatePicker = (id) => {
    const el = document.getElementById(id);
    try {
      el?.showPicker?.();
    } catch {
      /* showPicker unsupported — the underlying <input type="date"> still opens on click */
    }
  };

  const getClassLabel = () => {
    if (travelClass === 'business') return 'Business Class';
    if (travelClass === 'first') return 'First Class';
    return 'Economy/Premium Economy';
  };

  const getPassengerSummary = () => {
    const label = travelers === 1 ? 'Adult' : 'Adults';
    return `${travelers} ${label}, ${getClassLabel()}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');

    if (isMultiCity) {
      const segs = multiCitySegments.map((s) => ({
        from: s.from || '',
        to: s.to || '',
        departureDate: s.departureDate || '',
      }));
      if (!segs.every((s) => s.from && s.to && s.departureDate)) {
        setSearchError('Please fill in every city and date for your multi-city trip.');
        return;
      }
    } else if (!from || !to || !departureDate) {
      setTouched((t) => ({ ...t, from: true, to: true }));
      setSearchError('Please select an origin, destination, and departure date.');
      return;
    } else if (isRoundTrip && !returnDate) {
      setTouched((t) => ({ ...t, returnDate: true }));
      setSearchError('Please select a return date for your round trip.');
      return;
    }

    const fromCode = getAirportCode(isMultiCity ? multiCitySegments[0].from : from);
    const toCode = getAirportCode(
      isMultiCity ? multiCitySegments[multiCitySegments.length - 1].to : to
    );

    // Guard against a bad/unmatched city name producing `undefined` codes,
    // which would otherwise be sent straight to the API.
    if (!fromCode || !toCode) {
      setSearchError('One of the selected cities could not be matched to an airport. Please re-select it from the dropdown.');
      return;
    }

    const payload = {
      from: fromCode,
      to: toCode,
      departureDate: isMultiCity ? multiCitySegments[0].departureDate : departureDate,
      returnDate: isRoundTrip ? returnDate : '',
      tripType,
      adults: travelers,
      children: 0,
      travelClass,
    };

    setIsSearching(true);
    try {
      const response = await searchFlightsApi(payload);

      dispatch(setFlights(response?.data?.data ?? []));

      dispatch(
  setTravelDetails({
    tripType,

    from: payload.from,
    to: payload.to,

    fromCity: from,
    toCity: to,

    departureDate: payload.departureDate,
    returnDate: isRoundTrip ? returnDate : "",

    adults: travelers,
    travelers,

    travelClass,

    ...(isMultiCity && {
      multiCitySegments: multiCitySegments.map((s) => ({
        from: s.from,
        to: s.to,
        departureDate: s.departureDate,
      })),
    }),
  })
);

   
      navigate('/search-flights', {
        state: {
          searchData: {
            from,
            to,
            fromCity: from,
            toCity: to,
            departureDate: payload.departureDate,
            returnDate: payload.returnDate,
            tripType,
            adults: travelers,
            travelClass,
          },
        },
      });
    } catch (error) {
      console.error(error);
      // FIX #5 (cont.): surface the failure instead of failing silently.
      setSearchError('Something went wrong while searching flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section ref={bookingSectionRef} className="max-w-7xl mx-auto px-2 sm:px-4 relative z-20">
      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-3">
          {/* ---------------------------------------------------- */}
          {/* Compact bar — One Way / Round Trip                    */}
          {/* ---------------------------------------------------- */}
          {!isMultiCity && (
            <div className="flex flex-wrap items-stretch gap-2">
              <TripTypeDropdown
                value={tripType}
                onChange={setTripType}
                isOpen={showTripTypeDropdown}
                onToggle={() => setShowTripTypeDropdown((v) => !v)}
              />

              {/* FROM */}
              <div
                className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative flex-1 min-w-[140px]"
                onClick={openFromDropdown}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  From
                </p>
                <p className={`text-sm font-bold truncate ${from ? 'text-slate-800' : 'text-slate-300'}`}>
                  {from ? getCityCountry(from) : 'Select City'}
                </p>
                {touched.from && !from && <p className="text-[10px] text-red-500">Required</p>}
                {showFromDropdown && (
                  <LocationDropdown
                    search={fromSearch}
                    onSearchChange={setFromSearch}
                    onSelect={selectFrom}
                    placeholder="From"
                  />
                )}
              </div>

              {/* SWAP */}
              <button
                type="button"
                onClick={swapLocations}
                className="w-9 h-9 self-center rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-300 shrink-0"
                aria-label="Swap origin and destination"
              >
                <SwapIcon className="w-4 h-4" />
              </button>

              {/* TO */}
              <div
                className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative flex-1 min-w-[140px]"
                onClick={openToDropdown}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  To
                </p>
                <p className={`text-sm font-bold truncate ${to ? 'text-slate-800' : 'text-slate-300'}`}>
                  {to ? getCityCountry(to) : 'Select City'}
                </p>
                {touched.to && !to && <p className="text-[10px] text-red-500">Required</p>}
                {showToDropdown && (
                  <LocationDropdown
                    search={toSearch}
                    onSearchChange={setToSearch}
                    onSelect={selectTo}
                    placeholder="To"
                  />
                )}
              </div>

              {/* DEPART */}
              <div
                className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative flex-1 min-w-[130px]"
                onClick={() => triggerDatePicker('dep-date-bar')}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Depart
                </p>
                <p className="text-sm font-bold text-slate-800 whitespace-nowrap">
                  {formatShortDate(departureDate)}
                </p>
                <HiddenDateInput id="dep-date-bar" value={departureDate} min={today} onChange={setDepartureDate} />
              </div>

              {/* RETURN — only for round trip */}
              {isRoundTrip && (
                <div
                  className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative flex-1 min-w-[130px]"
                  onClick={() => triggerDatePicker('ret-date-bar')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Return
                    </p>
                    {returnDate && (
                      <button
                        type="button"
                        onClick={clearReturn}
                        className="text-slate-400 hover:text-slate-600 relative z-10"
                        aria-label="Clear return date"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 whitespace-nowrap">
                    {formatShortDate(returnDate)}
                  </p>
                  {touched.returnDate && !returnDate && (
                    <p className="text-[10px] text-red-500">Required for round trip</p>
                  )}
                  <HiddenDateInput id="ret-date-bar" value={returnDate} min={minReturnDate} onChange={setReturnDate} />
                </div>
              )}

              {/* PASSENGER & CLASS */}
              <div
                className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative flex-1 min-w-[160px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTravellersPanel((v) => !v);
                }}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">
                  Passenger &amp; Class
                </p>
                <p className="text-sm font-bold text-slate-800 truncate select-none">
                  {getPassengerSummary()}
                </p>
                {showTravellersPanel && (
                  <TravellersPanel
                    travelers={travelers}
                    onIncrement={increment}
                    onDecrement={decrement}
                    travelClass={travelClass}
                    onClassChange={setTravelClass}
                    onApply={() => setShowTravellersPanel(false)}
                  />
                )}
              </div>

              {/* SEARCH */}
              <button
                type="submit"
                disabled={isSearching}
                className="shrink-0 self-stretch px-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-colors"
              >
                {isSearching ? 'SEARCHING…' : 'SEARCH'}
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* Compact bar header for Multi City (fields differ)     */}
          {/* ---------------------------------------------------- */}
          {isMultiCity && (
            <div className="flex flex-wrap items-stretch gap-2 mb-2">
              <TripTypeDropdown
                value={tripType}
                onChange={setTripType}
                isOpen={showTripTypeDropdown}
                onToggle={() => setShowTripTypeDropdown((v) => !v)}
              />

              <div className="flex-1" />

              <div
                className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer relative min-w-[160px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTravellersPanel((v) => !v);
                }}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">
                  Passenger &amp; Class
                </p>
                <p className="text-sm font-bold text-slate-800 truncate select-none">
                  {getPassengerSummary()}
                </p>
                {showTravellersPanel && (
                  <TravellersPanel
                    travelers={travelers}
                    onIncrement={increment}
                    onDecrement={decrement}
                    travelClass={travelClass}
                    onClassChange={setTravelClass}
                    onApply={() => setShowTravellersPanel(false)}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="shrink-0 px-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-colors"
              >
                {isSearching ? 'SEARCHING…' : 'SEARCH'}
              </button>
            </div>
          )}

          {isMultiCity &&
            multiCitySegments.map((seg, i) => {
              const isLast = i === multiCitySegments.length - 1;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-1 md:grid-cols-4 gap-4 items-end ${
                    i > 0 ? 'mt-4 pt-4 border-t border-slate-100' : 'pt-2'
                  }`}
                >
                  {/* MC FROM */}
                  <div className="space-y-1 relative" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">From</p>
                    <div
                      className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer"
                      onClick={(e) => openMCDropdown('from', i, e)}
                    >
                      <p className={`text-sm font-bold truncate ${seg.from ? 'text-slate-900' : 'text-slate-300'}`}>
                        {seg.from || 'Select City'}
                      </p>
                    </div>
                    {showMCDropdown('from', i) && (
                      <LocationDropdown search={mcSearch} onSearchChange={setMcSearch} onSelect={selectMC} placeholder="From" />
                    )}
                  </div>

                  {/* MC TO */}
                  <div className="space-y-1 relative" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">To</p>
                    <div
                      className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer"
                      onClick={(e) => openMCDropdown('to', i, e)}
                    >
                      <p className={`text-sm font-bold truncate ${seg.to ? 'text-slate-900' : 'text-slate-300'}`}>
                        {seg.to || 'Select City'}
                      </p>
                    </div>
                    {showMCDropdown('to', i) && (
                      <LocationDropdown search={mcSearch} onSearchChange={setMcSearch} onSelect={selectMC} placeholder="To" />
                    )}
                  </div>

                  {/* MC DEPARTURE */}
                  <div className="space-y-1 relative" onClick={() => triggerDatePicker(`mc-dep-${i}`)}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Departure</p>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer relative">
                      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                        {seg.departureDate ? formatShortDate(seg.departureDate) : 'Select date'}
                      </p>
                      <HiddenDateInput
                        id={`mc-dep-${i}`}
                        value={seg.departureDate}
                        min={today}
                        onChange={(v) => updateSegmentDate(i, v)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {i > 0 && isLast && (
                      <button
                        type="button"
                        onClick={addCity}
                        className="text-blue-600 text-xs font-bold border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 uppercase tracking-wide"
                      >
                        + Add City
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* ---------------------------------------------------- */}
          {/* Fare type row                                         */}
          {/* ---------------------------------------------------- */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Fare Type:
            </span>
            {FARE_OPTIONS.map((fare) => {
              const active = specialFare === fare.key;
              return (
                <label
                  key={fare.key}
                  className="flex items-center gap-1.5 cursor-pointer text-sm"
                  onClick={() => setSpecialFare(fare.key)}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      active ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className={active ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                    {fare.label}
                  </span>
                  {fare.badge && (
                    <span className="bg-pink-100 text-pink-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {fare.badge}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Price drop protection + quick links */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={priceDropProtection}
                onChange={(e) => setPriceDropProtection(e.target.checked)}
                className="accent-blue-600"
              />
              <span className="text-sm text-slate-600">
                Add Price Drop Protection{' '}
                <span className="text-slate-400">
                  If the price drops, we&apos;ll refund the difference.
                </span>{' '}
                <a href="#" className="text-blue-600 font-medium underline-offset-2 hover:underline">
                  View Details
                </a>
              </span>
              <ShieldIcon className="w-4 h-4 text-blue-500" />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FlightIcon className="w-4 h-4" /> Flight Tracker
              </button>
              <button
                type="button"
                className="relative flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  10% off
                </span>
                <TagIcon className="w-4 h-4" /> Shop Duty Free
              </button>
            </div>
          </div>

          {/* Search error banner — surfaces failures that were previously silent */}
          {searchError && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {searchError}
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
