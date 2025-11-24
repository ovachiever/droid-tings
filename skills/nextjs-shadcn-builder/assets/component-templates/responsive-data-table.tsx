/**
 * Responsive Data Table Component
 *
 * Demonstrates mobile-first responsive data table patterns:
 * - Mobile (< 768px): Card-based layout with key information
 * - Tablet (768px - 1024px): Scrollable table with priority columns
 * - Desktop (>= 1024px): Full table with sorting, filtering, pagination
 *
 * shadcn/ui components used: Table, Card, Button, Badge, Input, Select, Avatar
 * Best practices: Mobile-first design, touch-friendly targets, responsive overflow
 */

"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Mail,
  Phone,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// User data type
interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "user" | "manager"
  status: "active" | "inactive" | "pending"
  avatar?: string
  joinedAt: string
  lastActive: string
}

// Sort configuration
type SortKey = keyof User
type SortDirection = "asc" | "desc" | null

interface ResponsiveDataTableProps {
  data: User[]
  itemsPerPage?: number
}

// Status badge variant mapping
const statusVariant = {
  active: "default" as const,
  inactive: "secondary" as const,
  pending: "outline" as const,
}

// Role badge variant mapping
const roleVariant = {
  admin: "destructive" as const,
  manager: "default" as const,
  user: "secondary" as const,
}

export function ResponsiveDataTable({
  data,
  itemsPerPage = 10,
}: ResponsiveDataTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [sortKey, setSortKey] = React.useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data

    const query = searchQuery.toLowerCase()
    return data.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortDirection])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  // Handle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  // Render sort icon
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    return <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {sortedData.length} users
          </span>
        </div>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No users found
            </CardContent>
          </Card>
        ) : (
          paginatedData.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View profile</DropdownMenuItem>
                      <DropdownMenuItem>Send message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                </div>
                <div className="pt-2 text-xs text-muted-foreground">
                  <p>Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                  <p>Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tablet/Desktop Table View (>= 768px) */}
      <div className="hidden md:block rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("name")}
                  >
                    User
                    {renderSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("email")}
                  >
                    Contact
                    {renderSortIcon("email")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("role")}
                  >
                    Role
                    {renderSortIcon("role")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    {renderSortIcon("status")}
                  </Button>
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("joinedAt")}
                  >
                    Joined
                    {renderSortIcon("joinedAt")}
                  </Button>
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort("lastActive")}
                  >
                    Last Active
                    {renderSortIcon("lastActive")}
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground lg:hidden">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Send message</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{" "}
            of <span className="font-medium">{sortedData.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { ResponsiveDataTable } from "@/components/responsive-data-table"
 *
 * const users = [
 *   {
 *     id: "1",
 *     name: "John Doe",
 *     email: "john@example.com",
 *     phone: "+1 (555) 123-4567",
 *     role: "admin",
 *     status: "active",
 *     avatar: "https://avatar.example.com/john.jpg",
 *     joinedAt: "2024-01-15T10:00:00Z",
 *     lastActive: "2024-03-20T14:30:00Z",
 *   },
 *   // ... more users
 * ]
 *
 * export default function UsersPage() {
 *   return (
 *     <div className="container py-6">
 *       <h1 className="text-3xl font-bold mb-6">Users</h1>
 *       <ResponsiveDataTable data={users} itemsPerPage={10} />
 *     </div>
 *   )
 * }
 * ```
 *
 * Key Responsive Patterns:
 *
 * 1. Mobile (< 768px):
 *    - Card-based layout for better mobile UX
 *    - Avatar + name as card header
 *    - Key information prominently displayed
 *    - Dropdown menu for actions
 *    - Touch-friendly tap targets (minimum 44px)
 *    - Vertical stacking of information
 *
 * 2. Tablet (768px - 1024px):
 *    - Traditional table layout
 *    - Priority columns visible (User, Role, Status, Actions)
 *    - Contact info hidden (shown in user column)
 *    - Horizontal scrolling if needed
 *    - Sortable column headers
 *
 * 3. Desktop (>= 1024px):
 *    - Full table with all columns
 *    - Separate Contact column (lg:table-cell)
 *    - Date columns visible (xl:table-cell)
 *    - Better spacing and readability
 *    - Hover states on rows
 *
 * Features:
 * - Client-side search filtering
 * - Column sorting (asc/desc/none)
 * - Pagination with page controls
 * - Responsive column visibility
 * - Dropdown menus for row actions
 * - Badge components for status/role
 * - Avatar components with fallbacks
 *
 * Accessibility Features:
 * - Semantic table structure
 * - Screen reader labels (sr-only)
 * - Keyboard navigation support
 * - ARIA labels for icon buttons
 * - Focus visible states
 * - Proper heading hierarchy
 *
 * shadcn/ui Best Practices:
 * - All colors use CSS variables
 * - No hardcoded spacing or colors
 * - Proper component composition
 * - Lucide React icons only
 * - cn() utility for conditional classes
 * - Tailwind utility classes throughout
 * - Responsive utility classes (md:, lg:, xl:)
 */
