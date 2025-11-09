# Blog Content & SVG Generation Plan

## Current Status

### Existing Blog Posts (in public/blog/)
1. **agentic-architecture.md** - Already has SVG images embedded
   - References: `./img/c_prime.svg`, `./img/c_prime_graph.svg`, etc.
   - Images exist in: `public/blog/agentic-architecture/img/`

2. **algebra.md** - Mathematical formalization (needs review for SVG needs)

3. **reliability-testing.md** - CAT Framework white paper
   - Has PNG images in: `public/blog/reliability-testing/img/`

### New Blog Posts to Add (from ../cat-framework/docs/reliability_testing/blogs/)
1. **01-introduction-agentic-reliability.md**
   - Title: "Redefining Trust: How Artium AI is Pioneering Reliability in Agentic Systems"
   - Reading time: 8 min
   - IMAGE PLACEHOLDERS: 4 total
     - Traditional vs agentic testing complexity diagram
     - Agent interaction DAG visualization
     - Error rates comparison graph
     - (Others in CLIENT SUCCESS METRICS section)

2. **02-mathematics-of-trust.md**
   - Title: "The Mathematics of Trust: Graph Theory and Bayesian Analysis Power AI Reliability"
   - Reading time: 10 min
   - IMAGE PLACEHOLDERS: 5 total
     - Linear thinking vs exponential complexity
     - Traditional vs node-centric graph comparison
     - Information gain heatmap
     - Tensor decomposition visualization
     - Bar chart comparing success rates

3. **03-building-testing-framework.md**
   - Title: "From Theory to Production: Building an Enterprise-Grade AI Testing Framework"
   - Reading time: 12 min
   - IMAGE PLACEHOLDERS: 4 total
     - Traditional vs adaptive test flow diagram
     - Parallel test execution dashboard
     - Time series reliability trends with anomaly detection
     - Visual debugging interface screenshot

## SVG Generation Requirements

### Category 1: Blog Card Preview Images
Need beautiful, professional SVGs for blog post cards in the homepage/blog listing:

1. **01-introduction-agentic-reliability** → Need: Abstract representation of reliability testing
   - Concept: Network/graph with checkmarks, quality metrics
   - Colors: Primary blues, accent purples
   - Style: Modern, clean, technical

2. **02-mathematics-of-trust** → Need: Mathematical/graph theory visual
   - Concept: Graph structure with mathematical elements
   - Colors: Primary blues with mathematical symbols
   - Style: Academic but approachable

3. **03-building-testing-framework** → Need: Code/framework representation
   - Concept: Testing pipeline or framework diagram
   - Colors: Developer-focused, code-like aesthetic
   - Style: Technical, systematic

### Category 2: Inline Content SVGs (Embedded in Markdown)
Each IMAGE PLACEHOLDER needs to be replaced with actual SVG:

**Blog 01 placeholders:**
1. Traditional software testing vs. agentic system testing complexity
2. Agent interaction DAG with multiple tool invocations
3. Error rates comparison (traditional vs agentic systems)

**Blog 02 placeholders:**
1. Linear human thinking vs. exponential system complexity
2. Traditional vs. node-centric graph representations
3. Adaptive test selection information gain heatmap
4. Tensor decomposition revealing patterns
5. Success rates bar chart

**Blog 03 placeholders:**
1. Traditional linear test flow vs. adaptive AI agent test requirements
2. Parallel test execution dashboard
3. Time series graph with anomaly detection
4. Visual debugging interface

## Implementation Plan

### Phase 1: Add New Blog Posts
1. Copy markdown files to public/blog/
2. Update blog-posts.ts with metadata for all 3 new posts
3. Determine slugs and IDs

### Phase 2: Generate Blog Card Preview SVGs
Create 3 beautiful SVGs for the new blog cards:
- Save to: `public/images/blog/`
- Naming: `introduction-agentic-reliability.svg`, `mathematics-of-trust.svg`, `building-testing-framework.svg`
- Update blog-posts.ts image properties

