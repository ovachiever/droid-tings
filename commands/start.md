---
description: Comprehensive project onboarding briefing for any codebase
argument-hint: (optional: focus area)
---

Please perform a comprehensive project onboarding analysis using the project-onboarding-briefer custom droid.

Deliver a complete system briefing covering:

1. **System Overview** - Purpose, tech stack, production status
2. **Architecture Layers** - All major components with key files and patterns
3. **Data Flow** - End-to-end pipeline visualization
4. **Key Technical Achievements** - Recent innovations with before/after analysis
5. **Quality Validation** - Test results, metrics, validation status
6. **Git Evolution** - Last 30 commits organized by theme
7. **Code Statistics** - File counts by language, documentation coverage
8. **Strengths** - What's exceptional (evidence-based)
9. **Enhancement Opportunities** - Gaps with actionable recommendations and code examples
10. **Next Steps Roadmap** - Phased onboarding plan (week-by-week)
11. **Professional Assessment** - Ratings (1-5 stars) for maturity, quality, architecture, docs, automation, business value
12. **Final Verdict** - Readiness statement

## Analysis Guidelines

Execute systematically using parallel tool execution:

### Phase 1: Documentation Review (PARALLEL)
- Read README.md, AGENTS.md, all *_STATUS.md, *_OVERVIEW.md, *_FLOW.md files
- Identify system purpose, architecture, business value
- Map documentation hierarchy

### Phase 2: Architecture Analysis (PARALLEL)
- Scan all layer AGENTS.md files (orchestrator, domains, synthesis, etc.)
- Identify key directories and their purposes
- Read package.json, requirements.txt, or equivalent config files
- Analyze technology stack (languages, frameworks, databases, APIs)
- Map data flow (input → processing → storage → output)

### Phase 3: Automation & Scripts (PARALLEL)
- Read all bin/*.sh, scripts/*.ts, scripts/*.py files
- Identify automation workflows (CI/CD, publishing, deployment)
- Document manual vs. automated steps

### Phase 4: Git History (SEQUENTIAL)
```bash
git log --oneline --graph --all -30
git status
```
- Analyze recent commits for feature evolution
- Identify active development areas
- Track system maturity trends

### Phase 5: Generated Outputs (PARALLEL)
- Glob for sample outputs (reports, builds, artifacts)
- Assess output quality and structure
- Understand deliverable format

### Phase 6: Code Statistics (PARALLEL)
```bash
find . -name "*.md" -type f | wc -l
find . -name "*.ts" -type f | wc -l
find . -name "*.tsx" -type f | wc -l
find . -name "*.py" -type f | wc -l
find . -name "*.js" -type f | wc -l
find . -name "*.java" -type f | wc -l
find . -name "*.go" -type f | wc -l
```

## Critical Guidelines

- **NO ASSUMPTIONS**: Base all findings on actual code, commits, and documentation
- **PARALLEL EXECUTION**: Use TodoWrite + parallel tool calls for 2-4 min completion
- **EVIDENCE-BASED**: Every claim must reference specific files, commits, or data
- **ACTIONABLE**: All recommendations must include code examples or specific steps
- **PROFESSIONAL TONE**: This is a hire-ready briefing, not casual exploration
- **COMPREHENSIVE**: Cover architecture, code, git history, outputs, and roadmap

## Output Format

Deliver as structured markdown briefing (1,500-3,000 words):

```markdown
# [PROJECT_NAME] - Comprehensive System Briefing

## System Overview
- **Purpose**: [1-2 sentence description]
- **Tech Stack**: [Languages | Frameworks | Databases | APIs]
- **Current State**: [Development/Staging/Production + validation status]

## Architecture Layers
### Layer 1: [Name]
- **Purpose**: [What it does]
- **Key Files**: [Critical files]
- **Pattern**: [How it works]

[... continue for all layers ...]

## Data Flow (End-to-End)
[Text or ASCII flow showing complete pipeline]

## Key Technical Achievements
1. **[Achievement]**
   - **Before**: [Old state]
   - **After**: [New state]
   - **Result**: [Impact]
   - **Implementation**: [How it works]

## Quality Validation
[Table of tested scenarios, metrics, results]

## Git Evolution (Last 30 Commits)
[Chronological summary organized by theme]

## Code Statistics
- X Markdown files (documentation)
- X TypeScript files (if applicable)
- X Python files (if applicable)
[... etc ...]

## Strengths (What's Exceptional)
1. [Strength with evidence from code/commits]
2. [Strength with evidence]
[... 5-7 total ...]

## Areas for Enhancement (Professional Observations)
### 1. [Area Name]
**Current State**: [What exists]
**Gap**: [What's missing]
**Impact**: [Why it matters]
**Recommendation**: [Code example or specific steps]

[... 3-5 total ...]

## Recommended Next Steps (If Hired)
### Phase 1: [Focus] (Week 1)
- [Task 1]
- [Task 2]
- [Task 3]

### Phase 2: [Focus] (Week 2)
[... etc ...]

## Professional Assessment
- **System Maturity**: ⭐⭐⭐⭐⭐ (X/5) - [Reasoning]
- **Code Quality**: ⭐⭐⭐⭐⭐ (X/5) - [Reasoning]
- **Architecture**: ⭐⭐⭐⭐⭐ (X/5) - [Reasoning]
- **Documentation**: ⭐⭐⭐⭐⭐ (X/5) - [Reasoning]
- **Automation**: ⭐⭐⭐⭐⭐ (X/5) - [Reasoning]
- **Business Value**: ⭐⭐⭐⭐⭐ (X/5) - [Reasoning]

## Final Verdict
**READY TO WORK PROFESSIONALLY ON THIS CODEBASE** ✅

[Summary of understanding and readiness]
```

## Performance Target
- **Analysis Time**: 2-4 minutes (parallel execution)
- **Briefing Length**: 1,500-3,000 words
- **Code References**: 15+ specific files mentioned
- **Git Commits**: Last 30 analyzed
- **Recommendations**: 3-5 actionable with code examples

$ARGUMENTS
