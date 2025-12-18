# PWA Icons Guide

## Required Icons for HAIDA PWA

To enable full PWA functionality and install-to-desktop capability, create the following icon files in this directory (`Figma/public/`):

### Icon Sizes Needed

| Filename | Size | Purpose |
|----------|------|---------|
| `icon-16x16.png` | 16x16px | Browser favicon |
| `icon-32x32.png` | 32x32px | Browser favicon |
| `icon-72x72.png` | 72x72px | Android small icon |
| `icon-96x96.png` | 96x96px | Android medium icon, Shortcuts |
| `icon-128x128.png` | 128x128px | Android large icon |
| `icon-144x144.png` | 144x144px | Windows tile |
| `icon-152x152.png` | 152x152px | iOS app icon |
| `icon-180x180.png` | 180x180px | iOS app icon |
| `icon-192x192.png` | 192x192px | Android large icon, maskable |
| `icon-384x384.png` | 384x384px | Android XL icon |
| `icon-512x512.png` | 512x512px | Android XXL icon, splash, maskable |

### Screenshots (Optional but Recommended)

| Filename | Size | Purpose |
|----------|------|---------|
| `screenshot-desktop.png` | 1920x1080px | Desktop preview |
| `screenshot-mobile.png` | 750x1334px | Mobile preview |

## Design Guidelines

### Safe Zone for Maskable Icons
For `icon-192x192.png` and `icon-512x512.png`:
- Icon content should fit within 80% of canvas (safe zone)
- 10% padding on all sides
- Background should extend to edges

### Colors
- Use HAIDA brand colors
- Ensure contrast for visibility on different backgrounds
- Consider dark mode (icon-512x512.png visible on dark backgrounds)

### Format
- **Format**: PNG with transparency
- **Color depth**: 32-bit (RGBA)
- **Compression**: Optimized for web
- **Tools**: Use ImageMagick, Photoshop, Figma, or online converters

## Quick Creation with ImageMagick

If you have a source SVG or large PNG (`logo.png`):

```bash
# Install ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt install imagemagick

# Generate all sizes from source
magick logo.png -resize 16x16 icon-16x16.png
magick logo.png -resize 32x32 icon-32x32.png
magick logo.png -resize 72x72 icon-72x72.png
magick logo.png -resize 96x96 icon-96x96.png
magick logo.png -resize 128x128 icon-128x128.png
magick logo.png -resize 144x144 icon-144x144.png
magick logo.png -resize 152x152 icon-152x152.png
magick logo.png -resize 180x180 icon-180x180.png
magick logo.png -resize 192x192 icon-192x192.png
magick logo.png -resize 384x384 icon-384x384.png
magick logo.png -resize 512x512 icon-512x512.png
```

## Online Icon Generators

If you don't have ImageMagick:

1. **Favicon.io**: https://favicon.io/
   - Upload your logo
   - Generates all required sizes
   - Free and easy to use

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Most comprehensive
   - Generates all PWA icons
   - Provides HTML code

3. **PWA Builder**: https://www.pwabuilder.com/
   - Microsoft's PWA tool
   - Icon generator included
   - Tests PWA readiness

## Temporary Placeholder Icons

If you need placeholder icons immediately:

```bash
# Create solid color placeholders (black background, white "H")
# (Requires ImageMagick)
magick -size 512x512 xc:black \
  -gravity center \
  -font Arial -pointsize 300 \
  -fill white -annotate +0+0 "H" \
  logo-512.png

# Then resize to all sizes (use script above)
```

## Verification

After adding icons:

1. **Check manifest.json**:
   ```bash
   curl https://haida-frontend.vercel.app/manifest.json
   ```

2. **Lighthouse PWA Audit**:
   ```bash
   npx lighthouse https://haida-frontend.vercel.app --only-categories=pwa
   ```

3. **Chrome DevTools**:
   - Open https://haida-frontend.vercel.app
   - DevTools → Application → Manifest
   - Check for errors

4. **Test Install**:
   - Desktop Chrome: Address bar → Install icon
   - Mobile Chrome: Menu → Add to Home Screen
   - Edge: Address bar → App available icon

## Expected Result

Once icons are in place:
- ✅ Browsers show install prompt
- ✅ App can be installed to desktop/home screen
- ✅ App opens in standalone window (no browser UI)
- ✅ PWA score in Lighthouse increases to 90+

---

**Note**: Currently, placeholder icons need to be created. The manifest.json is ready and waiting for actual icon files.
