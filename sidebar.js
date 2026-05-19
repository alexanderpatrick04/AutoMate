function renderTile(title, content) {
  return `
    <div class="AutoMate-tile">
      <h3>${title}</h3>
      ${content}
    </div>
  `;
}

function buildRecallHTML(recalls) {
  if (!recalls || recalls.length === 0) {
    return "<p>No recalls found.</p>";
  }

  const initialRecalls = recalls.slice(0, 3);
  const extraRecalls = recalls.slice(3);

  return `
    <div id="recall-list">
      ${initialRecalls.map(recall => `
        <div class="recall-item">
          <strong>${recall.Component || "Recall"}</strong>
          <p>${recall.Summary || "No summary available."}</p>
        </div>
      `).join("")}

      <div id="extra-recalls" style="display: none;">
        ${extraRecalls.map(recall => `
          <div class="recall-item">
            <strong>${recall.Component || "Recall"}</strong>
            <p>${recall.Summary || "No summary available."}</p>
          </div>
        `).join("")}
      </div>

      ${
        extraRecalls.length > 0
          ? `<button id="show-more-recalls">Show ${extraRecalls.length} More</button>`
          : ""
      }
    </div>
  `;
}

function getConditionBadge(type, value) {
  const text = String(value || "").toLowerCase();

  if (type === "title") {
    if (text.includes("clean")) return badge("✅", "good");
    if (text.includes("salvage") || text.includes("rebuilt")) return badge("⚠️", "bad");
  }

  if (type === "accidents") {
    if (text.includes("0") || text.includes("no accidents")) {
      return badge("✅", "good");
    }

    if (text.includes("accident")) {
      return badge("⚠️", "warn");
    }
  }

  if (type === "owners") {
    const numOwners = parseInt(text.match(/\d+/)?.[0], 10);

    if (!numOwners) return badge("❔", "neutral");
    if (numOwners <= 2) return badge("✅", "good");
    if (numOwners <= 4) return badge("⚠️", "warn");

    return badge("🚩", "bad");
  }

  if (type === "rental") {
    if (text.includes("not found")) {
      return badge("✅", "good");
    }

    if (text.includes("rental") || text.includes("fleet")) {
      return badge("🚩", "bad");
    }
  }

  return badge("❔", "neutral");
}

function getSafetyBadge(type, value) {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return badge("❔", "neutral");
  }

  // Crash safety ratings
  if (type === "safety") {
    if (num >= 4) return badge("✅", "good");
    if (num === 3) return badge("⚠️", "warn");
    return badge("🚩", "bad");
  }

  // Recall counts
  if (type === "recalls") {
    if (num === 0) return badge("✅", "good");
    if (num >= 1 && num <= 3) return badge("⚠️", "warn");
    return badge("🚩", "bad");
  }

  return badge("❔", "neutral");
}

function badge(icon, status) {
  return `
    <span class="condition-badge ${status}">
      ${icon}
    </span>
  `;
}

function renderSidebarHTML(data) {
  return `
    <div id="AutoMate-header">
      <h2>AutoMate</h2>
      <button id="AutoMate-toggle">−</button>
    </div>

    <div id="AutoMate-content">
      ${renderTile("Vehicle", `
        <p><strong>VIN:</strong> ${data.vin || "Not found"}</p>
        <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
        <p><strong>Price:</strong> ${data.price}</p>
        <p><strong>Mileage:</strong> ${data.mileage}</p>
      `)}

      ${renderTile("Vehicle Condition", `
        <p class="condition-row">
            <strong>Title:</strong> 
            <span>${data.titleStatus}</span>
            ${getConditionBadge("title", data.titleStatus)}
        </p>

        <p class="condition-row">
            <strong>Accidents:</strong> 
            <span>${data.accidentHistory}</span>
            ${getConditionBadge("accidents", data.accidentHistory)}
        </p>

        <p class="condition-row">
            <strong>Owners:</strong> 
            <span>${data.ownerHistory}</span>
            ${getConditionBadge("owners", data.ownerHistory)}
        </p>

        <p class="condition-row">
            <strong>Rental/Fleet:</strong> 
            <span>${data.rentalUse}</span>
            ${getConditionBadge("rental", data.rentalUse)}
        </p>

        <a id="nicb-link" href="${data.nicbURL}" target="_blank">
            Run NICB Theft/Salvage Check
        </a>
    `)}

      ${renderTile("Safety & Recalls", `
        <p class="condition-row">
            <strong>Overall:</strong>
            <span>${data.safetyRatings.overall} / 5</span>
            ${getSafetyBadge("safety", data.safetyRatings.overall)}
        </p>

        <p class="condition-row">
            <strong>Frontal:</strong>
            <span>${data.safetyRatings.front} / 5</span>
            ${getSafetyBadge("safety", data.safetyRatings.front)}
        </p>

        <p class="condition-row">
            <strong>Side:</strong>
            <span>${data.safetyRatings.side} / 5</span>
            ${getSafetyBadge("safety", data.safetyRatings.side)}
        </p>

        <p class="condition-row">
            <strong>Rollover:</strong>
            <span>${data.safetyRatings.rollover} / 5</span>
            ${getSafetyBadge("safety", data.safetyRatings.rollover)}
        </p>

        <hr>

        <p class="condition-row">
            <strong>Potential Recalls:</strong>
            <span>${data.recalls.length}</span>
            ${getSafetyBadge("recalls", data.recalls.length)}
        </p>

        ${data.recallHTML}
    `)}

      ${renderTile("Market Comps", `
        <p class="placeholder">Coming soon!</p>
      `)}
    </div>
  `;
}

function setupSidebarToggle() {
  const sidebar = document.getElementById("car-ai-sidebar");
  const toggleButton = document.getElementById("AutoMate-toggle");
  const content = document.getElementById("AutoMate-content");

  if (!sidebar || !toggleButton || !content) return;

  let minimized = false;

  toggleButton.addEventListener("click", () => {
    minimized = !minimized;

    if (minimized) {
      content.style.display = "none";
      sidebar.style.width = "140px";
      toggleButton.textContent = "+";
    } else {
      content.style.display = "block";
      sidebar.style.width = "320px";
      toggleButton.textContent = "−";
    }
  });
}

function setupRecallButton() {
  const showMoreButton = document.getElementById("show-more-recalls");

  if (!showMoreButton) return;

  showMoreButton.addEventListener("click", () => {
    const extraRecallsDiv = document.getElementById("extra-recalls");

    if (!extraRecallsDiv) return;

    extraRecallsDiv.style.display = "block";
    showMoreButton.style.display = "none";
  });
}