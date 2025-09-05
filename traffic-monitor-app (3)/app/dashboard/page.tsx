"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MapPin,
  Clock,
  RefreshCw,
  ChevronDown,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  RotateCcw,
} from "lucide-react"
import { TrafficMap } from "@/components/traffic-map"
import { TrafficTable } from "@/components/traffic-table"
import RippleButton from "@/components/ui/ripple-button"
import BlurFade from "@/components/ui/blur-fade"
import PulseDot from "@/components/ui/pulse-dot"
import AnimatedCounter from "@/components/ui/animated-counter"
import { Navigation } from "@/components/navigation"

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

interface FilterPreset {
  name: string
  filters: {
    selectedArea: string
    volumeFilter: string
    statusFilter: string[]
    vehicleTypeFilter: string
    directionFilter: string
    volumeRange: number[]
    searchTerm: string
  }
}

export default function DashboardPage() {
  const [trafficData, setTrafficData] = useState<TrafficStation[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedArea, setSelectedArea] = useState("all")
  const [topN, setTopN] = useState(5)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [volumeFilter, setVolumeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<string[]>(["active", "inactive"])
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all")
  const [directionFilter, setDirectionFilter] = useState("all")
  const [volumeRange, setVolumeRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState("volume")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filterPresets] = useState<FilterPreset[]>([
    {
      name: "High Traffic Areas",
      filters: {
        selectedArea: "high-volume",
        volumeFilter: "high",
        statusFilter: ["active"],
        vehicleTypeFilter: "all",
        directionFilter: "all",
        volumeRange: [100, 500],
        searchTerm: "",
      },
    },
    {
      name: "Problem Stations",
      filters: {
        selectedArea: "issues",
        volumeFilter: "all",
        statusFilter: ["inactive"],
        vehicleTypeFilter: "all",
        directionFilter: "all",
        volumeRange: [0, 500],
        searchTerm: "",
      },
    },
    {
      name: "Light Traffic",
      filters: {
        selectedArea: "low-volume",
        volumeFilter: "low",
        statusFilter: ["active"],
        vehicleTypeFilter: "small",
        directionFilter: "all",
        volumeRange: [0, 50],
        searchTerm: "",
      },
    },
  ])

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

      // Sort by traffic volume and assign ranks
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

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchTrafficData, 300000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const filteredData = trafficData
    .filter((station) => {
      // Area filter
      if (selectedArea === "top5" && !station.is_top5) return false
      if (selectedArea === "issues" && station.status === "active") return false
      if (selectedArea === "high-volume" && station.volume < 100) return false
      if (selectedArea === "low-volume" && station.volume >= 50) return false

      // Search filter
      if (searchTerm && !station.name.toLowerCase().includes(searchTerm.toLowerCase())) return false

      // Volume filter
      if (volumeFilter === "high" && station.volume < 100) return false
      if (volumeFilter === "medium" && (station.volume < 50 || station.volume >= 100)) return false
      if (volumeFilter === "low" && station.volume >= 50) return false

      // Status filter
      if (!statusFilter.includes(station.status)) return false

      // Vehicle type filter
      if (vehicleTypeFilter === "small" && station.smallVehicles < station.largeVehicles) return false
      if (vehicleTypeFilter === "large" && station.largeVehicles < station.smallVehicles) return false

      // Direction filter
      if (directionFilter === "upbound" && station.upbound < station.downbound) return false
      if (directionFilter === "downbound" && station.downbound < station.upbound) return false

      // Volume range filter
      if (station.volume < volumeRange[0] || station.volume > volumeRange[1]) return false

      return true
    })
    .sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case "volume":
          aValue = a.volume
          bValue = b.volume
          break
        case "upbound":
          aValue = a.upbound
          bValue = b.upbound
          break
        case "downbound":
          aValue = a.downbound
          bValue = b.downbound
          break
        case "small":
          aValue = a.smallVehicles
          bValue = b.smallVehicles
          break
        case "large":
          aValue = a.largeVehicles
          bValue = b.largeVehicles
          break
        case "name":
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        default:
          aValue = a.volume
          bValue = b.volume
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  const applyFilterPreset = (preset: FilterPreset) => {
    setSelectedArea(preset.filters.selectedArea)
    setVolumeFilter(preset.filters.volumeFilter)
    setStatusFilter(preset.filters.statusFilter)
    setVehicleTypeFilter(preset.filters.vehicleTypeFilter)
    setDirectionFilter(preset.filters.directionFilter)
    setVolumeRange(preset.filters.volumeRange)
    setSearchTerm(preset.filters.searchTerm)
  }

  const resetFilters = () => {
    setSelectedArea("all")
    setVolumeFilter("all")
    setStatusFilter(["active", "inactive"])
    setVehicleTypeFilter("all")
    setDirectionFilter("all")
    setVolumeRange([0, 500])
    setSearchTerm("")
    setSortBy("volume")
    setSortOrder("desc")
  }

  const topStations = trafficData.slice(0, topN)
  const totalTraffic = trafficData.reduce((sum, station) => sum + station.volume, 0)
  const avgTraffic = trafficData.length > 0 ? Math.round(totalTraffic / trafficData.length) : 0
  const issueCount = trafficData.filter((s) => s.status !== "active").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <BlurFade delay={0.1}>
        <header className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <PulseDot color="bg-white" size="md" />
          </div>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-balance mb-2">Live Traffic Dashboard</h1>
            <p className="text-sm opacity-90">
              Real-time monitoring • Last updated: {lastUpdate.toLocaleTimeString()}
              {error && <span className="text-red-200 ml-2 animate-pulse">• Error: {error}</span>}
            </p>
          </div>
        </header>
      </BlurFade>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* ... existing enhanced controls code ... */}
        <BlurFade delay={0.2}>
          <Card>
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Advanced Filters & Controls
                    <Badge variant="outline" className="ml-2">
                      {filteredData.length} results
                    </Badge>
                    <ChevronDown className="h-4 w-4 ml-auto transition-transform data-[state=open]:rotate-180" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Quick Filters</h4>
                      <div className="flex items-center gap-2">
                        <RippleButton onClick={resetFilters} variant="outline" size="sm">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </RippleButton>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="advanced-filters"
                            checked={showAdvancedFilters}
                            onCheckedChange={setShowAdvancedFilters}
                          />
                          <label htmlFor="advanced-filters" className="text-sm">
                            Advanced
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterPresets.map((preset) => (
                        <RippleButton
                          key={preset.name}
                          onClick={() => applyFilterPreset(preset)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {preset.name}
                        </RippleButton>
                      ))}
                    </div>
                  </div>

                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Stations</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search by name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Area Filter</label>
                      <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas</SelectItem>
                          <SelectItem value="top5">Top 5 Busiest</SelectItem>
                          <SelectItem value="high-volume">High Volume (100+)</SelectItem>
                          <SelectItem value="low-volume">Low Volume (&lt;50)</SelectItem>
                          <SelectItem value="issues">With Issues</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Volume Range</label>
                      <Select value={volumeFilter} onValueChange={setVolumeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Volumes</SelectItem>
                          <SelectItem value="high">High (100+)</SelectItem>
                          <SelectItem value="medium">Medium (50-99)</SelectItem>
                          <SelectItem value="low">Low (&lt;50)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Show Top N</label>
                      <Select value={topN.toString()} onValueChange={(v) => setTopN(Number.parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">Top 3</SelectItem>
                          <SelectItem value="5">Top 5</SelectItem>
                          <SelectItem value="10">Top 10</SelectItem>
                          <SelectItem value="20">Top 20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {showAdvancedFilters && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Advanced Filtering Options
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Station Status</label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="status-active"
                                checked={statusFilter.includes("active")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setStatusFilter([...statusFilter, "active"])
                                  } else {
                                    setStatusFilter(statusFilter.filter((s) => s !== "active"))
                                  }
                                }}
                              />
                              <label htmlFor="status-active" className="text-sm">
                                Active Stations
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="status-inactive"
                                checked={statusFilter.includes("inactive")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setStatusFilter([...statusFilter, "inactive"])
                                  } else {
                                    setStatusFilter(statusFilter.filter((s) => s !== "inactive"))
                                  }
                                }}
                              />
                              <label htmlFor="status-inactive" className="text-sm">
                                Inactive Stations
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Type Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dominant Vehicle Type</label>
                          <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="small">Small Vehicle Dominant</SelectItem>
                              <SelectItem value="large">Large Vehicle Dominant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Direction Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Traffic Direction</label>
                          <Select value={directionFilter} onValueChange={setDirectionFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Directions</SelectItem>
                              <SelectItem value="upbound">Upbound Dominant</SelectItem>
                              <SelectItem value="downbound">Downbound Dominant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Volume Range Slider */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">
                          Traffic Volume Range: {volumeRange[0]} - {volumeRange[1]} vehicles
                        </label>
                        <Slider
                          value={volumeRange}
                          onValueChange={setVolumeRange}
                          max={500}
                          min={0}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      {/* Sorting Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sort By</label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="volume">Total Volume</SelectItem>
                              <SelectItem value="upbound">Upbound Traffic</SelectItem>
                              <SelectItem value="downbound">Downbound Traffic</SelectItem>
                              <SelectItem value="small">Small Vehicles</SelectItem>
                              <SelectItem value="large">Large Vehicles</SelectItem>
                              <SelectItem value="name">Station Name</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sort Order</label>
                          <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desc">Highest First</SelectItem>
                              <SelectItem value="asc">Lowest First</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 items-center pt-4 border-t">
                    <RippleButton onClick={fetchTrafficData} disabled={loading} variant="outline" size="sm">
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh Data
                    </RippleButton>

                    <RippleButton
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      variant={autoRefresh ? "default" : "outline"}
                      size="sm"
                    >
                      Auto Refresh {autoRefresh ? "ON" : "OFF"}
                    </RippleButton>

                    <Badge variant="outline">
                      {filteredData.length} of {trafficData.length} stations shown
                    </Badge>

                    {filteredData.length !== trafficData.length && <Badge variant="secondary">Filtered</Badge>}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </BlurFade>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BlurFade delay={0.3}>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <PulseDot color="bg-blue-500" size="sm" />
                  </div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mb-2" />
                    ) : (
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={trafficData.length} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Active monitoring points</p>
                    <Progress value={(trafficData.length / 100) * 100} className="mt-2 h-1" />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Station Coverage</h4>
                  <p className="text-xs text-muted-foreground">
                    Currently monitoring {trafficData.length} traffic stations across Tokyo metropolitan area.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </BlurFade>

          <BlurFade delay={0.4}>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <PulseDot color="bg-green-500" size="sm" />
                  </div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Traffic</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-20 mb-2" />
                    ) : (
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={avgTraffic} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">vehicles per 5 minutes</p>
                    <Progress value={Math.min((avgTraffic / 200) * 100, 100)} className="mt-2 h-1" />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Traffic Flow</h4>
                  <p className="text-xs text-muted-foreground">
                    Average of {avgTraffic} vehicles every 5 minutes across all monitoring stations.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </BlurFade>

          <BlurFade delay={0.5}>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <PulseDot color="bg-orange-500" size="sm" />
                  </div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mb-2" />
                    ) : (
                      <div className="text-2xl font-bold text-blue-600">
                        <AnimatedCounter value={filteredData.length} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">stations match filters</p>
                    <Progress
                      value={trafficData.length > 0 ? (filteredData.length / trafficData.length) * 100 : 0}
                      className="mt-2 h-1"
                    />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Filter Results</h4>
                  <p className="text-xs text-muted-foreground">
                    {filteredData.length} out of {trafficData.length} stations match your current filter criteria.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </BlurFade>

          <BlurFade delay={0.6}>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <PulseDot color={issueCount > 0 ? "bg-red-500" : "bg-green-500"} size="sm" />
                  </div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Issues</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-12 mb-2" />
                    ) : (
                      <div
                        className={`text-2xl font-bold ${issueCount > 0 ? "text-destructive animate-pulse" : "text-green-600"}`}
                      >
                        <AnimatedCounter value={issueCount} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">stations with problems</p>
                    <Progress
                      value={
                        trafficData.length > 0 ? ((trafficData.length - issueCount) / trafficData.length) * 100 : 100
                      }
                      className="mt-2 h-1"
                    />
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">System Health</h4>
                  <p className="text-xs text-muted-foreground">
                    {issueCount === 0 ? "All systems operational" : `${issueCount} stations reporting issues`}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </BlurFade>
        </div>

        {/* Enhanced Tabs */}
        <BlurFade delay={0.7}>
          <Tabs defaultValue="map">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Interactive Map
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Data Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Live Traffic Map
                    <Badge variant="secondary" className="ml-auto animate-pulse">
                      {filteredData.length} stations shown
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="w-full h-96 animate-pulse" />
                  ) : (
                    <TrafficMap stations={filteredData} topStations={topStations} loading={loading} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Traffic Station Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                      ))}
                    </div>
                  ) : (
                    <TrafficTable stations={filteredData} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </BlurFade>
      </div>
    </div>
  )
}
