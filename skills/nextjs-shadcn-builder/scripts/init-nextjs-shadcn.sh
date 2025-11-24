#!/bin/bash

#
# Next.js + shadcn/ui Initialization Script
#
# Automates setup of a new Next.js project with:
# - Next.js 15+ with App Router
# - TypeScript
# - Tailwind CSS
# - shadcn/ui with CSS variables
# - Path aliases configured
# - Essential shadcn components installed
# - Theme provider with dark mode support
#
# Usage:
#   bash init-nextjs-shadcn.sh my-app
#   bash init-nextjs-shadcn.sh my-app --skip-components
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if project name provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide a project name${NC}"
    echo "Usage: $0 <project-name>"
    exit 1
fi

PROJECT_NAME="$1"
SKIP_COMPONENTS=false

# Check for skip flag
if [ "$2" == "--skip-components" ]; then
    SKIP_COMPONENTS=true
fi

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Next.js + shadcn/ui Project Initialization   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📦 Project: $PROJECT_NAME${NC}"
echo ""

# Check Node.js version
echo -e "${BLUE}[1/9] Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js 18+ is required${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Check if directory already exists
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${RED}❌ Error: Directory '$PROJECT_NAME' already exists${NC}"
    exit 1
fi

# Create Next.js project
echo -e "${BLUE}[2/9] Creating Next.js project with App Router...${NC}"
npx create-next-app@latest "$PROJECT_NAME" \
    --typescript \
    --tailwind \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --no-turbopack \
    --use-npm \
    --no-git

cd "$PROJECT_NAME"

echo -e "${GREEN}✅ Next.js project created${NC}"
echo ""

# Install shadcn/ui dependencies
echo -e "${BLUE}[3/9] Installing shadcn/ui dependencies...${NC}"
npm install class-variance-authority clsx tailwind-merge lucide-react next-themes

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Configure Tailwind for shadcn/ui
echo -e "${BLUE}[4/9] Configuring Tailwind CSS for shadcn/ui...${NC}"

# Create tailwind.config.ts with shadcn theme
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
EOF

echo -e "${GREEN}✅ Tailwind configured${NC}"
echo ""

# Install tailwindcss-animate
echo -e "${BLUE}[5/9] Installing Tailwind plugins...${NC}"
npm install -D tailwindcss-animate

echo -e "${GREEN}✅ Tailwind plugins installed${NC}"
echo ""

# Configure globals.css with shadcn CSS variables
echo -e "${BLUE}[6/9] Setting up CSS variables in globals.css...${NC}"

cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.65rem;
    --background: 1 0 0;
    --foreground: 0.141 0.005 285.823;
    --card: 1 0 0;
    --card-foreground: 0.141 0.005 285.823;
    --popover: 1 0 0;
    --popover-foreground: 0.141 0.005 285.823;
    --primary: 0.646 0.222 41.116;
    --primary-foreground: 0.98 0.016 73.684;
    --secondary: 0.967 0.001 286.375;
    --secondary-foreground: 0.21 0.006 285.885;
    --muted: 0.967 0.001 286.375;
    --muted-foreground: 0.552 0.016 285.938;
    --accent: 0.967 0.001 286.375;
    --accent-foreground: 0.21 0.006 285.885;
    --destructive: 0.577 0.245 27.325;
    --border: 0.92 0.004 286.32;
    --input: 0.92 0.004 286.32;
    --ring: 0.75 0.183 55.934;
    --chart-1: 0.837 0.128 66.29;
    --chart-2: 0.705 0.213 47.604;
    --chart-3: 0.646 0.222 41.116;
    --chart-4: 0.553 0.195 38.402;
    --chart-5: 0.47 0.157 37.304;
  }

  .dark {
    --background: 0.141 0.005 285.823;
    --foreground: 0.985 0 0;
    --card: 0.21 0.006 285.885;
    --card-foreground: 0.985 0 0;
    --popover: 0.21 0.006 285.885;
    --popover-foreground: 0.985 0 0;
    --primary: 0.705 0.213 47.604;
    --primary-foreground: 0.98 0.016 73.684;
    --secondary: 0.274 0.006 286.033;
    --secondary-foreground: 0.985 0 0;
    --muted: 0.274 0.006 286.033;
    --muted-foreground: 0.705 0.015 286.067;
    --accent: 0.274 0.006 286.033;
    --accent-foreground: 0.985 0 0;
    --destructive: 0.704 0.191 22.216;
    --border: 1 0 0 / 10%;
    --input: 1 0 0 / 15%;
    --ring: 0.408 0.123 38.172;
    --chart-1: 0.837 0.128 66.29;
    --chart-2: 0.705 0.213 47.604;
    --chart-3: 0.646 0.222 41.116;
    --chart-4: 0.553 0.195 38.402;
    --chart-5: 0.47 0.157 37.304;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF

echo -e "${GREEN}✅ CSS variables configured${NC}"
echo ""

# Create lib/utils.ts
echo -e "${BLUE}[7/9] Creating utility functions...${NC}"
mkdir -p src/lib

cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# Create components.json
cat > components.json << 'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
EOF

echo -e "${GREEN}✅ Utilities created${NC}"
echo ""

# Create theme provider
echo -e "${BLUE}[8/9] Setting up theme provider for dark mode...${NC}"
mkdir -p src/components

cat > src/components/theme-provider.tsx << 'EOF'
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
EOF

# Update layout.tsx to include ThemeProvider
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next.js + shadcn/ui App",
  description: "Built with Next.js and shadcn/ui",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
EOF

echo -e "${GREEN}✅ Theme provider configured${NC}"
echo ""

# Install essential shadcn components
if [ "$SKIP_COMPONENTS" = false ]; then
    echo -e "${BLUE}[9/9] Installing essential shadcn/ui components...${NC}"
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    echo ""

    # Install components one by one
    components=(
        "button"
        "card"
        "input"
        "label"
        "select"
        "dialog"
        "dropdown-menu"
        "toast"
        "alert"
        "badge"
        "separator"
    )

    for component in "${components[@]}"; do
        echo -e "${BLUE}  Installing $component...${NC}"
        npx shadcn@latest add "$component" --yes --overwrite
    done

    echo ""
    echo -e "${GREEN}✅ Essential components installed${NC}"
else
    echo -e "${YELLOW}[9/9] Skipping component installation${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ Setup Complete!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Project: $PROJECT_NAME${NC}"
echo -e "${BLUE}📦 Framework: Next.js with App Router${NC}"
echo -e "${BLUE}🎨 UI Library: shadcn/ui${NC}"
echo -e "${BLUE}💅 Styling: Tailwind CSS with CSS variables${NC}"
echo -e "${BLUE}🌙 Theme: Dark mode support enabled${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo -e "  1. ${GREEN}cd $PROJECT_NAME${NC}"
echo -e "  2. ${GREEN}npm run dev${NC}"
echo -e "  3. Open ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Add more components:${NC}"
echo -e "  ${GREEN}npx shadcn@latest add [component-name]${NC}"
echo ""
echo -e "${YELLOW}Browse components:${NC}"
echo -e "  ${BLUE}https://ui.shadcn.com/docs/components${NC}"
echo ""
echo -e "${YELLOW}MCP Integration:${NC}"
echo -e "  ${GREEN}npx shadcn@latest mcp init --client claude${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
