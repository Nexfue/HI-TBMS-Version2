// components/BookingFlights.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { searchFlights as searchFlightsApi } from "../api/flightApi";
import {
  CLASS_OPTIONS ,
    getAirportCode ,
  getFilteredLocations,
  getAirportSubtext,
} from "../Data/airports";


import {
  setTravelDetails,
  setFlights,

} from "../Store/slices/travelSlice";


/* ------------------------------------------------------------------ */
/*  Small icons used only inside this form                            */
/*  (FlightIcon/TagIcon already exist inside ServiceTabs.jsx — these   */
/*  are separate, local copies so this file has no hidden dependency)  */
/* ------------------------------------------------------------------ */

const FlightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.5 21l1.5-5-7-3.5V9l8 2V6a2 2 0 114 0v5l8-2v3.5l-7 3.5 1.5 5-3.5-1.5L10.5 21z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const SwapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M8 7h11m0 0l-4-4m4 4l-4 4M16 17H5m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
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
/*  ⚠️ Placeholder implementations — replace with your existing        */
/*  utils if you already have `todayISO`, `getDayPart`, etc. elsewhere */
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

/* ------------------------------------------------------------------ */
/*  City / airport lookup                                              */
/*  ⚠️ Placeholder data — swap in your real airport list/API           */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/*  LocationDropdown                                                    */
/*  ⚠️ Minimal working version — replace with your styled dropdown     */
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
/*  ⚠️ Minimal working version — replace with your styled panel        */
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
/*  HiddenDateInput                                                     */
/*  A visually-hidden native date input, opened via showPicker()       */
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
/*  Main BookingFlights component                                      */
/* ------------------------------------------------------------------ */

