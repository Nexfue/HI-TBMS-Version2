const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Replaces Angular's injectable `ApiService` (HttpClient + RxJS Observable).
 * Plain fetch wrapper returning a Promise — swap for axios if your team
 * prefers it; callers (`await searchHotels(...)`) won't need to change.
 */
export async function searchHotels(destination, departureDate, returnDate, travelers, signal) {
  const params = new URLSearchParams({
    to: destination,
    departureDate,
    returnDate,
    travelers: String(travelers),
  });

  const response = await fetch(`${BASE_URL}/hotels/search?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`Hotel search failed with status ${response.status}`, response.status);
  }

  return response.json();
}

/**
 * Mirrors the Angular ApiService.searchFlights() call.
 * NOTE: endpoint/shape are placeholders — point VITE_API_BASE_URL at your
 * real API, and adjust the path/response mapping below if your backend
 * differs. For multi-city, call this once per leg and combine with
 * `Promise.all` (replaces RxJS `forkJoin`).
 *
 * @param {string} from
 * @param {string} to
 * @param {string} departureDate  ISO date
 * @param {string} returnDate    ISO date
 * @param {number} travelers
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ departures: import('../models/travel.models').Flight[], returns: import('../models/travel.models').Flight[] }>}
 */
export async function searchFlights(from, to, departureDate, returnDate, travelers, signal) {
  const params = new URLSearchParams({
    from,
    to,
    departureDate,
    returnDate,
    travelers: String(travelers),
  });

  const response = await fetch(`${BASE_URL}/flights/search?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`Flight search failed with status ${response.status}`, response.status);
  }

  return response.json();
}

/**
 * Mirrors the Angular ApiService.getActivities() call.
 *
 * @param {string} destination
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('../models/travel.models').Activity[]>}
 */
export async function getActivities(destination, signal) {
  const params = new URLSearchParams({ destination });

  const response = await fetch(`${BASE_URL}/activities?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`Activities fetch failed with status ${response.status}`, response.status);
  }

  return response.json();
}

/**
 * Replaces `ApiService.getTransports` (HttpClient + RxJS Observable).
 */
export async function getTransports(destination, travelers, signal) {
  const params = new URLSearchParams({ destination, travelers: String(travelers) });

  const response = await fetch(`${BASE_URL}/transports?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`Transport fetch failed with status ${response.status}`, response.status);
  }

  return response.json(); // Transport[]
}

/**
 * Replaces `ApiService.generateItinerary` (HttpClient + RxJS Observable).
 * POSTs the full booking request and returns the backend's PDF/summary
 * response: { success, message, pdfBase64?, itineraryId? }.
 */
export async function generateItinerary(request, signal) {
  const response = await fetch(`${BASE_URL}/itinerary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`Itinerary generation failed with status ${response.status}`, response.status);
  }

  return response.json();
}

// ── Backend DTO mappers ─────────────────────────────────────────────────
// Replaces `ApiService.getBackendFlight/Hotel/Activity/Transport`. These
// are pure shape-transforms (frontend model -> backend request DTO), not
// network calls — adjust field names to match your real API contract.

export function getBackendFlight(id, flight, date) {
  return {
    id,
    airline: flight.airline,
    flightNo: flight.flightNo,
    departure: flight.departure,
    arrival: flight.arrival,
    duration: flight.duration,
    stops: flight.stops,
    price: flight.price,
    date,
  };
}

export function getBackendHotel(id, hotel) {
  return {
    id,
    name: hotel.name,
    location: hotel.location,
    rating: hotel.rating,
    pricePerNight: hotel.pricePerNight,
  };
}

export function getBackendActivity(id, activity) {
  return {
    id,
    name: activity.name,
    type: activity.type,
    price: activity.price,
    duration: activity.duration,
  };
}

export function getBackendTransport(id, transport) {
  return {
    id,
    name: transport.name,
    vehicleType: transport.vehicleType,
    category: transport.category,
    pricePerDay: transport.pricePerDay,
    capacity: transport.capacity,
  };
}
