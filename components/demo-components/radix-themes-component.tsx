"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-context"
import { useDesignSystem } from "@/components/design-system-context"
import Image from "next/image"
import { Settings, User, Bell, Shield } from "lucide-react"

/**
 * Radix Themes Component
 * 
 * Implements Radix Themes Community design patterns from Figma frame 58764-4114.
 * This component follows Radix Themes design system principles:
 * - Clean, modern interface
 * - Proper spacing and typography
 * - Accessible form controls
 * - Consistent with Radix UI patterns
 */
export function RadixThemesComponent() {
  const { mode } = useTheme()
  const { buttonTextColor } = useDesignSystem()
  const isDark = mode === "dark"
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Header Section with Icon */}
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/20">
            <Settings className={`w-5 h-5 ${
              isDark ? "text-[var(--color-primary)]" : "text-[var(--color-primary-darker)]"
            }`} />
          </div>
          <div className="flex-1">
            <CardTitle className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              Settings
            </CardTitle>
            <p className={`text-sm mt-1 ${
              isDark ? "text-white/60" : "text-gray-600"
            }`}>
              Manage your preferences
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* Profile Section */}
        <div className="space-y-4">
          <div className={`flex items-center gap-2 pb-2 border-b ${
            isDark ? "border-white/10" : "border-gray-300"
          }`}>
            <User className={`w-4 h-4 ${
              isDark ? "text-white/60" : "text-gray-600"
            }`} />
            <h3 className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              Profile
            </h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name" className={`text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={`text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4">
          <div className={`flex items-center gap-2 pb-2 border-b ${
            isDark ? "border-white/10" : "border-gray-300"
          }`}>
            <Bell className={`w-4 h-4 ${
              isDark ? "text-white/60" : "text-gray-600"
            }`} />
            <h3 className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="notifications" className={`text-sm ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Notifications
                </Label>
                <p className={`text-xs mt-0.5 ${
                  isDark ? "text-white/50" : "text-gray-600"
                }`}>
                  Receive email notifications
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="darkMode" className={`text-sm ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Dark Mode
                </Label>
                <p className={`text-xs mt-0.5 ${
                  isDark ? "text-white/50" : "text-gray-600"
                }`}>
                  Use dark theme
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, darkMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="autoSave" className={`text-sm ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Auto Save
                </Label>
                <p className={`text-xs mt-0.5 ${
                  isDark ? "text-white/50" : "text-gray-600"
                }`}>
                  Automatically save changes
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoSave: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Optional: Image Section (uncomment when image is available) */}
        {false && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden">
            <Image
              src="/images/radix-theme-illustration.jpg"
              alt="Radix Theme illustration"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Actions */}
        <div className={`flex gap-3 pt-4 border-t ${
          isDark ? "border-white/10" : "border-gray-300"
        }`}>
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

