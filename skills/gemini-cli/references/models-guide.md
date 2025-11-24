# Gemini Models Comparison Guide

Based on systematic testing (2025-11-08, updated 2025-11-19 for Gemini 3)

---

## Available Models

### gemini-3-pro-preview (Latest - Preview)

**Status**: 🆕 Preview release (November 18, 2025)

**Characteristics**:
- Google's newest and most intelligent AI model
- State-of-the-art reasoning and multimodal understanding
- Outperforms Gemini 2.5 Pro on every major AI benchmark
- Supports text, image, video, audio, and PDF inputs
- Response time: TBD (in testing)
- Higher cost (preview pricing)

**Best For**:
- Most complex reasoning tasks
- Critical architectural decisions requiring deep analysis
- Advanced multimodal understanding
- Cutting-edge capabilities and benchmarks
- When absolute best quality is required

**Example**:
```bash
gemini -m gemini-3-pro-preview -p "Complex architectural decision requiring deep analysis"
cat complex-diagram.png | gemini -m gemini-3-pro-preview -p "Analyze this system architecture diagram"
```

**⚠️ Preview Status**: Model is in preview. Use for evaluation and testing. Consider using gemini-2.5-pro for production-critical decisions until Gemini 3 reaches stable release.

---

### gemini-2.5-flash (Default)

**Characteristics**:
- Fast response time: ~5-25 seconds (average ~20s)
- Good quality for most tasks: ⭐⭐⭐⭐
- Prioritizes: Performance, simplicity, speed
- Safe with directory scanning
- Lower cost

**Best For**:
- Code reviews
- Debugging (root cause analysis is strong)
- Directory/file scanning
- General questions
- When speed matters

**Example**:
```bash
cat src/auth.ts | gemini -p "Review this code"
echo "Error message here" | gemini -p "Help debug this error"
```

---

### gemini-2.5-pro

**Characteristics**:
- Response time: ~15-30 seconds (average ~23s, often similar to Flash!)
- Excellent quality: ⭐⭐⭐⭐⭐
- Prioritizes: Correctness, consistency, thoroughness
- May get confused with directory scanning (tries to use tools)
- Higher cost

**Best For**:
- Architecture decisions (critical)
- Security audits (thorough)
- Complex reasoning tasks
- When accuracy > speed
- Major refactoring plans

**Example**:
```bash
gemini -m gemini-2.5-pro -p "Should I use D1 or KV for session storage? Explain trade-offs."
cat ./src/api/* | gemini -m gemini-2.5-pro -p "Perform a security audit on this code"
```

---

### gemini-2.5-flash-lite

**Status**: ❌ **Not accessible via Gemini CLI**

Model exists in Gemini API but returns 404 error when accessed via CLI. Do not use.

---

## When Models Disagree

**Critical Finding**: Flash and Pro can give **opposite recommendations** for the same question, and **both can be valid**.

**Example** (D1 vs KV for sessions):
- **Flash**: Recommends KV
  - Prioritizes: Performance, edge caching, TTL
  - "Usually acceptable" eventual consistency

- **Pro**: Recommends D1
  - Prioritizes: Strong consistency, SQL queries
  - "Critical" consistency for sessions

**Why This Happens**:
- Flash: Performance-focused
- Pro: Consistency-focused

**How to Handle**:
1. For critical/security decisions → Prefer Pro's perspective
2. For performance-sensitive apps → Consider Flash's perspective
3. For major architectural choices → Get both viewpoints:
   ```bash
   gemini -p "Question?"  # Flash (default)
   gemini -m gemini-2.5-pro -p "Same question"  # Pro
   ```

---

## Model Selection Matrix

| Task Type | Recommended Model | Why |
|-----------|-------------------|-----|
| Quick questions | Flash | Acceptable quality, fast |
| Architecture decisions | **3-Pro-Preview** or **2.5-Pro** | Most thorough trade-off analysis |
| Security reviews | **3-Pro-Preview** or **2.5-Pro** | Catches subtle issues |
| Debug assistance | Flash or 2.5-Pro | Root cause analysis is good enough |
| Code review | Flash | Comprehensive enough for most cases |
| Directory scanning | Flash | Pro models may get confused, use tools |
| Whole project analysis | **3-Pro-Preview** or **2.5-Pro** | Better with 1M context |
| Complex multimodal tasks | **3-Pro-Preview** | Best multimodal understanding |
| Cutting-edge evaluation | **3-Pro-Preview** | Latest capabilities |

---

## Performance Comparison

Based on testing with same question ("D1 vs KV for sessions"):

| Model | Time | Quality | Recommendation |
|-------|------|---------|----------------|
| Flash | ~25s | ⭐⭐⭐⭐ | KV (performance) |
| Pro | ~23s | ⭐⭐⭐⭐⭐ | D1 (consistency) |
| Flash-lite | 404 error | N/A | Not accessible |

**Key Finding**: Pro isn't significantly slower than Flash on many queries!

---

## Override Default Model

```bash
# Use Pro for single command
gemini -m gemini-2.5-pro -p "Review this code" < src/auth.ts

# Or set as environment variable for all commands in session
export GEMINI_MODEL=gemini-2.5-pro
gemini -p "Review this code" < src/auth.ts
gemini -p "Architecture question here"
```

---

## Recommendations

**Default Strategy**: Use Flash for most tasks, Pro (2.5 or 3) for critical decisions

**When to Consider Gemini 3 Pro Preview**:
- Cutting-edge projects requiring latest capabilities
- Complex multimodal analysis (images, videos, PDFs)
- Most critical architectural decisions
- Benchmark-critical applications
- Evaluation of newest features
- When cost is not primary concern

**When to Use Gemini 2.5 Pro** (Stable):
- Production-critical decisions
- Security audits
- Major refactors
- Stable, proven performance required
- Cost-effective Pro-level analysis

**When Flash is Better**:
- Quick code reviews
- Debugging
- Directory/file scanning
- Non-critical questions
- Cost-sensitive workflows

**When to Get Multiple Perspectives**:
- Critical architectural decisions
- Technology choices that affect entire project
- Performance vs consistency trade-offs
- Compare preview vs stable recommendations

---

**Last Updated**: 2025-11-19 (Gemini 3 preview release)
**Source**: Systematic testing documented in `gemini-experiments.md` + official Gemini 3 announcement
