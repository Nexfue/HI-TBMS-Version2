const validateFlightSearch = (req, res, next) => {
    const {
        from,
        to,
        departureDate,
        tripType,
        adults,
        children,
        infants,
        travelClass
    } = req.body;

    if (!from || from.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Source airport is required."
        });
    }

    if (!to || to.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Destination airport is required."
        });
    }

    if (!departureDate) {
        return res.status(400).json({
            success: false,
            message: "Departure date is required."
        });
    }

    if (!tripType) {
        return res.status(400).json({
            success: false,
            message: "Trip type is required."
        });
    }

    if (!adults || adults < 1) {
        return res.status(400).json({
            success: false,
            message: "At least one adult passenger is required."
        });
    }

    if (children < 0 || infants < 0) {
        return res.status(400).json({
            success: false,
            message: "Passenger count cannot be negative."
        });
    }

    const validClasses = [
        "economy",
        "premium economy",
        "business",
        "first"
    ];

    if (!validClasses.includes(travelClass.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: "Invalid travel class."
        });
    }

    next();
};

module.exports = validateFlightSearch;