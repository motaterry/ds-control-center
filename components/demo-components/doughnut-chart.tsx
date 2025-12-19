"use client"

import { useState, useRef, useEffect, useId } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from "recharts"

const total = 321
const percentage = Math.round((272 / total) * 100)

// Gradient definitions for the gauge arc
// Matches Figma specs:
// Dark: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.40) 100%), #DD772F
// Light: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.20) 100%), #DD772F
const GaugeGradientDefs = ({ id, isDark }: { id: string; isDark: boolean }) => (
  <defs>
    {/* Vertical linear gradient overlay (180deg = top to bottom) */}
    <linearGradient
      id={`${id}-overlay`}
      x1="0%"
      y1="0%"
      x2="0%"
      y2="100%"
    >
      <stop 
        offset="0%" 
        stopColor={isDark ? "black" : "white"} 
        stopOpacity={0} 
      />
      <stop 
        offset="100%" 
        stopColor={isDark ? "black" : "white"} 
        stopOpacity={isDark ? 0.40 : 0.20} 
      />
    </linearGradient>
  </defs>
)

// Custom active shape for hover state - only color change, same size
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={0}
        style={{ filter: "brightness(1.2)" }}
      />
    </g>
  )
}

// Hook to get responsive chart dimensions - scales based on container and viewport
function useChartDimensions(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ size: 180, innerRadius: 49, outerRadius: 79 })
  const lastContainerSize = useRef({ width: 0, height: 0 })
  
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight
      
      // Stability check: only update if container size changed significantly (>5px)
      // This prevents infinite loops from minor resize fluctuations
      const widthDiff = Math.abs(containerWidth - lastContainerSize.current.width)
      const heightDiff = Math.abs(containerHeight - lastContainerSize.current.height)
      if (widthDiff < 5 && heightDiff < 5 && lastContainerSize.current.width > 0) {
        return
      }
      lastContainerSize.current = { width: containerWidth, height: containerHeight }
      
      // Chart sizing - minimum 180px, scales up with container
      // Layout will wrap to 2 lines when container is too narrow
      const availableHeight = containerHeight - 60 // Reserve space for legend when stacked
      
      // Use container width or height, whichever is smaller, but enforce minimum
      const maxDimension = Math.min(containerWidth, availableHeight)
      
      // Scale to fill 90% of available space, min 180px, max 220px
      const size = Math.max(180, Math.min(maxDimension * 0.9, 220))
      
      // Inner radius is ~60% of outer for thicker donut with more center breathing room
      // Nielsen #4: Aesthetic design - generous whitespace in center for readability
      const outerRadius = Math.round(size * 0.44)
      const innerRadius = Math.round(outerRadius * 0.62)
      
      setDimensions({
        size,
        innerRadius,
        outerRadius,
      })
    }
    
    updateDimensions()
    
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => resizeObserver.disconnect()
  }, [containerRef])
  
  return dimensions
}

