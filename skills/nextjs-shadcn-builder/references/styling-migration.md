# Styling Migration Guide

Comprehensive guide for migrating from various styling approaches to Tailwind CSS + shadcn/ui CSS variables.

## Overview

shadcn/ui requires:
- **Tailwind CSS** for utility classes
- **CSS Variables** for theming (defined in `globals.css`)
- **No hardcoded values** (colors, spacing, fonts)
- **OKLCH color format** for perceptual uniformity and better dark mode support

## Migration Paths

### 1. CSS-in-JS → Tailwind CSS

#### styled-components

**Before:**
```typescript
import styled from 'styled-components'

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    background-color: #2563eb;
  }
`
```

**After:**
```typescript
import { Button } from '@/components/ui/button'

// Use shadcn Button component
<Button>Click me</Button>

// Or if custom styling needed:
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90">
  Click me
</button>
```

**Key Changes:**
- `background-color: #3b82f6` → `bg-primary`
- `color: white` → `text-primary-foreground`
- `padding: 8px 16px` → `px-4 py-2`
- `border-radius: 6px` → `rounded-md`
- `:hover` → `hover:` prefix

#### Emotion

**Before:**
```typescript
import { css } from '@emotion/react'

const cardStyle = css`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

<div css={cardStyle}>Content</div>
```

**After:**
```typescript
import { Card, CardContent } from '@/components/ui/card'

<Card>
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

**Or with Tailwind:**
```typescript
<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
  Content
</div>
```

### 2. Traditional CSS/SCSS → Tailwind

#### CSS Modules

**Before:**
```css
/* styles.module.css */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}
```

```typescript
import styles from './styles.module.css'

<div className={styles.container}>
  <div className={styles.card}>
    <h2 className={styles.title}>Title</h2>
  </div>
</div>
```

**After:**
```typescript
<div className="max-w-7xl mx-auto px-4">
  <div className="bg-card border border-border rounded-lg p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">
      Title
    </h2>
  </div>
</div>
```

#### SCSS/SASS

**Before:**
```scss
$primary-color: #3b82f6;
$spacing-unit: 8px;

.button {
  background-color: $primary-color;
  padding: $spacing-unit * 2;

  &:hover {
    background-color: darken($primary-color, 10%);
  }

  &--large {
    padding: $spacing-unit * 3;
  }
}
```

**After (CSS Variables + Tailwind):**
```css
/* globals.css */
:root {
  --primary: 0.630 0.213 255.5;  /* OKLCH for #3b82f6 */
}
```

```typescript
<Button>Normal</Button>
<Button size="lg">Large</Button>
```

### 3. Inline Styles → Tailwind

**Before:**
```typescript
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  marginBottom: '16px'
}}>
  Content
</div>
```

**After:**
```typescript
<div className="flex justify-between items-center p-4 bg-secondary rounded-lg mb-4">
  Content
</div>
```

## Color Migration

### Converting Hex Colors to OKLCH CSS Variables

**This skill uses OKLCH** (OKLab Lightness Chroma Hue) color space for better perceptual uniformity and color accuracy.

**Why OKLCH over HSL?**
- Perceptually uniform (equal changes = equal perceived differences)
- Better gradient interpolation
- More predictable lightness across hues
- Better for accessibility (more accurate contrast ratios)
- Superior dark mode support

**Conversion Process:**

1. **Find all hex colors:**
   ```bash
   bash ./scripts/detect-hardcoded-values.sh /path/to/codebase
   ```

2. **Convert hex to OKLCH:**

   Use online tools:
   - **https://oklch.com** (recommended - visual picker)
   - **https://colorjs.io** (comprehensive color tools)
   - **culori** (npm package for programmatic conversion)

   ```
   #FF6B35 → oklch(0.646 0.222 41.116) → 0.646 0.222 41.116
   #3B82F6 → oklch(0.630 0.213 255.5) → 0.630 0.213 255.5
   ```

   Format: `oklch(L C H)` where:
   - **L** (Lightness): 0-1 (0 = black, 1 = white)
   - **C** (Chroma): 0-0.4+ (0 = grayscale, higher = saturated)
   - **H** (Hue): 0-360 degrees

