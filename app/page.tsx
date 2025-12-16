"use client"

import { ColorSidebar } from "@/components/color-picker/color-sidebar"
import { UserProfileCard } from "@/components/demo-components/user-profile-card"
import { NotificationsPanel } from "@/components/demo-components/notifications-panel"
import { CalendarWidget } from "@/components/demo-components/calendar-widget"
import { BarChartDemo } from "@/components/demo-components/bar-chart"
import { AreaChartDemo } from "@/components/demo-components/area-chart"
import { DoughnutChartDemo } from "@/components/demo-components/doughnut-chart"
import { RadixThemesComponent } from "@/components/demo-components/radix-themes-component"
import { useTheme } from "@/components/theme-context"

export default function ControlCenterPage() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? "bg-black/[0.92]" 
        : "bg-gray-100"
    }`}>
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column - Unified Sidebar matching Figma */}
          <aside className="lg:col-span-4 xl:col-span-3" aria-label="Sidebar">
            <div className="sticky top-0">
              <ColorSidebar />
            </div>
          </aside>

          {/* Right Column - Demo Components */}
          <main className="lg:col-span-8 xl:col-span-9 p-8" aria-label="Design system component previews">
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
