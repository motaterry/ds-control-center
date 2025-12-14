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
