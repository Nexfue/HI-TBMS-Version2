const hotelService = require("../services/hotel.services");

const searchHotels = async (req, res) => {
  try {
    const hotels = await hotelService.searchHotels(req.body);

    res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  searchHotels,
};