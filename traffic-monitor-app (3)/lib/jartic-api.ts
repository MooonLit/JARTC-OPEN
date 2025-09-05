export interface JarticApiResponse {
  type: string
  features: Array<{
    type: string
    geometry: {
      type: string
      coordinates: [number, number]
    }
    properties: {
      常時観測点コード: string
      時間コード: string
      上り・小型交通量: number
      上り・大型交通量: number
      下り・小型交通量: number
      下り・大型交通量: number
      上り・停電: string
      下り・停電: string
      上り・欠測: string
      下り・欠測: string
    }
  }>
}

export async function fetchTokyoTrafficData(
  timeCode: string | null = null,
  bbox = "139.0,35.0,140.0,36.0",
): Promise<JarticApiResponse> {
  // Generate current time code if not provided
  if (!timeCode) {
    const now = new Date()
    const jstOffset = 9 * 60 // JST is UTC+9
    const jstTime = new Date(now.getTime() + jstOffset * 60000)

    // Round to nearest 5-minute interval
    const minutes = Math.floor(jstTime.getMinutes() / 5) * 5
    jstTime.setMinutes(minutes, 0, 0)

    timeCode = jstTime.toISOString().slice(0, 16).replace(/[-:T]/g, "").slice(0, 12)
  }

  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: "t_travospublic_measure_5m",
    srsName: "EPSG:4326",
    outputFormat: "application/json",
    exceptions: "application/json",
    cql_filter: `道路種別=3 AND 時間コード=${timeCode} AND BBOX(ジオメトリ,${bbox},'EPSG:4326')`,
  })

  const url = `https://api.jartic-open-traffic.org/geoserver?${params}`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching traffic data:", error)
    throw error
  }
}

// Common bounding boxes for different areas
export const BOUNDING_BOXES = {
  TOKYO_METROPOLITAN: "139.0,35.0,140.0,36.0",
  TOKYO_CITY_CENTER: "139.5,35.5,139.9,35.8",
  OSAKA: "135.3,34.5,135.7,34.8",
} as const