3. **Add to CSS variables:**
   ```css
   /* globals.css */
   :root {
     --primary: 0.646 0.222 41.116;  /* Orange */
   }
   ```

4. **Use in Tailwind:**
   ```typescript
   <div className="bg-primary text-primary-foreground">
   ```

### Common Color Mappings (OKLCH)

| Old Hex | Color Name | OKLCH | CSS Variable |
|---------|------------|-------|--------------|
| `#ffffff` | White | `1 0 0` | `--background` (light) |
| `#000000` | Black | `0 0 0` | `--foreground` (dark) |
| `#f9fafb` | Gray 50 | `0.985 0.002 247.8` | `--secondary` |
| `#e5e7eb` | Gray 200 | `0.92 0.004 286.32` | `--border` |
| `#FF6B35` | Orange | `0.646 0.222 41.116` | `--primary` |
| `#3B82F6` | Blue 500 | `0.630 0.213 255.5` | `--primary` (blue theme) |
| `#EF4444` | Red 500 | `0.627 0.257 27.9` | `--destructive` |
| `#10B981` | Green 500 | `0.710 0.180 165.4` | Custom `--success` |

### Dark Mode Support

Define both light and dark values (OKLCH makes this easier):

```css
:root {
  /* Light mode - Medium orange */
  --primary: 0.646 0.222 41.116;
}

.dark {
  /* Dark mode - Brighter orange for contrast */
  --primary: 0.705 0.213 47.604;
}
```

**Pro Tip:** In dark mode, increase Lightness (L) for better contrast while keeping Chroma (C) and Hue (H) similar for color consistency.

## Spacing Migration

### Converting px/rem to Tailwind Scale

| Old CSS | Tailwind Class | Value |
|---------|---------------|-------|
| `margin: 4px` | `m-1` | 0.25rem |
| `margin: 8px` | `m-2` | 0.5rem |
| `margin: 12px` | `m-3` | 0.75rem |
| `margin: 16px` | `m-4` | 1rem |
| `margin: 20px` | `m-5` | 1.25rem |
| `margin: 24px` | `m-6` | 1.5rem |
| `margin: 32px` | `m-8` | 2rem |
| `margin: 40px` | `m-10` | 2.5rem |
| `margin: 48px` | `m-12` | 3rem |
| `margin: 64px` | `m-16` | 4rem |

**Directional Spacing:**
```css
/* Old */
padding-top: 16px;        /* → pt-4 */
padding-right: 8px;       /* → pr-2 */
padding-bottom: 16px;     /* → pb-4 */
padding-left: 8px;        /* → pl-2 */
padding: 16px 8px;        /* → py-4 px-2 */

margin-left: auto;        /* → ml-auto */
margin-right: auto;       /* → mr-auto */
margin: 0 auto;           /* → mx-auto */
```

## Typography Migration

### Font Families

**Before:**
```css
.heading {
  font-family: 'Inter', -apple-system, sans-serif;
}

.code {
  font-family: 'Fira Code', 'Courier New', monospace;
}
```

**After:**
```typescript
// Next.js font loading
import { Inter, Fira_Code } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const firaCode = Fira_Code({ subsets: ['latin'] })

// Apply in layout
<body className={inter.className}>

// Or use Tailwind defaults
<h1 className="font-sans">Heading</h1>      // System font stack
<code className="font-mono">Code</code>     // Monospace
```

### Font Sizes

| Old CSS | Tailwind Class | Size |
|---------|---------------|------|
| `font-size: 12px` | `text-xs` | 0.75rem |
| `font-size: 14px` | `text-sm` | 0.875rem |
| `font-size: 16px` | `text-base` | 1rem |
| `font-size: 18px` | `text-lg` | 1.125rem |
| `font-size: 20px` | `text-xl` | 1.25rem |
| `font-size: 24px` | `text-2xl` | 1.5rem |
| `font-size: 30px` | `text-3xl` | 1.875rem |
| `font-size: 36px` | `text-4xl` | 2.25rem |

