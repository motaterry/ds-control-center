"use client"

import { ColorSidebar } from "@/components/color-picker/color-sidebar"
import { UserProfileCard } from "@/components/demo-components/user-profile-card"
import { NotificationsPanel } from "@/components/demo-components/notifications-panel"
import { ContentCard } from "@/components/demo-components/content-card"
import { CalendarWidget } from "@/components/demo-components/calendar-widget"
import { BarChartDemo } from "@/components/demo-components/bar-chart"
import { AreaChartDemo } from "@/components/demo-components/area-chart"
import { DoughnutChartDemo } from "@/components/demo-components/doughnut-chart"
import { RadixThemesComponent } from "@/components/demo-components/radix-themes-component"
import { Card } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"

export default function ControlCenterPage() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
  return (
    <div className={`min-h-screen p-6 transition-colors ${
      isDark 
        ? "bg-gradient-to-br from-black via-slate-950 to-black" 
        : "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100"
    }`}>
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 transition-colors ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Control Center Dashboard
          </h1>
          <p className={isDark ? "text-white/60" : "text-gray-600"}>
            Customize your design system colors and see them update in real-time
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Color Sidebar */}
          <aside className="lg:col-span-3" aria-label="Color customization panel">
            <Card className="p-0 overflow-hidden">
              <ColorSidebar />
            </Card>
          </aside>

          {/* Right Column - Demo Components */}
          <main className="lg:col-span-9" aria-label="Design system component previews">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {/* Two smaller cards stacked to match height of larger cards */}
              <div className="flex flex-col gap-6 min-h-full">
                <div className="flex-1">
              <UserProfileCard />
            </div>
                <div className="flex-1">
                <CalendarWidget />
              </div>
            </div>

              {/* Larger cards - all have consistent height */}
              <div className="h-full">
                <NotificationsPanel />
              </div>
              <div className="h-full">
                <ContentCard />
              </div>
              <div className="h-full">
                <RadixThemesComponent />
              </div>
              <div className="h-full">
              <BarChartDemo />
              </div>
              <div className="h-full">
              <AreaChartDemo />
              </div>
              <div className="h-full">
              <DoughnutChartDemo />
            </div>
          </div>
          </main>
        </div>
      </div>
    </div>
  )
}
