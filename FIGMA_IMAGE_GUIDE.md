# Figma Image Handling Guide

## Best Practice: Download and Store Locally ✅

**Recommended approach for Next.js projects:**

### 1. Download Images from Figma

**In Figma Dev Mode:**
1. Select the image/frame in Figma
2. Right-click → **Export** or use the Export panel
3. Choose format (PNG, JPG, SVG, or WebP)
4. Export at appropriate resolution (1x, 2x, 3x)

**Or via Figma MCP:**
- Use MCP tools to export images directly
- Images will be downloaded to your project

### 2. Store in `public/images/` Folder

```
control-center-UI-Page/
├── public/
│   └── images/
│       ├── radix-theme-hero.jpg
│       ├── radix-theme-icon.png
│       └── radix-theme-illustration.svg
```

### 3. Use Next.js Image Component

```tsx
import Image from "next/image"

export function RadixThemesComponent() {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden">
      <Image
        src="/images/radix-theme-hero.jpg"
        alt="Radix Theme illustration"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false} // Set to true for above-the-fold images
      />
    </div>
  )
}
```

### 4. Benefits of This Approach

✅ **Automatic Optimization**: Next.js optimizes images automatically  
✅ **Responsive Images**: Generates multiple sizes for different screens  
✅ **Lazy Loading**: Images load only when needed  
✅ **Format Conversion**: Converts to WebP when supported  
✅ **Production Ready**: Works in both dev and production  
✅ **Version Control**: Images are tracked in git  

---

## Alternative: Local Server (Development Only) ⚠️

**Only use for rapid prototyping:**

### Setup Local Image Server

```bash
# Install a simple HTTP server
npm install -g http-server

# Serve images folder
cd public/images
http-server -p 8080
```

### Use in Component

```tsx
// ⚠️ Development only - not recommended for production
const imageUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/image.jpg'
  : '/images/image.jpg'
```

**Why NOT recommended:**
- ❌ Doesn't work in production
- ❌ No Next.js optimization
- ❌ Requires separate server
- ❌ Slower development workflow
- ❌ Not version controlled

---

## Figma MCP Integration

If using Figma MCP, you can automate the download process:

### Option 1: Export via MCP API

```typescript
// Example: Using Figma MCP to export images
const exportImage = async (nodeId: string) => {
  // Use MCP tool to export image
  // Download to public/images/
  // Return local path
}
```

### Option 2: Manual Export Workflow

1. **In Figma Dev Mode:**
   - Select image node
   - Copy image URL or export path
   - Download manually

2. **In Code:**
   - Reference downloaded image
   - Use Next.js Image component

---

## Image Optimization Tips

### 1. Choose the Right Format

- **PNG**: For images with transparency
- **JPG**: For photos (smaller file size)
- **WebP**: Best compression (Next.js converts automatically)
- **SVG**: For icons and illustrations

### 2. Export at Multiple Resolutions

```
public/images/
├── hero.jpg          (1x - 800px)
├── hero@2x.jpg       (2x - 1600px)
└── hero@3x.jpg       (3x - 2400px)
```

Next.js Image component handles this automatically with `srcset`.

### 3. Use Appropriate Sizes

```tsx
<Image
  src="/images/hero.jpg"
  width={800}
  height={600}
  alt="Hero image"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
/>
```

---

## Example: Complete Image Implementation

```tsx
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function RadixThemesComponent() {
  return (
    <Card className="overflow-hidden">
      {/* Hero Image */}
      <div className="relative w-full h-64">
        <Image
          src="/images/radix-theme-hero.jpg"
          alt="Radix Theme design"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true} // Load immediately if above the fold
        />
      </div>

      <CardContent className="p-6">
        {/* Content */}
      </CardContent>
    </Card>
  )
}
```

---

## Quick Reference

| Method | Development | Production | Optimization | Recommended |
|--------|------------|------------|--------------|-------------|
| **Download & Store** | ✅ | ✅ | ✅ | ✅ **Yes** |
| **Local Server** | ✅ | ❌ | ❌ | ❌ No |
| **Figma CDN** | ✅ | ⚠️ | ❌ | ❌ No |
| **External URL** | ✅ | ✅ | ❌ | ❌ No |

---

## Summary

**✅ DO:**
- Download images from Figma
- Store in `public/images/`
- Use Next.js `Image` component
- Export at appropriate resolutions

**❌ DON'T:**
- Use local server URLs
- Reference Figma CDN URLs directly
- Use `<img>` tag instead of `Image`
- Skip image optimization

---

**Next Steps:**
1. Export images from Figma frame `58764-4114`
2. Save to `public/images/`
3. Update component to use `Image` component
4. Test in both development and production builds

