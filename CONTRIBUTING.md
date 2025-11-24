# Contributing to Claude Skills Collection

Thank you for your interest in contributing to this collection! This guide will help you add new skills or improve existing ones.

## 🎯 What Makes a Good Skill?

A good skill should be:

1. **Focused** - Solves one specific problem well
2. **Reusable** - Can be applied across different projects
3. **Well-documented** - Clear instructions and examples
4. **Self-contained** - Includes all necessary context
5. **Factory-compatible** - Follows the SKILL.md format

## 📝 Skill Format

Each skill must have a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: skill-name
description: Brief description of when and how to use this skill
version: 1.0.0
author: Your Name (optional)
tags: [category, relevant, tags]
---

# Skill Name

## Overview

Brief overview of what this skill does.

## When to Use

Clear guidance on when to invoke this skill.

## Instructions

Step-by-step instructions or guidance.

## Examples

Practical examples (optional but recommended).
```

## 🔄 How to Contribute

### Adding a New Skill

1. **Fork this repository**

2. **Create a new skill directory:**
   ```bash
   cd skills
   mkdir your-skill-name
   cd your-skill-name
   ```

3. **Create SKILL.md:**
   ```bash
   touch SKILL.md
   # Add your skill content following the format above
   ```

4. **Add supporting files (if needed):**
   - Reference documents
   - Example configurations
   - Templates

5. **Test your skill:**
   - Ensure it works with Factory's Droid system
   - Verify all instructions are clear
   - Check for any missing dependencies

6. **Submit a pull request:**
   - Include a clear description
   - Mention the category (AI/ML, Development, Scientific, etc.)
   - List any dependencies

### Improving Existing Skills

1. **Fork the repository**
2. **Make your improvements**
3. **Test thoroughly**
4. **Submit a pull request** with:
   - Description of changes
   - Reason for the improvement
   - Any breaking changes (if applicable)

## 📋 Skill Categories

When adding a skill, categorize it appropriately:

- **AI & Machine Learning** - LLMs, training, inference, evaluation
- **Scientific Research** - Bioinformatics, cheminformatics, data analysis
- **Development** - Frontend, backend, databases, cloud
- **Business & Product** - Product management, marketing, analytics
- **Documentation** - Writing, technical docs, scientific papers
- **Quality & Compliance** - ISO standards, regulatory, security
- **Utilities** - Document processing, automation, tools

## ✅ Pull Request Checklist

Before submitting, ensure:

- [ ] Skill has proper YAML frontmatter
- [ ] Description clearly states when to use the skill
- [ ] Instructions are clear and actionable
- [ ] No sensitive information (API keys, credentials)
- [ ] Skill is tested and working
- [ ] Supporting files are included if needed
- [ ] Updated SKILLS_INDEX.md (if adding new category)

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Feedback may be provided for improvements
3. Once approved, your skill will be merged
4. Your contribution will be acknowledged in releases

## 💡 Skill Ideas

Not sure what to contribute? Here are some ideas:

- Integration with popular APIs/services
- Domain-specific workflows (legal, medical, finance)
- Programming language-specific skills
- Testing and quality assurance patterns
- Security and compliance frameworks
- DevOps and infrastructure automation

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Community

- Be respectful and constructive
- Help others learn and improve
- Share knowledge generously
- Credit original sources when adapting existing skills

## 📧 Questions?

Open an issue for:
- Questions about contributing
- Suggestions for new skills
- Bug reports or improvements
- General feedback

Thank you for making this collection better! 🙌
