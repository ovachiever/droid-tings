#!/usr/bin/env python3
"""
Migration Report Generator

Combines data from codebase analysis and hardcoded values detection
to create a comprehensive migration plan with:
- Executive summary
- Component mapping table
- Batch organization
- Estimated effort and complexity
- Actionable recommendations

Usage:
    python generate-migration-report.py
    python generate-migration-report.py --analysis custom-analysis.json
    python generate-migration-report.py --output custom-report.md
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List
from collections import defaultdict

class MigrationReportGenerator:
    def __init__(self, analysis_file: str = "codebase-analysis.json"):
        self.analysis_file = Path(analysis_file)
        self.analysis = {}
        self.report_lines = []

    def load_analysis(self):
        """Load codebase analysis JSON"""
        if not self.analysis_file.exists():
            print(f"❌ Error: Analysis file not found: {self.analysis_file}")
            print("Run analyze-codebase.py first to generate analysis data")
            sys.exit(1)

        with open(self.analysis_file) as f:
            self.analysis = json.load(f)

        print(f"📖 Loaded analysis from: {self.analysis_file}")

    def generate_report(self) -> str:
        """Generate comprehensive migration report"""
        self.report_lines = []

        self._add_header()
        self._add_executive_summary()
        self._add_current_state_analysis()
        self._add_component_inventory()
        self._add_component_mapping_table()
        self._add_batch_organization()
        self._add_complexity_assessment()
        self._add_migration_roadmap()
        self._add_recommendations()
        self._add_footer()

        return "\n".join(self.report_lines)

    def _add_header(self):
        """Add report header"""
        self.report_lines.extend([
            "# Frontend Migration Analysis Report",
            "",
            f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Migration Type:** {self.analysis['framework']['name']} → Next.js + shadcn/ui",
            "",
            "---",
            ""
        ])

    def _add_executive_summary(self):
        """Add executive summary"""
        framework = self.analysis['framework']['name']
        version = self.analysis['framework']['version']
        component_count = self.analysis['component_count']
        complexity = self.analysis['complexity_score']

        # Complexity level
        if complexity < 30:
            complexity_level = "Low"
            emoji = "✅"
        elif complexity < 60:
            complexity_level = "Moderate"
            emoji = "⚠️"
        else:
            complexity_level = "High"
            emoji = "🔴"

        self.report_lines.extend([
            "## Executive Summary",
            "",
            f"This report analyzes the migration of a **{framework} {version}** application to **Next.js 15+ with shadcn/ui**.",
            "",
            "**Key Metrics:**",
            "",
            f"- **Framework:** {framework} {version}",
            f"- **Components:** {component_count}",
            f"- **Build Tool:** {self.analysis['build_tool']}",
            f"- **Complexity:** {complexity}/100 ({complexity_level}) {emoji}",
            "",
            "**Migration Approach:**",
            "",
            "This migration will be executed in **5 phases** using a systematic batch-based approach:",
            "1. Codebase Analysis (Complete)",
            "2. Migration Planning (This Report)",
            "3. Next.js + shadcn Setup",
            "4. Component Conversion (Batch by Batch)",
            "5. Verification & Cleanup",
            "",
            "---",
            ""
        ])

    def _add_current_state_analysis(self):
        """Add current state analysis"""
        self.report_lines.extend([
            "## Current State Analysis",
            "",
            "### Technology Stack",
            "",
            f"- **Framework:** {self.analysis['framework']['name']} {self.analysis['framework']['version']}",
            f"- **Build Tool:** {self.analysis['build_tool']}",
            f"- **Styling:** {', '.join(self.analysis['styling_approach'])}",
            f"- **State Management:** {', '.join(self.analysis['state_management'])}",
            f"- **Routing:** {self.analysis['routing']}",
            ""
        ])

        # File structure
        if self.analysis['file_structure']:
            self.report_lines.extend([
                "### File Structure",
                "",
                "| Directory | File Types |",
                "|-----------|------------|"
            ])

            for directory, files in self.analysis['file_structure'].items():
                file_summary = ", ".join([f"{ext} ({count})" for ext, count in files.items()])
                self.report_lines.append(f"| `{directory}/` | {file_summary} |")

            self.report_lines.extend(["", ""])

        # Dependencies summary
        dep_count = len(self.analysis['dependencies'])
        dev_dep_count = len(self.analysis['dev_dependencies'])

        self.report_lines.extend([
            "### Dependencies",
            "",
            f"- **Production Dependencies:** {dep_count}",
            f"- **Dev Dependencies:** {dev_dep_count}",
            f"- **Total:** {dep_count + dev_dep_count}",
            "",
            "---",
            ""
        ])

    def _add_component_inventory(self):
        """Add component inventory section"""
        components = self.analysis['components']

        # Categorize by complexity
        simple = [c for c in components if c.get('complexity') == 'simple']
        medium = [c for c in components if c.get('complexity') == 'medium']
        high = [c for c in components if c.get('complexity') == 'high']

        self.report_lines.extend([
            "## Component Inventory",
            "",
            f"**Total Components:** {len(components)}",
            "",
            "### By Complexity",
            "",
            "| Complexity | Count | Description |",
            "|------------|-------|-------------|",
            f"| ✅ Simple | {len(simple)} | Direct shadcn mapping, minimal changes needed |",
            f"| ⚠️ Medium | {len(medium)} | Requires adaptation, some custom logic |",
            f"| 🔴 High | {len(high)} | Complex components, significant refactoring |",
            "",
            "### By Type",
            ""
        ])

        # Group by type
        type_counts = defaultdict(int)
        for comp in components:
            comp_type = comp.get('type', 'unknown')
            type_counts[comp_type] += 1

        for comp_type, count in sorted(type_counts.items()):
            self.report_lines.append(f"- **{comp_type.title()}:** {count} components")

        self.report_lines.extend(["", "---", ""])

    def _add_component_mapping_table(self):
        """Add component mapping table"""
        components = self.analysis['components']

        # Filter components that have shadcn equivalents
        mappable = [c for c in components if c.get('shadcn_equivalent')]
        custom_needed = [c for c in components if not c.get('shadcn_equivalent')]

        self.report_lines.extend([
            "## Component Mapping Strategy",
            "",
            f"**Direct shadcn Mappings:** {len(mappable)} components",
            f"**Custom Development Needed:** {len(custom_needed)} components",
            ""
        ])

        if mappable:
            self.report_lines.extend([
                "### Components with shadcn Equivalents",
                "",
                "| Current Component | File | shadcn Equivalent | Complexity |",
                "|-------------------|------|-------------------|------------|"
            ])

            # Show top 20 or all if less
            for comp in mappable[:20]:
                name = comp['name']
                path = comp['path']
                shadcn = comp.get('shadcn_equivalent', 'N/A')
                complexity = comp.get('complexity', 'unknown')

                # Complexity emoji
                emoji = "✅" if complexity == "simple" else "⚠️" if complexity == "medium" else "🔴"

                self.report_lines.append(f"| {name} | `{path}` | {shadcn} | {emoji} {complexity} |")

            if len(mappable) > 20:
                self.report_lines.append(f"| ... | ... | ... | *{len(mappable) - 20} more* |")

            self.report_lines.extend(["", ""])

        if custom_needed:
            self.report_lines.extend([
                "### Components Requiring Custom Development",
                "",
                "These components don't have direct shadcn equivalents and will need to be built using shadcn primitives:",
                ""
            ])

            for comp in custom_needed[:15]:
                self.report_lines.append(f"- **{comp['name']}** (`{comp['path']}`) - Complexity: {comp.get('complexity', 'unknown')}")

            if len(custom_needed) > 15:
                self.report_lines.append(f"- *... and {len(custom_needed) - 15} more*")

            self.report_lines.extend(["", ""])

        self.report_lines.extend(["---", ""])

    def _add_batch_organization(self):
        """Add batch organization plan"""
        components = self.analysis['components']

        # Organize into batches
        batches = self._create_batches(components)

        self.report_lines.extend([
            "## Batch Organization Plan",
            "",
            f"**Total Batches:** {len(batches)}",
            "",
            "Components will be converted in systematic batches of 5-10 components each.",
            ""
        ])

        for i, batch in enumerate(batches, 1):
            component_names = [c['name'] for c in batch['components']]

            self.report_lines.extend([
                f"### Batch {i}: {batch['name']}",
                "",
                f"**Priority:** {batch['priority']}",
                f"**Component Count:** {len(batch['components'])}",
                f"**Estimated Complexity:** {batch['complexity']}",
                "",
                "**Components:**",
                ""
            ])

            for comp in batch['components']:
                shadcn = comp.get('shadcn_equivalent', 'Custom')
                self.report_lines.append(f"- {comp['name']} → {shadcn}")

            self.report_lines.extend(["", ""])

        self.report_lines.extend(["---", ""])

    def _create_batches(self, components: List[Dict]) -> List[Dict]:
        """Organize components into conversion batches"""
        batches = []

        # Batch 1: Layout components
        layout_components = [c for c in components if any(
            keyword in c['name'].lower()
            for keyword in ['layout', 'header', 'footer', 'sidebar', 'nav', 'container']
        )][:8]

        if layout_components:
            batches.append({
                "name": "Layout & Structure",
                "priority": "Critical",
                "complexity": "Medium",
                "components": layout_components
            })

        # Batch 2: Simple UI components
        simple_ui = [c for c in components
                     if c.get('complexity') == 'simple'
                     and c not in layout_components][:10]

        if simple_ui:
            batches.append({
                "name": "Simple UI Components",
                "priority": "High",
                "complexity": "Low",
                "components": simple_ui
            })

        # Batch 3: Form components
        form_components = [c for c in components if any(
            keyword in c['name'].lower()
            for keyword in ['input', 'form', 'select', 'checkbox', 'radio', 'button']
        ) and c not in layout_components and c not in simple_ui][:10]

        if form_components:
            batches.append({
                "name": "Form Components",
                "priority": "High",
                "complexity": "Medium",
                "components": form_components
            })

        # Batch 4: Medium complexity components
        medium_components = [c for c in components
                            if c.get('complexity') == 'medium'
                            and c not in layout_components
                            and c not in simple_ui
                            and c not in form_components][:10]

        if medium_components:
            batches.append({
                "name": "Medium Complexity Components",
                "priority": "Medium",
                "complexity": "Medium",
                "components": medium_components
            })

        # Batch 5: High complexity components
        high_components = [c for c in components if c.get('complexity') == 'high'][:8]

        if high_components:
            batches.append({
                "name": "Complex Components",
                "priority": "Medium",
                "complexity": "High",
                "components": high_components
            })

        # Batch 6: Remaining components
        all_batched = []
        for batch in batches:
            all_batched.extend(batch['components'])

        remaining = [c for c in components if c not in all_batched]

        # Split remaining into batches of 10
        while remaining:
            batch_components = remaining[:10]
            remaining = remaining[10:]

            batches.append({
                "name": f"Additional Components {len(batches) - 4}",
                "priority": "Low",
                "complexity": "Mixed",
                "components": batch_components
            })

        return batches

    def _add_complexity_assessment(self):
        """Add complexity assessment section"""
        score = self.analysis['complexity_score']

        # Determine level
        if score < 30:
            level = "Low"
            description = "This migration should be straightforward with minimal challenges."
            emoji = "✅"
        elif score < 60:
            level = "Moderate"
            description = "This migration will require systematic planning but is manageable."
            emoji = "⚠️"
        else:
            level = "High"
            description = "This migration is complex and will require significant effort and planning."
            emoji = "🔴"

        self.report_lines.extend([
            "## Complexity Assessment",
            "",
            f"**Overall Complexity Score:** {score}/100 ({level}) {emoji}",
            "",
            description,
            "",
            "### Complexity Factors",
            ""
        ])

        # Framework complexity
        framework = self.analysis['framework']['name']
        if framework == "Vanilla JavaScript":
            self.report_lines.append("- **Framework:** Vanilla JavaScript (High complexity - no component structure)")
        elif framework in ["Vue", "Angular"]:
            self.report_lines.append(f"- **Framework:** {framework} (Medium complexity - different paradigms)")
        elif framework == "React":
            self.report_lines.append("- **Framework:** React (Low complexity - similar patterns)")
        elif framework == "Next.js":
            self.report_lines.append("- **Framework:** Next.js (Very low - already Next.js)")

        # Component count
        comp_count = self.analysis['component_count']
        if comp_count > 100:
            self.report_lines.append(f"- **Component Count:** {comp_count} (High - large codebase)")
        elif comp_count > 50:
            self.report_lines.append(f"- **Component Count:** {comp_count} (Medium - moderately sized)")
        else:
            self.report_lines.append(f"- **Component Count:** {comp_count} (Low - small codebase)")

        # Styling approach
        styling = self.analysis['styling_approach']
        if any('styled-components' in s or 'Emotion' in s for s in styling):
            self.report_lines.append("- **Styling:** CSS-in-JS (Higher complexity - needs conversion to Tailwind)")
        elif 'Tailwind' in str(styling):
            self.report_lines.append("- **Styling:** Tailwind CSS (Low complexity - already compatible)")
        else:
            self.report_lines.append("- **Styling:** Traditional CSS/SCSS (Medium complexity)")

        self.report_lines.extend(["", "---", ""])

    def _add_migration_roadmap(self):
        """Add detailed migration roadmap"""
        batches = self._create_batches(self.analysis['components'])

        self.report_lines.extend([
            "## Migration Roadmap",
            "",
            "### Phase 1: Codebase Analysis ✅",
            "",
            "- [x] Run codebase analysis",
            "- [x] Detect hardcoded values",
            "- [x] Generate migration report",
            "",
            "### Phase 2: Migration Planning ⏳",
            "",
            "- [x] Component mapping",
            "- [x] Batch organization",
            "- [ ] Review and approve plan",
            "- [ ] Set up project timeline",
            "",
            "### Phase 3: Next.js + shadcn Setup",
            "",
            "- [ ] Initialize Next.js project",
            "- [ ] Install shadcn/ui",
            "- [ ] Configure CSS variables",
            "- [ ] Set up theme provider",
            "- [ ] Install essential shadcn components",
            "- [ ] Install shadcn MCP server",
            "",
            "### Phase 4: Systematic Conversion",
            ""
        ])

        for i, batch in enumerate(batches, 1):
            self.report_lines.append(f"- [ ] **Batch {i}:** {batch['name']} ({len(batch['components'])} components)")

        self.report_lines.extend([
            "",
            "### Phase 5: Verification & Cleanup",
            "",
            "- [ ] Run full test suite",
            "- [ ] Visual regression testing",
            "- [ ] Performance audit (Lighthouse)",
            "- [ ] Accessibility audit",
            "- [ ] Final hardcoded values check (target: 0 violations)",
            "- [ ] Remove old framework code",
            "- [ ] Update documentation",
            "",
            "---",
            ""
        ])

    def _add_recommendations(self):
        """Add recommendations section"""
        framework = self.analysis['framework']['name']

        self.report_lines.extend([
            "## Recommendations",
            "",
            "### Priority Actions",
            "",
            "1. **Review Framework-Specific Guide**",
            ""
        ])

        if framework == "React":
            self.report_lines.append("   - Read `./references/react-to-nextjs.md` for React-specific patterns")
        elif framework == "Vue":
            self.report_lines.append("   - Read `./references/vue-to-nextjs.md` for Vue-specific patterns")
        elif framework == "Angular":
            self.report_lines.append("   - Read `./references/angular-to-nextjs.md` for Angular-specific patterns")

        self.report_lines.extend([
            "   - Read `./references/shadcn-component-mapping.md` for component equivalents",
            "   - Read `./references/styling-migration.md` for styling conversion",
            "",
            "2. **Set Up MCP Integration**",
            "   ```bash",
            "   npx shadcn@latest mcp init --client claude",
            "   ```",
            "   This enables real-time shadcn documentation access during development.",
            "",
            "3. **Initialize Next.js Project**",
            "   ```bash",
            "   bash ./scripts/init-nextjs-shadcn.sh my-new-app",
            "   ```",
            "",
            "4. **Start with High-Priority Batches**",
            "   - Begin with Layout & Structure components",
            "   - Test thoroughly after each batch",
            "   - Ensure functionality preserved",
            "",
            "5. **Use Systematic Conversion Process**",
            "   - Convert 5-10 components per batch",
            "   - Run tests after each batch",
            "   - Use MCP to discover shadcn components",
            "   - Remove all hardcoded values",
            "",
            "### Best Practices",
            "",
            "- **No Hardcoded Values:** Use CSS variables for everything",
            "- **Standard Components Only:** Use shadcn/ui components exclusively",
            "- **Test Continuously:** Run tests after each batch",
            "- **Query MCP:** Always check MCP for component examples",
            "- **Incremental Migration:** Keep old code working during transition",
            "",
            "### Risk Mitigation",
            ""
        ])

        # Add specific risks based on analysis
        complexity = self.analysis['complexity_score']

        if complexity > 60:
            self.report_lines.extend([
                "- **High Complexity Detected:**",
                "  - Consider parallel codebase approach (old + new)",
                "  - Allocate extra time for testing",
                "  - Plan for potential blockers",
                ""
            ])

        if 'styled-components' in str(self.analysis['styling_approach']):
            self.report_lines.extend([
                "- **CSS-in-JS Migration:**",
                "  - Budget extra time for styling conversion",
                "  - Create CSS variable mapping document",
                "  - Consider automated conversion tools",
                ""
            ])

        if self.analysis['component_count'] > 50:
            self.report_lines.extend([
                "- **Large Component Count:**",
                "  - Use batch-based approach strictly",
                "  - Set up automated testing",
                "  - Consider feature flags for gradual rollout",
                ""
            ])

        self.report_lines.extend(["---", ""])

    def _add_footer(self):
        """Add report footer"""
        self.report_lines.extend([
            "## Next Steps",
            "",
            "1. **Review this report** with your team",
            "2. **Approve migration plan** and timeline",
            "3. **Set up Next.js project** using `init-nextjs-shadcn.sh`",
            "4. **Install MCP server** for shadcn documentation",
            "5. **Begin Phase 4** with Batch 1 components",
            "",
            "---",
            "",
            f"*Report generated by `generate-migration-report.py` on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*",
            ""
        ])

    def save_to_file(self, output_path: str = "migration-plan.md"):
        """Save report to markdown file"""
        output_file = Path(output_path)

        with open(output_file, 'w') as f:
            f.write("\n".join(self.report_lines))

        print(f"💾 Report saved to: {output_file.resolve()}")
        return output_file


def main():
    analysis_file = "codebase-analysis.json"
    output_file = "migration-plan.md"

    # Parse arguments
    if "--analysis" in sys.argv:
        index = sys.argv.index("--analysis")
        if len(sys.argv) > index + 1:
            analysis_file = sys.argv[index + 1]

    if "--output" in sys.argv:
        index = sys.argv.index("--output")
        if len(sys.argv) > index + 1:
            output_file = sys.argv[index + 1]

    print("📊 Generating Migration Report...")
    print("")

    # Generate report
    generator = MigrationReportGenerator(analysis_file)
    generator.load_analysis()
    report = generator.generate_report()
    generator.save_to_file(output_file)

    print("")
    print("✅ Migration report generated successfully!")
    print("")
    print("📄 Review the report and proceed with Phase 3: Next.js + shadcn Setup")
    print("")


if __name__ == "__main__":
    main()
