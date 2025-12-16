"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { mode } = useTheme()
    const isDark = mode === "dark"
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border px-3 py-2 text-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:focus-visible:scale-100",
          isDark
            ? "border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-white placeholder:text-white/50"
            : "border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-gray-900 placeholder:text-gray-500",
          className
        )}
        style={{
          borderRadius: "var(--border-radius)",
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
