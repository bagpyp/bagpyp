# Featured Items Configuration Guide

## Overview

The homepage uses a **configuration-driven system** for featured content. You can mix and match case studies, projects, and blog posts in any order you want.

---

## How It Works

### Configuration File

Edit `src/config/featured-items.ts` to control what appears on the homepage:

```typescript
export const featuredItems: FeaturedItemConfig[] = [
  { type: "case-study", id: "mayo-clinic" },
  { type: "project", id: "guitar-triads" },
  { type: "blog", id: "reliability-testing" },
  // Add as many as you want in any order!
];
```

### Item Types

**`case-study`**: Professional experience
- IDs from `src/data/case-studies.ts`
- Examples: `mayo-clinic`, `ebay`, `ford`, `hillcrest`

**`project`**: Personal projects
- IDs from `src/data/projects.ts`
- Examples: `guitar-triads`, `guitar-modes`, `graph-dynamics`, `dragontree`

**`blog`**: Technical blog posts
- IDs from `src/data/blog-posts.ts`
- Examples: `agentic-architecture`, `agentic-algebra`, `reliability-testing`

---

## Examples

### Highlight AI Work First
```typescript
export const featuredItems = [
  { type: "case-study", id: "mayo-clinic" },
  { type: "case-study", id: "ebay" },
  { type: "case-study", id: "trust-and-will" },
  { type: "blog", id: "reliability-testing" },
  { type: "project", id: "guitar-triads" },
];
```

### Mix Everything
```typescript
export const featuredItems = [
  { type: "project", id: "guitar-triads" },    // Interactive guitar
  { type: "case-study", id: "mayo-clinic" },   // AI work
  { type: "blog", id: "agentic-architecture" }, // Technical writing
  { type: "case-study", id: "hillcrest" },     // Ongoing client
  { type: "project", id: "graph-dynamics" },   // Academic work
  { type: "blog", id: "reliability-testing" }, // White paper
];
```

### Promote Latest Work
```typescript
export const featuredItems = [
  // Latest case studies first
  { type: "case-study", id: "arrive-health" },
  { type: "case-study", id: "trust-and-will" },

  // Thought leadership
  { type: "blog", id: "reliability-testing" },
  { type: "blog", id: "agentic-algebra" },

  // Projects
  { type: "project", id: "guitar-modes" },

  // Must include for client software check
  { type: "case-study", id: "hillcrest" },
];
```

---

## 🔴 Critical Requirement

**Hillcrest Ski & Sports MUST be visible on the homepage**

Either:
1. Include `{ type: "case-study", id: "hillcrest" }` in the config, OR
2. Keep the text "Hillcrest Ski & Sports" in the section description

The client's software checks for this text. It's tested in:
`src/__tests__/pages/homepage-content.test.tsx`

---

## How The System Works

1. **Configuration** (`src/config/featured-items.ts`)
   - You define the list of items

2. **Build Time** (`getStaticProps` in `src/pages/index.tsx`)
   - Looks up each item from its data source
   - Builds array of featured items

3. **Render** (`HomePage` component)
   - Uses `FeaturedCard` component
   - Automatically renders correct card type
   - Displays in order specified

---

## Adding New Items

### Step 1: Add Content
Add the case study, project, or blog post to its respective data file:
- `src/data/case-studies.ts`
- `src/data/projects.ts`
- `src/data/blog-posts.ts`

### Step 2: Feature It
Add to `src/config/featured-items.ts`:
```typescript
{ type: "project", id: "your-new-project-id" }
```

### Step 3: Build
```bash
npm run build
npm test
```

That's it! Your new item appears on the homepage.

---

## Benefits

✅ **Flexible**: Mix any content types in any order
✅ **Simple**: One config file to edit
✅ **Type-Safe**: TypeScript ensures IDs are correct
✅ **Tested**: Comprehensive test coverage
✅ **Fast**: Static site generation

---

## Current Configuration

As of now, homepage features (in order):
1. Mayo Clinic (case study)
2. eBay (case study)
3. Trust & Will (case study)
4. Guitar Triads (project)
5. **Hillcrest** (case study) - CRITICAL
6. Reliability Testing (blog)
7. Guitar Modes (project)
8. Graph Dynamics (project)
9. Agentic Architecture (blog)

**9 items total** - all configurable!

---

## Questions?

See:
- `src/config/featured-items.ts` - The configuration
- `src/components/FeaturedCard.tsx` - The universal card component
- `src/pages/index.tsx` - How it's used
- Test files for examples
