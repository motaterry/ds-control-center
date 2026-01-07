/**
 * Tutorial step definitions for the onboarding walkthrough
 */

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right"
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to DressCode Control Center",
    description: "This dashboard lets you customize your design system colors and see them update in real-time. Let's take a quick tour!",
    position: "bottom",
  },
  {
    id: "color-wheel",
    title: "Color Wheel",
    description: "Drag the color wheel to select your primary color. Use arrow keys for precise control. The complementary color is calculated automatically.",
    targetSelector: '[aria-label="Primary color picker"]',
    position: "bottom",
  },
  {
    id: "hex-input",
    title: "Hex Color Input",
    description: "Type or paste hex color codes directly. The system supports 3-digit (#RGB) and 6-digit (#RRGGBB) formats.",
    targetSelector: '[aria-label="Enter primary color hex code"]',
    position: "top",
  },
  {
    id: "presets",
    title: "Color Presets",
    description: "Quick access to popular color palettes. Click any preset to apply it instantly.",
    targetSelector: '[data-tutorial="presets"]',
    position: "top",
  },
  {
    id: "settings",
    title: "Design Settings",
    description: "Customize mode, button text colors, border radius, and 3D effects to match your design needs.",
    targetSelector: '[data-tutorial="settings"]',
    position: "left",
  },
  {
    id: "contrast",
    title: "Contrast Checker",
    description: "Automatically validates WCAG accessibility standards. Green = AAA, Yellow = AA, Red = needs improvement.",
    targetSelector: '[data-tutorial="contrast"]',
    position: "top",
  },
  {
    id: "export",
    title: "Export Theme",
    description: "Export your custom theme as CSS variables, Tailwind config, SCSS, or JSON tokens for use in your projects.",
    targetSelector: '[data-tutorial="export"]',
    position: "top",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start customizing your design system. Use Cmd/Ctrl+Z to undo changes. Happy designing!",
    position: "bottom",
  },
]

