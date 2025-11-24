/**
 * Example User Profile Component
 *
 * Demonstrates:
 * - Complex component composition with shadcn primitives
 * - Avatar, Badge, Button, Card usage
 * - Responsive design with Tailwind
 * - No hardcoded values
 * - Semantic color usage
 */

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, MapPin, Calendar } from "lucide-react"

interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    location: string
    joinedDate: string
    isVerified: boolean
  }
  onMessage?: () => void
  onViewProfile?: () => void
}

export function UserProfile({ user, onMessage, onViewProfile }: UserProfileProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              {user.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">{user.role}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{user.email}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{user.location}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Joined {new Date(user.joinedDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={onMessage}
          >
            <Mail className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onViewProfile}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Usage Example:
 *
 * const user = {
 *   id: "1",
 *   name: "Jane Doe",
 *   email: "jane@example.com",
 *   avatar: "https://github.com/janedoe.png",
 *   role: "Senior Developer",
 *   location: "San Francisco, CA",
 *   joinedDate: "2024-01-15",
 *   isVerified: true
 * }
 *
 * <UserProfile
 *   user={user}
 *   onMessage={() => console.log("Send message")}
 *   onViewProfile={() => console.log("View profile")}
 * />
 */
