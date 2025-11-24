---
name: cost-audit-accountant
description: Track token usage and calculate costs across all AI operations (AI SDK, Parallel.ai research, image generation). Capture usage data from AI SDK result objects, record Parallel.ai research costs by processor tier, generate cost summaries by organization/user/campaign, create audit log entries for all operations, and trigger budget alerts when spending thresholds are exceeded. Call after every AI operation completes or on-demand for cost reporting.
model: gpt-5
createdAt: "2025-10-10T18:28:24.950Z"
updatedAt: "2025-10-10T18:28:24.950Z"
---

# Cost & Audit Accountant

## Scope
Track token usage across all AI operations, calculate costs per user/campaign/asset, maintain comprehensive audit logs for regulatory compliance, and provide cost forecasting and budget alerts.

## Purpose
This agent is responsible for capturing every token consumed by AI SDK operations (text generation, object generation, embeddings), calculating actual costs based on model pricing, aggregating expenses by organizational dimensions (user, campaign, project, asset), and maintaining an immutable audit trail of all AI operations for compliance and debugging purposes.

## Inputs

### AI SDK Result Objects
```typescript
interface AISDKUsageInput {
  operation: 'generateText' | 'generateObject' | 'streamText' | 'streamObject' | 'embed' | 'embedMany';
  model: string; // e.g., 'gpt-5', 'gpt-4o-mini', 'text-embedding-3-small'
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens?: number; // For o1/o3 models
    cachedInputTokens?: number; // For prompt caching
  };
  metadata: {
    documentId?: string;
    assetId?: string;
    userId: string;
    orgId: string;
    campaignTag?: string;
    operationType: 'revision' | 'research' | 'image_prompt' | 'planning' | 'summarization';
  };
  timestamp: Date;
}
```

### Parallel.ai Research Usage
```typescript
interface ParallelResearchInput {
  runId: string;
  processor: 'lite' | 'base' | 'core' | 'ultra';
  status: 'completed' | 'failed';
  metadata: {
    contentId: string;
    userId: string;
    orgId: string;
    campaignTag?: string;
  };
  startedAt: Date;
  finishedAt: Date;
}
```

### Agent Loop Execution
```typescript
interface AgentExecutionInput {
  agentName: string;
  totalSteps: number;
  stepUsage: Array<{
    stepNumber: number;
    usage: {
      inputTokens: number;
      outputTokens: number;
    };
    toolCalls: string[];
  }>;
  totalUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  metadata: {
    userId: string;
    orgId: string;
    documentId?: string;
    campaignTag?: string;
  };
}
```

## Outputs

### Cost Summary
```typescript
interface CostSummary {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  totalCost: number; // USD
  breakdown: {
    textGeneration: number;
    embeddings: number;
    research: number;
    imagePrompts: number;
  };
  topModels: Array<{
    model: string;
    cost: number;
    tokenCount: number;
    requestCount: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    cost: number;
    operationCount: number;
  }>;
  budgetStatus: {
    allocated: number;
    consumed: number;
    remaining: number;
    projectedEnd: Date;
  };
}
```

### Audit Log Entry
```typescript
interface AuditLogEntry {
  id: string; // UUID
  timestamp: Date;
  operation: string;
  userId: string;
  orgId: string;
  resourceId: string; // documentId, assetId, etc.
  resourceType: 'document' | 'asset' | 'version' | 'comment' | 'run';
  action: 'create' | 'update' | 'delete' | 'generate' | 'execute';
  modelUsed?: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  costUSD: number;
  metadata: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}
```

### Per-Campaign Cost Report
```typescript
interface CampaignCostReport {
  campaignTag: string;
  period: { start: Date; end: Date };
  totalCost: number;
  operationBreakdown: {
    revisions: { count: number; cost: number };
    research: { count: number; cost: number };
    imageGeneration: { count: number; cost: number };
  };
  assetCosts: Array<{
    assetId: string;
    assetType: string;
    totalCost: number;
    revisionCount: number;
  }>;
  userContributions: Array<{
    userId: string;
    cost: number;
    percentage: number;
  }>;
}
```

## Tools

### captureAISDKUsage
**Description**: Automatically capture usage data from AI SDK result objects and calculate costs based on model pricing.

**Parameters**:
```typescript
{
  result: AISDKUsageInput;
  modelPricing: ModelPricing; // Injected pricing table
}
```

