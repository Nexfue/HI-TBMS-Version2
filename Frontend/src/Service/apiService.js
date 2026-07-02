// ── API base ─────────────────────────────────────────────────────────────
// The Angular version hardcoded `/api`. Kept configurable via
// VITE_API_BASE_URL (falls back to '/api') to match the rest of this
// project's convention — set it in .env, or leave unset if you're
// proxying /api through Vite's dev server.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ── Backend DTO <-> frontend model caches ───────────────────────────────
// Mirrors the Angular service's private Maps. Module-level state acts as
// a singleton here (same as Angular's `providedIn: 'root'`) — populated
// every time a search runs, so getBackendFlight/Hotel/Activity/Transport
// can recover the exact DTO the backend sent instead of reconstructing
// an approximation when building the itinerary request later.
const flightCache = new Map();
const hotelCache = new Map();
const activityCache = new Map();
const transportCache = new Map();

// ── Flights ──────────────────────────────────────────────────────────────

/**
 * @param {string} from
 * @param {string} to
 * @param {string} departureDate  ISO date
 * @param {string} returnDate     ISO date
 * @param {number} [travelers]    adults
 * @param {number} [children]
 * @returns {Promise<{ departures: import('../models/travel.models').Flight[], returns: import('../models/travel.models').Flight[] }>}
 */
export async function searchFlights(from, to, departureDate, returnDate, travelers = 1, children = 0) {
  const params = new URLSearchParams({
    origin: from,
    destination: to,
    departureDate,
    returnDate,
    adults: String(travelers),
    children: String(children),
  });

  try {
    const response = await fetch(`${BASE_URL}/flights/search?${params.toString()}`);
    if (!response.ok) throw new Error(`Flights API error: status ${response.status}`);

    /** @type {{ departureFlights: object[], returnFlights: object[] }} */
    const data = await response.json();

    data.departureFlights.forEach((f) => flightCache.set(f.flightId, f));
    data.returnFlights.forEach((f) => flightCache.set(f.flightId, f));

    return {
      departures: data.departureFlights.map(mapFlight),
      returns: data.returnFlights.map(mapFlight),
    };
  } catch (err) {
    console.error('Flights API error:', err);
    return { departures: [], returns: [] };
  }
}

// ── Hotels ───────────────────────────────────────────────────────────────

/**
 * @param {string} destination
 * @param {string} checkIn   ISO date
 * @param {string} checkOut  ISO date
 * @param {number} [travelers]  adults
 * @param {number} [children]
 * @returns {Promise<import('../models/travel.models').Hotel[]>}
 */
export async function searchHotels(destination, checkIn, checkOut, travelers = 1, children = 0) {
  const params = new URLSearchParams({
    destination,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adults: String(travelers),
    children: String(children),
  });

  try {
    const response = await fetch(`${BASE_URL}/hotels/search?${params.toString()}`);
    if (!response.ok) throw new Error(`Hotels API error: status ${response.status}`);

    /** @type {{ hotels: object[] }} */
    const data = await response.json();

    data.hotels.forEach((h) => hotelCache.set(h.hotelId, h));
    return data.hotels.map(mapHotel);
  } catch (err) {
    console.error('Hotels API error:', err);
    return [];
  }
}

// ── Activities ───────────────────────────────────────────────────────────

/**
 * @param {string} destination
 * @returns {Promise<import('../models/travel.models').Activity[]>}
 */
export async function getActivities(destination) {
  const params = new URLSearchParams({ destination });

  try {
    const response = await fetch(`${BASE_URL}/activities?${params.toString()}`);
    if (!response.ok) throw new Error(`Activities API error: status ${response.status}`);

    /** @type {{ activities: object[] }} */
    const data = await response.json();

    data.activities.forEach((a) => activityCache.set(a.activityId, a));
    return data.activities.map(mapActivity);
  } catch (err) {
    console.error('Activities API error:', err);
    return [];
  }
}

// ── Transport ────────────────────────────────────────────────────────────

/**
 * @param {string} destination
 * @param {number} travelers
 * @returns {Promise<import('../models/travel.models').Transport[]>}
 */
export async function getTransports(destination, travelers) {
  const params = new URLSearchParams({ destination, travelers: String(travelers) });

  try {
    // NOTE: real endpoint is singular `/transport`, not `/transports`.
    const response = await fetch(`${BASE_URL}/transport?${params.toString()}`);
    if (!response.ok) throw new Error(`Transport API error: status ${response.status}`);

    /** @type {{ transports: object[] }} */
    const data = await response.json();

    data.transports.forEach((t) => transportCache.set(t.transportId, t));
    return data.transports.map(mapTransport);
  } catch (err) {
    console.error('Transport API error:', err);
    return [];
  }
}

// ── Itinerary generation ────────────────────────────────────────────────

/**
 * @param {object} request  ItineraryRequest — see models/travel.models.js
 * @returns {Promise<{ success: boolean, message: string, pdfBase64?: string, itineraryId?: string }>}
 */
