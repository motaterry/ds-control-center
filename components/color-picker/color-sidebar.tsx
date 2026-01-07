"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ColorWheel } from "./color-wheel"
import { useColorTheme } from "./color-context"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { hslToHex, formatHsl, getContrastRatio, getAccessibleTextColor, normalizeHex } from "@/lib/color-utils"
import { ChevronDown, Moon, Type, SquareIcon, Download, Box, Undo2, Redo2, Palette, Settings, Layers, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightOpen, ShieldCheck, CornerUpLeft } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { DresscodeLogo } from "@/components/logo/dresscode-logo"
import { ExportModal } from "./export-modal"
import { Switch } from "@/components/ui/switch"
import { Tooltip } from "@/components/ui/tooltip"
import { ColorPresets } from "./color-presets"
import { ContrastChecker } from "./contrast-checker"
import { AccessibilityChecker } from "./accessibility-checker"

const PERCENTAGES = [5, 20, 30, 40, 50, 60, 70, 80, 90]

// Logo component - uses the full logo from SVG file
function LogoIcon({ isDark }: { isDark: boolean }) {
  return (
    <DresscodeLogo 
      className={isDark ? "text-white" : "text-gray-900"}
    />
  )
}

// Logo icon only - clipped version showing just the DC icon
function LogoIconOnly({ isDark }: { isDark: boolean }) {
  return (
    <svg 
      width="32" 
      height="18" 
      viewBox="0 0 47 26" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        isDark ? "text-white" : "text-gray-900",
        "flex-shrink-0"
      )}
      style={{
        transition: 'opacity 600ms linear, transform 600ms linear',
        willChange: 'opacity, transform',
      }}
      aria-label="Dresscode"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2168 0C16.0072 0 19.6529 1.07485 22.1533 3.22461C22.6362 3.6315 23.0724 4.07483 23.4629 4.55273C23.6122 4.5444 23.7626 4.53907 23.9141 4.53906C24.0654 4.53906 24.216 4.54441 24.3652 4.55273C24.7558 4.07474 25.1918 3.63157 25.6748 3.22461C28.1752 1.07473 31.8209 4.56516e-05 36.6113 0H47.8291V25.0283H37.1729C32.2888 25.0283 28.5264 23.9409 25.8857 21.7676C25.3908 21.3638 24.942 20.9286 24.5391 20.4619C24.3328 20.4779 24.1244 20.4893 23.9141 20.4893C23.7037 20.4893 23.4954 20.4779 23.2891 20.4619C22.8862 20.9284 22.4381 21.364 21.9434 21.7676C19.3027 23.9409 15.5403 25.0283 10.6562 25.0283H0V0H11.2168ZM5.57324 20.3662H10.9014C13.9624 20.3662 16.2643 19.7 17.8066 18.3682C17.931 18.2623 18.0486 18.1499 18.1631 18.0361C16.7867 16.603 15.9395 14.6576 15.9395 12.5137C15.9395 10.3217 16.8235 8.33605 18.2549 6.89453C16.8013 5.40662 14.5142 4.66216 11.3926 4.66211H5.57324V20.3662ZM36.4365 4.66211C33.3142 4.66211 31.0269 5.40704 29.5732 6.89551C31.0045 8.337 31.8896 10.3218 31.8896 12.5137C31.8896 14.658 31.0409 16.6029 29.6641 18.0361C29.7788 18.1502 29.8968 18.2621 30.0215 18.3682C31.5638 19.7001 33.8657 20.3662 36.9268 20.3662H42.2549V4.66211H36.4365Z" fill="currentColor"/>
    </svg>
  )
}

// Mode icon component - using Lucide Moon icon
function ModeIcon({ isDark }: { isDark: boolean }) {
  return (
    <Moon 
      size={16} 
      className={isDark ? "text-white" : "text-gray-900"}
    />
  )
}

// Text color icon component - using Lucide Type icon
function TextColorIcon({ isDark }: { isDark: boolean }) {
  return (
    <Type 
      size={16} 
      className={isDark ? "text-white" : "text-gray-900"}
    />
  )
}

// Border radius icon component - using Lucide CornerUpLeft icon
function BorderRadiusIcon({ isDark }: { isDark: boolean }) {
  return (
    <CornerUpLeft 
      size={16} 
      className={isDark ? "text-white" : "text-gray-900"}
    />
  )
}

// 3D Effects icon component - using Lucide Box icon
function ThreeDIcon({ isDark }: { isDark: boolean }) {
  return (
    <Box 
      size={16} 
      className={isDark ? "text-white" : "text-gray-900"}
    />
  )
}

type TabId = "colors" | "settings" | "accessibility"