### Phase 3: Generate Inline Content SVGs
For each IMAGE PLACEHOLDER:
1. Design appropriate SVG matching the description
2. Save to appropriate img/ subdirectories
3. Replace [IMAGE PLACEHOLDER: ...] with actual SVG embed or <img> tag

### Phase 4: Update Existing Blog Card Images
Ensure all blog posts have beautiful preview images:
- agentic-architecture: Already has AT.svg ✓
- algebra: Has agentic-architecture.png ✓
- reliability-testing: Has reliability-tensor.webp ✓
- (New ones will get custom SVGs)

## SVG Design Guidelines

**Color Palette** (from tailwind.config.js):
- Primary: #0284c7 (600), #0369a1 (700), #075985 (800), #0c4a6e (900)
- Accent: #c026d3 (600), #a21caf (700), #86198f (800), #701a75 (900)

**Style Guidelines:**
- Clean, modern, professional
- No gradients that might not render well
- Proper viewBox and dimensions
- Accessible (proper contrast)
- Scalable (vector-based, no raster elements)

## File Structure After Implementation

```
public/
├── blog/
│   ├── 01-introduction-agentic-reliability.md
│   ├── 02-mathematics-of-trust.md
│   ├── 03-building-testing-framework.md
│   ├── agentic-architecture.md
│   ├── agentic-architecture.pdf
│   ├── algebra.md
│   ├── reliability-testing.md
│   ├── reliability-testing.pdf
│   ├── agentic-architecture/
│   │   └── img/
│   │       ├── c_prime.svg ✓
│   │       ├── c_prime_graph.svg ✓
│   │       └── [other existing SVGs]
│   ├── reliability-testing/
│   │   └── img/
│   │       ├── plot.png ✓
│   │       ├── table.png ✓
│   │       └── [other existing PNGs]
│   └── [NEW] blog-01/
│       └── img/
│           ├── testing-complexity.svg
│           ├── agent-dag.svg
│           └── error-rates.svg
│   └── [NEW] blog-02/
│       └── img/
│           ├── thinking-complexity.svg
│           ├── graph-comparison.svg
│           ├── info-gain-heatmap.svg
│           ├── tensor-decomposition.svg
│           └── success-rates.svg
│   └── [NEW] blog-03/
│       └── img/
│           ├── test-flow-comparison.svg
│           ├── parallel-execution.svg
│           ├── time-series-reliability.svg
│           └── debugging-interface.svg
└── images/
    └── blog/
        ├── AT.svg ✓
        ├── reliability-tensor.webp ✓
        ├── agentic-architecture.png ✓
        ├── [NEW] introduction-agentic-reliability.svg
        ├── [NEW] mathematics-of-trust.svg
        └── [NEW] building-testing-framework.svg
```

## Notes

### Artium AI Branding
These blog posts reference "Artium AI" as the author/company. Since this is now a personal Bagpyp consultancy site:
- **Option A**: Keep "Artium AI" references (shows enterprise partnership work)
- **Option B**: Rebrand to "Bagpyp" or "Robert Cunningham"
- **Recommendation**: Keep Artium references to show partnership/enterprise work, but add note indicating it's work done through Artium

### Blog Post Metadata
Will need to add to blog-posts.ts:
```typescript
{
  id: "introduction-agentic-reliability",
  slug: "introduction-agentic-reliability",
  title: "Redefining Trust: Agentic Reliability Testing",
  subtitle: "How We're Pioneering Reliability in Agentic Systems",
  excerpt: "...",
  content: "/blog/01-introduction-agentic-reliability.md",
  author: "Robert Cunningham (via Artium AI)",
  publishedDate: "2024-09-10",
  tags: ["Agentic AI", "Reliability Testing", "CAT Framework", "OpenAI"],
  category: "AI Engineering",
  readingTime: 8,
  featured: true,
  image: "introduction-agentic-reliability.svg"
}
```

### SVG Generation Strategy
1. Use simple, clean geometric shapes
2. Focus on conveying concepts clearly
3. Professional color scheme (primary/accent from tailwind config)
4. All SVGs should be self-contained (no external dependencies)
5. Optimize for light backgrounds (as used in blog layout)
