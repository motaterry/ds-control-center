"use client"

import { ReactNode, useRef, useState, useEffect } from "react"

interface ScrollingCardGridProps {
  children: ReactNode
  /** Animation duration in seconds (default: 35) */
  duration?: number
  /** Whether scrolling is enabled (default: true) */
  enabled?: boolean
  /** Additional className for the outer container */
  className?: string
}

export function ScrollingCardGrid({
  children,
  duration = 20,
  enabled = true,
  className = "",
}: ScrollingCardGridProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // If animation is disabled or user prefers reduced motion, render static content
  if (!enabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={`scrolling-card-container overflow-hidden relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        // Use full viewport height minus minimal offset for edge-to-edge vignette
        height: "100vh",
        // Pull container to viewport edges
        marginTop: "-2rem",
        paddingTop: "2rem",
        marginBottom: "-2rem", 
        paddingBottom: "2rem",
      }}
    >
      <div
        className="scrolling-card-content"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {/* First set of cards - wrapped with gap */}
        <div className="scrolling-card-set">
          <div className="scrolling-card-inner">{children}</div>
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="scrolling-card-set" aria-hidden="true">
          <div className="scrolling-card-inner">{children}</div>
        </div>
      </div>
    </div>
  )
}

