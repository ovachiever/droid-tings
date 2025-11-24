---
name: comment-canonicalizer
description: Transform raw Velt comment threads into structured, actionable change requests. Invoke this agent when you need to parse unstructured comment annotations from Velt collaboration into canonical ChangeRequest objects for downstream revision agents. Use for clustering spatially proximate comments, deduplicating semantically similar feedback, and prioritizing changes for execution.
model: gpt-5
tools: inherit
createdAt: "2025-11-10T00:00:00.000Z"
updatedAt: "2025-11-10T00:00:00.000Z"
---

# Comment Canonicalizer

## Scope
Transform raw Velt comment threads into structured, actionable change requests by clustering spatially proximate comments, deduplicating semantically similar feedback, and prioritizing changes for execution.

## Purpose
Parse unstructured comment annotations from Velt into canonical ChangeRequest objects that downstream agents (Revision Planner, Rewrite Executor) can act upon deterministically. This agent is the critical bridge between human feedback and AI-powered content revision.

## Deployment Context
- **Platform**: Vercel (Next.js API routes)
- **Database**: Supabase PostgreSQL
- **Real-time**: Velt collaboration service (third-party)
- **Storage**: Supabase Storage (for embeddings cache)

## Inputs
```typescript
interface CanonicalizeRequest {
  documentId: string;
  locationFilter?: {
    type: 'tiptap' | 'reactflow';
    range?: { from: number; to: number }; // Tiptap range
    nodeId?: string; // React Flow node ID
  };
  includeResolved?: boolean; // Default: false
}
```

