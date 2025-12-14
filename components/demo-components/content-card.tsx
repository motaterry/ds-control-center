"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-context"

export function ContentCard() {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div
        className="h-32 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-complementary)]/20 relative"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      >
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded text-xs font-semibold bg-green-500 ${
            isDark ? "text-white" : "text-white"
          }`}>
            Ativo
          </span>
        </div>
      </div>
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        <div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Título Principal do Item
          </h3>
          <p className={`text-sm ${
            isDark ? "text-white/70" : "text-gray-600"
          }`}>
            Esta é uma descrição de exemplo que demonstra como o texto aparece
            com as cores personalizadas do sistema de design.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="switch1" className={isDark ? "text-white" : "text-gray-900"}>
              Toggle Ativo
            </Label>
            <Switch id="switch1" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="switch2" className={isDark ? "text-white" : "text-gray-900"}>
              Toggle Inativo
            </Label>
            <Switch id="switch2" />
          </div>
        </div>

        <div>
          <Input placeholder="Input Placeholder" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Secondary Button
          </Button>
          <Button className="flex-1">Primary Button</Button>
        </div>
      </CardContent>
    </Card>
  )
}
