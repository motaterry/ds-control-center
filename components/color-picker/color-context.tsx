"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { HSL } from "@/lib/color-utils"
import {
  hexToHsl,
  hslToHex,
  getComplementaryColor,
  generateTints,
  generateShades,
  generateNeutrals,
} from "@/lib/color-utils"

interface ColorTheme {
  primary: HSL
  complementary: HSL
  tints: string[]
  shades: string[]
  neutralLighter: string[]
  neutralDarker: string[]
}

interface ColorContextType {
  theme: ColorTheme
  updatePrimaryColor: (hue: number, saturation?: number, lightness?: number) => void
  updatePrimaryFromHex: (hex: string) => void
  resetColors: () => void
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

const DEFAULT_PRIMARY: HSL = { h: 27, s: 100, l: 50 }
const DEFAULT_COMPLEMENTARY: HSL = {
    h: getComplementaryColor(27),
    s: 100,
    l: 50,
}

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [primary, setPrimary] = useState<HSL>(DEFAULT_PRIMARY)
  const [complementary, setComplementary] = useState<HSL>(DEFAULT_COMPLEMENTARY)

  // Generate color palette
  const primaryHex = hslToHex(primary.h, primary.s, primary.l)
  const tints = generateTints(primaryHex, PERCENTAGES)
  const shades = generateShades(primaryHex, PERCENTAGES)
  const neutralLighter = generateNeutrals(primaryHex, PERCENTAGES, "#FFFFFF")
  const neutralDarker = generateNeutrals(primaryHex, PERCENTAGES, "#000000")

  const theme: ColorTheme = {
    primary,
    complementary,
    tints,
    shades,
    neutralLighter,
    neutralDarker,
  }

  // Update CSS variables (only on client to avoid hydration issues)
  useEffect(() => {
    if (typeof window === "undefined") return

    const root = document.documentElement
    root.style.setProperty("--primary-h", primary.h.toString())
    root.style.setProperty("--primary-s", `${primary.s}%`)
    root.style.setProperty("--primary-l", `${primary.l}%`)
    root.style.setProperty("--comp-h", complementary.h.toString())
    root.style.setProperty("--comp-s", `${complementary.s}%`)
    root.style.setProperty("--comp-l", `${complementary.l}%`)

    // Set full HSL colors
    root.style.setProperty(
      "--color-primary",
      `hsl(${primary.h}, ${primary.s}%, ${primary.l}%)`
    )
    root.style.setProperty(
      "--color-complementary",
      `hsl(${complementary.h}, ${complementary.s}%, ${complementary.l}%)`
    )
  }, [primary, complementary])

  const updatePrimaryColor = useCallback(
    (hue: number, saturation: number = 100, lightness: number = 50) => {
      const newPrimary: HSL = { h: hue, s: saturation, l: lightness }
      setPrimary(newPrimary)
      setComplementary({
        h: getComplementaryColor(hue),
        s: saturation,
        l: lightness,
      })
    },
    []
  )

  const updatePrimaryFromHex = useCallback(
    (hex: string) => {
      const hsl = hexToHsl(hex)
      updatePrimaryColor(hsl.h, hsl.s, hsl.l)
    },
    [updatePrimaryColor]
  )

  const resetColors = useCallback(() => {
    setPrimary(DEFAULT_PRIMARY)
    setComplementary(DEFAULT_COMPLEMENTARY)
  }, [])

  return (
    <ColorContext.Provider
      value={{ theme, updatePrimaryColor, updatePrimaryFromHex, resetColors }}
    >
      {children}
    </ColorContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ColorContext)
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorProvider")
  }
  return context
}
