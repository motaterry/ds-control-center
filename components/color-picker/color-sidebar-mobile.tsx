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
import { ChevronDown, Palette, Settings, Layers, Download, Box } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { DresscodeLogo } from "@/components/logo/dresscode-logo"
import { Pencil } from "lucide-react"
import { ExportModal } from "./export-modal"
import { Switch } from "@/components/ui/switch"

type TabId = "colors" | "settings" | "palettes"

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

export function ColorSidebarMobile() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("colors")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const { mode } = useTheme()
  const { borderRadius } = useDesignSystem()
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
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          {/* Tab Navigation */}
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {activeTab === "colors" && <ColorsTab isDark={isDark} />}
            {activeTab === "settings" && <SettingsTab isDark={isDark} />}
            {activeTab === "palettes" && <PalettesTab isDark={isDark} />}
            
            {/* Export Button - shown on all tabs */}
            <div className="pt-6 pb-8">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className={cn(
                  "w-full py-3.5 px-4 font-semibold flex items-center justify-center gap-2.5",
                  "transition-colors duration-200 ease-out",
                  isDark 
                    ? "bg-white text-gray-900 hover:bg-gray-100" 
                    : "bg-gray-900 text-white hover:bg-gray-800"
                )}
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <Download className="w-5 h-5" />
                Export Theme
              </button>
              <p className={cn(
                "text-xs text-center mt-2.5",
                isDark ? "text-white/50" : "text-gray-500"
              )}>
                Download CSS, SCSS, Tailwind & JSON tokens
              </p>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
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
        "flex flex-col px-4 pt-4 pb-4",
        "backdrop-blur-md transition-all duration-300",
        isDark ? "bg-black/60" : "bg-white/70",
        isDark ? "border-b border-white/10" : "border-b border-gray-200"
      )}
    >
      {/* Top row: Logo + Edit button */}
      <div className="flex items-center justify-between">
        <DresscodeLogo className={cn("h-[18px] w-auto", isDark ? "text-white" : "text-gray-900")} />
        <button
          onClick={onOpenControls}
          aria-label="Open design controls"
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg",
            "transition-colors",
            isDark
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "bg-gray-900 text-white hover:bg-gray-800"
          )}
        >
          <Pencil size={20} />
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

