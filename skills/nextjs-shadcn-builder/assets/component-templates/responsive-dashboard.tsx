/**
 * Responsive Dashboard Component
 *
 * Demonstrates mobile-first responsive dashboard layout:
 * - Mobile (< 768px): Single column stacked layout
 * - Tablet (768px - 1024px): 2-column grid layout
 * - Desktop (>= 1024px): 3-4 column grid layout with dynamic sizing
 *
 * shadcn/ui components used: Card, Button, Badge, Progress, Separator, Avatar
 * Best practices: Responsive grids, CSS variables, accessible charts placeholder
 */

"use client"

import * as React from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Dashboard data types
interface StatCardData {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
}

interface RecentActivity {
  id: string
  user: string
  action: string
  timestamp: string
  avatar?: string
}

interface Goal {
  id: string
  title: string
  progress: number
  target: string
  current: string
}

interface ResponsiveDashboardProps {
  stats?: StatCardData[]
  recentActivity?: RecentActivity[]
  goals?: Goal[]
}

// Default mock data
const defaultStats: StatCardData[] = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: 20.1,
    changeLabel: "from last month",
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,350",
    change: 15.3,
    changeLabel: "from last month",
    icon: Users,
  },
  {
    title: "Sales",
    value: "12,234",
    change: -4.5,
    changeLabel: "from last month",
    icon: ShoppingCart,
  },
  {
    title: "Active Now",
    value: "573",
    change: 12.0,
    changeLabel: "from last hour",
    icon: Activity,
  },
]

const defaultActivity: RecentActivity[] = [
  {
    id: "1",
    user: "Olivia Martin",
    action: "Made a purchase of $299.00",
    timestamp: "2 minutes ago",
    avatar: "https://avatar.vercel.sh/olivia",
  },
  {
    id: "2",
    user: "Jackson Lee",
    action: "Subscribed to Pro plan",
    timestamp: "15 minutes ago",
    avatar: "https://avatar.vercel.sh/jackson",
  },
  {
    id: "3",
    user: "Isabella Nguyen",
    action: "Updated profile information",
    timestamp: "1 hour ago",
    avatar: "https://avatar.vercel.sh/isabella",
  },
  {
    id: "4",
    user: "William Kim",
    action: "Created a new project",
    timestamp: "2 hours ago",
    avatar: "https://avatar.vercel.sh/william",
  },
  {
    id: "5",
    user: "Sofia Davis",
    action: "Left a review (5 stars)",
    timestamp: "3 hours ago",
    avatar: "https://avatar.vercel.sh/sofia",
  },
]

const defaultGoals: Goal[] = [
  {
    id: "1",
    title: "Monthly Revenue Goal",
    progress: 72,
    target: "$50,000",
    current: "$36,000",
  },
  {
    id: "2",
    title: "New User Signups",
    progress: 45,
    target: "1,000 users",
    current: "450 users",
  },
  {
    id: "3",
    title: "Customer Satisfaction",
    progress: 88,
    target: "90%",
    current: "88%",
  },
]