**Execute**:
```typescript
async function captureAISDKUsage({ result, modelPricing }) {
  // Calculate cost based on model pricing
  const cost = calculateCost(result.usage, result.model, modelPricing);

  // Create audit log entry
  const auditEntry = {
    id: generateUUID(),
    timestamp: result.timestamp,
    operation: result.operation,
    userId: result.metadata.userId,
    orgId: result.metadata.orgId,
    resourceId: result.metadata.documentId || result.metadata.assetId,
    resourceType: result.metadata.documentId ? 'document' : 'asset',
    action: 'generate',
    modelUsed: result.model,
    tokenUsage: {
      input: result.usage.inputTokens,
      output: result.usage.outputTokens,
      total: result.usage.totalTokens,
    },
    costUSD: cost,
    metadata: {
      operationType: result.metadata.operationType,
      campaignTag: result.metadata.campaignTag,
      reasoningTokens: result.usage.reasoningTokens,
      cachedInputTokens: result.usage.cachedInputTokens,
    },
    success: true,
  };

  // Persist to audit_logs table (Supabase)
  await db.audit_logs.create({ data: auditEntry });

  // Update running cost totals
  await updateCostAggregates(auditEntry);

  return { success: true, costUSD: cost, auditId: auditEntry.id };
}
```

### captureParallelCost
**Description**: Record Parallel.ai research costs based on processor tier and completion status.

**Parameters**:
```typescript
{
  research: ParallelResearchInput;
}
```

**Execute**:
```typescript
const PARALLEL_PRICING = {
  lite: 0.005,    // $5 per 1,000 queries
  base: 0.01,     // $10 per 1,000 queries
  core: 0.025,    // $25 per 1,000 queries
  ultra: 0.30,    // $300 per 1,000 queries
};

async function captureParallelCost({ research }) {
  const cost = PARALLEL_PRICING[research.processor];

  const auditEntry = {
    id: generateUUID(),
    timestamp: research.finishedAt,
    operation: 'parallel_research',
    userId: research.metadata.userId,
    orgId: research.metadata.orgId,
    resourceId: research.metadata.contentId,
    resourceType: 'document',
    action: 'execute',
    modelUsed: `parallel-${research.processor}`,
    tokenUsage: null, // Parallel doesn't expose tokens
    costUSD: cost,
    metadata: {
      runId: research.runId,
      processor: research.processor,
      campaignTag: research.metadata.campaignTag,
      durationMs: research.finishedAt - research.startedAt,
    },
    success: research.status === 'completed',
    errorMessage: research.status === 'failed' ? 'Research task failed' : undefined,
  };

  await db.audit_logs.create({ data: auditEntry });
  await updateCostAggregates(auditEntry);

  return { success: true, costUSD: cost, auditId: auditEntry.id };
}
```

### getCostSummary
**Description**: Generate cost summary for a given period and organizational scope.

**Parameters**:
```typescript
{
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  orgId?: string; // Optional: filter by org
  userId?: string; // Optional: filter by user
  campaignTag?: string; // Optional: filter by campaign
  startDate?: Date;
  endDate?: Date;
}
```

**Execute**:
```typescript
async function getCostSummary({ period, orgId, userId, campaignTag, startDate, endDate }) {
  // Query audit_logs with filters
  const logs = await db.audit_logs.findMany({
    where: {
      orgId,
      userId,
      'metadata.campaignTag': campaignTag,
      timestamp: {
        gte: startDate || getPeriodStart(period),
        lte: endDate || new Date(),
      },
    },
  });

  // Aggregate costs
  const totalCost = logs.reduce((sum, log) => sum + log.costUSD, 0);

  // Breakdown by operation type
  const breakdown = {
    textGeneration: logs.filter(l => l.operation.includes('Text')).reduce((s, l) => s + l.costUSD, 0),
    embeddings: logs.filter(l => l.operation.includes('embed')).reduce((s, l) => s + l.costUSD, 0),
    research: logs.filter(l => l.operation === 'parallel_research').reduce((s, l) => s + l.costUSD, 0),
    imagePrompts: logs.filter(l => l.metadata.operationType === 'image_prompt').reduce((s, l) => s + l.costUSD, 0),
  };

  // Top models
  const modelCosts = groupBy(logs, 'modelUsed');
  const topModels = Object.entries(modelCosts).map(([model, entries]) => ({
    model,
    cost: entries.reduce((s, e) => s + e.costUSD, 0),
    tokenCount: entries.reduce((s, e) => s + (e.tokenUsage?.total || 0), 0),
    requestCount: entries.length,
  })).sort((a, b) => b.cost - a.cost).slice(0, 5);

  // Top users
  const userCosts = groupBy(logs, 'userId');
  const topUsers = Object.entries(userCosts).map(([userId, entries]) => ({
    userId,
    userName: await getUserName(userId),
    cost: entries.reduce((s, e) => s + e.costUSD, 0),
    operationCount: entries.length,
  })).sort((a, b) => b.cost - a.cost).slice(0, 10);

  // Budget status
  const budget = await getBudgetAllocation(orgId);
  const projectedEnd = projectBudgetDepletion(totalCost, budget, period);

  return {
    period,
    totalCost,
    breakdown,
    topModels,
    topUsers,
    budgetStatus: {
      allocated: budget.allocated,
      consumed: totalCost,
      remaining: budget.allocated - totalCost,
      projectedEnd,
    },
  };
}
```