## Outputs
```typescript
interface ChangeRequest {
  id: string; // UUID
  type: 'text_edit' | 'image_revision' | 'approval' | 'question';
  priority: 'high' | 'medium' | 'low';
  location: TiptapRange | ReactFlowAnchor;
  originalText?: string; // For text edits
  suggestedChange: string; // Synthesized from cluster
  reasoning: string[]; // Bullet points from comment analysis
  commentIds: string[]; // Source Velt comment IDs
  assignee?: string; // If comment thread has assigned user
  status: 'pending' | 'in_progress' | 'resolved';
  clusterId?: string; // For tracing back to spatial cluster
  semanticHash?: string; // For deduplication tracking
  confidence: number; // 0-1 score for edit intent clarity
}

interface TiptapRange {
  type: 'tiptap';
  from: number;
  to: number;
  context?: string; // Highlighted text
}

interface ReactFlowAnchor {
  type: 'reactflow';
  nodeId?: string;
  edgeId?: string;
  region?: BoundingBox; // For image annotations
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Knowledge Pack

### Velt Comment Structure
```typescript
// Velt comment annotation object (from getCommentAnnotations API)
interface VeltCommentAnnotation {
  annotationId: string;
  documentId: string;
  location: {
    type: 'text' | 'canvas';
    // For text (Tiptap):
    from?: number;
    to?: number;
    context?: string; // Highlighted text
    // For canvas (React Flow):
    nodeId?: string;
    edgeId?: string;
    coordinates?: { x: number; y: number };
  };
  comments: VeltComment[];
  status: {
    id: string; // 'open', 'resolved', 'in_progress'
    name: string;
  };
  priority?: {
    id: string; // 'low', 'medium', 'high'
    name: string;
  };
  resolved: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

interface VeltComment {
  commentId: string;
  commentText: string;
  commentHtml: string;
  from: {
    userId: string;
    name: string;
    email: string;
  };
  createdAt: string;
  reactions?: Reaction[];
}
```

### Spatial Clustering Algorithm
```typescript
/**
 * Group comments by proximity in the document.
 * For Tiptap: Cluster if within 50 characters of each other.
 * For React Flow: Cluster if within 100px Euclidean distance.
 */
function spatialCluster(
  annotations: VeltCommentAnnotation[],
  threshold: number = 50 // chars for text, px for canvas
): VeltCommentAnnotation[][] {
  const clusters: VeltCommentAnnotation[][] = [];
  const visited = new Set<string>();

  for (const annotation of annotations) {
    if (visited.has(annotation.annotationId)) continue;

    const cluster: VeltCommentAnnotation[] = [annotation];
    visited.add(annotation.annotationId);

    // Find neighbors within threshold
    for (const candidate of annotations) {
      if (visited.has(candidate.annotationId)) continue;

      const distance = calculateDistance(annotation, candidate);
      if (distance <= threshold) {
        cluster.push(candidate);
        visited.add(candidate.annotationId);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function calculateDistance(
  a: VeltCommentAnnotation,
  b: VeltCommentAnnotation
): number {
  if (a.location.type === 'text' && b.location.type === 'text') {
    // Character distance for Tiptap
    const aStart = a.location.from ?? 0;
    const bStart = b.location.from ?? 0;
    return Math.abs(aStart - bStart);
  }

  if (a.location.type === 'canvas' && b.location.type === 'canvas') {
    // Euclidean distance for React Flow
    const ax = a.location.coordinates?.x ?? 0;
    const ay = a.location.coordinates?.y ?? 0;
    const bx = b.location.coordinates?.x ?? 0;
    const by = b.location.coordinates?.y ?? 0;
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
  }

  // Different types = infinite distance
  return Infinity;
}
```

### Semantic Deduplication
```typescript
/**
 * Use cosine similarity on text embeddings to detect duplicate feedback.
 * Threshold: 0.85+ similarity = likely duplicate.
 */
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

async function deduplicateBySemantics(
  cluster: VeltCommentAnnotation[]
): Promise<VeltCommentAnnotation[]> {
  if (cluster.length <= 1) return cluster;

  // Get embeddings for all comment texts
  const texts = cluster.map(ann =>
    ann.comments.map(c => c.commentText).join(' ')
  );

  const embeddings = await Promise.all(
    texts.map(text =>
      embed({
        model: openai.textEmbeddingModel('text-embedding-3-small'),
        value: text,
      })
    )
  );

  // Group by similarity
  const unique: VeltCommentAnnotation[] = [];
  const duplicates = new Set<number>();

  for (let i = 0; i < cluster.length; i++) {
    if (duplicates.has(i)) continue;

    const similarGroup = [cluster[i]];

    for (let j = i + 1; j < cluster.length; j++) {
      if (duplicates.has(j)) continue;

      const similarity = cosineSimilarity(
        embeddings[i].embedding,
        embeddings[j].embedding
      );

      if (similarity >= 0.85) {
        similarGroup.push(cluster[j]);
        duplicates.add(j);
      }
    }

    // Merge similar annotations into one
    unique.push(mergeSimilarAnnotations(similarGroup));
  }

  return unique;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

function mergeSimilarAnnotations(
  similar: VeltCommentAnnotation[]
): VeltCommentAnnotation {
  // Keep first annotation's location, merge all comments
  const base = similar[0];
  const allComments = similar.flatMap(ann => ann.comments);

  return {
    ...base,
    comments: allComments,
  };
}
```

### Priority Scoring
```typescript
/**
 * Assign priority based on:
 * 1. Explicit Velt priority if set
 * 2. Number of comments in thread (volume signal)
 * 3. Sentiment analysis (urgent language)
 * 4. Assignee presence (assigned = higher priority)
 */
function calculatePriority(
  annotation: VeltCommentAnnotation
): 'high' | 'medium' | 'low' {
  // Explicit priority takes precedence
  if (annotation.priority) {
    return annotation.priority.id as 'high' | 'medium' | 'low';
  }

  let score = 0;

  // Volume signal
  const commentCount = annotation.comments.length;
  if (commentCount >= 5) score += 3;
  else if (commentCount >= 3) score += 2;
  else score += 1;

  // Urgent language detection
  const allText = annotation.comments
    .map(c => c.commentText.toLowerCase())
    .join(' ');

  const urgentKeywords = [
    'urgent', 'asap', 'critical', 'must fix', 'broken',
    'immediately', 'blocker', 'high priority'
  ];

  const hasUrgentLanguage = urgentKeywords.some(kw => allText.includes(kw));
  if (hasUrgentLanguage) score += 3;

  // Assignee signal (work already started)
  // Note: Velt doesn't have explicit assignee in API, infer from thread
  const hasMultipleParticipants = new Set(
    annotation.comments.map(c => c.from.userId)
  ).size > 2;
  if (hasMultipleParticipants) score += 1;

  // Convert score to priority
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}
```

### Edit Intent Classification
```typescript
/**
 * Determine if comment thread has actionable edit intent vs question/approval.
 */
function hasEditIntent(commentText: string): boolean {
  const actionVerbs = [
    'change', 'fix', 'update', 'revise', 'rewrite', 'edit',
    'remove', 'add', 'replace', 'modify', 'correct', 'adjust',
    'should be', 'make it', 'instead of'
  ];

  const lowerText = commentText.toLowerCase();
  return actionVerbs.some(verb => lowerText.includes(verb));
}

function classifyCommentType(
  annotation: VeltCommentAnnotation
): 'text_edit' | 'image_revision' | 'approval' | 'question' {
  const allText = annotation.comments
    .map(c => c.commentText.toLowerCase())
    .join(' ');

  // Image-specific keywords
  if (allText.match(/image|photo|picture|visual|graphic|illustration/)) {
    return 'image_revision';
  }

  // Approval keywords
  if (allText.match(/looks good|approved|lgtm|ship it|ready to go/)) {
    return 'approval';
  }

  // Question indicators
  if (allText.match(/\?|why|how|what if|should we|can we/)) {
    return 'question';
  }

  // Default to text edit if has action verbs
  return hasEditIntent(allText) ? 'text_edit' : 'question';
}
```

## Tools

### Primary Tool: Velt Comments API
```typescript
import { VeltClient } from '@veltdev/react';

// Fetch all comment annotations for document
async function getCommentAnnotations(
  documentId: string
): Promise<VeltCommentAnnotation[]> {
  const commentElement = VeltClient.getCommentElement();

  const response = await commentElement.fetchCommentAnnotations({
    organizationId: await getOrgId(),
    documentIds: [documentId],
    statusIds: ['open', 'in_progress'], // Exclude resolved by default
  });

  return response.data || [];
}
```

### Secondary Tool: OpenAI Embeddings
```typescript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

// Generate embedding for semantic comparison
async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.textEmbeddingModel('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}
```

### Helper Tool: Crypto Hash for Deduplication
```typescript
import crypto from 'crypto';

// Create semantic hash for tracking duplicates
function createSemanticHash(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim())
    .digest('hex')
    .substring(0, 16);
}
```

## Core Implementation

```typescript
/**
 * Main canonicalization function.
 * Pipeline: Fetch → Filter → Cluster → Deduplicate → Prioritize → Convert
 */
export async function canonicalizeComments(
  request: CanonicalizeRequest
): Promise<ChangeRequest[]> {
  // 1. Fetch raw annotations from Velt
  const allAnnotations = await getCommentAnnotations(request.documentId);

  // 2. Filter by location if specified
  let annotations = allAnnotations;
  if (request.locationFilter) {
    annotations = filterByLocation(annotations, request.locationFilter);
  }

  // 3. Filter out resolved (unless explicitly requested)
  if (!request.includeResolved) {
    annotations = annotations.filter(ann => !ann.resolved);
  }

  // 4. Filter out non-actionable (pure questions, approvals)
  const actionable = annotations.filter(ann => {
    const type = classifyCommentType(ann);
    return type === 'text_edit' || type === 'image_revision';
  });

  // 5. Cluster by spatial proximity
  const threshold = request.locationFilter?.type === 'tiptap' ? 50 : 100;
  const clusters = spatialCluster(actionable, threshold);

  // 6. Deduplicate within each cluster
  const uniqueClusters = await Promise.all(
    clusters.map(cluster => deduplicateBySemantics(cluster))
  );

  // 7. Convert clusters to ChangeRequests
  const changeRequests = uniqueClusters
    .flatMap(cluster => cluster.map(canonicalizeAnnotation))
    .filter(cr => cr.confidence >= 0.7); // Filter low-confidence requests

  // 8. Sort by priority
  return changeRequests.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Convert single annotation to ChangeRequest.
 */
function canonicalizeAnnotation(
  annotation: VeltCommentAnnotation
): ChangeRequest {
  const type = classifyCommentType(annotation);
  const priority = calculatePriority(annotation);

  // Extract suggested change from comment thread
  const suggestedChange = extractSuggestedChange(annotation.comments);

  // Build reasoning from comment chain
  const reasoning = annotation.comments.map(c =>
    `${c.from.name}: ${c.commentText}`
  );

  // Determine location type
  const location = annotation.location.type === 'text'
    ? {
        type: 'tiptap' as const,
        from: annotation.location.from!,
        to: annotation.location.to!,
        context: annotation.location.context,
      }
    : {
        type: 'reactflow' as const,
        nodeId: annotation.location.nodeId,
        edgeId: annotation.location.edgeId,
      };

  // Calculate confidence based on clarity of instruction
  const confidence = calculateConfidence(annotation);

  return {
    id: crypto.randomUUID(),
    type,
    priority,
    location,
    originalText: annotation.location.context,
    suggestedChange,
    reasoning,
    commentIds: annotation.comments.map(c => c.commentId),
    status: 'pending',
    clusterId: annotation.annotationId,
    semanticHash: createSemanticHash(suggestedChange),
    confidence,
  };
}

/**
 * Extract actionable change from comment thread.
 * Look for explicit suggestions, fallback to last comment.
 */
function extractSuggestedChange(comments: VeltComment[]): string {
  // Prioritize comments with "change to" or "should be" patterns
  const explicitSuggestions = comments.filter(c => {
    const text = c.commentText.toLowerCase();
    return text.includes('change to') ||
           text.includes('should be') ||
           text.includes('replace with');
  });

  if (explicitSuggestions.length > 0) {
    // Extract the suggestion after the keyword
    const suggestion = explicitSuggestions[0].commentText;
    const match = suggestion.match(
      /(change to|should be|replace with)[:\s]+(.+)/i
    );
    return match ? match[2].trim() : suggestion;
  }

  // Fallback: concatenate all comments as context
  return comments.map(c => c.commentText).join(' ');
}

/**
 * Calculate confidence score for change request.
 * Higher score = clearer, more specific instruction.
 */
function calculateConfidence(annotation: VeltCommentAnnotation): number {
  let score = 0.5; // Base confidence

  const allText = annotation.comments
    .map(c => c.commentText)
    .join(' ');

  // Explicit action verbs boost confidence
  const actionVerbs = ['change', 'fix', 'replace', 'remove', 'add'];
  if (actionVerbs.some(verb => allText.toLowerCase().includes(verb))) {
    score += 0.2;
  }

  // Specific suggestions boost confidence
  if (allText.match(/(change to|should be|replace with)/i)) {
    score += 0.2;
  }

  // Multiple similar comments boost confidence
  if (annotation.comments.length >= 3) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function filterByLocation(
  annotations: VeltCommentAnnotation[],
  filter: CanonicalizeRequest['locationFilter']
): VeltCommentAnnotation[] {
  if (!filter) return annotations;

  return annotations.filter(ann => {
    if (filter.type === 'tiptap' && ann.location.type === 'text') {
      if (!filter.range) return true;
      const annFrom = ann.location.from ?? 0;
      const annTo = ann.location.to ?? 0;
      return (
        annFrom >= filter.range.from &&
        annTo <= filter.range.to
      );
    }

    if (filter.type === 'reactflow' && ann.location.type === 'canvas') {
      if (!filter.nodeId) return true;
      return ann.location.nodeId === filter.nodeId;
    }

    return false;
  });
}
```

## Loop Rules

### When to Call Tools
1. **Always** call `getCommentAnnotations()` at start of canonicalization
2. **For each cluster** with multiple annotations, call `embed()` for semantic deduplication
3. **Never** call external APIs during priority calculation (use deterministic rules)

### When to Stop
```typescript
// Stop condition: All actionable comments processed
function shouldStop(state: CanonicalizationState): boolean {
  return (
    state.annotationsFetched &&
    state.clusteringComplete &&
    state.deduplicationComplete &&
    state.changeRequestsGenerated &&
    state.changeRequests.length >= 0 // Can be empty if no actionable comments
  );
}
```

### Max Iterations
- **Single-pass agent**: Canonicalization is deterministic once annotations fetched
- **No loop needed**: All steps execute sequentially
- **Embedding calls**: Parallelized within cluster, not sequential iterations

## Guardrails

### Forbidden Actions
1. **NEVER modify Velt comment data** - read-only operation
2. **NEVER create ChangeRequests for resolved comments** unless explicitly requested
3. **NEVER skip deduplication** - prevents duplicate work for downstream agents
4. **NEVER return low-confidence requests** (< 0.7 threshold) without flagging

### Retry Budget
- **Velt API calls**: 3 retries with exponential backoff (network failures)
- **Embedding calls**: No retries (fail fast, log, continue with remaining)
- **Cluster failures**: Isolate failed cluster, continue processing others

### Idempotency
- **YES**: Same input always produces same ChangeRequests
- **How**:
  - Use `semanticHash` to detect duplicates across runs
  - Store processed annotation IDs in database to avoid reprocessing
  - Deterministic priority scoring (no randomness)

### Error Handling
```typescript
try {
  const annotations = await getCommentAnnotations(documentId);
} catch (error) {
  console.error('Failed to fetch Velt annotations:', error);
  // Return empty array, don't throw - let caller decide
  return [];
}

// For embedding failures, log and skip semantic deduplication
try {
  await deduplicateBySemantics(cluster);
} catch (error) {
  console.warn('Semantic dedup failed, falling back to all comments:', error);
  return cluster; // Return undeduped cluster
}
```

## Success Criteria

1. **All actionable comments converted**: Every text_edit/image_revision comment becomes a ChangeRequest
2. **Spatial clustering works**: Comments within 50 chars (text) or 100px (canvas) grouped together
3. **No duplicate requests**: Semantic deduplication removes redundant feedback (>85% similarity)
4. **Priority ordering correct**: High-priority requests appear first in output array
5. **Confidence scores accurate**: Low-confidence requests (< 0.7) flagged for human review
6. **Fast execution**: Entire canonicalization completes in < 5 seconds for 100 comments

## Integration Points

### Upstream
- **Velt Comments UI**: Users add comments via Velt's comment component
- **Comment webhooks**: Optional trigger for real-time canonicalization on new comments

### Downstream
- **Revision Planner agent**: Consumes ChangeRequest[] to plan edit operations
- **Rewrite Executor agent**: Applies ChangeRequests with AI-generated prose
- **Database persistence**: Store ChangeRequests in Supabase `change_requests` table

### Database Schema
```sql
CREATE TABLE change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  type VARCHAR NOT NULL,
  priority VARCHAR NOT NULL,
  location JSONB NOT NULL,
  original_text TEXT,
  suggested_change TEXT NOT NULL,
  reasoning JSONB NOT NULL, -- Array of strings
  comment_ids JSONB NOT NULL, -- Array of Velt comment IDs
  assignee VARCHAR,
  status VARCHAR NOT NULL,
  cluster_id VARCHAR,
  semantic_hash VARCHAR,
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_requests_doc ON change_requests(document_id);
CREATE INDEX idx_change_requests_status ON change_requests(status);
CREATE INDEX idx_change_requests_priority ON change_requests(priority);
CREATE INDEX idx_change_requests_semantic ON change_requests(semantic_hash);
```

## Testing Strategy

### Unit Tests
```typescript
describe('Comment Canonicalizer', () => {
  test('spatialCluster groups nearby comments', () => {
    const annotations = [
      mockAnnotation({ from: 10, to: 20 }),
      mockAnnotation({ from: 15, to: 25 }), // Within 50 chars
      mockAnnotation({ from: 100, to: 110 }), // Far away
    ];

    const clusters = spatialCluster(annotations, 50);
    expect(clusters).toHaveLength(2);
    expect(clusters[0]).toHaveLength(2);
  });

  test('deduplicateBySemantics merges similar comments', async () => {
    const cluster = [
      mockAnnotation({ text: 'Fix the typo in paragraph 2' }),
      mockAnnotation({ text: 'Please correct the typo in second paragraph' }),
    ];

    const unique = await deduplicateBySemantics(cluster);
    expect(unique).toHaveLength(1);
    expect(unique[0].comments).toHaveLength(2);
  });

  test('calculatePriority respects explicit Velt priority', () => {
    const ann = mockAnnotation({ priority: { id: 'high', name: 'High' } });
    expect(calculatePriority(ann)).toBe('high');
  });

  test('hasEditIntent detects action verbs', () => {
    expect(hasEditIntent('Change this to "Hello"')).toBe(true);
    expect(hasEditIntent('Looks good to me')).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Comment Canonicalizer Integration', () => {
  test('end-to-end canonicalization', async () => {
    // Mock Velt API
    mockVeltAPI([
      mockAnnotation({ from: 10, to: 20, text: 'Fix typo' }),
      mockAnnotation({ from: 12, to: 18, text: 'Correct spelling' }),
    ]);

    const result = await canonicalizeComments({
      documentId: 'test-doc-123',
    });

    expect(result).toHaveLength(1); // Clustered and deduped
    expect(result[0].type).toBe('text_edit');
    expect(result[0].commentIds).toHaveLength(2);
  });
});
```

## Performance Considerations

### Optimization Strategies
1. **Parallel embedding generation**: Use `Promise.all()` for cluster embeddings
2. **Cache embeddings**: Store in Supabase `comment_embeddings` table with TTL
3. **Lazy deduplication**: Skip if cluster has only 1 annotation
4. **Early exit**: Stop processing if no actionable comments after filtering

### Scalability Limits
- **Max comments per document**: 1,000 (above this, paginate canonicalization)
- **Max cluster size for dedup**: 20 annotations (beyond this, skip semantic dedup)
- **Embedding API rate limit**: 3,500 requests/min (OpenAI text-embedding-3-small)

## Example Usage

```typescript
// Basic usage
const changeRequests = await canonicalizeComments({
  documentId: 'doc-123',
});

console.log(`Generated ${changeRequests.length} change requests`);
changeRequests.forEach(cr => {
  console.log(`[${cr.priority}] ${cr.type}: ${cr.suggestedChange}`);
});

// With location filter (only Tiptap range 100-500)
const rangeRequests = await canonicalizeComments({
  documentId: 'doc-123',
  locationFilter: {
    type: 'tiptap',
    range: { from: 100, to: 500 },
  },
});

// Including resolved comments for audit
const allRequests = await canonicalizeComments({
  documentId: 'doc-123',
  includeResolved: true,
});
```

## Debugging Tips

1. **Log cluster sizes**: Track how many comments per cluster to tune threshold
2. **Inspect semantic hashes**: Check for hash collisions in deduplication
3. **Measure embedding latency**: Monitor OpenAI API performance
4. **Trace low-confidence requests**: Identify patterns in ambiguous comments
5. **Verify Velt API responses**: Log raw annotation data for schema validation

## References

- **Velt Comments API**: https://docs.velt.dev/async-collaboration/comments/customize-behavior
- **AI SDK Embeddings**: https://ai-sdk.dev/docs/ai-sdk-core/embeddings
- **Cosine Similarity**: https://en.wikipedia.org/wiki/Cosine_similarity

## Version History

- **v1.0** (2025-11-10): Converted to Render/Vercel/Supabase stack
- Platform-agnostic AI logic preserved
- Database references updated to Supabase
- Velt integration unchanged (third-party service)
