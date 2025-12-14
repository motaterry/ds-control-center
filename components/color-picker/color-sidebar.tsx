"use client"

import React, { useState } from "react"
import { ColorWheel } from "./color-wheel"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { hslToHex, formatHsl } from "@/lib/color-utils"
import { ChevronDown } from "lucide-react"
import { useToast } from "@/components/ui/toast"

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

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

  return (
    <div className={`flex flex-col gap-8 p-6 h-full transition-colors ${
      mode === "dark" ? "bg-black" : "bg-gray-50"
    }`}>
      {/* Color Wheel Section */}
      <div className="flex flex-col gap-[42px] items-center">
        <ColorWheel />
        
        {/* Color Info Cards */}
        <div className="flex flex-col gap-[21px] w-full">
          <ColorInfoCard
            label="PRIMARY"
            hex={primaryHex}
            hsl={formatHsl(theme.primary.h, theme.primary.s, theme.primary.l)}
            color={primaryHex}
          />
          <ColorInfoCard
            label="COMPLEMENTARY"
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

      {/* Gradient Slider */}
      <div
        className="h-[7px] rounded-lg w-full"
        style={{
          background: `linear-gradient(to right, ${primaryHex}, ${compHex})`,
        }}
        aria-hidden="true"
      />

      {/* Mode Toggle Buttons */}
      <div className="flex items-end w-full border rounded-lg overflow-hidden" style={{
        borderColor: "var(--color-primary)"
      }}>
        <button
          onClick={() => setMode("dark")}
          className={`flex-1 h-12 px-6 transition-all border-r ${
            mode === "dark"
              ? "bg-[var(--color-primary)] text-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.3)]"
              : isDark
                ? "bg-transparent hover:bg-white/5 text-gray-400"
                : "bg-transparent hover:bg-gray-100 text-gray-600"
          }`}
          style={{
            borderRightColor: "var(--color-primary)"
          }}
          aria-pressed={mode === "dark"}
          aria-label="Dark Mode"
        >
          <span className="text-lg font-bold">
            Dark Mode
          </span>
        </button>
        <button
          onClick={() => setMode("light")}
          className={`flex-1 h-12 px-6 transition-all ${
            mode === "light"
              ? "bg-[var(--color-primary)] text-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.3)]"
              : isDark
                ? "bg-transparent hover:bg-white/5 text-gray-400"
                : "bg-transparent hover:bg-gray-100 text-gray-600"
          }`}
          aria-pressed={mode === "light"}
          aria-label="Light Mode"
        >
          <span className="text-lg font-bold">
            Light Mode
          </span>
        </button>
      </div>

      {/* Button Text Color Toggle */}
      <div className="flex flex-col gap-3">
        <label className={`text-sm font-medium ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Button Text Color
        </label>
        <div className="flex items-end w-full border rounded-lg overflow-hidden" style={{
          borderColor: "var(--color-primary)"
        }}>
          <button
            onClick={() => setButtonTextColor("dark")}
            className={`flex-1 h-10 px-4 transition-all border-r ${
              buttonTextColor === "dark"
                ? "bg-[var(--color-primary)] text-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.3)]"
                : isDark
                  ? "bg-transparent hover:bg-white/5 text-gray-400"
                  : "bg-transparent hover:bg-gray-100 text-gray-600"
            }`}
            style={{
              borderRightColor: "var(--color-primary)"
            }}
            aria-pressed={buttonTextColor === "dark"}
            aria-label="Dark Text"
          >
            <span className="text-sm font-medium">
              Dark
            </span>
          </button>
          <button
            onClick={() => setButtonTextColor("light")}
            className={`flex-1 h-10 px-4 transition-all ${
              buttonTextColor === "light"
                ? "bg-[var(--color-primary)] text-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.3)]"
                : isDark
                  ? "bg-transparent hover:bg-white/5 text-gray-400"
                  : "bg-transparent hover:bg-gray-100 text-gray-600"
            }`}
            aria-pressed={buttonTextColor === "light"}
            aria-label="Light Text"
          >
            <span className="text-sm font-medium">
              Light
            </span>
          </button>
        </div>
      </div>

      {/* Border Radius Slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Border Radius
          </label>
          <span className={`text-sm font-mono ${
            isDark ? "text-white/60" : "text-gray-600"
          }`}>
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
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(borderRadius / 32) * 100}%, rgba(255,255,255,0.1) ${(borderRadius / 32) * 100}%, rgba(255,255,255,0.1) 100%)`
              : `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(borderRadius / 32) * 100}%, #e5e7eb ${(borderRadius / 32) * 100}%, #e5e7eb 100%)`,
          }}
          aria-label="Border radius slider"
          aria-valuemin={0}
          aria-valuemax={32}
          aria-valuenow={borderRadius}
        />
      </div>

      {/* Palette Sections */}
      <div className="flex flex-col gap-12">
        <PaletteSection
          title="Lighter Tones (Tints)"
          colors={theme.tints}
          isExpanded={expanded.tints}
          onToggle={() => toggleSection("tints")}
        />
        <PaletteSection
          title="Darker Tones (Shades)"
          colors={theme.shades}
          isExpanded={expanded.shades}
          onToggle={() => toggleSection("shades")}
        />
        <PaletteSection
          title="Neutral Lighter"
          colors={theme.neutralLighter}
          isExpanded={expanded.neutralLighter}
          onToggle={() => toggleSection("neutralLighter")}
        />
        <PaletteSection
          title="Neutral Darker"
          colors={theme.neutralDarker}
          isExpanded={expanded.neutralDarker}
          onToggle={() => toggleSection("neutralDarker")}
        />
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
    <div className={`border rounded-lg p-3 flex gap-4 items-start transition-colors ${
      isDark ? "border-white/20" : "border-gray-300"
    }`}>
      {/* Color Swatch */}
      <div
        className="rounded-lg shrink-0 w-[76px] h-[76px]"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      
      {/* Color Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <p className={`text-[11px] uppercase tracking-wide ${
          isDark ? "text-[#c5c1bd]" : "text-gray-600"
        }`}>
          {label}
        </p>
        <div className="flex items-center justify-between text-[11px]">
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
        <div className="flex items-center justify-between text-[11px]">
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
  )
}

function PaletteSection({
  title,
  colors,
  isExpanded,
  onToggle,
}: {
  title: string
  colors: string[]
  isExpanded: boolean
  onToggle: () => void
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
        className={`w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
          isDark ? "hover:bg-white/5" : "hover:bg-gray-200"
        }`}
      >
        <span className={`text-lg ${
          isDark ? "text-[#bbb]" : "text-gray-700"
        }`}>
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isDark ? "text-[#bbb]" : "text-gray-700"
          } ${isExpanded ? "" : "-rotate-90"}`}
          aria-hidden="true"
        />
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
              className={`backdrop-blur-sm border rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                isDark 
                  ? "bg-slate-800/70 border-white/10 hover:border-white/20" 
                  : "bg-white border-gray-300 hover:border-gray-400"
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

