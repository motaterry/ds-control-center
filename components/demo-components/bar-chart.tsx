"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useId } from "react"
import { useIsMobile } from "@/lib/use-media-query"

const data = [
  { name: "Mon", value1: 40, value2: 30 },
  { name: "Tue", value1: 50, value2: 35 },
  { name: "Wed", value1: 45, value2: 40 },
  { name: "Thu", value1: 60, value2: 45 },
  { name: "Fri", value1: 55, value2: 50 },
  { name: "Sat", value1: 70, value2: 55 },
  { name: "Sun", value1: 65, value2: 60 },
]

// SVG Gradient definitions component with layered effect
// Creates a complex gradient that simulates: radial-gradient overlay + base color
// CSS Reference:
// Orange: radial-gradient(114.55% 148.93% at 7.05% -0.93%, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.20) 100%), #FF6C05
// Blue: radial-gradient(114.55% 148.93% at 7.05% -0.93%, rgba(255,255,255,0.60) 0%, rgba(0,0,0,0.40) 100%), #1472FF

// No global gradient definitions needed - we create per-bar gradients for proper positioning

// Custom bar shape that renders with layered gradients
interface GradientBarProps {
  x?: number
  y?: number
  width?: number
  height?: number
  chartId: string
  isPrimary: boolean
  isDark: boolean
}

const GradientBar = ({ x = 0, y = 0, width = 0, height = 0, chartId, isPrimary, isDark }: GradientBarProps) => {
  if (height <= 0 || width <= 0) return null
  
  // Create sharp-cornered rectangle path
  const path = `
    M ${x},${y + height}
    L ${x},${y}
    L ${x + width},${y}
    L ${x + width},${y + height}
    Z
  `.trim()
  
  // Unique IDs for this specific bar
  const uniqueId = `${chartId}-${isPrimary ? 'p' : 'c'}-${Math.round(x)}-${Math.round(y)}`
  const gradientId = `${uniqueId}-grad`
  
  // === DARK MODE ===
  // Orange: radial-gradient(at 7.05% -0.93%, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.20) 100%), #FF6C05
  // Blue: radial-gradient(at 7.05% -0.93%, rgba(255,255,255,0.60) 0%, rgba(0,0,0,0.40) 100%), #1472FF
  //
  // === LIGHT MODE ===
  // Primary: radial-gradient(95.65% 121.32% at 7.05% -0.93%, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.00) 100%), #FF6C05
  // Secondary: radial-gradient(114.55% 148.93% at 7.05% -0.93%, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.00) 100%), #1472FF
  
  // Gradient configuration based on theme
  let startColor: string
  let endColor: string
  let startOpacity: number
  let endOpacity: number
  
  if (isDark) {
    // Dark mode: white highlight → black shadow
    startColor = "white"
    endColor = "black"
    startOpacity = isPrimary ? 0.50 : 0.60
    endOpacity = isPrimary ? 0.20 : 0.40
  } else {
    // Light mode: white highlight → transparent white (no black shadow)
    startColor = "white"
    endColor = "white"
    startOpacity = 0.50
    endOpacity = 0.00
  }
  
  // Base fill color
  const baseFill = isPrimary ? "var(--color-primary)" : "var(--color-complementary)"
  
  return (
    <g className="gradient-bar">
      <defs>
        {/* 
          Radial gradient matching CSS:
          radial-gradient(114.55% 148.93% at 7.05% -0.93%, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.20) 100%)
          
          - Center: 7.05% from left, -0.93% from top (slightly above element)
          - Size: ~130% radius to approximate the elliptical 114.55% x 148.93%
        */}
        <radialGradient
          id={gradientId}
          cx="0.0705"
          cy="-0.0093"
          r="1.3"
          fx="0.0705"
          fy="-0.0093"
        >
          <stop offset="0%" stopColor={startColor} stopOpacity={startOpacity} />
          <stop offset="100%" stopColor={endColor} stopOpacity={endOpacity} />
        </radialGradient>
      </defs>
      
      {/* Base color layer */}
      <path
        d={path}
        fill={baseFill}
        className="recharts-rectangle"
      />
      
      {/* Radial gradient overlay - creates depth */}
      <path
        d={path}
        fill={`url(#${gradientId})`}
      />
    </g>
  )
}

