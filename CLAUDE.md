# Bagpyp AI Consultancy Website - Developer Guide

## Overview

Modern, professional AI consultancy portfolio website showcasing production AI engineering work, technical projects, and thought leadership. Built with Next.js, TypeScript, and Tailwind CSS.

**Positioning**: One-man AI consultancy with Fortune 500 experience. Creator of Continuous Alignment Testing (CAT) framework. Work done through Artium AI, one of 8 official OpenAI partners worldwide.

**Last Updated**: 2025-11-08 - Added 3 new blog posts, 14 custom SVGs, fixed navigation, restored all company logos

## Technology Stack

- **Framework**: Next.js 15.5.6 (React 19.2.0)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS v3 (custom theme)
- **Authentication**: Auth0 (@auth0/nextjs-auth0 ^4.12.0)
- **Payments**: Stripe (^9.8.0)
- **Testing**: Jest 29.7.0 + React Testing Library 16.3.0
- **Node Version**: 23.10.0 (via asdf .tool-versions)

## Project Structure

```
bagpyp/
├── src/
│   ├── components/           # React components
│   │   ├── Layout.tsx        # Main layout with nav & footer
│   │   ├── Hero.tsx          # Hero section for HOME
│   │   ├── CaseStudyCard.tsx # Case study display cards
│   │   ├── ProjectCard.tsx   # Project display cards
│   │   ├── BlogPostCard.tsx  # Blog post preview cards
│   │   ├── ProjectDetail.tsx # Individual project layout
│   │   ├── CheckoutForm.tsx  # Payment form
│   │   └── svgs/             # SVG placeholder components
│   │       ├── AIBrainIcon.tsx
│   │       ├── CodeIcon.tsx
│   │   │   ├── DataIcon.tsx
│   │       ├── TensorIcon.tsx
│   │       └── index.ts
│   ├── data/                 # Content data
│   │   ├── case-studies.ts   # Professional experience
│   │   ├── projects.ts       # Personal projects
│   │   └── blog-posts.ts     # Blog metadata
│   ├── interfaces/
│   │   └── index.ts          # TypeScript types
│   ├── pages/                # Next.js pages (file-based routing)
│   │   ├── api/              # API routes
│   │   │   ├── auth/[...auth0].js
│   │   │   └── make_payment/index.ts
│   │   ├── blog/
│   │   │   ├── [slug].tsx    # Individual blog posts
│   │   │   └── index.tsx     # Blog listing
│   │   ├── projects/
│   │   │   ├── [slug].tsx    # Individual projects
│   │   │   └── index.tsx     # Projects listing
│   │   ├── _app.tsx          # App wrapper
│   │   ├── index.tsx         # HOME page
│   │   ├── experience.tsx    # Case studies page
│   │   ├── contact.tsx       # Contact page
│   │   ├── payment.tsx       # Payment page (Auth0 gated)
│   │   ├── error.tsx
│   │   └── thanks.tsx
│   ├── styles/
│   │   └── global.css        # Tailwind directives & custom styles
│   ├── utils/
│   │   └── get-stripe.ts
│   └── __tests__/            # Test files
│       ├── components/
│       └── pages/
├── public/
│   ├── images/               # Organized image directories
│   │   ├── case-studies/     # All company logos (mayo, ebay, trust-will, etc.)
│   │   ├── projects/         # Project screenshots
│   │   │   └── guitar-triads-screenshot.png
│   │   └── blog/             # Blog card preview images (SVGs)
│   └── blog/                 # Blog post content
│       ├── *.md              # Markdown blog posts
│       ├── *.pdf             # PDF white papers
│       ├── agentic-architecture/
│       │   └── img/          # SVG diagrams for agentic architecture
│       ├── reliability-testing/
│       │   └── img/          # PNG diagrams for CAT framework
│       ├── blog-01/img/      # SVGs for introduction blog
│       ├── blog-02/img/      # SVGs for mathematics blog
│       └── blog-03/img/      # SVGs for framework blog
├── tailwind.config.js        # Tailwind theme configuration
├── postcss.config.js         # PostCSS configuration
├── jest.config.js            # Jest configuration
├── .tool-versions            # asdf version management
├── REFACTOR.md               # Refactor tracking document
└── CLAUDE.md                 # This file
```

