# Droid Tings 🤖

A comprehensive, curated collection of **375 skills** and **155 custom droids** for Claude AI and Factory's Droid system. This repository aggregates the best skills and droids from multiple sources into a single, well-organized collection ready for immediate use.

## 📊 Collection Statistics

- **Total Skills:** 375
- **Total Droids:** 155
- **Total Commands:** 2
- **Combined Resources:** 532
- **Categories:** AI/ML, Development, Scientific Research, Business, Security, Design, and more
- **Sources:** 15+ open-source repositories + personal custom droids
- **Format:** Factory-compatible SKILL.md, droid .md, and command .md files

## 🎯 What's Included

### 🎪 Custom Droids (155 droids)
Autonomous AI agents with specialized expertise:
- **Languages:** Python, TypeScript, Rust, Go, Java, C++, Ruby, Elixir, Scala, PHP, and more
- **AI/ML Specialists:** Prompt engineers, MLOps, model training, inference optimization
- **Architecture:** System architects, database architects, cloud architects, Kubernetes experts
- **Security:** Blue team, red team, security coders, compliance experts
- **Business:** Content marketing, sales automation, customer support, business analysis
- **Scientific:** Fixed star astrology, harmonic mathematics, temporal analysis
- **Quality & Compliance:** ISO 13485, ISO 27001, FDA, GDPR, MDR specialists
- **DevOps:** CI/CD, infrastructure, observability, incident response
- **Frontend/Backend:** Senior engineers for all major stacks
- **Data:** Data engineers, data scientists, analytics specialists

### 🎮 Custom Commands (2 commands)
Reusable workflow commands for common tasks:
- **start** - Comprehensive project onboarding briefing for any codebase
  - Systematic analysis using project-onboarding-briefer droid
  - Complete system overview, architecture layers, data flow visualization
  - Git evolution analysis, code statistics, quality validation
  - Professional assessment with ratings and enhancement recommendations
  - Phased onboarding roadmap for new team members
- **understand** - "Understand First, Implement Once" (UFIO) methodology
  - Requirements extraction and validation before coding
  - Multi-solution approach generation with trade-off analysis
  - Detailed implementation planning with approval gates
  - Single-session execution for first-time success
  - Comprehensive verification and rollback procedures

### AI & Machine Learning (80+ skills)
- **LLM Frameworks:** LangChain, LlamaIndex, DSPy, Guidance, Instructor
- **Training & Fine-tuning:** TRL, Axolotl, Unsloth, LLaMA-Factory, DeepSpeed
- **Inference & Serving:** vLLM, SGLang, TensorRT-LLM, LLaMA.cpp
- **Optimization:** LoRA, QLoRA, GPTQ, Flash Attention, Model Pruning
- **Safety & Alignment:** Constitutional AI, LlamaGuard, NeMo Guardrails
- **Evaluation:** LM Evaluation Harness, MLflow, Weights & Biases

### Scientific Research (120+ skills)
- **Bioinformatics:** Biopython, scanpy, scvi-tools, PyDESeq2, AnnData
- **Cheminformatics:** RDKit, DeepChem, Datamol, MolFeat
- **Data Analysis:** Pandas, Polars, Dask, Vaex, SciPy, Statsmodels
- **Visualization:** Matplotlib, Seaborn, Plotly, NetworkX
- **Machine Learning:** Scikit-learn, PyTorch Lightning, SHAP
- **Databases:** PubMed, UniProt, PDB, ChEMBL, KEGG, DrugBank, COSMIC

### Development & Engineering (100+ skills)
- **Frontend:** React, Next.js, TailwindCSS, shadcn/ui, Zustand
- **Backend:** Node.js, FastAPI, Django, Express, Hono
- **Databases:** PostgreSQL, Drizzle ORM, Supabase
- **Cloud:** Cloudflare Workers (18 skills), Vercel, AWS
- **AI Integration:** OpenAI, Anthropic, Google Gemini, ElevenLabs
- **Testing:** Playwright, Vitest, Jest, E2E patterns

### Business & Product (40+ skills)
- **Product Management:** PRD templates, roadmaps, user stories
- **Marketing:** Content creation, SEO, demand generation
- **Quality & Regulatory:** ISO 13485, ISO 27001, FDA compliance, GDPR
- **Executive:** CEO advisor, CTO advisor, business analysis

### Documentation & Writing (25+ skills)
- **Scientific Writing:** LaTeX, research papers, citations, peer review
- **Clinical:** Clinical reports, treatment plans, clinical decision support
- **Technical:** API documentation, README generation, changelogs

