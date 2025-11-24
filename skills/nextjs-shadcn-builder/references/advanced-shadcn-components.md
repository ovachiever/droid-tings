# Advanced shadcn/ui Components Guide

Comprehensive guide to advanced shadcn/ui components, their use cases, variants, and best practices.

## Table of Contents

1. [Data Table](#data-table)
2. [Command Palette](#command-palette)
3. [Sheet](#sheet)
4. [Navigation Menu](#navigation-menu)
5. [Breadcrumb](#breadcrumb)
6. [Calendar & Date Picker](#calendar--date-picker)
7. [Combobox](#combobox)
8. [Context Menu](#context-menu)
9. [Hover Card](#hover-card)
10. [Menubar](#menubar)
11. [Popover](#popover)
12. [Scroll Area](#scroll-area)
13. [Sonner (Toast)](#sonner-toast)
14. [Component Variants Guide](#component-variants-guide)

---

## Data Table

### Overview

The Data Table is a powerful component for displaying and interacting with tabular data. Built on top of TanStack Table (formerly React Table).

### Installation

```bash
npx shadcn-ui@latest add table
npm install @tanstack/react-table
```

### Basic Data Table

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function BasicDataTable({ data }: { data: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Advanced Data Table with TanStack Table

```tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Column definitions
const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge>{row.getValue("role")}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Data table component
export function DataTable({ data }: { data: User[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {/* Filter input */}
      <Input
        placeholder="Filter by name..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### When to Use Data Table

✅ **Use for:**
- Displaying large datasets (100+ rows)
- Complex data with multiple columns
- Need for sorting, filtering, pagination
- Row selection and bulk actions
- Editable data grids

❌ **Don't use for:**
- Small lists (< 10 items) - use simple list
- Single-column data - use Card list
- Mobile-first designs - use Cards instead

---

## Command Palette

### Overview

The Command component provides a fast, accessible command menu for your application. Based on cmdk.

### Installation

```bash
npx shadcn-ui@latest add command
```

### Basic Command Palette

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => console.log("Dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => console.log("Users")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Users</span>
            <CommandShortcut>⌘U</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => console.log("Settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New</span>
          </CommandItem>
          <CommandItem>
            <Download className="mr-2 h-4 w-4" />
            <span>Export Data</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

### Command Palette with Search

```tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Search,
  Settings,
  User,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/profile"))}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/billing"))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

### When to Use Command Palette

✅ **Use for:**
- Global navigation shortcuts
- Search across multiple entities
- Quick actions and commands
- Power user features
- Apps with many pages/actions

❌ **Don't use for:**
- Simple 3-5 page websites
- Primary navigation (use navbar)
- Mobile-only apps (keyboard shortcuts don't work)
- Forms (use standard form inputs)

---

## Sheet

### Overview

Sheet is a slide-out panel component, perfect for mobile navigation and supplementary content.

### Installation

```bash
npx shadcn-ui@latest add sheet
```

### Basic Sheet

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function BasicSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>
            Sheet description goes here.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {/* Sheet content */}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### Sheet Sides

```tsx
// Sheet can slide in from any side
<Sheet>
  <SheetTrigger asChild>
    <Button>Left</Button>
  </SheetTrigger>
  <SheetContent side="left">
    {/* Content */}
  </SheetContent>
</Sheet>

// Sides: "left" | "right" | "top" | "bottom"
```

### Mobile Navigation Sheet

```tsx
import { Menu } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

### When to Use Sheet

✅ **Use for:**
- Mobile navigation menus
- Filters and settings panels
- Shopping carts
- Contextual information panels
- Form wizards on mobile
- Detail views

❌ **Don't use for:**
- Critical actions (use Dialog)
- Desktop primary navigation
- Content that needs full screen
- Multiple simultaneous panels (only one Sheet at a time)

---

## Navigation Menu

### Overview

A collection of links for site navigation, with dropdown support.

### Installation

```bash
npx shadcn-ui@latest add navigation-menu
```

### Basic Navigation Menu

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/">Home</NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <a href="/products/web">
                    <div className="text-sm font-medium">Web Development</div>
                    <p className="text-sm text-muted-foreground">
                      Build modern web applications
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a href="/products/mobile">
                    <div className="text-sm font-medium">Mobile Apps</div>
                    <p className="text-sm text-muted-foreground">
                      iOS and Android development
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### When to Use Navigation Menu

✅ **Use for:**
- Main site navigation with categories
- Mega menus with rich content
- Desktop primary navigation
- Hierarchical navigation structures

❌ **Don't use for:**
- Mobile navigation (use Sheet)
- Simple flat navigation (use links)
- Context menus (use ContextMenu)
- Dropdown actions (use DropdownMenu)

---

## Breadcrumb

### Overview

Displays the current page's location within a navigational hierarchy.

### Installation

```bash
npx shadcn-ui@latest add breadcrumb
```

### Basic Breadcrumb

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function PageBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Laptop</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### Responsive Breadcrumb

```tsx
// Show fewer levels on mobile
export function ResponsiveBreadcrumb() {
  return (
    <>
      {/* Mobile: Show only current page with back button */}
      <div className="md:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Desktop: Full breadcrumb */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/category">Category</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
```

### When to Use Breadcrumb

✅ **Use for:**
- Deep page hierarchies (3+ levels)
- E-commerce category navigation
- Documentation sites
- File/folder navigation
- Multi-step processes

❌ **Don't use for:**
- Single-level pages
- Login/auth pages
- Landing pages
- Mobile-only apps (takes too much space)

---

## Calendar & Date Picker

### Installation

```bash
npx shadcn-ui@latest add calendar
npm install react-day-picker date-fns
```

### Basic Calendar

```tsx
import { Calendar } from "@/components/ui/calendar"

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  )
}
```

### Date Picker with Popover

```tsx
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
```

### Date Range Picker

```tsx
import { DateRange } from "react-day-picker"

export function DateRangePicker() {
  const [date, setDate] = React.useState<DateRange | undefined>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
```

### When to Use Calendar/Date Picker

✅ **Use for:**
- Booking systems
- Event scheduling
- Date range filters
- Birthday/date of birth inputs
- Availability calendars

❌ **Don't use for:**
- Year-only selection (use Select)
- Far past/future dates (use Input with validation)
- Time selection (combine with time picker)

---

## Combobox

### Overview

Autocomplete input with search and selection capabilities.

### Installation

```bash
npx shadcn-ui@latest add command popover
```

### Basic Combobox

```tsx
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
]

export function Combobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### When to Use Combobox

✅ **Use for:**
- Searchable dropdowns with many options (20+)
- Tag/label selection
- Country/city selection
- User mentions
- Product search and select

❌ **Don't use for:**
- Few options (< 10) - use Select
- Multi-select (build custom with Checkbox)
- Simple text search (use Input)

---

## Component Variants Guide

### Button Variants

```tsx
// When to use each Button variant:

// Default - Primary actions
<Button variant="default">Save Changes</Button>

// Outline - Secondary actions
<Button variant="outline">Cancel</Button>

// Ghost - Tertiary actions, icon buttons
<Button variant="ghost">
  <Settings className="h-4 w-4" />
</Button>

// Link - Text links styled as buttons
<Button variant="link">Learn more</Button>

// Destructive - Delete, remove, dangerous actions
<Button variant="destructive">Delete Account</Button>

// Secondary - Alternative to outline
<Button variant="secondary">View Details</Button>
```

### Button Sizes

```tsx
// sm - Compact UI, tags, chips
<Button size="sm">Small</Button>

// default - Standard buttons
<Button size="default">Default</Button>

// lg - Hero CTAs, prominent actions
<Button size="lg">Large CTA</Button>

// icon - Icon-only buttons (must be square)
<Button size="icon">
  <X className="h-4 w-4" />
</Button>
```

### Badge Variants

```tsx
// Default - Status indicators, tags
<Badge variant="default">Active</Badge>

// Secondary - Less emphasis
<Badge variant="secondary">Draft</Badge>

// Outline - Subtle tags
<Badge variant="outline">Category</Badge>

// Destructive - Errors, warnings
<Badge variant="destructive">Error</Badge>
```

### Alert Variants

```tsx
// Default - General information
<Alert variant="default">
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>General information</AlertDescription>
</Alert>

// Destructive - Errors, critical warnings
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

---

## Best Practices Summary

### Component Selection Matrix

| Use Case | Component | Variant/Type |
|----------|-----------|--------------|
| Display data (100+ rows) | Data Table | with TanStack Table |
| Display data (< 100 rows) | Simple Table or Cards | - |
| Global search/actions | Command Palette | Dialog |
| Mobile navigation | Sheet | side="left" |
| Desktop navigation | Navigation Menu | with dropdowns |
| Location in hierarchy | Breadcrumb | - |
| Select date | Date Picker | Popover + Calendar |
| Select from many options | Combobox | searchable |
| Select from few options | Select | standard |
| Quick actions | Dropdown Menu | - |
| Contextual actions | Context Menu | right-click |
| Primary action | Button | variant="default" |
| Dangerous action | Button | variant="destructive" |
| Status indicator | Badge | variant matching state |

### Accessibility Checklist

- [ ] All interactive components keyboard accessible
- [ ] Focus visible indicators
- [ ] ARIA labels for icon-only buttons
- [ ] Semantic HTML (nav, header, main)
- [ ] Screen reader announcements
- [ ] Color contrast (4.5:1 minimum)
- [ ] Touch targets (44x44px minimum on mobile)

### Performance Tips

1. **Lazy load heavy components** (Calendar, Command Palette)
2. **Virtualize large tables** (use @tanstack/react-virtual)
3. **Memoize complex cells** in Data Tables
4. **Debounce search inputs** in Combobox
5. **Code split** Command Palette and Sheet

---

This guide covers the most advanced shadcn/ui components and their best practices. Always refer to the official [shadcn/ui documentation](https://ui.shadcn.com) for the latest updates and examples.