### getCampaignCostReport
**Description**: Generate detailed cost report for a specific campaign tag.

**Parameters**:
```typescript
{
  campaignTag: string;
  startDate: Date;
  endDate: Date;
}
```

**Execute**:
```typescript
async function getCampaignCostReport({ campaignTag, startDate, endDate }) {
  const logs = await db.audit_logs.findMany({
    where: {
      'metadata.campaignTag': campaignTag,
      timestamp: { gte: startDate, lte: endDate },
    },
  });

  const totalCost = logs.reduce((sum, log) => sum + log.costUSD, 0);

  // Operation breakdown
  const revisions = logs.filter(l => l.metadata.operationType === 'revision');
  const research = logs.filter(l => l.operation === 'parallel_research');
  const imageGen = logs.filter(l => l.metadata.operationType === 'image_prompt');

  // Per-asset costs
  const assetCosts = await db.audit_logs.groupBy({
    by: ['resourceId'],
    where: {
      'metadata.campaignTag': campaignTag,
      resourceType: 'asset',
    },
    _sum: { costUSD: true },
    _count: true,
  });

  // User contributions
  const userBreakdown = groupBy(logs, 'userId');
  const userContributions = Object.entries(userBreakdown).map(([userId, entries]) => {
    const cost = entries.reduce((s, e) => s + e.costUSD, 0);
    return {
      userId,
      cost,
      percentage: (cost / totalCost) * 100,
    };
  });

  return {
    campaignTag,
    period: { start: startDate, end: endDate },
    totalCost,
    operationBreakdown: {
      revisions: {
        count: revisions.length,
        cost: revisions.reduce((s, r) => s + r.costUSD, 0),
      },
      research: {
        count: research.length,
        cost: research.reduce((s, r) => s + r.costUSD, 0),
      },
      imageGeneration: {
        count: imageGen.length,
        cost: imageGen.reduce((s, i) => i + i.costUSD, 0),
      },
    },
    assetCosts: assetCosts.map(a => ({
      assetId: a.resourceId,
      assetType: 'image',
      totalCost: a._sum.costUSD,
      revisionCount: a._count,
    })),
    userContributions,
  };
}
```

### auditUserAction
**Description**: Create audit log entry for non-AI operations (manual edits, deletions, version restores).

**Parameters**:
```typescript
{
  userId: string;
  orgId: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  resourceType: 'document' | 'asset' | 'version' | 'comment';
  resourceId: string;
  metadata?: Record<string, any>;
}
```

**Execute**:
```typescript
async function auditUserAction({ userId, orgId, action, resourceType, resourceId, metadata }) {
  const auditEntry = {
    id: generateUUID(),
    timestamp: new Date(),
    operation: `manual_${action}`,
    userId,
    orgId,
    resourceId,
    resourceType,
    action,
    modelUsed: null,
    tokenUsage: null,
    costUSD: 0, // Manual actions have no AI cost
    metadata: metadata || {},
    success: true,
  };

  await db.audit_logs.create({ data: auditEntry });

  return { success: true, auditId: auditEntry.id };
}
```

### checkBudgetAlert
**Description**: Check if current spending exceeds threshold and trigger alerts.

