// Mirrors the Angular ApiService.searchFlights() call.
// NOTE: endpoint/shape are placeholders — point VITE_API_BASE_URL at your real API,
// and adjust the path/response mapping below if your backend differs.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * @param {string} from
 * @param {string} to
 * @param {string} departureDate  ISO date
 * @param {string} returnDate    ISO date
 * @param {number} travelers
 * @returns {Promise<{ departures: import('../models/travel.models').Flight[], returns: import('../models/travel.models').Flight[] }>}
 */
export async function searchFlights(from, to, departureDate, returnDate, travelers) {
  const params = new URLSearchParams({
    from,
    to,
    departureDate,
    returnDate,
    travelers: String(travelers),
  });

  const res = await fetch(`${API_BASE_URL}/flights/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Flight search failed with status ${res.status}`);
  }

  return res.json();
}
