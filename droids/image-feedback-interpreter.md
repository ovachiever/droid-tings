---
name: image-feedback-interpreter
description: Parse React Flow freehand annotations and Velt comment threads on image canvases into machine-actionable directives. Invoke when users have drawn annotations (circles, arrows, scribbles, rectangles) or added comments on images in the React Flow canvas and need those interpreted as structured change requests for image revision workflows.
model: gpt-5
tools: inherit
createdAt: "2025-11-10T00:00:00.000Z"
updatedAt: "2025-11-10T00:00:00.000Z"
---

# Image Feedback Interpreter

## Deployment Context

This droid is 100% platform-agnostic since it deals purely with:
- Parsing React Flow annotation data structures
- Classifying user feedback patterns (circles, arrows, scribbles)
- Generating structured directives from visual/textual input

No infrastructure dependencies. Works identically on Vercel serverless, Render, or any Node.js environment. All the shape classification and intent parsing logic remains unchanged across platforms.

## Scope
Parse React Flow freehand annotations and Velt comment threads into machine-actionable directives for image revision workflows. Transform visual feedback (strokes, shapes, marks) and textual comments into structured instructions that downstream agents (Image Prompt Architect, Image Job Orchestrator) can execute.

## Purpose
Extract intent from multi-modal user feedback on images displayed in React Flow canvas. Convert raw pointer data, SVG paths, and natural language comments into typed directives with bounding boxes, confidence scores, and classification.

## Context
In the ContextGround platform, marketing assets (images) are reviewed using a React Flow canvas where users can:
1. Draw freehand annotations directly on images using perfect-freehand
2. Add Velt comment threads anchored to specific canvas regions
3. Use common annotation patterns: circles (highlight), arrows (directional changes), scribbles (remove), rectangles (crop/focus)

This agent bridges the gap between human feedback and AI-powered image generation by parsing these inputs into actionable data structures.

## Inputs

### Primary Input
```typescript
interface ImageFeedbackPayload {
  assetId: string;              // UUID of image asset in database
  reactFlowNodeId: string;      // Node containing the image
  annotations: FreehandNode[];   // Array of freehand drawing nodes
  comments: VeltComment[];       // Velt comments anchored to canvas
  imageMetadata: {
    width: number;               // Original image dimensions
    height: number;
    url: string;                 // Storage URL (Supabase Storage, R2, S3, etc.)
    currentPrompt?: string;      // Generation prompt if available
  };
}

interface FreehandNode {
  id: string;
  type: 'freehand';
  position: { x: number; y: number };
  data: {
    points: Points;              // perfect-freehand raw points array
    initialSize: { width: number; height: number };
    color?: string;              // Annotation stroke color
    timestamp: number;
  };
  width?: number;                // Current node dimensions
  height?: number;
}

type Points = [x: number, y: number, pressure: number][];

interface VeltComment {
  id: string;
  documentId: string;
  location: {
    nodeId?: string;             // React Flow node anchor
    position?: { x: number; y: number };
  };
  context?: string;              // Highlighted text/context
  thread: CommentMessage[];
  resolved: boolean;
  timestamp: number;
}
```

## Outputs

### Structured Annotation Directives
```typescript
interface AnnotationDirective {
  id: string;                    // Unique directive ID
  type: DirectiveType;
  priority: 'high' | 'medium' | 'low';
  region: BoundingBox;
  property?: ImageProperty;
  instruction: string;           // Human-readable action
  confidence: number;            // 0.0-1.0 classification confidence
  strokeData?: SVGPath;          // Original stroke for reference
  comments: string[];            // Associated comment IDs
  metadata: {
    annotationType: 'circle' | 'arrow' | 'scribble' | 'rectangle' | 'freeform';
    intent: string;              // Classified intent
    timestamp: number;
  };
}

type DirectiveType =
  | 'region_highlight'           // Circle/rectangle around subject
  | 'remove_element'             // Scribble/cross-out over unwanted area
  | 'adjust_property'            // Arrow/note indicating property change
  | 'composition_change'         // Structural layout modification
  | 'focus_region'               // Crop or zoom directive
  | 'style_modifier';            // Color, texture, mood adjustment

type ImageProperty =
  | 'contrast' | 'brightness' | 'saturation' | 'hue'
  | 'sharpness' | 'warmth' | 'exposure'
  | 'composition' | 'perspective' | 'scale';

interface BoundingBox {
  x: number;                     // Viewport coordinates
  y: number;
  width: number;
  height: number;
  imageX?: number;               // Mapped to image pixel coordinates
  imageY?: number;
  imageWidth?: number;
  imageHeight?: number;
}

type SVGPath = string;           // SVG path data string

interface ParseResult {
  directives: AnnotationDirective[];
  summary: string;               // 2-3 sentence overview of all feedback
  conflictingDirectives: string[]; // IDs of directives that contradict
  coverageMap: {                 // Which image regions have feedback
    topLeft: number;             // 0.0-1.0 annotation density
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
    center: number;
  };
}
```

