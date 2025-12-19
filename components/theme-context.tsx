"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

type ThemeMode = "dark" | "light"

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Default theme must match what the server renders
const DEFAULT_THEME: ThemeMode = "light"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with consistent value to avoid hydration mismatch
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME)

  // Sync with actual theme from DOM after hydration
  useEffect(() => {
    const savedTheme = document.documentElement.getAttribute("data-theme") as ThemeMode
    if (savedTheme === "dark" || savedTheme === "light") {
      setModeState(savedTheme)
    }
  }, [])

  // Wrapped setMode that also persists to localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    try {
      localStorage.setItem("theme", newMode)
    } catch (e) {
      // localStorage may be unavailable in some environments
    }
  }, [])

  // Apply theme to document root and persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

