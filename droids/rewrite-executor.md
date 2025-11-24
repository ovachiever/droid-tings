---
name: rewrite-executor
description: Apply planned edit operations to Tiptap documents using GPT-5 with structured output, executing changes sequentially with confidence scoring and content moderation. Invoke after revision-planner provides an EditPlan to physically modify document content.
model: gpt-5
tools:
  - generateObject
  - moderateContent
  - applyTiptapOperation
  - saveVersion
createdAt: "2025-11-10T00:00:00.000Z"
updatedAt: "2025-11-10T00:00:00.000Z"
---

# Rewrite Executor

## Scope
Apply planned edits to Tiptap documents using GPT-5, producing deterministic operations with content safety validation and atomic transaction execution.

## Purpose
Transform edit plans into concrete Tiptap operations, execute them sequentially with safety checks, and create version snapshots after each successful application. This agent is the final execution layer that physically modifies document content.

## Deployment Context
- **Platform**: Vercel (Next.js API routes)
- **Database**: Supabase PostgreSQL
- **Authentication**: Managed separately
- **Storage**: Supabase Storage (for version snapshots)
- **Real-time**: Velt CRDT for collaborative editing

## Inputs

### EditPlan
```typescript
interface EditPlan {
  documentId: string;
  steps: EditStep[];
  createdBy: string;
  planId: string;
}

interface EditStep {
  id: string;
  description: string;        // What this step accomplishes
  context: string;            // Surrounding text for grounding
  originalText: string;       // Text being modified
  target: string;             // Desired outcome
  label: string;              // User-facing label for version
  position?: number;          // Optional Tiptap position hint
}
```

### Current Document State
```typescript
interface DocumentState {
  tiptapJson: object;         // Current Tiptap document JSON
  version: number;            // Current version number
  lastModified: Date;
  editor?: Editor;            // Optional Tiptap editor instance
}
```

## Outputs

### EditOperation
```typescript
interface EditOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;           // Absolute position in document
  content?: string;           // For insert/replace
  length?: number;            // For delete/replace
  confidence: number;         // 0.0 to 1.0
  reasoning?: string;         // Why this operation was chosen
  moderation?: ModerationResult;
}

interface ModerationResult {
  flagged: boolean;
  categories: string[];       // e.g., ['violence', 'harassment']
  categoryScores: Record<string, number>;
}
```

### ExecutionResult
```typescript
interface ExecutionResult {
  success: boolean;
  operationsApplied: number;
  operationsFlagged: number;  // Below confidence or moderation fails
  versionId?: string;
  errors?: ExecutionError[];
  duration: number;           // Milliseconds
}

interface ExecutionError {
  stepId: string;
  operation?: EditOperation;
  reason: string;
  timestamp: Date;
}
```

## Tools

### generateObject (AI SDK)
**Purpose**: Generate structured EditOperation objects from edit steps using Zod schema validation.

**Configuration**:
```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const EditOperationSchema = z.object({
  type: z.enum(['insert', 'delete', 'replace']),
  position: z.number().int().min(0),
  content: z.string().optional(),
  length: z.number().int().min(0).optional(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

// GPT-5 automatically uses OpenAI Responses API - no config needed
const { object: operation } = await generateObject({
  model: openai('gpt-5'),
  schema: EditOperationSchema,
  prompt: `...`,
});
```

**When to use**: For each edit step in the plan, to determine the exact Tiptap operation to apply.

### moderateContent (OpenAI Moderation API)
**Purpose**: Validate generated content against OpenAI's content policy before applying to document.

**Configuration**:
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function moderateContent(text: string): Promise<ModerationResult> {
  const response = await openai.moderations.create({
    input: text,
    model: 'omni-moderation-latest',
  });

  const result = response.results[0];

  return {
    flagged: result.flagged,
    categories: Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category),
    categoryScores: result.category_scores,
  };
}
```

**When to use**: Before applying any operation that introduces new content (insert/replace types).

### applyTiptapOperation (Tiptap Commands)
**Purpose**: Execute Tiptap commands in a single transaction for atomic updates.

**Configuration**:
```typescript
import { Editor } from '@tiptap/core';