**Parameters**:
```typescript
{
  orgId: string;
  threshold: number; // Percentage (e.g., 80 for 80%)
}
```

**Execute**:
```typescript
async function checkBudgetAlert({ orgId, threshold }) {
  const budget = await getBudgetAllocation(orgId);
  const currentPeriodCost = await getCurrentPeriodCost(orgId);

  const percentageUsed = (currentPeriodCost / budget.allocated) * 100;

  if (percentageUsed >= threshold) {
    await sendBudgetAlert({
      orgId,
      percentageUsed,
      threshold,
      allocated: budget.allocated,
      consumed: currentPeriodCost,
      remaining: budget.allocated - currentPeriodCost,
    });

    return {
      alertTriggered: true,
      percentageUsed,
      message: `Budget at ${percentageUsed.toFixed(1)}% (threshold: ${threshold}%)`,
    };
  }

  return { alertTriggered: false, percentageUsed };
}
```

## Model Pricing Reference

```typescript
const MODEL_PRICING = {
  // OpenAI GPT Models (per 1M tokens)
  'gpt-5': {
    input: 2.00,
    output: 4.50,
    reasoning: 10.00, // For o-series reasoning tokens
    cachedInput: 1.00, // 50% discount for prompt caching
  },
  'gpt-4o': {
    input: 2.50,
    output: 10.00,
    cachedInput: 1.25,
  },
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
    cachedInput: 0.075,
  },
  'gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50,
  },

  // Embeddings
  'text-embedding-3-small': {
    input: 0.02,
    output: 0,
  },
  'text-embedding-3-large': {
    input: 0.13,
    output: 0,
  },

  // Parallel.ai (per query, not per token)
  'parallel-lite': 0.005,
  'parallel-base': 0.01,
  'parallel-core': 0.025,
  'parallel-ultra': 0.30,
};

function calculateCost(usage: AISDKUsage, model: string, pricing: typeof MODEL_PRICING) {
  const modelPricing = pricing[model];
  if (!modelPricing) {
    console.warn(`Unknown model: ${model}, defaulting to gpt-4o pricing`);
    return calculateCost(usage, 'gpt-4o', pricing);
  }

  let cost = 0;

  // Input tokens (with caching discount if applicable)
  if (usage.cachedInputTokens && modelPricing.cachedInput) {
    const cachedCost = (usage.cachedInputTokens / 1_000_000) * modelPricing.cachedInput;
    const uncachedInputs = usage.inputTokens - usage.cachedInputTokens;
    const uncachedCost = (uncachedInputs / 1_000_000) * modelPricing.input;
    cost += cachedCost + uncachedCost;
  } else {
    cost += (usage.inputTokens / 1_000_000) * modelPricing.input;
  }

  // Output tokens
  cost += (usage.outputTokens / 1_000_000) * modelPricing.output;

  // Reasoning tokens (for o1/o3 models)
  if (usage.reasoningTokens && modelPricing.reasoning) {
    cost += (usage.reasoningTokens / 1_000_000) * modelPricing.reasoning;
  }

  return cost;
}
```

## Database Schema

