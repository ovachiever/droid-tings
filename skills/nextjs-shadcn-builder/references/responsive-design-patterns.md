# Responsive Design Patterns Guide

Complete guide to building responsive, mobile-first applications with Next.js, Tailwind CSS, and shadcn/ui.

## Table of Contents

1. [Mobile-First Philosophy](#mobile-first-philosophy)
2. [Tailwind Breakpoints](#tailwind-breakpoints)
3. [Responsive Layout Patterns](#responsive-layout-patterns)
4. [Responsive Typography](#responsive-typography)
5. [Responsive Spacing](#responsive-spacing)
6. [Responsive Grid Systems](#responsive-grid-systems)
7. [Responsive Components](#responsive-components)
8. [Container Queries (Future)](#container-queries)
9. [Touch-Friendly Design](#touch-friendly-design)
10. [Performance Optimization](#performance-optimization)

---

## Mobile-First Philosophy

### Core Principles

**Always design and code for mobile first, then progressively enhance for larger screens.**

```tsx
// ✅ CORRECT: Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  // Padding: 16px mobile → 24px tablet → 32px desktop
</div>

// ❌ WRONG: Desktop-first approach
<div className="p-8 lg:p-6 md:p-4">
  // This works backwards and is confusing
</div>
```

### Why Mobile-First?

1. **Better Performance**: Mobile devices load the minimal CSS first
2. **Simpler Code**: Base styles are simpler, complexity added progressively
3. **Accessibility**: Mobile-first ensures content is accessible on all devices
4. **Progressive Enhancement**: Features are added, not removed
5. **User-Centric**: Mobile users are often the majority

### Mobile-First Checklist

- [ ] Design mockups start with mobile (320px - 375px wide)
- [ ] Base CSS has no media queries (mobile default)
- [ ] Add `sm:`, `md:`, `lg:` prefixes to enhance larger screens
- [ ] Test on real devices, not just browser DevTools
- [ ] Consider touch interactions first, mouse second
- [ ] Optimize images for mobile bandwidth
- [ ] Lazy load below-the-fold content

---

## Tailwind Breakpoints

### Default Breakpoints

```css
/* Tailwind's default responsive breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices (large desktops) */
2xl: 1536px /* 2X large devices (larger desktops) */
```

### Custom Breakpoints (if needed)

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px', // Custom 2xl breakpoint
      '3xl': '1600px', // Additional custom breakpoint
    },
  },
}
```

### Usage Examples

```tsx
// Responsive display
<div className="hidden md:block lg:flex">
  // Hidden on mobile, block on tablet, flex on desktop
</div>

// Responsive sizing
<div className="w-full md:w-1/2 lg:w-1/3">
  // Full width mobile → half width tablet → third width desktop
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  // 24px mobile → 30px tablet → 36px desktop
</h1>

// Multiple properties
<Card className="p-4 md:p-6 lg:p-8 shadow-sm md:shadow-md lg:shadow-lg">
  // Progressive enhancement of padding and shadow
</Card>
```

---

## Responsive Layout Patterns

### 1. Stack to Sidebar

**Pattern**: Single column on mobile → sidebar layout on desktop

```tsx
<div className="flex flex-col lg:flex-row gap-6">
  {/* Sidebar - Full width on mobile, fixed width on desktop */}
  <aside className="w-full lg:w-64 lg:flex-shrink-0">
    <nav>Sidebar content</nav>
  </aside>

  {/* Main content - Grows to fill space */}
  <main className="flex-1 min-w-0">
    <div>Main content</div>
  </main>
</div>
```

**Use cases**: Admin dashboards, documentation sites, settings pages

### 2. Stack to Grid

**Pattern**: Vertical stack on mobile → grid layout on larger screens

```tsx
// 2-column grid example
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</div>

// 3-column grid example
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  // 1 col mobile → 2 cols tablet → 3 cols desktop
</div>

// 4-column grid example (like stats cards)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  // 1 col mobile → 2 cols tablet → 4 cols desktop
</div>
```

**Use cases**: Card grids, product listings, image galleries, dashboard stats

### 3. Hamburger to Horizontal Nav

**Pattern**: Mobile menu icon → full horizontal navigation

```tsx
<header className="border-b">
  <div className="container">
    {/* Mobile header with hamburger */}
    <div className="flex items-center justify-between py-4 lg:hidden">
      <Logo />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex flex-col gap-2">
            {/* Vertical mobile navigation */}
          </nav>
        </SheetContent>
      </Sheet>
    </div>

    {/* Desktop horizontal nav */}
    <nav className="hidden lg:flex items-center gap-4 py-4">
      <Logo />
      <div className="flex items-center gap-1">
        {/* Horizontal desktop navigation */}
      </div>
    </nav>
  </div>
</header>
```

**Use cases**: Website headers, application top navigation

### 4. Table to Cards

**Pattern**: Data table on desktop → card layout on mobile

```tsx
// Desktop table
<div className="hidden md:block">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.email}</TableCell>
          <TableCell>{item.status}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

// Mobile cards
<div className="md:hidden space-y-3">
  {data.map(item => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{item.email}</p>
        <Badge>{item.status}</Badge>
      </CardContent>
    </Card>
  ))}
</div>
```

**Use cases**: Data tables, user lists, transaction histories

### 5. Responsive Modal/Sheet

**Pattern**: Full-screen modal on mobile → centered dialog on desktop

```tsx
// Mobile: Full-screen Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button className="md:hidden">Open</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[90vh]">
    {content}
  </SheetContent>
</Sheet>

// Desktop: Centered Dialog
<Dialog>
  <DialogTrigger asChild>
    <Button className="hidden md:inline-flex">Open</Button>
  </DialogTrigger>
  <DialogContent>
    {content}
  </DialogContent>
</Dialog>
```

**Use cases**: Forms, settings panels, content viewers

---

## Responsive Typography

### Fluid Typography with clamp()

**Modern approach**: Use CSS `clamp()` for fluid type scaling

```css
/* In your global CSS or component */
.fluid-text-base {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  /* min: 16px, scales with viewport, max: 18px */
}

.fluid-text-lg {
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.5rem);
  /* min: 18px, scales with viewport, max: 24px */
}

.fluid-text-xl {
  font-size: clamp(1.5rem, 1.25rem + 1vw, 2.5rem);
  /* min: 24px, scales with viewport, max: 40px */
}
```

### Tailwind Responsive Text Sizes

```tsx
// Heading scale
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
  Main Heading
</h1>

<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Sub Heading
</h2>

// Body text
<p className="text-base md:text-lg">
  Body text that's slightly larger on desktop
</p>

// Small text
<p className="text-sm md:text-base text-muted-foreground">
  Helper text or descriptions
</p>
```

### Line Height & Letter Spacing

```tsx
// Responsive leading (line-height)
<p className="leading-relaxed md:leading-loose">
  Tighter line height on mobile, looser on desktop
</p>

// Responsive tracking (letter-spacing)
<h1 className="tracking-tight md:tracking-normal">
  Heading with adjusted letter spacing
</h1>
```

### Typography Best Practices

1. **Readability**: 45-75 characters per line optimal
2. **Hierarchy**: Clear size differences between headings (1.5x - 2x ratio)
3. **Line Height**: 1.5 for body text, 1.2 for headings
4. **Contrast**: Minimum 4.5:1 for body text, 3:1 for large text (WCAG AA)

```tsx
// Optimal reading width
<article className="max-w-prose mx-auto">
  <p className="text-base md:text-lg leading-relaxed">
    Lorem ipsum dolor sit amet...
  </p>
</article>

// max-w-prose = 65ch (about 65 characters), perfect for readability
```

---

## Responsive Spacing

### Tailwind Spacing Scale

```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8 xl:p-12">
  // 16px → 24px → 32px → 48px
</div>

// Responsive margin
<div className="mt-4 md:mt-8 lg:mt-12">
  // Top margin: 16px → 32px → 48px
</div>

// Responsive gap (for flex/grid)
<div className="flex gap-2 md:gap-4 lg:gap-6">
  // 8px → 16px → 24px
</div>
```

### Container Padding

```tsx
// Standard container with responsive padding
<div className="container px-4 md:px-6 lg:px-8">
  {content}
</div>

// Section spacing
<section className="py-8 md:py-12 lg:py-16">
  // Vertical section padding
</section>
```

### Spacing Best Practices

1. **Consistency**: Use the same spacing scale throughout
2. **Rhythm**: Vertical rhythm with consistent spacing multiples
3. **Breathing Room**: More space on larger screens
4. **Touch Targets**: Minimum 44x44px on mobile

```tsx
// Component with consistent spacing
<Card className="p-4 md:p-6 space-y-4 md:space-y-6">
  <CardHeader className="space-y-2">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <p>Content...</p>
  </CardContent>
</Card>
```

---

## Responsive Grid Systems

### Auto-Fit Grid (Responsive without media queries!)

```tsx
// Grid that automatically adjusts columns based on available space
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  // Automatically wraps to new row when space < 250px per item
</div>
```

**Advantages**:
- No media queries needed
- Truly responsive to container size
- Great for card grids, image galleries

### Auto-Fill Grid

```tsx
// Similar to auto-fit, but creates empty columns if space available
<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>
```

**Difference**: `auto-fill` creates ghost columns, `auto-fit` expands items to fill space

### Responsive Grid with Spanning

```tsx
// Asymmetric grid with different column spans
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Featured item - spans 2 columns on desktop */}
  <div className="md:col-span-2 lg:col-span-2">
    <Card className="h-full">Featured Content</Card>
  </div>

  {/* Sidebar - single column */}
  <div className="md:col-span-2 lg:col-span-1">
    <Card className="h-full">Sidebar</Card>
  </div>

  {/* Regular items */}
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Dashboard Grid Layout

```tsx
// Complex dashboard with different sized widgets
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-4">
  {/* Stats cards - 1 col mobile, 2 col tablet, 1 col desktop */}
  <Card>Stat 1</Card>
  <Card>Stat 2</Card>
  <Card>Stat 3</Card>
  <Card>Stat 4</Card>

  {/* Chart - full width mobile, 2 cols tablet, 3 cols desktop */}
  <div className="md:col-span-2 lg:col-span-3">
    <Card>Chart</Card>
  </div>

  {/* Activity - full width mobile/tablet, 1 col desktop */}
  <div className="md:col-span-2 lg:col-span-1">
    <Card>Activity</Card>
  </div>
</div>
```

---

## Responsive Components

### Responsive Images

```tsx
import Image from "next/image"

// Next.js Image with responsive sizing
<div className="relative w-full h-48 md:h-64 lg:h-96">
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    className="object-cover rounded-lg"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>

// Responsive aspect ratios
<div className="aspect-square md:aspect-video">
  <Image src="/image.jpg" alt="Description" fill className="object-cover" />
</div>
```

### Responsive Buttons

```tsx
// Full width on mobile, auto width on desktop
<Button className="w-full md:w-auto">
  Click Me
</Button>

// Size variations
<Button size="sm" className="md:size-default lg:size-lg">
  Responsive Size
</Button>

// Icon + text on desktop, icon only on mobile
<Button>
  <Menu className="h-4 w-4" />
  <span className="hidden md:inline ml-2">Menu</span>
</Button>
```

### Responsive Cards

```tsx
// Horizontal card on desktop, vertical on mobile
<Card className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-48 flex-shrink-0">
    <img src="/image.jpg" alt="Image" className="w-full h-48 object-cover" />
  </div>
  <div className="flex-1">
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Content...</p>
    </CardContent>
  </div>
</Card>
```

### Responsive Forms

```tsx
// Single column mobile, multi-column desktop
<Form>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField name="firstName">
      <FormLabel>First Name</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
    </FormField>

    <FormField name="lastName">
      <FormLabel>Last Name</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
    </FormField>
  </div>

  {/* Full width field */}
  <FormField name="email">
    <FormLabel>Email</FormLabel>
    <FormControl>
      <Input type="email" />
    </FormControl>
  </FormField>

  {/* Responsive button */}
  <Button type="submit" className="w-full md:w-auto">
    Submit
  </Button>
</Form>
```

---

## Container Queries (Future)

### What are Container Queries?

Container queries allow styling based on a **parent container's size** rather than the viewport size. This is the future of component-level responsive design.

### Tailwind CSS 4.0 Support

```css
/* Coming in Tailwind CSS 4.0 */
.container-query {
  container-type: inline-size;
}

/* Child components respond to container size */
.card {
  @container (min-width: 400px) {
    /* Styles when container is > 400px */
  }
}
```

### Preparing for Container Queries

```tsx
// Use wrapper divs to prepare for container queries
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id} className="w-full">
      {/* Card adapts to container, not viewport */}
      <Card>
        <div className="aspect-square bg-cover">
          <img src={item.image} alt={item.title} />
        </div>
        <CardHeader>
          <CardTitle className="text-base @md:text-lg @lg:text-xl">
            {item.title}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  ))}
</div>
```

### Current Alternative: Component Props

```tsx
// Pass size props for now
interface CardProps {
  size?: "sm" | "md" | "lg"
}

function ResponsiveCard({ size = "md" }: CardProps) {
  return (
    <Card className={cn(
      "p-4",
      size === "sm" && "p-2 text-sm",
      size === "lg" && "p-6 text-lg"
    )}>
      {/* Content adapts to size prop */}
    </Card>
  )
}
```

---

## Touch-Friendly Design

### Minimum Touch Target Size

**WCAG 2.1 Guidelines**: Minimum 44x44 CSS pixels for touch targets

```tsx
// ✅ CORRECT: Large enough touch target
<Button size="default" className="min-h-[44px] min-w-[44px]">
  <Icon className="h-5 w-5" />
</Button>

// ❌ WRONG: Too small for touch
<Button size="icon" className="h-6 w-6">
  <Icon className="h-4 w-4" />
</Button>
```

### Touch-Friendly Spacing

```tsx
// Adequate spacing between touch targets
<div className="flex flex-col gap-3 md:gap-2">
  {/* 12px gap on mobile for touch, 8px on desktop for mouse */}
  <Button>Option 1</Button>
  <Button>Option 2</Button>
  <Button>Option 3</Button>
</div>
```

### Mobile Navigation

```tsx
// Touch-friendly mobile navigation
<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
  <div className="flex items-center justify-around p-2">
    {navItems.map(item => (
      <Link
        key={item.href}
        href={item.href}
        className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] min-h-[56px]"
      >
        <item.icon className="h-6 w-6" />
        <span className="text-xs">{item.label}</span>
      </Link>
    ))}
  </div>
</nav>
```

### Swipe Gestures

```tsx
// Consider adding swipe gestures for mobile
import { useSwipeable } from "react-swipeable"

function SwipeableCard() {
  const handlers = useSwipeable({
    onSwipedLeft: () => console.log("Swiped left"),
    onSwipedRight: () => console.log("Swiped right"),
    trackMouse: false, // Only track touch, not mouse
  })

  return (
    <div {...handlers} className="touch-pan-y">
      {/* Swipeable content */}
    </div>
  )
}
```

---

## Performance Optimization

### Responsive Images

```tsx
// Use Next.js Image with responsive sizes
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  priority // Load immediately for above-the-fold images
/>

// Lazy load below-the-fold images
<Image
  src="/feature.jpg"
  alt="Feature"
  width={800}
  height={600}
  loading="lazy"
/>
```

### Code Splitting by Breakpoint

```tsx
import dynamic from "next/dynamic"

// Only load desktop chart on desktop devices
const DesktopChart = dynamic(() => import("@/components/desktop-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px]" />,
})

function Dashboard() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return (
    <div>
      {isDesktop ? (
        <DesktopChart data={data} />
      ) : (
        <MobileStats data={data} />
      )}
    </div>
  )
}
```

### Viewport-Based Loading

```tsx
"use client"

import { useMediaQuery } from "@/hooks/use-media-query"

function ResponsiveComponent() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Only load heavy component on desktop
  return isDesktop ? <ComplexDesktopView /> : <SimpleMobileView />
}
```

### CSS Performance

```tsx
// ✅ GOOD: Static classes (can be purged and optimized)
<div className="p-4 md:p-6 lg:p-8 bg-background">

// ❌ AVOID: Dynamic styles (can't be optimized as well)
<div style={{ padding: isPadded ? "16px" : "8px" }}>

// ✅ BETTER: Dynamic classes with cn()
<div className={cn("p-4", isPadded && "md:p-8")}>
```

---

## Complete Responsive Example

```tsx
/**
 * Full responsive component example
 * Combines all best practices
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ProductCardProps {
  product: {
    id: string
    title: string
    description: string
    price: number
    image: string
    category: string
    inStock: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full group hover:shadow-lg transition-shadow">
      {/* Image - Responsive aspect ratio */}
      <div className="relative w-full aspect-square md:aspect-video overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {product.inStock ? (
          <Badge className="absolute top-2 right-2" variant="default">
            In Stock
          </Badge>
        ) : (
          <Badge className="absolute top-2 right-2" variant="secondary">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Content - Responsive padding and text */}
      <CardHeader className="p-4 md:p-5 lg:p-6 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base md:text-lg lg:text-xl line-clamp-2">
            {product.title}
          </CardTitle>
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            {product.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4 md:p-5 lg:p-6 pt-0">
        {/* Description - Responsive text size and line clamp */}
        <p className="text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3">
          {product.description}
        </p>

        {/* Price and Actions - Responsive layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto">
          <div className="text-2xl md:text-3xl font-bold">
            ${product.price.toFixed(2)}
          </div>

          {/* Buttons - Stack on mobile, row on tablet+ */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              Details
            </Button>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              disabled={!product.inStock}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Usage in responsive grid
export function ProductGrid({ products }) {
  return (
    <div className="container px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      {/* Responsive heading */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 lg:mb-12">
        Our Products
      </h1>

      {/* Responsive grid: 1 col mobile → 2 cols tablet → 3 cols desktop → 4 cols xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

---

## Testing Checklist

### Devices to Test

- [ ] iPhone SE (320px - smallest modern viewport)
- [ ] iPhone 14 Pro (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px - 1920px)
- [ ] Ultrawide (2560px+)

### Orientations

- [ ] Portrait mode on mobile/tablet
- [ ] Landscape mode on mobile/tablet
- [ ] Responsive behavior when rotating device

### Browsers

- [ ] Chrome/Edge (Chromium)
- [ ] Safari (WebKit)
- [ ] Firefox (Gecko)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Interactions

- [ ] Touch interactions (tap, swipe, pinch-zoom)
- [ ] Mouse interactions (hover, click, scroll)
- [ ] Keyboard navigation
- [ ] Screen reader testing

### Performance

- [ ] Lighthouse mobile score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Images properly sized and optimized

---

## Resources

### Tools

- **Responsively** - Test multiple devices simultaneously
- **Chrome DevTools Device Mode** - Built-in responsive testing
- **BrowserStack** - Test on real devices
- **Polypane** - Multi-viewport testing browser

### Documentation

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Responsive Design](https://web.dev/responsive-web-design-basics/)

### Custom Hooks

```tsx
// useMediaQuery hook for responsive logic
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

// Usage
const isMobile = useMediaQuery("(max-width: 768px)")
const isDesktop = useMediaQuery("(min-width: 1024px)")
```

---

## Summary

### Key Takeaways

1. **Mobile-First Always**: Design and code for mobile first, enhance for larger screens
2. **Use Tailwind Breakpoints**: Consistent breakpoints across the application
3. **Progressive Enhancement**: Add features/complexity as screen size increases
4. **Touch-Friendly**: 44x44px minimum touch targets on mobile
5. **Test on Real Devices**: Emulators are helpful but not sufficient
6. **Performance Matters**: Optimize images, lazy load, code split
7. **Accessibility**: Responsive design should improve accessibility, not hinder it
8. **Use CSS Variables**: All colors and theme values use CSS variables
9. **Grid Systems**: Use CSS Grid for complex layouts, Flexbox for simpler ones
10. **Component-Level Responsive**: Design components to be responsive within their containers

### Common Pitfalls to Avoid

❌ Desktop-first CSS (backwards media queries)
❌ Hardcoded breakpoints in JavaScript
❌ Fixed pixel widths instead of responsive units
❌ Ignoring touch interactions
❌ Not testing on real devices
❌ Overly complex layouts for mobile
❌ Tiny text on mobile (< 16px)
❌ Insufficient spacing between touch targets
❌ Loading desktop-only resources on mobile
❌ Not considering landscape orientation

### Quick Reference

```tsx
// Mobile-first utility order
<div className="
  p-4           /* Mobile default */
  md:p-6        /* Tablet: 768px+ */
  lg:p-8        /* Desktop: 1024px+ */
  xl:p-12       /* Large desktop: 1280px+ */
">

// Grid layouts
<div className="
  grid
  grid-cols-1       /* Mobile: 1 column */
  sm:grid-cols-2    /* Tablet: 2 columns */
  lg:grid-cols-3    /* Desktop: 3 columns */
  xl:grid-cols-4    /* XL: 4 columns */
  gap-4 md:gap-6    /* Responsive gap */
">

// Typography
<h1 className="
  text-2xl md:text-3xl lg:text-4xl xl:text-5xl
  leading-tight md:leading-snug
  tracking-tight
">

// Visibility
<div className="
  hidden            /* Hidden on mobile */
  md:block          /* Visible on tablet+ */
  lg:flex           /* Flex on desktop+ */
">
```

---

**Remember**: Responsive design is not just about making things fit on different screens—it's about creating the best possible experience for users on each device.
