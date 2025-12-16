"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ColorWheel } from "./color-wheel"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { hslToHex, formatHsl, getContrastRatio, getAccessibleTextColor } from "@/lib/color-utils"
import { ChevronDown, Moon, Type, SquareIcon } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { DresscodeLogo } from "@/components/logo/dresscode-logo"

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

// Logo component - uses the full logo from SVG file
function LogoIcon({ isDark }: { isDark: boolean }) {
  return (
    <DresscodeLogo 
      className={isDark ? "text-white" : "text-gray-900"}
    />
  )
}

// Mode icon component
function ModeIcon({ isDark }: { isDark: boolean }) {
  const fillColor = isDark ? "#FCFCFD" : "#111827"
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.7125 11.9623C13.7953 12.2517 13.5904 12.5175 13.3028 12.4939L10.4517 12.2643L9.2249 14.8483C9.10155 15.1091 8.76897 15.1536 8.58467 14.9439L6.73677 12.7653L4.0222 13.7214C3.75773 13.8109 3.49196 13.6061 3.51558 13.3184L3.74511 10.4673L1.16118 9.24051C0.900291 9.11716 0.855798 8.78458 1.06551 8.60028L3.25079 6.72744L2.28802 4.03781C2.19856 3.77334 2.40338 3.50756 2.69099 3.53118L5.54213 3.76071L6.74399 1.1701C6.86734 0.909217 7.19992 0.864724 7.40916 1.08112L9.28199 3.2664L11.9783 2.2787C12.2428 2.18923 12.5086 2.39405 12.4849 2.68166L12.2554 5.53281L14.8393 6.7596C15.1002 6.88295 15.1447 7.21553 14.9283 7.42476L12.7497 9.27267L13.7125 11.9623ZM7.15763 11.1946C8.90284 11.6623 10.7047 10.6219 11.179 8.8518C11.64 7.13153 10.5814 5.29804 8.86113 4.83709C7.11592 4.36946 5.28911 5.4031 4.82148 7.14831C4.35385 8.89351 5.38749 10.7203 7.15763 11.1946Z" fill={fillColor}/>
    </svg>
  )
}

// Text color icon component
function TextColorIcon({ isDark }: { isDark: boolean }) {
  const fillColor = isDark ? "#FCFCFD" : "#111827"
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.125 2.76367V4.51367C14.125 4.97852 13.7148 5.38867 13.25 5.38867C12.7578 5.38867 12.375 4.97852 12.375 4.51367V3.63867H8.875V12.3887H10.1875C10.6523 12.3887 11.0625 12.7715 11.0625 13.2637C11.0625 13.7285 10.6523 14.1113 10.1875 14.1113H5.8125C5.32031 14.1113 4.9375 13.7012 4.9375 13.2637C4.9375 12.7988 5.32031 12.3887 5.8125 12.3887H7.125V3.63867H3.625V4.51367C3.625 4.97852 3.21484 5.38867 2.75 5.38867C2.25781 5.38867 1.875 4.97852 1.875 4.51367V2.76367C1.875 2.27148 2.25781 1.88867 2.75 1.88867H13.25C13.7148 1.88867 14.125 2.27148 14.125 2.76367Z" fill={fillColor}/>
    </svg>
  )
}

// Border radius icon component
function BorderRadiusIcon({ isDark }: { isDark: boolean }) {
  const fillColor = isDark ? "#FCFCFD" : "#111827"
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.70117 12.3926H6.30664V14.0928H2V9.31543H3.70117V12.3926ZM14.001 14.0928H9.69434V12.3926H12.3008V9.31543H14.001V14.0928ZM6.30664 3.6084H3.70117V6.68457H2V1.90723H6.30664V3.6084ZM14.001 6.68457H12.3008V3.6084H9.69434V1.90723H14.001V6.68457Z" fill={fillColor}/>
    </svg>
  )
}

