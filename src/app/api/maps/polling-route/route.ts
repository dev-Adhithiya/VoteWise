/**
 * ==========================================================================
 * GOOGLE MAPS API ROUTE — Find Polling Locations & Route
 * ==========================================================================
 * Endpoint: POST /api/maps/polling-route
 * Uses browser geolocation to find nearest polling station.
 * Returns address, distance, and Google Maps navigation URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateDistance } from "@/lib/maps-utils";

interface PollingLocationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  travelTime?: string;
  website?: string;
  phone?: string;
  placeId?: string;
  mapsUrl?: string;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, address, countryCode = "US" } = body;

    // Validate required fields
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates. Provide latitude and longitude." },
        { status: 400 }
      );
    }

    // Get Google Maps API key
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!mapsApiKey) {
      console.error("GOOGLE_MAPS_API_KEY not set in environment");
      return NextResponse.json(
        { error: "Maps API not configured" },
        { status: 500 }
      );
    }

    // Call Google Places API to find polling locations
    const query = "polling station";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=${encodeURIComponent(query)}&key=${mapsApiKey}`;

    const placesResponse = await fetch(url);
    if (!placesResponse.ok) {
      throw new Error("Google Places API error");
    }

    const placesData = (await placesResponse.json()) as {
      results?: Array<{
        name: string;
        formatted_address?: string;
        vicinity?: string;
        geometry: { location: { lat: number; lng: number } };
        rating?: number;
        place_id?: string;
        website?: string;
        formatted_phone_number?: string;
      }>;
    };

    if (!placesData.results || placesData.results.length === 0) {
      // Fallback: Return a generic polling location message
      return NextResponse.json({
        success: true,
        locations: [],
        message: "No polling stations found nearby. Contact your local election authority.",
        userLocation: { latitude, longitude },
        mapsSearchUrl: `https://www.google.com/maps/search/polling+station/@${latitude},${longitude},15z`,
      });
    }

    // Process results and calculate distances
    const locations: PollingLocationResult[] = placesData.results
      .slice(0, 5) // Get top 5 nearest
      .map((place) => {
        const placeDistance = calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        const address = place.formatted_address || place.vicinity || place.name;

        return {
          name: place.name,
          address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          distance: Math.round(placeDistance * 100) / 100, // Round to 2 decimals
          placeId: place.place_id,
          website: place.website,
          phone: place.formatted_phone_number,
          mapsUrl: place.place_id
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        };
      });

    // Get nearest location
    const nearest = locations[0];

    // Create Google Maps Universal URL for navigation
    const destination = nearest.address
      ? encodeURIComponent(nearest.address)
      : `${nearest.latitude},${nearest.longitude}`;
    const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

    return NextResponse.json({
      success: true,
      nearest: {
        ...nearest,
        navigationUrl,
      },
      allLocations: locations,
      userLocation: {
        latitude,
        longitude,
      },
      countryCode,
    });
  } catch (error) {
    console.error("Maps API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
