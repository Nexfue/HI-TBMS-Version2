const express = require("express");
const router = express.Router();

const hotelController = require("../controllers/hotel.controllers");

router.post("/search", hotelController.searchHotels);

module.exports = router;