# Control Center Color Dashboard

A single-page control center dashboard that allows users to dynamically change primary and complementary colors via an interactive color wheel. The entire UI demo updates in real-time to showcase the design system's color customization capabilities.

## Features

- **Interactive Color Wheel**: Drag to select primary color, complementary color calculated automatically
- **Real-time Updates**: All UI components update instantly when colors change
- **Color Palette Expansion**: View tints, shades, and neutral tones
- **Comprehensive Demo**: User profile, notifications, forms, calendar, and charts
- **Dark Mode**: Beautiful dark theme optimized for color visualization

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Project Structure

```
control-center-UI-Page/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── color-picker/
│   │   ├── color-wheel.tsx
│   │   ├── color-context.tsx
│   │   └── palette-expansion.tsx
│   ├── demo-components/
│   │   ├── user-profile-card.tsx
│   │   ├── notifications-panel.tsx
│   │   ├── content-card.tsx
│   │   ├── calendar-widget.tsx
│   │   ├── bar-chart.tsx
│   │   ├── area-chart.tsx
│   │   └── doughnut-chart.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── switch.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   ├── color-utils.ts
│   └── utils.ts
└── package.json
```

## Technologies

- **Next.js 16** - React framework
- **Tailwind CSS v4** - Styling
- **Recharts** - Chart components
- **Radix UI** - Accessible component primitives
- **TypeScript** - Type safety

## Color System

Colors are managed through CSS variables that update dynamically:
- `--color-primary`: Primary brand color
- `--color-complementary`: Complementary color (hue + 180°)
- All components use these variables for automatic updates

## License

MIT
