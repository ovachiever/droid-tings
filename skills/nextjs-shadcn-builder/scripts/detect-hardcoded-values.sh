#!/bin/bash

#
# Hardcoded Values Detection Script
#
# Scans frontend codebase for anti-patterns:
# - Hardcoded colors (#hex, rgb(), rgba(), hsl(), color names)
# - Inline spacing values (margin, padding with px, rem, em)
# - Inline styles (style={{...}})
# - Custom styled-components/emotion
# - Non-standard font declarations
# - Magic numbers
#
# Usage:
#   bash detect-hardcoded-values.sh /path/to/codebase
#   bash detect-hardcoded-values.sh /path/to/codebase --output report.md
#

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default output file
OUTPUT_FILE="hardcoded-values-report.md"

# Parse arguments
if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/codebase [--output filename.md]"
    exit 1
fi

CODEBASE_PATH="$1"

# Check for output flag
if [ "$2" == "--output" ] && [ -n "$3" ]; then
    OUTPUT_FILE="$3"
fi

if [ ! -d "$CODEBASE_PATH" ]; then
    echo -e "${RED}❌ Error: Directory does not exist: $CODEBASE_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Scanning for hardcoded values in: $CODEBASE_PATH${NC}"
echo ""

# Initialize counters
total_violations=0

# Create temporary files for results
TEMP_COLORS=$(mktemp)
TEMP_SPACING=$(mktemp)
TEMP_INLINE_STYLES=$(mktemp)
TEMP_STYLED_COMPONENTS=$(mktemp)
TEMP_FONTS=$(mktemp)
TEMP_ARBITRARY=$(mktemp)

# Cleanup temp files on exit
trap "rm -f $TEMP_COLORS $TEMP_SPACING $TEMP_INLINE_STYLES $TEMP_STYLED_COMPONENTS $TEMP_FONTS $TEMP_ARBITRARY" EXIT

# File patterns to search
FILE_PATTERNS="-name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' -o -name '*.css' -o -name '*.scss'"

echo -e "${YELLOW}📊 Analyzing codebase...${NC}"

# 1. Detect hardcoded hex colors
echo -e "${BLUE}[1/6] Searching for hardcoded hex colors...${NC}"
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' -o -name '*.css' -o -name '*.scss' \) \
    -type f -exec grep -Hn "#[0-9a-fA-F]\{3,6\}" {} \; 2>/dev/null > "$TEMP_COLORS" || true

# 2. Detect rgb/rgba/hsl colors
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' -o -name '*.css' -o -name '*.scss' \) \
    -type f -exec grep -Hn -E "rgb\(|rgba\(|hsl\(|hsla\(" {} \; 2>/dev/null >> "$TEMP_COLORS" || true

# 3. Detect inline spacing (margin, padding with px/rem/em)
echo -e "${BLUE}[2/6] Searching for hardcoded spacing values...${NC}"
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' -o -name '*.css' -o -name '*.scss' \) \
    -type f -exec grep -Hn -E "(margin|padding|gap|width|height):\s*[0-9]+\s*(px|rem|em)" {} \; 2>/dev/null > "$TEMP_SPACING" || true

# Also check for inline style objects with spacing
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' \) \
    -type f -exec grep -Hn -E "(margin|padding).*:\s*['\"]?[0-9]+\s*(px|rem|em)" {} \; 2>/dev/null >> "$TEMP_SPACING" || true

# 4. Detect inline styles (style={{...}})
echo -e "${BLUE}[3/6] Searching for inline styles...${NC}"
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' \) \
    -type f -exec grep -Hn "style\s*=\s*{{" {} \; 2>/dev/null > "$TEMP_INLINE_STYLES" || true

# 5. Detect styled-components / emotion
echo -e "${BLUE}[4/6] Searching for styled-components/emotion usage...${NC}"
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' \) \
    -type f -exec grep -Hn -E "(styled\.|styled\(|css\`)" {} \; 2>/dev/null > "$TEMP_STYLED_COMPONENTS" || true

# 6. Detect custom fonts
echo -e "${BLUE}[5/6] Searching for custom font declarations...${NC}"
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.css' -o -name '*.scss' -o -name '*.tsx' -o -name '*.jsx' \) \
    -type f -exec grep -Hn -E "font-family:\s*['\"](?!(system-ui|sans-serif|serif|monospace|inherit|var\())" {} \; 2>/dev/null > "$TEMP_FONTS" || true

# 7. Detect Tailwind arbitrary values (which often indicate hardcoding)
echo -e "${BLUE}[6/6] Searching for Tailwind arbitrary values...${NC}"
find "$CODEBASE_PATH" \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o \
    \( -name '*.tsx' -o -name '*.jsx' -o -name '*.ts' -o -name '*.js' -o -name '*.vue' \) \
    -type f -exec grep -Hn -E "className.*\[#[0-9a-fA-F]{3,6}\]|\[[0-9]+px\]" {} \; 2>/dev/null > "$TEMP_ARBITRARY" || true

