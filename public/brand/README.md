# /n — Brand Mark

The personal mark for nickhuo.com. A filled italic slash + heavy lowercase
n on a 48×48 grid.

## Files

```
brand/
├── slash-n.svg            # currentColor — drop in anywhere, inherits text color
├── slash-n-light.svg      # black fill (#111110) on transparent — for light UI
├── slash-n-dark.svg       # white fill (#ffffff) on transparent — for dark UI
├── slash-n-tile-light.svg # black mark on white rounded tile — for avatars / OG
├── slash-n-tile-dark.svg  # white mark on black rounded tile — for avatars / OG
├── favicon.svg            # single-file favicon (media-query aware)
├── favicon-32.png         # legacy favicon
├── favicon-16.png         # legacy favicon
├── apple-touch-icon.png   # 180×180, white on black tile
├── og-mark.png            # 1200×630 OG image
└── LogoMark.tsx           # drop-in React component
```

## Install on the Next.js site

1. Copy `brand/` into `portfolio/public/brand/`.
2. Copy `LogoMark.tsx` to `portfolio/components/ui/logo-mark.tsx`.
3. In `app/layout.tsx`, replace the placeholder icon:

```ts
icons: {
  icon: [
    { url: '/brand/favicon.svg', type: 'image/svg+xml' },
    { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
    { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
  ],
  apple: '/brand/apple-touch-icon.png',
},
```

4. In `app/header.tsx`, add the mark to the header:

```tsx
import { LogoMark } from '@/components/ui/logo-mark'

<Link href="/" className="flex items-center gap-2">
  <LogoMark size={22} />
  <span className="font-medium tracking-tight">Jiajun (Nick) Huo</span>
</Link>
```

## Colors

| Surface | Value |
|---|---|
| Ink (light mode) | `#111110` |
| Ink (dark mode) | `#ffffff` |

The SVGs that use `currentColor` will pick up your existing `dark:` text
classes automatically. No theme provider work needed.

## Clearspace

One `x` unit = cap-height ÷ 12. Keep at least 1x of empty space around the
mark on all sides. In tight spots (header) 0.5x is the minimum.

## Do

- Use `slash-n.svg` wherever the mark sits inside text-colored containers.
- Use the tile variants for OG/share images and app icons.
- Animate hover in the header: tilt the slash `-3°` over 500ms, spring curve.

## Don't

- Don't re-color the `n` and slash separately.
- Don't outline, add gradients, or put the mark in a shape other than the
  provided rounded tile.
- Don't use below 14px — drop to text-only at that size.
