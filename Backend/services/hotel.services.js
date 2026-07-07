const axios = require("axios");

const searchHotels = async (searchData) => {
  const {
    destination,
    checkInDate,
    checkOutDate,
    adults = 1,
  } = searchData;

  try {
    const params = {
      engine: "google_hotels",
      q: destination,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults,
      currency: "INR",
      gl: "in",
      hl: "en",
      api_key: process.env.SERP_API_KEY,
    };

    const response = await axios.get(
      "https://serpapi.com/search",
      { params }
    );

    console.log("Keys:", Object.keys(response.data));

    const hotels =
      response.data.properties?.map((hotel) => ({
        name: hotel.name,
        image: hotel.images?.[0]?.thumbnail || "",
        rating: hotel.overall_rating,
        reviews: hotel.reviews,
        pricePerNight: hotel.rate_per_night?.lowest || 0,
        totalPrice: hotel.total_rate?.lowest || 0,
        type: hotel.type,
        amenities: hotel.amenities || [],
        location: hotel.address,
      })) || [];

    return hotels;
  } catch (error) {
    console.log("========== ERROR ==========");
    console.log(error.response?.data);
    console.log(error.response?.status);
    console.log(error.message);
    console.log("===========================");

    throw error;
  }
};

module.exports = {
  searchHotels,
};