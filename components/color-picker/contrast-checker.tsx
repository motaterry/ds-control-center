"use client"

import React from "react"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { hslToHex, getContrastRatio, getAccessibleTextColor, meetsWCAGAA } from "@/lib/color-utils"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ContrastChecker() {
  const { theme } = useColorTheme()
  const { mode } = useTheme()
  const { buttonTextColor } = useDesignSystem()
  const isDark = mode === "dark"

  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
  const compHex = hslToHex(theme.complementary.h, theme.complementary.s, theme.complementary.l)

  // Determine text colors based on button text color setting
  const getTextColor = (bgColor: string): string => {
    if (buttonTextColor === "auto") {
      return getAccessibleTextColor(bgColor) === "dark" ? "#111827" : "#FFFFFF"
    }
    return buttonTextColor === "dark" ? "#111827" : "#FFFFFF"
  }

  const primaryTextColor = getTextColor(primaryHex)
  const compTextColor = getTextColor(compHex)

  const primaryContrast = getContrastRatio(primaryHex, primaryTextColor)
  const compContrast = getContrastRatio(compHex, compTextColor)

  const primaryMeetsAA = meetsWCAGAA(primaryTextColor, primaryHex)
  const primaryMeetsAAA = primaryContrast >= 7
  const compMeetsAA = meetsWCAGAA(compTextColor, compHex)
  const compMeetsAAA = compContrast >= 7

  const ContrastBadge = ({ 
    contrast, 
    meetsAA, 
    meetsAAA, 
    label 
  }: { 
    contrast: number
    meetsAA: boolean
    meetsAAA: boolean
    label: string
  }) => {
    const getStatusColor = () => {
      if (meetsAAA) return "text-green-500"
      if (meetsAA) return "text-amber-500"
      return "text-red-500"
    }

    const getStatusIcon = () => {
      if (meetsAAA) return <CheckCircle className="w-4 h-4" />
      if (meetsAA) return <AlertTriangle className="w-4 h-4" />
      return <AlertTriangle className="w-4 h-4" />
    }

    const getStatusText = () => {
      if (meetsAAA) return "AAA"
      if (meetsAA) return "AA"
      return "Fail"
    }

    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        isDark ? "bg-white/5" : "bg-gray-100"
      )}>
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className={cn(
            "text-xs font-semibold",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {label}
          </div>
          <div className={cn(
            "text-[10px] font-mono",
            isDark ? "text-white/60" : "text-gray-600"
          )}>
            {contrast.toFixed(2)}:1 - {getStatusText()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className={cn(
          "w-4 h-4",
          isDark ? "text-white/60" : "text-gray-500"
        )} />
        <span className={cn(
          "text-sm font-semibold",
          isDark ? "text-white/80" : "text-gray-700"
        )}>
          Contrast Checker
        </span>
      </div>

      <div className="space-y-2">
        <ContrastBadge
          contrast={primaryContrast}
          meetsAA={primaryMeetsAA}
          meetsAAA={primaryMeetsAAA}
          label="Primary Color"
        />
        <ContrastBadge
          contrast={compContrast}
          meetsAA={compMeetsAA}
          meetsAAA={compMeetsAAA}
          label="Complementary Color"
        />
      </div>

      {(!primaryMeetsAA || !compMeetsAA) && (
        <div className={cn(
          "text-xs px-3 py-2 rounded-lg",
          isDark ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-700 border border-amber-200"
        )}>
          <div className="font-semibold mb-1">Accessibility Warning</div>
          <div>Some color combinations may not meet WCAG AA standards. Consider adjusting colors for better contrast.</div>
        </div>
      )}
    </div>
  )
}