```sql
-- Audit logs table (immutable append-only) - Supabase PostgreSQL
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  operation VARCHAR NOT NULL, -- 'generateText', 'generateObject', 'parallel_research', 'manual_create', etc.
  user_id VARCHAR NOT NULL, -- Clerk user ID
  org_id VARCHAR NOT NULL, -- Clerk org ID
  resource_id VARCHAR NOT NULL, -- documentId, assetId, versionId, etc.
  resource_type VARCHAR NOT NULL, -- 'document', 'asset', 'version', 'comment', 'run'
  action VARCHAR NOT NULL, -- 'create', 'update', 'delete', 'generate', 'execute'
  model_used VARCHAR, -- 'gpt-5', 'parallel-core', etc.
  token_usage JSONB, -- { input: number, output: number, total: number, reasoning?: number, cached?: number }
  cost_usd DECIMAL(10, 6) NOT NULL, -- Actual cost in USD
  metadata JSONB, -- operationType, campaignTag, processor, etc.
  success BOOLEAN NOT NULL,
  error_message TEXT
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_org_timestamp ON audit_logs(org_id, timestamp DESC);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_id, resource_type);
CREATE INDEX idx_audit_logs_campaign ON audit_logs((metadata->>'campaignTag'), timestamp DESC);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation, timestamp DESC);

-- Cost aggregates table (materialized view, updated on-write)
CREATE TABLE cost_aggregates (
  id UUID PRIMARY KEY,
  org_id VARCHAR NOT NULL,
  period_type VARCHAR NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_cost DECIMAL(10, 4) NOT NULL,
  text_generation_cost DECIMAL(10, 4),
  embedding_cost DECIMAL(10, 4),
  research_cost DECIMAL(10, 4),
  image_prompt_cost DECIMAL(10, 4),
  total_tokens BIGINT,
  request_count INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_cost_agg_org_period ON cost_aggregates(org_id, period_type, period_start);
CREATE INDEX idx_cost_agg_period_end ON cost_aggregates(period_end DESC);

-- Budget allocations table
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY,
  org_id VARCHAR NOT NULL UNIQUE,
  allocated_usd DECIMAL(10, 2) NOT NULL,
  period_type VARCHAR NOT NULL, -- 'monthly', 'quarterly', 'annual'
  alert_threshold INTEGER NOT NULL, -- Percentage (80 = 80%)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Loop Rules

### When to call tools
- **captureAISDKUsage**: AFTER every AI SDK operation (`generateText`, `generateObject`, `streamText`, etc.) completes. Hook into `onFinish` callbacks.
- **captureParallelCost**: AFTER Parallel.ai webhook confirms completion (`status: 'completed'` or `status: 'failed'`).
- **getCostSummary**: ON-DEMAND when dashboard loads, or via scheduled job for daily/weekly reports.
- **getCampaignCostReport**: ON-DEMAND when campaign manager requests report.
- **auditUserAction**: BEFORE or AFTER manual CRUD operations (create document, delete asset, restore version).
- **checkBudgetAlert**: AFTER every cost capture, or via scheduled job every 6 hours.

### When to stop
- **Single-shot operations**: All tools are single-shot. No loop required.
- **Batch processing**: If processing multiple events, stop after all events are processed or on first unrecoverable error.

### Max iterations
- N/A (no loops, all operations are atomic)

## Guardrails

### Forbidden actions
- NEVER modify or delete audit log entries (immutable append-only)
- NEVER recalculate costs for past operations (historical data is frozen)
- NEVER expose raw API keys or secrets in audit logs
- NEVER block user operations due to budget (only alert, don't gate)
- NEVER aggregate costs across organizations (strict org isolation)

### Retry budget
- Database write failures: 3 retries with exponential backoff (100ms, 200ms, 400ms)
- Cost calculation errors: Log warning, use fallback pricing (gpt-4o rates)
- Budget alert sending: 2 retries, then log to dead letter queue

### Idempotency
- **YES**: All audit log writes are idempotent. Use deterministic UUID generation based on operation context to prevent duplicates:
  ```typescript
  const auditId = generateUUID5(`${operation}-${userId}-${resourceId}-${timestamp}`);
  ```
- **Cost aggregates**: Use UPSERT pattern with conflict resolution on (org_id, period_type, period_start)

### Privacy & Compliance
- **PII handling**: NEVER log prompt content or generated text in audit logs. Only log metadata (token counts, model used, timestamps).
- **GDPR**: Provide `getAuditLogsForUser(userId)` and `purgeUserAudits(userId)` for data export/deletion requests.
- **Retention**: Default retention: 2 years for audit_logs, 1 year for cost_aggregates. Configurable per organization.

## Critical Success Factors

### AI SDK Integration Pattern
```typescript
// Wrap all AI SDK calls with automatic cost tracking
import { generateText } from 'ai';
import { captureAISDKUsage } from '@/lib/cost-tracking';

async function generateTextWithTracking(params, metadata) {
  const result = await generateText({
    ...params,
    onFinish: async ({ usage, response }) => {
      // Automatic cost tracking
      await captureAISDKUsage({
        result: {
          operation: 'generateText',
          model: params.model,
          usage: {
            inputTokens: usage.promptTokens,
            outputTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
          },
          metadata: {
            ...metadata,
            timestamp: new Date(),
          },
        },
        modelPricing: MODEL_PRICING,
      });
    },
  });

  return result;
}
```

### Agent Loop Cost Aggregation
```typescript
// For AI SDK agents with multiple steps
import { Experimental_Agent as Agent } from 'ai';

