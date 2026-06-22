---
name: Luminous Industrial Identity
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#424754'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#727786'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac5'
  primary: '#0056be'
  on-primary: '#ffffff'
  primary-container: '#106eea'
  on-primary-container: '#fbfaff'
  inverse-primary: '#aec6ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#785400'
  on-tertiary: '#ffffff'
  tertiary-container: '#976b00'
  on-tertiary-container: '#fff9f6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004396'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdea9'
  tertiary-fixed-dim: '#ffba27'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4100'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  energy-green: '#10B981'
  power-yellow: '#FAB40D'
  surface-gray: '#F8FAFC'
  border-subtle: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  section-padding: 80px
  section-padding-mobile: 48px
---

## Brand & Style

The design system establishes a visual language rooted in **Professional Modernism**. It bridges the gap between traditional electrical engineering and the future of renewable energy. The identity targets enterprise clients, industrial partners, and energy stakeholders who value technical precision, reliability, and modern efficiency.

The aesthetic follows a **Corporate / Modern** style, characterized by structural integrity and clarity. It utilizes high-quality photography of infrastructure, purposeful whitespace to reduce cognitive load, and a strict adherence to a technical grid. The interface should feel "engineered"—every element serves a functional purpose, evoking a sense of calm authority and institutional trust.

## Colors

The color palette is anchored by a deep **Professional Blue**, representing the heritage and stability of the electrical industry. This is contrasted by **Energy Green**, a vibrant secondary color that signals a commitment to renewable technology and sustainable power.

- **Primary:** Use for high-level brand moments, primary navigation, and core interaction points.
- **Secondary (Energy Green):** Use as a semantic indicator for "active" power states, renewable initiatives, and positive growth metrics.
- **Tertiary (Power Yellow):** Reserved for technical alerts, safety indicators, or specific high-contrast calls to action.
- **Neutrals:** A range of cool grays ensure the interface remains clean and industrial, avoiding the "muddy" feel of warmer neutrals.

## Typography

The typographic scale emphasizes technical clarity. **Hanken Grotesk** provides a sharp, contemporary edge for headlines, suggesting precision engineering. **Inter** handles the body copy, offering exceptional readability for long-form service descriptions and technical specifications. 

To reinforce the industrial theme, **JetBrains Mono** is introduced for labels and data points, providing a "blueprint" or "technical readout" feel. Use generous line height for body text to maintain the feeling of whitespace and professional airiness.

## Layout & Spacing

This design system utilizes a **12-column fixed-grid** for desktop to ensure content remains centered and legible on wide displays. A 4-column grid is used for mobile.

The spacing logic follows an 8px base unit. Visual rhythm is achieved through "Macro" and "Micro" spacing:
- **Macro:** Large 80px gaps between sections to allow the "industrial" scale of the brand to breathe.
- **Micro:** Tight, consistent 8px or 16px increments for internal component logic (e.g., icon-to-text spacing).

Alignment should always be strictly horizontal or vertical; avoid diagonal or staggered layouts to maintain a sense of structural integrity.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** supplemented by **Ambient Shadows**. Surfaces should feel substantial and grounded.

1.  **Base Layer:** The light-gray canvas (`#F8FAFC`).
2.  **Raised Layer (Cards):** White backgrounds with a very soft, diffused shadow (15% opacity Primary Color tint) to create depth without visual noise.
3.  **Active Layer:** Elements currently being interacted with (like hovered buttons) should use a slight increase in shadow spread and a subtle vertical "lift" (trans-y: -2px).

Avoid heavy borders; use subtle 1px outlines in `border-subtle` to define boundaries where tonal contrast is insufficient.

## Shapes

The shape language is **Soft (Level 1)**. Elements feature a 0.25rem (4px) corner radius. This choice balances industrial rigidity with modern software approachability. 

- **Containers & Cards:** Use the standard 4px radius.
- **Interactive Elements:** Buttons follow the 4px rule to appear "tooled" rather than organic.
- **Icons:** Icons should be contained within 4px rounded bounding boxes or use consistent stroke caps to match the geometry of the typeface.

## Components

### Buttons
- **Primary:** Solid Primary Blue with white text. High-contrast, sharp corners (4px).
- **Secondary (Renewable):** Energy Green background. Used specifically for "Go Green" or "Sustainability" calls to action.
- **Ghost:** Primary Blue border (1px) with transparent background, used for secondary navigation.

### Cards (Portfolio & Services)
Cards are the primary container for the portfolio. They feature a white background, a 1px border-subtle, and a 4px corner radius. Images within cards should have a "zoom-on-hover" effect to imply interactive depth. Use the `label-caps` typography for category markers at the top of the card.

### Input Fields
Strictly rectangular with 1px `border-subtle`. On focus, the border transitions to Primary Blue with a subtle 2px glow.

### Icons
Monolinear style with a 1.5px or 2px stroke weight. Use Primary Blue for the main icon body and Energy Green for specific "active" or "power" accents within the icon (e.g., a green spark on a blue generator).

### Status Indicators
Small circular badges with a solid color. Green for "Active System," Yellow for "Maintenance," and Blue for "Planned."