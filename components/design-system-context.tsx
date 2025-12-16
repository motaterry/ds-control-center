"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type ButtonTextColor = "dark" | "light" | "auto"

interface DesignSystemContextType {
  buttonTextColor: ButtonTextColor
  setButtonTextColor: (color: ButtonTextColor) => void
  borderRadius: number
  setBorderRadius: (radius: number) => void
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined)

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  // Always start with default values to match server render - default to "auto" for accessibility
  const [buttonTextColor, setButtonTextColorState] = useState<ButtonTextColor>("auto")
  const [borderRadius, setBorderRadiusState] = useState<number>(8)

  // Load from localStorage after hydration (client-side only)
  useEffect(() => {
    const savedButtonTextColor = localStorage.getItem("buttonTextColor") as ButtonTextColor
    if (savedButtonTextColor && (savedButtonTextColor === "dark" || savedButtonTextColor === "light" || savedButtonTextColor === "auto")) {
      setButtonTextColorState(savedButtonTextColor)
    }

    const savedBorderRadius = localStorage.getItem("borderRadius")
    if (savedBorderRadius) {
      const parsed = parseInt(savedBorderRadius, 10)
      if (!isNaN(parsed)) {
        setBorderRadiusState(parsed)
      }
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--button-text-color", buttonTextColor)
    localStorage.setItem("buttonTextColor", buttonTextColor)
  }, [buttonTextColor])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--border-radius", `${borderRadius}px`)
    localStorage.setItem("borderRadius", borderRadius.toString())
  }, [borderRadius])

  const setButtonTextColor = useCallback((color: ButtonTextColor) => {
    setButtonTextColorState(color)
  }, [])

  const setBorderRadius = useCallback((radius: number) => {
    setBorderRadiusState(radius)
  }, [])

  return (
    <DesignSystemContext.Provider
      value={{
        buttonTextColor,
        setButtonTextColor,
        borderRadius,
        setBorderRadius,
      }}
    >
      {children}
    </DesignSystemContext.Provider>
  )
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext)
  if (context === undefined) {
    throw new Error("useDesignSystem must be used within a DesignSystemProvider")
  }
  return context
}

