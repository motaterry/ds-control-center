/**
 * Color preset definitions for quick access to common color palettes
 */

export interface ColorPreset {
  id: string
  name: string
  category: string
  primary: string // Hex color
  description?: string
}

export const COLOR_PRESETS: ColorPreset[] = [
  // Brand Colors
  {
    id: "brand-blue",
    name: "Brand Blue",
    category: "Brand Colors",
    primary: "#3B82F6",
    description: "Modern blue for tech brands",
  },
  {
    id: "brand-purple",
    name: "Brand Purple",
    category: "Brand Colors",
    primary: "#8B5CF6",
    description: "Creative purple for design brands",
  },
  {
    id: "brand-green",
    name: "Brand Green",
    category: "Brand Colors",
    primary: "#10B981",
    description: "Fresh green for eco brands",
  },
  {
    id: "brand-red",
    name: "Brand Red",
    category: "Brand Colors",
    primary: "#EF4444",
    description: "Bold red for action brands",
  },
  {
    id: "brand-orange",
    name: "Brand Orange",
    category: "Brand Colors",
    primary: "#F59E0B",
    description: "Energetic orange for vibrant brands",
  },
  {
    id: "brand-pink",
    name: "Brand Pink",
    category: "Brand Colors",
    primary: "#EC4899",
    description: "Playful pink for lifestyle brands",
  },

  // Material Design
  {
    id: "material-blue",
    name: "Material Blue",
    category: "Material Design",
    primary: "#2196F3",
    description: "Google Material Design blue",
  },
  {
    id: "material-indigo",
    name: "Material Indigo",
    category: "Material Design",
    primary: "#3F51B5",
    description: "Google Material Design indigo",
  },
  {
    id: "material-teal",
    name: "Material Teal",
    category: "Material Design",
    primary: "#009688",
    description: "Google Material Design teal",
  },
  {
    id: "material-amber",
    name: "Material Amber",
    category: "Material Design",
    primary: "#FFC107",
    description: "Google Material Design amber",
  },
  {
    id: "material-deep-orange",
    name: "Material Deep Orange",
    category: "Material Design",
    primary: "#FF5722",
    description: "Google Material Design deep orange",
  },

  // Popular Schemes
  {
    id: "monochrome-blue",
    name: "Monochrome Blue",
    category: "Popular Schemes",
    primary: "#4A90E2",
    description: "Monochromatic blue palette",
  },
  {
    id: "complementary-orange",
    name: "Complementary Orange",
    category: "Popular Schemes",
    primary: "#FF6B35",
    description: "Orange-blue complementary scheme",
  },
  {
    id: "triadic-green",
    name: "Triadic Green",
    category: "Popular Schemes",
    primary: "#4ECDC4",
    description: "Green-purple-orange triadic scheme",
  },
  {
    id: "analogous-purple",
    name: "Analogous Purple",
    category: "Popular Schemes",
    primary: "#9B59B6",
    description: "Purple-blue-pink analogous scheme",
  },
]

export function getPresetsByCategory(): Record<string, ColorPreset[]> {
  return COLOR_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = []
    }
    acc[preset.category].push(preset)
    return acc
  }, {} as Record<string, ColorPreset[]>)
}

export function getPresetById(id: string): ColorPreset | undefined {
  return COLOR_PRESETS.find((preset) => preset.id === id)
}