## Content Architecture

### Three Main Sections

**1. Experience / Case Studies**
- Professional work at companies
- Individual case studies for: Mayo Clinic, eBay, Trust & Will, Arrive Health, Hillcrest
- Displayed as cards (NO individual pages)
- Route: `/experience`

**2. Projects**
- Personal technical projects
- Each project loads its own React page
- Guitar app featured (188 tests, physics-based rendering)
- Routes: `/projects`, `/projects/[slug]` (e.g., `/projects/guitar-app-triads`)

**3. Blog**
- Technical writing platform
- Hosts markdown/PDF content
- CAT framework articles, AI insights
- Routes: `/blog`, `/blog/[slug]`

## Getting Started

### Prerequisites

```bash
# Using asdf (recommended)
asdf install  # Installs Node.js 23.10.0 from .tool-versions

# Or manually
node --version  # Should be >= 20.0.0
```

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` with:

```bash
# Auth0
AUTH0_SECRET='your-secret'
AUTH0_BASE_URL='http://localhost:3001'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_...'
STRIPE_SECRET_KEY='sk_test_...'
STRIPE_API_VERSION='2020-08-27'
```

**NEVER commit .env.local!**

## Development

### Run Development Server

```bash
npm run dev
```

Site runs on **http://localhost:3001** (or 3000 if available)

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

**Best Practice**: Run tests frequently during development!

### Linting

```bash
npm run lint
```

## Adding Content

### Add a New Case Study

Edit `src/data/case-studies.ts`:

```typescript
{
  id: "new-client",
  name: "Client Name",
  role: "Your Role",
  period: "2024",
  location: "Remote",
  description: "Brief description",
  highlights: ["Achievement 1", "Achievement 2"],
  technologies: ["Python", "TypeScript"],
  aiFeatures: ["Multi-Agent Systems"], // Optional
  featured: true
}
```

### Add a New Project

1. Add metadata to `src/data/projects.ts`
2. Create page at `src/pages/projects/[your-slug].tsx`
3. Add screenshot to `public/images/projects/`

### Add a New Blog Post

1. Add metadata to `src/data/blog-posts.ts`
2. Place markdown/PDF in `/public/blog/`
3. Update blog post page to render content (future enhancement)

### Replace SVG Placeholders with Real Images

Images are organized in `/public/images/`:
- `case-studies/` - Client work screenshots
- `projects/` - Project screenshots (guitar-triads-screenshot.png already there)
- `blog/` - Blog post images

Update image paths in data files to point to real images.

## Design System

### Tailwind Custom Theme

**Colors**:
- `primary-*` - Blues (#0284c7 at 600, #0369a1 at 700, #075985 at 800, #0c4a6e at 900)
- `accent-*` - Purples (#c026d3 at 600, #a21caf at 700, #86198f at 800, #701a75 at 900)

**Utility Classes**:
- `.btn-primary` - Primary CTA button (white text on blue gradient 700→800)
- `.btn-secondary` - Secondary button (darker text primary-800)
- `.card` - White card with shadow
- `.card-gradient` - Gradient card
- `.section` - Page section padding (py-16 md:py-24)
- `.container-custom` - Max-width container

**Hero/Header Pattern**:
All section pages (Experience, Projects, Blog) use consistent dark gradient header:
- `bg-gradient-to-br from-slate-900 to-primary-900 text-white py-20`
- max-w-4xl content area
- h1 with mb-6, subtitle text-xl text-slate-300

### Animations

- `animate-fade-in` - Fade in (0.5s ease-in)
- `animate-slide-up` - Slide up (0.5s ease-out)
- `animate-slide-in` - Slide in (0.5s ease-out)

### Navigation

**Layout.tsx** includes:
- GitHub and LinkedIn icon links (left side of nav, before text links)
- Vertical separator divider
- Standard page links (Experience, Projects, Blog)
- Sign In button or User avatar (right side)

## Key Features

### 1. Auth0 Authentication

- Sign in/out functionality
- User profile display
- **Payment page is gated** (login required)

**Imports**:
```typescript
import { Auth0Provider } from "@auth0/nextjs-auth0/client";  // in _app.tsx
import { useUser } from "@auth0/nextjs-auth0/client";        // in components
```

### 2. Stripe Payments

- Gated payment page (`/payment`)
- Checkout form with Tailwind styling
- Success/error pages

### 3. Static Site Generation (SSG)

Most pages use `getStaticProps` for fast loading:
- HOME page
- Experience page
- Projects pages
- Blog pages

## Testing

### Test Structure

```
src/__tests__/
├── components/
│   ├── Layout.test.tsx
│   ├── Hero.test.tsx
│   └── CaseStudyCard.test.tsx
└── pages/
    ├── index.test.tsx
    ├── experience.test.tsx
    ├── payment.test.tsx
    ├── contact.test.tsx
    ├── error.test.tsx
    └── thanks.test.tsx
