---
description: Understand First, Implement Once - validate requirements and generate multi-solution plan before coding
argument-hint: <your request or feature description>
---

# 🎯 UFIO: Understand First, Implement Once

**User Request**: $ARGUMENTS

---

## Phase 1: Requirements Extraction & Validation

**CRITICAL RULE**: Do NOT implement any code until user confirms understanding and approves a plan.

### Step 1: Parse the Request

Analyze the user's request and extract:

**Explicit Requirements** (what user explicitly said):
- [List each requirement the user stated]

**Implicit Requirements** (needed but not stated):
- [List requirements that are implied or necessary]

**Assumptions I'm Making** (could be wrong):
- [List every assumption - these MUST be validated]

**Ambiguities Needing Clarification**:
- [List anything unclear or that could be interpreted multiple ways]

### Step 2: Context Gathering

Before proposing solutions, gather context:
- Read relevant existing code files
- Understand current architecture and patterns
- Identify all affected components
- Note existing conventions to follow

### Step 3: Validation Checkpoint

Present your understanding back to the user:

```markdown
## My Understanding of Your Request

**You asked for**: "$ARGUMENTS"

**Explicit requirements**:
1. [Requirement 1]
2. [Requirement 2]

**Implicit requirements**:
1. [Implicit 1]
2. [Implicit 2]

**Assumptions I'm making** (PLEASE CONFIRM OR CORRECT):
1. [Assumption 1] - IS THIS CORRECT?
2. [Assumption 2] - IS THIS CORRECT?

**Questions I need answered**:
1. [Question 1]
2. [Question 2]

🛑 **STOP**: Is this understanding correct? Any clarifications needed?
```

**DO NOT PROCEED until user confirms understanding is correct.**

---

## Phase 2: Solution Generation (3+ Approaches)

**ONLY after user confirms understanding**, generate at least 3 solution approaches:

### Solution A: [Simple/Straightforward Approach]

**Core Strategy**: [One sentence summary]

**Architecture Changes**:
- Component/File X: [what changes]
- Module Y: [what changes]
- Database/API Z: [what changes if applicable]

**Data Flow**:
```
User action → [step 1] → [step 2] → Result
```

**Files Modified** (estimated):
- `path/to/file1.tsx` (X lines changed)
- `path/to/file2.ts` (Y lines changed)

**Pros**:
✅ [Advantage 1]
✅ [Advantage 2]
✅ [Advantage 3]

**Cons**:
❌ [Disadvantage 1]
❌ [Disadvantage 2]

**Trade-offs**:
- Complexity: [Low/Medium/High]
- Performance: [Impact]
- Maintainability: [Assessment]
- Extensibility: [Assessment]

**Estimated Effort**: [X hours / Y lines of code]

**Edge Cases Handled**:
1. [Edge case 1]: [how handled]
2. [Edge case 2]: [how handled]

**Risk Level**: [Low/Medium/High]
**Confidence**: [0-100%] this will work on first attempt

---

### Solution B: [Optimal/Performant Approach]

[Same structure as Solution A]

---

### Solution C: [Flexible/Extensible Approach]

[Same structure as Solution A]

---

## Phase 3: Comparison & Recommendation

### Comparison Matrix

| Criteria           | Solution A | Solution B | Solution C |
|--------------------|------------|------------|------------|
| Complexity         | [rating]   | [rating]   | [rating]   |
| Performance        | [rating]   | [rating]   | [rating]   |
| Maintainability    | [rating]   | [rating]   | [rating]   |
| Extensibility      | [rating]   | [rating]   | [rating]   |
| Lines Changed      | [number]   | [number]   | [number]   |
| Risk Level         | [level]    | [level]    | [level]    |
| Time to Implement  | [time]     | [time]     | [time]     |
| First-Time Success | [%]        | [%]        | [%]        |

### My Recommendation

**I recommend Solution [X]** because:
- [Reason 1]
- [Reason 2]
- [Reason 3]

**HOWEVER**, if your priority is [different aspect], then Solution [Y] would be better.

### 🎯 Your Decision Needed

Which solution should I implement?

**A)** Solution A: [name]  
**B)** Solution B: [name]  
**C)** Solution C: [name]  
**D)** Hybrid: [specify which parts from which solutions]  
**E)** None - let me clarify requirements further

**Optional refinements**:
- Change [aspect X] in chosen solution
- Add [feature Y] to implementation  
- Skip [part Z] for now

🛑 **STOP**: Do NOT proceed until user chooses a solution.

---

## Phase 4: Detailed Implementation Plan

**ONLY after user chooses a solution**, create detailed implementation plan:

### Implementation Plan for Solution [User's Choice]

#### Phase 1: Preparation (5 minutes)
- [ ] Create feature branch: `feature/[descriptive-name]`
- [ ] Read existing files: [list specific files]
- [ ] Verify dependencies installed: [list]
- [ ] Backup current state: `git stash` (if needed)

#### Phase 2: Core Implementation (Single Session)

**File 1**: `path/to/file1.tsx`

