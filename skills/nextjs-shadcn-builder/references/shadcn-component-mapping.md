# shadcn/ui Component Mapping Reference

Complete mapping guide from common UI libraries to shadcn/ui equivalents.

## Quick Reference Table

| Common Component | shadcn/ui Equivalent | Installation | Complexity |
|------------------|---------------------|--------------|------------|
| Button | Button | `npx shadcn@latest add button` | ✅ Low |
| Card | Card | `npx shadcn@latest add card` | ✅ Low |
| Modal/Dialog | Dialog | `npx shadcn@latest add dialog` | ⚠️ Medium |
| Input | Input | `npx shadcn@latest add input` | ✅ Low |
| Select/Dropdown | Select | `npx shadcn@latest add select` | ⚠️ Medium |
| Checkbox | Checkbox | `npx shadcn@latest add checkbox` | ✅ Low |
| Radio | RadioGroup | `npx shadcn@latest add radio-group` | ✅ Low |
| Switch/Toggle | Switch | `npx shadcn@latest add switch` | ✅ Low |
| Table | Table | `npx shadcn@latest add table` | ⚠️ Medium |
| DataTable/Grid | Table + hooks | Manual implementation | 🔴 High |
| Tabs | Tabs | `npx shadcn@latest add tabs` | ✅ Low |
| Accordion | Accordion | `npx shadcn@latest add accordion` | ✅ Low |
| Tooltip | Tooltip | `npx shadcn@latest add tooltip` | ✅ Low |
| Popover | Popover | `npx shadcn@latest add popover` | ⚠️ Medium |
| Menu/Dropdown | DropdownMenu | `npx shadcn@latest add dropdown-menu` | ⚠️ Medium |
| Toast/Notification | Toast + Toaster | `npx shadcn@latest add toast` | ⚠️ Medium |
| Alert | Alert | `npx shadcn@latest add alert` | ✅ Low |
| Badge/Tag | Badge | `npx shadcn@latest add badge` | ✅ Low |
| Avatar | Avatar | `npx shadcn@latest add avatar` | ✅ Low |
| Progress | Progress | `npx shadcn@latest add progress` | ✅ Low |
| Slider | Slider | `npx shadcn@latest add slider` | ✅ Low |
| Calendar/DatePicker | Calendar | `npx shadcn@latest add calendar` | 🔴 High |
| Command Palette | Command | `npx shadcn@latest add command` | ⚠️ Medium |
| Sheet/Drawer | Sheet | `npx shadcn@latest add sheet` | ⚠️ Medium |
| Navigation | NavigationMenu | `npx shadcn@latest add navigation-menu` | ⚠️ Medium |
| Breadcrumbs | Breadcrumb | `npx shadcn@latest add breadcrumb` | ✅ Low |
| Pagination | Pagination | `npx shadcn@latest add pagination` | ✅ Low |
| Separator/Divider | Separator | `npx shadcn@latest add separator` | ✅ Low |

## Detailed Component Mappings

### Button

**From Material-UI:**
```typescript
// Old
import Button from '@mui/material/Button'
<Button variant="contained" color="primary">Click me</Button>

// New (shadcn)
import { Button } from '@/components/ui/button'
<Button variant="default">Click me</Button>
```

**From Ant Design:**
```typescript
// Old
import { Button } from 'antd'
<Button type="primary">Click me</Button>

// New (shadcn)
import { Button } from '@/components/ui/button'
<Button>Click me</Button>
```

**shadcn Button Variants:**
- `default` - Primary button
- `destructive` - Danger/delete actions
- `outline` - Secondary actions
- `secondary` - Alternative actions
- `ghost` - Minimal styling
- `link` - Text-only link

### Card

**From Bootstrap:**
```typescript
// Old
<div className="card">
  <div className="card-header">Header</div>
  <div className="card-body">Content</div>
  <div className="card-footer">Footer</div>
</div>

// New (shadcn)
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Header</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Dialog/Modal

**From Material-UI:**
```typescript
// Old
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

