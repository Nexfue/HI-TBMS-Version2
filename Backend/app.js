const express = require("express");
const cors = require("cors");
const flightRoutes = require("./routes/flight.routes");
const hotelRoutes = require("./routes/hotel.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
})) 

app.use("/api/flights", flightRoutes);
app.use("/api/hotels", hotelRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Travel Backend API Running 🚀"
    });
});

module.exports = app;