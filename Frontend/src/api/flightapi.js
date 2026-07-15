import api from "./axios";

export const searchFlights = (data) => {
    return api.post("/flights/search", data);
};

export const searchReturnFlightsApi = (bookingToken) => {
  return api.post("/flights/return-search", {
    bookingToken,
  });
}; 