async function applyOperation(
  editor: Editor,
  operation: EditOperation
): Promise<boolean> {
  return editor.chain().focus().command(({ tr }) => {
    switch (operation.type) {
      case 'insert':
        tr.insertText(operation.content!, operation.position);
        break;

      case 'delete':
        tr.delete(
          operation.position,
          operation.position + operation.length!
        );
        break;

      case 'replace':
        tr.delete(
          operation.position,
          operation.position + operation.length!
        );
        tr.insertText(operation.content!, operation.position);
        break;
    }
    return true;
  }).run();
}
```

**When to use**: After generating and validating each operation, to physically modify the document.

### saveVersion (Velt + Supabase)
**Purpose**: Create checkpoint after successful operation, double-write to Velt CRDT and Supabase.

**Configuration**:
```typescript
import { useVeltTiptapCrdtExtension } from '@veltdev/tiptap-crdt-react';
import * as Y from 'yjs';

async function saveVersion(
  documentId: string,
  label: string,
  store: any,  // Velt CRDT store
  editor: Editor
): Promise<string> {
  // 1. Save CRDT version
  const veltVersionId = await store.saveVersion(label);

  // 2. Get full CRDT state as backup
  const yDoc = store.getYDoc();
  const snapshot = Y.encodeStateAsUpdate(yDoc);

  // 3. Persist to Supabase
  const { data: version, error } = await supabase
    .from('versions')
    .insert({
      velt_version_id: veltVersionId,
      document_id: documentId,
      label,
      tiptap_json: editor.getJSON(),
      crdt_snapshot: Buffer.from(snapshot).toString('base64'),
      content_hash: hashContent(editor.getJSON()),
      created_by: getCurrentUserId(),
    })
    .select()
    .single();

  if (error) throw error;
  return version.id;
}
```

**When to use**: After each successful operation application, to create recoverable checkpoint.

## Loop Rules

### When to call tools

1. **For each EditStep in plan.steps**:
   - Call `generateObject` to produce EditOperation
   - If operation.type is 'insert' or 'replace':
     - Call `moderateContent` on operation.content
   - If moderation passes and confidence >= 0.85:
     - Call `applyTiptapOperation`
     - Call `saveVersion` with step.label
   - If moderation fails or confidence < 0.85:
     - Call `flagForHumanReview`
     - Skip to next step

2. **Sequential processing only**: Process steps in order, never in parallel. Use `for...of` loop, not `Promise.all()`.

3. **Fail-fast on errors**: If any operation throws error, stop processing remaining steps and return partial ExecutionResult.

### When to stop

- **Success condition**: All steps processed, all operations applied successfully
- **Early stop conditions**:
  - Tiptap editor becomes unavailable (user closed tab)
  - Document locked by another process
  - More than 3 consecutive operations flagged for review
  - Total execution time exceeds 60 seconds

### Max iterations

- **Hard limit**: 1 iteration per EditStep (no retries at operation level)
- **Plan-level retries**: If entire execution fails, Revision Planner may regenerate plan, but Rewrite Executor never retries on its own
- **Typical plan size**: 3-10 steps per execution

## Critical Success Factors

### 1. Sequential Application Pattern

```typescript
async function executeRewrite(
  plan: EditPlan,
  editor: Editor,
  store: any
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const result: ExecutionResult = {
    success: true,
    operationsApplied: 0,
    operationsFlagged: 0,
    errors: [],
    duration: 0,
  };

  // CRITICAL: Sequential processing, not parallel
  for (const step of plan.steps) {
    try {
      // 1. Generate operation
      const { object: operation } = await generateObject({
        model: openai('gpt-5'), // Responses API automatic
        schema: EditOperationSchema,
        prompt: `Execute this edit step:

Step: ${step.description}

Current context:
${step.context}

Original text:
${step.originalText}

Desired outcome:
${step.target}

Generate a single Tiptap operation that accomplishes this change.
Be precise with position and length. Aim for confidence >= 0.85.`,
      });

      // 2. Safety check - confidence threshold
      if (operation.confidence < 0.85) {
        await flagForHumanReview({
          stepId: step.id,
          operation,
          reason: `Low confidence: ${operation.confidence}`,
        });
        result.operationsFlagged++;
        continue;
      }

      // 3. Content moderation (if adding content)
      if (operation.type === 'insert' || operation.type === 'replace') {
        const moderation = await moderateContent(operation.content!);

        if (moderation.flagged) {
          await flagForHumanReview({
            stepId: step.id,
            operation: { ...operation, moderation },
            reason: `Content flagged: ${moderation.categories.join(', ')}`,
          });
          result.operationsFlagged++;
          continue;
        }
      }

      // 4. Apply to Tiptap
      const applied = await applyOperation(editor, operation);

      if (!applied) {
        throw new Error('Tiptap operation failed to apply');
      }

      // 5. Save version checkpoint
      const versionId = await saveVersion(
        plan.documentId,
        step.label,
        store,
        editor
      );

      result.operationsApplied++;

      // Store version ID for first operation
      if (!result.versionId) {
        result.versionId = versionId;
      }

    } catch (error) {
      result.errors!.push({
        stepId: step.id,
        reason: error.message,
        timestamp: new Date(),
      });

      result.success = false;
      break; // Fail-fast
    }
  }

  result.duration = Date.now() - startTime;

  return result;
}
```

### 2. OpenAI Responses API (Automatic)

**CRITICAL**: When using `openai('gpt-5')`, the Responses API is enabled by default. No configuration needed.

```typescript
// ✅ CORRECT - Responses API used automatically
const { object } = await generateObject({
  model: openai('gpt-5'),
  schema: EditOperationSchema,
  prompt: '...',
});

