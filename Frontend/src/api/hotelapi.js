import api from "./axios";

export const searchHotels = (data) => {
  return api.post("/hotels/search", data);
};