export function ColorSidebar() {
  const { theme } = useColorTheme()
  const { mode, setMode } = useTheme()
  const { buttonTextColor, setButtonTextColor, borderRadius, setBorderRadius } = useDesignSystem()
  const [expanded, setExpanded] = useState({
    tints: false,
    shades: false,
    neutralLighter: false,
    neutralDarker: false,
  })
  const [isLogoStuck, setIsLogoStuck] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
  const compHex = hslToHex(
    theme.complementary.h,
    theme.complementary.s,
    theme.complementary.l
  )

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const isDark = mode === "dark"

  // Detect when logo is stuck at the top using IntersectionObserver (more performant)
  useEffect(() => {
    const sentinel = sentinelRef.current
    const sidebar = sidebarRef.current
    if (!sentinel || !sidebar) return

    let hasBeenStuck = false

    const checkScrollPosition = () => {
      if (!hasBeenStuck) return // Only check if we've been stuck
      
      const scrollTop = sidebar.scrollTop
      // Only unstick when back at the very top
      if (scrollTop <= 10) {
        hasBeenStuck = false
        setIsLogoStuck(false)
      } else {
        // Keep it stuck - don't let it unstick
        setIsLogoStuck(true)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting
        
        // When sentinel goes out of view, logo becomes stuck
        if (!isIntersecting) {
          hasBeenStuck = true
          setIsLogoStuck(true)
        }
        // When sentinel is visible again, check scroll position
        // but don't automatically unstick - only unstick if at top
        if (isIntersecting && hasBeenStuck) {
          checkScrollPosition()
        }
      },
      {
        root: sidebar,
        rootMargin: '-8px 0px 0px 0px', // Account for padding
        threshold: 0
      }
    )

    observer.observe(sentinel)
    
    // Continuously check scroll position to ensure it stays stuck
    sidebar.addEventListener('scroll', checkScrollPosition, { passive: true })

    return () => {
      observer.disconnect()
      sidebar.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  return (
    <div 
      ref={sidebarRef}
      className="p-8 max-h-screen overflow-y-auto scroll-smooth"
      style={{ 
        backgroundColor: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(249,250,251,0.98)',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        transform: 'translateZ(0)',
        willChange: 'scroll-position',
        overscrollBehaviorY: 'contain'
      }}
    >
      {/* Main container with border */}
      <div 
        className={`flex flex-col gap-8 rounded-3xl border relative ${
          isDark ? 'bg-black border-white/50' : 'bg-white border-gray-300'
        }`}
      >
        {/* Sentinel element for IntersectionObserver - invisible marker at top */}
        <div 
          ref={sentinelRef}
          className="absolute top-0 left-0 w-full h-1 pointer-events-none"
          style={{ visibility: 'hidden' }}
          aria-hidden="true"
        />
        
        {/* Logo - Sticky at top when scrolled - now direct child of main container */}
        <div 
          ref={logoRef}
          className={cn(
            "px-8 pb-4 pt-8 rounded-t-3xl",
            isLogoStuck && "sticky z-10 border-b",
            isLogoStuck && (isDark ? 'border-white/50' : 'border-gray-300'),
            isDark ? 'bg-black' : 'bg-white'
          )}
          style={{
            willChange: isLogoStuck ? 'transform' : 'auto',
            transform: 'translateZ(0)',
            ...(isLogoStuck && { top: 'var(--logo-sticky-offset)' })
          }}
        >
          <div className="flex gap-2.5 items-center">
            <LogoIcon isDark={isDark} />
          </div>
        </div>

        {/* Header Section - Title & Description */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8 px-8">
            <h1 className={`text-[35px] font-bold leading-[40px] tracking-[-0.16px] ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Control Center Dashboard
            </h1>
            <p className={`text-lg leading-[26px] tracking-[-0.04px] ${
              isDark ? 'text-[#bbb]' : 'text-gray-600'
            }`}>
              Customize your design system colors and see them update in real-time
            </p>
            
            {/* Author credit line */}
            <div className={`border-t pt-2 flex justify-end ${
              isDark ? 'border-white/50' : 'border-gray-300'
            }`}>
              <span 
                className={`text-[10px] lowercase tracking-[0.5px] italic ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                style={{ fontFamily: "'Aktiv Grotesk Ex', sans-serif" }}
              >
                by Tercio Mota
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px w-full ${isDark ? 'bg-white/50' : 'bg-gray-300'}`} />

        {/* Color Wheel Section */}
        <div className="flex flex-col gap-[42px] items-center px-8">
          <ColorWheel />
          
          {/* Color Info Cards */}
          <div className="flex flex-col gap-[21px] w-full">
            <ColorInfoCard
              label="Primary"
              hex={primaryHex}
              hsl={formatHsl(theme.primary.h, theme.primary.s, theme.primary.l)}
              color={primaryHex}
            />
            
            {/* Divider between cards */}
            <div className={`h-px w-full ${isDark ? 'border-t border-white/50' : 'border-t border-gray-300'}`} />
            
            <ColorInfoCard
              label="Complementary"
              hex={compHex}
              hsl={formatHsl(
                theme.complementary.h,
                theme.complementary.s,
                theme.complementary.l
              )}
              color={compHex}
            />
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px w-full ${isDark ? 'bg-white/50' : 'bg-gray-300'}`} />

        {/* Control Sections Container - Mode, Button Text, Border Radius, Palettes */}
        <div className="flex flex-col px-8" style={{ gap: 'var(--section-gap)' }}>
          {/* Mode Toggle Section */}
          <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center px-1">
            <ModeIcon isDark={isDark} />
            <span className={`text-lg font-bold leading-[26px] tracking-[-0.04px] ${
              isDark ? 'text-[#bbb]' : 'text-gray-600'
            }`}>
              Mode
            </span>
          </div>
          
          <div className="flex items-stretch w-full">
            <button
              onClick={() => setMode("dark")}
              className={`flex-1 h-12 flex items-center justify-center rounded-l-lg transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                mode === "dark"
                  ? isDark 
                    ? "bg-white/10 border border-r-0 border-white/50" 
                    : "bg-gray-200 border border-r-0 border-gray-300"
                  : isDark
                    ? "bg-transparent border border-r-0 border-white/50"
                    : "bg-transparent border border-r-0 border-gray-300"
              }`}
              aria-pressed={mode === "dark"}
              aria-label="Dark Mode"
            >
              <span className={`text-lg font-bold ${
                mode === "dark" 
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                Dark
              </span>
            </button>
            <button
              onClick={() => setMode("light")}
              className={`flex-1 h-12 flex items-center justify-center rounded-r-lg transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                mode === "light"
                  ? isDark
                    ? "bg-white/10 border border-white/50"
                    : "bg-gray-200 border border-gray-300"
                  : isDark
                    ? "bg-transparent border border-white/50"
                    : "bg-transparent border border-gray-300"
              }`}
              aria-pressed={mode === "light"}
              aria-label="Light Mode"
            >
              <span className={`text-lg font-bold ${
                mode === "light"
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                Light
              </span>
            </button>
          </div>
          </div>

          {/* Button Text Color Section */}
          <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center px-1">
            <TextColorIcon isDark={isDark} />
            <span className={`text-lg font-bold leading-[26px] tracking-[-0.04px] ${
              isDark ? 'text-[#bbb]' : 'text-gray-600'
            }`}>
              Button Text Color
            </span>
          </div>
          
          {/* 3-option toggle: Auto, Black, White */}
          <div className="flex items-stretch w-full">
            <button
              onClick={() => setButtonTextColor("auto")}
              className={`flex-1 h-12 flex items-center justify-center rounded-l-lg transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                buttonTextColor === "auto"
                  ? isDark 
                    ? "bg-white/10 border border-r-0 border-white/50" 
                    : "bg-gray-200 border border-r-0 border-gray-300"
                  : isDark
                    ? "bg-transparent border border-r-0 border-white/50"
                    : "bg-transparent border border-r-0 border-gray-300"
              }`}
              aria-pressed={buttonTextColor === "auto"}
              aria-label="Auto contrast text color"
            >
              <span className={`text-lg font-bold ${
                buttonTextColor === "auto" 
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                Auto
              </span>
            </button>
            <button
              onClick={() => setButtonTextColor("dark")}
              className={`flex-1 h-12 flex items-center justify-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                buttonTextColor === "dark"
                  ? isDark 
                    ? "bg-white/10 border border-r-0 border-white/50" 
                    : "bg-gray-200 border border-r-0 border-gray-300"
                  : isDark
                    ? "bg-transparent border border-r-0 border-white/50"
                    : "bg-transparent border border-r-0 border-gray-300"
              }`}
              aria-pressed={buttonTextColor === "dark"}
              aria-label="Black Text"
            >
              <span className={`text-lg font-bold ${
                buttonTextColor === "dark" 
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                Black
              </span>
            </button>
            <button
              onClick={() => setButtonTextColor("light")}
              className={`flex-1 h-12 flex items-center justify-center rounded-r-lg transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                buttonTextColor === "light"
                  ? isDark
                    ? "bg-white/10 border border-white/50"
                    : "bg-gray-200 border border-gray-300"
                  : isDark
                    ? "bg-transparent border border-white/50"
                    : "bg-transparent border border-gray-300"
              }`}
              aria-pressed={buttonTextColor === "light"}
              aria-label="White Text"
            >
              <span className={`text-lg font-bold ${
                buttonTextColor === "light"
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-white/40' : 'text-gray-400'
              }`}>
                White
              </span>
            </button>
          </div>
          
          {/* Contrast info display when Auto is selected */}
          {buttonTextColor === "auto" && (
            <div className={`text-xs px-3 py-2 rounded-md ${
              isDark ? 'bg-white/5 text-[#bbb]' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="flex justify-between items-center">
                <span>Current text:</span>
                <span className="font-semibold">
                  {getAccessibleTextColor(primaryHex) === "dark" ? "Black" : "White"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Contrast ratio:</span>
                <span className={`font-mono font-semibold ${
                  getContrastRatio(
                    primaryHex, 
                    getAccessibleTextColor(primaryHex) === "dark" ? "#111827" : "#FFFFFF"
                  ) >= 4.5 
                    ? 'text-green-500' 
                    : 'text-amber-500'
                }`}>
                  {getContrastRatio(
                    primaryHex, 
                    getAccessibleTextColor(primaryHex) === "dark" ? "#111827" : "#FFFFFF"
                  ).toFixed(2)}:1
                </span>
              </div>
            </div>
          )}
          </div>

          {/* Border Radius Section */}
          <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center px-1">
            <BorderRadiusIcon isDark={isDark} />
            <span className={`text-lg font-bold leading-[26px] tracking-[-0.04px] ${
              isDark ? 'text-[#bbb]' : 'text-gray-600'
            }`}>
              Border Radius
            </span>
          </div>
          
          <div className="relative group">
            <div 
              className={`h-[7px] rounded-full w-full transition-all duration-200 ease-out group-hover:shadow-sm ${
                isDark ? 'bg-[rgba(217,217,217,0.1)] border border-white/50 group-hover:border-white/70' : 'bg-gray-200 border border-gray-300 group-hover:border-gray-400'
              }`}
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
            {/* Slider thumb indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border pointer-events-none transition-all duration-200 ease-out"
              style={{ 
                left: `calc(${(borderRadius / 32) * 100}% - 8px)`,
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                borderColor: theme.neutralDarker[theme.neutralDarker.length - 1]
              }}
            />
          </div>
          </div>

          {/* Palette Sections */}
          <div className="flex flex-col gap-12 pb-8">
          <PaletteSection
            title="Lighter Tones (Tints)"
            colors={theme.tints}
            isExpanded={expanded.tints}
            onToggle={() => toggleSection("tints")}
            darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
          />
          <PaletteSection
            title="Darker Tones (Shades)"
            colors={theme.shades}
            isExpanded={expanded.shades}
            onToggle={() => toggleSection("shades")}
            darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
          />
          <PaletteSection
            title="Neutral Lighter"
            colors={theme.neutralLighter}
            isExpanded={expanded.neutralLighter}
            onToggle={() => toggleSection("neutralLighter")}
            darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
          />
          <PaletteSection
            title="Neutral Darker"
            colors={theme.neutralDarker}
            isExpanded={expanded.neutralDarker}
            onToggle={() => toggleSection("neutralDarker")}
            darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
          />
          </div>
        </div>
      </div>
    </div>
  )
}

function ColorInfoCard({
  label,
  hex,
  hsl,
  color,
}: {
  label: string
  hex: string
  hsl: string
  color: string
}) {
  const { addToast } = useToast()
  const { mode } = useTheme()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        title: "Copied!",
        description: `${label} ${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
      addToast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "error",
        duration: 3000,
      })
    }
  }

  const isDark = mode === "dark"
  
  return (
    <div className="flex gap-4 items-start rounded-lg">
      {/* Color Swatch */}
      <div
        className="rounded-lg shrink-0 w-[76px] self-stretch"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      
      {/* Color Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <p className={`text-[11px] uppercase tracking-wide leading-5 ${
          isDark ? 'text-[#c5c1bd]' : 'text-gray-600'
        }`}>
          {label}
        </p>
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] leading-5">
            <span className={isDark ? "text-[#c5c1bd]" : "text-gray-600"}>HEX</span>
            <button
              onClick={() => copyToClipboard(hex)}
              className={`hover:opacity-80 transition-colors font-mono ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              aria-label={`Copy ${label} hex value: ${hex}`}
            >
              {hex}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] leading-5">
            <span className={isDark ? "text-[#c5c1bd]" : "text-gray-600"}>HSL</span>
            <button
              onClick={() => copyToClipboard(hsl)}
              className={`hover:opacity-80 transition-colors font-mono ${
                isDark ? "text-white" : "text-gray-900"
              }`}
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

function PaletteSection({
  title,
  colors,
  isExpanded,
  onToggle,
  darkestNeutral,
}: {
  title: string
  colors: string[]
  isExpanded: boolean
  onToggle: () => void
  darkestNeutral: string
}) {
  const { addToast } = useToast()
  const { mode } = useTheme()
  const isDark = mode === "dark"

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        title: "Copied!",
        description: `Color ${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
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
        aria-controls={`palette-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className={`w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-lg transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
          isDark ? "hover:bg-white/5" : "hover:bg-gray-200"
        }`}
      >
        <span className={`text-lg leading-[26px] tracking-[-0.04px] ${
          isDark ? "text-[#bbb]" : "text-gray-700"
        }`}>
          {title}
        </span>
        <div className="h-12 w-8 flex items-center justify-center">
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ease-out ${
              isDark ? "text-[#bbb]" : "text-gray-700"
            } ${isExpanded ? "" : "-rotate-90"}`}
            aria-hidden="true"
          />
        </div>
      </button>
      {isExpanded && (
        <div
          id={`palette-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="grid grid-cols-3 gap-3 mt-4"
          role="region"
          aria-label={`${title} color swatches`}
        >
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(color)}
              aria-label={`Copy color ${color} to clipboard`}
              className={`backdrop-blur-sm border rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                isDark 
                  ? "bg-neutral-800/70 border-neutral-700/30" 
                  : "bg-neutral-50 border-neutral-300/50"
              }`}
            >
              <div
                className="w-full h-12 rounded-lg shadow-inner"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1 text-xs">
                <span className={`font-mono font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {color}
                </span>
                <span className={isDark ? "text-slate-400" : "text-gray-600"} style={{ fontSize: "10px" }}>
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
