/**
 * Example Feature Card Component
 *
 * Demonstrates shadcn/ui best practices:
 * - Uses standard shadcn components (Card, Button, Badge)
 * - No hardcoded colors or spacing
 * - CSS variables via Tailwind classes
 * - Proper TypeScript types
 * - Clean composition pattern
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface Feature {
  id: string
  title: string
  description: string
  category: string
  status: "active" | "beta" | "coming-soon"
}

interface FeatureCardProps {
  feature: Feature
  onLearnMore?: (featureId: string) => void
}

export function FeatureCard({ feature, onLearnMore }: FeatureCardProps) {
  const statusVariant = {
    active: "default" as const,
    beta: "secondary" as const,
    "coming-soon": "outline" as const,
  }

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{feature.title}</CardTitle>
            <CardDescription>{feature.category}</CardDescription>
          </div>
          <Badge variant={statusVariant[feature.status]}>
            {feature.status.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onLearnMore?.(feature.id)}
          variant="default"
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Usage Example:
 *
 * const features: Feature[] = [
 *   {
 *     id: "1",
 *     title: "Dark Mode",
 *     description: "Automatic dark mode support with theme toggle",
 *     category: "Theming",
 *     status: "active"
 *   }
 * ]
 *
 * <FeatureCard
 *   feature={features[0]}
 *   onLearnMore={(id) => console.log(`Learning about ${id}`)}
 * />
 */
