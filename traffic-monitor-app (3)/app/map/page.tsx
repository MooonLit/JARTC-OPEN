"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Maximize2, RefreshCw } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { TrafficMap } from "@/components/traffic-map"
import BlurFade from "@/components/ui/blur-fade"
import RippleButton from "@/components/ui/ripple-button"

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

export default function MapPage() {
  const [trafficData, setTrafficData] = useState<TrafficStation[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchTrafficData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/traffic")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const sortedStations = data.stations.sort((a: TrafficStation, b: TrafficStation) => b.volume - a.volume)
      const rankedStations = sortedStations.map((station: TrafficStation, index: number) => ({
        ...station,
        rank: index + 1,
        is_top5: index < 5,
      }))

      setTrafficData(rankedStations)
      setLastUpdate(new Date())
    } catch (err) {
      console.error("Error fetching traffic data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch traffic data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrafficData()
  }, [])

  const topStations = trafficData.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />

      <BlurFade delay={0.1}>
        <header className="bg-gradient-to-r from-green-600 via-green-600/90 to-green-600 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance mb-2">Full-Screen Map View</h1>
              <p className="text-sm opacity-90">
                Interactive traffic monitoring • Last updated: {lastUpdate.toLocaleTimeString()}
                {error && <span className="text-red-200 ml-2 animate-pulse">• Error: {error}</span>}
              </p>
            </div>
            <RippleButton onClick={fetchTrafficData} disabled={loading} variant="secondary" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </RippleButton>
          </div>
        </header>
      </BlurFade>

      <div className="max-w-7xl mx-auto p-4">
        <BlurFade delay={0.2}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                Tokyo Traffic Map - All Stations
                <Badge variant="secondary" className="ml-auto animate-pulse">
                  {trafficData.length} stations
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <Skeleton className="w-full h-[600px] animate-pulse" />
              ) : (
                <div className="h-[600px] w-full">
                  <TrafficMap stations={trafficData} topStations={topStations} loading={loading} />
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </div>
  )
}
