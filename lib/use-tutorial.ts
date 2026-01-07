"use client"

import { useState, useEffect } from "react"

const TUTORIAL_STORAGE_KEY = "dresscode-tutorial-completed"

export function useTutorial() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if tutorial was previously completed
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true"
      setIsCompleted(completed)
    }
  }, [])

  const startTutorial = () => {
    setIsActive(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const skipTutorial = () => {
    setIsActive(false)
    setCurrentStep(0)
    if (typeof window !== "undefined") {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "true")
    }
    setIsCompleted(true)
  }

  const completeTutorial = () => {
    setIsActive(false)
    setCurrentStep(0)
    if (typeof window !== "undefined") {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "true")
    }
    setIsCompleted(true)
  }

  const resetTutorial = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TUTORIAL_STORAGE_KEY)
    }
    setIsCompleted(false)
    setIsActive(false)
    setCurrentStep(0)
  }

  return {
    isCompleted,
    isActive,
    currentStep,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
  }
}