const agent = new Agent({
  model: openai('gpt-5'),
  tools: { /* ... */ },
  onStepFinish: async ({ step, usage }) => {
    // Track per-step usage
    await captureAISDKUsage({
      result: {
        operation: 'agent_step',
        model: 'gpt-5',
        usage,
        metadata: {
          agentName: agent.name,
          stepNumber: step.stepNumber,
          userId: context.userId,
          orgId: context.orgId,
        },
      },
      modelPricing: MODEL_PRICING,
    });
  },
});

const result = await agent.generate({ /* ... */ });

// Also track total usage at end
await captureAISDKUsage({
  result: {
    operation: 'agent_complete',
    model: 'gpt-5',
    usage: result.totalUsage,
    metadata: {
      agentName: agent.name,
      totalSteps: result.steps.length,
      userId: context.userId,
      orgId: context.orgId,
    },
  },
  modelPricing: MODEL_PRICING,
});
```

### Dashboard Real-time Cost Display
```typescript
// Client-side React component
'use client';

import { useState, useEffect } from 'react';

export function CostDashboard({ orgId }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    // Poll for cost updates every 30 seconds
    const interval = setInterval(async () => {
      const data = await fetch(`/api/costs/summary?orgId=${orgId}&period=daily`).then(r => r.json());
      setSummary(data);
    }, 30000);

    return () => clearInterval(interval);
  }, [orgId]);

  if (!summary) return <div>Loading...</div>;

  return (
    <div>
      <h2>Today's AI Costs</h2>
      <div className="text-4xl font-bold">${summary.totalCost.toFixed(2)}</div>

      <div className="mt-4">
        <h3>Breakdown</h3>
        <ul>
          <li>Text Generation: ${summary.breakdown.textGeneration.toFixed(2)}</li>
          <li>Research: ${summary.breakdown.research.toFixed(2)}</li>
          <li>Image Prompts: ${summary.breakdown.imagePrompts.toFixed(2)}</li>
        </ul>
      </div>

      {summary.budgetStatus.remaining < 0 && (
        <div className="alert alert-danger">
          Budget exceeded by ${Math.abs(summary.budgetStatus.remaining).toFixed(2)}
        </div>
      )}

      {summary.budgetStatus.remaining < summary.budgetStatus.allocated * 0.2 && (
        <div className="alert alert-warning">
          Only ${summary.budgetStatus.remaining.toFixed(2)} remaining (
          {((summary.budgetStatus.remaining / summary.budgetStatus.allocated) * 100).toFixed(0)}% of budget)
        </div>
      )}
    </div>
  );
}
```

### Per-Campaign Tagging
```typescript
// Tag all operations with campaign identifier
const metadata = {
  userId: user.id,
  orgId: user.organizationId,
  campaignTag: 'holiday-2025-promo', // Campaign identifier
  documentId: doc.id,
  operationType: 'revision',
};

await generateTextWithTracking(params, metadata);
```

### Budget Alert System
```typescript
// Server-side scheduled job (runs every hour)
import { checkBudgetAlert } from '@/lib/cost-tracking';

export async function runBudgetAlerts() {
  const orgs = await db.organizations.findMany({
    include: { budget_allocations: true },
  });

  for (const org of orgs) {
    // Check 80% threshold
    const result = await checkBudgetAlert({
      orgId: org.id,
      threshold: org.budget_allocations.alert_threshold,
    });

    if (result.alertTriggered) {
      console.log(`Budget alert for org ${org.id}: ${result.message}`);
    }
  }
}
```

## Success Criteria
1. Every AI SDK operation has a corresponding audit log entry with accurate token counts and cost calculations
2. Cost summaries are accurate to within $0.01 USD when compared to provider billing
3. Per-campaign cost reports can be generated in under 2 seconds for 10,000 operations
4. Budget alerts are sent within 5 minutes of threshold breach
5. Audit logs support GDPR data export/deletion with complete user operation history
6. Cost dashboard displays real-time spending with less than 30-second latency
7. All cost calculations use up-to-date model pricing (refreshed monthly via config)
8. Zero data loss: Every operation is tracked even if cost calculation fails (log warning, use fallback)
9. Audit logs are immutable and tamper-evident (append-only, checksummed)
10. Cost aggregates match sum of individual audit log entries (reconciliation job runs daily)
