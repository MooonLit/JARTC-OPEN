"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import BlurFade from "./blur-fade"

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

interface TrafficChartProps {
  stations: TrafficStation[]
  type: "bar" | "pie" | "line" | "area"
  title: string
  dataKey?: string
  className?: string
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export default function TrafficChart({ stations, type, title, dataKey = "volume", className }: TrafficChartProps) {
  const chartData = useMemo(() => {
    if (type === "pie") {
      const vehicleData = [
        {
          name: "Small Vehicles",
          value: stations.reduce((sum, station) => sum + station.smallVehicles, 0),
          color: COLORS[0],
        },
        {
          name: "Large Vehicles",
          value: stations.reduce((sum, station) => sum + station.largeVehicles, 0),
          color: COLORS[1],
        },
      ]
      return vehicleData
    }

    if (type === "line" || type === "area") {
      return stations.slice(0, 20).map((station, index) => ({
        name: station.name.substring(0, 10) + "...",
        volume: station.volume,
        upbound: station.upbound,
        downbound: station.downbound,
        index: index + 1,
      }))
    }

    return stations.slice(0, 10).map((station, index) => ({
      name: station.name.substring(0, 15) + "...",
      volume: station.volume,
      upbound: station.upbound,
      downbound: station.downbound,
      small: station.smallVehicles,
      large: station.largeVehicles,
      rank: index + 1,
    }))
  }, [stations, type])

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey={dataKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="index" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line type="monotone" dataKey="volume" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="upbound" stroke={COLORS[2]} strokeWidth={2} />
              <Line type="monotone" dataKey="downbound" stroke={COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="index" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stackId="1"
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="upbound"
                stackId="2"
                stroke={COLORS[2]}
                fill={COLORS[2]}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="downbound"
                stackId="3"
                stroke={COLORS[1]}
                fill={COLORS[1]}
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <BlurFade delay={0.1}>
      <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{stations.length} stations</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>
    </BlurFade>
  )
}
