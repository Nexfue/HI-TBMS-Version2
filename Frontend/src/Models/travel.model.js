/**
 * Type definitions for the travel domain (JSDoc) plus one small runtime
 * helper (`createTravelDetails`). This file exists so
 * `import('../models/travel.models').Flight` (etc.) in apiService.js JSDoc
 * comments resolves to something real, giving you editor autocomplete/
 * type-checking without adopting TypeScript.
 */

/**
 * @typedef {Object} RoomType
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} extraCharge
 */

/**
 * @typedef {Object} Hotel
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {number} rating
 * @property {number} pricePerNight
 * @property {string[]} amenities
 * @property {RoomType[]} rooms
 */

/**
 * @typedef {Object} Flight
 * @property {string} id
 * @property {string} airline
 * @property {string} flightNo
 * @property {string} departure   e.g. "14:30"
 * @property {string} arrival     e.g. "16:45"
 * @property {string} duration    e.g. "2h 15m"
 * @property {number} stops
 * @property {number} price
 * @property {string} [from]
 * @property {string} [to]
 */

/**
 * @typedef {'Adventure' | 'Cultural' | 'Relaxation' | 'Food & Dining' | 'Shopping'} ActivityType
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} name
 * @property {ActivityType} type
 * @property {string} duration
 * @property {number} rating
 * @property {number} price
 * @property {string} description
 */

/**
 * @typedef {'Normal' | 'Premium' | 'Luxury'} TransportCategory
 */

/**
 * @typedef {Object} Transport
 * @property {string} id
 * @property {string} name
 * @property {string} vehicleType
 * @property {TransportCategory} category
 * @property {number} capacity
 * @property {string[]} features
 * @property {number} pricePerDay
 */

/**
 * @typedef {Object} MultiCitySegment
 * @property {string} from
 * @property {string} to
 * @property {string} departureDate  ISO date
 */

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
 * @property {MultiCitySegment[]} [multiCitySegments]
 */

/**
 * Factory that fills in sane defaults — use instead of building the
 * object literal by hand at every call site (e.g. in step1's search form).
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
