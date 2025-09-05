"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MapPin, Activity, TrendingUp, Zap, Globe, BarChart3, Wifi, Users, Clock, Icon } from "lucide-react"
import ScrollBasedVelocity from "@/components/ui/scroll-based-velocity"
import RippleButton from "@/components/ui/ripple-button"
import BlurFade from "@/components/ui/blur-fade"
import AnimatedBackground from "@/components/ui/animated-background"
import FloatingStats from "@/components/ui/floating-stats"
import MorphingIcon from "@/components/ui/morphing-icon"
import PulseDot from "@/components/ui/pulse-dot"
import AnimatedCounter from "@/components/ui/animated-counter"
import { Navigation } from "@/components/navigation"

interface TrafficStats {
  totalStations: number
  avgTraffic: number
  totalVehicles: number
  systemHealth: number
}

export default function HomePage() {
  const [stats, setStats] = useState<TrafficStats>({
    totalStations: 0,
    avgTraffic: 0,
    totalVehicles: 0,
    systemHealth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/traffic")
        const data = await response.json()

        if (data.stations) {
          const totalTraffic = data.stations.reduce((sum: number, station: any) => sum + station.volume, 0)
          const avgTraffic = Math.round(totalTraffic / data.stations.length)
          const healthyStations = data.stations.filter((s: any) => s.status === "active").length
          const systemHealth = Math.round((healthyStations / data.stations.length) * 100)

          setStats({
            totalStations: data.stations.length,
            avgTraffic,
            totalVehicles: totalTraffic,
            systemHealth,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])
/*
  const floatingStatsData = [
    {
      label: "Live Stations",
      value: stats.totalStations,
      trend: "up" as const,
      change: 2.5,
    },
    {
      label: "Avg Traffic",
      value: stats.avgTraffic,
      trend: "stable" as const,
    },
    {
      label: "System Health",
      value: stats.systemHealth,
      trend: "up" as const,
      change: 1.2,
    },
  ]
    */

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <Navigation />


      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <BlurFade delay={0.1}>
            <Badge variant="secondary" className="mb-4">
              Real-time Traffic Monitoring
            </Badge>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="text-4xl sm:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tokyo Traffic Intelligence
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="text-xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto">
            Advanced real-time traffic monitoring system powered by{" "}
            <a 
              href="https://www.jartic-open-traffic.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              JARTIC API
            </a>
            {" "}. Track vehicle flow, analyze patterns, and optimize urban mobility across Tokyo.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <RippleButton>
                  View Live Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </RippleButton>
              </Link>
              <Link href="/analytics">
                <RippleButton>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Explore Analytics
                </RippleButton>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Scrolling Traffic Data */}
      <section className="py-8 border-y bg-muted/30 relative z-10">
        <ScrollBasedVelocity baseVelocity={-1} className="text-sm text-muted-foreground font-mono">
          LIVE TRAFFIC DATA • TOKYO METROPOLITAN AREA • JARTIC API • REAL-TIME MONITORING • VEHICLE FLOW ANALYSIS •
        </ScrollBasedVelocity>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Live Traffic Statistics</h2>
              <p className="text-muted-foreground text-balance">
                Real-time insights from Tokyo's comprehensive traffic monitoring network
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BlurFade delay={0.2}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <Wifi className="h-8 w-8 text-primary mb-2" />
                    Monitoring Stations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 mx-auto rounded" />
                    ) : (
                      <AnimatedCounter value={stats.totalStations} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Active monitoring points</p>
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.3}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <BarChart3 className="h-8 w-8 text-primary mb-2" />
                    Average Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-muted h-8 w-20 mx-auto rounded" />
                    ) : (
                      <AnimatedCounter value={stats.avgTraffic} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Vehicles per 5 minutes</p>
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.4}>
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-2 right-2">
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  Total Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted h-8 w-24 mx-auto rounded" />
                  ) : (
                    <AnimatedCounter value={stats.totalVehicles} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Current monitoring period</p>
              </CardContent>
            </Card>
            </BlurFade>

            <BlurFade delay={0.5}>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <Activity className="h-8 w-8 text-primary mb-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 mx-auto rounded" />
                    ) : (
                      <span>
                        <AnimatedCounter value={stats.systemHealth} suffix="%" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Operational stations</p>
                </CardContent>
              </Card>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 relative z-10">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground text-balance">
                Comprehensive traffic analysis tools for urban planning and optimization
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlurFade delay={0.2}>
              <Card className="hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                </div>
                <CardHeader>
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Real-time Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Interactive maps showing live traffic flow with color-coded indicators and station
                    details.
                  </p>
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.3}>
              <Card className="hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                </div>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed traffic pattern analysis with historical data, trends, and predictive insights.
                  </p>
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.4}>
              <Card className="hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                </div>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Live Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Continuous monitoring with automatic updates, alerts, and system health tracking.
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <BlurFade delay={0.1}>
            <h2 className="text-3xl font-bold mb-4">Ready to Explore Traffic Data?</h2>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              Access real-time traffic insights and make data-driven decisions for urban mobility.
            </p>
            <Link href="/dashboard">
              <RippleButton>
                Launch Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </RippleButton>
            </Link>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            Powered by JARTIC{" "}
            <a 
              href="https://www.jartic-open-traffic.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              [https://www.jartic-open-traffic.org/]
            </a>
            {" "}• Real-time traffic data from Japan Road Traffic Information Center
          </p>
        </div>
      </footer>
    </div>
  )
}
