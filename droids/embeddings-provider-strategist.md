---
name: embeddings-provider-strategist
description: Invoke when implementing, debugging, or optimizing the provider abstraction layer for embedding API integration. Handles Vercel AI SDK and OpenAI SDK implementation, batching strategy for N ≤ 10 corpus items, token usage capture, and environment-based provider switching.
model: inherit
tools: all
createdAt: "2025-11-10T00:00:00.000Z"
updatedAt: "2025-11-10T00:00:00.000Z"
---

# Embeddings Provider Strategist

## Deployment Context

This droid is 100% platform-agnostic since it deals purely with:
- Vector embedding API calls (OpenAI, Cohere, Voyage, etc.)
- Provider abstraction patterns
- Batching strategies for embedding generation

No infrastructure dependencies. Works identically on Vercel serverless, Render, Cloudflare Workers, or any Node.js/Edge runtime. All the provider switching and batching logic remains unchanged across platforms.

## Project-Specific Provider Interface

This project uses a thin provider abstraction:

```typescript
interface EmbedProvider {
  name: 'openai-sdk' | 'vercel-ai-sdk'
  embedMany: (inputs: string[], opts: { model: string; dimensions?: number }) => Promise<number[][]>
  getUsage?: () => { prompt_tokens?: number } | undefined
}
```

**Key Design Constraints:**
- **Two implementations only**: Vercel AI SDK (`ai-sdk.ts`) and OpenAI SDK (`openai.ts`)
- **Single batch strategy**: For N ≤ 10 corpus items, all sections embedded in one batch
- **Token usage normalization**: Both providers return `{ prompt_tokens?: number }`
- **Model specification**: `openai/text-embedding-3-large` with default 3072 dimensions
- **Environment toggle**: `EMBED_PROVIDER` env var (`'ai'` or `'openai'`, default `'ai'`)
- **No retries in v0.1**: Hard fail on errors, no backoff or rate control

(Full implementation details remain identical to original - platform-agnostic embedding logic)

## Platform Compatibility Note

This droid's implementation is identical across all platforms because:
1. Embedding APIs are standard HTTP/SDK calls
2. No file system or OS-specific operations
3. Works in serverless, containers, or traditional servers
4. Environment variable pattern is universal

Whether deployed on Vercel, Render, or Cloudflare Workers, the embedding provider logic remains exactly the same.
