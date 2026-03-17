# Themes

## Overview

The theme system defines a semantic color palette via the `ThemeColors` interface (78 properties in `types.ts`). Colors are applied as CSS custom properties (`--color-*`) by `applyThemeToDocument()` and consumed through:

- **SCSS** -- `$primary-color`, `$neutral-white`, etc. (see `variables.scss`)
- **TS/TSX** -- `COLORS.PRIMARY_COLOR`, `COLORS.NEUTRAL_WHITE`, etc. (see `types/Colors.ts`)
- **CSS** -- `var(--color-primary-color)`, `var(--color-neutral-white)`, etc.

## Theme Files

### `default.ts` (legacy, unused)

The original theme. Uses bright mint green (`#22CC9D`) as the primary color with pure neutral grays. This theme is **no longer registered** in `THEME_REGISTRY`. It remains in the codebase as a reference for the original color values.

Key characteristics:
- Primary: bright mint `#22CC9D`
- Neutrals: pure gray scale (`#F2F4F6`, `#5A5F66`, etc.)
- Warnings: bright yellow `#EAB308` / `#F59E0B`
- White is pure `#FFFFFF`

### `default-v2.ts` (active)

The current production theme, registered as `"default"` in `THEME_REGISTRY`. A refined version that shifts to a deeper, more sophisticated green with green-tinted neutrals for a more cohesive feel.

Key differences from v1:
- Primary: deeper jade `#1A9E7A` (was `#22CC9D`)
- Neutrals: green-tinted instead of pure gray (e.g. `#EEF1EF` instead of `#F2F4F6`)
- Warnings: warmer gold `#D4A843` (was `#EAB308`)
- White has a subtle green tint `#FAFCFB` (was `#FFFFFF`)
- Misc/border colors all shifted to green-tinted variants

### `types.ts`

Defines `ThemeColors` (the color contract every theme must fulfill), the `Theme` interface, and utility functions `cssVarName()` and `applyThemeToDocument()`.

### `index.ts`

Re-exports types and the active theme. Contains `THEME_REGISTRY` which maps theme IDs to theme objects. Currently registers `default-v2` under the key `"default"`.

## Adding a New Theme

1. Create `<name>.ts` implementing all `ThemeColors` properties
2. Register it in `index.ts` (`THEME_REGISTRY`)
3. If the theme needs component-specific overrides, create `../theme-overrides/<name>.scss` scoped under `[data-theme="<name>"]` and import it in `main.tsx`

## Hardcoded Color Reference

Most previously-hardcoded colors have been replaced with theme variables. The remaining items below are **intentionally hardcoded** because they cannot reference CSS custom properties or theme variables.

### Static HTML / JSON (parsed before any JS runs)

| File | Values | Theme Property | Purpose |
|------|--------|----------------|---------|
| `index.html` | `#FAFCFB` | `neutralWhite` | `<meta name="theme-color">` (browser chrome) |
| `public/manifest.json` | `#FAFCFB` | `neutralWhite` | PWA theme_color and background_color |

### PWA Overlay (`src/main.tsx`)

The PWA update overlay renders before `ThemeProvider` mounts, so CSS vars are unavailable. It now imports `defaultTheme` directly and interpolates raw hex values from the theme object at build time. No manual sync needed when theme colors change.

| Interpolation | Theme Property | Purpose |
|---------------|----------------|---------|
| `tc.primaryLightest` | `primaryLightest` (`#EAF4EF`) | Background gradient radials |
| `tc.neutralLightGray` | `neutralLightGray` (`#EEF1EF`) | Background gradient base |
| `tc.primaryColor` | `primaryColor` (`#1A9E7A`) | Logo SVG fill |
| `tc.neutralDarkGray` | `neutralDarkGray` (`#565C59`) | Spinner stroke + "App Updating..." text |

### Third-Party Branding (mandated by brand guidelines)

| File | Values | Purpose |
|------|--------|---------|
| `src/pages/authentication/SignIn.tsx` | `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` | Google logo brand colors (no theme equivalent) |
| `src/pages/authentication/SignUp.tsx` | `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` | Google logo brand colors (no theme equivalent) |

### Static Assets (SVG files)

| File | Values | Theme Property | Purpose |
|------|--------|----------------|---------|
| `public/assistant_icons/*.svg` | `fill="black"` | ~`neutralBlack` (`#0B0D0C`) | ~19 assistant icon SVGs (static files, no variable support) |

## Hardcoded Font Reference

Most font references use the semantic SCSS variables `$font-heading` and `$font-body`. The remaining items below are **intentionally hardcoded** because they cannot reference SCSS variables.

| File | Values | Semantic Role | Why hardcoded |
|------|--------|---------------|---------------|
| `index.html` lines 16-18 | Google Fonts `<link>` loading Outfit + Plus Jakarta Sans | heading + body | Static HTML, parsed before JS |
| `src/main.tsx` line 43 | `'Plus Jakarta Sans', -apple-system, ...` | body | PWA overlay renders before ThemeProvider, inline HTML string |
| `src/pages/landing/LandingPage.tsx` | `'"Outfit", sans-serif'` (2 occurrences) | heading | Inline React style, no SCSS access |
| `src/pages/landing/LandingPage.tsx` | `'"Plus Jakarta Sans", sans-serif'` (7 occurrences) | body | Inline React style, no SCSS access |
| `src/main.css` | `source-code-pro, Menlo, ...` | monospace/code | CSS fallback for `<code>` elements |

## Hardcoded Font Weight Reference

Most font-weight declarations use the SCSS variables defined in `variables.scss`. The remaining items below are **intentionally hardcoded** because they live in static HTML or inline JS strings where SCSS variables are unavailable.

### Variable Mapping

| Variable | Weight | Role |
|----------|--------|------|
| `$font-light` | 400 | Light / thin text |
| `$font-regular` | 500 | Default body text |
| `$font-medium` | 600 | Medium emphasis |
| `$font-semibold` | 700 | Strong emphasis, labels |
| `$font-bold` | 800 | Headings, bold text |

### Hardcoded Instances

| File | Hardcoded Value | Equivalent Variable | Why hardcoded |
|------|-----------------|---------------------|---------------|
| `src/main.tsx` line 44 | `500` | `$font-regular` | PWA overlay renders before ThemeProvider, inline HTML string |
| `public/offline.html` line 49 | `800` | `$font-bold` | Static HTML fallback page, no SCSS access |
