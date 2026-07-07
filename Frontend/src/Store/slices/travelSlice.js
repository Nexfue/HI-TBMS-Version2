import { createSlice } from '@reduxjs/toolkit';

// ====================== Initial State ======================
// Every field TravelDataService (Angular) used to expose, kept in one
// place so all five steps share a single source of truth.
const initialState = {
  travelDetails: null,

  // Flights Search Result
  flights: [],

  // Selected Flights
  departureFlight: null,
  returnFlight: null,
  multiCityFlights: [],

  // Hotel
  hotel: null,
  selectedRoom: null,

  // Activities
  selectedActivities: [],

  // Transport
  transport: null,
  selectedSeat: null,
  mealPlan: null,

  // PDF
  pdfBase64: null,
  itineraryId: null,

  hotelResults: [],
selectedHotel: null,
};

// ====================== Slice ======================

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    // ---------------- Travel ----------------
    setTravelDetails(state, action) {
      state.travelDetails = action.payload;
    },
    setFlights(state, action) {
  state.flights = action.payload;
},

    // ---------------- Flights ----------------
    // Each field is set independently — Step2Flights dispatches
    // setDepartureFlight / setReturnFlight separately, not as one
    // combined payload, so both stay standalone.
    setDepartureFlight(state, action) {
      state.departureFlight = action.payload;
    },
    setReturnFlight(state, action) {
      state.returnFlight = action.payload;
    },
    setMultiCityFlights(state, action) {
      state.multiCityFlights = action.payload;
    },
    setSelectedSeat(state, action) {
      state.selectedSeat = action.payload;
    },

    // ---------------- Hotel ----------------
    // Same reasoning: Step3Hotels dispatches these as two separate
    // actions (setHotel(hotel), setSelectedRoom(room)), so setHotel
    // takes the hotel object directly rather than a {hotel, room} shape.
    setHotel(state, action) {
      state.hotel = action.payload;
    },
    setSelectedRoom(state, action) {
      state.selectedRoom = action.payload;
    },

    // ---------------- Activities ----------------
    setSelectedActivities(state, action) {
      state.selectedActivities = action.payload;
    },

    // ---------------- Transport ----------------
    setTransport(state, action) {
      state.transport = action.payload;
    },
    setMealPlan(state, action) {
      state.mealPlan = action.payload;
    },

    // ---------------- Itinerary / PDF ----------------
    setItineraryResult(state, action) {
      state.pdfBase64 = action.payload.pdfBase64 ?? null;
      state.itineraryId = action.payload.itineraryId ?? null;
    },
    
    setHotelResults: (state, action) => {
    state.hotelResults = action.payload;
},

    setSelectedHotel: (state, action) => {
    state.selectedHotel = action.payload;
   },

    // ---------------- Reset ----------------
    resetTravel() {
      return initialState;
    },
  },
});

// ====================== Actions ======================

export const {
  setTravelDetails,
  setFlights,
  setDepartureFlight,
  setReturnFlight,
  setMultiCityFlights,
  setSelectedSeat,
  setHotel,
  setSelectedRoom,
  setSelectedActivities,
  setTransport,
  setMealPlan,
  setItineraryResult,
  resetTravel,
   setHotelResults,
    setSelectedHotel,
} = travelSlice.actions;

export default travelSlice.reducer;

// ====================== Basic Selectors ======================

export const selectTravelDetails = (state) => state.travel.travelDetails;
export const selectDepartureFlight = (state) => state.travel.departureFlight;
export const selectReturnFlight = (state) => state.travel.returnFlight;
export const selectMultiCityFlights = (state) => state.travel.multiCityFlights;
export const selectSelectedSeat = (state) => state.travel.selectedSeat;

export const selectHotel = (state) => state.travel.hotel;
export const selectSelectedRoom = (state) => state.travel.selectedRoom;

export const selectSelectedActivities = (state) => state.travel.selectedActivities;

export const selectTransport = (state) => state.travel.transport;
export const selectMealPlan = (state) => state.travel.mealPlan;

export const selectPdfBase64 = (state) => state.travel.pdfBase64;
export const selectItineraryId = (state) => state.travel.itineraryId;

// ====================== Derived Selectors ======================

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Nights between departure and return. One-way trips (no returnDate)
 * default to 1 night — this matters because hotel/transport costs are
 * priced per night and would otherwise silently zero out on every
 * one-way booking.
 */
export const selectNights = (state) => {
  const td = state.travel.travelDetails;
  if (!td?.departureDate) return 0;
  if (!td?.returnDate) return 1;

  const diff = new Date(td.returnDate) - new Date(td.departureDate);
  return Math.max(1, Math.round(diff / MS_PER_DAY));
};

export const selectPax = (state) => state.travel.travelDetails?.travelers ?? 1;

export const selectFlightCost = (state) => {
  const pax = selectPax(state);
  let total = 0;
  if (state.travel.departureFlight) total += state.travel.departureFlight.price * pax;
  if (state.travel.returnFlight) total += state.travel.returnFlight.price * pax;
  return total;
};
export const selectFlights = (state) => state.travel.flights;

export const selectHotelCost = (state) => {
  if (!state.travel.hotel) return 0;
  return (
    (state.travel.hotel.pricePerNight + (state.travel.selectedRoom?.extraCharge ?? 0)) *
    selectNights(state)
  );
};

export const selectActivitiesCost = (state) =>
  state.travel.selectedActivities.reduce((sum, activity) => sum + activity.price, 0);

export const selectTransportCost = (state) => {
  if (!state.travel.transport) return 0;
  return state.travel.transport.pricePerDay * selectNights(state);
};
export const selectHotels = (state) => state.travel.hotelResults;

export const selectSelectedHotel = (state) =>
    state.travel.selectedHotel;

export const selectTotalCost = (state) =>
  selectFlightCost(state) + selectHotelCost(state) + selectActivitiesCost(state) + selectTransportCost(state);