echo ""
echo -e "${GREEN}✅ Scan complete! Generating report...${NC}"

# Count violations
color_count=$(wc -l < "$TEMP_COLORS")
spacing_count=$(wc -l < "$TEMP_SPACING")
inline_style_count=$(wc -l < "$TEMP_INLINE_STYLES")
styled_component_count=$(wc -l < "$TEMP_STYLED_COMPONENTS")
font_count=$(wc -l < "$TEMP_FONTS")
arbitrary_count=$(wc -l < "$TEMP_ARBITRARY")

total_violations=$((color_count + spacing_count + inline_style_count + styled_component_count + font_count + arbitrary_count))

# Generate markdown report
cat > "$OUTPUT_FILE" << EOF
# Hardcoded Values Detection Report

**Date:** $(date)
**Codebase:** $CODEBASE_PATH
**Total Violations:** $total_violations

---

## Summary

| Category | Count |
|----------|-------|
| Hardcoded Colors | $color_count |
| Hardcoded Spacing | $spacing_count |
| Inline Styles | $inline_style_count |
| styled-components/emotion | $styled_component_count |
| Custom Fonts | $font_count |
| Tailwind Arbitrary Values | $arbitrary_count |
| **TOTAL** | **$total_violations** |

---

## Detailed Findings

EOF