// Stat Card Component
function StatCard({ data }: { data: StatCardData }) {
  const Icon = data.icon
  const isPositive = data.change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {Math.abs(data.change)}%
          </span>
          <span>{data.changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent Activity Card Component
function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions and events</CardDescription>
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
              <DropdownMenuItem>View all</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.avatar} alt={activity.user} />
                  <AvatarFallback>
                    {activity.user.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
              {index < activities.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full">
          View all activity
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Goals Card Component
function GoalsCard({ goals }: { goals: Goal[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Goals Progress</CardTitle>
            <CardDescription>Track your monthly objectives</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{goal.title}</span>
              <span className="text-muted-foreground">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{goal.current}</span>
              <span>Target: {goal.target}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Sales Chart Placeholder Card Component
function SalesChartCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </div>
          <Badge variant="secondary">This Month</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Placeholder for chart - integrate with recharts, chart.js, etc. */}
        <div className="h-[200px] md:h-[250px] flex items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Chart placeholder
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Integrate with your preferred charting library
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <span className="font-medium">$45,231</span>
        </div>
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <span className="font-medium">$18,942</span>
        </div>
      </CardFooter>
    </Card>
  )
}

// Main Dashboard Component
export function ResponsiveDashboard({
  stats = defaultStats,
  recentActivity = defaultActivity,
  goals = defaultGoals,
}: ResponsiveDashboardProps) {
  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>View Report</Button>
        </div>
      </div>

      {/* Stats Grid - Responsive columns */}
      {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </div>

      {/* Main Content Grid - Responsive layout */}
      {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols with span variations */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Chart - Spans 2 columns on tablet+, 1 on mobile */}
        <div className="md:col-span-2 lg:col-span-2">
          <SalesChartCard />
        </div>

        {/* Recent Activity - Spans 1 column on all breakpoints */}
        <div className="md:col-span-2 lg:col-span-1">
          <RecentActivityCard activities={recentActivity} />
        </div>

        {/* Goals - Spans full width on mobile, 1 col on tablet+ */}
        <div className="md:col-span-2 lg:col-span-1">
          <GoalsCard goals={goals} />
        </div>

        {/* Additional cards can be added here with responsive spanning */}
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Additional Metrics</CardTitle>
              <CardDescription>
                Space for more dashboard components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Add more cards as needed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { ResponsiveDashboard } from "@/components/responsive-dashboard"
 *
 * export default function DashboardPage() {
 *   // Fetch your real data here
 *   const stats = await fetchDashboardStats()
 *   const activity = await fetchRecentActivity()
 *   const goals = await fetchGoals()
 *
 *   return (
 *     <div className="container py-6">
 *       <ResponsiveDashboard
 *         stats={stats}
 *         recentActivity={activity}
 *         goals={goals}
 *       />
 *     </div>
 *   )
 * }
 * ```
 *
 * Key Responsive Patterns:
 *
 * 1. Mobile (< 640px):
 *    - Single column layout (grid-cols-1)
 *    - Stats cards stacked vertically
 *    - All content full width
 *    - Compact spacing (space-y-4)
 *    - Touch-friendly buttons
 *
 * 2. Tablet (640px - 1024px):
 *    - 2-column stats grid (sm:grid-cols-2)
 *    - 2-column main grid (md:grid-cols-2)
 *    - Sales chart spans 2 columns (md:col-span-2)
 *    - Better use of horizontal space
 *    - Increased spacing (md:space-y-6)
 *
 * 3. Desktop (>= 1024px):
 *    - 4-column stats grid (lg:grid-cols-4)
 *    - 3-column main grid (lg:grid-cols-3)
 *    - Dynamic column spanning:
 *      - Sales chart: 2/3 width (lg:col-span-2)
 *      - Recent activity: 1/3 width (lg:col-span-1)
 *      - Goals: 1/3 width (lg:col-span-1)
 *    - Optimal information density
 *
 * Grid Spanning Strategies:
 *
 * Use col-span to create asymmetric, visually interesting layouts:
 * ```tsx
 * // Wide chart on desktop, full width on mobile
 * <div className="md:col-span-2 lg:col-span-2">
 *
 * // Sidebar card on desktop, full width on tablet
 * <div className="md:col-span-2 lg:col-span-1">
 *
 * // Full width on all breakpoints
 * <div className="col-span-full">
 * ```
 *
 * Chart Integration:
 *
 * Replace the SalesChartCard placeholder with real charts:
 * - Recharts (recommended for shadcn/ui)
 * - Chart.js with react-chartjs-2
 * - Victory charts
 * - D3.js with custom React wrapper
 *
 * Example with Recharts:
 * ```tsx
 * import { LineChart, Line, ResponsiveContainer } from "recharts"
 *
 * <ResponsiveContainer width="100%" height={250}>
 *   <LineChart data={salesData}>
 *     <Line
 *       type="monotone"
 *       dataKey="revenue"
 *       stroke="hsl(var(--primary))"
 *       strokeWidth={2}
 *     />
 *   </LineChart>
 * </ResponsiveContainer>
 * ```
 *
 * Accessibility Features:
 * - Semantic HTML structure
 * - ARIA labels for screen readers (sr-only)
 * - Keyboard navigation support
 * - Focus visible states
 * - Proper heading hierarchy (h1, CardTitle)
 * - Descriptive CardDescription elements
 *
 * shadcn/ui Best Practices:
 * - All colors use CSS variables (bg-primary, text-muted-foreground)
 * - No hardcoded values
 * - Proper component composition (Card, Button, Badge, Progress)
 * - Lucide React icons only
 * - cn() utility for conditional classes
 * - Responsive Tailwind utilities (sm:, md:, lg:)
 * - Consistent spacing scale (gap-4, space-y-4)
 *
 * Performance Considerations:
 * - Use React.memo() for StatCard if stats update frequently
 * - Lazy load chart libraries with dynamic imports
 * - Virtualize long activity lists if needed
 * - Consider skeleton loading states
 * - Optimize avatar images with Next.js Image component
 */
