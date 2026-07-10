const axios = require("axios");

const searchAirports = async (req, res) => {
    try {
        const { search } = req.query;

        const response = await axios.get(
            "https://airlabs.co/api/v9/airports",
            {
                params: {
                    api_key: process.env.AIRLABS_API_KEY,
                    search,
                },
            }
        );

        res.status(200).json(response.data.response);
    } catch (error) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
            message: "Failed to fetch airports",
        });
    }
};

module.exports = {
    searchAirports,
};