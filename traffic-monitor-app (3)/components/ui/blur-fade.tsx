"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface BlurFadeProps {
  children: ReactNode
  className?: string
  variant?: {
    hidden: { y?: number; opacity?: number; filter?: string }
    visible: { y?: number; opacity?: number; filter?: string }
  }
  duration?: number
  delay?: number
  yOffset?: number
  inView?: boolean
  inViewMargin?: string
  blur?: string
}

const defaultVariant = {
  hidden: { y: 6, opacity: 0, filter: "blur(6px)" },
  visible: { y: -6, opacity: 1, filter: "blur(0px)" },
}

export default function BlurFade({
  children,
  className,
  variant = defaultVariant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variant}
      transition={{
        delay: delay,
        duration: duration,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
