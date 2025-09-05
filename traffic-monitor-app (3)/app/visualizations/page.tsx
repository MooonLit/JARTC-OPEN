"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Map, Activity, Zap, TrendingUp, PieChart } from "lucide-react"
import { Navigation } from "@/components/navigation"
import BlurFade from "@/components/ui/blur-fade"
import ScrollBasedVelocity from "@/components/ui/scroll-based-velocity"
import AnimatedCounter from "@/components/ui/animated-counter"
import PulseDot from "@/components/ui/pulse-dot"
import TrafficChart from "@/components/ui/traffic-chart"

interface TrafficStation {
  id: string
  name: string
  volume: number
  upbound: number
  downbound: number
  smallVehicles: number
  largeVehicles: number
  status: string
  area: string
}

export default function VisualizationsPage() {
  const [trafficData, setTrafficData] = useState<TrafficStation[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/traffic")
        const data = await response.json()
        if (data.stations) {
          setTrafficData(data.stations)
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error("Failed to fetch visualization data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Enhanced data stream with all traffic points information
  const allTrafficDataString = trafficData
    .map(
      (station, index) =>
        `[${index + 1}] ${station.name}: ${station.volume}v (U:${station.upbound} D:${station.downbound} S:${station.smallVehicles} L:${station.largeVehicles}) ${station.status.toUpperCase()}`,
    )
    .join(" • ")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />

      <BlurFade delay={0.1}>
        <header className="bg-gradient-to-r from-purple-600 via-purple-600/90 to-purple-600 text-white p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <PulseDot color="bg-white" size="md" />
          </div>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-balance mb-2">Advanced Data Visualizations</h1>
            <p className="text-sm opacity-90">
              Interactive charts and comprehensive data analysis • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </header>
      </BlurFade>

      {/* Comprehensive scrolling data stream showing all traffic points */}
      <section className="py-6 border-y bg-muted/30">
        <div className="space-y-2">
          <div className="text-center text-xs text-muted-foreground font-medium mb-2">
            LIVE DATA STREAM - ALL {trafficData.length} MONITORING POINTS
          </div>
          <ScrollBasedVelocity baseVelocity={-1} className="text-xs text-muted-foreground font-mono">
            {allTrafficDataString || "LOADING COMPREHENSIVE TRAFFIC DATA STREAM FROM ALL MONITORING POINTS..."}
          </ScrollBasedVelocity>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BlurFade delay={0.2}>
            <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Map className="h-5 w-5 text-primary mr-2" />
                  <PulseDot color="bg-blue-500" size="sm" />
                </div>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-6 w-12 mx-auto" /> : <AnimatedCounter value={trafficData.length} />}
                </div>
                <div className="text-xs text-muted-foreground">Total Stations</div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.3}>
            <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-primary mr-2" />
                  <PulseDot color="bg-green-500" size="sm" />
                </div>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-16 mx-auto" />
                  ) : (
                    <AnimatedCounter value={trafficData.reduce((sum, s) => sum + s.volume, 0)} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Total Volume</div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.4}>
            <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-primary mr-2" />
                  <PulseDot color="bg-orange-500" size="sm" />
                </div>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-12 mx-auto" />
                  ) : (
                    <AnimatedCounter value={trafficData.filter((s) => s.volume > 100).length} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Peak Stations</div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.5}>
            <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  <PulseDot color="bg-purple-500" size="sm" />
                </div>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-12 mx-auto" />
                  ) : (
                    <AnimatedCounter value={trafficData.filter((s) => s.status === "active").length} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Comprehensive Visualization Tabs */}
        <BlurFade delay={0.6}>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
              <TabsTrigger value="direction">Directional Flow</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicle Types</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading && (
                  <>
                    <TrafficChart
                      stations={trafficData.slice(0, 15)}
                      type="bar"
                      title="Top 15 Stations by Volume"
                      dataKey="volume"
                    />
                    <TrafficChart stations={trafficData} type="pie" title="Vehicle Distribution Overview" />
                  </>
                )}
                {loading && (
                  <>
                    <Skeleton className="w-full h-80" />
                    <Skeleton className="w-full h-80" />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="volume">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading && (
                  <>
                    <TrafficChart
                      stations={trafficData.slice(0, 20)}
                      type="area"
                      title="Traffic Volume Distribution (Top 20)"
                    />
                    <TrafficChart
                      stations={trafficData.slice(0, 25)}
                      type="line"
                      title="Volume Trends Across Stations"
                    />
                  </>
                )}
                {loading && (
                  <>
                    <Skeleton className="w-full h-80" />
                    <Skeleton className="w-full h-80" />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="direction">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading && (
                  <>
                    <TrafficChart
                      stations={trafficData.slice(0, 15)}
                      type="bar"
                      title="Upbound Traffic Analysis"
                      dataKey="upbound"
                    />
                    <TrafficChart
                      stations={trafficData.slice(0, 15)}
                      type="bar"
                      title="Downbound Traffic Analysis"
                      dataKey="downbound"
                    />
                  </>
                )}
                {loading && (
                  <>
                    <Skeleton className="w-full h-80" />
                    <Skeleton className="w-full h-80" />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="vehicles">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading && (
                  <>
                    <TrafficChart
                      stations={trafficData.slice(0, 15)}
                      type="bar"
                      title="Small Vehicle Distribution"
                      dataKey="small"
                    />
                    <TrafficChart
                      stations={trafficData.slice(0, 15)}
                      type="bar"
                      title="Large Vehicle Distribution"
                      dataKey="large"
                    />
                  </>
                )}
                {loading && (
                  <>
                    <Skeleton className="w-full h-80" />
                    <Skeleton className="w-full h-80" />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      System Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 border rounded-lg">
                        <PieChart className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {loading ? (
                            <Skeleton className="h-8 w-16 mx-auto" />
                          ) : (
                            <AnimatedCounter
                              value={Math.round(
                                (trafficData.filter((s) => s.status === "active").length / trafficData.length) * 100,
                              )}
                              suffix="%"
                            />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">System Uptime</div>
                      </div>

                      <div className="text-center p-6 border rounded-lg">
                        <Activity className="h-8 w-8 text-green-500 mx-auto mb-3" />
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {loading ? (
                            <Skeleton className="h-8 w-16 mx-auto" />
                          ) : (
                            <AnimatedCounter
                              value={Math.round(trafficData.reduce((sum, s) => sum + s.volume, 0) / trafficData.length)}
                            />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Throughput</div>
                      </div>

                      <div className="text-center p-6 border rounded-lg">
                        <Zap className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {loading ? (
                            <Skeleton className="h-8 w-16 mx-auto" />
                          ) : (
                            <AnimatedCounter
                              value={Math.round(
                                (trafficData.filter((s) => s.volume > 100).length / trafficData.length) * 100,
                              )}
                              suffix="%"
                            />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Peak Utilization</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!loading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrafficChart stations={trafficData.slice(0, 20)} type="line" title="Performance Trend Analysis" />
                    <TrafficChart stations={trafficData.slice(0, 20)} type="area" title="Capacity Utilization" />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </BlurFade>
      </div>
    </div>
  )
}
