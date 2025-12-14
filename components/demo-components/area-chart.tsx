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
  const [activeFilter, setActiveFilter] = useState("7D")

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Revenue Trend
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
        <ResponsiveContainer width="100%" height="100%" className="min-h-[200px]">
          <AreaChart data={data}>
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
      </CardContent>
    </Card>
  )
}
