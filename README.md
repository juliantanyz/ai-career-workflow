# ai-career-workflow

**My personal AI-powered job search pipeline** — a customized fork of [`career-ops`](https://github.com/santifer/career-ops) that I use to triage roles, generate tailored CVs, draft cover letters, and track applications end-to-end through Claude Code.

Built on top of `career-ops` v1.x. Credit to [santifer](https://github.com/santifer) for the underlying framework.

---

## What this repo is

A curated snapshot of the framework code + my personal customizations to the AI-driven job-search workflow — **without** any of my actual CV content, application data, or generated outputs.

### What's included
- The `career-ops` framework code (Node.js/Playwright scripts, agent modes, skill definitions)
- Example configs and templates (`config/profile.example.yml`, `modes/_profile.template.md`, `templates/portals.example.yml`)
- Documentation for the pipeline (`docs/`, `CLAUDE.md`, `AGENTS.md`, `DATA_CONTRACT.md`)
- Templates for CV generation (HTML + LaTeX)

### What's NOT included (and never will be)
- My actual CV (`cv.md`)
- My profile / archetypes / negotiation scripts (`config/profile.yml`, `modes/_profile.md`)
- My portal search configs (`portals.yml`)
- My application tracker (`data/applications.md`, `data/pipeline.md`, `data/scan-history.tsv`)
- My evaluation reports (`reports/`)
- My interview prep (`interview-prep/`)
- My generated PDFs and outputs (`output/`)
- My JD scratchpad (`jds/`)

All of the above are `.gitignore`d. This repo is intentionally personal-data-free.

---

## The workflow, at a glance

1. **Scan** — hit Greenhouse / Ashby / Lever APIs directly for new roles (`scan.mjs`, zero LLM cost)
2. **Triage** — a Claude Code skill scores each role's fit against my profile (`modes/oferta.md`)
3. **Tailor** — Claude generates a role-specific CV in HTML, then Playwright renders to PDF (`generate-pdf.mjs`)
4. **QA pipeline** — three Anthropic skills validate every CV in sequence: recruiter (keyword coverage) → rewriter (XYZ formula) → diagnoser (ATS audit)
5. **Track** — an append-only tracker with canonical statuses (`data/applications.md`)

My customizations to the framework:
- Adaptive archetype framing for Data Product Owner / AI Product Manager / Data Analyst tracks
- Mandatory 3-pass QA pipeline (`resume-recruiter` → `resume-rewriter` → `resume-diagnoser`) on every generated CV
- Localized modes for Singapore public sector (Singapore Citizen line + Careers & Skills Passport URL toggled per role)
- Custom CV template using Space Grotesk + DM Sans, with ATS normalization (em-dash → ASCII at PDF generation)

---

## Setup

```bash
npm install
npx playwright install chromium
```

Copy the templates and fill in your own details:

```bash
cp config/profile.example.yml config/profile.yml
cp modes/_profile.template.md modes/_profile.md
cp templates/portals.example.yml portals.yml
```

Then paste a JD to Claude Code (or your CLI of choice) and it'll walk the pipeline.

For the full setup guide, see [`docs/SETUP.md`](docs/SETUP.md).

---

## Attribution

This is a personal customization of [`career-ops`](https://github.com/santifer/career-ops) by [santifer](https://github.com/santifer). The framework, agent architecture, and core scripts are his work. My contributions are limited to configuration, personal archetypes, and a few workflow tweaks I've folded in.

If you want the canonical career-ops experience, use the upstream repo directly.

---

## License

MIT — inherited from upstream `career-ops`. See [`LICENSE`](LICENSE).