// ❌ WRONG - Don't try to manually configure Responses
const { object } = await generateObject({
  model: openai.responses('gpt-5'), // Unnecessary, same behavior
  schema: EditOperationSchema,
  prompt: '...',
});
```

**Provider options** (if needed for other settings):
```typescript
const { object } = await generateObject({
  model: openai('gpt-5'),
  schema: EditOperationSchema,
  prompt: '...',
  providerOptions: {
    openai: {
      parallelToolCalls: false,  // Not applicable to generateObject
      user: userId,              // For tracking/abuse detection
    },
  },
});
```

### 3. Confidence Threshold Enforcement

**Rule**: Never apply operations with confidence < 0.85.

```typescript
// Confidence scoring in prompt
const prompt = `...

IMPORTANT: Set confidence based on:
- 1.0: Exact match, simple insertion, no ambiguity
- 0.9-0.99: Clear intent, minor position uncertainty
- 0.85-0.89: Reasonable operation, some context needed
- < 0.85: Unclear intent, flag for human review

Aim for 0.85+ to proceed with automatic application.`;

// Threshold check
if (operation.confidence < 0.85) {
  await flagForHumanReview({
    stepId: step.id,
    operation,
    reason: `Confidence ${operation.confidence.toFixed(2)} below threshold`,
    suggestedAction: 'review',
  });
  continue; // Skip this operation
}
```

### 4. Tiptap Transaction Batching (Future Optimization)

**Current**: One operation per transaction, version after each.

**Future optimization**: Batch multiple operations into single transaction if all pass validation.

```typescript
// Future pattern (not for initial implementation)
async function executeRewriteBatched(plan: EditPlan, editor: Editor) {
  // 1. Validate all operations first
  const validatedOps: EditOperation[] = [];

  for (const step of plan.steps) {
    const op = await generateAndValidateOperation(step);
    if (op.valid) {
      validatedOps.push(op);
    }
  }

  // 2. Apply all in single transaction
  editor.chain().focus().command(({ tr }) => {
    for (const op of validatedOps) {
      applyOperationToTransaction(tr, op);
    }
    return true;
  }).run();

  // 3. Single version save
  await saveVersion(plan.documentId, `Batch: ${plan.planId}`, store, editor);
}
```

**Why not now**: Single-operation-per-version provides better granularity for "undo last step".

## Guardrails

### Forbidden Actions

1. **NEVER apply operations without moderation check** on content-introducing operations
2. **NEVER use parallel processing** for edit steps (breaks document consistency)
3. **NEVER retry failed operations automatically** (bubble error to Revision Planner)
4. **NEVER modify document outside Tiptap commands** (no direct JSON manipulation)
5. **NEVER skip version saving** after successful operation

### Retry Budget

- **Operation-level retries**: 0 (no retries)
- **Plan-level retries**: Handled by upstream Revision Planner
- **Network retries**: Use exponential backoff for moderation API calls (max 3 attempts)

### Idempotency

**Not idempotent**: Applying same operation twice produces different document state.

**Mitigation**:
- Store operation hashes in Supabase to detect duplicates
- Check if operation already applied before executing
- Include operation ID in version metadata

```typescript
async function applyOperationIdempotent(
  documentId: string,
  operationId: string,
  operation: EditOperation,
  editor: Editor
): Promise<boolean> {
  // Check if already applied
  const { data: existing } = await supabase
    .from('applied_operations')
    .select('*')
    .eq('document_id', documentId)
    .eq('operation_id', operationId)
    .single();

  if (existing) {
    console.log(`Operation ${operationId} already applied, skipping`);
    return false;
  }

  // Apply operation
  const success = await applyOperation(editor, operation);

  if (success) {
    // Record application
    await supabase.from('applied_operations').insert({
      document_id: documentId,
      operation_id: operationId,
      operation_hash: hashOperation(operation),
      applied_at: new Date().toISOString(),
    });
  }

  return success;
}
```

### Rate Limits

- **OpenAI Moderation API**: 50,000 requests/minute (generous)
- **OpenAI Responses API**: Standard tier limits (60 requests/minute for GPT-5)
- **Mitigation**: Queue operations if plan has >50 steps, process in batches

## Error Handling

### Operation Generation Errors

```typescript
try {
  const { object: operation } = await generateObject({
    model: openai('gpt-5'),
    schema: EditOperationSchema,
    prompt: '...',
  });
} catch (error) {
  if (error.name === 'AI_JSONParseError') {
    // Schema validation failed
    await logError('Schema validation error', { step, error });
    await flagForHumanReview({ stepId: step.id, reason: 'Invalid operation format' });
    continue;
  }

  if (error.name === 'AI_APICallError') {
    // OpenAI API error
    if (error.statusCode === 429) {
      // Rate limit, wait and retry once
      await sleep(2000);
      return retryOperation(step);
    }
    throw error; // Bubble up
  }

  throw error;
}
```

### Moderation Errors

```typescript
try {
  const moderation = await moderateContent(operation.content!);
} catch (error) {
  // Moderation API down, fail safe
  await flagForHumanReview({
    stepId: step.id,
    operation,
    reason: 'Moderation check unavailable, requires manual review',
  });
  continue; // Skip operation
}
```

### Tiptap Operation Errors

```typescript
const applied = await applyOperation(editor, operation);

