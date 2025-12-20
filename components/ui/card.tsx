"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { use3DEffectsNeutral } from "@/lib/use-3d-effects"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { mode } = useTheme()
  const { enable3D } = useDesignSystem()
  const isDark = mode === "dark"
  
  // Get neutral 3D effects for cards
  const { effects, boxShadow, boxShadowHover, isEnabled: is3DEnabled } = use3DEffectsNeutral(
    isDark,
    { intensity: 0.7 }
  )
  
  // Base colors (fallback when 3D is disabled)
  const baseBg = isDark ? "bg-neutral-900/90" : "bg-white"
  const baseBorder = isDark ? "border-white/10" : "border-gray-200"
  const baseHoverBorder = isDark ? "hover:border-white/20" : "hover:border-gray-300"
  
  // Apply 3D effects when enabled
  const shouldApply3D = is3DEnabled && enable3D && effects
  
  // Build 3D border effect using inset shadows for smooth gradient transition
  // Simulates light from above - bright top edge fading to dark bottom edge
  const insetBorderShadow = shouldApply3D
    ? isDark
      ? [
          // Top highlight - bright white glow on top edge
          `inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
          // Bottom shadow - dark shadow on bottom edge  
          `inset 0 -1px 0 0 rgba(0, 0, 0, 0.3)`,
          // Subtle overall border glow
          `inset 0 0 0 1px rgba(255, 255, 255, 0.08)`,
        ].join(", ")
      : [
          // Top highlight - white glow on top edge
          `inset 0 1px 0 0 rgba(255, 255, 255, 0.8)`,
          // Bottom shadow - subtle dark on bottom edge
          `inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)`,
          // Subtle overall border
          `inset 0 0 0 1px rgba(0, 0, 0, 0.06)`,
        ].join(", ")
    : ""
  
  // Combine external shadow with inset border shadow
  const combinedShadow = shouldApply3D
    ? `${boxShadow}, ${insetBorderShadow}`
    : boxShadow
    
  const combinedShadowHover = shouldApply3D
    ? `${boxShadowHover}, ${insetBorderShadow}`
    : boxShadowHover
  
  // Handle hover state for 3D effects
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldApply3D && combinedShadowHover) {
      e.currentTarget.style.boxShadow = combinedShadowHover
    }
    props.onMouseEnter?.(e)
  }
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldApply3D && combinedShadow) {
      e.currentTarget.style.boxShadow = combinedShadow
    }
    props.onMouseLeave?.(e)
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5",
        // Only apply base border classes when 3D is disabled
        !shouldApply3D && "border",
        !shouldApply3D && baseBorder,
        !shouldApply3D && baseHoverBorder,
        // Base background only when 3D is disabled
        !shouldApply3D && baseBg,
        // Text colors
        isDark ? "text-white" : "text-gray-900",
        // Shadow classes (only when 3D is disabled)
        !shouldApply3D && "shadow-sm",
        !shouldApply3D && "hover:shadow-md",
        className
      )}
      style={{
        borderRadius: "var(--border-radius)",
        // Apply 3D background gradient
        ...(shouldApply3D && effects ? { background: effects.gradient } : {}),
        // Apply combined shadow (external + inset border)
        ...(shouldApply3D ? { boxShadow: combinedShadow } : {}),
        ...props.style, // Merge with any existing styles
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
