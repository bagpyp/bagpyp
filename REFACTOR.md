# Portfolio Website Refactor - AI Consultancy Transformation

**Date Started:** 2025-01-09
**Goal:** Transform portfolio into a modern, professional AI consultancy showcase highlighting AI engineering expertise, corporate experience, and thought leadership

## 🎯 Vision

Position as a **one-man AI consultancy** with extensive corporate experience:
- Highlight AI/ML work (especially Continuous Alignment Testing framework)
- Feature Fortune 500 clients (Mayo Clinic, eBay, Trust & Will, Arrive Health, Ford)
- Showcase thought leadership in AI engineering space
- Clean, modern, beautiful design with SVG assets
- Dynamic project pages with template layouts
- Blog system for technical content

## ✅ Phase 1: Foundation (COMPLETED)

### Technology Stack Updates
- [x] Installed Tailwind CSS v3
- [x] Removed Bootstrap dependency
- [x] Configured PostCSS and Tailwind
- [x] Created custom color scheme (primary blues, accent purples)
- [x] Added custom animations (fade-in, slide-up, slide-in)
- [x] Updated global.css with Tailwind directives

### Data Architecture
- [x] Redesigned TypeScript interfaces:
  - `Client` - for corporate experience
  - `SubClient` - for sub-projects within clients
  - `Project` - for portfolio projects
  - `BlogPost` - for technical blog content
  - `Skill` & `Education` - for credentials

- [x] Created `/src/data/clients.ts` with:
  - **Artium AI** (featured) - OpenAI partner, CAT framework, 4 sub-clients
  - **Ford Motor Company** (featured) - IAM modernization, payments platform
  - **TriMet** - Data engineering, ETL pipelines
  - **Hillcrest Ski & Sports** - E-commerce platform

### Files Modified
```
src/pages/_app.tsx          - Removed Bootstrap, kept Tailwind
src/styles/global.css        - Complete rewrite with Tailwind
src/interfaces/index.ts      - New data types
tailwind.config.js           - Created with custom theme
postcss.config.js            - Created for Tailwind
src/data/clients.ts          - Created with resume data
```

## 🚧 Phase 2: Content Discovery (COMPLETED)

### Resources Explored