const [open, setOpen] = useState(false)

<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
</Dialog>

// New (shadcn)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

### Form Components

**Input:**
```typescript
// Old (Material-UI)
import TextField from '@mui/material/TextField'
<TextField label="Name" variant="outlined" />

// New (shadcn)
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div>
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
</div>
```

**Select:**
```typescript
// Old (React Select)
import Select from 'react-select'
<Select options={options} onChange={handleChange} />

// New (shadcn)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Complete Form (with react-hook-form):**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Table

**Simple Table:**
```typescript
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Data Table (Advanced):**
Use shadcn's Data Table pattern with TanStack Table for sorting, filtering, pagination.

```bash
npx shadcn@latest add table
```

Then follow: https://ui.shadcn.com/docs/components/data-table

### Toast/Notifications

**From react-toastify:**
```typescript
// Old
import { toast } from 'react-toastify'
toast.success('Success message!')

// New (shadcn)
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Success",
  description: "Success message!",
})

// Don't forget to add <Toaster /> to layout
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### DropdownMenu

**From Headless UI:**
```typescript
// Old
import { Menu } from '@headlessui/react'

<Menu>
  <Menu.Button>Options</Menu.Button>
  <Menu.Items>
    <Menu.Item>
      {({ active }) => (
        <a className={active ? 'bg-blue-500' : ''} href="/account">
          Account
        </a>
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>

// New (shadcn)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs

**From Ant Design:**
```typescript
// Old
import { Tabs } from 'antd'

<Tabs defaultActiveKey="1">
  <Tabs.TabPane tab="Tab 1" key="1">
    Content 1
  </Tabs.TabPane>
  <Tabs.TabPane tab="Tab 2" key="2">
    Content 2
  </Tabs.TabPane>
</Tabs>

// New (shadcn)
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Calendar/DatePicker

**Complex Component - Requires Composition:**

```bash
npm install react-day-picker date-fns
npx shadcn@latest add calendar
npx shadcn@latest add popover
```

```typescript
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
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

## Component Composition Patterns

### Building Custom Components from shadcn Primitives

**Example: Feature Card**
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FeatureCardProps {
  title: string
  description: string
  badge?: string
  onAction: () => void
}

export function FeatureCard({ title, description, badge, onAction }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {badge && <Badge>{badge}</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button onClick={onAction} className="w-full">
          Learn More
        </Button>
      </CardContent>
    </Card>
  )
}
```

## No Direct shadcn Equivalent

For these components, build with shadcn primitives:

### DataGrid/Advanced Table
- Use shadcn `Table` + TanStack Table
- Add sorting, filtering, pagination
- Reference: https://ui.shadcn.com/docs/components/data-table

### Charts
- Use shadcn Chart components (Recharts integration)
- `npx shadcn@latest add chart`
- Reference: https://ui.shadcn.com/docs/components/chart

### File Upload
- Build with `Button` + `Input type="file"` + `Card`
- Add drag-and-drop with react-dropzone
- Style with shadcn primitives

### Rich Text Editor
- Integrate Tiptap or similar
- Style toolbar with shadcn `Button` and `DropdownMenu`
- Use shadcn styling system

### Autocomplete
- Use `Command` component
- `npx shadcn@latest add command`
- Combine with `Popover` for dropdown

## Migration Checklist

When migrating components:

- [ ] Identify shadcn equivalent (use MCP!)
- [ ] Install component: `npx shadcn@latest add [component]`
- [ ] Review props/API differences
- [ ] Convert styling to Tailwind classes
- [ ] Remove hardcoded values
- [ ] Use CSS variables for theming
- [ ] Test functionality
- [ ] Test dark mode
- [ ] Verify accessibility

## Resources

- **Component Documentation:** https://ui.shadcn.com/docs/components
- **MCP Server:** `npx shadcn@latest mcp init --client claude`
- **Component Examples:** https://ui.shadcn.com/examples
- **Blocks (Complex Compositions):** https://ui.shadcn.com/blocks
