"use client"

import { Button } from "@/components/ui/button"
import { useColorTheme } from "./color-context"
import { useToast } from "@/components/ui/toast"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

export function ResetButton() {
  const { resetColors } = useColorTheme()
  const { addToast } = useToast()
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = () => {
    setIsResetting(true)
    resetColors()
    addToast({
      title: "Colors reset",
      description: "Primary and complementary colors restored to defaults",
      variant: "success",
      duration: 2000,
    })
    setTimeout(() => setIsResetting(false), 300)
  }

  return (
    <Button
      onClick={handleReset}
      variant="outline"
      size="sm"
      className="w-full"
      aria-label="Reset colors to default"
      disabled={isResetting}
    >
      <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
      Reset Colors
    </Button>
  )
}