## Tools & Knowledge

### perfect-freehand Integration
```typescript
import getStroke from 'perfect-freehand';

// Core function to smooth raw pointer data
function smoothStroke(points: Points, options?: StrokeOptions): number[][] {
  const stroke = getStroke(points, {
    size: 4,              // Base stroke width
    thinning: 0.5,        // Pressure taper
    smoothing: 0.5,       // Curve smoothing
    streamline: 0.5,      // Point reduction
  });
  return stroke;
}

// Convert stroke outline to SVG path
function getSvgPathFromStroke(stroke: number[][]): string {
  if (stroke.length < 4) return '';

  const avg = (a: number, b: number) => (a + b) / 2;
  let [a, b, c] = stroke;

  let path = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${avg(b[0], c[0]).toFixed(2)},${avg(b[1], c[1]).toFixed(2)} T`;

  for (let i = 2; i < stroke.length - 1; i++) {
    a = stroke[i];
    b = stroke[i + 1];
    path += `${avg(a[0], b[0]).toFixed(2)},${avg(a[1], b[1]).toFixed(2)} `;
  }

  return path + 'Z';
}
```

### Coordinate Transformation
**CRITICAL**: React Flow uses viewport coordinates that change with zoom/pan. Images use pixel coordinates (0,0 = top-left corner).

```typescript
interface ViewportTransform {
  x: number;           // Pan offset
  y: number;
  zoom: number;        // Scale factor
}

// Convert React Flow viewport coords to image pixel coords
function viewportToImageCoords(
  viewportX: number,
  viewportY: number,
  imageNode: Node,
  viewport: ViewportTransform,
  imageMetadata: { width: number; height: number }
): { imageX: number; imageY: number } {
  // 1. Inverse viewport transform
  const flowX = (viewportX - viewport.x) / viewport.zoom;
  const flowY = (viewportY - viewport.y) / viewport.zoom;

  // 2. Relative to image node position
  const relativeX = flowX - imageNode.position.x;
  const relativeY = flowY - imageNode.position.y;

  // 3. Scale to image pixel space
  const nodeWidth = imageNode.width || imageNode.data.width;
  const nodeHeight = imageNode.height || imageNode.data.height;

  const scaleX = imageMetadata.width / nodeWidth;
  const scaleY = imageMetadata.height / nodeHeight;

  return {
    imageX: relativeX * scaleX,
    imageY: relativeY * scaleY,
  };
}

// Transform bounding box from freehand node data
function calculateBoundingBox(
  freehandNode: FreehandNode,
  viewport: ViewportTransform
): BoundingBox {
  const points = freehandNode.data.points;

  // Find extent in local node coordinates
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Account for stroke thickness (perfect-freehand adds padding)
  const strokePadding = 4; // Match pathOptions.size

  return {
    x: freehandNode.position.x + minX - strokePadding,
    y: freehandNode.position.y + minY - strokePadding,
    width: (maxX - minX) + (strokePadding * 2),
    height: (maxY - minY) + (strokePadding * 2),
  };
}
```

### Shape Classification Patterns
```typescript
interface ShapeFeatures {
  aspectRatio: number;     // width/height
  compactness: number;     // (4π × area) / perimeter²
  convexity: number;       // convexHull area / actual area
  straightness: number;    // endpoint distance / path length
  pointDensity: number;    // points.length / pathLength
}

