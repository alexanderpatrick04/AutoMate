async function fetchVehicleAnalysis({ vin, price, mileage }) {
  try {
    const response = await fetch("http://localhost:3000/analyze-vehicle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vin,
        price,
        mileage
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    console.log("AutoMate backend analysis:", data);

    return data;
  } catch (error) {
    console.error("AutoMate backend request failed:", error);
    return null;
  }
}