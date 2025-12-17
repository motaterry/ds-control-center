"use client"

import React, { useState } from "react"
import { ColorWheel } from "./color-wheel"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import {
  hslToHex,
  formatHsl,
  getContrastRatio,
  getAccessibleTextColor,
  normalizeHex,
} from "@/lib/color-utils"
import { ChevronDown, Palette, Settings, Layers } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { DresscodeLogo } from "@/components/logo/dresscode-logo"
import { Pencil } from "lucide-react"

type TabId = "colors" | "settings" | "palettes"

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

export function ColorSidebarMobile() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("colors")
  const [isScrolled, setIsScrolled] = useState(false)
  const { mode } = useTheme()
  const isDark = mode === "dark"

  // Track scroll position to show/hide header content
  React.useEffect(() => {
    const handleScroll = () => {
      // Threshold: when the inline title would scroll out of view (~80px from top)
      setIsScrolled(window.scrollY > 60)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Top Header Bar */}
      <MobileHeader 
        onOpenControls={() => setIsOpen(true)} 
        isDark={isDark} 
        showTitle={isScrolled}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        snapPoints={[45, 85, 95]}
        initialSnap={1}
        isDark={isDark}
      >
        <div className="flex flex-col h-full">
          {/* Tab Navigation */}
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {activeTab === "colors" && <ColorsTab isDark={isDark} />}
            {activeTab === "settings" && <SettingsTab isDark={isDark} />}
            {activeTab === "palettes" && <PalettesTab isDark={isDark} />}
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

// Mobile Header with Logo and Edit Button (title appears on scroll)
function MobileHeader({
  onOpenControls,
  isDark,
  showTitle,
}: {
  onOpenControls: () => void
  isDark: boolean
  showTitle: boolean
}) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30",
        "flex flex-col px-8 pt-4 pb-4",
        "backdrop-blur-md transition-all duration-300",
        isDark ? "bg-black/60" : "bg-white/70",
        isDark ? "border-b border-white/10" : "border-b border-gray-200"
      )}
    >
      {/* Top row: Logo + Edit button */}
      <div className="flex items-center justify-between">
        <DresscodeLogo className={cn("h-8 w-auto", isDark ? "text-white" : "text-gray-900")} />
        <button
          onClick={onOpenControls}
          aria-label="Open design controls"
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-lg",
            "transition-colors",
            isDark
              ? "hover:bg-white/10 text-white"
              : "hover:bg-gray-100 text-gray-900"
          )}
        >
          <Pencil size={24} />
        </button>
      </div>
      
      {/* Title (slides in when scrolled) */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          showTitle ? "max-h-16 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        )}
      >
        <h1 className={cn(
          "text-lg font-bold tracking-tight",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Control Center Dashboard
        </h1>
        <p className={cn(
          "text-xs",
          isDark ? "text-white/60" : "text-gray-500"
        )}>
          Customize your design system colors
        </p>
      </div>
    </header>
  )
}

// Inline Title shown in content area (scrolls with content)
export function MobileInlineTitle({ isDark }: { isDark: boolean }) {
  return (
    <div className="pt-4 pb-6">
      <h1 className={cn(
        "text-2xl font-bold tracking-tight",
        isDark ? "text-white" : "text-gray-900"
      )}>
        Control Center Dashboard
      </h1>
      <p className={cn(
        "text-sm mt-2",
        isDark ? "text-white/60" : "text-gray-500"
      )}>
        Customize your design system colors
      </p>
    </div>
  )
}

// Tab Bar Component
function TabBar({
  activeTab,
  setActiveTab,
  isDark,
}: {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  isDark: boolean
}) {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "colors", label: "Colors", icon: <Palette size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
    { id: "palettes", label: "Palettes", icon: <Layers size={18} /> },
  ]

  return (
    <div
      className={cn(
        "flex border-b px-2",
        isDark ? "border-white/20" : "border-gray-200"
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-4 px-3",
            "min-h-[48px] transition-colors",
            "border-b-2 -mb-px",
            activeTab === tab.id
              ? isDark
                ? "border-white text-white"
                : "border-gray-900 text-gray-900"
              : isDark
              ? "border-transparent text-white/50 hover:text-white/70"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          {tab.icon}
          <span className="text-sm font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// Colors Tab
function ColorsTab({ isDark }: { isDark: boolean }) {
  const { theme, updatePrimaryFromHex, updateComplementaryFromHex } = useColorTheme()
  const { addToast } = useToast()

  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
  const compHex = hslToHex(
    theme.complementary.h,
    theme.complementary.s,
    theme.complementary.l
  )

  const [customHexInput, setCustomHexInput] = useState(primaryHex)
  const [customCompHexInput, setCustomCompHexInput] = useState(compHex)
  const [isValidHex, setIsValidHex] = useState(true)
  const [isValidCompHex, setIsValidCompHex] = useState(true)

  // Sync inputs when colors change
  React.useEffect(() => {
    setCustomHexInput(primaryHex)
    setIsValidHex(true)
  }, [primaryHex])

  React.useEffect(() => {
    setCustomCompHexInput(compHex)
    setIsValidCompHex(true)
  }, [compHex])

  const handlePrimaryBlur = () => {
    if (!customHexInput.trim()) {
      setCustomHexInput(primaryHex)
      return
    }
    const normalized = normalizeHex(customHexInput)
    if (!normalized) {
      setIsValidHex(false)
      addToast({
        title: "Invalid color",
        description: "Please enter a valid hex color",
        variant: "error",
        duration: 3000,
      })
      return
    }
    updatePrimaryFromHex(normalized)
    setCustomHexInput(normalized)
    setIsValidHex(true)
  }

  const handleCompBlur = () => {
    if (!customCompHexInput.trim()) {
      setCustomCompHexInput(compHex)
      return
    }
    const normalized = normalizeHex(customCompHexInput)
    if (!normalized) {
      setIsValidCompHex(false)
      addToast({
        title: "Invalid color",
        description: "Please enter a valid hex color",
        variant: "error",
        duration: 3000,
      })
      return
    }
    updateComplementaryFromHex(normalized)
    setCustomCompHexInput(normalized)
    setIsValidCompHex(true)
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Color Wheel - scaled for mobile */}
      <div className="flex justify-center">
        <div className="transform scale-90 origin-center">
          <ColorWheel />
        </div>
      </div>

      {/* Primary Color Input */}
      <div className="flex flex-col gap-2">
        <label
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white/70" : "text-gray-600"
          )}
        >
          Primary Color
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={customHexInput}
            onChange={(e) => setCustomHexInput(e.target.value)}
            onBlur={handlePrimaryBlur}
            className={cn(
              "flex-1 h-12 px-4 rounded-lg border font-mono text-base",
              isDark
                ? "bg-white/5 border-white/20 text-white"
                : "bg-gray-50 border-gray-300 text-gray-900",
              !isValidHex && "border-red-500"
            )}
          />
          <input
            type="color"
            value={primaryHex}
            onChange={(e) => {
              updatePrimaryFromHex(e.target.value)
              setCustomHexInput(e.target.value)
            }}
            className="w-12 h-12 rounded-lg cursor-pointer border-0"
            style={{ backgroundColor: primaryHex }}
          />
        </div>
      </div>

      {/* Complementary Color Input */}
      <div className="flex flex-col gap-2">
        <label
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white/70" : "text-gray-600"
          )}
        >
          Complementary Color
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={customCompHexInput}
            onChange={(e) => setCustomCompHexInput(e.target.value)}
            onBlur={handleCompBlur}
            className={cn(
              "flex-1 h-12 px-4 rounded-lg border font-mono text-base",
              isDark
                ? "bg-white/5 border-white/20 text-white"
                : "bg-gray-50 border-gray-300 text-gray-900",
              !isValidCompHex && "border-red-500"
            )}
          />
          <input
            type="color"
            value={compHex}
            onChange={(e) => {
              updateComplementaryFromHex(e.target.value)
              setCustomCompHexInput(e.target.value)
            }}
            className="w-12 h-12 rounded-lg cursor-pointer border-0"
            style={{ backgroundColor: compHex }}
          />
        </div>
      </div>

      {/* Color Info Cards */}
      <div className="flex flex-col gap-4">
        <ColorInfoCardMobile
          label="Primary"
          hex={primaryHex}
          hsl={formatHsl(theme.primary.h, theme.primary.s, theme.primary.l)}
          color={primaryHex}
          isDark={isDark}
        />
        <ColorInfoCardMobile
          label="Secondary"
          hex={compHex}
          hsl={formatHsl(
            theme.complementary.h,
            theme.complementary.s,
            theme.complementary.l
          )}
          color={compHex}
          isDark={isDark}
        />
      </div>
    </div>
  )
}

