// -----------------------------------------------------
// FULL POSTAL → EXACT COORDS (optional to fill later)
// -----------------------------------------------------
export const fullPostalCoords: Record<string, [number, number]> = {};

// -----------------------------------------------------
// FSA → BASE COORDS
// -----------------------------------------------------
export const fsaCoords: Record<string, [number, number]> = {
  "N2P": [43.4108, -80.4220],
  "N2H": [43.4516, -80.4921],
  "N2G": [43.4457, -80.4860],
  "N2M": [43.4343, -80.4953],
  "N2E": [43.4287, -80.4744],
  "N2C": [43.4241, -80.4651],
  "N2B": [43.4662, -80.4681],
  "N2A": [43.4594, -80.4361],
  "N2K": [43.4883, -80.4637],
  "N2L": [43.4743, -80.5333],
  "N2T": [43.4490, -80.5584],
  "N2V": [43.4984, -80.5496],
  "N2J": [43.4721, -80.5222],
};

// -----------------------------------------------------
// CITY → COORDS
// -----------------------------------------------------
export const cityCoords: Record<string, [number, number]> = {
  "Kitchener": [43.4516, -80.4925],
  "Waterloo": [43.4643, -80.5204],
  "Cambridge": [43.3894, -80.3153],
  "Guelph": [43.5448, -80.2482],
};

// -----------------------------------------------------
// Extract Canadian postal code from a string
// -----------------------------------------------------
export function extractPostal(location: string | null): string | null {
  if (!location) return null;
  const match = location.match(/[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d/);
  return match ? match[0].replace(/\s+/g, "").toUpperCase() : null;
}

// -----------------------------------------------------
// SUB-FSA OFFSET (prevents slight stacking)
// -----------------------------------------------------
function subFsaOffset(code: string): [number, number] {
  if (code.length < 4) return [0, 0];
  const digit = code[3];
  if (!/[0-9]/.test(digit)) return [0, 0];

  const n = parseInt(digit);

  const latOffset = (n - 5) * 0.00015;
  const lngOffset = (5 - n) * 0.00015;

  return [latOffset, lngOffset];
}

// -----------------------------------------------------
// SMART GEOCODER
// -----------------------------------------------------
export function smartLocalGeocode(
  postal: string | null,
  city: string | null
): [number, number] {
  if (postal) {
    const clean = postal.replace(/\s+/g, "").toUpperCase();

    if (fullPostalCoords[clean]) return fullPostalCoords[clean];

    const fsa = clean.substring(0, 3);
    const base = fsaCoords[fsa];
    if (base) {
      const [lat, lon] = base;
      const [latO, lonO] = subFsaOffset(clean);
      return [lat + latO, lon + lonO];
    }
  }

  if (city && cityCoords[city]) return cityCoords[city];

  return [43.4723, -80.5449];
}

