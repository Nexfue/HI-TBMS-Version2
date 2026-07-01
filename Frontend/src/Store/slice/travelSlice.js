import { createSlice } from '@reduxjs/toolkit';

// Shape mirrors the Angular TravelDataService fields.
const initialState = {
  travelDetails: null,        // { name, email, from, to, departureDate, returnDate, travelers, travelClass, tripType, multiCitySegments? }
  departureFlight: null,      // { id, airline, flightNo, departure, arrival, duration, price, stops }
  returnFlight: null,
  multiCityFlights: [],       // Flight[] — one selection per leg, in segment order
  hotel: null,                // { name, location, pricePerNight, rating, reviewCount }
  selectedRoom: null,         // { name, description, extraCharge }
  selectedActivities: [],     // [{ name, type, duration, price, icon }]
  transport: null,            // { name, vehicleType, category, pricePerDay, icon }
  selectedSeat: null,
  pdfBase64: null,
};

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    setTravelDetails: (state, action) => {
      state.travelDetails = action.payload;
    },
    setFlights: (state, action) => {
      state.departureFlight = action.payload.departure ?? null;
      state.returnFlight = action.payload.return ?? null;
    },
    setMultiCityFlights: (state, action) => {
      state.multiCityFlights = action.payload;
    },
    setHotel: (state, action) => {
      state.hotel = action.payload.hotel ?? null;
      state.selectedRoom = action.payload.room ?? null;
    },
    setActivities: (state, action) => {
      state.selectedActivities = action.payload;
    },
    setTransport: (state, action) => {
      state.transport = action.payload;
    },
    setSelectedSeat: (state, action) => {
      state.selectedSeat = action.payload;
    },
    setPdfBase64: (state, action) => {
      state.pdfBase64 = action.payload;
    },
    resetTravel: () => initialState,
  },
});

export const {
  setTravelDetails,
  setFlights,
  setMultiCityFlights,
  setHotel,
  setActivities,
  setTransport,
  setSelectedSeat,
  setPdfBase64,
  resetTravel,
} = travelSlice.actions;

export default travelSlice.reducer;

// ── Selectors (replace the Angular getters) ──────────────────────────────
const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

export const selectNights = (state) => {
  const td = state.travel.travelDetails;
  if (!td?.departureDate || !td?.returnDate) return 0;
  const diff = new Date(td.returnDate) - new Date(td.departureDate);
  return Math.max(0, Math.round(diff / MS_PER_NIGHT));
};

export const selectPax = (state) => state.travel.travelDetails?.travelers ?? 1;

export const selectFlightCost = (state) => {
  const { departureFlight, returnFlight } = state.travel;
  const pax = selectPax(state);
  let c = 0;
  if (departureFlight) c += departureFlight.price * pax;
  if (returnFlight) c += returnFlight.price * pax;
  return c;
};

export const selectHotelCost = (state) => {
  const { hotel, selectedRoom } = state.travel;
  if (!hotel) return 0;
  const nights = selectNights(state);
  return (hotel.pricePerNight + (selectedRoom?.extraCharge ?? 0)) * nights;
};

export const selectActivitiesCost = (state) =>
  state.travel.selectedActivities.reduce((sum, a) => sum + a.price, 0);

export const selectTransportCost = (state) => {
  const { transport } = state.travel;
  if (!transport) return 0;
  return transport.pricePerDay * selectNights(state);
};

export const selectTotalCost = (state) =>
  selectFlightCost(state) +
  selectHotelCost(state) +
  selectActivitiesCost(state) +
  selectTransportCost(state);