```diff
// Lines XX-YY (BEFORE)
[show current code exactly as it is]

// Lines XX-ZZ (AFTER)
[show new code with changes highlighted]

// EXPLANATION: [why this change]
```

**File 2**: `path/to/file2.ts` (NEW FILE or MODIFIED)

```typescript
// [Complete implementation or specific changes]

// EXPLANATION: [purpose and integration]
```

[Continue for ALL affected files...]

#### Phase 3: Testing & Verification

**Automated Tests**:
```bash
# Run these commands in order
npm run lint
npm run type-check
npm test
npm run build
```

**Manual Verification**:
1. [Specific test step 1]
   - Expected: [outcome]
2. [Specific test step 2]
   - Expected: [outcome]

**Edge Case Testing**:
1. Test [edge case 1]: [how to test]
2. Test [edge case 2]: [how to test]

#### Phase 4: Commit & Documentation

```bash
# Stage changes
git add [list specific files]

# Commit with conventional commit format
git commit -m "feat: [description]

Implemented Solution [X] from UFIO planning session.

Changes:
- [Change 1]
- [Change 2]

Closes #[issue] (if applicable)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

#### Phase 5: Rollback Plan (If Needed)

**If implementation fails**:
```bash
# Rollback steps
git reset --hard HEAD~1  # Undo commit
git stash pop  # Restore previous state (if stashed)
[Other rollback steps specific to changes]
```

### Pre-Implementation Checklist

Before executing the plan, verify:

- [ ] User has approved this specific solution
- [ ] All ambiguities from Phase 1 are resolved
- [ ] All files to be modified have been read and understood
- [ ] All dependencies are available
- [ ] Test strategy is clear and complete
- [ ] Rollback plan is documented
- [ ] I am confident this will work on first attempt

### 🎯 Final Approval Needed

**Here is my complete implementation plan.**

Review the plan above. Does it accurately implement your chosen solution?

**Approve?**
- ✅ **Yes** → I'll execute the plan now in ONE session
- ❌ **No** → What should I change? [user specifies modifications]
- ⏸️ **Wait** → I need to think about [aspect]

🛑 **STOP**: Do NOT implement until user explicitly approves.

---

## Phase 5: Execution (ONLY After Approval)

**User has approved**: [Yes/No - wait for confirmation]

**If approved**, execute the implementation plan:

1. **Make ALL changes in ONE editing session** (no iterative fixes)
2. **Follow the plan exactly** (no deviations without user permission)
3. **Run all tests** (lint, type-check, unit tests, build)
4. **Perform manual verification** (follow verification steps)
5. **Commit with detailed message** (explain what and why)
6. **Report results** (show test output, confirm success criteria met)

**If blocked during implementation**:
```markdown
🚨 IMPLEMENTATION BLOCKER DETECTED

**Issue**: [describe the blocker]
**Why**: [root cause]
**Impact**: [cannot proceed with current plan because X]

**Options**:
A) [Alternative approach that addresses blocker]
B) [Different solution that avoids issue]
C) [Stop and re-plan this section]

Which should I do?
```

---

## Success Criteria

Implementation succeeds when:
- [ ] All tests pass (lint, type-check, unit tests, build)
- [ ] Manual verification confirms expected behavior
- [ ] Edge cases handled correctly
- [ ] No regressions introduced
- [ ] Code follows existing patterns and conventions
- [ ] User confirms: **"This is exactly what I wanted"**

---

## Anti-Patterns to AVOID

❌ **DON'T**:
- Jump straight to implementation without validating understanding
- Make assumptions without confirming them
- Choose a solution for the user without presenting options
- Implement before getting plan approval
- Try different approaches if first fails (should succeed on first attempt)
- Make "quick fixes" outside the approved plan

✅ **DO**:
- Surface ALL assumptions upfront
- Present multiple solutions with trade-offs
- Get explicit user approval at each gate
- Simulate mentally before implementing
- Execute plan in single session once approved
- Stop and re-plan if blocked, don't improvise

---

## Metrics Tracking

For this request:
- **Understanding Phase**: [tokens used]
- **Solution Generation**: [tokens used]
- **Planning Phase**: [tokens used]
- **Implementation Phase**: [tokens used]
- **Total Tokens**: [sum]
- **Time Elapsed**: [minutes]
- **First-Time Success**: [Yes/No]
- **User Satisfaction**: [Perfect! / Good / Needs adjustment]

Compare to estimated no-UFIO cost: [estimated tokens if implemented without planning]

**Savings**: [X]% tokens, [Y]% time, [Z]% frustration reduction

---

**Remember**: The cost of one clarifying question (100 tokens) is infinitely cheaper than five failed implementations (50,000 tokens).

**Core Principle**: UNDERSTAND DEEPLY → SIMULATE MENTALLY → VALIDATE WITH USER → IMPLEMENT ONCE → SUCCEED IMMEDIATELY

**Prime Directive**: Do NOT write or modify any code until Phases 1-4 are complete and user has explicitly approved the implementation plan.