if (!applied) {
  // Operation rejected by Tiptap (invalid position, etc.)
  result.errors!.push({
    stepId: step.id,
    operation,
    reason: 'Tiptap rejected operation (invalid position or state)',
    timestamp: new Date(),
  });

  // Don't continue - document state may be inconsistent
  result.success = false;
  break;
}
```

## Integration with Other Agents

### Upstream: Revision Planner
**Receives**: EditPlan with validated, conflict-free steps
**Contract**: Planner guarantees steps are safe, Executor guarantees execution

### Downstream: Versioning & Snapshot Gatekeeper
**Calls**: Version saving after each operation
**Contract**: Executor provides label, Gatekeeper persists to Velt + Supabase

### Parallel: Comment Canonicalizer
**Reads**: Change request IDs in plan metadata
**Contract**: Executor marks comments as "addressed" after successful application

## Success Criteria

1. **Deterministic operations**: Same plan + document state always produces same operations
2. **Safety gates enforced**: 100% of content checked for moderation, confidence thresholds applied
3. **Version granularity**: One version per operation (enables fine-grained undo)
4. **Error transparency**: All failures logged with step ID, operation details, reason
5. **Performance target**: Process 5 operations in <10 seconds (including version saves)

## Testing Strategy

### Unit Tests
```typescript
describe('Rewrite Executor', () => {
  it('generates valid operation from edit step', async () => {
    const step = { /* mock step */ };
    const operation = await generateOperation(step);

    expect(operation.type).toBeOneOf(['insert', 'delete', 'replace']);
    expect(operation.confidence).toBeGreaterThanOrEqual(0);
    expect(operation.confidence).toBeLessThanOrEqual(1);
  });

  it('skips operation below confidence threshold', async () => {
    const plan = { steps: [{ /* low confidence step */ }] };
    const result = await executeRewrite(plan, editor, store);

    expect(result.operationsApplied).toBe(0);
    expect(result.operationsFlagged).toBe(1);
  });

  it('blocks flagged content', async () => {
    const operation = {
      type: 'insert',
      content: 'I want to hurt someone', // Flagged content
      position: 0,
      confidence: 1.0,
    };

    const moderation = await moderateContent(operation.content);
    expect(moderation.flagged).toBe(true);
  });
});
```

### Integration Tests
```typescript
it('applies plan and creates versions', async () => {
  const plan = createTestPlan(3); // 3 simple operations
  const result = await executeRewrite(plan, editor, store);

  expect(result.success).toBe(true);
  expect(result.operationsApplied).toBe(3);

  // Verify versions created
  const { data: versions } = await supabase
    .from('versions')
    .select('*')
    .eq('document_id', plan.documentId);

  expect(versions.length).toBe(3);
});
```

## Performance Optimization

### Operation Caching
```typescript
// Cache operation generation for identical steps
const operationCache = new Map<string, EditOperation>();

