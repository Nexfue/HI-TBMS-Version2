import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  BedDouble,
  Bath,
  Maximize,
  Share2,
  Wind,
  Tv,
  Wifi,
  Lock,
  Speaker,
  Sparkles,
  Bath as BathtubIcon,
  Sofa,
  AlarmClock,
  ChevronDown,
} from 'lucide-react';

// ── Static data used when a room isn't passed via route state ───────────
// (e.g. direct link / page refresh). In production, fetch by :id instead.
const FALLBACK_ROOM = {
  id: 1,
  name: 'Standard Rooms',
  tag: 'Luxury Room',
  price: 12500,
  rating: 4.9,
  reviews: 245,
  stars: 3,
  beds: 1,
  baths: 1,
  sqft: 350,
  address: 'Hotel Royelle, Mesa, New Jersey 45402',
  img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
};

const GALLERY = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
];

const AMENITIES = [
  { icon: Wind, label: 'Air Conditioning' },
  { icon: Tv, label: 'Flat Screen TV' },
  { icon: Wifi, label: 'High Speed Wi-Fi' },
  { icon: Lock, label: 'Electronic Safe' },
  { icon: Speaker, label: 'Sound System' },
  { icon: Sparkles, label: 'Vanity mirror' },
  { icon: BathtubIcon, label: 'Bathtubs' },
  { icon: Sofa, label: 'Seating area' },
  { icon: AlarmClock, label: 'Alarm clock' },
];

const CHECK_IN_RULES = [
  'Check-in from 2:00 PM onward',
  'Valid photo ID required at check-in',
  'Early check-in subject to availability',
];

const CHECK_OUT_RULES = [
  'Check-out by 11:00 AM',
  'Late check-out available on request',
  'Room inspection may be required',
];

const todayISO = () => new Date().toISOString().split('T')[0];

const formatRupees = (n) => `₹${n.toLocaleString('en-IN')}`;

// ── Booking sidebar form ─────────────────────────────────────────────────
function BookRoomForm({ room }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    checkIn: todayISO(),
    checkOut: '',
    adults: '',
    children: '',
    roomType: '',
    roomCount: '',
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this up to your booking API.
  };

  const selectClass =
    'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 bg-white appearance-none text-gray-700';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
      <h3 className="font-bold text-gray-900 text-lg mb-5">Book Room</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Ex. John Doe"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={update('phone')}
            placeholder="Enter Phone Number"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Check-in Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            min={todayISO()}
            value={form.checkIn}
            onChange={update('checkIn')}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Check-out Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            min={form.checkIn || todayISO()}
            value={form.checkOut}
            onChange={update('checkOut')}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Adult <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select required value={form.adults} onChange={update('adults')} className={selectClass}>
              <option value="" disabled>Select</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">Children</label>
          <div className="relative">
            <select value={form.children} onChange={update('children')} className={selectClass}>
              <option value="" disabled>Select</option>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Room Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select required value={form.roomType} onChange={update('roomType')} className={selectClass}>
              <option value="" disabled>Select</option>
              <option value={room.tag}>{room.tag}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block">
            Number of Rooms <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select required value={form.roomCount} onChange={update('roomCount')} className={selectClass}>
              <option value="" disabled>Select</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full bg-blue-600 text-white font-bold text-sm py-3 rounded-full hover:bg-blue-700 transition-colors"
        >
          Book Now
        </button>
      </form>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function RoomDetails() {
  const { id } = useParams();
  const routeLocation = useLocation();
  const navigate = useNavigate();

  // Room comes from RoomCard's navigate(..., { state: { room } }).
  // Falls back to placeholder data on a direct visit/refresh — replace with
  // a real fetch-by-id call in production.
  const room = routeLocation.state?.room || { ...FALLBACK_ROOM, id: Number(id) || FALLBACK_ROOM.id };

  const [activeImage, setActiveImage] = useState(GALLERY[0]);

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter',sans-serif]">
      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img src={room.img} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-3xl md:text-4xl font-black">Room Details</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-white/80 mt-2 hover:text-white transition-colors"
          >
            Home / Room Details
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left column: gallery + content ───────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Gallery */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex sm:flex-col gap-3 order-2 sm:order-1">
                {GALLERY.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                      activeImage === src ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 order-1 sm:order-2 rounded-2xl overflow-hidden h-64 sm:h-[26rem]">
                <img src={activeImage} alt={room.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Title / meta row */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-gray-900">{room.name}</h2>
                  <span className="bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {room.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{room.address || FALLBACK_ROOM.address}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1 font-bold text-gray-800">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {room.rating?.toFixed(1)} ({room.reviews} Reviews)
                  </span>
                </div>

                <p className="text-2xl font-black text-gray-900 mt-3">
                  {formatRupees(room.price)} <span className="text-sm font-normal text-gray-400">/ night</span>
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4" /> {room.beds} Bed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" /> {room.baths} Bath
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize className="w-4 h-4" /> {room.sqft} sqft
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Overview */}
            <div className="py-8 border-b border-gray-200">
              <h3 className="text-xl font-black text-gray-900 mb-3">Overview</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This room blends comfort and style, featuring plush bedding, warm natural tones, and
                thoughtful details throughout. A private seating nook and large windows bring in soft
                daylight, while premium linens and a curated amenity set are designed to make every
                stay feel effortless.
              </p>
            </div>

            {/* Amenities */}
            <div className="py-8 border-b border-gray-200">
              <h3 className="text-xl font-black text-gray-900 mb-2">Room Amenities</h3>
              <p className="text-sm text-gray-500 mb-5">
                Everything you need for a comfortable and convenient stay.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {AMENITIES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Booking rules */}
            <div className="py-8">
              <h3 className="text-xl font-black text-gray-900 mb-5">Booking Rules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="font-bold text-gray-800 mb-3">Check In</p>
                  <ul className="flex flex-col gap-2">
                    {CHECK_IN_RULES.map((rule) => (
                      <li key={rule} className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-3">Check Out</p>
                  <ul className="flex flex-col gap-2">
                    {CHECK_OUT_RULES.map((rule) => (
                      <li key={rule} className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: booking form ───────────────────────────── */}
          <div className="w-full lg:w-96 shrink-0">
            <BookRoomForm room={room} />
          </div>
        </div>
      </div>
    </div>
  );
}
