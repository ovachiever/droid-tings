# Vue to Next.js Migration Guide

Quick reference for migrating Vue applications to Next.js + shadcn/ui.

## Key Differences

### 1. Template Syntax → JSX

**Vue (Old):**
```vue
<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>
```

**Next.js (New):**
```typescript
export default function Component({ title, items }) {
  const handleClick = () => {
    // handler
  }

  return (
    <div className="container">
      <h1>{title}</h1>
      <button onClick={handleClick}>Click me</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 2. Reactivity → React Hooks

**Vue (Composition API):**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

**React:**
```typescript
"use client"
import { useState, useMemo } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  const doubled = useMemo(() => count * 2, [count])

  const increment = () => {
    setCount(count + 1)
  }

  return (
    <button onClick={increment}>
      Count: {count}, Doubled: {doubled}
    </button>
  )
}
```

### 3. Props

**Vue:**
```vue
<script setup>
const props = defineProps<{
  title: string
  count: number
}>()
</script>
```

**React:**
```typescript
interface Props {
  title: string
  count: number
}

export default function Component({ title, count }: Props) {
  return <div>{title}: {count}</div>
}
```

### 4. Events

**Vue:**
```vue
<script setup>
const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

function handleUpdate() {
  emit('update', 'new value')
}
</script>

<template>
  <button @click="handleUpdate">Update</button>
</template>
```

**React:**
```typescript
interface Props {
  onUpdate: (value: string) => void
}

export default function Component({ onUpdate }: Props) {
  const handleUpdate = () => {
    onUpdate('new value')
  }

  return <button onClick={handleUpdate}>Update</button>
}
```

### 5. Watchers → useEffect

**Vue:**
```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})
</script>
```

**React:**
```typescript
"use client"
import { useState, useEffect } from 'react'

export default function Component() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log(`Count is now ${count}`)
  }, [count])

  return <div>{count}</div>
}
```

### 6. Routing

**Vue Router:**
```vue
<router-link to="/about">About</router-link>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function navigate() {
  router.push('/dashboard')
}
</script>
```

**Next.js:**
```typescript
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Component() {
  const router = useRouter()

  const navigate = () => {
    router.push('/dashboard')
  }

  return (
    <>
      <Link href="/about">About</Link>
      <button onClick={navigate}>Go to Dashboard</button>
    </>
  )
}
```

## Component Structure

### Vue SFC → React Component

**Vue (.vue file):**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ChildComponent from './Child.vue'

const message = ref('Hello')
</script>

<template>
  <div class="container">
    <h1>{{ message }}</h1>
    <ChildComponent :message="message" />
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}
</style>
```

**React (.tsx file):**
```typescript
"use client"
import { useState } from 'react'
import ChildComponent from './Child'

export default function Component() {
  const [message, setMessage] = useState('Hello')

  return (
    <div className="container p-5">
      <h1>{message}</h1>
      <ChildComponent message={message} />
    </div>
  )
}
```

## Common Patterns

### v-if / v-show → Conditional Rendering

**Vue:**
```vue
<template>
  <div v-if="isVisible">Visible content</div>
  <div v-show="isShown">Shown content</div>
</template>
```

**React:**
```typescript
{isVisible && <div>Visible content</div>}
{isShown ? <div style={{ display: 'block' }}>Shown</div> : null}
```

### v-for → map()

**Vue:**
```vue
<template>
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

**React:**
```typescript
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### v-model → Controlled Components

**Vue:**
```vue
<template>
  <input v-model="text" />
</template>

<script setup>
import { ref } from 'vue'
const text = ref('')
</script>
```

**React:**
```typescript
const [text, setText] = useState('')

<input
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

## State Management

### Pinia → Zustand

**Vue (Pinia):**
```typescript
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// Component
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
counter.increment()
```

**React (Zustand):**
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

// Component
"use client"
import { useCounterStore } from '@/store'

const { count, increment } = useCounterStore()
```

## Lifecycle Hooks

| Vue | React |
|-----|-------|
| `onMounted()` | `useEffect(() => {}, [])` |
| `onUnmounted()` | `useEffect(() => { return () => {} }, [])` |
| `onUpdated()` | `useEffect(() => {})` (runs on every render) |
| `watch()` | `useEffect(() => {}, [dependency])` |
| `computed()` | `useMemo(() => {}, [dependency])` |

## Migration Checklist

- [ ] Convert `.vue` SFC to `.tsx` files
- [ ] Replace `<template>` with JSX `return` statements
- [ ] Convert `ref()` → `useState()`
- [ ] Convert `computed()` → `useMemo()`
- [ ] Convert `watch()` → `useEffect()`
- [ ] Replace Vue Router with Next.js routing
- [ ] Convert Pinia stores to Zustand
- [ ] Replace `v-if`, `v-for`, `v-model` with React equivalents
- [ ] Convert scoped styles to Tailwind classes
- [ ] Replace Vue components with shadcn/ui components
- [ ] Add `"use client"` to components with hooks
- [ ] Test all functionality

## Resources

- **React Docs:** https://react.dev
- **Next.js Docs:** https://nextjs.org/docs
- **Vue to React:** https://react.dev/learn/start-a-new-react-project
