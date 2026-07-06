const flightService = require("../services/flight.services");

const searchFlights = async (req, res) => {
    console.log("BODY RECEIVED:", req.body);

    try {
        const flights = await flightService.searchFlights(req.body);

        res.status(200).json({
            success: true,
            data: flights
        });
    } catch (error) {
        console.log("ERROR:", error.message);
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    searchFlights
};