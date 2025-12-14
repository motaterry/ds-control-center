"use client"

import { Card } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { MoreVertical } from "lucide-react"
import Image from "next/image"

/**
 * User Profile Card - Radix Themes Layout
 * 
 * Implements Radix Themes Community design patterns from Figma frame 58764-4121.
 * Minimalist profile card with profile picture, tags, and menu icon.
 */
export function UserProfileCard() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
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
        
        {/* Menu Icon - Aligned with Avatar */}
        <button
          className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] -mt-1 ${
            isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
          }`}
          aria-label="More options"
        >
          <MoreVertical className={`w-4 h-4 ${
            isDark ? "text-white/60" : "text-gray-600"
          }`} />
        </button>
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

      {/* Tags Layout - Matching exact positioning from design */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Top row: Two tags side by side */}
        <div className="flex gap-2">
          <span
            className={`px-3 py-1.5 rounded-md text-xs font-medium border bg-transparent ${
              isDark
                ? "border-[var(--color-primary)]/60 text-[var(--color-primary)]/90"
                : "border-[var(--color-primary-darker)]/60 text-[var(--color-primary-darker)]"
            }`}
            style={isDark ? { filter: 'brightness(1.3)' } : {}}
            role="listitem"
          >
            UI UX Designer
          </span>
          <span
            className={`px-3 py-1.5 rounded-md text-xs font-medium border bg-transparent ${
              isDark
                ? "border-[var(--color-primary)]/60 text-[var(--color-primary)]/90"
                : "border-[var(--color-primary-darker)]/60 text-[var(--color-primary-darker)]"
            }`}
            style={isDark ? { filter: 'brightness(1.3)' } : {}}
            role="listitem"
          >
            Product Management
          </span>
        </div>
        
        {/* Bottom row: Single tag aligned left */}
        <div className="flex gap-2">
          <span
            className={`px-3 py-1.5 rounded-md text-xs font-medium border bg-transparent ${
              isDark
                ? "border-[var(--color-primary)]/60 text-[var(--color-primary)]/90"
                : "border-[var(--color-primary-darker)]/60 text-[var(--color-primary-darker)]"
            }`}
            style={isDark ? { filter: 'brightness(1.3)' } : {}}
            role="listitem"
          >
            AI Engineer
          </span>
        </div>
      </div>
    </Card>
  )
}
