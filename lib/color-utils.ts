/**
 * Color manipulation utilities
 * Ported from color-token-generator reference
 */

export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex)
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number
  let s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
      default:
        h = 0
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  }
  return rgbToHex(f(0), f(8), f(4))
}

/**
 * Mix two colors by a given weight percentage
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @param weight - Percentage of color2 to mix (0-100)
 */
export function mixColors(color1: string, color2: string, weight: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const p = weight / 100

  const r = Math.round(c1.r * (1 - p) + c2.r * p)
  const g = Math.round(c1.g * (1 - p) + c2.g * p)
  const b = Math.round(c1.b * (1 - p) + c2.b * p)

  return rgbToHex(r, g, b)
}

/**
 * Generate tints (lighter tones) by mixing with white
 */
export function generateTints(baseColor: string, percentages: number[]): string[] {
  return percentages.map((percent) => mixColors(baseColor, "#FFFFFF", percent))
}

/**
 * Generate shades (darker tones) by mixing with black
 */
export function generateShades(baseColor: string, percentages: number[]): string[] {
  return percentages.map((percent) => mixColors(baseColor, "#000000", percent))
}

/**
 * Generate neutral tones (desaturated colors)
 */
export function generateNeutrals(
  baseColor: string,
  percentages: number[],
  mixColor: string
): string[] {
  const hsl = hexToHsl(baseColor)
  const neutralBase = hslToHex(hsl.h, 5, hsl.l) // Same hue, 5% saturation
  return percentages.map((percent) => mixColors(neutralBase, mixColor, percent))
}

/**
 * Calculate complementary color (hue + 180°)
 */
export function getComplementaryColor(hue: number): number {
  return (hue + 180) % 360
}

/**
 * Format HSL values for display
 */
export function formatHsl(h: number, s: number, l: number): string {
  return `${Math.round(h)}°, ${Math.round(s)}%, ${Math.round(l)}%`
}

/**
 * WCAG Accessibility Contrast Utilities
 */

/**
 * Calculate relative luminance from RGB values per WCAG 2.1 formula
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate WCAG contrast ratio between two colors
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio (1 to 21)
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(color1))
  const lum2 = getRelativeLuminance(hexToRgb(color2))
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determine the accessible text color for a given background color
 * Uses WCAG AA standard (4.5:1 minimum contrast ratio for normal text)
 * @param backgroundColor - Background color (hex)
 * @param darkText - Color to use for dark text (default: #111827 - gray-900)
 * @param lightText - Color to use for light text (default: #FFFFFF - white)
 * @returns "dark" or "light" based on which provides better contrast
 */
export function getAccessibleTextColor(
  backgroundColor: string,
  darkText: string = "#111827",
  lightText: string = "#FFFFFF"
): "dark" | "light" {
  const darkContrast = getContrastRatio(backgroundColor, darkText)
  const lightContrast = getContrastRatio(backgroundColor, lightText)
  
  // Return whichever provides better contrast
  return darkContrast >= lightContrast ? "dark" : "light"
}

/**
 * Check if a color combination meets WCAG AA standards
 * @param foreground - Foreground/text color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt bold)
 * @returns true if the contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background)
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const threshold = isLargeText ? 3 : 4.5
  return ratio >= threshold
}
