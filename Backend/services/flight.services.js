const axios = require("axios");

const mapFlights = (response) => {
  const flightList =
    response.data.best_flights ||
    response.data.other_flights ||
    [];

  return flightList.map((flight) => {
    const firstFlight = flight.flights[0];
    const lastFlight = flight.flights[flight.flights.length - 1];

    return {
      airline: firstFlight.airline,
      airlineLogo: firstFlight.airline_logo,
      flightNumber: firstFlight.flight_number,

      departureAirport: firstFlight.departure_airport.id,
      departureAirportName: firstFlight.departure_airport.name,
      departureTime: firstFlight.departure_airport.time,

      arrivalAirport: lastFlight.arrival_airport.id,
      arrivalAirportName: lastFlight.arrival_airport.name,
      arrivalTime: lastFlight.arrival_airport.time,

      duration: flight.total_duration,
      price: flight.price,
      travelClass: firstFlight.travel_class,
      stops: flight.flights.length - 1,
      layovers: flight.layovers || [],
      bookingToken: flight.booking_token,
    };
  });
};

const searchFlights = async (searchData) => {
  const {
    from,
    to,
    departureDate,
    returnDate,
    tripType,
    adults,
    children,
    travelClass,
  } = searchData;

  const travelClassMap = {
    economy: 1,
    "premium economy": 2,
    business: 3,
    first: 4,
  };

  const commonParams = {
    engine: "google_flights",
    adults,
    children,
    travel_class: travelClassMap[travelClass.toLowerCase()] || 1,
    currency: "INR",
    hl: "en",
    api_key: process.env.SERP_API_KEY,
  };

  // ONE WAY
  if (tripType === "one-way") {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        ...commonParams,
        departure_id: from,
        arrival_id: to,
        outbound_date: departureDate,
        type: 2,
      },
    });

    return mapFlights(response);
  }

  // ROUND TRIP

  const onwardResponse = await axios.get("https://serpapi.com/search", {
    params: {
      ...commonParams,
      departure_id: from,
      arrival_id: to,
      outbound_date: departureDate,
      type: 2,
    },
  });

  const returnResponse = await axios.get("https://serpapi.com/search", {
    params: {
      ...commonParams,
      departure_id: to,
      arrival_id: from,
      outbound_date: returnDate,
      type: 2,
    },
  });

  const onwardFlights = mapFlights(onwardResponse);
const returnFlights = mapFlights(returnResponse);

const roundTripFlights = [];

const count = Math.min(
  onwardFlights.length,
  returnFlights.length
);

for (let i = 0; i < count; i++) {

  roundTripFlights.push({

    onward: onwardFlights[i],

    return: returnFlights[i],

    price:
      onwardFlights[i].price +
      returnFlights[i].price,

    lockPrice:
      onwardFlights[i].price +
      returnFlights[i].price,

    bookingToken:
      `${onwardFlights[i].bookingToken}-${returnFlights[i].bookingToken}`,

    amenities: [],

    offerBadge: "",
  });

}

return roundTripFlights;
};

module.exports = {
  searchFlights,
};