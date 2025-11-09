# Project Import Tracking

**Date**: 2025-01-09
**Goal**: Import 3 projects, 3 blog posts, and add back 3 companies to experience

---

## 🎯 Import Checklist

### Projects to Import

- [ ] **Guitar App** - 2 separate pages
  - [ ] Page 1: Major Triads
  - [ ] Page 2: Scale Practice
  - [ ] Copy all code to `/src/projects/guitar/`
  - [ ] Copy screenshots
  - [ ] Create 2 project entries in data
  - [ ] Create 2 project pages
  - [ ] Write tests

- [ ] **graphTheoreticDynamics**
  - [ ] Explore project
  - [ ] Copy code to `/src/projects/graph-theory/`
  - [ ] Copy screenshots
  - [ ] Create project entry
  - [ ] Create project page
  - [ ] Write tests

- [ ] **dragontree**
  - [ ] Explore project
  - [ ] Copy code to `/src/projects/dragontree/`
  - [ ] Copy screenshots
  - [ ] Create project entry
  - [ ] Create project page
  - [ ] Write tests

### Blog Posts to Import

- [ ] **Agentic Architecture** (`agentic_architecture.md`)
  - [ ] Copy markdown to `/public/blog/`
  - [ ] Copy algebra.pdf
  - [ ] Copy all referenced images
  - [ ] Update image paths in markdown
  - [ ] Update blog data entry

- [ ] **Algebra** (`algebra.md`)
  - [ ] Copy markdown to `/public/blog/`
  - [ ] Copy all referenced images
  - [ ] Update image paths
  - [ ] Update blog data entry

- [ ] **Reliability Testing** (`reliability_testing.md`)
  - [ ] Copy markdown to `/public/blog/`
  - [ ] Copy reliability_testing.pdf
  - [ ] Copy all referenced images
  - [ ] Update image paths
  - [ ] Update blog data entry

### Experience to Add Back

- [ ] **Ford Motor Company**
  - [ ] Add to case-studies.ts
  - [ ] Write tests

- [ ] **TriMet**
  - [ ] Add to case-studies.ts
  - [ ] Write tests

- [ ] **Hillcrest Ski & Sports** (as separate professional entry)
  - [ ] Update existing entry or create second one
  - [ ] Write tests

---

## 📁 File Organization

### Images Directory Structure
```
public/images/
├── case-studies/
│   ├── mayo-clinic.svg (placeholder)
│   ├── ebay.svg (placeholder)
│   └── ...
├── projects/
│   ├── guitar-triads-screenshot.png ✅
│   ├── guitar-scales-screenshot.png
│   ├── graph-theory-screenshot.png
│   └── dragontree-screenshot.png
└── blog/
    ├── agentic_architecture/
    │   ├── img/ (all referenced images)
    │   └── algebra.pdf
    └── reliability_testing/
        ├── img/ (all referenced images)
        └── reliability_testing.pdf
```

### Code Organization
```
src/projects/
├── guitar/
│   ├── components/
│   ├── lib/
│   └── index.ts (exports for both pages)
├── graph-theory/
│   └── ... (code)
└── dragontree/
    └── ... (code)
```

---

## 🔍 Discovery Phase

### Projects to Explore
- `../guitar` - Find the 2 pages
- `../graphTheoreticDynamics` - Understand structure
- `../dragontree` - Understand structure

### Markdown Files to Copy
- `../cat-framework/docs/agentic_architecture/agentic_architecture.md`
- `../cat-framework/docs/agentic_architecture/algebra.md`
- `../cat-framework/docs/reliability_testing/reliability_testing.md`

### PDFs to Copy
- `../cat-framework/docs/agentic_architecture/algebra.pdf`
- `../cat-framework/docs/reliability_testing/reliability_testing.pdf`

### Images to Find and Copy
- All images referenced in the 3 markdown files
- Screenshots from guitar app (2)
- Screenshots from graphTheoreticDynamics
- Screenshots from dragontree

---

## ✅ IMPORT COMPLETE!

### Experience - 7 Case Studies
- ✅ Mayo Clinic (AI/Multi-Agent RAG)
- ✅ eBay (Enterprise Agentic AI)
- ✅ Trust & Will (Attorney-in-the-Loop AI)
- ✅ Arrive Health (Clinical AI)
- ✅ **Ford Motor Company** (IAM + Payments)
- ✅ **TriMet** (Data Engineering)
- ✅ **Hillcrest Ski & Sports** (Ongoing Client)

### Projects - 4 Personal Projects
- ✅ Guitar Major Triads Visualizer
- ✅ Guitar Scale Practice Trainer
- ✅ Graph Theoretic Multi-Agent Dynamics
- ✅ Dragontree IoT Monitor