export function DoughnutChartDemo() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const chartRef = useRef<HTMLDivElement>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const rawGradientId = useId()
  const gradientId = rawGradientId.replace(/:/g, '') // Sanitize for SVG ID
  
  // Get responsive dimensions
  const { size: chartSize, innerRadius, outerRadius } = useChartDimensions(chartContainerRef)
  
  // Dynamic colors based on theme
  const unconfirmedColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"
  
  // Background ring data (full circle)
  const backgroundData = [{ name: "Background", value: 100, color: unconfirmedColor }]
  
  // Foreground arc data (only the filled portion)
  const foregroundData = [
    { name: "Confirmed", value: 272, color: "var(--color-primary)" },
  ]
  
  const onPieLeave = () => setActiveIndex(undefined)
  
  // Track actual mouse position relative to chart container
  const handleMouseMove = (e: React.MouseEvent) => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }
  
  return (
    <Card className="h-full flex flex-col w-full">
      {/* 
        Nielsen #4: Aesthetic and minimalist design
        Clean header with proper spacing hierarchy
      */}
      <CardHeader className="pb-2 pt-5 flex-shrink-0">
        <CardTitle className={`text-base sm:text-lg font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Schedule Status
        </CardTitle>
      </CardHeader>
      <CardContent ref={chartContainerRef} className="flex-1 flex flex-col justify-center pt-0 pb-4 min-h-0 px-4 sm:px-5">
        {/* 
          Responsive layout - wraps to 2 lines when needed
          Nielsen #8: Flexibility - adapts to different screen sizes
        */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-5 justify-center w-full">
          {/* Responsive chart that scales with container */}
          <div 
            ref={chartRef}
            className="relative shrink-0"
            style={{ width: chartSize, height: chartSize, maxWidth: '100%' }}
            onMouseMove={handleMouseMove}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Gradient and filter definitions for the gauge */}
                <GaugeGradientDefs id={gradientId} isDark={isDark} />
                
                <Tooltip
                  wrapperStyle={{ pointerEvents: "none", visibility: "visible" }}
                  position={{ x: 0, y: 0 }}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    const chartCenter = chartSize / 2 // Dynamic center based on chart size
                    
                    // Use actual mouse position for true orbit behavior
                    const dx = mousePos.x - chartCenter
                    const dy = mousePos.y - chartCenter
                    const angle = Math.atan2(dy, dx)
                    
                    // Place tooltip on outer edge - use responsive outerRadius
                    const orbitRadius = outerRadius
                    const tooltipX = chartCenter + Math.cos(angle) * orbitRadius
                    const tooltipY = chartCenter + Math.sin(angle) * orbitRadius
                    
                    // Dynamic anchor based on position around the circle
                    const anchorX = Math.cos(angle) >= 0 ? "0%" : "-100%"
                    const anchorY = Math.sin(angle) >= 0 ? "0%" : "-100%"
                    
                    const isConfirmed = data.name === "Confirmed"
                    const dotColor = isConfirmed ? "var(--color-primary)" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)")
                    const label = isConfirmed ? "confirmed" : "pending"
                    const value = isConfirmed ? 272 : 48
                    
                    return (
                      <div style={{
                        position: "absolute",
                        left: tooltipX,
                        top: tooltipY,
                        backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
                        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "6px",
                        fontSize: "11px",
                        padding: "6px 10px",
                        lineHeight: "1.3",
                        backdropFilter: "blur(4px)",
                        zIndex: 50,
                        transform: `translate(${anchorX}, ${anchorY})`,
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 500,
                          marginBottom: "2px",
                          color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                        }}>
                          <span style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: dotColor,
                            flexShrink: 0,
                          }} />
                          {label}
                        </div>
                        <div style={{
                          color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                          fontWeight: 600,
                          paddingLeft: "14px",
                        }}>
                          {value} schedules
                        </div>
                      </div>
                    )
                  }}
                />
                {/* Background ring - full circle */}
                <Pie
                  data={backgroundData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                  isAnimationActive={false}
                >
                  <Cell fill={unconfirmedColor} stroke="none" />
                </Pie>
                {/* Foreground arc - base color layer with drop shadow */}
                <Pie
                  data={foregroundData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  startAngle={90}
                  endAngle={90 - (272 / 320) * 360}
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                  cornerRadius={0}
                  activeIndex={activeIndex === 0 ? 0 : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={() => setActiveIndex(0)}
                  onMouseLeave={onPieLeave}
                >
                  <Cell 
                    fill="var(--color-primary)"
                    stroke="none"
                    style={{ 
                      cursor: "pointer",
                      transition: "all 0.2s ease-out"
                    }}
                  />
                </Pie>
                {/* Foreground arc - gradient overlay layer for depth effect */}
                <Pie
                  data={foregroundData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  startAngle={90}
                  endAngle={90 - (272 / 320) * 360}
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                  cornerRadius={0}
                  isAnimationActive={false}
                >
                  <Cell 
                    fill={`url(#${gradientId}-overlay)`}
                    stroke="none"
                    style={{ pointerEvents: "none" }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* 
              Center content - Nielsen Heuristics Applied:
              #1 Visibility of system status - Clear percentage display
              #2 Match between system and real world - Natural "confirmed" label
              #4 Aesthetic and minimalist design - Generous breathing space
              #6 Recognition rather than recall - All info visible at a glance
              
              WCAG AA Accessibility:
              - All text meets 4.5:1 contrast ratio for normal text
              - Large text (percentage) meets 3:1 minimum
            */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="text-center flex flex-col items-center justify-center"
                style={{ 
                  // Breathing space: content sized to ~70% of inner circle
                  width: innerRadius * 1.6,
                  height: innerRadius * 1.6,
                }}
              >
                {/* Primary metric - large, bold, high contrast (WCAG AAA: 7:1+) */}
                <div 
                  className={`font-bold tracking-tight leading-none ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ 
                    fontSize: Math.max(24, chartSize * 0.18),
                  }}
                >
                  {percentage}%
                </div>
                
                {/* Secondary label - WCAG AA compliant (4.5:1+ contrast) */}
                <div 
                  className={`uppercase tracking-widest font-medium ${
                    isDark ? "text-white/70" : "text-gray-600"
                  }`}
                  style={{ 
                    fontSize: Math.max(9, chartSize * 0.055),
                    marginTop: Math.max(4, chartSize * 0.04),
                    letterSpacing: '0.15em',
                  }}
                >
                  confirmed
                </div>
                
                {/* Tertiary context - WCAG AA compliant (4.5:1+ contrast) */}
                <div 
                  className={`tabular-nums ${
                    isDark ? "text-white/60" : "text-gray-500"
                  }`}
                  style={{ 
                    fontSize: Math.max(8, chartSize * 0.045),
                    marginTop: Math.max(2, chartSize * 0.015),
                  }}
                >
                  272 / 320
                </div>
              </div>
            </div>
          </div>
          
          {/* 
            Legend - Nielsen Heuristics:
            #4 Consistency - Matching visual language with gauge
            #6 Recognition - Clear color coding matches arc segments
            
            WCAG AA Accessibility: All text meets 4.5:1 contrast ratio
          */}
          <div className="flex flex-row items-center justify-center gap-4">
            {/* Confirmed - primary emphasis */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--color-primary)" }}
              />
              <span className={`text-sm font-semibold tabular-nums ${
                isDark ? "text-white" : "text-gray-800"
              }`}>
                272
              </span>
              <span className={`text-xs whitespace-nowrap ${
                isDark ? "text-white/70" : "text-gray-600"
              }`}>
                confirmed
              </span>
            </div>
            
            {/* Pending - secondary emphasis */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isDark ? "bg-white/30" : "bg-gray-300"
              }`} />
              <span className={`text-sm font-semibold tabular-nums ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}>
                48
              </span>
              <span className={`text-xs whitespace-nowrap ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}>
                pending
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
