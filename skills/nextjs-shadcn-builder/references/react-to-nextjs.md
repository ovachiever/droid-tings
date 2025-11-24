# React to Next.js Migration Guide

Comprehensive guide for migrating React applications to Next.js 15+ with App Router.

## Overview

This guide covers migrating from:
- Create React App (CRA)
- Vite + React
- Custom React setups
- React Router → Next.js App Router

## Key Differences

### 1. File-Based Routing

**React Router (Old):**
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Next.js App Router (New):**
```
app/
  page.tsx              # / route
  about/
    page.tsx            # /about route
  users/
    [id]/
      page.tsx          # /users/:id route
```

### 2. Client vs Server Components

**React (Old):**
All components are client-side by default.

**Next.js (New):**
- Server Components by default (no `"use client"`)
- Add `"use client"` for interactivity

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}

// Client Component (needs "use client")
"use client"
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 3. Data Fetching

**React (Old) - useEffect:**
```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])

  return <div>{user?.name}</div>
}
```

**Next.js (New) - Server Components:**
```typescript
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetch(`https://api.example.com/users/${userId}`)
    .then(res => res.json())

  return <div>{user.name}</div>
}
```

**Or use TanStack Query (Client Components):**
```typescript
"use client"
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json())
  })

  return <div>{user?.name}</div>
}
```

## Migration Patterns

### Navigation

**Old (React Router):**
```typescript
import { useNavigate, Link } from 'react-router-dom'

function Component() {
  const navigate = useNavigate()

  return (
    <div>
      <Link to="/about">About</Link>
      <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  )
}
```

**New (Next.js):**
```typescript
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function Component() {
  const router = useRouter()

  return (
    <div>
      <Link href="/about">About</Link>
      <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
    </div>
  )
}
```

### Layouts

**Old (React Router):**
```typescript
function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

// Used in routes manually
```

**New (Next.js):**
```typescript
// app/layout.tsx - Applies to all routes
export default function RootLayout({ children }: { children: React.NodeNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

// Nested layouts
// app/dashboard/layout.tsx - Applies to /dashboard/* routes
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
```

### Route Parameters

**Old (React Router):**
```typescript
import { useParams } from 'react-router-dom'

function UserDetail() {
  const { id } = useParams()
  return <div>User ID: {id}</div>
}
```

**New (Next.js):**
```typescript
// app/users/[id]/page.tsx
export default function UserDetail({ params }: { params: { id: string } }) {
  return <div>User ID: {params.id}</div>
}
```

### Search Params

**Old (React Router):**
```typescript
import { useSearchParams } from 'react-router-dom'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')

  return (
    <div>
      <input
        value={query || ''}
        onChange={(e) => setSearchParams({ q: e.target.value })}
      />
    </div>
  )
}
```

**New (Next.js):**
```typescript
"use client"
import { useSearchParams, useRouter } from 'next/navigation'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q')

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <input
        value={query || ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
```

### Environment Variables

**Old (CRA):**
```
REACT_APP_API_URL=https://api.example.com
```

**New (Next.js):**
```
# Public (accessible in browser)
NEXT_PUBLIC_API_URL=https://api.example.com

# Private (server-side only)
DATABASE_URL=postgresql://...
```

### Image Optimization

**Old:**
```typescript
<img src="/images/photo.jpg" alt="Photo" />
```

**New (Next.js Image):**
```typescript
import Image from 'next/image'

<Image
  src="/images/photo.jpg"
  alt="Photo"
  width={500}
  height={300}
/>
```

### Metadata (SEO)

**Old (react-helmet):**
```typescript
import { Helmet } from 'react-helmet'

function Page() {
  return (
    <>
      <Helmet>
        <title>My Page</title>
        <meta name="description" content="Page description" />
      </Helmet>
      <div>Content</div>
    </>
  )
}
```

**New (Next.js Metadata):**
```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Page',
  description: 'Page description',
}

export default function Page() {
  return <div>Content</div>
}
```

## State Management Migration

### Redux → Zustand (Recommended)

**Old (Redux):**
```typescript
// store.ts
import { createStore } from 'redux'

const initialState = { count: 0 }

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }
    default:
      return state
  }
}

export const store = createStore(reducer)
```

**New (Zustand):**
```typescript
// store.ts
import { create } from 'zustand'

interface CounterStore {
  count: number
  increment: () => void
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// Usage
"use client"
import { useCounterStore } from '@/store'

export default function Counter() {
  const { count, increment } = useCounterStore()
  return <button onClick={increment}>{count}</button>
}
```

### Context API (Still Works)

**Remains the same, but mark as client component:**

```typescript
"use client"
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext<string>('light')

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## Testing Migration

### Jest Configuration

**Update jest.config.js:**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

## Common Gotchas

### 1. All Components are Server Components by Default
- Add `"use client"` when you need hooks (useState, useEffect, etc.)
- Add `"use client"` when you need browser APIs
- Add `"use client"` when you need event handlers

### 2. Cannot Use Hooks in Server Components
```typescript
// ❌ WRONG
export default function Page() {
  const [state, setState] = useState(0) // Error!
  return <div>{state}</div>
}

// ✅ RIGHT
"use client"
export default function Page() {
  const [state, setState] = useState(0)
  return <div>{state}</div>
}
```

### 3. Async Components Must Be Server Components
```typescript
// ✅ Server Component (no "use client")
export default async function Page() {
  const data = await fetch('...')
  return <div>{data}</div>
}

// ❌ Cannot be async with "use client"
"use client"
export default async function Page() {  // Error!
  const data = await fetch('...')
  return <div>{data}</div>
}
```

### 4. Import Paths
Update all absolute imports to use `@/`:
```typescript
// Old
import { Button } from 'components/Button'

// New
import { Button } from '@/components/Button'
```

## Checklist

- [ ] Convert routing from React Router to file-based
- [ ] Add `"use client"` to components with hooks/interactivity
- [ ] Update navigation (useNavigate → useRouter)
- [ ] Update Links (react-router Link → next/link)
- [ ] Update environment variables (REACT_APP_ → NEXT_PUBLIC_)
- [ ] Update image imports (img → next/image)
- [ ] Update metadata (react-helmet → Next.js metadata)
- [ ] Update data fetching (useEffect → Server Components or TanStack Query)
- [ ] Update absolute imports to @/ alias
- [ ] Update testing configuration
