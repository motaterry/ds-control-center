"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useIsMobile } from "@/lib/use-media-query"

const data = [
  { name: "Mon", value1: 40, value2: 20 },
  { name: "Tue", value1: 50, value2: 25 },
  { name: "Wed", value1: 45, value2: 30 },
  { name: "Thu", value1: 60, value2: 35 },
  { name: "Fri", value1: 55, value2: 40 },
  { name: "Sat", value1: 70, value2: 45 },
  { name: "Sun", value1: 65, value2: 50 },
]

export function AreaChartDemo() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const isMobile = useIsMobile()
  const [activeFilter, setActiveFilter] = useState("7D")
  
  // Responsive chart margins - tighter on mobile to maximize chart area
  const chartMargins = isMobile 
    ? { top: 8, right: 8, left: -10, bottom: 0 }
    : { top: 10, right: 10, left: 0, bottom: 0 }

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
            Revenue Trend
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
        {/* Chart container fills all available horizontal and vertical space */}
        <div className="w-full flex-1 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={chartMargins}>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorComplementary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-complementary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-complementary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
                        {entry.dataKey === "value1" ? "Primary" : "Secondary"} : {entry.value}
                      </div>
                    ))}
                  </div>
                )
              }}
              cursor={{ 
                stroke: isDark 
                  ? "rgba(255, 255, 255, 0.2)" 
                  : "rgba(0, 0, 0, 0.2)",
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }}
            />
            <Area
              type="monotone"
              dataKey="value1"
              stackId="1"
              stroke="var(--color-primary)"
              fill="url(#colorPrimary)"
            />
            <Area
              type="monotone"
              dataKey="value2"
              stackId="1"
              stroke="var(--color-complementary)"
              fill="url(#colorComplementary)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
