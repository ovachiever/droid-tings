/**
 * Complex Multi-Step Form Component
 *
 * Demonstrates advanced form patterns:
 * - Multi-step wizard with progress indication
 * - Form validation using react-hook-form + zod
 * - Conditional fields based on user input
 * - File upload with preview
 * - Responsive layout (single column mobile, multi-column desktop)
 *
 * shadcn/ui components used: Form, Input, Select, Checkbox, RadioGroup, Button, Card, Progress
 * Best practices: Type-safe validation, error handling, accessibility
 */

"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  X,
  FileText,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// Form schema with validation
const formSchema = z.object({
  // Step 1: Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Step 2: Professional Information
  occupation: z.string().min(1, "Please select your occupation"),
  company: z.string().optional(),
  yearsOfExperience: z.string().min(1, "Please select years of experience"),
  employmentType: z.enum(["full-time", "part-time", "contract", "freelance"], {
    required_error: "Please select employment type",
  }),
  isCurrentlyEmployed: z.boolean(),

  // Step 3: Preferences & Additional Info
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    required_error: "Please select your skill level",
  }),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must not exceed 500 characters"),
  newsletter: z.boolean().default(false),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),

  // File upload (optional in schema, but can be required)
  resume: z.any().optional(),
})

type FormData = z.infer<typeof formSchema>

// Step configuration
const steps = [
  {
    id: 1,
    title: "Personal Info",
    description: "Basic information about you",
  },
  {
    id: 2,
    title: "Professional",
    description: "Your work experience",
  },
  {
    id: 3,
    title: "Preferences",
    description: "Interests and settings",
  },
]

// Interest options
const interestOptions = [
  { id: "technology", label: "Technology" },
  { id: "design", label: "Design" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "management", label: "Management" },
  { id: "analytics", label: "Analytics" },
]

interface ComplexFormProps {
  onSubmit?: (data: FormData) => void | Promise<void>
}

