# nextjs-shadcn-builder

A comprehensive Claude Code skill for building new Next.js applications or migrating existing frontends to Next.js + shadcn/ui.

## What This Skill Does

This skill enables systematic frontend development and migration with strict adherence to shadcn/ui design principles:

- ✅ **Create new Next.js projects** with shadcn/ui, Tailwind CSS, and proper design system setup
- ✅ **Migrate existing frontends** from React, Vue, Angular, or vanilla JavaScript to Next.js
- ✅ **Automated codebase analysis** to understand complexity and migration scope
- ✅ **Systematic component conversion** using batch-based approach
- ✅ **Enforce design standards**: CSS variables only, no hardcoded values, standard shadcn components
- ✅ **Mobile-first responsive design** for phone, tablet, and desktop devices ⭐ NEW
- ✅ **WCAG 2.1 Level AA accessibility** compliance ⭐ NEW
- ✅ **Advanced component patterns** with comprehensive examples ⭐ NEW
- ✅ **MCP integration** for real-time shadcn documentation access

## Core Philosophy

**100% shadcn/ui Compliance:**
- CSS variables for all theming (colors, spacing, typography)
- Standard shadcn/ui components only
- No hardcoded values
- No custom UI components
- No emoji icons
- Consistent design tokens
- Mobile-first responsive design for all devices
- WCAG 2.1 Level AA accessibility standards

## Directory Structure

```
nextjs-shadcn-builder/
├── SKILL.md                                    # Main skill instructions (5-phase workflow)
├── README.md                                   # This file
├── scripts/                                    # Automation scripts
│   ├── analyze-codebase.py                     # Analyze existing frontends
│   ├── detect-hardcoded-values.sh              # Find anti-patterns
│   ├── init-nextjs-shadcn.sh                   # Initialize new projects
│   └── generate-migration-report.py            # Create migration plans
├── references/                                 # Comprehensive guides
│   ├── react-to-nextjs.md                      # React migration patterns
│   ├── vue-to-nextjs.md                        # Vue migration patterns
│   ├── shadcn-component-mapping.md             # Component equivalents
│   ├── styling-migration.md                    # Styling conversion guide
│   ├── responsive-design-patterns.md           # ⭐ Responsive design guide
│   ├── accessibility-best-practices.md         # ⭐ WCAG 2.1 accessibility guide
│   └── advanced-shadcn-components.md           # ⭐ Advanced component patterns
└── assets/
    ├── component-templates/                    # Example components
    │   ├── example-feature-card.tsx            # Basic shadcn composition
    │   ├── example-user-profile.tsx            # Avatar & badge patterns
    │   ├── responsive-navigation.tsx           # ⭐ Mobile/tablet/desktop nav
    │   ├── responsive-data-table.tsx           # ⭐ Responsive table patterns
    │   ├── responsive-dashboard.tsx            # ⭐ Dashboard grid layouts
    │   └── complex-form.tsx                    # ⭐ Multi-step form with validation
    └── theme-example-oklch.css                 # OKLCH color system example
```

## Usage

### Creating a New Next.js App

```bash
bash ./scripts/init-nextjs-shadcn.sh my-app
cd my-app
npm run dev
```

### Migrating an Existing Frontend

**Phase 1: Analysis**
```bash
python ./scripts/analyze-codebase.py /path/to/existing/app
bash ./scripts/detect-hardcoded-values.sh /path/to/existing/app
```

**Phase 2: Planning**
```bash
python ./scripts/generate-migration-report.py
# Review migration-plan.md
```

**Phase 3-5:**
Follow the generated migration plan and SKILL.md instructions.

## Features

### Automated Analysis
- Detects framework and version
- Inventories all components
- Finds hardcoded values (colors, spacing, fonts)
- Assesses migration complexity
- Generates comprehensive reports

### Systematic Migration
- 5-phase workflow (Analysis → Planning → Setup → Conversion → Verification)
- Batch-based conversion (5-10 components at a time)
- Component mapping to shadcn equivalents
- Test after each batch

### Responsive Design ⭐ NEW
- Mobile-first approach with Tailwind breakpoints
- Responsive component patterns (navigation, tables, dashboards, forms)
- Touch-friendly design (44x44px minimum targets)
- Fluid typography and spacing
- Comprehensive testing guidelines for all devices
- See `references/responsive-design-patterns.md` for full guide

