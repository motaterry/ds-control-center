import type { Metadata } from "next"
import "./globals.css"
import { ColorProvider } from "@/components/color-picker/color-context"
import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme-context"
import { DesignSystemProvider } from "@/components/design-system-context"

export const metadata: Metadata = {
  title: "Control Center - Color Dashboard",
  description: "Dynamic color customization control center",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ColorProvider>
            <DesignSystemProvider>
              <ToastProvider>{children}</ToastProvider>
            </DesignSystemProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
