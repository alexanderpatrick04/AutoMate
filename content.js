async function createSidebar() {
  if (document.getElementById("car-ai-sidebar")) return;

  const vin = findVIN();
  const price = findPrice();
  const mileage = findMileage();

  const backendAnalysis = await fetchVehicleAnalysis({
    vin,
    price,
    mileage
  });

  const vehicle = backendAnalysis?.vehicle || null;
  const recalls = backendAnalysis?.recalls || [];
  const safetyRatings = backendAnalysis?.safetyRatings || null;

  const data = {
    vin,
    price,
    mileage,

    vehicleName: vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : "Not found",

    titleStatus: findTitleStatus(),
    accidentHistory: findAccidentHistory(),
    ownerHistory: findOwnerHistory(),
    rentalUse: findRentalUse(),

    recalls,
    recallHTML: buildRecallHTML(recalls),

    nicbURL: vin
      ? `https://www.nicb.org/vincheck?vin=${vin}`
      : "https://www.nicb.org/vincheck",

    safetyRatings: {
      overall: safetyRatings?.OverallRating || "N/A",
      front: safetyRatings?.OverallFrontCrashRating || "N/A",
      side: safetyRatings?.OverallSideCrashRating || "N/A",
      rollover: safetyRatings?.RolloverRating || "N/A"
    }
  };

  const sidebar = document.createElement("div");
  sidebar.id = "car-ai-sidebar";
  sidebar.innerHTML = renderSidebarHTML(data);

  document.body.appendChild(sidebar);
  setupSidebarToggle();
  setupRecallButton();
}

function shouldRunExtension() {
  const url = window.location.href.toLowerCase();

  const isCarsDetailPage =
    url.includes("cars.com/vehicledetail/");

  return isCarsDetailPage || isLikelyCarListingPage();
}

function runWhenReady() {
  let attempts = 0;
  const maxAttempts = 10;

  const interval = setInterval(() => {
    attempts++;

    if (shouldRunExtension()) {
      clearInterval(interval);
      createSidebar();
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 1000);
}

runWhenReady();