// Settings Tab
function SettingsTab({ isDark }: { isDark: boolean }) {
  const { mode, setMode } = useTheme()
  const { buttonTextColor, setButtonTextColor, borderRadius, setBorderRadius } =
    useDesignSystem()
  const { theme } = useColorTheme()
  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)

  return (
    <div className="flex flex-col gap-8 pt-4">
      {/* Mode Toggle */}
      <div className="flex flex-col gap-3">
        <span
          className={cn(
            "text-base font-bold",
            isDark ? "text-white/70" : "text-gray-600"
          )}
        >
          Mode
        </span>
        <SegmentedControl
          options={[
            { id: "dark", label: "Dark" },
            { id: "light", label: "Light" },
          ]}
          value={mode}
          onChange={(v) => setMode(v as "dark" | "light")}
          isDark={isDark}
        />
      </div>

      {/* Button Text Color */}
      <div className="flex flex-col gap-3">
        <span
          className={cn(
            "text-base font-bold",
            isDark ? "text-white/70" : "text-gray-600"
          )}
        >
          Button Text Color
        </span>
        <SegmentedControl
          options={[
            { id: "auto", label: "Auto" },
            { id: "dark", label: "Black" },
            { id: "light", label: "White" },
          ]}
          value={buttonTextColor}
          onChange={(v) => setButtonTextColor(v as "auto" | "dark" | "light")}
          isDark={isDark}
        />
        {buttonTextColor === "auto" && (
          <div
            className={cn(
              "text-xs px-3 py-3 rounded-lg",
              isDark ? "bg-white/5 text-white/60" : "bg-gray-100 text-gray-600"
            )}
          >
            <div className="flex justify-between">
              <span>Current:</span>
              <span className="font-semibold">
                {getAccessibleTextColor(primaryHex) === "dark" ? "Black" : "White"}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Contrast:</span>
              <span
                className={cn(
                  "font-mono font-semibold",
                  getContrastRatio(
                    primaryHex,
                    getAccessibleTextColor(primaryHex) === "dark"
                      ? "#111827"
                      : "#FFFFFF"
                  ) >= 4.5
                    ? "text-green-500"
                    : "text-amber-500"
                )}
              >
                {getContrastRatio(
                  primaryHex,
                  getAccessibleTextColor(primaryHex) === "dark"
                    ? "#111827"
                    : "#FFFFFF"
                ).toFixed(2)}
                :1
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Border Radius */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span
            className={cn(
              "text-base font-bold",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            Border Radius
          </span>
          <span
            className={cn(
              "text-sm font-mono",
              isDark ? "text-white/50" : "text-gray-500"
            )}
          >
            {borderRadius}px
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="32"
          step="1"
          value={borderRadius}
          onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
          className={cn(
            "w-full h-12 appearance-none rounded-lg cursor-pointer",
            isDark ? "bg-white/10" : "bg-gray-200"
          )}
          style={{
            WebkitAppearance: "none",
          }}
        />
      </div>
    </div>
  )
}

// Palettes Tab
function PalettesTab({ isDark }: { isDark: boolean }) {
  const { theme } = useColorTheme()
  const [expanded, setExpanded] = useState({
    tints: false,
    shades: false,
    neutralLighter: false,
    neutralDarker: false,
  })

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <PaletteSectionMobile
        title="Lighter Tones (Tints)"
        colors={theme.tints}
        isExpanded={expanded.tints}
        onToggle={() => toggleSection("tints")}
        isDark={isDark}
      />
      <PaletteSectionMobile
        title="Darker Tones (Shades)"
        colors={theme.shades}
        isExpanded={expanded.shades}
        onToggle={() => toggleSection("shades")}
        isDark={isDark}
      />
      <PaletteSectionMobile
        title="Neutral Lighter"
        colors={theme.neutralLighter}
        isExpanded={expanded.neutralLighter}
        onToggle={() => toggleSection("neutralLighter")}
        isDark={isDark}
      />
      <PaletteSectionMobile
        title="Neutral Darker"
        colors={theme.neutralDarker}
        isExpanded={expanded.neutralDarker}
        onToggle={() => toggleSection("neutralDarker")}
        isDark={isDark}
      />
    </div>
  )
}

// Segmented Control Component
function SegmentedControl({
  options,
  value,
  onChange,
  isDark,
}: {
  options: { id: string; label: string }[]
  value: string
  onChange: (value: string) => void
  isDark: boolean
}) {
  return (
    <div
      className={cn(
        "flex rounded-lg p-1",
        isDark ? "bg-white/10" : "bg-gray-200"
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all",
            "min-h-[44px]", // Touch target
            value === option.id
              ? isDark
                ? "bg-white/20 text-white"
                : "bg-white text-gray-900 shadow-sm"
              : isDark
              ? "text-white/50"
              : "text-gray-500"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// Color Info Card for Mobile
function ColorInfoCardMobile({
  label,
  hex,
  hsl,
  color,
  isDark,
}: {
  label: string
  hex: string
  hsl: string
  color: string
  isDark: boolean
}) {
  const { addToast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        title: "Copied!",
        description: `${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch {
      addToast({
        title: "Copy failed",
        description: "Unable to copy",
        variant: "error",
        duration: 3000,
      })
    }
  }

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl",
        isDark ? "bg-white/5" : "bg-gray-50"
      )}
    >
      <div
        className="w-16 h-16 rounded-lg shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex flex-col gap-1 flex-1">
        <span
          className={cn(
            "text-xs uppercase tracking-wide",
            isDark ? "text-white/50" : "text-gray-500"
          )}
        >
          {label}
        </span>
        <button
          onClick={() => copyToClipboard(hex)}
          className={cn(
            "text-left font-mono text-sm min-h-[44px] flex items-center",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {hex}
        </button>
        <button
          onClick={() => copyToClipboard(hsl)}
          className={cn(
            "text-left font-mono text-xs min-h-[44px] flex items-center",
            isDark ? "text-white/70" : "text-gray-600"
          )}
        >
          {hsl}
        </button>
      </div>
    </div>
  )
}

// Palette Section for Mobile
function PaletteSectionMobile({
  title,
  colors,
  isExpanded,
  onToggle,
  isDark,
}: {
  title: string
  colors: string[]
  isExpanded: boolean
  onToggle: () => void
  isDark: boolean
}) {
  const { addToast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        title: "Copied!",
        description: `${text} copied`,
        variant: "success",
        duration: 2000,
      })
    } catch {
      addToast({
        title: "Copy failed",
        variant: "error",
        duration: 3000,
      })
    }
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between py-4 px-4 rounded-lg",
          "min-h-[48px] transition-colors",
          isDark ? "hover:bg-white/5" : "hover:bg-gray-100"
        )}
      >
        <span
          className={cn(
            "text-base",
            isDark ? "text-white/70" : "text-gray-700"
          )}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform",
            isDark ? "text-white/50" : "text-gray-500",
            isExpanded ? "" : "-rotate-90"
          )}
        />
      </button>
      {isExpanded && (
        <div className="grid grid-cols-3 gap-2 mt-2 px-2">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(color)}
              className={cn(
                "flex flex-col gap-2 p-3 rounded-lg",
                "min-h-[80px] transition-colors",
                isDark ? "bg-white/5 active:bg-white/10" : "bg-gray-50 active:bg-gray-100"
              )}
            >
              <div
                className="w-full h-10 rounded-md"
                style={{ backgroundColor: color }}
              />
              <span
                className={cn(
                  "text-xs font-mono",
                  isDark ? "text-white/70" : "text-gray-700"
                )}
              >
                {color}
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  isDark ? "text-white/40" : "text-gray-500"
                )}
              >
                +{PERCENTAGES[index]}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

