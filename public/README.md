# Favicon Bundle

Drop these eight files into `public/` of your project, then update `index.html`.

## Files

| File | Purpose |
|------|---------|
| `favicon.svg` | Master, modern browsers — preferred |
| `favicon.ico` | Multi-resolution legacy fallback (16/32/48) |
| `favicon-16.png` | Browser tab |
| `favicon-32.png` | Browser tab (retina) / Windows taskbar |
| `favicon-48.png` | Windows taskbar (high-DPI) |
| `apple-touch-icon.png` | iOS home screen (180×180) |
| `icon-512.png` | Android home screen / PWA |
| `site.webmanifest` | PWA metadata |

## index.html

Replace your `<head>` with:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Software engineering student portfolio with live AI assistant." />

  <!-- Favicons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#0b0a08" />

  <title>Moksh Shah — Portfolio</title>
</head>
```

## Notes

- The SVG imports Instrument Serif from Google Fonts inline. Modern browsers respect this when the SVG is used as a favicon; older ones will fall back to the `<link>`-listed PNG/ICO files.
- The PNGs were rendered with DejaVu Serif (a close stand-in for Instrument Serif). To get the exact Instrument Serif rendering in the bitmap files, regenerate them using Figma, Sketch, or [realfavicongenerator.net](https://realfavicongenerator.net) by uploading `favicon.svg`.
- Cache-bust after deploying: browsers cache favicons aggressively. After your first deploy, hard-refresh (Cmd+Shift+R) or visit `/favicon.ico?v=2` once to verify the update.