### Accessibility ⭐ NEW
- WCAG 2.1 Level AA compliance
- Keyboard navigation patterns
- Screen reader support
- ARIA attributes and roles
- Color contrast verification (4.5:1 minimum)
- Focus management and indicators
- Complete testing checklist
- See `references/accessibility-best-practices.md` for full guide

### Advanced Component Patterns ⭐ NEW
- Data tables with sorting and pagination
- Command palettes for power users
- Sheet components for mobile navigation
- Multi-step forms with validation
- Responsive dashboards with charts
- See `references/advanced-shadcn-components.md` for component guide

### MCP Integration
- Real-time shadcn documentation access
- Component discovery
- Block and chart templates
- Best practices lookup

### Framework Support
- React (CRA, Vite, custom setups)
- Vue (2.x and 3.x)
- Angular
- Vanilla JavaScript
- Next.js (migration to App Router + shadcn)

## Scripts

### analyze-codebase.py
Analyzes existing frontend codebases:
- Framework detection
- Component inventory (with complexity assessment)
- Dependencies analysis
- File structure mapping
- Outputs: `codebase-analysis.json`

### detect-hardcoded-values.sh
Scans for anti-patterns:
- Hardcoded colors (#hex, rgb(), etc.)
- Inline spacing values
- Inline styles
- CSS-in-JS usage
- Custom fonts
- Outputs: `hardcoded-values-report.md`

### generate-migration-report.py
Creates comprehensive migration plan:
- Executive summary
- Component mapping table
- Batch organization
- Complexity assessment
- Step-by-step roadmap
- Outputs: `migration-plan.md`

### init-nextjs-shadcn.sh
Initializes new Next.js projects:
- Next.js 15+ with App Router
- TypeScript configuration
- Tailwind CSS setup
- shadcn/ui with CSS variables
- Theme provider (dark mode)
- Essential components installed

## Reference Files

### react-to-nextjs.md
- Routing migration (React Router → Next.js)
- Client vs Server Components
- Hooks and state management
- Data fetching patterns
- Testing configuration

### vue-to-nextjs.md
- Template syntax → JSX
- Composition API → React Hooks
- Vue Router → Next.js routing
- Pinia → Zustand

### shadcn-component-mapping.md
- Complete component mapping table
- Material-UI → shadcn
- Ant Design → shadcn
- Bootstrap → shadcn
- Usage examples for each component

### styling-migration.md
- CSS-in-JS → Tailwind
- CSS Modules → Tailwind
- SCSS/SASS → Tailwind
- Color conversion (hex → HSL)
- Spacing migration
- Responsive design patterns

## Example Components

### Basic Examples

#### example-feature-card.tsx
Demonstrates:
- shadcn Card, Button, Badge composition
- No hardcoded values
- TypeScript types
- Lucide React icons
- Clean composition pattern

#### example-user-profile.tsx
Demonstrates:
- Complex component composition
- Avatar, Badge, Card, Button usage
- Responsive design
- Semantic colors
- Icon integration

### Advanced Responsive Examples ⭐ NEW

#### responsive-navigation.tsx
**Mobile-first navigation patterns:**
- Mobile: Hamburger menu with slide-out Sheet
- Tablet: Fixed sidebar navigation (200px)
- Desktop: Horizontal navbar with full menu
- Demonstrates: Sheet, Button, Separator, Badge, Avatar
- **400+ lines** of production-ready code

#### responsive-data-table.tsx
**Adaptive data display:**
- Mobile: Card-based layout with key information
- Tablet: Scrollable table with priority columns
- Desktop: Full table with sorting, filtering, pagination
- Demonstrates: Table, Card, Button, Badge, Input, Select
- **500+ lines** with TanStack Table integration ready

#### responsive-dashboard.tsx
**Responsive grid layouts:**
- Mobile: 1-column stacked layout
- Tablet: 2-column grid
- Desktop: 3-4 column dynamic grid with spanning
- Demonstrates: Card, Button, Badge, Progress, Avatar
- **400+ lines** with chart integration patterns

#### complex-form.tsx
**Multi-step form with validation:**
- Step-by-step wizard with progress indicator
- Form validation using react-hook-form + zod
- Conditional fields based on user input
- File upload with type/size validation
- Responsive layout (1-col mobile → 2-col desktop)
- Demonstrates: Form, Input, Select, Checkbox, RadioGroup, Button
- **800+ lines** of production-ready form patterns

## When to Use This Skill

**Trigger this skill when:**
- Building a new Next.js application
- Migrating from React/Vue/Angular to Next.js
- Adopting shadcn/ui design system
- Standardizing component libraries
- Need to enforce design system compliance
- Converting hardcoded styles to CSS variables

## Output Deliverables

**Phase 1 (Analysis):**
- `codebase-analysis.json` - Full codebase inventory
- `hardcoded-values-report.md` - Anti-pattern violations

**Phase 2 (Planning):**
- `migration-plan.md` - Detailed migration roadmap
- Component mapping table
- Batch organization plan

**Phase 3 (Setup):**
- Configured Next.js project
- shadcn/ui components installed
- Design system (CSS variables)
- MCP server configured

**Phase 4 (Conversion):**
- Migrated components (batch by batch)
- Passing tests per batch
- Updated styling

**Phase 5 (Verification):**
- Test results
- Responsive design verification report (all devices tested)
- Performance metrics (Lighthouse scores)
- Accessibility audit (WCAG 2.1 Level AA compliance)
- Clean codebase (0 hardcoded values)
- Migration summary

## Requirements

- **Node.js:** 18+ required
- **Python:** 3.7+ (for analysis scripts)
- **Bash:** For shell scripts
- **Package Manager:** npm, pnpm, or yarn

## Design Principles

This skill enforces shadcn/ui best practices:

✅ **DO:**
- Use CSS variables for all theming
- Use standard shadcn components
- Use Tailwind utility classes
- Use semantic color names (primary, secondary, muted, etc.)
- Compose complex components from shadcn primitives
- Query MCP before building custom components

❌ **DON'T:**
- Hardcode colors, spacing, or fonts
- Use inline styles
- Create custom UI primitives (buttons, inputs, cards)
- Use emoji icons (use Lucide React instead)
- Use arbitrary Tailwind values
- Skip MCP documentation lookup

## Resources

- **shadcn/ui:** https://ui.shadcn.com
- **Next.js:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **MCP Setup:** `npx shadcn@latest mcp init --client claude`

## What's New ⭐

### Version 2.0 - Responsive & Accessible

This major update adds comprehensive responsive design and accessibility features:

**New Guides (3):**
1. **Responsive Design Patterns** (`references/responsive-design-patterns.md`)
   - 7,000+ words covering mobile-first design
   - Complete breakpoint strategies
   - Fluid typography and spacing
   - Touch-friendly design patterns
   - Container queries (future-ready)

2. **Accessibility Best Practices** (`references/accessibility-best-practices.md`)
   - Complete WCAG 2.1 Level AA checklist
   - ARIA patterns and keyboard navigation
   - Screen reader testing guide
   - Color contrast requirements
   - Form accessibility patterns

3. **Advanced shadcn Components** (`references/advanced-shadcn-components.md`)
   - Data table with TanStack Table
   - Command palette patterns
   - Sheet and navigation menu usage
   - Component variant decision guide
   - When to use each component

**New Example Components (4):**
1. **responsive-navigation.tsx** - 400+ lines showing mobile hamburger → tablet sidebar → desktop navbar
2. **responsive-data-table.tsx** - 500+ lines with mobile cards → tablet scrollable → desktop full table
3. **responsive-dashboard.tsx** - 400+ lines with 1-col mobile → 2-col tablet → 3-4 col desktop grids
4. **complex-form.tsx** - 800+ lines multi-step form with validation, file uploads, conditional fields

**Enhanced Verification Phase:**
- Responsive design testing on real devices (iPhone SE to ultrawide monitors)
- WCAG 2.1 Level AA compliance verification
- Keyboard navigation testing
- Screen reader compatibility
- Touch target size verification
- Color contrast checking

**Total New Content:** ~20,000+ lines of documentation and production-ready code examples

## License

See LICENSE.txt for complete terms.