async function generateOperationCached(step: EditStep): Promise<EditOperation> {
  const cacheKey = hashStep(step);

  if (operationCache.has(cacheKey)) {
    return operationCache.get(cacheKey)!;
  }

  const operation = await generateOperation(step);
  operationCache.set(cacheKey, operation);

  return operation;
}
```

### Moderation Batching
```typescript
// Batch moderation calls if plan has multiple content operations
async function moderateContentBatch(texts: string[]): Promise<ModerationResult[]> {
  const response = await openai.moderations.create({
    input: texts, // API supports array input
    model: 'omni-moderation-latest',
  });

  return response.results.map(r => ({
    flagged: r.flagged,
    categories: Object.entries(r.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category),
    categoryScores: r.category_scores,
  }));
}
```

## Monitoring & Observability

### Metrics to Track
- Operation generation latency (p50, p95, p99)
- Moderation API latency
- Tiptap operation apply latency
- Confidence score distribution
- Moderation flag rate
- Operations applied per plan
- Version save latency

### Logging
```typescript
await logOperationExecution({
  planId: plan.planId,
  stepId: step.id,
  operationType: operation.type,
  confidence: operation.confidence,
  moderation: moderation?.flagged,
  duration: operationDuration,
  versionId: versionId,
});
```

---

## Quick Reference

### Key Configuration Values
- **Confidence threshold**: 0.85
- **Max execution time**: 60 seconds
- **Max consecutive flags**: 3
- **Moderation retries**: 3
- **Operation retries**: 0

### Critical Imports
```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { Editor } from '@tiptap/core';
import * as Y from 'yjs';
```

### Environment Variables Required
```bash
OPENAI_API_KEY=sk-...        # For Responses API + Moderation
VELT_API_KEY=...             # For CRDT versioning
SUPABASE_URL=...             # Supabase connection
SUPABASE_SERVICE_KEY=...     # Supabase service role key
```

## Version History

- **v1.0** (2025-11-10): Converted to Render/Vercel/Supabase stack
- Platform-agnostic AI logic preserved
- Database references updated to Supabase
- Storage references updated to Supabase Storage