### Blog Posts - 3 CAT Framework Articles
- ✅ Agentic Architecture (markdown with images)
- ✅ Algebra of Agentic Architectures (markdown + PDF link)
- ✅ Reliability Testing for LLM Systems (markdown + PDF link)

### Images Copied
**Blog Images**:
- public/blog/agentic-architecture/img/ (5 SVG diagrams)
- public/blog/reliability-testing/img/ (7 PNG charts/diagrams)

**Project Screenshots**:
- guitar-triads-screenshot.png ✅
- concensusGraph.png, threeDim.png, pyCharm.png (graph theory)
- dragontree.JPG, desk.JPG, arduino.png (dragontree)

### PDFs Copied
- public/blog/agentic-architecture/algebra.pdf ✅
- public/blog/reliability-testing/reliability_testing.pdf ✅

### Build Results
- **17 pages generated** (up from 15)
- **86 tests passing** (all updated)
- 4 project pages: guitar-major-triads, guitar-scale-practice, graph-theoretic-dynamics, dragontree-iot
- 3 blog pages: agentic-architecture, agentic-architecture-algebra, reliability-testing-llm-systems

---

## 🎸 INTERACTIVE CODE PORTED!

### Guitar App - Full Implementation
- ✅ Copied all React components (MajorTriads, ScalePractice, Modes3NPS, Fretboards)
- ✅ Copied guitar library (core.ts, triads.ts, sound.ts, physics, note-colors)
- ✅ Copied all 188 guitar tests (converted from Vitest to Jest)
- ✅ Created dynamic project pages that load interactive components
- ✅ Fixed all import paths (@/ aliases + relative imports)
- ✅ Updated tsconfig.json with path aliases
- ✅ Updated jest.config.js for guitar test support

### Test Results
- **274 tests passing** (86 portfolio + 188 guitar)
- **23 test suites**
- All guitar functionality tested and working

### Pages Structure
- `/projects/guitar-major-triads` → Loads interactive MajorTriads component
- `/projects/guitar-scale-practice` → Loads interactive ScalePractice component
- Both use dynamic imports (client-side only for Web Audio)
- Other projects (graph-theory, dragontree) show static detail pages

---

## 🚧 In Progress

Final commit and push...

---

---

## 📸 Complete Image Inventory

### Blog Images (12 total)
**Agentic Architecture** (5 SVG diagrams):
- `/images/blog/agentic-architecture/img/c_prime.svg`
- `/images/blog/agentic-architecture/img/c_prime_graph.svg`
- `/images/blog/agentic-architecture/img/c_prime_node.svg`
- `/images/blog/agentic-architecture/img/h_pp.svg`
- `/images/blog/agentic-architecture/img/h_pp_node.svg`

**Reliability Testing** (7 PNG charts):
- `/images/blog/reliability-testing/img/plot.png`
- `/images/blog/reliability-testing/img/scores.png`
- `/images/blog/reliability-testing/img/table.png`
- `/images/blog/reliability-testing/img/1241.png`
- `/images/blog/reliability-testing/img/2411.png`
- `/images/blog/reliability-testing/img/24241.png`
- `/images/blog/reliability-testing/img/242424.png`

### Project Screenshots (13 total)
**Guitar Projects**:
- `/images/projects/guitar-triads-screenshot.png` (NEW from ~/Desktop/triads.png)
- `/images/projects/guitar-modes-screenshot.png` (NEW from ~/Desktop/modes.png)

**Graph Theoretic Dynamics**:
- `/images/projects/concensusGraph.png`
- `/images/projects/threeDim.png`
- `/images/projects/pyCharm.png`
- `/images/projects/screenshot.png`

**Dragontree IoT**:
- `/images/projects/dragontree.JPG`
- `/images/projects/desk.JPG`
- `/images/projects/arduino.png`
- `/images/projects/vsenv.png`

### PDFs (2 total)
- `/blog/agentic-architecture/algebra.pdf` (168KB)
- `/blog/reliability-testing/reliability_testing.pdf` (2.6MB)

### Markdown Files (3 total)
- `/blog/agentic-architecture.md` (with updated image paths)
- `/blog/algebra.md` (original with relative paths)
- `/blog/reliability-testing.md` (with updated image paths + PDF link)

---

## 📝 Notes

- ✅ All image paths updated in markdown files
- ✅ All images organized by content type
- ✅ PDFs linked from markdown posts
- ✅ react-markdown + remark-gfm + rehype-raw implemented
- ✅ @tailwindcss/typography added for prose styling
- ✅ Keyboard events work (from guitar components)
- ✅ Light backgrounds for guitar projects