```

### Running Tests

```bash
npm test              # All tests
npm run test:watch    # Watch mode
```

**Current Status**: ✅ 35 tests passing across 9 test suites

### Writing New Tests

Template:
```typescript
import { render, screen } from "@testing-library/react";
import YourComponent from "../../components/YourComponent";

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: () => ({ user: null })
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe("YourComponent", () => {
  it("renders correctly", () => {
    render(<YourComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

## Page Routes

| Route | Description | Type |
|-------|-------------|------|
| `/` | HOME - Hero + featured content | SSG |
| `/experience` | Professional case studies | SSG |
| `/projects` | Projects listing | SSG |
| `/projects/[slug]` | Individual project page | SSG |
| `/blog` | Blog listing | SSG |
| `/blog/[slug]` | Individual blog post | SSG |
| `/contact` | Contact information (login-gated details) | Static |
| `/payment` | Payment form (Auth0-gated) | Static |
| `/api/auth/[...auth0]` | Auth0 endpoints | API |
| `/api/make_payment` | Stripe checkout | API |

## Development Workflow

### Best Practices

1. **Run tests often** - `npm test` or `npm run test:watch`
2. **Check dev server** - http://localhost:3001
3. **Build before committing** - `npm run build`
4. **Use Tailwind utilities** - Avoid custom CSS when possible
5. **Keep data in `/src/data`** - Easy to update content

### Adding a Page

1. Create file in `src/pages/`
2. Use Layout component
3. Write tests in `src/__tests__/pages/`
4. Add navigation link in Layout component (if needed)

Example:
```typescript
import Layout from "../components/Layout";

const MyPage = () => (
  <Layout title="My Page | Bagpyp">
    <div className="section">
      <div className="container-custom">
        <h1>My Page</h1>
      </div>
    </div>
  </Layout>
);

export default MyPage;
```

## Data Management

### Case Studies

**File**: `src/data/case-studies.ts`

**All Clients** (7 total with logos):
- Mayo Clinic (2024) - Multi-agent RAG for medical research
- eBay (2025) - Enterprise agentic AI
- Trust & Will (2024) - Attorney-in-the-loop automation
- Arrive Health (2024) - Clinical information processing
- Ford Motor Company (2021-2023) - IAM platform & payments modernization
- TriMet (2023-2024) - Enterprise Python ETL
- Hillcrest Ski & Sports (2020-Present) - Ongoing e-commerce client ($1M+ annual sales)

### Projects

**File**: `src/data/projects.ts`

**Current Projects** (4 total):
1. **Guitar Major Triads Visualizer** - Physics-based fretboard with 188 tests
2. **Graph Theoretic Multi-Agent Dynamics** - MS thesis project (2015)
3. **Guitar Modes - 3 Notes Per String** - Modal scale visualization
4. **Dragontree IoT Monitor** - ESP32 plant monitoring system

**Order matters**: Projects appear on /projects page in array order

**Adding new projects**:
1. Add metadata to `projects.ts`
2. Create page in `/pages/projects/[slug].tsx`
3. Add screenshot to `public/images/projects/`
4. Update `featured` flag as needed

### Blog Posts

**File**: `src/data/blog-posts.ts`

**Current Blog Posts** (6 total):
1. **Reliability Testing for LLM-Based Systems** - CAT Framework white paper (20 min)
2. **Agentic Architecture** - Graph-theoretic modeling (10 min)
3. **Algebra of Agentic Architectures** - Mathematical formalization (15 min)
4. **Building Testing Framework** - Theory to production (12 min) - Artium AI
5. **Mathematics of Trust** - Bayesian & graph theory (10 min) - Artium AI
6. **Introduction to Agentic Reliability** - Trust in AI systems (8 min) - Artium AI

**Blog Order**: Array order in `blog-posts.ts` is REVERSED on /blog page (newest first)

**Structure**:
- Metadata in `src/data/blog-posts.ts`
- Content (markdown/PDF) in `/public/blog/`
- Inline images in `/public/blog/{blog-name}/img/`
- Card preview images in `/public/images/blog/`

**LaTeX Math Rendering**:
- Uses `remarkMath` + `rehypeKatex` for LaTeX support
- Math blocks must have blank lines before `$$`
- Use `\_` for underscores in math mode (NOT `\textunderscore`)
- Use `\\\\` for line breaks in multi-line equations
- Custom CSS in `global.css` ensures math renders in blue (#0c4a6e)

**Image Paths in Markdown**:
- MUST use absolute paths from /public: `/blog/{name}/img/{file}`
- NOT relative paths like `./img/{file}`
- SVGs in XML: Use `&amp;` not `&` for proper parsing

## Troubleshooting

### Build Fails

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Tests Fail

- Ensure mocks are in correct order (Auth0 before imports)
- Check that data files exist and are valid
- Use `getAllByText` for elements that appear multiple times

### Tailwind Not Working

- Verify `tailwind.config.js` has correct content paths
- Check `postcss.config.js` configuration
- Ensure `global.css` imports are correct

### Dev Server Issues

- Clear `.next` directory
- Rebuild: `npm run build`
- Restart: `npm run dev`

## Deployment

Configured for Vercel deployment.

**Environment Variables**: Set all vars from `.env.local` in Vercel dashboard.

## Recent Major Refactor (2025-01-09)

### What Changed

**Removed**:
- Bootstrap CSS (replaced with Tailwind)
- Old components (ConsultancyService, LoginLogout, Projects)
- Old CSS modules
- Old data structure

**Added**:
- Tailwind CSS v3 with custom theme
- Modern Layout with sleek navigation
- Hero section with animations
- Card components (CaseStudy, Project, BlogPost)
- 3-section architecture (Experience / Projects / Blog)
- 5 case studies from Fortune 500 work
- SVG placeholder components
- Auth0-gated payment page
- 35 comprehensive tests

### New Site Structure

**HOME** (`/`):
- Hero section highlighting AI expertise
- Featured items configured in `src/config/featured-items.ts`:
  - Mayo Clinic, eBay, Trust & Will (AI case studies)
  - TriMet (data engineering)
  - Hillcrest (CRITICAL: must be visible for client software check)
  - Reliability Testing, Agentic Architecture, Algebra blogs
  - Graph Theoretic Dynamics project
- CAT framework call-out section
- Navigation with GitHub/LinkedIn icons

**Experience** (`/experience`):
- Dark gradient header (matches Projects/Blog styling)
- All 7 case studies displayed as cards with logos
- Artium AI sub-clients section (Mayo, eBay, Trust & Will, Arrive)
- CaseStudyCard shows logo OR gradient fallback with company name

**Projects** (`/projects`):
- Dark gradient header (consistent with Experience/Blog)
- 4 projects: Guitar Triads, Graph Theoretic, Guitar Modes, Dragontree IoT
- Project cards are clickable (Next.js 13+ Link syntax)
- Each project has its own detail page

**Blog** (`/blog`):
- Dark gradient header
- 6 blog posts with custom SVG card images
- Posts displayed in REVERSE order (newest first)
- Markdown rendering with KaTeX math support
- BlogPostCard component handles all image types (SVG, PNG, WEBP)

**Payment** (`/payment`):
- Auth0-gated access
- Modern checkout form
- Stripe integration

## Content Updates

### To Add New Content

**Case Study**:
1. Edit `src/data/case-studies.ts`
2. Add to `caseStudiesData` array
3. Replace SVG with real image in `/public/images/case-studies/`

**Project**:
1. Edit `src/data/projects.ts`
2. Create page in `src/pages/projects/[slug].tsx`
3. Add screenshot to `/public/images/projects/`
4. Write tests

**Blog Post**:
1. Edit `src/data/blog-posts.ts`
2. Add markdown/PDF to `/public/blog/`
3. Future: Implement markdown/PDF rendering

## Testing Strategy

### Current Tests (35 passing)

**Components**:
- Layout (6 tests)
- Hero (6 tests)
- CaseStudyCard (6 tests)

**Pages**:
- HOME (5 tests)
- Experience (4 tests)
- Payment (3 tests)
- Contact (3 tests)
- Error, Thanks (2 tests each)

### Run Tests Frequently

During development:
```bash
npm run test:watch
```

Before committing:
```bash
npm test
npm run build
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- [Stripe Documentation](https://stripe.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **REFACTOR.md** - Detailed refactor tracking

## Featured Items Configuration

**File**: `src/config/featured-items.ts`

Homepage featured section is fully configurable:
- Mix case studies, projects, and blog posts
- Order determines display order
- Change IDs to swap content
- FeaturedCard component auto-renders correct card type

**Current Configuration**:
```typescript
{ type: "case-study", id: "mayo-clinic" },
{ type: "case-study", id: "ebay" },
{ type: "case-study", id: "trust-and-will" },
{ type: "case-study", id: "trimet" },
{ type: "case-study", id: "hillcrest" }, // CRITICAL for client
{ type: "blog", id: "reliability-testing" },
{ type: "project", id: "graph-dynamics" },
{ type: "blog", id: "agentic-architecture" },
{ type: "blog", id: "agentic-algebra" },
```

## Component Patterns

### Card Components (Clickable Links)

**IMPORTANT**: Next.js 13+ Link syntax
- `<Link>` acts as anchor tag directly
- Apply styles to Link, NOT inner div
- Pattern: `<Link className="card...">content</Link>`
- DO NOT wrap: `<Link><div className="card">` ❌

**Examples**:
- ProjectCard.tsx - Clickable project cards
- BlogPostCard.tsx - Clickable blog post cards
- CaseStudyCard.tsx - Non-clickable (display only)

### Image Handling

**BlogPostCard**:
- Removed placeholder SVG filter logic
- All images (SVG, PNG, WEBP) treated as real images
- Falls back to icon component only if no image specified

**CaseStudyCard**:
- Shows logo if available
- Gradient fallback with company name if no logo
- All 7 case studies now have logos restored from git

## Next Steps

1. ✅ **All company logos restored** (mayo, trust-will, arrive, ford, trimet)
2. ✅ **6 blog posts live** with markdown/PDF rendering
3. ✅ **14 custom SVGs generated** for blog content
4. **Future**: Port more projects from parent directory
5. **Future**: Add more technical blog content

## Quick Reference

```bash
# Development
npm run dev           # Start dev server (localhost:3001)
npm run build         # Build production
npm test              # Run tests
npm run test:watch    # Watch mode

# Deployment
git push              # Auto-deploys to Vercel (if configured)
```

---

**For questions or issues**, see REFACTOR.md for detailed change tracking.
