"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title?: string
  description: string
  variant?: "default" | "success" | "error"
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [mounted, setMounted] = React.useState(false)
  // Store timeout IDs to prevent memory leaks
  const timeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Ensure we only render on client to avoid hydration issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Cleanup all timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })
      timeoutRefs.current.clear()
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    // Clear the timeout if it exists
    const timeoutId = timeoutRefs.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutRefs.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      // Use crypto.randomUUID if available, fallback to timestamp + random
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(7)}`
      const newToast: Toast = {
        id,
        duration: 3000,
        variant: "default",
        ...toast,
      }
      setToasts((prev) => [...prev, newToast])

      if (newToast.duration && newToast.duration > 0) {
        const timeoutId = setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
        // Store the timeout ID so we can cancel it if needed
        timeoutRefs.current.set(id, timeoutId)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {mounted && <ToastContainer toasts={toasts} removeToast={removeToast} />}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variantStyles = {
    default: "bg-[var(--color-toast-default-bg)] border-[var(--color-toast-default-border)]",
    success: "bg-green-600/90 border-green-500/50",
    error: "bg-red-600/90 border-red-500/50",
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm text-white animate-in slide-in-from-right-full",
        variantStyles[toast.variant || "default"]
      )}
      role="alert"
    >
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">{toast.title}</div>
        )}
        <div className="text-sm opacity-90">{toast.description}</div>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

