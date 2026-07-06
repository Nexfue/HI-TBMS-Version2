import api from "./axios";

export const searchFlights = (data) => {
    return api.post("/flights/search", data);
};