### Font Weights

| Old CSS | Tailwind Class | Value |
|---------|---------------|-------|
| `font-weight: 300` | `font-light` | 300 |
| `font-weight: 400` | `font-normal` | 400 |
| `font-weight: 500` | `font-medium` | 500 |
| `font-weight: 600` | `font-semibold` | 600 |
| `font-weight: 700` | `font-bold` | 700 |

## Layout Migration

### Flexbox

**Before:**
```css
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
```

**After:**
```typescript
<div className="flex flex-col justify-between items-center gap-4">
```

### Grid

**Before:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

**After:**
```typescript
<div className="grid grid-cols-3 gap-6">
```

### Responsive Design

**Before:**
```css
.container {
  padding: 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 32px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 48px;
  }
}
```

**After:**
```typescript
<div className="p-4 md:p-8 lg:p-12">
```

## Common Patterns

### Box Shadow

**Before:**
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);                    /* sm */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);                    /* md */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);                  /* lg */
```

**After:**
```typescript
className="shadow-sm"
className="shadow"
className="shadow-lg"
```

### Border Radius

**Before:**
```css
border-radius: 4px;     /* sm */
border-radius: 6px;     /* md */
border-radius: 8px;     /* lg */
border-radius: 12px;    /* xl */
border-radius: 9999px;  /* full */
```

**After:**
```typescript
className="rounded-sm"
className="rounded-md"
className="rounded-lg"
className="rounded-xl"
className="rounded-full"
```

### Transitions

**Before:**
```css
transition: all 0.2s ease-in-out;
```

**After:**
```typescript
className="transition-all duration-200 ease-in-out"

// Or use shadcn defaults
className="transition-colors"  // Only color transitions
```

## Component-Specific Migrations

### Button States

**Before:**
```css
.button {
  background-color: #3b82f6;
  color: white;
}

.button:hover {
  background-color: #2563eb;
}

.button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}
```

**After:**
```typescript
import { Button } from '@/components/ui/button'

<Button>Normal</Button>
<Button disabled>Disabled</Button>

// Hover and disabled states handled automatically by shadcn
```

### Form Inputs

**Before:**
```css
.input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

**After:**
```typescript
import { Input } from '@/components/ui/input'

<Input placeholder="Enter text" />

// All focus states, borders, etc. handled by shadcn
```

## Migration Checklist

When migrating styles:

- [ ] **Remove all hardcoded colors**
  - [ ] Replace with CSS variables
  - [ ] Use semantic color names (`primary`, `secondary`, etc.)

- [ ] **Remove hardcoded spacing**
  - [ ] Use Tailwind spacing scale
  - [ ] Consistent padding/margin values

- [ ] **Convert to Tailwind utilities**
  - [ ] Replace CSS classes with Tailwind
  - [ ] Remove CSS modules/SCSS files
  - [ ] Delete styled-components/emotion

- [ ] **Set up CSS variables**
  - [ ] Define in `globals.css`
  - [ ] Use OKLCH format for colors (better than HSL)
  - [ ] Include dark mode variants

- [ ] **Remove inline styles**
  - [ ] Convert `style={{}}` to `className`
  - [ ] Use Tailwind utilities

- [ ] **Verify responsive design**
  - [ ] Test all breakpoints (sm, md, lg, xl, 2xl)
  - [ ] Mobile-first approach

- [ ] **Test dark mode**
  - [ ] All colors work in dark mode
  - [ ] Contrast ratios acceptable

- [ ] **Run final check**
  - [ ] `bash ./scripts/detect-hardcoded-values.sh`
  - [ ] Target: 0 violations

## Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **shadcn/ui Theming:** https://ui.shadcn.com/docs/theming
- **Color Converter:** https://tailwindcss.com/docs/customizing-colors
- **Tailwind Play:** https://play.tailwindcss.com
