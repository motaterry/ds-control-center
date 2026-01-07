"use client"

import React, { useMemo } from "react"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { 
  hslToHex, 
  getContrastRatio, 
  getAccessibleTextColor, 
  meetsWCAGAA,
  hexToHsl,
  hslToHex as convertHslToHex
} from "@/lib/color-utils"
import { AlertTriangle, CheckCircle, XCircle, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"

interface ContrastCheck {
  foreground: string
  background: string
  contrast: number
  meetsAA: boolean
  meetsAAA: boolean
  label: string
  type: "text" | "button" | "link"
}

interface ColorSuggestion {
  original: string
  suggested: string
  reason: string
  improvement: number
}

/**
 * Calculate suggested accessible color by adjusting lightness
 */
function suggestAccessibleColor(
  bgColor: string,
  textColor: string,
  targetRatio: number = 4.5
): ColorSuggestion | null {
  const currentRatio = getContrastRatio(textColor, bgColor)
  if (currentRatio >= targetRatio) return null

  const hsl = hexToHsl(bgColor)
  // Determine if text is dark or light by checking which provides better contrast
  const darkTextContrast = getContrastRatio("#111827", bgColor)
  const lightTextContrast = getContrastRatio("#FFFFFF", bgColor)
  const textIsDark = darkTextContrast > lightTextContrast
  
  // If text is dark, we need to lighten the background
  // If text is light, we need to darken the background
  const adjustments = textIsDark 
    ? [20, 15, 10, 5, -5, -10, -15, -20] // Try lightening first
    : [-20, -15, -10, -5, 5, 10, 15, 20] // Try darkening first
  
  for (const adjustment of adjustments) {
    const newLightness = Math.max(0, Math.min(100, hsl.l + adjustment))
    const newColor = convertHslToHex(hsl.h, hsl.s, newLightness)
    const newRatio = getContrastRatio(textColor, newColor)
    
    if (newRatio >= targetRatio) {
      return {
        original: bgColor,
        suggested: newColor,
        reason: adjustment > 0 
          ? `Lighten background by ${Math.abs(adjustment)}%`
          : `Darken background by ${Math.abs(adjustment)}%`,
        improvement: newRatio - currentRatio
      }
    }
  }
  
  return null
}

export function AccessibilityChecker() {
  const { theme } = useColorTheme()
  const { mode } = useTheme()
  const { buttonTextColor } = useDesignSystem()
  const isDark = mode === "dark"

  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
  const compHex = hslToHex(theme.complementary.h, theme.complementary.s, theme.complementary.l)
  
  // Get background colors (neutral colors from theme)
  const bgLight = isDark ? theme.neutralDarker[theme.neutralDarker.length - 1] : "#FFFFFF"
  const bgDark = isDark ? "#000000" : theme.neutralDarker[theme.neutralDarker.length - 1]

  // Determine text colors
  const getTextColor = (bgColor: string): string => {
    if (buttonTextColor === "auto") {
      return getAccessibleTextColor(bgColor) === "dark" ? "#111827" : "#FFFFFF"
    }
    return buttonTextColor === "dark" ? "#111827" : "#FFFFFF"
  }

  // Generate all contrast checks
  const contrastChecks = useMemo<ContrastCheck[]>(() => {
    const checks: ContrastCheck[] = []
    
    // Primary color checks
    const primaryText = getTextColor(primaryHex)
    const primaryContrast = getContrastRatio(primaryHex, primaryText)
    checks.push({
      foreground: primaryText,
      background: primaryHex,
      contrast: primaryContrast,
      meetsAA: meetsWCAGAA(primaryText, primaryHex),
      meetsAAA: primaryContrast >= 7,
      label: "Primary Button",
      type: "button"
    })

    // Complementary color checks
    const compText = getTextColor(compHex)
    const compContrast = getContrastRatio(compHex, compText)
    checks.push({
      foreground: compText,
      background: compHex,
      contrast: compContrast,
      meetsAA: meetsWCAGAA(compText, compHex),
      meetsAAA: compContrast >= 7,
      label: "Complementary Button",
      type: "button"
    })

    // Text on light background
    checks.push({
      foreground: primaryHex,
      background: bgLight,
      contrast: getContrastRatio(primaryHex, bgLight),
      meetsAA: meetsWCAGAA(primaryHex, bgLight),
      meetsAAA: getContrastRatio(primaryHex, bgLight) >= 7,
      label: "Primary Text on Light",
      type: "text"
    })

    checks.push({
      foreground: compHex,
      background: bgLight,
      contrast: getContrastRatio(compHex, bgLight),
      meetsAA: meetsWCAGAA(compHex, bgLight),
      meetsAAA: getContrastRatio(compHex, bgLight) >= 7,
      label: "Complementary Text on Light",
      type: "text"
    })

    // Text on dark background
    checks.push({
      foreground: primaryHex,
      background: bgDark,
      contrast: getContrastRatio(primaryHex, bgDark),
      meetsAA: meetsWCAGAA(primaryHex, bgDark),
      meetsAAA: getContrastRatio(primaryHex, bgDark) >= 7,
      label: "Primary Text on Dark",
      type: "text"
    })

    checks.push({
      foreground: compHex,
      background: bgDark,
      contrast: getContrastRatio(compHex, bgDark),
      meetsAA: meetsWCAGAA(compHex, bgDark),
      meetsAAA: getContrastRatio(compHex, bgDark) >= 7,
      label: "Complementary Text on Dark",
      type: "text"
    })

    // Link colors (typically same as primary/complementary)
    checks.push({
      foreground: primaryHex,
      background: bgLight,
      contrast: getContrastRatio(primaryHex, bgLight),
      meetsAA: meetsWCAGAA(primaryHex, bgLight),
      meetsAAA: getContrastRatio(primaryHex, bgLight) >= 7,
      label: "Primary Link",
      type: "link"
    })

    return checks
  }, [primaryHex, compHex, bgLight, bgDark, buttonTextColor])

  // Generate suggestions for failing checks
  const suggestions = useMemo(() => {
    return contrastChecks
      .filter(check => !check.meetsAA)
      .map(check => {
        const suggestion = suggestAccessibleColor(check.background, check.foreground)
        return suggestion ? { check, suggestion } : null
      })
      .filter((s): s is { check: ContrastCheck; suggestion: ColorSuggestion } => s !== null)
  }, [contrastChecks])

  // Calculate overall compliance score
  const complianceScore = useMemo(() => {
    const total = contrastChecks.length
    const passingAA = contrastChecks.filter(c => c.meetsAA).length
    const passingAAA = contrastChecks.filter(c => c.meetsAAA).length
    
    return {
      total,
      passingAA,
      passingAAA,
      percentageAA: Math.round((passingAA / total) * 100),
      percentageAAA: Math.round((passingAAA / total) * 100)
    }
  }, [contrastChecks])

  const StatusBadge = ({ 
    contrast, 
    meetsAA, 
    meetsAAA, 
    label,
    foreground,
    background,
    type
  }: ContrastCheck) => {
    const getStatusIcon = () => {
      if (meetsAAA) return <CheckCircle className="w-5 h-5 text-green-500" />
      if (meetsAA) return <AlertTriangle className="w-5 h-5 text-amber-500" />
      return <XCircle className="w-5 h-5 text-red-500" />
    }

    const getStatusText = () => {
      if (meetsAAA) return "AAA"
      if (meetsAA) return "AA"
      return "Fail"
    }

    const getStatusColor = () => {
      if (meetsAAA) return "border-green-500/30 bg-green-500/10"
      if (meetsAA) return "border-amber-500/30 bg-amber-500/10"
      return "border-red-500/30 bg-red-500/10"
    }

    return (
      <div className={cn(
        "flex flex-col gap-3 p-4 rounded-lg border transition-all",
        isDark ? getStatusColor() : getStatusColor().replace("/10", "/5").replace("/30", "/20")
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm font-semibold truncate",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {label}
              </div>
              <div className={cn(
                "text-xs mt-0.5",
                isDark ? "text-white/60" : "text-gray-600"
              )}>
                {contrast.toFixed(2)}:1 contrast ratio
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getStatusIcon()}
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded",
              meetsAAA 
                ? "bg-green-500/20 text-green-600 dark:text-green-400"
                : meetsAA
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-red-500/20 text-red-600 dark:text-red-400"
            )}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        {/* Color preview */}
        <div className="flex gap-2 items-center">
          <div 
            className="w-12 h-12 rounded border-2 shrink-0"
            style={{ 
              backgroundColor: background,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
            }}
            aria-label={`Background color: ${background}`}
          />
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm font-semibold px-3 py-2 rounded truncate"
              style={{ 
                backgroundColor: background,
                color: foreground
              }}
            >
              Sample Text
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Info className={cn(
          "w-5 h-5",
          isDark ? "text-white/80" : "text-gray-700"
        )} />
        <h2 className={cn(
          "text-lg font-bold",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Accessibility Checker
        </h2>
      </div>

      {/* Compliance Overview */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-white/5 border-white/20" : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "text-sm font-semibold",
            isDark ? "text-white/80" : "text-gray-700"
          )}>
            Overall Compliance
          </span>
          <div className="flex items-center gap-2">
            {complianceScore.percentageAA === 100 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : complianceScore.percentageAA >= 80 ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs",
              isDark ? "text-white/60" : "text-gray-600"
            )}>
              WCAG AA (4.5:1)
            </span>
            <span className={cn(
              "text-sm font-bold",
              complianceScore.percentageAA === 100 
                ? "text-green-500"
                : complianceScore.percentageAA >= 80
                ? "text-amber-500"
                : "text-red-500"
            )}>
              {complianceScore.passingAA}/{complianceScore.total} ({complianceScore.percentageAA}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs",
              isDark ? "text-white/60" : "text-gray-600"
            )}>
              WCAG AAA (7:1)
            </span>
            <span className={cn(
              "text-sm font-bold",
              complianceScore.percentageAAA === 100 
                ? "text-green-500"
                : complianceScore.percentageAAA >= 80
                ? "text-amber-500"
                : "text-red-500"
            )}>
              {complianceScore.passingAAA}/{complianceScore.total} ({complianceScore.percentageAAA}%)
            </span>
          </div>
        </div>
      </div>

      {/* WCAG Standards Explanation */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"
      )}>
        <div className="flex items-start gap-2 mb-2">
          <Info className={cn(
            "w-4 h-4 mt-0.5 shrink-0",
            isDark ? "text-blue-400" : "text-blue-600"
          )} />
          <div className="flex-1">
            <div className={cn(
              "text-sm font-semibold mb-2",
              isDark ? "text-blue-300" : "text-blue-900"
            )}>
              WCAG Compliance Levels
            </div>
            <div className="space-y-1.5 text-xs">
              <div className={cn(
                "flex items-center gap-1.5",
                isDark ? "text-blue-200" : "text-blue-800"
              )}>
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <strong>AAA (7:1):</strong> Enhanced contrast for users with low vision
              </div>
              <div className={cn(
                "flex items-center gap-1.5",
                isDark ? "text-blue-200" : "text-blue-800"
              )}>
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <strong>AA (4.5:1):</strong> Minimum contrast for normal text (WCAG 2.1 Level AA)
              </div>
              <div className={cn(
                "flex items-center gap-1.5",
                isDark ? "text-blue-200" : "text-blue-800"
              )}>
                <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <strong>Fail (&lt;4.5:1):</strong> Does not meet accessibility standards
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrast Checks */}
      <div className="space-y-3">
        <h3 className={cn(
          "text-sm font-semibold",
          isDark ? "text-white/80" : "text-gray-700"
        )}>
          Color Combinations
        </h3>
        {contrastChecks.map((check, index) => (
          <StatusBadge key={`${check.label}-${index}`} {...check} />
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className={cn(
              "w-5 h-5",
              isDark ? "text-amber-400" : "text-amber-600"
            )} />
            <h3 className={cn(
              "text-sm font-semibold",
              isDark ? "text-white/80" : "text-gray-700"
            )}>
              Suggestions for Improvement
            </h3>
          </div>
          {suggestions.map(({ check, suggestion }, index) => (
            <div 
              key={`suggestion-${index}`}
              className={cn(
                "p-4 rounded-lg border",
                isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"
              )}
            >
              <div className={cn(
                "text-sm font-semibold mb-2",
                isDark ? "text-amber-300" : "text-amber-900"
              )}>
                {check.label}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "text-xs",
                    isDark ? "text-white/60" : "text-gray-600"
                  )}>
                    Current
                  </div>
                  <div 
                    className="w-12 h-12 rounded border-2"
                    style={{ 
                      backgroundColor: suggestion.original,
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                    }}
                    aria-label={`Current color: ${suggestion.original}`}
                  />
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "text-xs mb-1",
                    isDark ? "text-white/60" : "text-gray-600"
                  )}>
                    Suggested
                  </div>
                  <div 
                    className="w-full h-12 rounded border-2 flex items-center justify-center"
                    style={{ 
                      backgroundColor: suggestion.suggested,
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                    }}
                    aria-label={`Suggested color: ${suggestion.suggested}`}
                  >
                    <span className={cn(
                      "text-xs font-mono font-semibold",
                      getAccessibleTextColor(suggestion.suggested) === "dark" 
                        ? "text-gray-900" 
                        : "text-white"
                    )}>
                      {suggestion.suggested}
                    </span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "text-xs",
                isDark ? "text-amber-200" : "text-amber-800"
              )}>
                <strong>Reason:</strong> {suggestion.reason} (Improves contrast by {suggestion.improvement.toFixed(2)}:1)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success message if all pass */}
      {suggestions.length === 0 && complianceScore.percentageAA === 100 && (
        <div className={cn(
          "p-4 rounded-lg border flex items-start gap-3",
          isDark ? "bg-green-500/10 border-green-500/20" : "bg-green-50 border-green-200"
        )}>
          <CheckCircle className={cn(
            "w-5 h-5 mt-0.5 shrink-0",
            isDark ? "text-green-400" : "text-green-600"
          )} />
          <div className="flex-1">
            <div className={cn(
              "text-sm font-semibold mb-1",
              isDark ? "text-green-300" : "text-green-900"
            )}>
              Excellent! All color combinations meet WCAG AA standards.
            </div>
            <div className={cn(
              "text-xs",
              isDark ? "text-green-200" : "text-green-800"
            )}>
              Your design system is accessible and compliant with accessibility guidelines.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

