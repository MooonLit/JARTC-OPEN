"use client"

import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface TrafficStation {
  id: string
  name: string
  lat: number
  lng: number
  volume: number
  upbound: number
  downbound: number
  smallVehicles: number
  largeVehicles: number
  status: string
  lastUpdate: string
  area: string
  rank?: number
  is_top5?: boolean
}

interface TrafficMapProps {
  stations: TrafficStation[]
  topStations: TrafficStation[]
  loading: boolean
}

export function TrafficMap({ stations, topStations, loading }: TrafficMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || loading) return

    // Initialize Leaflet map
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      const map = L.map(mapRef.current!).setView([35.6762, 139.6503], 11)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      mapInstanceRef.current = map

      stations.forEach((station) => {
        if (
          typeof station.lat !== "number" ||
          typeof station.lng !== "number" ||
          isNaN(station.lat) ||
          isNaN(station.lng)
        ) {
          console.log(`[v0] Skipping station with invalid coordinates:`, station)
          return
        }

        const isTop = station.is_top5
        const hasIssues = station.status !== "active"

        let color = "#6366f1" // Default blue
        if (hasIssues) color = "#ef4444" // Red for issues
        if (isTop) color = "#f59e0b" // Orange for top stations

        const marker = L.circleMarker([station.lat, station.lng], {
          radius: isTop ? 12 : 8,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map)

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-sm mb-2">
              ${isTop ? `#${station.rank} ` : ""}${station.name}
            </h3>
            <div class="text-xs space-y-1">
              <div><strong>Total Traffic:</strong> ${station.volume} vehicles/5min</div>
              <div><strong>Upbound:</strong> ${station.upbound}</div>
              <div><strong>Downbound:</strong> ${station.downbound}</div>
              <div><strong>Small Vehicles:</strong> ${station.smallVehicles}</div>
              <div><strong>Large Vehicles:</strong> ${station.largeVehicles}</div>
              <div><strong>Status:</strong> ${station.status}</div>
              <div><strong>Station ID:</strong> ${station.id}</div>
              <div><strong>Location:</strong> ${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}</div>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [stations, loading])

  if (loading) {
    return <Skeleton className="w-full h-96" />
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ minHeight: "400px" }} />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card p-3 rounded-lg shadow-lg border text-xs">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Top 5 Busiest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>System Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Normal Operation</span>
          </div>
        </div>
      </div>

      {/* Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
    </div>
  )
}
