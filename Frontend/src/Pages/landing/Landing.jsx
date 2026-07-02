import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTravelDetails } from '../../Store/slices/travelSlice';
import {
  CLASS_OPTIONS,
  getAirportCode,
  getAirportSubtext,
  getCityCountry,
  getAirportDisplayName,
  getFilteredLocationsBySection,
} from '../../Data/airports';
import { todayISO, getDayPart, getMonthYearPart, getDayName } from '../../utils/dateHelpers';

// ── Small shared icons ──────────────────────────────────────────────────────
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const SwapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const FlightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.5 21l1.5-5-7-3.5V9l8 2V6a2 2 0 114 0v5l8-2v3.5l-7 3.5 1.5 5-3.5-1.5L10.5 21z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HotelIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M3 21V7a1 1 0 011-1h6a1 1 0 011 1v14M3 21h18M11 21v-6a1 1 0 011-1h6a1 1 0 011 1v6M7 6V4a1 1 0 011-1h2a1 1 0 011 1v2M7 10h.01M7 14h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HolidayIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 3a9 9 0 019 9c-4 0-9-1-9-9zm0 0a9 9 0 00-9 9c4 0 9-1 9-9zm0 0v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const VisaIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect height="16" rx="2" strokeWidth="1.5" width="12" x="6" y="4" />
    <path d="M12 8a2 2 0 100 4 2 2 0 000-4zm-4 8h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const CruiseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4 19l1.5-6h13L20 19M6 13V5h5l3 4M3 21c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20.59 13.41L11 3.83A2 2 0 009.59 3.24L4 3v5.59a2 2 0 00.59 1.41l9.59 9.59a2 2 0 002.82 0l3.59-3.59a2 2 0 000-2.82zM7.5 7.5h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const SERVICE_OPTIONS = [
  { key: 'flights', label: 'Flights', Icon: FlightIcon },
  { key: 'hotels', label: 'Hotels', Icon: HotelIcon },
  { key: 'holiday-packages', label: 'Holiday Packages', Icon: HolidayIcon },
  { key: 'visa', label: 'Visa', Icon: VisaIcon },
  { key: 'cruise', label: 'Cruise', Icon: CruiseIcon },
];

const PinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      clipRule="evenodd"
      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
      fillRule="evenodd"
    />
  </svg>
);

