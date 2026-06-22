---
name: Vivid Precision
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd9e3'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2fc'
  surface-container: '#efecf7'
  surface-container-high: '#eae7f1'
  surface-container-highest: '#e4e1eb'
  on-surface: '#1b1b22'
  on-surface-variant: '#4b4455'
  inverse-surface: '#303037'
  inverse-on-surface: '#f2effa'
  outline: '#7c7487'
  outline-variant: '#cdc2d8'
  surface-tint: '#7825ea'
  primary: '#7015e2'
  on-primary: '#ffffff'
  primary-container: '#8a3ffc'
  on-primary-container: '#faf1ff'
  inverse-primary: '#d4bbff'
  secondary: '#a93805'
  on-secondary: '#ffffff'
  secondary-container: '#fd7542'
  on-secondary-container: '#641c00'
  tertiary: '#005f7a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00799b'
  on-tertiary-container: '#e8f6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebdcff'
  primary-fixed-dim: '#d4bbff'
  on-primary-fixed: '#270058'
  on-primary-fixed-variant: '#5d00c2'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59c'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#822800'
  tertiary-fixed: '#bde9ff'
  tertiary-fixed-dim: '#67d3ff'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#004d64'
  background: '#fcf8ff'
  on-background: '#1b1b22'
  surface-variant: '#e4e1eb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
  data-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system focuses on a clean, high-density professional aesthetic, optimized for data-rich analytics environments. It balances a corporate foundation with a vibrant, energetic primary accent to drive focus and engagement.

The visual style is **Corporate / Modern** with subtle **Glassmorphism** accents. It utilizes a layered surface approach where "containers" are clearly defined through soft shadows and subtle borders, ensuring that complex data visualizations remain legible and organized. The emotional response is one of clarity, efficiency, and modern technological sophistication.

## Colors
The palette is anchored by a neutral foundation of off-whites and cool grays to provide maximum contrast for data.

- **Primary (Purple):** Used for active navigation states, primary buttons, and as the lead color in data gradients.
- **Secondary (Orange/Coral):** Used for warnings, negative trends, and secondary data series to provide a warm counterpoint to the cool palette.
- **Tertiary (Sky Blue/Teal):** Used for informational accents and distinguishing multi-line charts.
- **Surface & Background:** Surfaces use pure white (#FFFFFF) against a very subtle cool-gray background (#F4F7FE) to create depth without the need for heavy lines.

## Typography
This design system utilizes **Plus Jakarta Sans** for its modern, clean, and slightly friendly geometric structure. It provides excellent legibility at small sizes, which is critical for a high-density analytics dashboard.

- **Data Numbers:** Use a specific bold weight to ensure key metrics stand out immediately.
- **Hierarchical Contrast:** Use color (Gray 500 vs Gray 900) rather than just size to distinguish between labels and values.
- **Mobile Density:** On mobile devices, line heights are tightened slightly to maximize the "above the fold" data visibility.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a high-density 8px base unit. 

- **Desktop:** A 12-column grid with 24px gutters. The sidebar is fixed at 240px, while the main content area expands.
- **Mobile:** A 4-column grid with 16px margins. Components reflow into a single-column stack. Charts should maintain a minimum height of 200px to ensure touch-target accuracy on data points.
- **Density:** Elements are tightly grouped using 8px and 16px increments to allow more data visualization widgets to appear on screen simultaneously without feeling cluttered.

## Elevation & Depth
Depth is achieved through **Ambient Shadows** and **Tonal Layering** rather than borders.

- **Level 0 (Background):** Base surface (#F4F7FE).
- **Level 1 (Cards/Widgets):** Pure white (#FFFFFF) with a soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Popovers/Dropdowns):** Pure white with a more pronounced shadow: `0px 10px 30px rgba(0, 0, 0, 0.1)`.
- **Interactions:** Hover states on cards should subtly lift by increasing the shadow spread and reducing opacity.

## Shapes
The shape language is consistently **Rounded**. This softens the technical nature of the analytics and makes the interface feel more approachable.

- **Standard Containers:** Use 16px (`rounded-lg`) for all main dashboard widgets and cards.
- **Input Fields/Buttons:** Use 8px (`rounded-md`) to maintain a professional look while remaining consistent with the overall softness.
- **Tags/Chips:** Use fully rounded (pill-shaped) ends for category markers.

## Components
- **Buttons:** Primary buttons use a vibrant purple gradient (Primary to a slightly lighter tint). Text is white and centered.
- **Cards:** Dashboard widgets must include a consistent header (Title + optional Timeframe dropdown) and a footer for secondary links.
- **Input Fields:** Search bars and dropdowns use a light gray stroke (#E2E8F0) and 12px horizontal padding.
- **Navigation:** The vertical sidebar uses "active indicator" blocks in the primary purple with a subtle glow (soft outer shadow in purple).
- **Data Visualization:** Charts should use a 2px stroke width for lines. Area charts must utilize a soft gradient fill (15% opacity of the stroke color) to ground the data.
- **Status Indicators:** Use small circular dots for status (e.g., notification badges) in a high-contrast red (#FF3B30).