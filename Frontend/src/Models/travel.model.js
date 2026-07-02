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
 * @property {number} [reviewCount]
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
 * @property {number} [seatsLeft]
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
 * @property {string} [icon]  imageUrl passed through from the backend DTO
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
 * @property {string} [icon]  imageUrl passed through from the backend DTO
 */

// ====================== Backend DTOs ======================
// Mirrors the .NET DTOs the real API sends/expects (see apiService.js).
// These aren't the shapes components work with — apiService.js maps
// between these and the frontend models above.

/**
 * @typedef {Object} BackendFlight
 * @property {string} flightId
 * @property {string} airline
 * @property {string} airlineCode
 * @property {string} flightNumber
 * @property {string} departureTime  full ISO datetime, e.g. "2024-01-15T06:00:00"
 * @property {string} arrivalTime    full ISO datetime
 * @property {string} duration
 * @property {number} stops
 * @property {number} price
 * @property {string} currency
 */

/**
 * @typedef {Object} BackendHotel
 * @property {string} hotelId
 * @property {string} name
 * @property {string} location
 * @property {number} rating
 * @property {number} pricePerNight
 * @property {string[]} amenities
 * @property {string} imageUrl
 * @property {string} description
 */

/**
 * @typedef {Object} BackendActivity
 * @property {string} activityId
 * @property {string} name
 * @property {string} description
 * @property {string} duration
 * @property {string} type
 * @property {string} bestTime
 * @property {string} imageUrl
 * @property {string} category
 */

/**
 * @typedef {Object} BackendTransport
 * @property {string} transportId
 * @property {string} vehicleName
 * @property {string} type            "Normal" | "Premium" | "Luxury"
 * @property {string} vehicleType
 * @property {number} seatingCapacity
 * @property {number} pricePerDay
 * @property {string[]} features
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} ItineraryRequest
 * @property {Object} travelDetails
 * @property {string} travelDetails.name
 * @property {string} travelDetails.email
 * @property {string} travelDetails.origin
 * @property {string} travelDetails.destination
 * @property {string} travelDetails.travelDate
 * @property {string} travelDetails.returnDate
 * @property {number} travelDetails.adults
 * @property {number} travelDetails.children
 * @property {string[]} travelDetails.preferences
 * @property {string} [travelDetails.additionalNotes]
 * @property {BackendFlight} departureFlight
 * @property {BackendFlight} returnFlight
 * @property {string} seatPreference
 * @property {string} classPreference
 * @property {BackendHotel} selectedHotel
 * @property {string} roomType
 * @property {string} mealPlan
 * @property {BackendActivity[]} selectedActivities
 * @property {BackendTransport} selectedTransport
 */

/**
 * @typedef {Object} ItineraryResponse
 * @property {boolean} success
 * @property {string} message
 * @property {string} [pdfBase64]
 * @property {string} [itineraryId]
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
