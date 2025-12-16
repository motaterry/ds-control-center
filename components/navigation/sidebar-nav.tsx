"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-context"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DresscodeLogo } from "@/components/logo/dresscode-logo"

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Color System", href: "#color-system" },
  { label: "Components", href: "#components" },
  { label: "Analytics", href: "#analytics" },
]

export function SidebarNav() {
  const { mode } = useTheme()
  const [activeItem, setActiveItem] = useState("/")
  const isDark = mode === "dark"

  return (
    <nav 
      className="flex flex-col gap-2"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn(
        "mb-4 pb-4 border-b",
        isDark ? "border-white/10" : "border-gray-200"
      )}>
        <DresscodeLogo 
          className={cn(
            isDark ? "text-white" : "text-gray-900"
          )}
        />
      </div>
      {navItems.map((item) => {
        const isActive = activeItem === item.href
        
        return (
          <div
            key={item.href}
            className={cn(
              "relative flex items-center h-14 w-full",
              "border rounded-md overflow-hidden transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5",
              isDark 
                ? "border-white/10 bg-transparent hover:border-white/20" 
                : "border-gray-200 bg-transparent hover:border-gray-300"
            )}
          >
            <Link
              href={item.href}
              onClick={() => setActiveItem(item.href)}
              className={cn(
                "flex-1 flex items-center h-full px-4 text-sm transition-all duration-200 ease-out hover:translate-x-1 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isActive
                  ? isDark
                    ? "text-white"
                    : "text-gray-900"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex-1">{item.label}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-9 shrink-0 rounded-l-none rounded-r-md group",
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
              aria-label={`Navigate to ${item.label}`}
            >
              <ChevronRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Button>
          </div>
        )
      })}
    </nav>
  )
}

