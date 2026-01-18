"use client"

import { Card } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { useColorTheme } from "@/components/color-picker/color-context"
import { useDesignSystem } from "@/components/design-system-context"
import { 
  DropdownMenu, 
  DropdownTrigger, 
  DropdownContent, 
  DropdownItem, 
  DropdownSeparator,
  DropdownLabel 
} from "@/components/ui/dropdown-menu"
import { MoreVertical, User, Settings, Share2, Bell, LogOut } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/toast"

/**
 * User Profile Card - Radix Themes Layout
 * 
 * Implements Radix Themes Community design patterns from Figma frame 58764-4121.
 * Minimalist profile card with profile picture, tags, and menu icon.
 * 
 * DROPDOWN DEMO: Click the ellipsis (⋮) button to see the dropdown menu in action.
 */
export function UserProfileCard() {
  const { mode } = useTheme()
  const { theme } = useColorTheme()
  const { effectPreset } = useDesignSystem()
  const { addToast } = useToast()
  const isDark = mode === "dark"
  const isMonochromatic = effectPreset === "monochromatic"
  
  // In monochromatic mode, use black (light mode) or white (dark mode)
  // Otherwise, use lighter tones (tints) for dark mode, darker tones (shades) for light mode
  // Index 2 = 30% mix, provides good contrast
  const tagColor = isMonochromatic
    ? (isDark ? "#ffffff" : "#000000")
    : (isDark ? theme.tints[2] : theme.shades[2])

  const handleMenuAction = (action: string) => {
    addToast({
      title: `${action}`,
      description: `You clicked "${action}" - this is a demo action`,
      variant: "success",
      duration: 2500,
    })
  }
  
  return (
    <Card className="p-6 h-full flex flex-col">
      {/* Profile Picture and Menu Icon - Same Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
          <Image
            src="/images/dff1d7255654f23e342cabe6f9ffcbfc8188a4c3.png"
            alt="Mary Pereira profile picture"
            fill
            className="object-cover object-top"
            sizes="96px"
            style={{ objectPosition: 'center top' }}
          />
        </div>
        
        {/* Menu Icon - Dropdown Demo */}
        <DropdownMenu>
          <DropdownTrigger
            className={`p-1.5 rounded-md transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] -mt-1 ${
              isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
            }`}
          >
            <MoreVertical className={`w-4 h-4 ${
              isDark ? "text-white/60" : "text-gray-600"
            }`} />
          </DropdownTrigger>
          <DropdownContent align="end" sideOffset={6}>
            <DropdownLabel>Profile Actions</DropdownLabel>
            <DropdownItem 
              icon={<User className="w-4 h-4" />}
              onClick={() => handleMenuAction("View Profile")}
            >
              View Profile
            </DropdownItem>
            <DropdownItem 
              icon={<Settings className="w-4 h-4" />}
              onClick={() => handleMenuAction("Edit Settings")}
            >
              Edit Settings
            </DropdownItem>
            <DropdownItem 
              icon={<Share2 className="w-4 h-4" />}
              onClick={() => handleMenuAction("Share Profile")}
            >
              Share Profile
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem 
              icon={<Bell className="w-4 h-4" />}
              onClick={() => handleMenuAction("Mute Notifications")}
            >
              Mute Notifications
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem 
              icon={<LogOut className="w-4 h-4" />}
              onClick={() => handleMenuAction("Sign Out")}
              destructive
            >
              Sign Out
            </DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </div>

      {/* Name and Title - Below Profile Picture */}
      <div className="mb-4">
        <h3 className={`text-xl font-bold mb-1 ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Mary Pereira
        </h3>
        <p className={`text-sm ${
          isDark ? "text-white/80" : "text-gray-600"
        }`}>
          Product Designer
        </p>
      </div>

      {/* Tags Layout - flex-wrap allows tags to stack when container is narrow */}
      <div className="flex flex-wrap gap-2 flex-1 content-start">
        <span
          className="px-3 py-1.5 rounded-md text-xs font-medium border bg-transparent whitespace-nowrap"
          style={{ 
            borderColor: isMonochromatic 
              ? (isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)")
              : `${tagColor}99`, // 60% opacity
            color: tagColor 
          }}
          role="listitem"
        >
          UI UX Designer
        </span>
        <span
          className="px-3 py-1.5 rounded-md text-xs font-medium border bg-transparent whitespace-nowrap"
          style={{ 
            borderColor: isMonochromatic 
              ? (isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)")
              : `${tagColor}99`, // 60% opacity
            color: tagColor 
          }}
          role="listitem"
        >
          Product Management
        </span>
        <span
          className="px-3 py-1.5 rounded-md text-xs font-medium border bg-transparent whitespace-nowrap"
          style={{ 
            borderColor: isMonochromatic 
              ? (isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)")
              : `${tagColor}99`, // 60% opacity
            color: tagColor 
          }}
          role="listitem"
        >
          AI Engineer
        </span>
      </div>
    </Card>
  )
}
