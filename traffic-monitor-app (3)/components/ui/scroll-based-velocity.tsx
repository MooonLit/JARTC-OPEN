"use client"

import { useRef } from "react"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion"
import { wrap } from "@motionone/utils"

interface ScrollBasedVelocityProps {
  children: string
  baseVelocity?: number
  className?: string
}

export default function ScrollBasedVelocity({ children, baseVelocity = 1, className }: ScrollBasedVelocityProps) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
    clamp: false,
  })

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`)

  const directionFactor = useRef<number>(1)
  useAnimationFrame((t, delta) => {
    const velocityValue = velocityFactor.get()
    
    // Update direction based on scroll
    if (velocityValue < 0) {
      directionFactor.current = -1
    } else if (velocityValue > 0) {
      directionFactor.current = 1
    }

    // Calculate movement: base speed + scroll-influenced speed
    const baseMovement = directionFactor.current * baseVelocity * (delta / 1000)
    const scrollInfluencedMovement = directionFactor.current * baseVelocity * (delta / 1000) * Math.abs(velocityValue)
    
    const totalMovement = baseMovement + scrollInfluencedMovement

    baseX.set(baseX.get() + totalMovement)
  })

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div className={`flex whitespace-nowrap flex-nowrap ${className}`} style={{ x }}>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
      </motion.div>
    </div>
  )
}