export function BarChartDemo() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const isMobile = useIsMobile()
  const [activeFilter, setActiveFilter] = useState("7D")
  const chartRef = useRef<HTMLDivElement>(null)
  const rawChartId = useId()
  const chartId = rawChartId.replace(/:/g, '') // Sanitize for SVG ID compatibility
  
  // Responsive chart margins - tighter on mobile to maximize chart area
  const chartMargins = isMobile 
    ? { top: 8, right: 8, left: -10, bottom: 0 }
    : { top: 10, right: 10, left: 0, bottom: 0 }

  // Calculate hover colors and apply to rectangles
  useEffect(() => {
    // Cache the ref value at the start of the effect for proper cleanup
    const chartElement = chartRef.current
    if (!chartElement) return

    const root = document.documentElement
    const primaryH = getComputedStyle(root).getPropertyValue('--primary-h').trim()
    const primaryS = getComputedStyle(root).getPropertyValue('--primary-s').trim()
    const primaryL = getComputedStyle(root).getPropertyValue('--primary-l').trim()
    const compH = getComputedStyle(root).getPropertyValue('--comp-h').trim()
    const compS = getComputedStyle(root).getPropertyValue('--comp-s').trim()
    const compL = getComputedStyle(root).getPropertyValue('--comp-l').trim()

    // Parse lightness values (remove % if present)
    const primaryLNum = parseFloat(primaryL.replace('%', ''))
    const compLNum = parseFloat(compL.replace('%', ''))

    const primaryLHover = Math.min(100, primaryLNum + 15)
    const compLHover = Math.min(100, compLNum + 15)

    const primaryHover = `hsl(${primaryH}, ${primaryS}, ${primaryLHover}%)`
    const compHover = `hsl(${compH}, ${compS}, ${compLHover}%)`

    // Get computed primary and complementary colors for comparison
    const testEl = document.createElement('div')
    testEl.style.setProperty('color', 'var(--color-primary)')
    document.body.appendChild(testEl)
    const primaryComputed = window.getComputedStyle(testEl).color
    testEl.style.setProperty('color', 'var(--color-complementary)')
    const compComputed = window.getComputedStyle(testEl).color
    document.body.removeChild(testEl)

    const setupHoverHandlers = () => {
      // Find all rectangles that don't already have handlers
      const rectangles = chartElement.querySelectorAll('.recharts-rectangle:not([data-hover-setup])')
      
      rectangles.forEach((rect) => {
        const element = rect as SVGPathElement
        const fillAttr = element.getAttribute('fill') || ''
        const computedFill = window.getComputedStyle(element).fill
        
        // Determine which bar series this belongs to
        let isPrimary = false
        if (fillAttr.includes('primary') || fillAttr === 'var(--color-primary)') {
          isPrimary = true
        } else if (fillAttr.includes('comp') || fillAttr === 'var(--color-complementary)') {
          isPrimary = false
        } else {
          // Compare computed colors (normalize RGB to compare)
          const normalizedComputed = computedFill.replace(/\s+/g, '')
          const normalizedPrimary = primaryComputed.replace(/\s+/g, '')
          isPrimary = normalizedComputed === normalizedPrimary
        }
        
        const handleMouseEnter = () => {
          element.style.filter = 'brightness(1.15)'
        }
        
        const handleMouseLeave = () => {
          element.style.filter = ''
        }
        
        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)
        element.setAttribute('data-hover-setup', 'true')
        
        // Store handlers for cleanup
        ;(element as any)._hoverHandlers = { handleMouseEnter, handleMouseLeave }
      })
    }

    // Wait for chart to render, then setup handlers
    let timeoutId = setTimeout(setupHoverHandlers, 150)

    // Setup handlers when DOM changes (chart re-renders)
    const observer = new MutationObserver(() => {
      // Debounce to avoid excessive calls
      clearTimeout(timeoutId)
      timeoutId = setTimeout(setupHoverHandlers, 50)
    })

    observer.observe(chartElement, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      
      // Clean up event listeners using the cached chartElement reference
      const rectangles = chartElement.querySelectorAll('.recharts-rectangle[data-hover-setup]')
      rectangles.forEach((rect) => {
        const element = rect as SVGPathElement
        const handlers = (element as any)._hoverHandlers
        if (handlers) {
          element.removeEventListener('mouseenter', handlers.handleMouseEnter)
          element.removeEventListener('mouseleave', handlers.handleMouseLeave)
          element.removeAttribute('data-hover-setup')
        }
      })
    }
  }, [isDark, mode, activeFilter])

  return (
    <Card className="h-full flex flex-col w-full">
      {/* 
        Nielsen #4: Consistency - Matching header style across all chart cards
        Nielsen #8: Aesthetic design - Clean spacing hierarchy
      */}
      <CardHeader className="pb-2 pt-5 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className={`text-base sm:text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Trade Volume
          </CardTitle>
          <div className="flex gap-1.5">
            {["1D", "7D", "30D"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="h-7 px-2.5 text-xs font-medium"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-0 pb-4 px-4 sm:px-5">
        {/* Chart container fills all available space */}
        <div ref={chartRef} className="w-full flex-1 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chartMargins}>
            <XAxis
              dataKey="name"
              tick={{ 
                fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", 
                fontSize: isMobile ? 10 : 12 
              }}
              axisLine={{ 
                stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" 
              }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ 
                fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", 
                fontSize: isMobile ? 9 : 12 
              }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 28 : 40}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const primaryColor = isDark 
                  ? "hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) + 15%))"
                  : "hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) - 15%))"
                const compColor = isDark
                  ? "hsl(var(--comp-h), var(--comp-s), calc(var(--comp-l) + 15%))"
                  : "hsl(var(--comp-h), var(--comp-s), calc(var(--comp-l) - 15%))"
                return (
                  <div style={{
                    backgroundColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "6px",
                    fontSize: "11px",
                    padding: "6px 10px",
                    lineHeight: "1.3",
                    backdropFilter: "blur(4px)",
                  }}>
                    <div style={{
                      fontWeight: 500,
                      marginBottom: "2px",
                      color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                    }}>{label}</div>
                    {payload.map((entry, index) => (
                      <div key={index} style={{
                        color: entry.dataKey === "value1" ? primaryColor : compColor,
                        padding: "1px 0",
                        fontWeight: 600,
                      }}>
                        {entry.dataKey} : {entry.value}
                      </div>
                    ))}
                  </div>
                )
              }}
              cursor={{ 
                fill: isDark 
                  ? "rgba(255, 255, 255, 0.03)" 
                  : "rgba(0, 0, 0, 0.03)" 
              }}
            />
            <Bar
              dataKey="value1"
              shape={(props: any) => (
                <GradientBar
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  chartId={chartId}
                  isPrimary={true}
                  isDark={isDark}
                />
              )}
            />
            <Bar
              dataKey="value2"
              shape={(props: any) => (
                <GradientBar
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  chartId={chartId}
                  isPrimary={false}
                  isDark={isDark}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
