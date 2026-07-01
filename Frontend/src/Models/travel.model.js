/**
 * @typedef {Object} TravelDetails
 * @property {string} name
 * @property {string} email
 * @property {'one-way' | 'round-trip' | 'multi-city'} tripType
 * @property {string} from
 * @property {string} to
 * @property {string} departureDate  ISO string
 * @property {string} returnDate     ISO string, '' if none
 * @property {number} travelers
 * @property {'economy' | 'business' | 'first'} travelClass
 * @property {{from: string, to: string, departureDate: string}[]} [multiCitySegments]
 */

/**
 * Factory that fills in sane defaults — use instead of building the
 * object literal by hand at every call site.
 * @param {Partial<TravelDetails>} overrides
 * @returns {TravelDetails}
 */
export const createTravelDetails = (overrides = {}) => ({
  name: '',
  email: '',
  tripType: 'one-way',
  from: '',
  to: '',
  departureDate: '',
  returnDate: '',
  travelers: 1,
  travelClass: 'economy',
  ...overrides,
});