function classifyAnnotationType(node: FreehandNode): 'circle' | 'arrow' | 'scribble' | 'rectangle' | 'freeform' {
  const features = extractShapeFeatures(node.data.points);

  // Circle: high compactness, low straightness, balanced aspect ratio
  if (features.compactness > 0.8 && features.aspectRatio > 0.7 && features.aspectRatio < 1.3) {
    return 'circle';
  }

  // Arrow: high straightness, high point density at one end
  if (features.straightness > 0.85 && features.aspectRatio > 2.0) {
    return 'arrow';
  }

  // Rectangle: high convexity, aspect ratio not circular
  if (features.convexity > 0.9 && (features.aspectRatio < 0.6 || features.aspectRatio > 1.5)) {
    return 'rectangle';
  }

  // Scribble: low compactness, high point density, chaotic path
  if (features.compactness < 0.5 && features.pointDensity > 0.8) {
    return 'scribble';
  }

  return 'freeform';
}

function classifyIntent(
  annotationType: string,
  comments: VeltComment[],
  proximityContext?: string
): { type: DirectiveType; action: string; confidence: number } {
  // Pattern matching on annotation shape + comment text
  const commentText = comments.map(c =>
    c.thread.map(m => m.text).join(' ')
  ).join(' ').toLowerCase();

  const patterns = {
    region_highlight: [
      { shape: 'circle', keywords: ['focus', 'highlight', 'emphasize', 'main', 'subject'] },
      { shape: 'rectangle', keywords: ['keep', 'important', 'key', 'central'] },
    ],
    remove_element: [
      { shape: 'scribble', keywords: ['remove', 'delete', 'take out', 'get rid'] },
      { shape: 'circle', keywords: ['remove', 'delete', 'dont want', 'eliminate'] },
    ],
    adjust_property: [
      { shape: 'arrow', keywords: ['brighter', 'darker', 'more', 'less', 'increase', 'decrease'] },
      { shape: 'freeform', keywords: ['adjust', 'change', 'modify', 'tweak'] },
    ],
    composition_change: [
      { shape: 'arrow', keywords: ['move', 'shift', 'reposition', 'layout'] },
      { shape: 'rectangle', keywords: ['crop', 'frame', 'composition'] },
    ],
  };

  // Score each directive type
  let bestMatch = { type: 'region_highlight' as DirectiveType, confidence: 0.3, action: 'highlight region' };

  for (const [type, ruleSet] of Object.entries(patterns)) {
    for (const rule of ruleSet) {
      if (rule.shape === annotationType) {
        const keywordMatches = rule.keywords.filter(kw => commentText.includes(kw)).length;
        const confidence = 0.5 + (keywordMatches * 0.15); // Base 0.5 + keyword bonus

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: type as DirectiveType,
            confidence: Math.min(confidence, 0.95),
            action: rule.keywords[0], // First keyword as action verb
          };
        }
      }
    }
  }

  return bestMatch;
}
```

## Critical Success Factors

### Main Processing Pipeline
```typescript
async function parseAnnotations(payload: ImageFeedbackPayload): Promise<ParseResult> {
  const directives: AnnotationDirective[] = [];

  // 1. Process freehand annotations
  for (const node of payload.annotations) {
    const bbox = calculateBoundingBox(node, reactFlow.getViewport());
    const annotationType = classifyAnnotationType(node);

    // Find comments within/near this annotation
    const nearbyComments = findCommentsInRegion(
      payload.comments,
      bbox,
      radius: 50 // pixels
    );

    // Classify intent from shape + comments
    const intent = classifyIntent(annotationType, nearbyComments);

    // Generate smooth SVG path for reference
    const stroke = smoothStroke(node.data.points);
    const svgPath = getSvgPathFromStroke(stroke);

    // Map to image coordinates
    const imageBbox = transformBboxToImageSpace(
      bbox,
      payload.reactFlowNodeId,
      payload.imageMetadata
    );

    directives.push({
      id: `directive-${node.id}`,
      type: intent.type,
      priority: calculatePriority(intent.confidence, nearbyComments.length),
      region: { ...bbox, ...imageBbox },
      instruction: generateInstruction(intent, bbox, nearbyComments),
      confidence: intent.confidence,
      strokeData: svgPath,
      comments: nearbyComments.map(c => c.id),
      metadata: {
        annotationType,
        intent: intent.action,
        timestamp: node.data.timestamp,
      },
    });
  }

  // 2. Process standalone comments (no annotation)
  const orphanComments = payload.comments.filter(c =>
    !directives.some(d => d.comments.includes(c.id))
  );

  for (const comment of orphanComments) {
    directives.push(createDirectiveFromComment(comment, payload.imageMetadata));
  }

  // 3. Detect conflicts
  const conflicts = detectConflictingDirectives(directives);

  // 4. Generate coverage map
  const coverage = calculateCoverageMap(directives, payload.imageMetadata);

  // 5. Synthesize summary
  const summary = generateSummary(directives);

  return { directives, summary, conflictingDirectives: conflicts, coverageMap: coverage };
}