export default function BookingFlights() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookingSectionRef = useRef(null);
  const today = todayISO();

  const [tripType, setTripType] = useState('one-way'); // 'one-way' | 'round-trip' | 'multi-city'
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Bangkok');
  const [departureDate, setDepartureDate] = useState(today);
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [travelClass, setTravelClass] = useState('economy');
  const [touched, setTouched] = useState({ from: false, to: false });
  const [specialFare, setSpecialFare] = useState('regular');
  const [priceDropProtection, setPriceDropProtection] = useState(false);
  const [activeService, setActiveService] = useState('flights');
  const [multiCitySegments, setMultiCitySegments] = useState([
    { from: 'Delhi', to: 'Bangkok', departureDate: '' },
    { from: 'Bangkok', to: '', departureDate: '' },
  ]);

  const [showTravellersPanel, setShowTravellersPanel] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [activeMCField, setActiveMCField] = useState(null); // 'from' | 'to' | null
  const [activeMCIndex, setActiveMCIndex] = useState(-1);
  const [mcSearch, setMcSearch] = useState('');

  const isRoundTrip = tripType === 'round-trip';
  const isMultiCity = tripType === 'multi-city';
  const minReturnDate = departureDate || today;

  useEffect(() => {
    const closeAll = () => {
      setShowFromDropdown(false);
      setShowToDropdown(false);
      setShowTravellersPanel(false);
      setActiveMCField(null);
      setActiveMCIndex(-1);
    };
    document.addEventListener('click', closeAll);
    return () => document.removeEventListener('click', closeAll);
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

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openFromDropdown = (e) => {
    e.stopPropagation();
    setFromSearch('');
    setShowFromDropdown(true);
    setShowToDropdown(false);
    setActiveMCField(null);
  };

  const openToDropdown = (e) => {
    e.stopPropagation();
    setToSearch('');
    setShowToDropdown(true);
    setShowFromDropdown(false);
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

 
 
 //console.log("Search button clicked");
const handleSearch = async (e) => {
  e.preventDefault();

  try {
    const searchData = {
      from: getAirportCode(from),
      to: getAirportCode(to),
      departureDate,
      returnDate,
      tripType,
      adults: travelers,
      children: 0,
      travelClass,
    };



    const response = await searchFlightsApi(searchData);


    dispatch(setFlights(response.data.data));

   

    navigate("/search-flights", {
      state: {
        searchData: {
          ...searchData,
          fromCity: from,
          toCity: to,
        },
        flights: response.data.data,
      },
    });

  } catch (error) {
    console.error(error);
  }
};
//console.log(response.data.data);
//    console.log({
//   departureDate,
//   returnDate,
//   tripType,
// });

  return (
    <section ref={bookingSectionRef} className="max-w-7xl mx-auto px-4 mt-2 relative z-20">
     

      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-100">
          {/* Trip type selector */}
          <div className="flex items-center space-x-8 mb-8 border-b border-slate-100 pb-4">
            {[
              { value: 'one-way', label: 'One Way' },
              { value: 'round-trip', label: 'Round Trip' },
              { value: 'multi-city', label: 'Multi City' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  value={opt.value}
                  checked={tripType === opt.value}
                  onChange={() => setTripType(opt.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${tripType === opt.value ? 'font-bold' : 'font-medium text-slate-500'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
            <span className="ml-auto text-xs font-medium text-slate-400">Book International and Domestic Flights</span>
          </div>

          {/* ONE WAY */}
          {!isMultiCity && !isRoundTrip && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              {/* FROM */}
              <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-bold text-slate-400 uppercase">From</p>
                <div className="cursor-pointer" onClick={openFromDropdown}>
                  <p className={`text-2xl font-bold leading-tight ${from ? 'text-slate-900' : 'text-slate-300'}`}>
                    {from || 'Select City'}
                  </p>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {from ? getAirportSubtext(from) : 'DEL, Delhi Airport India'}
                </p>
                {touched.from && !from && <p className="text-xs text-red-500">Required</p>}
                {showFromDropdown && (
                  <LocationDropdown search={fromSearch} onSearchChange={setFromSearch} onSelect={selectFrom} placeholder="From" />
                )}
              </div>

              {/* TO */}
              <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                <div
                  className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 cursor-pointer z-10"
                  onClick={swapLocations}
                >
                  <SwapIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">To</p>
                <div className="cursor-pointer" onClick={openToDropdown}>
                  <p className={`text-2xl font-bold leading-tight ${to ? 'text-slate-900' : 'text-slate-300'}`}>
                    {to || 'Select City'}
                  </p>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {to ? getAirportSubtext(to) : 'BLR, Bengaluru International Airport...'}
                </p>
                {touched.to && !to && <p className="text-xs text-red-500">Required</p>}
                {showToDropdown && (
                  <LocationDropdown search={toSearch} onSearchChange={setToSearch} onSelect={selectTo} placeholder="To" />
                )}
              </div>

              {/* DEPARTURE */}
              <div className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer" 
               onClick={() => {
           
        triggerDatePicker("dep-date-ow");
            }}
                >
                <p className="text-xs font-bold text-slate-400 uppercase">Departure</p>
                <div className="text-2xl font-bold">
                  {getDayPart(departureDate)}
                  <span className="text-lg font-medium text-slate-500"> {getMonthYearPart(departureDate)}</span>
                </div>
                <p className="text-xs text-slate-400">{getDayName(departureDate)}</p>
                <HiddenDateInput id="dep-date-ow" value={departureDate} min={today} onChange={setDepartureDate} />
              </div>

              {/* TRAVELLERS & CLASS */}
              <div
                className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTravellersPanel((v) => !v);
                }}
              >
                <p className="text-xs font-bold text-slate-400 uppercase select-none">Travellers &amp; Class</p>
                <div className="text-2xl font-bold select-none">
                  {travelers}
                  <span className="text-lg font-medium text-slate-500"> {travelers === 1 ? 'Traveller' : 'Travellers'}</span>
                </div>
                <p className="text-xs text-slate-400 select-none">{getClassLabel()}</p>
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
            </div>
          )}

          {/* ROUND TRIP */}
          {!isMultiCity && isRoundTrip && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              {/* FROM */}
              <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-bold text-slate-400 uppercase">From</p>
                <div className="cursor-pointer" onClick={openFromDropdown}>
                  <p className={`text-2xl font-bold leading-tight ${from ? 'text-slate-900' : 'text-slate-300'}`}>
                    {from || 'Select City'}
                  </p>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {from ? getAirportSubtext(from) : 'DEL, Delhi Airport India'}
                </p>
                {touched.from && !from && <p className="text-xs text-red-500">Required</p>}
                {showFromDropdown && (
                  <LocationDropdown search={fromSearch} onSearchChange={setFromSearch} onSelect={selectFrom} placeholder="From" />
                )}
              </div>

              {/* TO */}
              <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                <div
                  className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 cursor-pointer z-10"
                  onClick={swapLocations}
                >
                  <SwapIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">To</p>
                <div className="cursor-pointer" onClick={openToDropdown}>
                  <p className={`text-2xl font-bold leading-tight ${to ? 'text-slate-900' : 'text-slate-300'}`}>
                    {to || 'Select City'}
                  </p>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {to ? getAirportSubtext(to) : 'BLR, Bengaluru International Airport...'}
                </p>
                {touched.to && !to && <p className="text-xs text-red-500">Required</p>}
                {showToDropdown && (
                  <LocationDropdown search={toSearch} onSearchChange={setToSearch} onSelect={selectTo} placeholder="To" />
                )}
              </div>

              {/* DEPARTURE */}
              <div className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer" onClick={() => triggerDatePicker('dep-date-rt')}>
                <p className="text-xs font-bold text-slate-400 uppercase">Departure</p>
                <div className="text-2xl font-bold">
                  {getDayPart(departureDate)}
                  <span className="text-lg font-medium text-slate-500"> {getMonthYearPart(departureDate)}</span>
                </div>
                <p className="text-xs text-slate-400">{getDayName(departureDate)}</p>
                <HiddenDateInput id="dep-date-rt" value={departureDate} min={today} onChange={setDepartureDate} />
              </div>

              {/* RETURN */}
              <div className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer" onClick={() => triggerDatePicker('ret-date-rt')}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase">Return</p>
                  {returnDate && (
                    <button type="button" onClick={clearReturn} className="text-slate-400 hover:text-slate-600 text-xs leading-none">
                      &#x2715;
                    </button>
                  )}
                </div>
                {returnDate ? (
                  <>
                    <div className="text-2xl font-bold">
                      {getDayPart(returnDate)}
                      <span className="text-lg font-medium text-slate-500"> {getMonthYearPart(returnDate)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{getDayName(returnDate)}</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-300">&mdash;</div>
                    <p className="text-xs text-slate-400">Select date</p>
                  </>
                )}
                <HiddenDateInput id="ret-date-rt" value={returnDate} min={minReturnDate} onChange={setReturnDate} />
              </div>

              {/* TRAVELLERS & CLASS */}
              <div
                className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTravellersPanel((v) => !v);
                }}
              >
                <p className="text-xs font-bold text-slate-400 uppercase select-none">Travellers &amp; Class</p>
                <div className="text-2xl font-bold select-none">
                  {travelers}
                  <span className="text-lg font-medium text-slate-500"> {travelers === 1 ? 'Traveller' : 'Travellers'}</span>
                </div>
                <p className="text-xs text-slate-400 select-none">{getClassLabel()}</p>
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
            </div>
          )}

          {/* MULTI CITY */}
          {isMultiCity &&
            multiCitySegments.map((seg, i) => {
              const isLast = i === multiCitySegments.length - 1;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-1 md:grid-cols-4 gap-6 items-end ${i > 0 ? 'mt-6 pt-6 border-t border-slate-100' : ''}`}
                >
                  {/* MC FROM */}
                  <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-bold text-slate-400 uppercase">From</p>
                    <div className="cursor-pointer" onClick={(e) => openMCDropdown('from', i, e)}>
                      <p className={`text-2xl font-bold leading-tight ${seg.from ? 'text-slate-900' : 'text-slate-300'}`}>
                        {seg.from || 'Select City'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {seg.from ? getAirportSubtext(seg.from) : 'Select City'}
                    </p>
                    {showMCDropdown('from', i) && (
                      <LocationDropdown search={mcSearch} onSearchChange={setMcSearch} onSelect={selectMC} placeholder="From" />
                    )}
                  </div>

                  {/* MC TO */}
                  <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-bold text-slate-400 uppercase">To</p>
                    <div className="cursor-pointer" onClick={(e) => openMCDropdown('to', i, e)}>
                      <p className={`text-2xl font-bold leading-tight ${seg.to ? 'text-slate-900' : 'text-slate-300'}`}>
                        {seg.to || 'Select City'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {seg.to ? getAirportSubtext(seg.to) : 'Select City'}
                    </p>
                    {showMCDropdown('to', i) && (
                      <LocationDropdown search={mcSearch} onSearchChange={setMcSearch} onSelect={selectMC} placeholder="To" />
                    )}
                  </div>

                  {/* MC DEPARTURE */}
                  <div
                    className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer"
                    onClick={() => triggerDatePicker(`mc-dep-${i}`)}
                  >
                    <p className="text-xs font-bold text-slate-400 uppercase">Departure</p>
                    <div className="text-2xl font-bold">
                      {getDayPart(seg.departureDate) || '—'}
                      {seg.departureDate && (
                        <span className="text-lg font-medium text-slate-500"> {getMonthYearPart(seg.departureDate)}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{getDayName(seg.departureDate)}</p>
                    <HiddenDateInput
                      id={`mc-dep-${i}`}
                      value={seg.departureDate}
                      min={today}
                      onChange={(v) => updateSegmentDate(i, v)}
                    />
                  </div>

                  {/* TRAVELLERS & CLASS (segment 0) / ADD CITY (last segment) */}
                  <div className="space-y-2 border-l border-slate-100 pl-6 relative">
                    {i === 0 && (
                      <>
                        <p
                          className="text-xs font-bold text-slate-400 uppercase select-none cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTravellersPanel((v) => !v);
                          }}
                        >
                          Travellers &amp; Class
                        </p>
                        <div
                          className="text-2xl font-bold select-none cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTravellersPanel((v) => !v);
                          }}
                        >
                          {travelers}
                          <span className="text-lg font-medium text-slate-500"> {travelers === 1 ? 'Traveller' : 'Travellers'}</span>
                        </div>
                        <p className="text-xs text-slate-400 select-none">{getClassLabel()}</p>
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
                      </>
                    )}
                    {i > 0 && isLast && (
                      <button
                        type="button"
                        onClick={addCity}
                        className="text-blue-600 text-xs font-bold border border-blue-600 px-3 py-1.5 rounded hover:bg-blue-50 uppercase tracking-wide"
                      >
                        + Add City
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Special Fares */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-4 flex-wrap">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-2 w-16 flex-shrink-0">
              Special<br />Fares
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { key: 'regular', label: 'Regular', sub: 'Regular Fares' },
                { key: 'student', label: 'Student', sub: 'Extra discounts/baggage' },
                { key: 'armed', label: 'Armed Forces', sub: 'Up to ₹600 off' },
                { key: 'gst', label: 'Have a GST number?', sub: 'Upto 10% Extra Savings !', badge: 'NEW' },
                { key: 'senior', label: 'Senior Citizen', sub: 'Up to ₹600 off' },
                { key: 'doctor', label: 'Doctor and Nurses', sub: 'Up to ₹600 off' },
              ].map((fare) => (
                <button
                  key={fare.key}
                  type="button"
                  onClick={() => setSpecialFare(fare.key)}
                  className={`relative text-left px-4 py-2 rounded-xl border text-xs transition-colors ${
                    specialFare === fare.key
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {fare.badge && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {fare.badge}
                    </span>
                  )}
                  <span className="block font-bold">{fare.label}</span>
                  <span className="block text-[10px] text-slate-400">{fare.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price drop protection + quick links */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={priceDropProtection}
                onChange={(e) => setPriceDropProtection(e.target.checked)}
                className="accent-blue-600"
              />
              <span className="text-sm text-slate-600">
                Add Price Drop Protection <span className="text-slate-400">If the price drops, we&apos;ll refund the difference.</span>{' '}
                <a href="#" className="text-blue-600 font-medium underline-offset-2 hover:underline">View Details</a>
              </span>
              <ShieldIcon className="w-4 h-4 text-blue-500" />
            </label>
            <div className="flex items-center gap-3">
              <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <FlightIcon className="w-4 h-4" /> Flight Tracker
              </button>
              <button type="button" className="relative flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">10% off</span>
                <TagIcon className="w-4 h-4" /> Shop Duty Free
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-colors"
            >
              Search Flights
            </button>
          </div>
        </div>
      </form>
    </section>
  );
  }
