"use client"

import React, { useState } from "react"
import { useColorTheme } from "./color-context"
import { useToast } from "@/components/ui/toast"
import { useTheme } from "@/components/theme-context"
import { ChevronDown } from "lucide-react"

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

export function PaletteExpansion() {
  const { theme } = useColorTheme()
  const { mode } = useTheme()
  const { addToast } = useToast()
  const isDark = mode === "dark"
  const [expanded, setExpanded] = useState({
    tints: true,
    shades: true,
    neutralLighter: false,
    neutralDarker: false,
  })

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

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
    <div className="space-y-4">
      {/* Lighter Tones */}
      <PaletteSection
        title="Lighter Tones (Tints)"
        colors={theme.tints}
        percentages={PERCENTAGES}
        isExpanded={expanded.tints}
        onToggle={() => toggleSection("tints")}
        onCopy={copyToClipboard}
        isDark={isDark}
      />

      {/* Darker Tones */}
      <PaletteSection
        title="Darker Tones (Shades)"
        colors={theme.shades}
        percentages={PERCENTAGES}
        isExpanded={expanded.shades}
        onToggle={() => toggleSection("shades")}
        onCopy={copyToClipboard}
        isDark={isDark}
      />

      {/* Neutral Lighter */}
      <PaletteSection
        title="Neutral Lighter"
        colors={theme.neutralLighter}
        percentages={PERCENTAGES}
        isExpanded={expanded.neutralLighter}
        onToggle={() => toggleSection("neutralLighter")}
        onCopy={copyToClipboard}
        isDark={isDark}
      />

      {/* Neutral Darker */}
      <PaletteSection
        title="Neutral Darker"
        colors={theme.neutralDarker}
        percentages={PERCENTAGES}
        isExpanded={expanded.neutralDarker}
        onToggle={() => toggleSection("neutralDarker")}
        onCopy={copyToClipboard}
        isDark={isDark}
      />
    </div>
  )
}

function PaletteSection({
  title,
  colors,
  percentages,
  isExpanded,
  onToggle,
  onCopy,
  isDark,
}: {
  title: string
  colors: string[]
  percentages: number[]
  isExpanded: boolean
  onToggle: () => void
  onCopy: (text: string) => void
  isDark: boolean
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`palette-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className="w-full flex justify-between items-center pb-2 mb-4 border-b border-white/10 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-1"
      >
        <h3 className="text-sm font-light text-slate-400">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
          aria-hidden="true"
        />
      </button>
      {isExpanded && (
        <div
          id={`palette-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="grid grid-cols-3 gap-3"
          role="region"
          aria-label={`${title} color swatches`}
        >
          {colors.map((color, index) => (
            <ColorSwatch
              key={index}
              color={color}
              label={`+${percentages[index]}%`}
              onCopy={onCopy}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ColorSwatch({
  color,
  label,
  onCopy,
  isDark,
}: {
  color: string
  label: string
  onCopy: (text: string) => void
  isDark: boolean
}) {
  return (
    <button
      onClick={() => onCopy(color)}
      aria-label={`Copy color ${color} to clipboard`}
      className={`bg-slate-800/70 backdrop-blur-sm border rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-slate-800 ${
        isDark ? "border-white/50" : "border-gray-300"
      }`}
    >
      <div
        className="w-full h-12 rounded-lg shadow-inner"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1 text-xs">
        <span className="font-mono font-semibold text-white">{color}</span>
        <span className="text-slate-400 text-[10px]" aria-label={`Mix percentage: ${label}`}>
          {label}
        </span>
      </div>
    </button>
  )
}