# Add hardcoded colors section
if [ $color_count -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### 1. Hardcoded Colors ($color_count violations)

**Issue:** Colors are hardcoded instead of using CSS variables or Tailwind semantic classes.

**Examples:**

\`\`\`
EOF
    head -n 20 "$TEMP_COLORS" >> "$OUTPUT_FILE"
    if [ $color_count -gt 20 ]; then
        echo "... and $((color_count - 20)) more" >> "$OUTPUT_FILE"
    fi
    cat >> "$OUTPUT_FILE" << EOF
\`\`\`

**Fix:**
- Replace with CSS variables: \`hsl(var(--primary))\`
- Use Tailwind classes: \`bg-primary\`, \`text-foreground\`, etc.
- Define colors in \`globals.css\` under \`:root\`

---

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### 1. Hardcoded Colors ✅

No hardcoded colors detected.

---

EOF
fi

# Add hardcoded spacing section
if [ $spacing_count -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### 2. Hardcoded Spacing ($spacing_count violations)

**Issue:** Spacing values are hardcoded instead of using Tailwind spacing scale.

**Examples:**

\`\`\`
EOF
    head -n 20 "$TEMP_SPACING" >> "$OUTPUT_FILE"
    if [ $spacing_count -gt 20 ]; then
        echo "... and $((spacing_count - 20)) more" >> "$OUTPUT_FILE"
    fi
    cat >> "$OUTPUT_FILE" << EOF
\`\`\`

**Fix:**
- Use Tailwind spacing: \`p-4\`, \`m-6\`, \`gap-2\`, etc.
- For custom values, use CSS variables: \`var(--spacing-custom)\`

---

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### 2. Hardcoded Spacing ✅

No hardcoded spacing detected.

---

EOF
fi

# Add inline styles section
if [ $inline_style_count -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### 3. Inline Styles ($inline_style_count violations)

**Issue:** Inline styles used instead of Tailwind classes.

**Examples:**

\`\`\`
EOF
    head -n 20 "$TEMP_INLINE_STYLES" >> "$OUTPUT_FILE"
    if [ $inline_style_count -gt 20 ]; then
        echo "... and $((inline_style_count - 20)) more" >> "$OUTPUT_FILE"
    fi
    cat >> "$OUTPUT_FILE" << EOF
\`\`\`

**Fix:**
- Replace \`style={{...}}\` with Tailwind className
- Use \`cn()\` utility for conditional classes

---

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### 3. Inline Styles ✅

No inline styles detected.

---

EOF
fi

# Add styled-components section
if [ $styled_component_count -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### 4. styled-components / Emotion ($styled_component_count instances)

**Issue:** CSS-in-JS libraries used instead of Tailwind CSS + shadcn/ui.

**Examples:**

\`\`\`
EOF
    head -n 20 "$TEMP_STYLED_COMPONENTS" >> "$OUTPUT_FILE"
    if [ $styled_component_count -gt 20 ]; then
        echo "... and $((styled_component_count - 20)) more" >> "$OUTPUT_FILE"
    fi
    cat >> "$OUTPUT_FILE" << EOF
\`\`\`

**Fix:**
- Convert styled-components to shadcn/ui components
- Replace with Tailwind classes
- Remove styled-components/emotion dependencies

---

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### 4. styled-components / Emotion ✅

No CSS-in-JS libraries detected.

---

EOF
fi

# Add custom fonts section
if [ $font_count -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### 5. Custom Fonts ($font_count instances)

**Issue:** Custom fonts declared instead of using design system fonts.

**Examples:**

\`\`\`
EOF
    head -n 20 "$TEMP_FONTS" >> "$OUTPUT_FILE"
    if [ $font_count -gt 20 ]; then
        echo "... and $((font_count - 20)) more" >> "$OUTPUT_FILE"
    fi
    cat >> "$OUTPUT_FILE" << EOF
\`\`\`

**Fix:**
- Use Tailwind font utilities: \`font-sans\`, \`font-serif\`, \`font-mono\`
- Define custom fonts in Tailwind config if needed
- Use CSS variables for font families

---

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### 5. Custom Fonts ✅

No custom font declarations detected.

---

EOF
fi

# Add arbitrary values section
if [ $arbitrary_count -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### 6. Tailwind Arbitrary Values ($arbitrary_count instances)

**Issue:** Arbitrary values used in Tailwind classes (indicates hardcoding).

**Examples:**

\`\`\`
EOF
    head -n 20 "$TEMP_ARBITRARY" >> "$OUTPUT_FILE"
    if [ $arbitrary_count -gt 20 ]; then
        echo "... and $((arbitrary_count - 20)) more" >> "$OUTPUT_FILE"
    fi
    cat >> "$OUTPUT_FILE" << EOF
\`\`\`

**Fix:**
- Replace with standard Tailwind classes
- Use CSS variables: \`bg-[var(--custom)]\` if absolutely necessary
- Extend Tailwind config for custom values

---

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### 6. Tailwind Arbitrary Values ✅

No arbitrary values detected.

---

EOF
fi

# Add recommendations section
cat >> "$OUTPUT_FILE" << EOF
## Recommendations

EOF

if [ $total_violations -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
### Priority Actions

1. **Define Design System in CSS Variables**
   - Create/update \`app/globals.css\` with all color tokens
   - Define spacing, typography, and other design tokens
   - Use HSL format for colors to support dark mode

2. **Systematic Conversion**
   - Convert components in batches (5-10 at a time)
   - Start with simple components
   - Test after each batch

3. **Remove CSS-in-JS Libraries**
   - Uninstall styled-components, emotion, etc.
   - Replace with Tailwind CSS + shadcn/ui components
   - Update build configuration

4. **Establish Component Standards**
   - Use only shadcn/ui components for UI primitives
   - Compose complex components from shadcn primitives
   - No custom buttons, inputs, cards, etc.

5. **Verification**
   - Re-run this script after conversion
   - Target: 0 violations
   - Set up pre-commit hooks to prevent new violations

### Severity Assessment

- **Low Risk** (< 50 violations): Straightforward cleanup
- **Medium Risk** (50-200 violations): Systematic refactoring needed
- **High Risk** (> 200 violations): Major migration effort required

**Your Project: ${total_violations} violations = $(
    if [ $total_violations -lt 50 ]; then
        echo "Low Risk ✅"
    elif [ $total_violations -lt 200 ]; then
        echo "Medium Risk ⚠️"
    else
        echo "High Risk ⛔"
    fi
)**

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
### ✅ Excellent!

No hardcoded values detected. Your codebase follows shadcn/ui best practices:

- Uses CSS variables for theming
- Consistent design tokens
- No inline styles or hardcoded values
- Ready for Next.js + shadcn/ui

EOF
fi

cat >> "$OUTPUT_FILE" << EOF
---

## Next Steps

1. Review this report with your team
2. Create migration plan based on findings
3. Set up Next.js + shadcn/ui infrastructure
4. Begin systematic conversion
5. Re-run detection after each batch

Generated by: \`detect-hardcoded-values.sh\`
EOF

echo ""
echo -e "${GREEN}📝 Report generated: $OUTPUT_FILE${NC}"
echo ""
echo "="*60
echo -e "${BLUE}📊 RESULTS SUMMARY${NC}"
echo "="*60
echo -e "Hardcoded Colors:       ${YELLOW}$color_count${NC}"
echo -e "Hardcoded Spacing:      ${YELLOW}$spacing_count${NC}"
echo -e "Inline Styles:          ${YELLOW}$inline_style_count${NC}"
echo -e "styled-components:      ${YELLOW}$styled_component_count${NC}"
echo -e "Custom Fonts:           ${YELLOW}$font_count${NC}"
echo -e "Arbitrary Values:       ${YELLOW}$arbitrary_count${NC}"
echo "="*60
echo -e "TOTAL VIOLATIONS:       ${RED}$total_violations${NC}"
echo "="*60

if [ $total_violations -eq 0 ]; then
    echo -e "${GREEN}✅ No violations found! Codebase follows shadcn best practices.${NC}"
else
    echo -e "${YELLOW}⚠️  Found $total_violations violations. See $OUTPUT_FILE for details.${NC}"
fi

echo ""
