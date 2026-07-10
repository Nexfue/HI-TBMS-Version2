const express = require("express");

const router = express.Router();

const {
    searchAirports,
} = require("../controllers/airport.controllers");

router.get("/search", searchAirports);

module.exports = router;