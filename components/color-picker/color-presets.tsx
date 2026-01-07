"use client"

import React, { useState } from "react"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useToast } from "@/components/ui/toast"
import { Tooltip } from "@/components/ui/tooltip"
import { COLOR_PRESETS, getPresetsByCategory, type ColorPreset } from "@/lib/color-presets"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function ColorPresets() {
  const { applyPreset, theme } = useColorTheme()
  const { mode } = useTheme()
  const { addToast } = useToast()
  const isDark = mode === "dark"
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Brand Colors": false,
    "Material Design": false,
    "Popular Schemes": false,
  })

  const presetsByCategory = getPresetsByCategory()
  const currentPrimaryHex = `hsl(${theme.primary.h}, ${theme.primary.s}%, ${theme.primary.l}%)`

  const handlePresetClick = (preset: ColorPreset) => {
    applyPreset(preset.primary)
    addToast({
      title: "Preset applied!",
      description: `${preset.name} color scheme applied`,
      variant: "success",
      duration: 2000,
    })
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-bold leading-[26px] tracking-[-0.04px] ${
          isDark ? 'text-[#bbb]' : 'text-gray-600'
        }`}>
          Color Presets
        </h3>
      </div>

      <div className="space-y-3">
        {Object.entries(presetsByCategory).map(([category, presets]) => (
          <div key={category}>
            <Tooltip content={`Click to expand/collapse ${category}`} side="right">
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full flex items-center justify-between pl-2 pr-2 py-2 rounded-lg",
                  "transition-all duration-200 ease-out cursor-pointer",
                  "focus:outline-none focus:ring-1",
                  isDark 
                    ? "hover:bg-white/5 focus:ring-white/30" 
                    : "hover:bg-gray-200 focus:ring-gray-400"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  isDark ? "text-white/80" : "text-gray-700"
                )}>
                  {category}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-300 ease-out",
                    isDark ? "text-white/60" : "text-gray-500",
                    expandedCategories[category] ? "" : "-rotate-90"
                  )}
                  aria-hidden="true"
                />
              </button>
            </Tooltip>

            {expandedCategories[category] && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {presets.map((preset) => {
                  const isActive = preset.primary.toLowerCase() === currentPrimaryHex.toLowerCase()
                  return (
                    <Tooltip key={preset.id} content={preset.description || preset.name} side="top">
                      <button
                        onClick={() => handlePresetClick(preset)}
                        className={cn(
                          "relative p-3 rounded-lg border-2 transition-all duration-200 ease-out",
                          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                          isActive
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : isDark
                              ? "border-white/10 hover:border-white/20 bg-white/5"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        )}
                      >
                        <div className="flex flex-col gap-2">
                          <div
                            className="w-full h-8 rounded-md border border-white/20"
                            style={{ backgroundColor: preset.primary }}
                            aria-hidden="true"
                          />
                          <div className="text-left">
                            <div className={cn(
                              "text-xs font-semibold truncate",
                              isDark ? "text-white" : "text-gray-900"
                            )}>
                              {preset.name}
                            </div>
                            <div className={cn(
                              "text-[10px] font-mono truncate mt-0.5",
                              isDark ? "text-white/60" : "text-gray-500"
                            )}>
                              {preset.primary}
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                        )}
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