export function ColorSidebar() {
  const { theme, updatePrimaryFromHex, updateComplementaryFromHex, undo, redo, canUndo, canRedo } = useColorTheme()
  const { mode, setMode } = useTheme()
  const { buttonTextColor, setButtonTextColor, borderRadius, setBorderRadius, enable3D, setEnable3D } = useDesignSystem()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabId>("colors")
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-minimized")
      return saved === "true"
    }
    return false
  })
  const [expanded, setExpanded] = useState({
    tints: false,
    shades: false,
    neutralLighter: false,
    neutralDarker: false,
    mode: true, // Settings accordions open by default
    buttonText: true,
    borderRadius: true,
    threeD: true,
    contrast: true,
  })
  const [isLogoStuck, setIsLogoStuck] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  
  const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
  const compHex = hslToHex(
    theme.complementary.h,
    theme.complementary.s,
    theme.complementary.l
  )
  
  const [customHexInput, setCustomHexInput] = useState(() => primaryHex)
  const [customCompHexInput, setCustomCompHexInput] = useState(() => compHex)
  const [isValidHex, setIsValidHex] = useState(true)
  const [isValidCompHex, setIsValidCompHex] = useState(true)
  const logoRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const tabListRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const dragStartPosRef = useRef({ x: 0, y: 0 })
  const clickedButtonRef = useRef<HTMLElement | null>(null)

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleMinimize = () => {
    const newState = !isMinimized
    setIsMinimized(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-minimized", String(newState))
      // Dispatch custom event to notify parent component
      window.dispatchEvent(new CustomEvent("sidebar-minimized-changed", { detail: { isMinimized: newState } }))
    }
  }

  // Check if a tab button is clipped (partially or fully hidden)
  const isTabClipped = (button: HTMLElement, container: HTMLElement): boolean => {
    const buttonRect = button.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    // Check if button is clipped on the left or right
    const isClippedLeft = buttonRect.left < containerRect.left
    const isClippedRight = buttonRect.right > containerRect.right
    
    return isClippedLeft || isClippedRight
  }

  // Scroll tab into view if clipped
  const scrollTabIntoView = (tabId: TabId) => {
    if (!tabListRef.current) return
    
    const button = tabListRef.current.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement
    if (!button) return
    
    // Check if the tab is clipped
    if (isTabClipped(button, tabListRef.current)) {
      // Use scrollIntoView with smooth behavior
      button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }

  // Handle tab click with scroll animation if clipped
  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId)
    // Scroll into view if clipped (with a small delay to ensure DOM is updated)
    setTimeout(() => {
      scrollTabIntoView(tabId)
    }, 0)
  }

  // Grab-scroll functionality for tabs
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !tabListRef.current) return
    e.preventDefault()
    const x = e.pageX - (tabListRef.current.getBoundingClientRect().left)
    const walk = (x - startX) * 2 // Scroll speed multiplier
    tabListRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging && clickedButtonRef.current) {
      // Check if it was a click (minimal movement) vs a drag
      const moveX = Math.abs(e.pageX - dragStartPosRef.current.x)
      const moveY = Math.abs(e.pageY - dragStartPosRef.current.y)
      const isClick = moveX < 5 && moveY < 5
      
      if (isClick) {
        // Trigger the button click
        clickedButtonRef.current.click()
      }
    }
    
    setIsDragging(false)
    clickedButtonRef.current = null
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabListRef.current) return
    
    const button = (e.target as HTMLElement).closest('button')
    if (button) {
      clickedButtonRef.current = button as HTMLElement
    } else {
      clickedButtonRef.current = null
    }
    
    setIsDragging(true)
    const rect = tabListRef.current.getBoundingClientRect()
    setStartX(e.pageX - rect.left)
    setScrollLeft(tabListRef.current.scrollLeft)
    dragStartPosRef.current = { x: e.pageX, y: e.pageY }
    e.preventDefault()
  }

  // Add global mouse listeners for better drag experience
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const isDark = mode === "dark"

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, currentTabId: TabId) => {
    const tabs: TabId[] = ["colors", "settings", "accessibility"]
    const currentIndex = tabs.indexOf(currentTabId)
    
    let nextIndex = currentIndex
    if (e.key === "ArrowLeft") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
      e.preventDefault()
    } else if (e.key === "ArrowRight") {
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
      e.preventDefault()
    } else if (e.key === "Home") {
      nextIndex = 0
      e.preventDefault()
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1
      e.preventDefault()
    }
    
    if (nextIndex !== currentIndex) {
      setActiveTab(tabs[nextIndex])
      // Focus the newly selected tab and scroll into view if clipped
      setTimeout(() => {
        const tabButton = document.querySelector(`[data-tab-id="${tabs[nextIndex]}"]`) as HTMLElement
        if (tabButton) {
          tabButton.focus()
          scrollTabIntoView(tabs[nextIndex])
        }
      }, 0)
    }
  }


  // Sync custom hex input when color changes externally (from wheel)
  useEffect(() => {
    setCustomHexInput(primaryHex)
    setIsValidHex(true)
  }, [primaryHex])

  useEffect(() => {
    setCustomCompHexInput(compHex)
    setIsValidCompHex(true)
  }, [compHex])

  // Handlers for custom brand color input
  const handleCustomColorInput = (value: string) => {
    setCustomHexInput(value)
    // Real-time validation feedback
    if (value === "") {
      setIsValidHex(true)
    } else {
      // Check if it's a valid hex pattern (allowing partial input)
      const trimmed = value.trim()
      const hexPattern = /^#?([a-f\d]{0,6})$/i
      setIsValidHex(hexPattern.test(trimmed))
    }
  }

  const handleCustomColorPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').trim()
    const normalized = normalizeHex(pastedText)
    if (normalized) {
      setCustomHexInput(normalized)
      setIsValidHex(true)
      updatePrimaryFromHex(normalized)
      addToast({
        title: "Color pasted!",
        description: `Brand color set to ${normalized}`,
        variant: "success",
        duration: 2000,
      })
    } else {
      setCustomHexInput(pastedText)
      setIsValidHex(false)
    }
  }

  const handleCustomColorBlur = () => {
    if (!customHexInput.trim()) {
      setCustomHexInput(primaryHex)
      return
    }

    const normalized = normalizeHex(customHexInput)
    if (!normalized) {
      setIsValidHex(false)
      addToast({
        title: "Invalid color",
        description: "Please enter a valid hex color (e.g., #FF5733 or FF5733)",
        variant: "error",
        duration: 3000,
      })
      return
    }

    updatePrimaryFromHex(normalized)
    setCustomHexInput(normalized)
    setIsValidHex(true)
    addToast({
      title: "Color updated!",
      description: `Brand color set to ${normalized}`,
      variant: "success",
      duration: 2000,
    })
  }

  const handleCustomColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCustomColorBlur()
    } else if (e.key === "Escape") {
      setCustomHexInput(primaryHex)
      setIsValidHex(true)
      e.currentTarget.blur()
    }
  }

  // Handlers for complementary color input
  const handleCompColorInput = (value: string) => {
    setCustomCompHexInput(value)
    // Real-time validation feedback
    if (value === "") {
      setIsValidCompHex(true)
    } else {
      // Check if it's a valid hex pattern (allowing partial input)
      const trimmed = value.trim()
      const hexPattern = /^#?([a-f\d]{0,6})$/i
      setIsValidCompHex(hexPattern.test(trimmed))
    }
  }

  const handleCompColorPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').trim()
    const normalized = normalizeHex(pastedText)
    if (normalized) {
      setCustomCompHexInput(normalized)
      setIsValidCompHex(true)
      updateComplementaryFromHex(normalized)
      addToast({
        title: "Color pasted!",
        description: `Complementary color set to ${normalized}`,
        variant: "success",
        duration: 2000,
      })
    } else {
      setCustomCompHexInput(pastedText)
      setIsValidCompHex(false)
    }
  }

  const handleCompColorBlur = () => {
    if (!customCompHexInput.trim()) {
      setCustomCompHexInput(compHex)
      return
    }

    const normalized = normalizeHex(customCompHexInput)
    if (!normalized) {
      setIsValidCompHex(false)
      addToast({
        title: "Invalid color",
        description: "Please enter a valid hex color (e.g., #FF5733 or FF5733)",
        variant: "error",
        duration: 3000,
      })
      return
    }

    updateComplementaryFromHex(normalized)
    setCustomCompHexInput(normalized)
    setIsValidCompHex(true)
    addToast({
      title: "Color updated!",
      description: `Complementary color set to ${normalized}`,
      variant: "success",
      duration: 2000,
    })
  }

  const handleCompColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCompColorBlur()
    } else if (e.key === "Escape") {
      setCustomCompHexInput(compHex)
      setIsValidCompHex(true)
      e.currentTarget.blur()
    }
  }

  // Dispatch initial minimized state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sidebar-minimized-changed", { detail: { isMinimized } }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount to sync initial state

  // Detect when logo is stuck at the top using IntersectionObserver (more performant)
  useEffect(() => {
    const sentinel = sentinelRef.current
    const sidebar = sidebarRef.current
    if (!sentinel || !sidebar) return

    let hasBeenStuck = false

    const checkScrollPosition = () => {
      const scrollTop = sidebar.scrollTop
      
      // Track if user has scrolled at all
      if (scrollTop > 10 && !hasScrolled) {
        setHasScrolled(true)
      }
      
      if (!hasBeenStuck) return // Only check if we've been stuck
      
      // Only unstick when back at the very top
      if (scrollTop <= 10) {
        hasBeenStuck = false
        setIsLogoStuck(false)
      } else {
        // Keep it stuck - don't let it unstick
        setIsLogoStuck(true)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting
        
        // When sentinel goes out of view, logo becomes stuck
        if (!isIntersecting) {
          hasBeenStuck = true
          setIsLogoStuck(true)
        }
        // When sentinel is visible again, check scroll position
        // but don't automatically unstick - only unstick if at top
        if (isIntersecting && hasBeenStuck) {
          checkScrollPosition()
        }
      },
      {
        root: sidebar,
        rootMargin: '-8px 0px 0px 0px', // Account for padding
        threshold: 0
      }
    )

    observer.observe(sentinel)
    
    // Continuously check scroll position to ensure it stays stuck
    sidebar.addEventListener('scroll', checkScrollPosition, { passive: true })

    return () => {
      observer.disconnect()
      sidebar.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        [data-sidebar-scroll]::-webkit-scrollbar {
          display: none;
        }
        [data-sidebar-scroll] {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      <div 
        ref={sidebarRef}
        data-sidebar-scroll
        className={cn(
          "max-h-screen scroll-smooth overflow-y-auto",
          isMinimized ? "px-2 py-4" : "p-4"
        )}
        style={{ 
          backgroundColor: isMinimized 
            ? 'transparent' 
            : isDark 
              ? 'rgba(0,0,0,0.92)' 
              : 'rgba(249,250,251,0.98)',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
          overscrollBehaviorY: 'contain',
          transition: 'background-color 0.5s linear',
        }}
      >
      {/* Main container with border */}
      <div 
        className={cn(
          "flex flex-col gap-8 rounded-3xl relative min-w-0 w-full",
          !isMinimized && "border",
          isMinimized && "min-w-[60px] gap-0"
        )}
        style={{
          backgroundColor: isMinimized 
            ? 'transparent' 
            : isDark 
              ? 'rgb(0, 0, 0)' 
              : 'rgb(255, 255, 255)',
          borderColor: isMinimized 
            ? 'transparent' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.5)' 
              : 'rgb(209, 213, 219)',
          borderWidth: isMinimized ? '0px' : '1px',
          transition: 'width 600ms linear 0ms, min-width 600ms linear 0ms, max-width 600ms linear 0ms, background-color 150ms linear 0ms, border-color 150ms linear 0ms, border-width 150ms linear 0ms',
          willChange: 'width, min-width, max-width, background-color, border-color, border-width',
          ...(isMinimized && { 
            width: 'fit-content',
            maxWidth: 'fit-content'
          })
        }}
      >
        {/* Sentinel element for IntersectionObserver - invisible marker at top */}
        <div 
          ref={sentinelRef}
          className="absolute top-0 left-0 w-full h-1 pointer-events-none"
          style={{ visibility: 'hidden' }}
          aria-hidden="true"
        />
        
        {/* Logo - Sticky at top when scrolled - now direct child of main container */}
        <div 
          ref={logoRef}
          className={cn(
            "px-4 pb-4 pt-6 rounded-t-3xl w-full",
            isMinimized && "rounded-b-3xl px-2 w-fit mx-auto",
            isLogoStuck && "sticky z-10 border-b",
            isLogoStuck && (isDark ? 'border-white/50' : 'border-gray-300')
          )}
          style={{
            transform: 'translateZ(0)',
            backgroundColor: isMinimized 
              ? 'transparent' 
              : isDark 
                ? "rgba(0, 0, 0, 0.6)" 
                : "rgba(255, 255, 255, 0.7)",
            backdropFilter: isMinimized ? 'none' : "blur(4px)",
            WebkitBackdropFilter: isMinimized ? 'none' : "blur(4px)",
            transition: 'border-radius 600ms linear 0ms, width 600ms linear 0ms, background-color 150ms linear 0ms, backdrop-filter 150ms linear 0ms, -webkit-backdrop-filter 150ms linear 0ms',
            willChange: isLogoStuck ? 'transform' : 'width, border-radius, background-color, backdrop-filter',
            ...(isLogoStuck && { top: 'var(--logo-sticky-offset)' })
          }}
        >
          {isMinimized ? (
            <div className="flex items-center justify-center gap-2 w-fit" style={{
              transition: 'opacity 600ms linear, transform 600ms linear',
              willChange: 'opacity, transform',
            }}>
              <LogoIconOnly isDark={isDark} />
              <button
                onClick={toggleMinimize}
                className={cn(
                  "p-1.5 rounded-lg flex-shrink-0 cursor-pointer transition-all duration-200",
                  isDark
                    ? "bg-transparent hover:bg-white/15 text-white/70 hover:text-white active:bg-white/20"
                    : "bg-transparent hover:bg-gray-200 text-gray-600 hover:text-gray-900 active:bg-gray-300"
                )}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5 items-center justify-between" style={{
              transition: 'opacity 600ms linear, transform 600ms linear',
              willChange: 'opacity, transform',
            }}>
              <LogoIcon isDark={isDark} />
              <button
                onClick={toggleMinimize}
                className={cn(
                  "p-1.5 rounded-lg cursor-pointer transition-all duration-200",
                  isDark
                    ? "bg-transparent hover:bg-white/15 text-white/70 hover:text-white active:bg-white/20"
                    : "bg-transparent hover:bg-gray-200 text-gray-600 hover:text-gray-900 active:bg-gray-300"
                )}
                aria-label="Minimize sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Header Section - Title & Description - Only show when not minimized */}
        {!isMinimized && (
          <div 
            className="flex flex-col gap-6"
            style={{
              animation: 'fadeInSlide 0.5s linear',
            }}
          >
            <div className="flex flex-col gap-6 px-4">
              <h1 className={`text-[35px] font-bold leading-[40px] tracking-[-0.16px] ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Control Center Dashboard
              </h1>
              <p className={`text-lg leading-[26px] tracking-[-0.04px] ${
                isDark ? 'text-[#bbb]' : 'text-gray-600'
              }`}>
                Customize your design system colors and see them update in real-time
              </p>
              
              {/* Author credit line */}
              <div className="flex justify-end">
                <span 
                  className={`text-[10px] lowercase tracking-[0.5px] italic ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ fontFamily: "'Aktiv Grotesk Ex', sans-serif" }}
                >
                  by Tercio Mota
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation - Only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Divider */}
            <div className={`h-px w-full ${isDark ? 'bg-white/50' : 'bg-gray-300'}`} />

            {/* Tabs */}
            <div className="px-4 pt-1 min-w-0 overflow-x-hidden">
              {/* Undo/Redo Controls */}
              <div className="flex gap-1 w-full justify-start items-center h-fit">
                <Tooltip content="Undo (Cmd/Ctrl+Z)" side="top">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={cn(
                      "p-1 rounded-md transition-all duration-200 ease-out",
                      "focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]",
                      canUndo
                        ? isDark
                          ? "bg-white/10 hover:bg-white/15 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        : isDark
                          ? "bg-white/5 text-white/30 cursor-not-allowed"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed"
                    )}
                    aria-label="Undo color change"
                  >
                    <Undo2 className="w-3 h-3" />
                  </button>
                </Tooltip>
                <Tooltip content="Redo (Cmd/Ctrl+Shift+Z)" side="top">
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={cn(
                      "p-1 rounded-md transition-all duration-200 ease-out",
                      "focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]",
                      canRedo
                        ? isDark
                          ? "bg-white/10 hover:bg-white/15 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        : isDark
                          ? "bg-white/5 text-white/30 cursor-not-allowed"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed"
                    )}
                    aria-label="Redo color change"
                  >
                    <Redo2 className="w-3 h-3" />
                  </button>
                </Tooltip>
              </div>
              <div 
                ref={tabListRef}
                role="tablist" 
                aria-label="Navigation tabs"
                className={cn(
                  "flex gap-0 border-b overflow-x-auto min-w-0",
                  "scrollbar-hide select-none",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                  "active:cursor-grabbing"
                )}
                style={{ 
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  WebkitOverflowScrolling: 'touch'
                }}
                onMouseDown={handleMouseDown}
              >
                {[
                  { id: "colors" as TabId, label: "Colors", icon: Palette },
                  { id: "settings" as TabId, label: "Settings", icon: Settings },
                  { id: "accessibility" as TabId, label: "Accessibility", icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isSelected = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      data-tab-id={tab.id}
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`tabpanel-${tab.id}`}
                      id={`tab-${tab.id}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => handleTabClick(tab.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px",
                        "focus:outline-none",
                        "flex-shrink-0 whitespace-nowrap min-w-fit",
                        "pointer-events-auto",
                        isDragging ? "cursor-grabbing" : "cursor-grab",
                        isSelected
                          ? isDark
                            ? "text-white border-white"
                            : "text-gray-900 border-gray-900"
                          : isDark
                            ? "text-white/60 border-transparent hover:text-white hover:border-white/30"
                            : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                      )}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Tab Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto min-w-0">
            {/* Colors Tab */}
            {activeTab === "colors" && (
              <div 
                role="tabpanel"
                id="tabpanel-colors"
                aria-labelledby="tab-colors"
                className="flex flex-col min-w-0"
              >
                {/* Color Wheel Section */}
                <div id="colors" className="flex flex-col gap-8 items-center px-4 py-6 w-full">
                  <ColorWheel />
                  
                  {/* Custom Brand Color Input Section */}
                  <div className="flex flex-col gap-4 w-full max-w-full">
                    {/* Primary Color Input */}
                    <div className="flex flex-col gap-2 w-full">
                      <label className={`text-sm font-semibold leading-5 ${
                        isDark ? 'text-[#bbb]' : 'text-gray-600'
                      }`}>
                        Primary Color
                      </label>
              <div className="flex gap-3 items-center justify-center w-full max-w-full">
                <div className="flex-1 relative min-w-0 max-w-full">
                  <Tooltip content="Enter hex color code (e.g., #FF5733)" side="top">
                    <input
                      type="text"
                      placeholder="#FF5733"
                      value={customHexInput}
                      onChange={(e) => handleCustomColorInput(e.target.value)}
                      onBlur={handleCustomColorBlur}
                      onKeyDown={handleCustomColorKeyDown}
                      onPaste={handleCustomColorPaste}
                      onFocus={(e) => {
                        e.target.style.outline = 'none'
                        e.target.style.outlineOffset = '0'
                        e.target.style.boxShadow = 'none'
                      }}
                      style={{
                        outline: 'none !important',
                        outlineOffset: '0 !important',
                        boxShadow: 'none !important',
                        paddingRight: '120px',
                      }}
                      className={`w-full h-10 px-4 rounded-lg border font-sans text-sm transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:bg-white/10'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:bg-white'
                      } ${!isValidHex && customHexInput ? 'border-red-500 focus:border-red-600' : ''}`}
                      aria-label="Enter primary color hex code"
                    />
                    <span 
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none select-none ${
                        isDark ? 'text-white/30' : 'text-gray-400'
                      }`}
                      style={{ letterSpacing: '0.05em' }}
                      aria-hidden="true"
                    >
                      HSL {formatHsl(theme.primary.h, theme.primary.s, theme.primary.l)}
                    </span>
                  </Tooltip>
                  {!isValidHex && customHexInput && (
                    <span className={`absolute right-[140px] top-1/2 -translate-y-1/2 text-xs ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Invalid
                    </span>
                  )}
                </div>
                <Tooltip content="Visual primary color picker" side="top">
                  <div className="relative shrink-0 flex-shrink-0 flex flex-col self-end" style={{ verticalAlign: 'bottom' }}>
                    <input
                      type="color"
                      value={primaryHex}
                      onChange={(e) => {
                        updatePrimaryFromHex(e.target.value)
                        setCustomHexInput(e.target.value)
                      }}
                      style={{
                        backgroundColor: primaryHex,
                        borderRadius: `${borderRadius}px`,
                        padding: '0',
                        margin: '0',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      className="cursor-pointer"
                      title="Pick primary color visually"
                      aria-label="Visual primary color picker"
                    />
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* Complementary Color Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className={`text-sm font-semibold leading-5 ${
                isDark ? 'text-[#bbb]' : 'text-gray-600'
              }`}>
                Complementary Color
              </label>
              <div className="flex gap-3 items-center justify-center w-full max-w-full">
                <div className="flex-1 relative min-w-0 max-w-full">
                  <Tooltip content="Enter hex color code (e.g., #5733FF)" side="top">
                    <input
                      type="text"
                      placeholder="#5733FF"
                      value={customCompHexInput}
                      onChange={(e) => handleCompColorInput(e.target.value)}
                      onBlur={handleCompColorBlur}
                      onKeyDown={handleCompColorKeyDown}
                      onPaste={handleCompColorPaste}
                      onFocus={(e) => {
                        e.target.style.outline = 'none'
                        e.target.style.outlineOffset = '0'
                        e.target.style.boxShadow = 'none'
                      }}
                      style={{
                        outline: 'none !important',
                        outlineOffset: '0 !important',
                        boxShadow: 'none !important',
                        paddingRight: '120px',
                      }}
                      className={`w-full h-10 px-4 rounded-lg border font-sans text-sm transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:bg-white/10'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:bg-white'
                      } ${!isValidCompHex && customCompHexInput ? 'border-red-500 focus:border-red-600' : ''}`}
                      aria-label="Enter complementary color hex code"
                    />
                    <span 
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none select-none ${
                        isDark ? 'text-white/30' : 'text-gray-400'
                      }`}
                      style={{ letterSpacing: '0.05em' }}
                      aria-hidden="true"
                    >
                      HSL {formatHsl(theme.complementary.h, theme.complementary.s, theme.complementary.l)}
                    </span>
                  </Tooltip>
                  {!isValidCompHex && customCompHexInput && (
                    <span className={`absolute right-[140px] top-1/2 -translate-y-1/2 text-xs ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      Invalid
                    </span>
                  )}
                </div>
                <Tooltip content="Visual complementary color picker" side="top">
                  <div className="relative shrink-0 flex-shrink-0 flex flex-col self-end" style={{ verticalAlign: 'bottom' }}>
                    <input
                      type="color"
                      value={compHex}
                      onChange={(e) => {
                        updateComplementaryFromHex(e.target.value)
                        setCustomCompHexInput(e.target.value)
                      }}
                      style={{
                        backgroundColor: compHex,
                        borderRadius: `${borderRadius}px`,
                        padding: '0',
                        margin: '0',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      className="cursor-pointer"
                      title="Pick complementary color visually"
                      aria-label="Visual complementary color picker"
                    />
                  </div>
                </Tooltip>
              </div>
            </div>
            
                    {/* Helper text */}
                    <p className={`text-xs ${
                      isDark ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Type a hex code or use the color picker
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className={`h-px w-full ${isDark ? 'bg-white/50' : 'bg-gray-300'}`} />

                {/* Color Presets Section */}
                <div id="presets" className="px-4 py-6" data-tutorial="presets">
                  <ColorPresets />
                </div>

                {/* Divider */}
                <div className={`h-px w-full ${isDark ? 'bg-white/50' : 'bg-gray-300'}`} />

                {/* Palettes Section - Collapsible */}
                <div className="px-4 pt-4 pb-4">
                  <CollapsibleSection
                    title="Color Palettes"
                    icon={<Layers size={16} className={isDark ? "text-white" : "text-gray-900"} />}
                    isExpanded={expanded.tints || expanded.shades || expanded.neutralLighter || expanded.neutralDarker}
                    onToggle={() => {
                      // Toggle all palettes at once, or expand first one if all collapsed
                      const anyExpanded = expanded.tints || expanded.shades || expanded.neutralLighter || expanded.neutralDarker
                      if (anyExpanded) {
                        setExpanded(prev => ({
                          ...prev,
                          tints: false,
                          shades: false,
                          neutralLighter: false,
                          neutralDarker: false,
                        }))
                      } else {
                        setExpanded(prev => ({
                          ...prev,
                          tints: true,
                        }))
                      }
                    }}
                    isDark={isDark}
                  >
                    <div className="flex flex-col gap-6">
                      <PaletteSection
                        title="Lighter Tones"
                        colors={theme.tints}
                        isExpanded={expanded.tints}
                        onToggle={() => toggleSection("tints")}
                        darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
                      />
                      <PaletteSection
                        title="Darker Tones"
                        colors={theme.shades}
                        isExpanded={expanded.shades}
                        onToggle={() => toggleSection("shades")}
                        darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
                      />
                      <PaletteSection
                        title="Neutral Lighter"
                        colors={theme.neutralLighter}
                        isExpanded={expanded.neutralLighter}
                        onToggle={() => toggleSection("neutralLighter")}
                        darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
                      />
                      <PaletteSection
                        title="Neutral Darker"
                        colors={theme.neutralDarker}
                        isExpanded={expanded.neutralDarker}
                        onToggle={() => toggleSection("neutralDarker")}
                        darkestNeutral={theme.neutralDarker[theme.neutralDarker.length - 1]}
                      />
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === "accessibility" && (
              <div 
                role="tabpanel"
                id="tabpanel-accessibility"
                aria-labelledby="tab-accessibility"
                className="flex flex-col min-w-0"
              >
                <div id="accessibility" className="flex flex-col gap-6 px-4 py-6" data-tutorial="accessibility">
                  <AccessibilityChecker />
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div 
                role="tabpanel"
                id="tabpanel-settings"
                aria-labelledby="tab-settings"
                className="flex flex-col min-w-0"
              >
                <div id="settings" className="flex flex-col gap-6 px-4 py-6" data-tutorial="settings">
                  {/* Mode Toggle Section - Collapsible */}
                  <CollapsibleSection
                    title="Mode"
                    icon={<ModeIcon isDark={isDark} />}
                    isExpanded={expanded.mode}
                    onToggle={() => toggleSection("mode")}
                    isDark={isDark}
                  >
                    <Tooltip content={`Switch to ${mode === "dark" ? "light" : "dark"} mode`} side="top">
                      <div className="flex items-stretch w-full">
                        <button
                          onClick={() => setMode("dark")}
                          className={`flex-1 h-12 flex items-center justify-center rounded-l-lg transition-all duration-200 ease-out cursor-pointer ${
                            mode === "dark"
                              ? isDark 
                                ? "bg-white/10 border border-r-0 border-white/50" 
                                : "bg-gray-200 border border-r-0 border-gray-300"
                              : isDark
                                ? "bg-transparent border border-r-0 border-white/50"
                                : "bg-transparent border border-r-0 border-gray-300"
                          }`}
                          aria-pressed={mode === "dark"}
                          aria-label="Dark Mode"
                        >
                          <span className={`text-lg font-bold ${
                            mode === "dark" 
                              ? isDark ? 'text-white' : 'text-gray-900'
                              : isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            Dark
                          </span>
                        </button>
                        <button
                          onClick={() => setMode("light")}
                          className={`flex-1 h-12 flex items-center justify-center rounded-r-lg transition-all duration-200 ease-out cursor-pointer ${
                            mode === "light"
                              ? isDark
                                ? "bg-white/10 border border-white/50"
                                : "bg-gray-200 border border-gray-300"
                              : isDark
                                ? "bg-transparent border border-white/50"
                                : "bg-transparent border border-gray-300"
                          }`}
                          aria-pressed={mode === "light"}
                          aria-label="Light Mode"
                        >
                          <span className={`text-lg font-bold ${
                            mode === "light"
                              ? isDark ? 'text-white' : 'text-gray-900'
                              : isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            Light
                          </span>
                        </button>
                      </div>
                    </Tooltip>
                  </CollapsibleSection>

                  {/* Button Text Color Section - Collapsible */}
                  <CollapsibleSection
                    title="Button Text Color"
                    icon={<TextColorIcon isDark={isDark} />}
                    isExpanded={expanded.buttonText}
                    onToggle={() => toggleSection("buttonText")}
                    isDark={isDark}
                  >
                    <Tooltip content={`Set button text color to ${buttonTextColor === "auto" ? "auto (automatic contrast)" : buttonTextColor === "dark" ? "black" : "white"}`} side="top">
                      <div className="flex items-stretch w-full">
                        <button
                          onClick={() => setButtonTextColor("auto")}
                          className={`flex-1 h-12 flex items-center justify-center rounded-l-lg transition-all duration-200 ease-out cursor-pointer ${
                            buttonTextColor === "auto"
                              ? isDark 
                                ? "bg-white/10 border border-r-0 border-white/50" 
                                : "bg-gray-200 border border-r-0 border-gray-300"
                              : isDark
                                ? "bg-transparent border border-r-0 border-white/50"
                                : "bg-transparent border border-r-0 border-gray-300"
                          }`}
                          aria-pressed={buttonTextColor === "auto"}
                          aria-label="Auto contrast text color"
                        >
                          <span className={`text-lg font-bold ${
                            buttonTextColor === "auto" 
                              ? isDark ? 'text-white' : 'text-gray-900'
                              : isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            Auto
                          </span>
                        </button>
                        <button
                          onClick={() => setButtonTextColor("dark")}
                          className={`flex-1 h-12 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer ${
                            buttonTextColor === "dark"
                              ? isDark 
                                ? "bg-white/10 border border-r-0 border-white/50" 
                                : "bg-gray-200 border border-r-0 border-gray-300"
                              : isDark
                                ? "bg-transparent border border-r-0 border-white/50"
                                : "bg-transparent border border-r-0 border-gray-300"
                          }`}
                          aria-pressed={buttonTextColor === "dark"}
                          aria-label="Black Text"
                        >
                          <span className={`text-lg font-bold ${
                            buttonTextColor === "dark" 
                              ? isDark ? 'text-white' : 'text-gray-900'
                              : isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            Black
                          </span>
                        </button>
                        <button
                          onClick={() => setButtonTextColor("light")}
                          className={`flex-1 h-12 flex items-center justify-center rounded-r-lg transition-all duration-200 ease-out cursor-pointer ${
                            buttonTextColor === "light"
                              ? isDark
                                ? "bg-white/10 border border-white/50"
                                : "bg-gray-200 border border-gray-300"
                              : isDark
                                ? "bg-transparent border border-white/50"
                                : "bg-transparent border border-gray-300"
                          }`}
                          aria-pressed={buttonTextColor === "light"}
                          aria-label="White Text"
                        >
                          <span className={`text-lg font-bold ${
                            buttonTextColor === "light"
                              ? isDark ? 'text-white' : 'text-gray-900'
                              : isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            White
                          </span>
                        </button>
                      </div>
                    </Tooltip>
                    
                    {/* Contrast info display when Auto is selected */}
                    {buttonTextColor === "auto" && (
                      <div className={`text-xs px-3 py-2.5 rounded-lg mt-1 ${
                        isDark ? 'bg-white/5 text-[#bbb]' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span>Current text:</span>
                          <span className="font-semibold">
                            {getAccessibleTextColor(primaryHex) === "dark" ? "Black" : "White"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <span>Contrast ratio:</span>
                          <span className={`font-mono font-semibold ${
                            getContrastRatio(
                              primaryHex, 
                              getAccessibleTextColor(primaryHex) === "dark" ? "#111827" : "#FFFFFF"
                            ) >= 4.5 
                              ? 'text-green-500' 
                              : 'text-amber-500'
                          }`}>
                            {getContrastRatio(
                              primaryHex, 
                              getAccessibleTextColor(primaryHex) === "dark" ? "#111827" : "#FFFFFF"
                            ).toFixed(2)}:1
                          </span>
                        </div>
                      </div>
                    )}
                  </CollapsibleSection>

                  {/* Border Radius Section - Collapsible */}
                  <CollapsibleSection
                    title="Border Radius"
                    icon={<BorderRadiusIcon isDark={isDark} />}
                    isExpanded={expanded.borderRadius}
                    onToggle={() => toggleSection("borderRadius")}
                    isDark={isDark}
                  >
                    <Tooltip content="Adjust border radius (0-32px)" side="top">
                      <div className="relative group py-1">
                        <div 
                          className={`h-[7px] rounded-full w-full transition-all duration-200 ease-out group-hover:shadow-sm ${
                            isDark ? 'bg-[rgba(217,217,217,0.1)] border border-white/50 group-hover:border-white/70' : 'bg-gray-200 border border-gray-300 group-hover:border-gray-400'
                          }`}
                        />
                        <input
                          type="range"
                          min="0"
                          max="32"
                          step="1"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Border radius slider"
                          aria-valuemin={0}
                          aria-valuemax={32}
                          aria-valuenow={Number(borderRadius)}
                        />
                        {/* Slider thumb indicator */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border pointer-events-none transition-all duration-200 ease-out"
                          style={{ 
                            left: `calc(${(borderRadius / 32) * 100}% - 8px)`,
                            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                            borderColor: theme.neutralDarker[theme.neutralDarker.length - 1]
                          }}
                        />
                      </div>
                    </Tooltip>
                  </CollapsibleSection>

                  {/* 3D Effects Toggle Section - Collapsible */}
                  <CollapsibleSection
                    title="3D Effects"
                    icon={<ThreeDIcon isDark={isDark} />}
                    isExpanded={expanded.threeD}
                    onToggle={() => toggleSection("threeD")}
                    isDark={isDark}
                  >
                    <Tooltip content="Enable/disable 3D shadow effects" side="top">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          isDark ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {enable3D ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch
                          checked={enable3D}
                          onCheckedChange={setEnable3D}
                          aria-label="Toggle 3D effects"
                        />
                      </div>
                    </Tooltip>
                  </CollapsibleSection>

                  {/* Contrast Checker Section - Collapsible */}
                  <CollapsibleSection
                    title="Contrast Checker"
                    icon={<Box size={16} className={isDark ? "text-white" : "text-gray-900"} />}
                    isExpanded={expanded.contrast}
                    onToggle={() => toggleSection("contrast")}
                    isDark={isDark}
                  >
                    <div data-tutorial="contrast">
                      <ContrastChecker />
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Export Section - Always visible when not minimized */}
        {!isMinimized && (
          <div className="flex flex-col gap-4 px-4 py-6">
            {/* Export Button */}
            <div data-tutorial="export">
              <Tooltip content="Export theme as CSS, Tailwind, JSON, or SCSS" side="top">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className={`w-full py-3.5 px-4 font-semibold flex items-center justify-center gap-2.5 transition-colors duration-200 ease-out ${
                    isDark 
                      ? "bg-white text-gray-900 hover:bg-gray-100" 
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  style={{ borderRadius: `${borderRadius}px` }}
                >
                  <Download className="w-5 h-5" />
                  Export Theme
                </button>
              </Tooltip>
              <p className={`text-xs text-center mt-2.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                Download CSS, SCSS, Tailwind & JSON tokens
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
      
      {/* Scroll indicator - shows when user hasn't scrolled yet and sidebar is not minimized */}
      {!hasScrolled && !isMinimized && (
        <div 
          className="fixed left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-20 px-4 py-2 rounded-lg backdrop-blur-sm"
          style={{ 
            bottom: '16px',
            animation: 'fadeIn 0.5s ease-out',
            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
          }}
        >
          <span className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
            More
          </span>
          <div 
            className={`${isDark ? 'text-white/80' : 'text-gray-600'}`}
            style={{
              animation: 'bounceArrow 1.5s ease-in-out infinite',
            }}
          >
            <ChevronDown size={20} />
          </div>
          <style jsx>{`
            @keyframes bounceArrow {
              0%, 100% { transform: translateY(0); opacity: 1; }
              50% { transform: translateY(6px); opacity: 0.6; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
    </>
  )
}

function ColorInfoCard({
  label,
  hex,
  hsl,
  color,
}: {
  label: string
  hex: string
  hsl: string
  color: string
}) {
  const { addToast } = useToast()
  const { mode } = useTheme()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        title: "Copied!",
        description: `${label} ${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
      addToast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "error",
        duration: 3000,
      })
    }
  }

  const isDark = mode === "dark"
  
  return (
    <div className="flex gap-4 items-start rounded-lg">
      {/* Color Swatch */}
      <div
        className="rounded-lg shrink-0 w-[76px] self-stretch"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      
      {/* Color Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <p className={`text-[11px] uppercase tracking-wide leading-5 ${
          isDark ? 'text-[#c5c1bd]' : 'text-gray-600'
        }`}>
          {label}
        </p>
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] leading-5">
            <span className={isDark ? "text-[#c5c1bd]" : "text-gray-600"}>HEX</span>
            <Tooltip content={`Copy ${label} hex value to clipboard`} side="left">
              <button
                onClick={() => copyToClipboard(hex)}
                className={`hover:opacity-80 transition-colors font-mono cursor-pointer ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
                aria-label={`Copy ${label} hex value: ${hex}`}
              >
                {hex}
              </button>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between text-[11px] leading-5">
            <span className={isDark ? "text-[#c5c1bd]" : "text-gray-600"}>HSL</span>
            <Tooltip content={`Copy ${label} HSL value to clipboard`} side="left">
              <button
                onClick={() => copyToClipboard(hsl)}
                className={`hover:opacity-80 transition-colors font-mono cursor-pointer ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
                aria-label={`Copy ${label} HSL value: ${hsl}`}
              >
                {hsl}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  isDark,
  children,
}: {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  isDark: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <Tooltip content={`Click to ${isExpanded ? "collapse" : "expand"} ${title}`} side="top">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-between w-full px-2 py-2.5 rounded-lg transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-1",
            isDark
              ? "hover:bg-white/5 focus:ring-white/30"
              : "hover:bg-gray-100 focus:ring-gray-400"
          )}
          aria-expanded={isExpanded}
        >
          <div className="flex gap-2.5 items-center">
            {icon}
            <span className={`text-lg font-bold leading-[26px] tracking-[-0.04px] ${
              isDark ? 'text-[#bbb]' : 'text-gray-600'
            }`}>
              {title}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform duration-300 ease-out flex-shrink-0",
              isDark ? "text-[#bbb]" : "text-gray-600",
              isExpanded ? "" : "-rotate-90"
            )}
            aria-hidden="true"
          />
        </button>
      </Tooltip>
      {isExpanded && (
        <div className="pt-1">
          {children}
        </div>
      )}
    </div>
  )
}

function PaletteSection({
  title,
  colors,
  isExpanded,
  onToggle,
  darkestNeutral,
}: {
  title: string
  colors: string[]
  isExpanded: boolean
  onToggle: () => void
  darkestNeutral: string
}) {
  const { addToast } = useToast()
  const { mode } = useTheme()
  const isDark = mode === "dark"

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        title: "Copied!",
        description: `Color ${text} copied to clipboard`,
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
      addToast({
        title: "Copy failed",
        description: "Unable to copy color to clipboard",
        variant: "error",
        duration: 3000,
      })
    }
  }

  return (
    <div className="flex flex-col">
      <Tooltip content={`Click to expand/collapse ${title}`} side="right">
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={`palette-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-1 ${
            isDark 
              ? "hover:bg-white/5 focus:ring-white/30" 
              : "hover:bg-gray-100 focus:ring-gray-400"
          }`}
        >
        <span className={`text-base font-semibold leading-5 tracking-[-0.02px] ${
          isDark ? "text-white/90" : "text-gray-800"
        }`}>
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ease-out flex-shrink-0 ${
            isDark ? "text-white/60" : "text-gray-500"
          } ${isExpanded ? "" : "-rotate-90"}`}
          aria-hidden="true"
        />
      </button>
      </Tooltip>
      {isExpanded && (
        <div
          id={`palette-section-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="grid grid-cols-3 gap-2.5 mt-3"
          role="region"
          aria-label={`${title} color swatches`}
        >
          {colors.map((color, index) => (
            <Tooltip key={index} content="Copy color value to clipboard" side="top">
              <button
                onClick={() => copyToClipboard(color)}
                aria-label={`Copy color ${color} to clipboard`}
                className={`backdrop-blur-sm border rounded-lg p-2 flex flex-col gap-1.5 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isDark 
                    ? "bg-neutral-800/50 border-neutral-700/40 hover:border-neutral-600/60 focus:ring-white/40" 
                    : "bg-white border-gray-200 hover:border-gray-300 focus:ring-gray-400"
                }`}
              >
                <div
                  className="w-full h-12 rounded-md shadow-inner"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-0.5 text-[10px] overflow-hidden">
                  <span className={`font-mono font-semibold truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {color}
                  </span>
                  <span className={isDark ? "text-slate-400" : "text-gray-500"} style={{ fontSize: "9px" }}>
                    +{PERCENTAGES[index]}%
                  </span>
                </div>
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  )
}
