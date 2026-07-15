const express = require("express");
const router = express.Router();

const flightController = require("../controllers/flight.controllers");
const validateFlightSearch = require("../validations/flight.validation");

router.post(
    "/search",
    validateFlightSearch,
    flightController.searchFlights
);
router.post(
    "/return-search",
    flightController.searchReturnFlights
);

module.exports = router;