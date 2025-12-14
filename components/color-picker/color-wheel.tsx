"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { useColorTheme } from "./color-context"
import { hslToHex } from "@/lib/color-utils"

export function ColorWheel() {
  const { theme, updatePrimaryColor } = useColorTheme()
  const wheelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [center, setCenter] = useState({ x: 0, y: 0 })
  const [isFocused, setIsFocused] = useState(false)
  const previousAngleRef = useRef<number | null>(null)
  const [rotationAngle, setRotationAngle] = useState(0)

  const updateMetrics = useCallback(() => {
    if (wheelRef.current) {
      const rect = wheelRef.current.getBoundingClientRect()
      setCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
  }, [])

  useEffect(() => {
    updateMetrics()
    window.addEventListener("resize", updateMetrics)
    return () => window.removeEventListener("resize", updateMetrics)
  }, [updateMetrics])

  // Sync rotation angle when theme changes externally (not during drag)
  useEffect(() => {
    if (!isDragging) {
      setRotationAngle(theme.primary.h)
    }
  }, [theme.primary.h, isDragging])

  const calculateAngle = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - center.x
      const dy = clientY - center.y
      let angle = Math.atan2(dy, dx) * (180 / Math.PI)
      angle = angle + 90

      if (angle < 0) {
        angle += 360
      }

      // Handle continuous rotation without glitches
      if (previousAngleRef.current !== null) {
        let delta = angle - previousAngleRef.current
        
        // Normalize delta to handle wrap-around
        if (delta > 180) {
          delta -= 360
        } else if (delta < -180) {
          delta += 360
        }
        
        // Accumulate rotation for smooth continuous rotation
        setRotationAngle((prev) => prev + delta)
      } else {
        // Initialize rotation angle on first calculation
        setRotationAngle(angle)
      }
      
      previousAngleRef.current = angle
      updatePrimaryColor(Math.round(angle) % 360)
    },
    [center, updatePrimaryColor]
  )

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true)
      updateMetrics()
      
      // Reset rotation tracking when starting a new drag
      previousAngleRef.current = null
      setRotationAngle(theme.primary.h)
      
      let clientX: number
      let clientY: number

      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      calculateAngle(clientX, clientY)
      e.preventDefault()
    },
    [updateMetrics, calculateAngle, theme.primary.h]
  )

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return

      let clientX: number
      let clientY: number

      if ("touches" in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      calculateAngle(clientX, clientY)
    },
    [isDragging, calculateAngle]
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    // Sync rotation angle with current hue when drag ends
    setRotationAngle(theme.primary.h)
    previousAngleRef.current = null
  }, [theme.primary.h])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isFocused) return

      let newHue = theme.primary.h
      const step = e.shiftKey ? 10 : 1 // Shift for larger steps

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          newHue = (newHue - step + 360) % 360
          break
        case "ArrowDown":
          e.preventDefault()
          newHue = (newHue + step) % 360
          break
        case "ArrowLeft":
          e.preventDefault()
          newHue = (newHue - step + 360) % 360
          break
        case "ArrowRight":
          e.preventDefault()
          newHue = (newHue + step) % 360
          break
        case "Home":
          e.preventDefault()
          newHue = 0
          break
        case "End":
          e.preventDefault()
          newHue = 359 // End of the color spectrum (0-359)
          break
        default:
          return
      }

      updatePrimaryColor(newHue)
    },
    [isFocused, theme.primary.h, updatePrimaryColor]
  )

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("touchmove", handleMove)
      window.addEventListener("mouseup", handleEnd)
      window.addEventListener("touchend", handleEnd)

      return () => {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("touchmove", handleMove)
        window.removeEventListener("mouseup", handleEnd)
        window.removeEventListener("touchend", handleEnd)
      }
    }
  }, [isDragging, handleMove, handleEnd])

  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
  const compHex = hslToHex(
    theme.complementary.h,
    theme.complementary.s,
    theme.complementary.l
  )

  return (
    <div className="flex justify-center">
      <div className="relative w-[256px] h-[256px]" ref={wheelRef}>
          <div
            ref={containerRef}
            role="slider"
            aria-label="Primary color picker"
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={theme.primary.h}
            aria-valuetext={`Hue: ${theme.primary.h} degrees`}
            tabIndex={0}
            className={`w-full h-full rounded-full cursor-grab active:cursor-grabbing touch-none transition-all ${
              isFocused ? "ring-4 ring-[var(--color-primary)] ring-offset-2 ring-offset-slate-900" : ""
            }`}
            style={{
              background: `conic-gradient(
                hsl(0, 100%, 50%),
                hsl(60, 100%, 50%),
                hsl(120, 100%, 50%),
                hsl(180, 100%, 50%),
                hsl(240, 100%, 50%),
                hsl(300, 100%, 50%),
                hsl(360, 100%, 50%)
              )`,
            }}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            {/* Primary selector */}
            <div
              className="absolute top-1/2 left-1/2 w-1"
              style={{
                height: "50%",
                transform: `translate(-50%, -100%) rotate(${rotationAngle}deg)`,
                transformOrigin: "center bottom",
                transition: isDragging ? "none" : "transform 0.1s",
              }}
              aria-hidden="true"
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-3 border-white"
                style={{
                  backgroundColor: primaryHex,
                }}
              />
            </div>

            {/* Complementary selector */}
            <div
              className="absolute top-1/2 left-1/2 w-1 opacity-60"
              style={{
                height: "50%",
                transform: `translate(-50%, -100%) rotate(${theme.complementary.h}deg)`,
                transformOrigin: "center bottom",
                transition: "transform 0.1s",
              }}
              aria-hidden="true"
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/80"
                style={{
                  backgroundColor: compHex,
                }}
              />
            </div>

            {/* Center cap */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full z-10 flex items-center justify-center">
              <div
                className="w-[80%] h-[80%] rounded-full opacity-80 blur-[10px]"
                style={{
                  background: `linear-gradient(135deg, ${primaryHex}, ${compHex})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
  )
}