// Tab Bar Component - using outline/border style like desktop
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
    <div className="flex items-stretch px-4 pt-2 pb-4">
      {tabs.map((tab, index) => {
        const isFirst = index === 0
        const isLast = index === tabs.length - 1
        const isSelected = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-3",
              "min-h-[48px] transition-all duration-200 ease-out",
              isFirst && "rounded-l-lg",
              isLast && "rounded-r-lg",
              !isLast && "border-r-0",
              isSelected
                ? isDark
                  ? "bg-white/10 border border-white/50"
                  : "bg-gray-200 border border-gray-300"
                : isDark
                ? "bg-transparent border border-white/50"
                : "bg-transparent border border-gray-300"
            )}
            aria-pressed={isSelected}
          >
            <span className={cn(
              isSelected
                ? isDark ? "text-white" : "text-gray-900"
                : isDark ? "text-white/40" : "text-gray-400"
            )}>
              {tab.icon}
            </span>
            <span className={cn(
              "text-sm font-bold",
              isSelected
                ? isDark ? "text-white" : "text-gray-900"
                : isDark ? "text-white/40" : "text-gray-400"
            )}>
              {tab.label}
            </span>
          </button>
        )
      })}
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
      {/* Color Wheel - larger for mobile touch interaction */}
      <div className="flex justify-center w-full px-2">
        <div className="w-full max-w-[320px]">
          <ColorWheel />
        </div>
      </div>

      {/* Primary Color Input */}
      <div className="flex flex-col gap-2">
        <label
          className={cn(
            "text-sm font-semibold leading-5",
            isDark ? "text-[#bbb]" : "text-gray-600"
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
            "text-sm font-semibold leading-5",
            isDark ? "text-[#bbb]" : "text-gray-600"
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
      <div className="flex flex-col gap-[21px]">
        <ColorInfoCardMobile
          label="Primary"
          hex={primaryHex}
          hsl={formatHsl(theme.primary.h, theme.primary.s, theme.primary.l)}
          color={primaryHex}
          isDark={isDark}
        />
        
        {/* Divider between cards - matching desktop */}
        <div className={cn(
          "h-px w-full",
          isDark ? "border-t border-white/50" : "border-t border-gray-300"
        )} />
        
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

// Settings Tab - using styles consistent with desktop
function SettingsTab({ isDark }: { isDark: boolean }) {
  const { mode, setMode } = useTheme()
  const { buttonTextColor, setButtonTextColor, borderRadius, setBorderRadius, enable3D, setEnable3D } =
    useDesignSystem()
  const { theme } = useColorTheme()
  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)

  return (
    <div className="flex flex-col gap-8 pt-4">
      {/* Mode Toggle */}
      <div className="flex flex-col gap-3">
        <span
          className={cn(
            "text-lg font-bold leading-[26px] tracking-[-0.04px]",
            isDark ? "text-[#bbb]" : "text-gray-600"
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
            "text-lg font-bold leading-[26px] tracking-[-0.04px]",
            isDark ? "text-[#bbb]" : "text-gray-600"
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
              "text-xs px-3 py-2.5 rounded-lg mt-1",
              isDark ? "bg-white/5 text-[#bbb]" : "bg-gray-100 text-gray-600"
            )}
          >
            <div className="flex justify-between items-center">
              <span>Current text:</span>
              <span className="font-semibold">
                {getAccessibleTextColor(primaryHex) === "dark" ? "Black" : "White"}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span>Contrast ratio:</span>
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
              "text-lg font-bold leading-[26px] tracking-[-0.04px]",
              isDark ? "text-[#bbb]" : "text-gray-600"
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
        <div className="relative group py-2">
          <div 
            className={cn(
              "h-[10px] rounded-full w-full transition-all duration-200 ease-out group-hover:shadow-sm",
              isDark 
                ? "bg-[rgba(217,217,217,0.1)] border border-white/50 group-hover:border-white/70" 
                : "bg-gray-200 border border-gray-300 group-hover:border-gray-400"
            )}
          />
          <input
            type="range"
            min="0"
            max="32"
            step="1"
            value={borderRadius}
            onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Border radius slider"
            aria-valuemin={0}
            aria-valuemax={32}
            aria-valuenow={Number(borderRadius)}
          />
          {/* Slider thumb indicator - bigger with darker border like desktop */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg border-2 pointer-events-none transition-all duration-200 ease-out"
            style={{ 
              left: `calc(${(borderRadius / 32) * 100}% - 12px)`,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              borderColor: isDark ? '#555555' : '#374151'
            }}
          />
        </div>
      </div>

      {/* 3D Effects Toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2.5 items-center">
          <Box 
            size={16} 
            className={isDark ? "text-white" : "text-gray-900"}
          />
          <span
            className={cn(
              "text-lg font-bold leading-[26px] tracking-[-0.04px]",
              isDark ? "text-[#bbb]" : "text-gray-600"
            )}
          >
            3D Effects
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-sm",
            isDark ? "text-white/70" : "text-gray-600"
          )}>
            {enable3D ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={enable3D}
            onCheckedChange={setEnable3D}
            aria-label="Toggle 3D effects"
          />
        </div>
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
        title="Lighter Tones"
        colors={theme.tints}
        isExpanded={expanded.tints}
        onToggle={() => toggleSection("tints")}
        isDark={isDark}
      />
      <PaletteSectionMobile
        title="Darker Tones"
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

// Segmented Control Component - using outline/border style like desktop
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
    <div className="flex items-stretch w-full">
      {options.map((option, index) => {
        const isFirst = index === 0
        const isLast = index === options.length - 1
        const isSelected = value === option.id
        
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex-1 h-12 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer",
              "min-h-[48px]", // Touch target
              isFirst && "rounded-l-lg",
              isLast && "rounded-r-lg",
              !isLast && "border-r-0",
              isSelected
                ? isDark
                  ? "bg-white/10 border border-white/50"
                  : "bg-gray-200 border border-gray-300"
                : isDark
                ? "bg-transparent border border-white/50"
                : "bg-transparent border border-gray-300"
            )}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                "text-base font-bold",
                isSelected
                  ? isDark
                    ? "text-white"
                    : "text-gray-900"
                  : isDark
                  ? "text-white/40"
                  : "text-gray-400"
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Color Info Card for Mobile - using outline/border style like desktop
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
        description: `${label} ${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch {
      addToast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "error",
        duration: 3000,
      })
    }
  }

  return (
    <div className="flex gap-4 items-start">
      {/* Color Swatch */}
      <div
        className="rounded-lg shrink-0 w-[76px] self-stretch min-h-[60px]"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      
      {/* Color Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <p className={cn(
          "text-[11px] uppercase tracking-wide leading-5",
          isDark ? "text-[#c5c1bd]" : "text-gray-600"
        )}>
          {label}
        </p>
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] leading-5 min-h-[36px]">
            <span className={isDark ? "text-[#c5c1bd]" : "text-gray-600"}>HEX</span>
            <button
              onClick={() => copyToClipboard(hex)}
              className={cn(
                "hover:opacity-80 transition-colors font-mono cursor-pointer",
                isDark ? "text-white" : "text-gray-900"
              )}
              aria-label={`Copy ${label} hex value: ${hex}`}
            >
              {hex}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] leading-5 min-h-[36px]">
            <span className={isDark ? "text-[#c5c1bd]" : "text-gray-600"}>HSL</span>
            <button
              onClick={() => copyToClipboard(hsl)}
              className={cn(
                "hover:opacity-80 transition-colors font-mono cursor-pointer",
                isDark ? "text-white" : "text-gray-900"
              )}
              aria-label={`Copy ${label} HSL value: ${hsl}`}
            >
              {hsl}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Palette Section for Mobile - using outline/border style like desktop
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
        description: `Color ${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch {
      addToast({
        title: "Copy failed",
        description: "Unable to copy color to clipboard",
        variant: "error",
        duration: 3000,
      })
    }
  }

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`palette-section-mobile-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className={cn(
          "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-lg",
          "transition-all duration-200 ease-out cursor-pointer",
          "focus:outline-none focus:ring-1",
          isDark 
            ? "hover:bg-white/5 focus:ring-white/30" 
            : "hover:bg-gray-200 focus:ring-gray-400"
        )}
      >
        <span className={cn(
          "text-lg leading-[26px] tracking-[-0.04px]",
          isDark ? "text-[#bbb]" : "text-gray-700"
        )}>
          {title}
        </span>
        <div className="h-12 w-8 flex items-center justify-center">
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform duration-300 ease-out",
              isDark ? "text-[#bbb]" : "text-gray-700",
              isExpanded ? "" : "-rotate-90"
            )}
            aria-hidden="true"
          />
        </div>
      </button>
      {isExpanded && (
        <div
          id={`palette-section-mobile-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="grid grid-cols-3 gap-3 mt-4"
          role="region"
          aria-label={`${title} color swatches`}
        >
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(color)}
              aria-label={`Copy color ${color} to clipboard`}
              className={cn(
                "backdrop-blur-sm border rounded-xl p-3 flex flex-col gap-2",
                "cursor-pointer transition-all duration-200 ease-out",
                "hover:shadow-lg focus:outline-none focus:ring-1",
                isDark 
                  ? "bg-neutral-800/70 border-neutral-700/30 focus:ring-white/30" 
                  : "bg-neutral-50 border-neutral-300/50 focus:ring-gray-400"
              )}
            >
              <div
                className="w-full h-12 rounded-lg shadow-inner"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1 text-xs overflow-hidden">
                <span className={cn(
                  "font-mono font-semibold truncate",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {color}
                </span>
                <span 
                  className={isDark ? "text-slate-400" : "text-gray-600"} 
                  style={{ fontSize: "10px" }}
                >
                  +{PERCENTAGES[index]}%
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