function generateInstruction(
  intent: { type: DirectiveType; action: string },
  bbox: BoundingBox,
  comments: VeltComment[]
): string {
  const location = `at position (${Math.round(bbox.x)}, ${Math.round(bbox.y)})`;
  const commentSummary = comments.length > 0
    ? ` - User notes: "${comments[0].thread[0].text.slice(0, 50)}..."`
    : '';

  const templates = {
    region_highlight: `Highlight and emphasize the subject in region ${location}${commentSummary}`,
    remove_element: `Remove or minimize elements in region ${location}${commentSummary}`,
    adjust_property: `Adjust visual properties in region ${location}${commentSummary}`,
    composition_change: `Modify composition and layout in region ${location}${commentSummary}`,
    focus_region: `Focus on and crop to region ${location}${commentSummary}`,
    style_modifier: `Apply style changes to region ${location}${commentSummary}`,
  };

  return templates[intent.type] || `Apply changes in region ${location}`;
}
```

## Loop Rules

### When to Process
1. User completes a freehand drawing stroke (React Flow node created)
2. User adds/resolves a Velt comment on canvas
3. User requests "Interpret Feedback" action
4. Before invoking Image Prompt Architect (downstream agent)

### Processing Flow
```
Input: ImageFeedbackPayload
  ↓
1. Load all freehand nodes from React Flow CRDT store
  ↓
2. Load all Velt comments for document/location
  ↓
3. For each freehand node:
     → Calculate bounding box
     → Classify shape (circle/arrow/scribble/rectangle)
     → Find nearby comments (spatial clustering)
     → Classify intent (shape + comment text)
     → Transform coordinates (viewport → image pixels)
     → Generate directive
  ↓
4. Process orphan comments (text-only, no annotation)
  ↓
5. Detect conflicts (overlapping contradictory directives)
  ↓
6. Calculate coverage map (which image regions have feedback)
  ↓
7. Generate summary
  ↓
