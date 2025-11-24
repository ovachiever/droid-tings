# Accessibility Best Practices Guide

Comprehensive guide to building accessible applications with Next.js, Tailwind CSS, and shadcn/ui.

## Table of Contents

1. [Accessibility Fundamentals](#accessibility-fundamentals)
2. [ARIA Attributes & Patterns](#aria-attributes--patterns)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Focus Management](#focus-management)
5. [Screen Reader Support](#screen-reader-support)
6. [Color Contrast & Visual Design](#color-contrast--visual-design)
7. [Forms & Input Accessibility](#forms--input-accessibility)
8. [Interactive Components](#interactive-components)
9. [Testing Accessibility](#testing-accessibility)
10. [WCAG 2.1 Compliance Checklist](#wcag-21-compliance-checklist)

---

## Accessibility Fundamentals

### Why Accessibility Matters

**1. Legal Requirements**: WCAG 2.1 compliance often legally required (ADA, Section 508, European Accessibility Act)

**2. Inclusive Design**: 15% of world population has some form of disability

**3. Better UX for Everyone**:
- Keyboard navigation benefits power users
- Captions help in noisy environments
- Clear structure helps everyone understand content

**4. SEO Benefits**: Semantic HTML and ARIA improve search engine understanding

### Core Principles (POUR)

1. **Perceivable**: Information must be presentable to users in ways they can perceive
2. **Operable**: UI components must be operable by all users
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be interpretable by various user agents, including assistive technologies

### WCAG Conformance Levels

- **Level A** (Minimum): Basic accessibility features
- **Level AA** (Standard): Addresses major barriers, recommended for most websites
- **Level AAA** (Enhanced): Highest level, may not be feasible for all content

**Target**: WCAG 2.1 Level AA compliance

---

## ARIA Attributes & Patterns

### What is ARIA?

**ARIA** (Accessible Rich Internet Applications) provides additional semantics for assistive technologies when HTML alone is insufficient.

### Golden Rule of ARIA

**First Rule**: Don't use ARIA if you can use native HTML instead.

```tsx
// ❌ BAD: Unnecessary ARIA
<div role="button" onClick={handleClick}>Click me</div>

// ✅ GOOD: Native HTML
<button onClick={handleClick}>Click me</button>
```

### Common ARIA Attributes

#### aria-label

Provides accessible name for elements without visible text.

```tsx
// Icon-only button
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Logo link
<Link href="/" aria-label="Go to homepage">
  <Logo />
</Link>
```

#### aria-labelledby & aria-describedby

Reference other elements for labeling and description.

```tsx
<div role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p id="dialog-desc">
    This action cannot be undone. Are you sure you want to delete?
  </p>
  <Button>Delete</Button>
  <Button>Cancel</Button>
</div>
```

#### aria-hidden

Hide decorative elements from screen readers.

```tsx
// Decorative icon (meaning conveyed by text)
<Button>
  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
  Add Item
</Button>

// ❌ BAD: Hiding interactive content
<button aria-hidden="true">Click me</button> // Never do this!
```

#### aria-live

Announce dynamic content changes.

```tsx
// Toast notifications
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="toast"
>
  {message}
</div>

// Urgent alerts
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  Error: {errorMessage}
</div>
```

**aria-live values:**
- `off` (default): No announcements
- `polite`: Announce at next opportunity (most cases)
- `assertive`: Interrupt immediately (errors, urgent alerts)

#### aria-expanded

Indicates expandable/collapsible state.

```tsx
function Accordion() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls="accordion-content"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Collapse" : "Expand"} Section
      </button>
      <div id="accordion-content" hidden={!isOpen}>
        Content here...
      </div>
    </div>
  )
}
```

#### aria-selected

Indicates selection state (tabs, lists).

```tsx
<div role="tablist">
  <button
    role="tab"
    aria-selected={activeTab === "tab1"}
    aria-controls="panel1"
    id="tab1"
  >
    Tab 1
  </button>
  <button
    role="tab"
    aria-selected={activeTab === "tab2"}
    aria-controls="panel2"
    id="tab2"
  >
    Tab 2
  </button>
</div>
<div role="tabpanel" id="panel1" aria-labelledby="tab1">
  Panel 1 content
</div>
```

#### aria-disabled vs disabled

```tsx
// For interactive elements that should remain in tab order
<button aria-disabled="true" onClick={handleClick}>
  Cannot submit yet
</button>

// Standard disabled (removed from tab order)
<button disabled>Cannot submit</button>
```

### Common ARIA Roles

```tsx
// Navigation
<nav role="navigation" aria-label="Main navigation">

// Search
<div role="search">
  <input type="search" aria-label="Search site" />
</div>

// Alert
<div role="alert">
  Error occurred!
</div>

// Status (non-interruptive)
<div role="status" aria-live="polite">
  Loading...
</div>

// Application (for complex widgets)
<div role="application" aria-label="Calendar widget">
  {/* Complex calendar UI */}
</div>
```

---

## Keyboard Navigation

### Standard Keyboard Patterns

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate button/link |
| `Space` | Activate button, toggle checkbox |
| `Escape` | Close dialog/menu |
| `Arrow Keys` | Navigate within components (tabs, menus, radio groups) |
| `Home` | First item |
| `End` | Last item |

### Keyboard Navigation Implementation

#### Focus Order

Ensure logical tab order matching visual layout.

```tsx
// ✅ GOOD: Logical tab order
<form>
  <input tabIndex={0} /> {/* Default, follows DOM order */}
  <button>Submit</button>
</form>

// ❌ BAD: Confusing tab order
<div>
  <button tabIndex={3}>Third</button>
  <button tabIndex={1}>First</button>
  <button tabIndex={2}>Second</button>
</div>
```

**Rule**: Use `tabIndex={0}` for custom interactive elements. Avoid positive tabIndex values.

#### Skip Links

Allow users to skip repetitive navigation.

```tsx
export function Layout({ children }) {
  return (
    <>
      {/* Skip link (hidden until focused) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header>
        <nav>{/* Navigation */}</nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
```

#### Arrow Key Navigation

For custom components like tabs, menus, radio groups.

```tsx
function RadioGroup({ options, value, onChange }) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault()
        newIndex = (index + 1) % options.length
        break
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault()
        newIndex = (index - 1 + options.length) % options.length
        break
      case "Home":
        e.preventDefault()
        newIndex = 0
        break
      case "End":
        e.preventDefault()
        newIndex = options.length - 1
        break
      default:
        return
    }

    onChange(options[newIndex].value)
    // Focus the new radio button
    document.getElementById(`radio-${newIndex}`)?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Options">
      {options.map((option, index) => (
        <div key={option.value}>
          <input
            type="radio"
            id={`radio-${index}`}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
          <label htmlFor={`radio-${index}`}>{option.label}</label>
        </div>
      ))}
    </div>
  )
}
```

#### Escape Key to Close

```tsx
function Dialog({ open, onClose, children }) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
```

---

## Focus Management

### Focus Indicators

**Always provide visible focus indicators.**

```css
/* Tailwind's focus-visible (shows only for keyboard focus) */
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click Me
</Button>

/* Custom focus styles */
<a className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
">
  Link
</a>
```

**shadcn/ui Default**: All components have focus indicators built in.

### Focus Trapping

Trap focus within modals/dialogs.

```tsx
import { useEffect, useRef } from "react"

function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Focus first element
    firstElement?.focus()

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [isActive])

  return containerRef
}

// Usage
function Modal({ open, onClose }) {
  const containerRef = useFocusTrap(open)

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" ref={containerRef}>
      <h2>Modal Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
```

**Note**: shadcn/ui Dialog and Sheet components handle focus trapping automatically.

### Focus Restoration

Return focus to triggering element when closing modals.

```tsx
function Modal({ open, onClose, triggerRef }) {
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      // Store previously focused element
      previousFocus.current = document.activeElement as HTMLElement
    } else if (previousFocus.current) {
      // Restore focus when modal closes
      previousFocus.current.focus()
      previousFocus.current = null
    }
  }, [open])

  // ... modal JSX
}
```

---

## Screen Reader Support

### Semantic HTML

Use semantic HTML elements for proper screen reader interpretation.

```tsx
// ✅ GOOD: Semantic HTML
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>

<footer>
  <p>&copy; 2024 Company</p>
</footer>

// ❌ BAD: Divs everywhere
<div class="header">
  <div class="nav">
    <div class="link">Home</div>
  </div>
</div>
```

### Landmarks

Major page regions should be identifiable.

```tsx
<body>
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      {/* Primary nav */}
    </nav>
  </header>

  <main role="main">
    {/* Main content */}

    <aside role="complementary" aria-label="Related articles">
      {/* Sidebar */}
    </aside>
  </main>

  <footer role="contentinfo">
    {/* Footer */}
  </footer>
</body>
```

**Note**: HTML5 semantic elements have implicit roles, but explicit roles help older assistive tech.

### Screen Reader Only Text

Show text only to screen readers.

```tsx
// Tailwind sr-only utility
<span className="sr-only">Additional context for screen readers</span>

// Custom sr-only CSS
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Usage example
<Button size="icon">
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Close</span>
</Button>
```

### Meaningful Link Text

```tsx
// ❌ BAD: Non-descriptive
<a href="/article">Click here</a>
<a href="/article">Read more</a>

// ✅ GOOD: Descriptive
<a href="/article">Read the full article about accessibility</a>
<a href="/article" aria-label="Read more about accessibility best practices">
  Read more
</a>
```

### Live Regions for Dynamic Content

```tsx
// Form validation messages
<Input
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && (
  <span
    id="email-error"
    role="alert"
    className="text-sm text-destructive"
  >
    {error}
  </span>
)}

// Loading states
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "Loading..." : "Content loaded"}
  <span className="sr-only">
    {isLoading ? "Loading content" : "Content has finished loading"}
  </span>
</div>
```

---

## Color Contrast & Visual Design

### WCAG Color Contrast Requirements

**Level AA (Standard)**:
- **Normal text** (< 18pt or < 14pt bold): 4.5:1 contrast ratio
- **Large text** (≥ 18pt or ≥ 14pt bold): 3:1 contrast ratio
- **UI components & graphics**: 3:1 contrast ratio

**Level AAA (Enhanced)**:
- **Normal text**: 7:1 contrast ratio
- **Large text**: 4.5:1 contrast ratio

### Testing Contrast

```bash
# Tools for testing contrast
# 1. Chrome DevTools - Inspect element, see contrast ratio
# 2. WebAIM Contrast Checker - https://webaim.org/resources/contrastchecker/
# 3. WAVE Extension - Browser extension for accessibility testing
```

### shadcn/ui Color System

shadcn/ui's CSS variable system ensures proper contrast:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;  /* High contrast with background */

  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;  /* High contrast with primary */

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;  /* Meets AA */
}
```

### Color Usage Best Practices

```tsx
// ✅ GOOD: Color + icon + text for status
<div className="flex items-center gap-2 text-green-700">
  <CheckCircle className="h-4 w-4" />
  <span>Success</span>
</div>

// ❌ BAD: Color only (problematic for colorblind users)
<div className="text-red-500">Error occurred</div>

// ✅ GOOD: Color + icon + text
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Error occurred</AlertDescription>
</Alert>
```

### Focus Indicators Contrast

```tsx
// Ensure focus indicators have sufficient contrast (3:1 minimum)
<Button className="
  focus-visible:ring-2
  focus-visible:ring-primary
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
">
  Button
</Button>
```

### Text Size

```tsx
// Minimum 16px (1rem) for body text
<p className="text-base">  {/* 16px - 1rem */}
  Body text content
</p>

// Allow user zoom up to 200% without breaking layout
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## Forms & Input Accessibility

### Label Association

**Always associate labels with inputs.**

```tsx
// ✅ GOOD: Explicit association
<div>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" name="email" />
</div>

// ✅ GOOD: Implicit association
<label>
  Email
  <input type="email" name="email" />
</label>

// ❌ BAD: No association
<div>Email</div>
<input type="email" name="email" />
```

### Form Validation

```tsx
// Accessible form validation with shadcn/ui
<FormField
  control={form.control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input
          {...field}
          type="email"
          aria-invalid={!!fieldState.error}
          aria-describedby={fieldState.error ? "email-error" : undefined}
        />
      </FormControl>
      {fieldState.error && (
        <FormMessage id="email-error" role="alert">
          {fieldState.error.message}
        </FormMessage>
      )}
      <FormDescription>
        We'll never share your email.
      </FormDescription>
    </FormItem>
  )}
/>
```

### Required Fields

```tsx
// Indicate required fields clearly
<FormLabel>
  Email <span className="text-destructive" aria-hidden="true">*</span>
  <span className="sr-only">(required)</span>
</FormLabel>
<Input required aria-required="true" />

// Or use form description
<FormDescription>
  <span className="text-destructive">*</span> Required field
</FormDescription>
```

### Error Summaries

```tsx
// Form error summary at top
{errors.length > 0 && (
  <Alert variant="destructive" role="alert" aria-live="polite">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>There are {errors.length} errors in your submission</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside">
        {errors.map((error, index) => (
          <li key={index}>
            <a href={`#${error.field}`} className="underline">
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

### Fieldsets and Legends

```tsx
// Group related inputs
<fieldset className="border rounded-lg p-4">
  <legend className="text-lg font-semibold px-2">
    Shipping Address
  </legend>

  <div className="space-y-4">
    <div>
      <label htmlFor="street">Street</label>
      <Input id="street" />
    </div>
    <div>
      <label htmlFor="city">City</label>
      <Input id="city" />
    </div>
  </div>
</fieldset>
```

---

## Interactive Components

### Accessible Modal/Dialog

```tsx
// shadcn/ui Dialog is accessible by default
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Focus trapped automatically */}
    {/* Escape key closes automatically */}
    {/* aria-modal="true" set automatically */}
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description for screen readers
      </DialogDescription>
    </DialogHeader>
    <div>Content</div>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Accessible Tooltips

```tsx
// Tooltips should not contain essential information
// (keyboard users may not trigger hover)

// ✅ GOOD: Supplementary information only
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover for tip</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a helpful tip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// ❌ BAD: Essential action in tooltip
<Tooltip>
  <TooltipTrigger>
    <div>User</div>
  </TooltipTrigger>
  <TooltipContent>
    <Button>Delete User</Button> {/* Not keyboard accessible! */}
  </TooltipContent>
</Tooltip>
```

### Accessible Tabs

```tsx
// shadcn/ui Tabs component implements proper ARIA
<Tabs defaultValue="tab1">
  <TabsList role="tablist">
    <TabsTrigger value="tab1" role="tab" aria-selected={true}>
      Tab 1
    </TabsTrigger>
    <TabsTrigger value="tab2" role="tab" aria-selected={false}>
      Tab 2
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" role="tabpanel">
    Tab 1 content
  </TabsContent>
  <TabsContent value="tab2" role="tabpanel">
    Tab 2 content
  </TabsContent>
</Tabs>
```

---

## Testing Accessibility

### Automated Testing Tools

#### 1. eslint-plugin-jsx-a11y

```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

```json
// .eslintrc.json
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"]
}
```

#### 2. axe DevTools

Chrome/Firefox extension for automated accessibility testing.

#### 3. Lighthouse

Built into Chrome DevTools. Run accessibility audit.

```bash
# CLI
npm install -g @lhci/cli
lhci autorun
```

### Manual Testing

#### Keyboard Testing Checklist

- [ ] Can reach all interactive elements with Tab
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Can activate buttons/links with Enter/Space
- [ ] Can close modals with Escape
- [ ] Can navigate menus with arrow keys
- [ ] No keyboard traps (can Tab out of all components)

#### Screen Reader Testing

**Test with actual screen readers:**
- **Windows**: NVDA (free), JAWS
- **macOS**: VoiceOver (built-in)
- **iOS**: VoiceOver
- **Android**: TalkBack

**Basic VoiceOver commands (macOS)**:
- `Cmd + F5`: Toggle VoiceOver
- `Ctrl + Option + Right/Left Arrow`: Navigate elements
- `Ctrl + Option + Space`: Activate element

#### Color Contrast Testing

```bash
# Browser DevTools
# 1. Inspect element
# 2. Check "Accessibility" panel
# 3. View contrast ratio

# Online tools
# - WebAIM Contrast Checker
# - Coolors Contrast Checker
```

### Testing Script Example

```tsx
// Using @testing-library/react for accessibility testing
import { render, screen } from "@testing-library/react"
import { axe, toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

test("Button is accessible", async () => {
  const { container } = render(
    <Button onClick={() => {}}>Click me</Button>
  )

  const results = await axe(container)
  expect(results).toHaveNoViolations()

  // Test keyboard interaction
  const button = screen.getByRole("button", { name: /click me/i })
  button.focus()
  expect(button).toHaveFocus()
})

test("Form has proper labels", () => {
  render(
    <form>
      <label htmlFor="name">Name</label>
      <input id="name" type="text" />
    </form>
  )

  const input = screen.getByLabelText(/name/i)
  expect(input).toBeInTheDocument()
})
```

---

## WCAG 2.1 Compliance Checklist

### Level A (Minimum)

#### Perceivable
- [ ] **1.1.1** Text alternatives for non-text content
- [ ] **1.2.1** Captions/transcript for audio-only
- [ ] **1.2.2** Captions for videos (prerecorded)
- [ ] **1.2.3** Audio description or text transcript for videos
- [ ] **1.3.1** Info and relationships can be programmatically determined
- [ ] **1.3.2** Meaningful sequence
- [ ] **1.3.3** Instructions don't rely solely on sensory characteristics
- [ ] **1.4.1** Color not used as only visual means
- [ ] **1.4.2** User can pause, stop, hide moving content

#### Operable
- [ ] **2.1.1** All functionality available via keyboard
- [ ] **2.1.2** No keyboard trap
- [ ] **2.1.4** Character key shortcuts can be remapped
- [ ] **2.2.1** Timing adjustable
- [ ] **2.2.2** Can pause, stop, hide moving content
- [ ] **2.3.1** No content flashes more than 3 times per second
- [ ] **2.4.1** Skip repetitive content (skip links)
- [ ] **2.4.2** Pages have titles
- [ ] **2.4.3** Focus order is meaningful
- [ ] **2.4.4** Link purpose clear from link text or context

#### Understandable
- [ ] **3.1.1** Page language identified
- [ ] **3.2.1** On focus doesn't cause unexpected context change
- [ ] **3.2.2** On input doesn't cause unexpected context change
- [ ] **3.3.1** Error identification
- [ ] **3.3.2** Labels or instructions for user input

#### Robust
- [ ] **4.1.1** Valid HTML (no duplicate IDs, proper nesting)
- [ ] **4.1.2** Name, role, value for UI components
- [ ] **4.1.3** Status messages programmatically determinable

### Level AA (Standard Target)

#### Perceivable
- [ ] **1.2.4** Live captions for audio
- [ ] **1.2.5** Audio description for video (prerecorded)
- [ ] **1.3.4** Orientation not locked to single view
- [ ] **1.3.5** Autocomplete purpose identified
- [ ] **1.4.3** Color contrast minimum 4.5:1 (3:1 for large text)
- [ ] **1.4.4** Text can be resized 200% without loss of function
- [ ] **1.4.5** Images of text avoided
- [ ] **1.4.10** Reflow without horizontal scrolling at 320px width
- [ ] **1.4.11** Non-text contrast minimum 3:1
- [ ] **1.4.12** Text spacing adjustable
- [ ] **1.4.13** Content on hover/focus can be dismissed

#### Operable
- [ ] **2.4.5** Multiple ways to find pages (nav, search, sitemap)
- [ ] **2.4.6** Headings and labels descriptive
- [ ] **2.4.7** Focus indicator visible
- [ ] **2.5.1** Complex gestures have simple alternatives
- [ ] **2.5.2** Touch/pointer cancellation
- [ ] **2.5.3** Label in name matches accessible name
- [ ] **2.5.4** Motion actuation can be disabled

#### Understandable
- [ ] **3.1.2** Language of parts identified
- [ ] **3.2.3** Consistent navigation
- [ ] **3.2.4** Consistent identification
- [ ] **3.3.3** Error suggestions provided
- [ ] **3.3.4** Error prevention for legal/financial/data

---

## Quick Reference

### Common Patterns

```tsx
// Accessible button
<Button
  onClick={handleClick}
  disabled={isDisabled}
  aria-label="Descriptive action"  // If no visible text
>
  <Icon className="h-4 w-4" aria-hidden="true" />
  <span>Button Text</span>
</Button>

// Accessible link
<Link
  href="/page"
  className="underline focus-visible:ring-2"
>
  Descriptive link text
</Link>

// Accessible form field
<FormField
  control={form.control}
  name="field"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>Help text</FormDescription>
      <FormMessage />  {/* Error message with role="alert" */}
    </FormItem>
  )}
/>

// Accessible modal
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {content}
  </DialogContent>
</Dialog>

// Accessible navigation
<nav aria-label="Main navigation">
  <ul>
    <li><Link href="/">Home</Link></li>
    <li><Link href="/about">About</Link></li>
  </ul>
</nav>

// Accessible status message
<div role="status" aria-live="polite">
  {statusMessage}
</div>

// Accessible alert
<Alert role="alert" variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
```

---

## Resources

### Official Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)

---

**Remember**: Accessibility is not a checklist—it's an ongoing commitment to inclusive design. Test with real users, including those with disabilities, whenever possible.