// ── Reusable dropdown row + panel (replaces the 3x-duplicated Angular markup) ─
function LocationRow({ city, onSelect }) {
  return (
    <div
      onClick={(e) => onSelect(city, e)}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-50 transition-colors"
    >
      <div className="w-12 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-600 tracking-wide">{getAirportCode(city)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{getCityCountry(city)}</p>
        <p className="text-xs text-slate-400 leading-tight truncate">{getAirportDisplayName(city)}</p>
      </div>
    </div>
  );
}

function LocationDropdown({ search, onSearchChange, onSelect, placeholder }) {
  const { international, domestic } = getFilteredLocationsBySection(search);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-0 left-0 w-[300px] bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
        <SearchIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-sm outline-none border-none bg-transparent text-slate-700 placeholder:text-slate-400 font-medium"
        />
      </div>
      <div className="max-h-72 overflow-y-auto">
        {international.length > 0 && (
          <>
            <div className="px-3 py-1.5 bg-slate-50 sticky top-0 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">International</span>
            </div>
            {international.map((city) => (
              <LocationRow key={city} city={city} onSelect={onSelect} />
            ))}
          </>
        )}
        {domestic.length > 0 && (
          <>
            <div className="px-3 py-1.5 bg-slate-50 sticky top-0 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domestic</span>
            </div>
            {domestic.map((city) => (
              <LocationRow key={city} city={city} onSelect={onSelect} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TravellersPanel({ travelers, onIncrement, onDecrement, travelClass, onClassChange, onApply }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50"
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <span className="text-sm font-bold">Travellers</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrement}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:border-blue-500 hover:text-blue-500"
          >
            &#8722;
          </button>
          <span className="text-sm font-bold w-5 text-center">{travelers}</span>
          <button
            type="button"
            onClick={onIncrement}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:border-blue-500 hover:text-blue-500"
          >
            &#43;
          </button>
        </div>
      </div>
      <div className="mb-3">
        <span className="text-xs font-bold text-slate-700 block mb-1.5">Travel Class</span>
        <div className="space-y-1.5">
          {CLASS_OPTIONS.map((cls) => (
            <label key={cls.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="travelClass"
                checked={travelClass === cls.value}
                onChange={() => onClassChange(cls.value)}
                className="accent-blue-600"
              />
              <span className="text-xs text-slate-700">{cls.label}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="w-full bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
}

// Hidden native date input overlay — mirrors the Angular `.date-input` trick,
// including the calendar-picker-indicator tweak (done via Tailwind arbitrary variants).
function HiddenDateInput({ id, value, onChange, min }) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
    />
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookingSectionRef = useRef(null);

  const today = todayISO();

  // ── Main form state (replaces the Angular FormGroup) ────────────────────
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

  // ── Dropdown / panel UI state ────────────────────────────────────────────
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

  // Angular's @HostListener('document:click') closeAllDropdowns()
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

  // Angular's ngOnInit valueChanges subscriptions: keep segment 0/1 in sync
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

  const searchFlights = (e) => {
    e.preventDefault();

    if (isMultiCity) {
      const segs = multiCitySegments.map((s) => ({
        from: s.from || '',
        to: s.to || '',
        departureDate: s.departureDate || '',
      }));

      if (!segs.every((s) => s.from && s.to && s.departureDate)) return;

      dispatch(
        setTravelDetails({
          name: '',
          email: '',
          tripType: 'multi-city',
          from: segs[0].from,
          to: segs[segs.length - 1].to,
          departureDate: new Date(segs[0].departureDate).toISOString(),
          returnDate: '',
          travelers,
          travelClass,
          multiCitySegments: segs.map((s) => ({
            from: s.from,
            to: s.to,
            departureDate: new Date(s.departureDate).toISOString(),
          })),
        })
      );
      navigate('/step2');
      return;
    }

    if (!from || !to || !departureDate) {
      setTouched({ from: true, to: true });
      return;
    }

    const hasReturn = isRoundTrip && !!returnDate;
    dispatch(
      setTravelDetails({
        name: '',
        email: '',
        tripType: hasReturn ? 'round-trip' : 'one-way',
        from,
        to,
        departureDate: new Date(departureDate).toISOString(),
        returnDate: hasReturn ? new Date(returnDate).toISOString() : '',
        travelers,
        travelClass,
      })
    );
    navigate('/step2');
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased font-['Inter',sans-serif]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter uppercase">Holiday Infinite</div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-wide">
          <a className="hover:text-blue-600 transition-colors" href="#">Package</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Contact</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Home</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Tour</a>
          <a className="hover:text-blue-600 transition-colors" href="#">About</a>
        </nav>
        <button
          type="button"
          onClick={scrollToBooking}
          className="bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-bold uppercase hover:bg-zinc-800 transition-all"
        >
          Book Trip
        </button>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div
          className="relative w-full h-[600px] rounded-[4rem] overflow-hidden bg-cover bg-center flex items-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbB27YDmP37x3lveHV65AWVsXma1AraFGuf63ZoPqVnck1AI0QE2i6HK_ZCORzjcq44vKdaRGG2SJJEnXkARSWsmUniQbDzO1lNn5SF36otXugUn-wKsAsUZAdnQpgEy-bJdNln4qAZhL4pqfRNLNmFlujnFBfBSSmZyOsg4uh0j3ifSpclA5a-UfBbu5yRewXKs0bxy0tw01UmfdyWrp0JqJ4G2BAKSmgDvbBW2YA517QExNRRLQPfaACwHwJ02dfqgbwG0qasjRZ')",
            backgroundPosition: 'center center',
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 px-12 lg:px-24 w-full">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-slate-700">
                Elevet Your Travel Journy
              </p>
              <h1
                className="mb-8"
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 900,
                  fontSize: '42px',
                  color: '#0A1633',
                  lineHeight: 0.95,
                  letterSpacing: '-1px',
                  maxWidth: '420px',
                }}
              >
                Experience<br />The Magic Of<br />Flight !
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                >
                  Book A Trip Now
                </button>
                <button type="button" className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-blue-600 border-b-[8px] border-b-transparent ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold shadow-sm border border-slate-200">1</div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-300">2</div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-300">3</div>
          </div>

          {/* Floating stats card */}
          <div className="absolute right-12 bottom-12 bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-xl flex items-center space-x-6">
            <div className="flex items-center -space-x-4">
              <img alt="Destination 1" className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA3LweAKfcM9FgSn82QSFyT3dsqTkrOPL15OTBmVUGVjoo7ilrMcxUEV3nQEagtUI6sEUJAv3gRT-EZOf1q8Fv-CBJQtT-p_60vflX1m76Axc6A15kHgvx_AfEavweRSWWzpK9JOy8h6dfZHY_A77uS8axk7QMKkLccPaZ-Fz3fPmkkGDsl67nalpGUXPf4Sl0HHp1aNYMYP_3nK1Hmu6QlazuZUF3ewNkY6JBdKasqlBFjU1yqBd1spl08vB6nWAqI3axyvVRYg" />
              <img alt="Destination 2" className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZhNFfOeCnyTnjbR5GGWfNdO7ljKaAdxIOw9miu_indhg0MufbbdxoTc7qsKn_bkgyaRR6mrb1FrP4GxJZ2NUI3h2RLyTAkXbVsEREDOzs2oNGOafuxZOaLpSA7x3AEvu1grNTTqCAPQ96FX-z0SOe6tqtKC9PRQN_bp7MCFGl-WQ8_ICpUvrkDaSz369J8xAvrE59zlWbw2SZwz9H1hcuVXZdMvOu3cr6-vCaUYdJv9S2G1UN-57eD1snfVVQSTbQ4ryLwUP3JQ" />
              <img alt="Destination 3" className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALP5kteIZXtfMu99hfOPSGsbHpA1dc1LSadp6bIq11kfAsKQwYUusgTE-CAEiJjStVtNY9c1Zs-Ha0R7zyIPiEcU31nUMvnOfjsZiA5WxWMhIERHBcOcj7rvdfDLd8p2tjxEPw85TA-TbYnX2ylF3VoTXYcHz3I2Hcssm5P79HSpIDeYVFm9Ty64TbUKZM0Z7aeUSkHF6YjkaJQrAh_P9fPPein0vqYw6oBDJBPRnOrNzug9uU032-ycc4uutS-_FKN4qpleMNJA" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Awesome Places</h4>
              <p className="text-[10px] text-slate-500">Discover The World One<br />Adventure At A Time</p>
            </div>
            <div className="bg-zinc-100 px-4 py-3 rounded-2xl flex items-center space-x-2">
              <span className="text-sm font-bold">Know More</span>
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking Bar ────────────────────────────────────────────────── */}
      <section ref={bookingSectionRef} className="max-w-7xl mx-auto px-4 -mt-[33px] relative z-20">
        <div className="flex items-center justify-center gap-10 bg-white border border-slate-100 rounded-full py-4 px-8 mb-3 shadow-sm">
          {SERVICE_OPTIONS.map((service) => (
            <button
              key={service.key}
              type="button"
              onClick={() => setActiveService(service.key)}
              className={`flex flex-col items-center gap-1.5 text-xs font-semibold transition-colors ${
                activeService === service.key ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <service.Icon className="w-5 h-5" />
              <span>{service.label}</span>
              <span className={`h-0.5 w-full rounded-full ${activeService === service.key ? 'bg-blue-600' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>
        <form onSubmit={searchFlights}>
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
                <div className="space-y-2 border-l border-slate-100 pl-6 relative cursor-pointer" onClick={() => triggerDatePicker('dep-date-ow')}>
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

            {/* Offers + Search */}
            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  Students
                  <span className="bg-blue-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">Offer</span>
                </button>
                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  Family &amp; Friends
                  <span className="bg-blue-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">Offer</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-full text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  <span className="text-base font-bold">+</span> ADD PROMOCODE
                </button>
              </div>
              <button type="submit" className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                <SearchIcon className="w-5 h-5" />
                <span>Search Flights</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ── Destinations ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-24 -mt-[38px]">
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
                <ArrowRightIcon className="w-4 h-4 ml-2" />
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

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-200">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/4">
            <span className="inline-block px-6 py-2 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">About Us</span>
          </div>
          <div className="md:w-3/4">
            <h3 className="text-2xl font-bold mb-10 leading-tight">
              Our Goal Is To Provide Seamless Flight Booking, Unbeatable Deals, And A Hassle-Free
              <br />
              Experience. Let Us Handle The Details While You Focus On Creating Unforgettable Memories.
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-slate-500 leading-relaxed">
              <p>
                We believe travel should be simple, affordable, and stress-free. Our mission is to connect
                travelers with the best flight deals and seamless booking experiences. Whether you're planning
                a quick getaway or a long adventure, we're here to make your journey effortless.
              </p>
              <p>
                We are dedicated to making air travel more accessible and convenient for everyone. With our
                user-friendly platform, you can easily find and book flights that suit your schedule and
                budget. Let us handle the details while you focus on exploring new destinations and creating
                unforgettable memories.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-blue-600 text-2xl">&#10022;</div>
          <div className="mt-8 md:mt-0 flex space-x-4">
            <div className="w-24 h-8 bg-slate-50 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
}
