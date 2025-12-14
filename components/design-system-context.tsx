"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

type ButtonTextColor = "dark" | "light"

interface DesignSystemContextType {
  buttonTextColor: ButtonTextColor
  setButtonTextColor: (color: ButtonTextColor) => void
  borderRadius: number
  setBorderRadius: (radius: number) => void
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined)

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [buttonTextColor, setButtonTextColorState] = useState<ButtonTextColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("buttonTextColor") as ButtonTextColor) || "light"
    }
    return "light"
  })

  const [borderRadius, setBorderRadiusState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("borderRadius")
      return saved ? parseInt(saved, 10) : 8
    }
    return 8
  })

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

