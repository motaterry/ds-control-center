"use client"

import React, { useEffect, useState, useRef } from "react"
import { useTutorial } from "@/lib/use-tutorial"
import { TUTORIAL_STEPS, type TutorialStep } from "./tutorial-steps"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { cn } from "@/lib/utils"

export function Tutorial() {
  const { isActive, currentStep, nextStep, previousStep, skipTutorial, completeTutorial } = useTutorial()
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const step = TUTORIAL_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  // Calculate highlight position for target element
  useEffect(() => {
    if (!isActive || !step?.targetSelector) {
      setHighlightPosition(null)
      return
    }

    const element = document.querySelector(step.targetSelector)
    if (element) {
      const rect = element.getBoundingClientRect()
      setHighlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      setHighlightPosition(null)
    }
  }, [isActive, currentStep, step?.targetSelector])

  if (!isActive) return null

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial()
    } else {
      nextStep()
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      previousStep()
    }
  }

  return (
    <>
      {/* Overlay with cutout */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[10000] pointer-events-auto"
        style={{
          backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
        }}
      >
        {highlightPosition && (
          <div
            className="absolute border-4 border-[var(--color-primary)] rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
            style={{
              top: `${highlightPosition.top}px`,
              left: `${highlightPosition.left}px`,
              width: `${highlightPosition.width}px`,
              height: `${highlightPosition.height}px`,
              boxShadow: isDark
                ? "0 0 0 9999px rgba(0, 0, 0, 0.7)"
                : "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            }}
          />
        )}
      </div>

      {/* Tutorial Card */}
      <div
        className={cn(
          "fixed z-[10001] max-w-sm rounded-2xl shadow-2xl p-6",
          "pointer-events-auto",
          isDark ? "bg-neutral-900 border border-white/10" : "bg-white border border-gray-200"
        )}
        style={{
          top: highlightPosition
            ? `${highlightPosition.top + highlightPosition.height + 16}px`
            : "50%",
          left: highlightPosition
            ? `${highlightPosition.left}px`
            : "50%",
          transform: highlightPosition ? "none" : "translate(-50%, -50%)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className={cn(
              "text-xs font-semibold mb-1",
              isDark ? "text-white/60" : "text-gray-500"
            )}>
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </div>
            <h3 className={cn(
              "text-lg font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {step.title}
            </h3>
          </div>
          <button
            onClick={skipTutorial}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-500"
            )}
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className={cn(
          "text-sm mb-6 leading-relaxed",
          isDark ? "text-white/80" : "text-gray-700"
        )}>
          {step.description}
        </p>

        {/* Progress Bar */}
        <div className={cn(
          "h-1 rounded-full mb-6",
          isDark ? "bg-white/10" : "bg-gray-200"
        )}>
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={skipTutorial}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDark
                ? "text-white/60 hover:text-white hover:bg-white/10"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Skip
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  isDark
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
                isDark
                  ? "bg-white text-gray-900 hover:bg-gray-100"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

