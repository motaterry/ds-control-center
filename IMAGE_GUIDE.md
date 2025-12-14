# Image Handling Guide

## ✅ Recommended: Local Files (Next.js Best Practice)

**Use local files stored in the `public` folder** - This is the recommended approach for Next.js.

### Setup

1. **Place images in `public/images/` folder:**
   ```
   public/
   └── images/
       ├── hero-image.jpg
       ├── logo.svg
       └── avatar.png
   ```

2. **Reference images in components:**
   ```tsx
   // Using regular img tag
   <img src="/images/hero-image.jpg" alt="Hero" />
   
   // Using Next.js Image component (recommended for optimization)
   import Image from "next/image"
   <Image 
     src="/images/hero-image.jpg" 
     alt="Hero" 
     width={800} 
     height={600}
   />
   ```

### Benefits
- ✅ Optimized by Next.js automatically
- ✅ Better performance with `next/image`
- ✅ Automatic image optimization
- ✅ Lazy loading built-in
- ✅ Responsive images support
- ✅ Works in production builds

---

## Alternative: Data URIs (For Small SVGs/Icons)

**Use inline data URIs** - Good for small SVGs, icons, or patterns.

### Example (Current Approach)
```tsx
<div
  style={{
    backgroundImage: "url('data:image/svg+xml,...')"
  }}
/>
```

### When to Use
- ✅ Small SVG patterns/textures
- ✅ Icons that don't need optimization
- ✅ Background patterns
- ❌ Don't use for large images
- ❌ Don't use for photos

---

## Next.js Image Component (Recommended)

For best performance, use Next.js `Image` component:

```tsx
import Image from "next/image"

export function ComponentWithImage() {
  return (
    <Image
      src="/images/example.jpg"
      alt="Description"
      width={400}
      height={300}
      className="rounded-lg"
      // Optional: priority for above-the-fold images
      priority
      // Optional: placeholder while loading
      placeholder="blur"
    />
  )
}
```

### Benefits
- Automatic image optimization
- Responsive images
- Lazy loading
- WebP/AVIF format support
- Prevents layout shift

---

## External URLs (Not Recommended)

**Avoid external URLs** unless absolutely necessary:

```tsx
// ❌ Not recommended - no optimization, CORS issues
<img src="https://example.com/image.jpg" />
```

### If You Must Use External URLs

Configure in `next.config.ts`:

```ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
}
```

---

## Summary

| Method | Use Case | Performance | Recommendation |
|--------|----------|-------------|----------------|
| **Local Files** (`/images/...`) | Photos, logos, assets | ⭐⭐⭐⭐⭐ | ✅ **Best** |
| **Next.js Image** | All images | ⭐⭐⭐⭐⭐ | ✅ **Best** |
| **Data URIs** | Small SVGs/icons | ⭐⭐⭐⭐ | ✅ Good for small assets |
| **External URLs** | Third-party content | ⭐⭐ | ❌ Avoid |

---

## Quick Reference

```tsx
// ✅ BEST: Next.js Image with local file
import Image from "next/image"
<Image src="/images/photo.jpg" alt="Photo" width={800} height={600} />

// ✅ GOOD: Regular img with local file
<img src="/images/logo.svg" alt="Logo" />

// ✅ OK: Data URI for small SVG pattern
<div style={{ backgroundImage: "url('data:image/svg+xml,...')" }} />

// ❌ AVOID: External URL without optimization
<img src="https://example.com/image.jpg" />
```

