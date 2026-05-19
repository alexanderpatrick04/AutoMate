
function findVIN() {
  const text = document.body.innerText;
  const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
  const matches = text.match(vinRegex);
  return matches ? matches[0] : null;
}

function findPrice() {
  const text = document.body.innerText;
  const priceRegex = /\$[\d,]{4,}/g;
  const matches = text.match(priceRegex);
  return matches ? matches[0] : "Not found";
}

function findMileage() {
  const text = document.body.innerText;

  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase() === "mileage") {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const possibleMileage = lines[j];

        if (/^[\d,]+$/.test(possibleMileage)) {
          return possibleMileage + " miles";
        }
      }
    }
  }

  const mileageMatches = [...text.matchAll(/\b[\d,]+\s?(miles|mi\.?)\b/gi)];

  for (const match of mileageMatches) {
    const fullMatch = match[0];
    const afterMatch = text
      .slice(match.index, match.index + fullMatch.length + 20)
      .toLowerCase();

    if (
      !afterMatch.includes("away") &&
      !afterMatch.includes("from you") &&
      !afterMatch.includes("distance")
    ) {
      const number = parseInt(fullMatch.replace(/[^\d]/g, ""), 10);

      if (number > 500) {
        return fullMatch;
      }
    }
  }

  return "Not found";
}

function findTitleStatus() {
  const text = document.body.innerText.toLowerCase();

  if (text.includes("clean title")) return "Clean";
  if (text.includes("salvage title")) return "Salvage";
  if (text.includes("rebuilt title")) return "Rebuilt";

  return "Not found";
}

function findAccidentHistory() {
  const text = document.body.innerText.toLowerCase();

  if (text.includes("0 accidents reported") || text.includes("no accidents reported")) {
    return "None reported";
  }

  const accidentMatch = text.match(/\b\d+\s+accidents?\s+reported\b/i);
  if (accidentMatch) {
    return accidentMatch[0];
  }

  if (text.includes("accident reported")) {
    return "Accident reported";
  }

  return "Not found";
}

function findOwnerHistory() {
  const text = document.body.innerText;

  const ownerMatch = text.match(/\b\d+\s+previous\s+owners?\b/i);
  if (ownerMatch) {
    return ownerMatch[0];
  }

  const ownerAltMatch = text.match(/\b\d+\s+owners?\b/i);
  if (ownerAltMatch) {
    return ownerAltMatch[0];
  }

  return "Not found";
}

function findRentalUse() {
  const text = document.body.innerText.toLowerCase();

  if (text.includes("rental use")) return "Rental use reported";
  if (text.includes("previous rental vehicle")) return "Rental use reported";
  if (text.includes("fleet use")) return "Fleet use reported";

  return "Not found";
}

function isLikelyCarListingPage() {
  const text = document.body.innerText.toLowerCase();

  const hasVIN = findVIN();
  const hasPrice = /\$[\d,]{4,}/.test(text);
  const hasMileage = text.includes("mileage") || text.includes("miles");

  const carKeywords = [
    "vin",
    "mileage",
    "drivetrain",
    "transmission",
    "engine",
    "exterior color",
    "interior color",
    "clean title",
    "accidents reported",
    "previous owners"
  ];

  const keywordCount = carKeywords.filter(keyword => text.includes(keyword)).length;

  return hasVIN && hasPrice && hasMileage && keywordCount >= 3;
}