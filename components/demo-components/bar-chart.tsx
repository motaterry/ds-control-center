"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

const data = [
  { name: "Mon", value1: 40, value2: 30 },
  { name: "Tue", value1: 50, value2: 35 },
  { name: "Wed", value1: 45, value2: 40 },
  { name: "Thu", value1: 60, value2: 45 },
  { name: "Fri", value1: 55, value2: 50 },
  { name: "Sat", value1: 70, value2: 55 },
  { name: "Sun", value1: 65, value2: 60 },
]

export function BarChartDemo() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const [activeFilter, setActiveFilter] = useState("7D")
  const chartRef = useRef<HTMLDivElement>(null)

  // Calculate hover colors and apply to rectangles
  useEffect(() => {
    if (!chartRef.current) return

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

    const primaryLHover = isDark 
      ? Math.min(100, primaryLNum + 15)
      : Math.max(0, primaryLNum - 15)
    const compLHover = isDark
      ? Math.min(100, compLNum + 15)
      : Math.max(0, compLNum - 15)

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
      const rectangles = chartRef.current!.querySelectorAll('.recharts-rectangle:not([data-hover-setup])')
      
      rectangles.forEach((rect) => {
        const element = rect as SVGPathElement
        const fillAttr = element.getAttribute('fill') || ''
        const computedFill = window.getComputedStyle(element).fill
        
        // Determine which bar series this belongs to
        let isPrimary = false
        if (fillAttr === 'var(--color-primary)' || fillAttr.includes('--color-primary')) {
          isPrimary = true
        } else if (fillAttr === 'var(--color-complementary)' || fillAttr.includes('--color-complementary')) {
          isPrimary = false
        } else {
          // Compare computed colors (normalize RGB to compare)
          const normalizedComputed = computedFill.replace(/\s+/g, '')
          const normalizedPrimary = primaryComputed.replace(/\s+/g, '')
          const normalizedComp = compComputed.replace(/\s+/g, '')
          isPrimary = normalizedComputed === normalizedPrimary
        }
        
        const hoverColor = isPrimary ? primaryHover : compHover
        const originalFill = fillAttr || computedFill
        
        const handleMouseEnter = () => {
          element.style.fill = hoverColor
        }
        
        const handleMouseLeave = () => {
          element.style.fill = originalFill
        }
        
        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)
        element.setAttribute('data-hover-setup', 'true')
        
        // Store original fill and handlers for cleanup
        ;(element as any)._originalFill = originalFill
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

    if (chartRef.current) {
      observer.observe(chartRef.current, { childList: true, subtree: true })
    }

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      
      // Clean up event listeners
      const rectangles = chartRef.current?.querySelectorAll('.recharts-rectangle[data-hover-setup]')
      rectangles?.forEach((rect) => {
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Trade Volume
          </CardTitle>
          <div className="flex gap-1">
            {["1D", "7D", "30D"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="h-7 px-2 text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div ref={chartRef} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%" className="min-h-[200px]">
            <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ 
                fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", 
                fontSize: 12 
              }}
              axisLine={{ 
                stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" 
              }}
            />
            <YAxis
              tick={{ 
                fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", 
                fontSize: 12 
              }}
              axisLine={{ 
                stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" 
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark 
                  ? "rgba(30, 41, 59, 0.95)" 
                  : "rgba(255, 255, 255, 0.95)",
                border: isDark 
                  ? "1px solid rgba(255,255,255,0.1)" 
                  : "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                color: isDark ? "white" : "black",
              }}
            />
            <Bar
              dataKey="value1"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="value2"
              fill="var(--color-complementary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
