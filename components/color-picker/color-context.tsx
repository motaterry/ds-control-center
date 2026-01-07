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

interface ColorHistoryState {
  primary: HSL
  complementary: HSL
}

interface ColorContextType {
  theme: ColorTheme
  updatePrimaryColor: (hue: number, saturation?: number, lightness?: number) => void
  updatePrimaryFromHex: (hex: string) => void
  updateComplementaryFromHex: (hex: string) => void
  resetColors: () => void
  applyPreset: (hex: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

const DEFAULT_PRIMARY: HSL = { h: 114, s: 100, l: 58 }
const DEFAULT_COMPLEMENTARY: HSL = {
    h: 294,
    s: 100,
    l: 58,
}

const MAX_HISTORY_SIZE = 50

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [primary, setPrimary] = useState<HSL>(DEFAULT_PRIMARY)
  const [complementary, setComplementary] = useState<HSL>(DEFAULT_COMPLEMENTARY)
  const [history, setHistory] = useState<ColorHistoryState[]>([
    { primary: DEFAULT_PRIMARY, complementary: DEFAULT_COMPLEMENTARY },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

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

  // Add state to history
  const addToHistory = useCallback((newPrimary: HSL, newComplementary: HSL) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ primary: newPrimary, complementary: newComplementary })
      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1))
  }, [historyIndex])

  const updatePrimaryColor = useCallback(
    (hue: number, saturation: number = 100, lightness: number = 50) => {
      const newPrimary: HSL = { h: hue, s: saturation, l: lightness }
      const newComplementary: HSL = {
        h: getComplementaryColor(hue),
        s: saturation,
        l: lightness,
      }
      addToHistory(newPrimary, newComplementary)
      setPrimary(newPrimary)
      setComplementary(newComplementary)
    },
    [addToHistory]
  )

  const updatePrimaryFromHex = useCallback(
    (hex: string) => {
      const hsl = hexToHsl(hex)
      updatePrimaryColor(hsl.h, hsl.s, hsl.l)
    },
    [updatePrimaryColor]
  )

  const updateComplementaryFromHex = useCallback(
    (hex: string) => {
      const hsl = hexToHsl(hex)
      const newComplementary: HSL = { h: hsl.h, s: hsl.s, l: hsl.l }
      addToHistory(primary, newComplementary)
      setComplementary(newComplementary)
    },
    [addToHistory, primary]
  )

  const resetColors = useCallback(() => {
    const defaultState = { primary: DEFAULT_PRIMARY, complementary: DEFAULT_COMPLEMENTARY }
    setHistory([defaultState])
    setHistoryIndex(0)
    setPrimary(DEFAULT_PRIMARY)
    setComplementary(DEFAULT_COMPLEMENTARY)
  }, [])

  const applyPreset = useCallback(
    (hex: string) => {
      updatePrimaryFromHex(hex)
    },
    [updatePrimaryFromHex]
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      setHistoryIndex(newIndex)
      setPrimary(state.primary)
      setComplementary(state.complementary)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      setHistoryIndex(newIndex)
      setPrimary(state.primary)
      setComplementary(state.complementary)
    }
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo])

  return (
    <ColorContext.Provider
      value={{ 
        theme, 
        updatePrimaryColor, 
        updatePrimaryFromHex, 
        updateComplementaryFromHex, 
        resetColors, 
        applyPreset,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
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
