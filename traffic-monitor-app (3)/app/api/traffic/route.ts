import { NextResponse } from "next/server"

function generateTimeCode(offsetMinutes = 0): string {
  const now = new Date()
  const jstOffset = 9 * 60 // JST is UTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60000 - offsetMinutes * 60000)

  // Round down to nearest 5-minute interval
  const minutes = Math.floor(jstTime.getMinutes() / 5) * 5
  jstTime.setMinutes(minutes, 0, 0)

  return jstTime.toISOString().slice(0, 16).replace(/[-:T]/g, "").slice(0, 12)
}

// Simple coordinate-based region detection (no API calls needed)
function getRegionFromCoordinates(lat: number, lng: number): string {
  // Major cities
  if (lat >= 35.5 && lat <= 36.0 && lng >= 139.5 && lng <= 140.0) return "Tokyo";
  if (lat >= 34.5 && lat <= 35.5 && lng >= 135.0 && lng <= 136.0) return "Osaka";
  if (lat >= 35.0 && lat <= 36.0 && lng >= 136.5 && lng <= 137.5) return "Nagoya";
  if (lat >= 43.0 && lat <= 44.0 && lng >= 141.0 && lng <= 142.0) return "Sapporo";
  if (lat >= 33.5 && lat <= 34.0 && lng >= 130.0 && lng <= 131.0) return "Fukuoka";
  if (lat >= 38.0 && lat <= 38.5 && lng >= 140.5 && lng <= 141.0) return "Sendai";
  if (lat >= 34.0 && lat <= 34.5 && lng >= 132.0 && lng <= 133.0) return "Hiroshima";
  
  // Major regions
  if (lat >= 35.0 && lng >= 139.0) return "Kanto Region";
  if (lat >= 34.0 && lat <= 35.5 && lng >= 135.0 && lng <= 137.0) return "Kansai Region";
  if (lat >= 35.0 && lat <= 37.5 && lng >= 136.0 && lng <= 139.0) return "Chubu Region";
  if (lat >= 43.0) return "Hokkaido";
  if (lat <= 34.0 && lng <= 132.0) return "Kyushu";
  if (lat >= 33.0 && lat <= 35.0 && lng >= 132.0 && lng <= 135.0) return "Chugoku Region";
  if (lat >= 33.0 && lat <= 35.0 && lng >= 133.0 && lng <= 135.0) return "Shikoku";
  
  return `Station at ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
}

// Reverse geocoding with caching (optional, slower but more accurate)
const geocodeCache = new Map<string, string>();

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      {
        headers: {
          'User-Agent': 'TrafficApp/1.0'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village;
      const prefecture = data.address?.state;
      
      let locationName;
      if (city && prefecture) {
        locationName = `${city}, ${prefecture}`;
      } else if (prefecture) {
        locationName = prefecture;
      } else {
        locationName = getRegionFromCoordinates(lat, lng);
      }
      
      geocodeCache.set(cacheKey, locationName);
      return locationName;
    }
  } catch (error) {
    console.log('Geocoding failed for', lat, lng, ':', error);
  }
  
  // Fallback to coordinate-based region
  const fallback = getRegionFromCoordinates(lat, lng);
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

async function fetchTrafficDataWithRetry(): Promise<any> {
  const bbox = "129.0,31.0,146.0,46.0"

  // Try multiple time codes (current time and previous intervals)
  for (let i = 0; i < 12; i++) {
    const timeCode = generateTimeCode(i * 5) // Try every 5 minutes back

    const params = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeNames: "t_travospublic_measure_5m",
      srsName: "EPSG:4326",
      outputFormat: "application/json",
      exceptions: "application/json",
      maxFeatures: "1000",
      cql_filter: `道路種別=3 AND 時間コード=${timeCode} AND BBOX(ジオメトリ,${bbox},'EPSG:4326')`,
    })

    const url = `https://api.jartic-open-traffic.org/geoserver?${params}`

    try {
      console.log(`[v0] Trying time code: ${timeCode}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        console.log(`[v0] HTTP error for ${timeCode}: ${response.status}`)
        continue
      }

      const data = await response.json()

      if (data.features && data.features.length > 0) {
        console.log(`[v0] Found ${data.features.length} stations for time code: ${timeCode}`)
        return { data, timeCode }
      } else {
        console.log(`[v0] No data for time code: ${timeCode}`)
      }
    } catch (error) {
      console.log(`[v0] Error for time code ${timeCode}:`, error)
      continue
    }
  }

  throw new Error("No traffic data available for any recent time codes")
}

export async function GET() {
  try {
    const { data, timeCode } = await fetchTrafficDataWithRetry()

    console.log(`[v0] Processing ${data.features?.length} stations...`)

    const processedData =
      data.features
        ?.map((feature: any, index: number) => {
          const props = feature.properties
          const coords = feature.geometry.coordinates

          const lng = typeof coords?.[0]?.[0] === "number" ? coords[0][0] : null
          const lat = typeof coords?.[0]?.[1] === "number" ? coords[0][1] : null

          if (lng === null || lat === null) {
            console.log(`[v0] Invalid coordinates for station ${index}:`, { lng, lat, coords })
            return null // Skip this station
          }

          // Individual traffic components
          const upboundSmall = props["上り・小型交通量"] || 0
          const upboundLarge = props["上り・大型交通量"] || 0
          const downboundSmall = props["下り・小型交通量"] || 0
          const downboundLarge = props["下り・大型交通量"] || 0

          const upboundTotal = upboundSmall + upboundLarge
          const downboundTotal = downboundSmall + downboundLarge
          const totalVolume = upboundTotal + downboundTotal

          // Status checks
          const powerStatus = props["上り・停電"] === "0" && props["下り・停電"] === "0" ? "OK" : "Power Issue"
          const dataStatus = props["上り・欠測"] === "0" && props["下り・欠測"] === "0" ? "OK" : "Missing Data"

          // Get location name (fast, coordinate-based)
          const locationName = getRegionFromCoordinates(lat, lng);
          const stationCode = props["常時観測点コード"] || index;

          return {
            id: props["常時観測点コード"] || `station_${index}`,
            stationCode,
            name: locationName, // Now shows region/city instead of "Station 4110040"
            displayName: `${locationName} (${stationCode})`, // Shows both for clarity
            lat,
            lng,
            coordinates: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            volume: totalVolume,
            upbound: upboundTotal,
            downbound: downboundTotal,
            upboundSmall,
            upboundLarge,
            downboundSmall,
            downboundLarge,
            smallVehicles: upboundSmall + downboundSmall,
            largeVehicles: upboundLarge + downboundLarge,
            powerStatus,
            dataStatus,
            status: powerStatus === "OK" && dataStatus === "OK" ? "active" : "inactive",
            lastUpdate: timeCode,
            area: locationName,
          }
        })
        .filter(Boolean) || [] // Filter out null entries from invalid coordinates

    console.log(`[v0] Processed ${processedData.length} valid stations`)

    // Optional: Add reverse geocoding for top 20 busiest stations (more accurate but slower)
    const sortedByVolume = processedData.sort((a, b) => b.volume - a.volume);
    const top20 = sortedByVolume.slice(0, 20);
    
    console.log(`[v0] Adding detailed location info for top 20 busiest stations...`)
    
    // Add detailed geocoding for top stations only
    for (let i = 0; i < Math.min(top20.length, 20); i++) {
      try {
        const detailedLocation = await reverseGeocode(top20[i].lat, top20[i].lng);
        top20[i].name = detailedLocation;
        top20[i].displayName = `${detailedLocation} (${top20[i].stationCode})`;
        top20[i].area = detailedLocation;
        
        // Rate limit to avoid getting blocked
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`[v0] Failed to geocode station ${top20[i].id}`);
      }
    }

    const sortedData = processedData.sort((a, b) => b.volume - a.volume)
    const rankedData = sortedData.map((station, index) => ({
      ...station,
      rank: index + 1,
      isTop5: index < 5,
      isTop20: index < 20,
    }))

    const stats = {
      totalStations: rankedData.length,
      averageTraffic:
        rankedData.length > 0 ? Math.round(rankedData.reduce((sum: number, s: TrafficStation) => sum + s.volume, 0) / rankedData.length) : 0,
      maxTraffic: rankedData.length > 0 ? Math.max(...rankedData.map((s: TrafficStation) => s.volume)) : 0,
      minTraffic: rankedData.length > 0 ? Math.min(...rankedData.map((s: TrafficStation) => s.volume)) : 0,
      stationsOver100: rankedData.filter((s: TrafficStation) => s.volume > 100).length,
      stationsOver50: rankedData.filter((s: TrafficStation) => s.volume > 50).length,
      stationsOver20: rankedData.filter((s: TrafficStation) => s.volume > 20).length,
      stationsWithIssues: rankedData.filter((s: TrafficStation) => s.status !== "active").length,
      powerIssues: rankedData.filter((s: TrafficStation) => s.powerStatus !== "OK").length,
      dataIssues: rankedData.filter((s: TrafficStation) => s.dataStatus !== "OK").length,
      topRegions: rankedData.slice(0, 10).map((s: TrafficStation) => ({ region: s.area, volume: s.volume })),
    }

    return NextResponse.json({
      stations: rankedData,
      stats,
      timestamp: new Date().toISOString(),
      timeCode,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error fetching traffic data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch traffic data",
        stations: [],
        stats: { totalStations: 0 },
        success: false,
      },
      { status: 500 },
    )
  }
}