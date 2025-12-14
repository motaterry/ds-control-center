"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function CalendarWidget() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)) // September 2025
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const selectedDay = 27 // Highlight day 27

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const days = []
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
              isDark 
                ? "hover:bg-white/10 focus:ring-offset-slate-800" 
                : "hover:bg-gray-200 focus:ring-offset-white"
            }`}
          >
            <ChevronLeft className={`w-5 h-5 ${
              isDark ? "text-white" : "text-gray-900"
            }`} aria-hidden="true" />
          </button>
          <CardTitle className={`text-lg ${
            isDark ? "text-white" : "text-gray-900"
          }`} id="calendar-month-year">
            {MONTHS[month]}, {year}
          </CardTitle>
          <button
            onClick={goToNextMonth}
            aria-label="Next month"
            className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
              isDark 
                ? "hover:bg-white/10 focus:ring-offset-slate-800" 
                : "hover:bg-gray-200 focus:ring-offset-white"
            }`}
          >
            <ChevronRight className={`w-5 h-5 ${
              isDark ? "text-white" : "text-gray-900"
            }`} aria-hidden="true" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-7 gap-1 mb-2" role="row">
          {DAYS.map((day) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                isDark ? "text-white/60" : "text-gray-600"
              }`}
              role="columnheader"
              aria-label={day}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="calendar-month-year">
          {days.map((day, index) => (
            <button
              key={index}
              className={`aspect-square flex items-center justify-center text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                day === selectedDay
                  ? "bg-[var(--color-primary)] text-white font-semibold"
                  : day
                    ? isDark
                      ? "text-white/80 hover:bg-white/10 cursor-pointer"
                      : "text-gray-900 hover:bg-gray-200 cursor-pointer"
                    : "text-transparent cursor-default"
              }`}
              aria-label={day ? `Day ${day}` : undefined}
              aria-pressed={day === selectedDay}
              disabled={!day}
            >
              {day}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
