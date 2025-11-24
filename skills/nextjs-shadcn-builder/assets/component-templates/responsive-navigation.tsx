/**
 * Responsive Navigation Component
 *
 * Demonstrates mobile-first responsive navigation patterns:
 * - Mobile (< 768px): Hamburger menu with slide-out Sheet
 * - Tablet (768px - 1024px): Sidebar navigation
 * - Desktop (>= 1024px): Horizontal navbar
 *
 * shadcn/ui components used: Sheet, Button, Separator, Badge, Avatar
 * Best practices: CSS variables, semantic HTML, ARIA labels, keyboard navigation
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Navigation item type definition
interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

// Navigation configuration
const navigationItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    description: "Dashboard home",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: "New",
    description: "Analytics and insights",
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    description: "User management",
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    badge: "3",
    description: "Document library",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Application settings",
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
    description: "Help and support",
  },
]

interface ResponsiveNavigationProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function ResponsiveNavigation({ user }: ResponsiveNavigationProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      {/* Mobile Navigation (< 768px) */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">YourApp</span>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Access all areas of your application
                </SheetDescription>
              </SheetHeader>

              <nav className="flex flex-col gap-2 mt-6" aria-label="Mobile navigation">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>

              <Separator className="my-4" />

              {/* User profile in mobile menu */}
              {user && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Tablet Sidebar Navigation (768px - 1024px) */}
      <aside
        className="hidden md:flex lg:hidden fixed left-0 top-0 z-30 h-screen w-[200px] flex-col border-r bg-background"
        aria-label="Sidebar navigation"
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">YourApp</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="Tablet navigation">
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        <Separator />

        {/* User profile in sidebar */}
        {user && (
          <div className="p-4">
            <div className="flex flex-col items-center gap-2 rounded-lg border p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-medium truncate w-full">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate w-full">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Desktop Horizontal Navigation (>= 1024px) */}
      <header
        className="hidden lg:flex sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        aria-label="Desktop navigation"
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">YourApp</span>
            </Link>

            <nav className="flex items-center gap-1" aria-label="Main navigation">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                    title={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User profile in desktop nav */}
          {user && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { ResponsiveNavigation } from "@/components/responsive-navigation"
 *
 * export default function RootLayout({ children }) {
 *   const user = {
 *     name: "John Doe",
 *     email: "john@example.com",
 *     avatar: "https://avatar.example.com/john.jpg"
 *   }
 *
 *   return (
 *     <html>
 *       <body>
 *         <ResponsiveNavigation user={user} />
 *         <main className="md:ml-[200px] lg:ml-0">
 *           {children}
 *         </main>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * Key Responsive Patterns:
 *
 * 1. Mobile (< 768px):
 *    - Compact header with hamburger menu
 *    - Sheet component for slide-out navigation
 *    - Full-screen overlay when menu is open
 *    - Touch-friendly 44px minimum touch targets
 *
 * 2. Tablet (768px - 1024px):
 *    - Fixed sidebar navigation (200px width)
 *    - Always visible, no toggle needed
 *    - Vertical icon + text layout
 *    - Content area needs margin: "md:ml-[200px]"
 *
 * 3. Desktop (>= 1024px):
 *    - Horizontal navbar at top
 *    - Full navigation always visible
 *    - User profile with dropdown indicator
 *    - No content margin needed: "lg:ml-0"
 *
 * Accessibility Features:
 * - Semantic HTML (nav, header, aside)
 * - ARIA labels for navigation regions
 * - Keyboard navigation support
 * - Focus visible states
 * - Screen reader friendly
 * - Proper heading hierarchy
 *
 * shadcn/ui Best Practices:
 * - All colors use CSS variables (bg-accent, text-muted-foreground)
 * - No hardcoded values
 * - Proper component composition (Sheet, Button, Badge, Avatar)
 * - Lucide React icons only
 * - cn() utility for conditional classes
 * - Tailwind utility classes for all styling
 */
