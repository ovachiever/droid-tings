#!/usr/bin/env python3
"""
Codebase Analysis Script for Frontend Migration

Analyzes existing frontend codebases (React, Vue, Angular, vanilla JS) to:
- Detect framework and version
- Inventory components
- Analyze dependencies
- Map file structure
- Assess complexity

Usage:
    python analyze-codebase.py /path/to/codebase
    python analyze-codebase.py /path/to/codebase --output custom-analysis.json
"""

import os
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set
from collections import defaultdict

class CodebaseAnalyzer:
    def __init__(self, root_path: str):
        self.root_path = Path(root_path).resolve()
        self.analysis = {
            "framework": {"name": "unknown", "version": "unknown"},
            "build_tool": "unknown",
            "components": [],
            "file_structure": {},
            "dependencies": {},
            "dev_dependencies": {},
            "styling_approach": [],
            "state_management": [],
            "routing": "unknown",
            "total_files": 0,
            "component_count": 0,
            "complexity_score": 0
        }

    def analyze(self) -> Dict:
        """Run full codebase analysis"""
        print(f"🔍 Analyzing codebase at: {self.root_path}")

        # Step 1: Analyze package.json
        self._analyze_package_json()

        # Step 2: Detect framework from dependencies
        self._detect_framework()

        # Step 3: Detect build tool
        self._detect_build_tool()

        # Step 4: Analyze file structure
        self._analyze_file_structure()

        # Step 5: Inventory components
        self._inventory_components()

        # Step 6: Detect styling approach
        self._detect_styling_approach()

        # Step 7: Detect state management
        self._detect_state_management()

        # Step 8: Detect routing
        self._detect_routing()

        # Step 9: Calculate complexity score
        self._calculate_complexity()

        print(f"✅ Analysis complete!")
        print(f"   Framework: {self.analysis['framework']['name']} {self.analysis['framework']['version']}")
        print(f"   Components: {self.analysis['component_count']}")
        print(f"   Complexity: {self.analysis['complexity_score']}/100")

        return self.analysis

    def _analyze_package_json(self):
        """Parse package.json for dependencies"""
        package_json_path = self.root_path / "package.json"

        if not package_json_path.exists():
            print("⚠️  No package.json found")
            return

        with open(package_json_path) as f:
            package_data = json.load(f)

        self.analysis["dependencies"] = package_data.get("dependencies", {})
        self.analysis["dev_dependencies"] = package_data.get("devDependencies", {})

        print(f"📦 Found {len(self.analysis['dependencies'])} dependencies")

    def _detect_framework(self):
        """Detect frontend framework and version"""
        deps = {**self.analysis["dependencies"], **self.analysis["dev_dependencies"]}

        # React detection
        if "react" in deps:
            self.analysis["framework"] = {
                "name": "React",
                "version": deps["react"]
            }

        # Next.js detection
        elif "next" in deps:
            self.analysis["framework"] = {
                "name": "Next.js",
                "version": deps["next"]
            }

        # Vue detection
        elif "vue" in deps:
            self.analysis["framework"] = {
                "name": "Vue",
                "version": deps["vue"]
            }

        # Angular detection
        elif "@angular/core" in deps:
            self.analysis["framework"] = {
                "name": "Angular",
                "version": deps["@angular/core"]
            }

        # Svelte detection
        elif "svelte" in deps:
            self.analysis["framework"] = {
                "name": "Svelte",
                "version": deps["svelte"]
            }

        # Vanilla JS
        else:
            self.analysis["framework"] = {
                "name": "Vanilla JavaScript",
                "version": "N/A"
            }

    def _detect_build_tool(self):
        """Detect build tool (Vite, Webpack, Parcel, etc.)"""
        deps = {**self.analysis["dependencies"], **self.analysis["dev_dependencies"]}

        if "vite" in deps:
            self.analysis["build_tool"] = f"Vite {deps['vite']}"
        elif "webpack" in deps:
            self.analysis["build_tool"] = f"Webpack {deps['webpack']}"
        elif "parcel" in deps or "parcel-bundler" in deps:
            self.analysis["build_tool"] = "Parcel"
        elif "@vitejs/plugin-react" in deps:
            self.analysis["build_tool"] = "Vite"
        elif "react-scripts" in deps:
            self.analysis["build_tool"] = f"Create React App {deps['react-scripts']}"
        elif "next" in deps:
            self.analysis["build_tool"] = "Next.js (built-in)"
        elif "@angular/cli" in deps:
            self.analysis["build_tool"] = "Angular CLI"
        else:
            # Check for config files
            if (self.root_path / "vite.config.js").exists() or (self.root_path / "vite.config.ts").exists():
                self.analysis["build_tool"] = "Vite"
            elif (self.root_path / "webpack.config.js").exists():
                self.analysis["build_tool"] = "Webpack"

    def _analyze_file_structure(self):
        """Analyze project file structure"""
        structure = {}

        # Common source directories
        possible_src_dirs = ["src", "app", "pages", "components", "lib"]

        for dir_name in possible_src_dirs:
            dir_path = self.root_path / dir_name
            if dir_path.exists() and dir_path.is_dir():
                structure[dir_name] = self._count_files_by_type(dir_path)

        self.analysis["file_structure"] = structure
        self.analysis["total_files"] = sum(
            sum(counts.values()) for counts in structure.values()
        )

    def _count_files_by_type(self, directory: Path) -> Dict[str, int]:
        """Count files by extension in directory"""
        counts = defaultdict(int)

        for file_path in directory.rglob("*"):
            if file_path.is_file():
                ext = file_path.suffix
                if ext:
                    counts[ext] += 1

        return dict(counts)

    def _inventory_components(self):
        """Inventory all components in the codebase"""
        framework_name = self.analysis["framework"]["name"]

        # Look for components in common directories
        search_dirs = [
            self.root_path / "src",
            self.root_path / "app",
            self.root_path / "components",
            self.root_path / "src" / "components",
            self.root_path / "app" / "components"
        ]

        components = []

        for search_dir in search_dirs:
            if not search_dir.exists():
                continue

            if framework_name == "React" or framework_name == "Next.js":
                components.extend(self._find_react_components(search_dir))
            elif framework_name == "Vue":
                components.extend(self._find_vue_components(search_dir))
            elif framework_name == "Angular":
                components.extend(self._find_angular_components(search_dir))

        self.analysis["components"] = components
        self.analysis["component_count"] = len(components)

    def _find_react_components(self, directory: Path) -> List[Dict]:
        """Find React components (functional and class)"""
        components = []

        # React component file extensions
        for ext in [".tsx", ".jsx", ".ts", ".js"]:
            for file_path in directory.rglob(f"*{ext}"):
                component = self._analyze_react_file(file_path)
                if component:
                    components.append(component)

        return components

    def _analyze_react_file(self, file_path: Path) -> Optional[Dict]:
        """Analyze a React file for component information"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return None

        # Skip test files
        if '.test.' in file_path.name or '.spec.' in file_path.name:
            return None

        # Check if it's a component
        is_functional = bool(re.search(r'(export\s+(default\s+)?function|const\s+\w+\s*=\s*\([^)]*\)\s*=>)', content))
        is_class = bool(re.search(r'class\s+\w+\s+extends\s+(React\.)?Component', content))

        if not (is_functional or is_class):
            return None

        # Extract component name
        component_name = file_path.stem

        # Detect complexity indicators
        hardcoded_colors = len(re.findall(r'#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(', content))
        inline_styles = len(re.findall(r'style\s*=\s*\{\{', content))
        has_styled_components = 'styled.' in content or 'styled(' in content
        has_emotion = '@emotion' in content

        # Try to map to shadcn equivalent (simple heuristic)
        shadcn_equivalent = self._guess_shadcn_equivalent(component_name, content)

        # Estimate complexity
        complexity = "simple"
        if hardcoded_colors > 5 or inline_styles > 3 or len(content) > 500:
            complexity = "medium"
        if len(content) > 1000 or has_styled_components or has_emotion:
            complexity = "high"

        return {
            "name": component_name,
            "path": str(file_path.relative_to(self.root_path)),
            "type": "class" if is_class else "functional",
            "complexity": complexity,
            "shadcn_equivalent": shadcn_equivalent,
            "hardcoded_values": {
                "colors": hardcoded_colors,
                "inline_styles": inline_styles
            },
            "styling": {
                "styled_components": has_styled_components,
                "emotion": has_emotion
            }
        }

    def _find_vue_components(self, directory: Path) -> List[Dict]:
        """Find Vue components (.vue files)"""
        components = []

        for file_path in directory.rglob("*.vue"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                component_name = file_path.stem
                hardcoded_colors = len(re.findall(r'#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(', content))

                components.append({
                    "name": component_name,
                    "path": str(file_path.relative_to(self.root_path)),
                    "type": "vue",
                    "complexity": "medium" if len(content) > 500 else "simple",
                    "shadcn_equivalent": self._guess_shadcn_equivalent(component_name, content),
                    "hardcoded_values": {
                        "colors": hardcoded_colors
                    }
                })
            except:
                continue

        return components

    def _find_angular_components(self, directory: Path) -> List[Dict]:
        """Find Angular components (.component.ts files)"""
        components = []

        for file_path in directory.rglob("*.component.ts"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Extract component name from decorator
                match = re.search(r'selector:\s*[\'"]([^\'"]+)[\'"]', content)
                component_name = match.group(1) if match else file_path.stem

                components.append({
                    "name": component_name,
                    "path": str(file_path.relative_to(self.root_path)),
                    "type": "angular",
                    "complexity": "medium" if len(content) > 500 else "simple",
                    "shadcn_equivalent": self._guess_shadcn_equivalent(component_name, content)
                })
            except:
                continue

        return components

    def _guess_shadcn_equivalent(self, component_name: str, content: str) -> Optional[str]:
        """Heuristic to guess shadcn equivalent component"""
        name_lower = component_name.lower()

        # Simple mappings based on common naming
        mappings = {
            "button": "Button",
            "btn": "Button",
            "card": "Card",
            "modal": "Dialog",
            "dialog": "Dialog",
            "input": "Input",
            "textfield": "Input",
            "select": "Select",
            "dropdown": "DropdownMenu",
            "table": "Table",
            "badge": "Badge",
            "tag": "Badge",
            "alert": "Alert",
            "toast": "Toast",
            "notification": "Toast",
            "tooltip": "Tooltip",
            "popover": "Popover",
            "tabs": "Tabs",
            "accordion": "Accordion",
            "checkbox": "Checkbox",
            "radio": "RadioGroup",
            "avatar": "Avatar",
            "breadcrumb": "Breadcrumb",
            "calendar": "Calendar",
            "datepicker": "Calendar",
            "form": "Form",
            "sheet": "Sheet",
            "drawer": "Sheet",
            "menu": "DropdownMenu"
        }

        for key, value in mappings.items():
            if key in name_lower:
                return value

        return None

    def _detect_styling_approach(self):
        """Detect styling approach used in codebase"""
        deps = {**self.analysis["dependencies"], **self.analysis["dev_dependencies"]}
        approaches = []

        if "styled-components" in deps:
            approaches.append(f"styled-components {deps['styled-components']}")
        if "@emotion/react" in deps or "@emotion/styled" in deps:
            approaches.append("Emotion")
        if "tailwindcss" in deps:
            approaches.append(f"Tailwind CSS {deps['tailwindcss']}")
        if "sass" in deps or "node-sass" in deps:
            approaches.append("SASS/SCSS")
        if "less" in deps:
            approaches.append("LESS")

        # Check for CSS files
        css_files = list(self.root_path.rglob("*.css"))
        scss_files = list(self.root_path.rglob("*.scss"))

        if css_files:
            approaches.append(f"CSS ({len(css_files)} files)")
        if scss_files:
            approaches.append(f"SCSS ({len(scss_files)} files)")

        self.analysis["styling_approach"] = approaches if approaches else ["Unknown"]

    def _detect_state_management(self):
        """Detect state management libraries"""
        deps = {**self.analysis["dependencies"], **self.analysis["dev_dependencies"]}
        state_libs = []

        if "redux" in deps or "@reduxjs/toolkit" in deps:
            state_libs.append("Redux")
        if "mobx" in deps or "mobx-react" in deps:
            state_libs.append("MobX")
        if "zustand" in deps:
            state_libs.append("Zustand")
        if "recoil" in deps:
            state_libs.append("Recoil")
        if "jotai" in deps:
            state_libs.append("Jotai")
        if "@tanstack/react-query" in deps or "react-query" in deps:
            state_libs.append("TanStack Query (React Query)")
        if "swr" in deps:
            state_libs.append("SWR")

        self.analysis["state_management"] = state_libs if state_libs else ["React built-in (useState, useReducer)"]

    def _detect_routing(self):
        """Detect routing library"""
        deps = {**self.analysis["dependencies"], **self.analysis["dev_dependencies"]}

        if "next" in deps:
            self.analysis["routing"] = "Next.js (built-in)"
        elif "react-router-dom" in deps or "react-router" in deps:
            self.analysis["routing"] = f"React Router {deps.get('react-router-dom', deps.get('react-router', ''))}"
        elif "vue-router" in deps:
            self.analysis["routing"] = f"Vue Router {deps['vue-router']}"
        elif "@angular/router" in deps:
            self.analysis["routing"] = "Angular Router"
        else:
            self.analysis["routing"] = "Unknown / No routing"

    def _calculate_complexity(self):
        """Calculate overall migration complexity score (0-100)"""
        score = 0

        # Base complexity by framework
        framework = self.analysis["framework"]["name"]
        if framework == "Vanilla JavaScript":
            score += 40  # Higher complexity - no existing component structure
        elif framework == "Vue":
            score += 30
        elif framework == "Angular":
            score += 35
        elif framework == "React":
            score += 15
        elif framework == "Next.js":
            score += 5   # Easiest - already Next.js

        # Component count complexity
        component_count = self.analysis["component_count"]
        if component_count > 100:
            score += 30
        elif component_count > 50:
            score += 20
        elif component_count > 20:
            score += 10
        else:
            score += 5

        # Styling complexity
        styling = self.analysis["styling_approach"]
        if any("styled-components" in s or "Emotion" in s for s in styling):
            score += 15  # Higher complexity - need to convert CSS-in-JS
        elif "Tailwind CSS" in str(styling):
            score += 5   # Lower complexity - already using Tailwind
        else:
            score += 10  # Medium complexity

        # State management complexity
        state_mgmt = self.analysis["state_management"]
        if any("Redux" in s or "MobX" in s for s in state_mgmt):
            score += 10

        # Hardcoded values detected in components
        total_hardcoded_colors = sum(
            comp.get("hardcoded_values", {}).get("colors", 0)
            for comp in self.analysis["components"]
        )
        if total_hardcoded_colors > 100:
            score += 10
        elif total_hardcoded_colors > 50:
            score += 5

        self.analysis["complexity_score"] = min(score, 100)

    def save_to_file(self, output_path: str = "codebase-analysis.json"):
        """Save analysis to JSON file"""
        output_file = Path(output_path)

        with open(output_file, 'w') as f:
            json.dump(self.analysis, f, indent=2)

        print(f"\n💾 Analysis saved to: {output_file.resolve()}")
        return output_file


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze-codebase.py /path/to/codebase [--output filename.json]")
        sys.exit(1)

    codebase_path = sys.argv[1]
    output_file = "codebase-analysis.json"

    # Check for output flag
    if "--output" in sys.argv:
        output_index = sys.argv.index("--output")
        if len(sys.argv) > output_index + 1:
            output_file = sys.argv[output_index + 1]

    if not os.path.exists(codebase_path):
        print(f"❌ Error: Path does not exist: {codebase_path}")
        sys.exit(1)

    # Run analysis
    analyzer = CodebaseAnalyzer(codebase_path)
    analysis = analyzer.analyze()
    analyzer.save_to_file(output_file)

    print("\n" + "="*60)
    print("📊 ANALYSIS SUMMARY")
    print("="*60)
    print(f"Framework:        {analysis['framework']['name']} {analysis['framework']['version']}")
    print(f"Build Tool:       {analysis['build_tool']}")
    print(f"Components:       {analysis['component_count']}")
    print(f"Styling:          {', '.join(analysis['styling_approach'])}")
    print(f"State Management: {', '.join(analysis['state_management'])}")
    print(f"Routing:          {analysis['routing']}")
    print(f"Complexity Score: {analysis['complexity_score']}/100")
    print("="*60)


if __name__ == "__main__":
    main()