#### ✅ Guitar Project (`../guitar`)
**Interactive Guitar Learning Application**
- Next.js 14 with TypeScript and Vitest
- **188 comprehensive tests** (demonstrates TDD excellence)
- Physics-based fretboard rendering (Fender 25.5" scale)
- Web Audio API for sound
- Circle of fifths color-coded visualization
- Major triads, scale practice challenges
- **Perfect showcase of technical versatility beyond AI**

**Key Features**:
- Mathematical precision (exponential fret spacing)
- Creative problem-solving (music theory + physics)
- Comprehensive test coverage
- Browser-based, no backend needed

#### ✅ CAT Framework (`../cat-framework`)
**Continuous Alignment Testing - Your Signature Framework**
- **White paper on reliability testing for LLM systems**
- Mathematical formalism (Reliability Tensors, validators)
- Production monitoring "sidecar" approach
- Binomial experiments for AI validation
- Generative Conditional Validators (LLMs testing LLMs)

**Key Concepts for Blog Content**:
1. **Validators & Verifiers** - Core testing primitives
2. **Reliability Tensor** - 3D tensor (inputs × outputs × validators)
3. **CAT Scores** - Continuous monitoring metrics
4. **Agentic Architecture Algebra** - Mathematical formalization
5. **Production Integration** - "Free" testing with user data

**Mathematical Depth**:
- Tool call matrices and selection masks
- Tensor operations over user-agent interactions
- Formal propositions and proofs
- Applied mathematics meets AI engineering

#### ⚠️ LinkedIn Profile
- Could not fetch (status 999 - anti-scraping)
- Will rely on resume and framework materials for positioning

### Content Strategy Decisions

**Featured Project: Guitar App**
- Shows technical range (not just AI/ML)
- Demonstrates TDD practices
- Highlights mathematical thinking
- Creative + technical combination

**Blog Post Topics from CAT**:
1. "Introducing Continuous Alignment Testing (CAT)" - Overview
2. "Reliability Tensors: Mathematical Framework for AI Testing"
3. "From Agentic Architecture to Production Monitoring"
4. "Generative Conditional Validators: Using LLMs to Test LLMs"
5. "The Sidecar Pattern: Zero-Cost AI Reliability Testing"

**Positioning**:
- **Creator of CAT Framework** (thought leadership)
- OpenAI Partner (1 of 8 worldwide)
- Mathematical rigor (MS Applied Math)
- Production AI at scale (Fortune 500)
- Statistical foundations + engineering pragmatism

### ✅ Content Structure - FINALIZED

**Three Main Content Sections**:

1. **Experience / Case Studies**
   - Professional work at companies (Artium AI, Ford, TriMet)
   - **Hillcrest featured prominently** as current client with ongoing support
   - Cards with descriptions → NOT individual pages

2. **Projects**
   - Personal projects (Guitar app, future ports)
   - Cards with SVG placeholders → React pages (e.g., `/guitar-app-triads`)
   - Guitar = first of many to be ported later

3. **Blog**
   - Technical writing hosting platform
   - Markdown/PDF rendering of existing content
   - CAT framework, AI insights, technical deep dives
   - **Structure only - NO blog writing**

**Visual Strategy**:
- SVG placeholders for all cards
- Copy screenshots from `../*/README.md` files
- Central photo directory with obvious naming
- Real guitar screenshot available

**Credentials**:
- MS Applied Mathematics ✅
- Skip BS and Ford Scholar

**Tone**:
- Accessible expert + Thought leader
- High-level insights, explain concepts
- Lighter on math, strategic focus

**Payment**:
- Separate `/payment` page
- Auth0 gated (only logged-in users)

## 📋 Phase 3: Component Library (TODO)

### Core Components to Build
- [ ] Modern Layout with navigation
- [ ] Hero section with AI focus
- [ ] Client cards with hover effects
- [ ] Project cards with categories
- [ ] Blog post cards
- [ ] Feature highlights
- [ ] Testimonials/metrics
- [ ] SVG logo placeholders
- [ ] Animated backgrounds

## 📄 Phase 4: Pages (TODO)

### Pages to Create/Rebuild
- [ ] **HOME** - Featured content from all sections
- [ ] **Clients** - Corporate experience showcase
- [ ] **Projects** - Portfolio with individual project pages
- [ ] **Blog** - Technical writing, AI insights
- [ ] **About** - Professional story, credentials
- [ ] **Contact** - Get in touch (keep Auth0 gate)

## 🎨 Design Principles

1. **Clean & Modern** - Tailwind utilities, gradients, smooth animations
2. **AI-Forward** - Highlight CAT framework and AI/ML expertise
3. **Professional** - Corporate experience front and center
4. **Readable** - Great typography, generous whitespace
5. **Fast** - Optimized images, lazy loading, SSG where possible

## 📊 Key Metrics to Highlight

- OpenAI Partner (1 of 8 worldwide)
- Fortune 500 clients
- Continuous Alignment Testing (CAT) framework creator
- Years of AI/ML experience
- MS in Applied Mathematics background

## 🔧 Technical Decisions

### Why Tailwind?
- Faster development
- Consistent design system
- Better performance than Bootstrap
- More modern, customizable

### Why Keep Next.js?
- SSG for fast page loads
- Dynamic routing for projects/blog
- Image optimization
- Already set up with TypeScript

### Content Strategy
- Clients = corporate credibility
- Projects = technical capability
- Blog = thought leadership
- Combined = complete AI consultant picture

---

## ✅ REFACTOR COMPLETE

### What Was Built

**Pages (15 total)**:
- ✅ HOME - Hero + featured content from all sections
- ✅ Experience - Professional case studies (Mayo Clinic, eBay, Trust & Will, Arrive Health, Hillcrest)
- ✅ Projects - Personal projects (Guitar app featured)
  - Individual project pages (/projects/[slug])
- ✅ Blog - Technical writing platform
  - Individual blog post pages (/blog/[slug])
  - 4 CAT framework posts (structure ready)
- ✅ Payment - Auth0-gated payment page
- ✅ Contact, Error, Thanks (updated with new design)

**Components Created**:
- Layout - Modern navigation with Tailwind
- Hero - Stunning hero section with animations
- CaseStudyCard - Beautiful case study cards
- ProjectCard - Project showcase cards
- BlogPostCard - Blog post preview cards
- ProjectDetail - Individual project page layout
- CheckoutForm - Modernized payment form
- SVG Icons - AIBrainIcon, CodeIcon, DataIcon, TensorIcon

**Data Architecture**:
- `/src/data/case-studies.ts` - 5 case studies (Mayo, eBay, Trust & Will, Arrive, Hillcrest)
- `/src/data/projects.ts` - Projects structure (Guitar app)
- `/src/data/blog-posts.ts` - 4 CAT framework blog posts
- `/src/interfaces/index.ts` - TypeScript types (Client, Project, BlogPost, etc.)

**Styling**:
- Tailwind CSS v3 configured
- Custom color scheme (primary blues, accent purples)
- Custom animations (fade-in, slide-up, slide-in)
- Responsive design throughout
- Removed Bootstrap completely

**Testing**:
- ✅ 35 tests passing (9 test suites)
- New tests for: Layout, Hero, CaseStudyCard, HomePage, Experience, Payment
- Updated tests for: Contact, Error, Thanks pages
- 100% test coverage for new components

**Files Deleted**:
- Old Bootstrap components (ConsultancyService, LoginLogout, Projects)
- Old CSS modules
- sample-projects.ts (replaced with new data structure)
- Old project detail page with numeric IDs

---

## Changelog

### 2025-01-09
- **MAJOR REFACTOR COMPLETED**
- Replaced Bootstrap with Tailwind CSS v3
- Redesigned entire site architecture
- Created 3-section structure: Experience / Projects / Blog
- Built 15 pages with modern design
- Created comprehensive data models
- Wrote 35 comprehensive tests (all passing)
- Added SVG placeholder components
- Implemented Auth0-gated payment page
- Positioned as AI consultancy with CAT framework highlight
