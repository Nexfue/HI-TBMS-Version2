const axios = require("axios");

const searchFlights = async (searchData) => {
    const {
        from,
        to,
        departureDate,
        returnDate,
        tripType,
        adults,
        children,
        travelClass
    } = searchData;

    try {
        // Google Flights class mapping
        const travelClassMap = {
            economy: 1,
            "premium economy": 2,
            business: 3,
            first: 4
        };

        const params = {
            engine: "google_flights",
            departure_id: from,
            arrival_id: to,
            outbound_date: departureDate,
            type: tripType === "round-trip" ? 1 : 2, // 1 = Round Trip, 2 = One Way
            adults,
            children,
            travel_class: travelClassMap[travelClass.toLowerCase()] || 1,
            currency: "INR",
            hl: "en",
            api_key: process.env.SERP_API_KEY
        };

        if (tripType === "round-trip") {
            params.return_date = returnDate;
        }

        const response = await axios.get("https://serpapi.com/search", {
            params
        });
console.log("Keys:", Object.keys(response.data));

const flightList =
  response.data.best_flights ||
  response.data.other_flights ||
  [];

const flights = flightList.map((flight) => {
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

        bookingToken: flight.booking_token
    };
});

return flights;

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
    searchFlights
};