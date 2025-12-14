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

## Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel's GitHub integration:

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "Add New Project"
3. Import the repository: `motaterry/ds-control-center`
4. Vercel will automatically detect Next.js and configure the project
5. Click "Deploy"

Your app will be live at `https://ds-control-center-git-verc-9fc9a2-terrymota0-gmailcoms-projects.vercel.app` (or your custom domain).

Alternatively, deploy using Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

## 🌐 Live Preview

**[View Live Demo →](https://ds-control-center-git-verc-9fc9a2-terrymota0-gmailcoms-projects.vercel.app)**

Interactive color wheel with real-time UI updates. Try dragging the color wheel to see all components update instantly!

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
