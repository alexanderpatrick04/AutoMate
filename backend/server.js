const {
  decodeVIN,
  fetchRecalls,
  fetchSafetyRatings
} = require("./services/nhtsaService");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "AutoMate backend running"
  });
});

app.post("/analyze-vehicle", async (req, res) => {
  const { vin, price, mileage } = req.body;

  if (!vin) {
    return res.status(400).json({
      error: "VIN is required"
    });
  }

  try {
    const vehicle = await decodeVIN(vin);

    const recalls = vehicle
      ? await fetchRecalls(vehicle.year, vehicle.make, vehicle.model)
      : [];

    const safetyRatings = vehicle
      ? await fetchSafetyRatings(vehicle.year, vehicle.make, vehicle.model)
      : null;

    res.json({
      status: "success",
      received: {
        vin,
        price,
        mileage
      },
      vehicle,
      recalls,
      safetyRatings,
      marketComps: {
        status: "coming_soon"
      }
    });
  } catch (error) {
    console.error("Analyze vehicle error:", error);

    res.status(500).json({
      error: "Failed to analyze vehicle"
    });
  }
});

app.listen(PORT, () => {
  console.log(`AutoMate backend running on http://localhost:${PORT}`);
});