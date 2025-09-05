"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface MorphingIconProps {
  icons: LucideIcon[]
  className?: string
  size?: number
}

export default function MorphingIcon({ icons, className, size = 24 }: MorphingIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: index === 0 ? 1 : 0, scale: index === 0 ? 1 : 0.8 }}
          animate={{
            opacity: [1, 0, 0, 0, 1],
            scale: [1, 0.8, 0.8, 0.8, 1],
          }}
          transition={{
            duration: icons.length * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 2,
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}
    </div>
  )
}