### Utilities & Automation (30+ skills)
- **Document Processing:** PDF, DOCX, PPTX, XLSX, Markdown
- **Data:** CSV analysis, exploratory data analysis
- **Notion Integration:** Knowledge capture, meeting intelligence
- **Developer Tools:** Git helpers, testing, security scanning

## 🚀 Quick Start

### Installation for Factory Droid

1. **Clone this repository:**
   ```bash
   git clone https://github.com/ovachiever/droid-tings.git
   cd droid-tings
   ```

2. **Install skills:**
   ```bash
   # For project-specific skills
   cp -r skills/* .factory/skills/

   # For personal skills (available across all projects)
   cp -r skills/* ~/.factory/skills/
   ```

3. **Install custom droids:**
   ```bash
   # For project-specific droids
   cp droids/* .factory/droids/

   # For personal droids (available across all projects)
   cp droids/* ~/.factory/droids/
   ```

4. **Install custom commands:**
   ```bash
   # For project-specific commands
   cp commands/* .factory/commands/

   # For personal commands (available across all projects)
   cp commands/* ~/.factory/commands/
   ```

5. **Restart your Droid:**
   ```bash
   # Factory will automatically detect new skills, droids, and commands
   ```

### Using Individual Skills, Droids & Commands

**Skills** are self-contained in their own directories with:
- `SKILL.md` - Main skill definition with YAML frontmatter
- Supporting files (if needed) - References, examples, templates

**Droids** are autonomous agents defined as:
- `.md` files with configuration and instructions
- Model selection, tool access, and autonomy levels
- Specialized expertise and domain knowledge

**Commands** are reusable workflow templates:
- `.md` files with YAML frontmatter and detailed instructions
- Can be invoked by name with optional arguments
- Combine multiple droids and tools into cohesive workflows
- Usage: `/command-name [optional-arguments]`

### Browsing the Collection

- **Skills:** Browse the `skills/` directory (375 skills organized alphabetically)
- **Droids:** Browse the `droids/` directory (155 custom droids)
- **Commands:** Browse the `commands/` directory (2 workflow commands)

## 📚 Documentation

- [Skills Index](SKILLS_INDEX.md) - Complete list organized by category
- [Contributing Guidelines](CONTRIBUTING.md) - How to add new skills
- [License](LICENSE) - MIT License

## 🎓 What is a Skill?

Skills are reusable capabilities that AI agents invoke on demand. They pack instructions, expertise, and tools into a lightweight package.

**Key properties:**
- **Model-invoked** – AI decides when to use them based on the task
- **Composable** – Can be chained together in workflows
- **Token-efficient** – Focused and not bloated with unused context

**A skill can be:**
- **A workflow** – Step-by-step instructions for a task
- **Expertise** – Domain knowledge and conventions
- **Both** – Instructions + tools + best practices

## 📦 Skill Format

Each skill follows the Factory format:

```markdown
---
name: skill-name
description: When and how to use this skill
version: 1.0.0
---

# Skill Name

## Overview
...

## Instructions
...
```

## 🌟 Featured Skills

### AI Development
- **vllm** - High-throughput LLM serving with PagedAttention
- **langchain** - Framework for building LLM applications
- **pytorch-lightning** - Production-ready deep learning

### Scientific Computing
- **biopython** - Molecular biology toolkit
- **scikit-learn** - Machine learning in Python
- **rdkit** - Cheminformatics and molecular modeling

### Web Development
- **nextjs** - React framework for production
- **cloudflare-workers-ai** - AI on Cloudflare's edge network
- **drizzle-orm-d1** - Type-safe database ORM

### Business & Productivity
- **notion-knowledge-capture** - Transform conversations into documentation
- **content-creator** - SEO-optimized marketing content
- **senior-architect** - Software architecture guidance

## 📊 Sources

This collection aggregates skills from:

1. Original skill collections (60 skills)
2. [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (19 skills)
3. [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) (111 skills)
4. [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) (36 skills)
5. [alirezarezvani/claude-code-tresor](https://github.com/alirezarezvani/claude-code-tresor) (7 skills)
6. Various specialized repositories (142 skills)

All skills have been verified to work with Factory's Droid system.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This collection is released under the MIT License. See [LICENSE](LICENSE) for details.

Individual skills may have their own licenses - please check each skill's documentation.

## 🙏 Acknowledgments

Huge thanks to all the original skill creators and the open-source community for making these skills available.

## 🔗 Related Resources

- [Factory.ai Documentation](https://docs.factory.ai/)
- [Factory CLI Skills Guide](https://docs.factory.ai/cli/configuration/skills)
- [Claude AI](https://www.anthropic.com/claude)

---

**Note:** This is a community-maintained collection. Skills are provided as-is. Always review skills before using them in production environments.
