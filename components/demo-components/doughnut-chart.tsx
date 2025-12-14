"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const data = [
  { name: "Confirmed", value: 272, color: "var(--color-primary)" },
  { name: "Unconfirmed", value: 48, color: "rgba(255,255,255,0.2)" },
]

const total = 321
const percentage = Math.round((272 / total) * 100)

export function DoughnutChartDemo() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className={`text-lg ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Schedule Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {percentage}%
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "var(--color-primary)" }}
              />
              <span className={`text-sm ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}>
                Scheduled <span className={`font-semibold ${
                  isDark ? "text-[var(--color-primary)]" : "text-[var(--color-primary-darker)]"
                }`}>321</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "var(--color-primary)" }}
              />
              <span className={`text-sm ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}>
                Confirmed <span className={`font-semibold ${
                  isDark ? "text-[var(--color-primary)]" : "text-[var(--color-primary-darker)]"
                }`}>272</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isDark ? "bg-white/20" : "bg-gray-300"
              }`} />
              <span className={`text-sm ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}>
                Unconfirmed <span className={
                  isDark ? "text-white/60" : "text-gray-500"
                }>48</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