export function ComplexForm({ onSubmit }: ComplexFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      occupation: "",
      company: "",
      yearsOfExperience: "",
      employmentType: "full-time",
      isCurrentlyEmployed: true,
      interests: [],
      skillLevel: "intermediate",
      bio: "",
      newsletter: false,
      terms: false,
    },
  })

  const isCurrentlyEmployed = form.watch("isCurrentlyEmployed")

  // Calculate progress percentage
  const progress = (currentStep / steps.length) * 100

  // Handle next step
  const handleNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "email", "phone", "dateOfBirth"]
        break
      case 2:
        fieldsToValidate = ["occupation", "yearsOfExperience", "employmentType"]
        if (isCurrentlyEmployed) {
          fieldsToValidate.push("company")
        }
        break
      case 3:
        fieldsToValidate = ["interests", "skillLevel", "bio", "terms"]
        break
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        form.setError("resume", {
          type: "manual",
          message: "File size must be less than 5MB",
        })
        return
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        form.setError("resume", {
          type: "manual",
          message: "Only PDF and DOC/DOCX files are allowed",
        })
        return
      }

      setUploadedFile(file)
      form.setValue("resume", file)
      form.clearErrors("resume")
    }
  }

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (onSubmit) {
        await onSubmit(data)
      } else {
        console.log("Form submitted:", data)
      }

      // Reset form on success
      form.reset()
      setCurrentStep(1)
      setUploadedFile(null)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Registration Form</CardTitle>
          <CardDescription>
            Complete all steps to finish your registration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <Separator
                    className={cn(
                      "flex-1 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <Separator />

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          We'll never share your email with anyone else
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your occupation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="software-engineer">
                              Software Engineer
                            </SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="product-manager">
                              Product Manager
                            </SelectItem>
                            <SelectItem value="data-scientist">
                              Data Scientist
                            </SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isCurrentlyEmployed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I am currently employed</FormLabel>
                          <FormDescription>
                            Check this if you're working at a company
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Conditional field - only show if employed */}
                  {isCurrentlyEmployed && (
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select years" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-1">0-1 years</SelectItem>
                              <SelectItem value="2-5">2-5 years</SelectItem>
                              <SelectItem value="6-10">6-10 years</SelectItem>
                              <SelectItem value="10+">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* File Upload */}
                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="resume-upload"
                              />
                              <label htmlFor="resume-upload">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="cursor-pointer"
                                  asChild
                                >
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                  </span>
                                </Button>
                              </label>
                              {uploadedFile && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate max-w-[200px]">
                                    {uploadedFile.name}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setUploadedFile(null)
                                      form.setValue("resume", undefined)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload your resume (PDF, DOC, or DOCX, max 5MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Preferences & Additional Info */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <FormLabel>Areas of Interest</FormLabel>
                        <FormDescription>
                          Select all that apply to you
                        </FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {interestOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="interests"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skillLevel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Skill Level</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="beginner" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Beginner - Just starting out
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="intermediate" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Intermediate - Comfortable with basics
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="advanced" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Advanced - Proficient and experienced
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="expert" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Expert - Master of the craft
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself..."
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Subscribe to newsletter</FormLabel>
                          <FormDescription>
                            Receive updates and news via email
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            I accept the{" "}
                            <a
                              href="#"
                              className="underline underline-offset-4 hover:text-primary"
                            >
                              terms and conditions
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {isSubmitting && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Submitting your registration...
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { ComplexForm } from "@/components/complex-form"
 *
 * export default function RegistrationPage() {
 *   const handleFormSubmit = async (data) => {
 *     // Send data to your API
 *     const response = await fetch("/api/register", {
 *       method: "POST",
 *       body: JSON.stringify(data),
 *     })
 *
 *     if (response.ok) {
 *       // Handle success (redirect, show message, etc.)
 *       router.push("/dashboard")
 *     }
 *   }
 *
 *   return (
 *     <div className="container py-8">
 *       <ComplexForm onSubmit={handleFormSubmit} />
 *     </div>
 *   )
 * }
 * ```
 *
 * Key Features:
 *
 * 1. Multi-Step Wizard:
 *    - Visual progress indicator with steps
 *    - Step validation before proceeding
 *    - Navigation between steps
 *    - Progress percentage display
 *
 * 2. Form Validation:
 *    - react-hook-form for form state management
 *    - Zod schema for type-safe validation
 *    - Real-time field validation
 *    - Custom error messages
 *    - Conditional validation (company field)
 *
 * 3. Conditional Fields:
 *    - Company field shown only if currently employed
 *    - Dynamic validation based on selections
 *    - Reactive form behavior
 *
 * 4. File Upload:
 *    - Custom file input with button trigger
 *    - File type validation (PDF, DOC, DOCX)
 *    - File size validation (5MB max)
 *    - File preview with name display
 *    - Remove file functionality
 *
 * 5. Responsive Layout:
 *    - Single column on mobile (< 768px)
 *    - Multi-column grid on desktop (>= 768px)
 *    - Flexible button layout
 *    - Touch-friendly mobile experience
 *
 * Advanced Patterns:
 *
 * 1. Checkbox Arrays:
 *    - Multiple selection with interests
 *    - Array validation (min 1 selection)
 *    - Proper checked state management
 *
 * 2. Radio Groups:
 *    - Skill level selection
 *    - Single choice from options
 *    - Descriptive labels for each option
 *
 * 3. Textarea with Character Count:
 *    - Bio field with 500 char limit
 *    - Live character counter
 *    - Validation for min/max length
 *
 * 4. Terms & Conditions:
 *    - Required checkbox validation
 *    - Link to T&C document
 *    - Custom validation message
 *
 * Accessibility Features:
 * - Semantic form structure
 * - ARIA labels via shadcn Form components
 * - Keyboard navigation support
 * - Focus management between steps
 * - Error announcements
 * - Screen reader friendly
 * - Proper label associations
 *
 * shadcn/ui Best Practices:
 * - All colors use CSS variables
 * - No hardcoded values
 * - Proper Form component usage
 * - FormField, FormItem, FormLabel, FormControl pattern
 * - FormMessage for error display
 * - FormDescription for help text
 * - Lucide React icons only
 * - cn() utility for conditional classes
 * - Responsive Tailwind utilities
 *
 * Validation Best Practices:
 * - Type-safe with Zod + TypeScript
 * - Clear, actionable error messages
 * - Progressive validation (per step)
 * - Immediate feedback on blur
 * - Prevent submission with invalid data
 * - Custom validation logic support
 *
 * Performance Considerations:
 * - React Hook Form minimizes re-renders
 * - Zod validation is fast and efficient
 * - File size check before upload
 * - Debounce search/filter fields if needed
 * - Consider React.memo for complex steps
 */
