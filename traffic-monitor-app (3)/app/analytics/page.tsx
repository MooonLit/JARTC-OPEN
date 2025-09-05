"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Activity, PieChart, LineChart, Map, Zap } from "lucide-react"
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

export default function AnalyticsPage() {
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
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalVehicles = trafficData.reduce((sum, station) => sum + station.volume, 0)
  const avgVolume = trafficData.length > 0 ? Math.round(totalVehicles / trafficData.length) : 0
  const smallVehicleTotal = trafficData.reduce((sum, station) => sum + station.smallVehicles, 0)
  const largeVehicleTotal = trafficData.reduce((sum, station) => sum + station.largeVehicles, 0)
  const smallVehiclePercent = totalVehicles > 0 ? Math.round((smallVehicleTotal / totalVehicles) * 100) : 0
  const largeVehiclePercent = totalVehicles > 0 ? Math.round((largeVehicleTotal / totalVehicles) * 100) : 0
  const activeStations = trafficData.filter((s) => s.status === "active").length
  const peakStations = trafficData.filter((s) => s.volume > 100).length

  const topStations = trafficData.sort((a, b) => b.volume - a.volume).slice(0, 10)

const trafficDataString = trafficData
  .slice(0, 1)
  .map((station) => 
    `${station.name}: ${station.volume} vehicles | ↑${station.upbound} ↓${station.downbound} | Small: ${station.smallVehicles} Large: ${station.largeVehicles}`
  )
  .join(" • ")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />

      <BlurFade delay={0.1}>
        <header className="bg-gradient-to-r from-chart-1 via-chart-1/90 to-chart-1 text-white p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <PulseDot color="bg-white" size="md" />
          </div>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-balance mb-2">Traffic Analytics & Insights</h1>
            <p className="text-sm opacity-90">
              Comprehensive data analysis • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </header>
      </BlurFade>

      <section className="py-8 border-y bg-muted/30 relative z-10">
        <ScrollBasedVelocity baseVelocity={-1} className="text-xs text-muted-foreground font-mono">
          {trafficDataString || "LOADING COMPREHENSIVE TRAFFIC DATA STREAM..."}
        </ScrollBasedVelocity>
      </section>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Enhanced Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BlurFade delay={0.2}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <PulseDot color="bg-blue-500" size="sm" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={totalVehicles} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">vehicles monitored</p>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.3}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <PulseDot color="bg-green-500" size="sm" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Flow</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={avgVolume} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">per station</p>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.4}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <PulseDot color="bg-orange-500" size="sm" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Stations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    <AnimatedCounter value={activeStations} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">operational</p>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.5}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <PulseDot color="bg-purple-500" size="sm" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Traffic</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-red-600">
                    <AnimatedCounter value={peakStations} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">high volume</p>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.6}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <PulseDot color="bg-cyan-500" size="sm" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Small Vehicles</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    <AnimatedCounter value={smallVehiclePercent} suffix="%" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">of total</p>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        <BlurFade delay={0.7}>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Interactive Charts</TabsTrigger>
              <TabsTrigger value="patterns">Traffic Patterns</TabsTrigger>
              <TabsTrigger value="insights">Deep Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top 10 Busiest Stations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(10)].map((_, i) => (
                          <Skeleton key={i} className="w-full h-12" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topStations.map((station, index) => (
                          <div
                            key={station.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                              <div>
                                <div className="font-medium">{station.name}</div>
                                <div className="text-sm text-muted-foreground">{station.area}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{station.volume}</div>
                              <div className="text-xs text-muted-foreground">vehicles</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Vehicle Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>Small Vehicles (Cars, Motorcycles)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{smallVehicleTotal.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{smallVehiclePercent}%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span>Large Vehicles (Trucks, Buses)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{largeVehicleTotal.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{largeVehiclePercent}%</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">Traffic Composition</div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-green-500 float-left"
                            style={{ width: `${smallVehiclePercent}%` }}
                          ></div>
                          <div
                            className="h-full bg-orange-500 float-left"
                            style={{ width: `${largeVehiclePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading && (
                  <>
                    <TrafficChart stations={trafficData} type="bar" title="Top Stations by Volume" dataKey="volume" />
                    <TrafficChart stations={trafficData} type="pie" title="Vehicle Type Distribution" />
                    <TrafficChart stations={trafficData} type="line" title="Traffic Flow Trends" />
                    <TrafficChart stations={trafficData} type="area" title="Directional Traffic Analysis" />
                  </>
                )}
                {loading && (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-80" />
                    ))}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="patterns">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Traffic Flow Patterns & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <PulseDot color="bg-red-500" size="sm" />
                          Peak Traffic Stations
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Stations with volume &gt; 100 vehicles per 5-minute period
                        </p>
                        <div className="text-2xl font-bold text-red-600">
                          <AnimatedCounter value={trafficData.filter((s) => s.volume > 100).length} />
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <PulseDot color="bg-yellow-500" size="sm" />
                          Moderate Traffic
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">Stations with 20-100 vehicles per period</p>
                        <div className="text-2xl font-bold text-yellow-600">
                          <AnimatedCounter
                            value={trafficData.filter((s) => s.volume >= 20 && s.volume <= 100).length}
                          />
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <PulseDot color="bg-green-500" size="sm" />
                          Low Traffic Stations
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">Stations with &lt; 20 vehicles per period</p>
                        <div className="text-2xl font-bold text-green-600">
                          <AnimatedCounter value={trafficData.filter((s) => s.volume < 20).length} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">Directional Flow Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Upbound Dominant</span>
                            <Badge variant="outline">
                              {trafficData.filter((s) => s.upbound > s.downbound).length} stations
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Downbound Dominant</span>
                            <Badge variant="outline">
                              {trafficData.filter((s) => s.downbound > s.upbound).length} stations
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Balanced Flow</span>
                            <Badge variant="outline">
                              {trafficData.filter((s) => s.upbound === s.downbound).length} stations
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">Vehicle Mix Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Small Vehicle Heavy</span>
                            <Badge variant="outline">
                              {trafficData.filter((s) => s.smallVehicles > s.largeVehicles * 3).length} stations
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Large Vehicle Heavy</span>
                            <Badge variant="outline">
                              {trafficData.filter((s) => s.largeVehicles > s.smallVehicles).length} stations
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Mixed Traffic</span>
                            <Badge variant="outline">
                              {
                                trafficData.filter(
                                  (s) => s.smallVehicles <= s.largeVehicles * 3 && s.largeVehicles <= s.smallVehicles,
                                ).length
                              }{" "}
                              stations
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">System Efficiency</span>
                        <Badge variant="default">{Math.round((activeStations / trafficData.length) * 100)}%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Peak Utilization</span>
                        <Badge variant="secondary">{Math.round((peakStations / trafficData.length) * 100)}%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Average Load</span>
                        <Badge variant="outline">{avgVolume} vehicles/station</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      Network Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-2">
                          <AnimatedCounter value={trafficData.length} />
                        </div>
                        <div className="text-sm text-muted-foreground">Total Monitoring Points</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          <AnimatedCounter value={totalVehicles} />
                        </div>
                        <div className="text-sm text-muted-foreground">Total Vehicles Tracked</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          <AnimatedCounter value={Math.round(totalVehicles / 60)} />
                        </div>
                        <div className="text-sm text-muted-foreground">Estimated Vehicles/Minute</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </BlurFade>
      </div>
    </div>
  )
}