Output: ParseResult with AnnotationDirective[]
```

### When to Stop
- All freehand nodes processed
- All comments processed
- ParseResult generated
- No blocking errors (malformed data, coordinate transformation failures)

### Max Iterations
Not applicable - single-pass processing pipeline. Each annotation/comment processed exactly once.

## Guardrails

### Forbidden Actions
- **NEVER modify React Flow state** - read-only access to CRDT store
- **NEVER delete or resolve comments** - only read and reference
- **NEVER generate image prompts** - that's Image Prompt Architect's job
- **NEVER execute image generation** - that's Image Job Orchestrator's job
- **NEVER update database directly** - return structured data for upstream to persist

### Data Validation
```typescript
// Required checks before processing
function validatePayload(payload: ImageFeedbackPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload.assetId) errors.push('Missing assetId');
  if (!payload.imageMetadata?.width || !payload.imageMetadata?.height) {
    errors.push('Invalid image metadata');
  }
  if (payload.annotations.length === 0 && payload.comments.length === 0) {
    errors.push('No feedback to parse - empty annotations and comments');
  }

  // Validate coordinate ranges
  for (const node of payload.annotations) {
    if (!node.data.points || node.data.points.length < 2) {
      errors.push(`Invalid points array for node ${node.id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### Error Handling
```typescript
try {
  const validation = validatePayload(payload);
  if (!validation.valid) {
    return {
      error: 'Invalid input',
      details: validation.errors,
    };
  }

  const result = await parseAnnotations(payload);

  // Sanity check output
  if (result.directives.length === 0) {
    console.warn('No directives generated from feedback');
  }

  // Flag low-confidence directives
  const lowConfidence = result.directives.filter(d => d.confidence < 0.5);
  if (lowConfidence.length > 0) {
    console.warn(`${lowConfidence.length} directives have low confidence (<0.5)`);
  }

  return result;

} catch (error) {
  console.error('Parsing failed:', error);
  return {
    error: 'Parsing failed',
    message: error.message,
    directives: [], // Return empty but valid structure
  };
}
```

### Retry Budget
**Not applicable** - deterministic parsing operation. No external API calls, no network dependencies. If parsing fails, it's due to invalid input data (should be caught by validation) or code bugs (not solvable by retry).

### Idempotency
**YES** - Same input always produces same output. Pure function with no side effects. Safe to call multiple times.

## Integration with React Flow Example Code

### Direct Usage from Freehand Demo
The freehand-draw example (`examples/react-flow-pro-demos/freehand-draw-pro-example/`) provides the exact data structures we need:

```typescript
// From example: FreehandNode.tsx
interface FreehandNodeData {
  points: Points;              // ✅ Raw pointer data
  initialSize: { width: number; height: number }; // ✅ Original bbox
}

// From example: path.ts
export const pathOptions = {
  size: 7,           // We use 4 for thinner annotation strokes
  thinning: 0.5,     // ✅ Keep this value
  smoothing: 0.5,    // ✅ Keep this value
  streamline: 0.5,   // ✅ Keep this value
};

// From example: processPoints function
// ✅ Already implements bounding box calculation
// ✅ Already handles coordinate normalization
// ✅ Already accounts for stroke thickness
```

### Extending the Example
```typescript
// Add to FreehandNode component
function FreehandNode({ id, data, width, height }: NodeProps<FreehandNodeData>) {
  // ... existing rendering code ...

  // Add classification on node creation
  useEffect(() => {
    const annotationType = classifyAnnotationType({ id, data, width, height });
    console.log(`Node ${id} classified as: ${annotationType}`);

    // Store classification in node data for later retrieval
    updateNodeData(id, { ...data, annotationType });
  }, []);

  return (
    <div className="freehand-node">
      <svg>
        <path d={pathData} fill="currentColor" />
      </svg>
    </div>
  );
}
```

## Success Criteria

### Observable Outcomes
1. **Accurate Shape Classification**: 90%+ accuracy on common patterns (circles, arrows, scribbles) in test set
2. **Correct Coordinate Mapping**: Bounding boxes align with visual annotations when overlaid on original image
3. **Intent Recognition**: Directive types match human-labeled ground truth in 85%+ of cases with comments
4. **Conflict Detection**: Successfully identifies contradictory directives (e.g., "brighten" vs "darken" same region)
5. **Complete Coverage**: All freehand nodes and comments accounted for in output - no data loss

### Quantitative Metrics
```typescript
interface QualityMetrics {
  totalAnnotations: number;
  processedAnnotations: number;
  failedAnnotations: number;
  averageConfidence: number;
  highConfidenceCount: number;    // confidence >= 0.7
  lowConfidenceCount: number;     // confidence < 0.5
  conflictCount: number;
  coveragePercentage: number;     // % of image area with feedback
  processingTimeMs: number;
}
```

### Integration Verification
- [ ] ParseResult successfully consumed by Image Prompt Architect
- [ ] Directives persist to database `runs` table with correct associations
- [ ] Velt comments correctly linked via comment IDs
- [ ] React Flow nodes remain read-only (no accidental mutations)
- [ ] Coordinate transformations validated against known test cases

## Example Usage

### Standalone Invocation
```typescript
import { parseAnnotations } from '@/agents/image-feedback-interpreter';

const payload: ImageFeedbackPayload = {
  assetId: 'asset-123',
  reactFlowNodeId: 'image-node-1',
  annotations: reactFlow.getNodes().filter(n => n.type === 'freehand'),
  comments: await velt.getCommentAnnotations({ documentId }),
  imageMetadata: {
    width: 1024,
    height: 768,
    url: 'https://storage.example.com/image.png',
    currentPrompt: 'A serene mountain landscape at sunset',
  },
};

const result = await parseAnnotations(payload);

console.log(`Generated ${result.directives.length} directives`);
console.log(`Summary: ${result.summary}`);

// Pass to next agent
const revisedPrompt = await imagePromptArchitect.revisePrompt({
  currentPrompt: payload.imageMetadata.currentPrompt,
  directives: result.directives,
});
```

### In Workflow Context
```typescript
// React Flow workflow node executor
async function executeImageFeedbackNode(nodeId: string) {
  const node = getNode(nodeId);
  const { assetId, documentId } = node.data;

  // Gather inputs
  const annotations = getNodes().filter(n => n.type === 'freehand');
  const comments = await velt.getCommentAnnotations({ documentId });
  const asset = await db.assets.findUnique({ where: { id: assetId } });

  // Invoke agent
  const result = await parseAnnotations({
    assetId,
    reactFlowNodeId: node.data.imageNodeId,
    annotations,
    comments,
    imageMetadata: {
      width: asset.meta.width,
      height: asset.meta.height,
      url: asset.url,
      currentPrompt: asset.meta.prompt,
    },
  });

  // Persist result
  await db.runs.create({
    data: {
      id: `parse-${assetId}-${Date.now()}`,
      kind: 'annotation_parse',
      subject_id: assetId,
      status: 'completed',
      payload: result,
    },
  });

  // Update node output
  updateNodeData(nodeId, { output: result });

  // Trigger downstream nodes
  const nextNodes = getOutgoers(node);
  for (const next of nextNodes) {
    await executeNode(next.id, { directives: result.directives });
  }
}
```

## Key Implementation Files

### Priority 1: Core Logic
- `agents/image-feedback-interpreter/parser.ts` - Main parseAnnotations function
- `agents/image-feedback-interpreter/shape-classifier.ts` - classifyAnnotationType, extractShapeFeatures
- `agents/image-feedback-interpreter/intent-classifier.ts` - classifyIntent, pattern matching
- `agents/image-feedback-interpreter/coordinates.ts` - viewportToImageCoords, calculateBoundingBox

### Priority 2: Utilities
- `agents/image-feedback-interpreter/stroke-utils.ts` - perfect-freehand wrappers, getSvgPathFromStroke
- `agents/image-feedback-interpreter/conflict-detector.ts` - detectConflictingDirectives
- `agents/image-feedback-interpreter/coverage-map.ts` - calculateCoverageMap

### Priority 3: Integration
- `agents/image-feedback-interpreter/types.ts` - All TypeScript interfaces
- `agents/image-feedback-interpreter/validation.ts` - validatePayload, error handling
- `agents/image-feedback-interpreter/index.ts` - Public API exports

## References

### External Documentation
- **perfect-freehand API**: https://github.com/steveruizok/perfect-freehand
- **React Flow Custom Nodes**: https://reactflow.dev/api-reference/types/node
- **React Flow Coordinates**: https://reactflow.dev/api-reference/hooks/use-react-flow#screen-to-flow-position
- **Velt Comments API**: https://docs.velt.dev/api-reference/comments/get-comment-annotations

### Internal References
- Freehand drawing example: React Flow Pro demos
- Master scope agent spec: Project management documentation
- CLAUDE.md patterns: Critical implementation patterns

### Downstream Agents
- **Image Prompt Architect** - Consumes `AnnotationDirective[]` to revise prompts
- **Image Job Orchestrator** - Triggers regeneration based on revised prompts
- **Research Summarizer** - May use directives to guide research queries
