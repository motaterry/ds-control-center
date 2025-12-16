"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { hslToHex, getAccessibleTextColor } from "@/lib/color-utils"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import { useColorTheme } from "@/components/color-picker/color-context"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] hover:opacity-90",
        outline: "",
        ghost: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { mode } = useTheme()
    const { buttonTextColor } = useDesignSystem()
    const { theme } = useColorTheme()
    const isDark = mode === "dark"
    const Comp = asChild ? Slot : "button"
    
    // Get primary color hex for contrast calculation
    const primaryHex = hslToHex(theme.primary.h, theme.primary.s, theme.primary.l)
    
    // Calculate the effective text color (handles "auto" mode)
    const getEffectiveTextColor = (): "dark" | "light" => {
      if (buttonTextColor === "auto") {
        return getAccessibleTextColor(primaryHex)
      }
      return buttonTextColor
    }
    
    const effectiveTextColor = getEffectiveTextColor()
    
    // Determine text color for primary buttons based on button text color setting
    const getPrimaryTextColor = () => {
      return effectiveTextColor === "dark" ? "text-gray-900" : "text-white"
    }
    
    // For non-primary variants, use theme-aware colors
    const getNonPrimaryTextColor = () => {
      return isDark ? "text-white" : "text-gray-900"
    }
    
    const variantClasses = {
      default: `bg-[var(--color-primary)] ${getPrimaryTextColor()} hover:opacity-90`,
      outline: isDark
        ? `border-[var(--color-button-outline-border)] bg-neutral-800/50 hover:bg-neutral-800/70 ${getNonPrimaryTextColor()}`
        : `border-[var(--color-button-outline-border)] bg-neutral-100 hover:bg-neutral-200 ${getNonPrimaryTextColor()}`,
      ghost: isDark
        ? `bg-neutral-800/50 hover:bg-neutral-800/70 ${getNonPrimaryTextColor()}`
        : `bg-neutral-100 hover:bg-neutral-200 ${getNonPrimaryTextColor()}`,
    }
    
    // Apply text color via inline style for primary buttons to ensure it always takes precedence
    const textColorStyle = variant === "default" || variant === undefined 
      ? { color: effectiveTextColor === "dark" ? "#111827" : "#ffffff" } // gray-900 or white
      : undefined
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          variant === "outline" && variantClasses.outline,
          variant === "ghost" && variantClasses.ghost,
          variant === "default" && `bg-[var(--color-primary)] hover:opacity-90`,
          className
        )}
        style={{
          borderRadius: "var(--border-radius)",
          ...textColorStyle,
          ...props.style, // Merge with any existing styles
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