export async function generateItinerary(request) {
  try {
    const response = await fetch(`${BASE_URL}/itinerary/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message ?? `Itinerary API error: status ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error('Itinerary API error:', err);
    return {
      success: false,
      message: err?.message ?? 'Failed to generate itinerary.',
    };
  }
}

// ── Backend DTO lookup (cache-first, then reconstruct) ──────────────────
// Same call signatures the app already uses — no changes needed at any
// call site in Step5Transport.jsx.

export function getBackendFlight(id, flight, dateIso) {
  return flightCache.get(id) ?? flightToBackend(flight, dateIso);
}

export function getBackendHotel(id, hotel) {
  return hotelCache.get(id) ?? hotelToBackend(hotel);
}

export function getBackendActivity(id, activity) {
  return activityCache.get(id) ?? activityToBackend(activity);
}

export function getBackendTransport(id, transport) {
  return transportCache.get(id) ?? transportToBackend(transport);
}

// ── Mappers: Backend -> Frontend ─────────────────────────────────────────

function mapFlight(f) {
  const depTime = f.departureTime.length >= 16 ? f.departureTime.substring(11, 16) : f.departureTime;
  const arrTime = f.arrivalTime.length >= 16 ? f.arrivalTime.substring(11, 16) : f.arrivalTime;
  return {
    id: f.flightId,
    airline: f.airline,
    flightNo: f.flightNumber,
    departure: depTime,
    arrival: arrTime,
    duration: f.duration,
    stops: f.stops,
    price: Number(f.price),
    seatsLeft: Math.floor(Math.random() * 18) + 4,
  };
}

function mapHotel(h) {
  const pn = Number(h.pricePerNight);
  return {
    id: h.hotelId,
    name: h.name,
    location: h.location,
    rating: h.rating,
    reviewCount: Math.floor(h.rating * 220 + 80),
    pricePerNight: pn,
    amenities: h.amenities,
    // Room tiers are synthesized on the frontend from pricePerNight —
    // the backend doesn't send rooms. Matches the Angular service exactly.
    rooms: [
      { id: 'standard', name: 'Standard', extraCharge: 0, description: 'Comfortable standard room with all essentials' },
      { id: 'deluxe', name: 'Deluxe', extraCharge: Math.round(pn * 0.3), description: 'Spacious deluxe room with upgraded amenities' },
      { id: 'suite', name: 'Suite', extraCharge: Math.round(pn * 0.7), description: 'Luxury suite with panoramic views and premium facilities' },
    ],
  };
}

const ACTIVITY_TYPE_MAP = {
  Adventure: 'Adventure',
  Cultural: 'Cultural',
  Relaxation: 'Relaxation',
  Local: 'Cultural',
  Family: 'Cultural',
};

const ACTIVITY_PRICE_BASE = {
  Adventure: 1800,
  Cultural: 600,
  Relaxation: 1400,
  Local: 500,
  Family: 800,
};

function mapActivity(a, index) {
  const type = ACTIVITY_TYPE_MAP[a.category] ?? 'Cultural';
  const price = (ACTIVITY_PRICE_BASE[a.category] ?? 1000) + index * 100;
  const rating = parseFloat((4.0 + (index % 10) * 0.09).toFixed(1));
  return {
    id: a.activityId,
    name: a.name,
    type,
    price,
    duration: a.duration,
    description: a.description,
    icon: a.imageUrl,
    rating,
  };
}

function mapTransport(t) {
  return {
    id: t.transportId,
    name: t.vehicleName,
    vehicleType: t.vehicleType,
    category: t.type ?? 'Normal',
    pricePerDay: Number(t.pricePerDay),
    capacity: t.seatingCapacity,
    features: t.features,
    icon: t.imageUrl,
  };
}

// ── Mappers: Frontend -> Backend (fallback reconstruction) ──────────────
// Only used when the cache misses (e.g. selection restored from a
// previous session without a fresh search).

function flightToBackend(f, dateIso) {
  const date = dateIso.substring(0, 10);
  return {
    flightId: f.id,
    airline: f.airline,
    airlineCode: f.flightNo.substring(0, 2),
    flightNumber: f.flightNo,
    departureTime: `${date}T${f.departure}:00`,
    arrivalTime: `${date}T${f.arrival}:00`,
    duration: f.duration,
    stops: f.stops,
    price: f.price,
    currency: 'INR',
  };
}

function hotelToBackend(h) {
  return {
    hotelId: h.id,
    name: h.name,
    location: h.location,
    rating: h.rating,
    pricePerNight: h.pricePerNight,
    amenities: h.amenities,
    imageUrl: '',
    description: '',
  };
}

function activityToBackend(a) {
  return {
    activityId: a.id,
    name: a.name,
    description: a.description,
    duration: a.duration,
    type: a.type,
    bestTime: 'Anytime',
    imageUrl: a.icon,
    category: a.type,
  };
}

function transportToBackend(t) {
  return {
    transportId: t.id,
    vehicleName: t.name,
    type: t.category,
    vehicleType: t.vehicleType,
    seatingCapacity: t.capacity,
    pricePerDay: t.pricePerDay,
    features: t.features,
    imageUrl: t.icon,
  };
}
