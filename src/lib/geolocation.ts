/**
 * ==========================================================================
 * GEOLOCATION UTILITIES — Location Detection & Country Logic
 * ==========================================================================
 * Handles browser geolocation, IP-based fallback, and country detection.
 * Used to customize features based on user's location (US vs UK vs India, etc.)
 */

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  country: string;
  countryCode: string;
  city?: string;
  timestamp: number;
}

export type CountryCode = "US" | "UK" | "IN" | "UNKNOWN";

export interface RegionRequirements {
  idTypes: string[];
  checklistItems: string[];
  electionCycle: string;
}

/**
 * Region-specific voter requirements
 * Prevents asking for sensitive ID numbers (only types/categories)
 */
export const REGION_REQUIREMENTS: Record<CountryCode, RegionRequirements> = {
  US: {
    idTypes: [
      "Driver's License",
      "Passport",
      "State ID",
      "Military ID",
      "Tribal ID",
      "Utility Bill (address proof)",
    ],
    checklistItems: [
      "✓ Verify voter registration status",
      "✓ Bring valid photo ID",
      "✓ Know your polling location",
      "✓ Check polling hours (7 AM - 8 PM in most states)",
      "✓ Prepare for any wait times (early vote or mail-in option)",
      "✓ Bring a pen for write-in candidates",
      "✓ Research ballot measures beforehand",
    ],
    electionCycle: "Presidential elections: November, even-numbered years",
  },
  UK: {
    idTypes: [
      "Passport",
      "Voter Authority Certificate (provided by local council)",
      "Driving Licence",
      "Proof of residence",
    ],
    checklistItems: [
      "✓ Check electoral register (check online or contact council)",
      "✓ Obtain Voter Authority Certificate (if needed)",
      "✓ Know your polling station address",
      "✓ Bring photo ID (required)",
      "✓ Note voting times (7 AM - 10 PM)",
      "✓ Bring pen for ballot",
      "✓ Register to vote by deadline (typically 11:59 PM)",
    ],
    electionCycle: "General elections variable, local elections May (typically)",
  },
  IN: {
    idTypes: [
      "EPIC (Electoral Photo ID Card)",
      "Aadhaar Card",
      "Passport",
      "Driving License",
      "Ration Card",
      "Voter Slip",
    ],
    checklistItems: [
      "✓ Check voter rolls (Electoral Commission website)",
      "✓ Carry EPIC/Aadhaar or approved ID",
      "✓ Find your assigned polling booth",
      "✓ Verify election date and timing",
      "✓ Arrive early to avoid queues",
      "✓ Bring pen (officials provide ballot)",
      "✓ Check for any voter assistance programs",
    ],
    electionCycle: "General elections every 5 years (February-May typically)",
  },
  UNKNOWN: {
    idTypes: ["Valid Photo ID", "Proof of Residence"],
    checklistItems: [
      "✓ Verify voter registration",
      "✓ Bring valid photo ID",
      "✓ Know polling location",
      "✓ Check voting hours",
      "✓ Research local ballot measures",
    ],
    electionCycle: "Check local election authority for dates",
  },
};

/**
 * Get user's location using browser Geolocation API
 * Returns coordinates and country info
 */
export async function getBrowserLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Reverse geocode to get country
        const country = await reverseGeocodeToCountry(latitude, longitude);

        resolve({
          latitude,
          longitude,
          accuracy,
          country: country.name,
          countryCode: country.code,
          timestamp: Date.now(),
        });
      },
      (error) => {
        console.warn("Browser geolocation error:", error.message);
        resolve(null);
      },
      {
        timeout: 5000,
        enableHighAccuracy: false, // Don't need high accuracy for voting
      }
    );
  });
}

/**
 * Fallback: Get location using IP address
 * Requires IP_GEOLOCATION_API_KEY in .env.local
 */
export async function getIPLocation(): Promise<Location | null> {
  try {
    // Using ip-api.com free tier (no key required for development)
    const response = await fetch(
      "https://ip-api.com/json/?fields=status,lat,lon,country,countryCode,city",
      {
      headers: { "User-Agent": "VoteWise-AI-App" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status === "success") {
      return {
        latitude: data.lat,
        longitude: data.lon,
        country: data.country,
        countryCode: normalizeCountryCode(data.countryCode),
        city: data.city,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.warn("IP geolocation error:", error);
  }

  return null;
}

/**
 * Reverse geocode coordinates to country
 * Using open-source Nominatim (OpenStreetMap)
 */
async function reverseGeocodeToCountry(
  latitude: number,
  longitude: number
): Promise<{ name: string; code: CountryCode }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      { headers: { "User-Agent": "VoteWise-AI-App" } }
    );

    if (!response.ok) return { name: "Unknown", code: "UNKNOWN" };

    const data = await response.json();
    const countryName = data.address?.country || "Unknown";
    const countryCode = normalizeCountryCode(data.address?.country_code || "");

    return { name: countryName, code: countryCode };
  } catch (error) {
    console.warn("Reverse geocoding error:", error);
    return { name: "Unknown", code: "UNKNOWN" };
  }
}

/**
 * Normalize country codes to supported regions
 */
export function normalizeCountryCode(code: string): CountryCode {
  const upper = code.toUpperCase();

  const mapping: Record<string, CountryCode> = {
    US: "US",
    USA: "US",
    GB: "UK",
    UK: "UK",
    IN: "IN",
    IND: "IN",
  };

  return mapping[upper] || "UNKNOWN";
}

/**
 * Get user's location with fallback chain:
 * 1. Browser Geolocation API
 * 2. IP-based geolocation
 * 3. Default to UNKNOWN
 */
export async function getUserLocation(): Promise<Location> {
  // Try browser geolocation first
  const browserLocation = await getBrowserLocation();
  if (browserLocation) {
    console.log(`📍 Browser location: ${browserLocation.country} (${browserLocation.countryCode})`);
    return browserLocation;
  }

  // Fallback to IP geolocation
  const ipLocation = await getIPLocation();
  if (ipLocation) {
    console.log(`📍 IP location: ${ipLocation.country} (${ipLocation.countryCode})`);
    return ipLocation;
  }

  // Default fallback
  console.warn("⚠️ Could not determine location, defaulting to UNKNOWN");
  return {
    latitude: 0,
    longitude: 0,
    country: "Unknown",
    countryCode: "UNKNOWN",
    timestamp: Date.now(),
  };
}

/**
 * Get region requirements for checklist/ID types
 */
export function getRegionRequirements(countryCode: CountryCode): RegionRequirements {
  return REGION_REQUIREMENTS[countryCode] || REGION_REQUIREMENTS.UNKNOWN;
}

/**
 * Format location for display
 */
export function formatLocation(location: Location): string {
  if (location.city) {
    return `${location.city}, ${location.country}`;
  }
  return location.country;
}
