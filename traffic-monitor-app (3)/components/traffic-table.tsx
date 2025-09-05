"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface TrafficTableProps {
  stations: TrafficStation[]
}

export function TrafficTable({ stations }: TrafficTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Station</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Total Traffic</TableHead>
            <TableHead className="text-right">Upbound</TableHead>
            <TableHead className="text-right">Downbound</TableHead>
            <TableHead className="text-right">Vehicle Types</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations.map((station) => (
            <TableRow key={station.id}>
              <TableCell className="font-medium">
                {station.is_top5 && (
                  <Badge variant="secondary" className="text-xs">
                    #{station.rank}
                  </Badge>
                )}
                {!station.is_top5 && <span className="text-muted-foreground text-sm">{station.rank}</span>}
              </TableCell>
              <TableCell>
                <div className="font-medium text-sm">{station.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{station.id}</div>
              </TableCell>
              <TableCell className="text-sm">
                {station.lat != null && station.lng != null
                  ? `${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}`
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right font-semibold">{station.volume}</TableCell>
              <TableCell className="text-right font-medium">{station.upbound}</TableCell>
              <TableCell className="text-right font-medium">{station.downbound}</TableCell>
              <TableCell className="text-right">
                <div className="text-xs text-muted-foreground">Small: {station.smallVehicles}</div>
                <div className="text-xs text-muted-foreground">Large: {station.largeVehicles}</div>
              </TableCell>
              <TableCell>
                <Badge variant={station.status === "active" ? "secondary" : "destructive"} className="text-xs">
                  {station.status === "active" ? "Active" : "Issues"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {stations.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No traffic data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
