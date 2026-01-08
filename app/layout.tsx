import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ColorProvider } from "@/components/color-picker/color-context"
import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme-context"
import { DesignSystemProvider } from "@/components/design-system-context"

export const metadata: Metadata = {
  title: "Control Center - Color Dashboard",
  description: "Dynamic color customization control center",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

// Inline script to initialize theme before React hydrates - prevents flash of incorrect theme
const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
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
