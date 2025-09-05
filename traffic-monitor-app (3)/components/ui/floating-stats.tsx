"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import NumberTicker from "./number-ticker"

interface FloatingStatsProps {
  stats: {
    label: string
    value: number
    change?: number
    trend?: "up" | "down" | "stable"
  }[]
}

export default function FloatingStats({ stats }: FloatingStatsProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed bottom-6 right-6 z-50 space-y-3"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Card className="bg-background/95 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {stat.trend === "stable" && <Activity className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="font-bold">
                        <NumberTicker value={stat.value} />
                      </div>
                    </div>
                    {stat.change && (
                      <Badge
                        variant={stat.trend === "up" ? "default" : stat.trend === "down" ? "destructive" : "secondary"}
                      >
                        {stat.change > 0 ? "+" : ""}
                        {stat.change}%
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
