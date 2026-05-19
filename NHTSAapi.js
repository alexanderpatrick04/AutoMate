async function decodeVIN(vin) {
  if (!vin) return null;

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const vehicle = data.Results?.[0];

    return {
      year: vehicle.ModelYear,
      make: vehicle.Make,
      model: vehicle.Model
    };
  } catch (error) {
    console.error("VIN decode error:", error);
    return null;
  }
}

async function fetchRecalls(year, make, model) {
  if (!year || !make || !model) return [];

  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error("Recall fetch error:", error);
    return [];
  }
}

async function fetchSafetyRatings(year, make, model) {
  if (!year || !make || !model) return null;

  try {
    // Step 1: Get vehicle ID
    const searchURL =
      `https://api.nhtsa.gov/SafetyRatings/modelyear/${encodeURIComponent(year)}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}?format=json`;

    const searchResponse = await fetch(searchURL);
    const searchData = await searchResponse.json();

    const vehicleId = searchData.Results?.[0]?.VehicleId;

    if (!vehicleId) return null;

    // Step 2: Get ratings
    const ratingURL =
      `https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleId}?format=json`;

    const ratingResponse = await fetch(ratingURL);
    const ratingData = await ratingResponse.json();

    return ratingData.Results?.[0] || null;

  } catch (error) {
    console.error("Safety rating fetch error:", error);
    return null;
  }
}