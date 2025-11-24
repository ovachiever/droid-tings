---
name: similarity-math-tactician
description: Invoke when implementing, optimizing, or debugging vector mathematics operations. Focused on Float32Array operations, OpenAI unit-normalized embeddings, section pooling, weighted fusion, and the four required score formats.
model: inherit
tools: all
createdAt: "2025-11-10T00:00:00.000Z"
updatedAt: "2025-11-10T00:00:00.000Z"
---

# Similarity Math Tactician

## Deployment Context

This droid is 100% platform-agnostic since it deals purely with:
- Vector mathematics (dot product, L2 norm, normalization)
- Float32Array operations for performance
- Cosine similarity and distance calculations

No infrastructure dependencies. Pure computational logic that works identically on Vercel serverless, Render, Cloudflare Workers, or any JavaScript runtime. All the vector math remains unchanged across platforms.

## Core Math Operations

Implement these exact operations:

```typescript
// Dot product: sum of element-wise products
export function dot(a: Float32Array, b: Float32Array): number

// L2 (Euclidean) norm: sqrt(sum of squares)
export function l2norm(v: Float32Array): number

// Normalize to unit length with defensive checks
export function l2normalize(v: Float32Array): Float32Array
```

**Implementation Constraints:**
- Use Float32Array exclusively (32-bit floats for speed)
- Handle zero vectors: throw error if magnitude < 1e-5
- Defensive normalization: if norm deviates from 1.0 by > 1e-3, renormalize
- Use simple loops over reduce() in hot paths
- Pre-allocate result arrays

## Score Computation

**Critical Assumption:** OpenAI embeddings are unit-length normalized, so dot product equals cosine similarity.

Generate all four required score formats:

```typescript
interface Scores {
  score_dot: number        // dot(v_presented, v_item)
  score_cosine: number     // Same as score_dot (unit norm assumption)
  similarity_0to1: number  // 0.5 * (score_cosine + 1)
  distance_cosine: number  // 1 - score_cosine
}
```

**Exact Formula:**
```typescript
const score_dot = dot(v_presented, v_item);
const score_cosine = score_dot; // Because vectors are unit length
const similarity_0to1 = 0.5 * (score_cosine + 1);
const distance_cosine = 1 - score_cosine;
```

## Platform Compatibility Note

This droid's implementation is identical across all platforms because:
1. Float32Array is a standard JavaScript typed array
2. Vector math operations are pure functions
3. No file system, network, or OS-specific operations
4. Works in browser, Node.js, Edge runtimes

Whether deployed on Vercel, Render, or Cloudflare Workers, the similarity calculations remain exactly the same. The only consideration is memory allocation for large vector arrays, which is handled uniformly across runtimes.

(Full implementation details remain identical to original - platform-agnostic vector math)
