# G Major Position Selection Bug - Root Cause Analysis

## Problem Summary

For G major, Groups 1 and 2 have positions 2 and 3 shifted too high on the fretboard, with position 3 reaching fret 17. The middle voicings (around frets 8-10) are being skipped.

## Root Cause

The bug is in the **`select4Positions()`** function (independent selection algorithm) at lines 318-323 of `triads.ts`.

### Current Buggy Code

```typescript
let indices = [
    0,  // Lowest
    Math.max(1, Math.floor(n / 3)),  // Lower third
    Math.max(2, Math.floor((2 * n) / 3)),  // Upper third
    n - 1  // Highest
];
```

### Why It Fails

For **Group 1** (6 voicings, indices 0-5):
- Position 0: index 0 → [2, 0, 0] avg=0.67 ✓
- Position 1: index max(1, floor(6/3)) = **2** → [5, 5, 4] avg=4.67 ✓
- Position 2: index max(2, floor(12/3)) = **4** → [14, 12, 12] avg=12.67 ❌ **SKIPS INDEX 3!**
- Position 3: index 5 → [17, 17, 16] avg=16.67 ✓

The formula selects indices **0, 2, 4, 5**, skipping the voicing at index 3 ([10, 9, 7] avg=8.67).

For **Group 2** (5 voicings, indices 0-4):
- Position 0: index 0 → [0, 0, 0] avg=0.00 ✓
- Position 1: index max(1, floor(5/3)) = **1** → [5, 4, 3] avg=4.00 ✓
- Position 2: index max(2, floor(10/3)) = **3** → [12, 12, 12] avg=12.00 ❌ **SKIPS INDEX 2!**
- Position 3: index 4 → [17, 16, 15] avg=16.00 ✓

The formula selects indices **0, 1, 3, 4**, skipping the voicing at index 2 ([9, 7, 8] avg=8.00).

## Why This Matters

The skipped voicings ARE part of valid chains:
- **Second inversion chain** (avg=8.42):
  - Group 0: [10, 10, 9] avg=9.67
  - Group 1: [10, 9, 7] avg=8.67 ← SKIPPED
  - Group 2: [9, 7, 8] avg=8.00 ← SKIPPED
  - Group 3: [7, 8, 7] avg=7.33

This chain provides excellent middle-position coverage but is never selected.

## Available Chains in G Major

Only **3 complete chains** exist (G major is chain-sparse):
1. **First inversion**: avg=4.42 (low position)
2. **Second inversion**: avg=8.42 (MIDDLE - currently skipped!)
3. **Root inversion**: avg=12.42 (high position)

Since no inversion has >= 2 chains, `select4PositionsCoordinated()` falls back to independent selection, which then hits the bug in `select4Positions()`.

## The Fix

Replace the index calculation with a formula that ensures even distribution:

```typescript
let indices = [
    0,  // Lowest
    Math.round((n - 1) / 3),  // 33% through range
    Math.round((n - 1) * 2 / 3),  // 67% through range
    n - 1  // Highest
];
```

### Validation

For **n=6** (Group 1):
- 0
- round(5 / 3) = **2** ✓
- round(10 / 3) = **3** ✓ (includes the missing voicing!)
- 5

Result: indices **0, 2, 3, 5** ✓

For **n=5** (Group 2):
- 0
- round(4 / 3) = **1** ✓
- round(8 / 3) = **3** ✓
- 4

Result: indices **0, 1, 3, 4** (still skips 2, but better than before)

Actually, wait - for n=5, we still skip index 2. Let me recalculate:
- round(4 / 3) = round(1.33) = 1
- round(8 / 3) = round(2.67) = 3

So it's 0, 1, 3, 4. To get 0, 1, 2, 4 we'd need the second position to round to 2.

Let me try a different approach: use a more even distribution by treating the array as having n-1 gaps.

## Better Fix

```typescript
let indices = [
    0,
    Math.round((n - 1) * 1 / 3),
    Math.round((n - 1) * 2 / 3),
    n - 1
];
```

For **n=6**:
- 0, round(5/3)=2, round(10/3)=3, 5 → **0, 2, 3, 5** ✓

For **n=5**:
- 0, round(4/3)=1, round(8/3)=3, 4 → **0, 1, 3, 4**

Hmm, still skips 2 for n=5. But that's actually reasonable - with 5 items and 4 positions, you have to skip one, and skipping the middle is actually okay for distribution.

Actually, I think the issue is we want quartiles, not thirds. Let me try:

```typescript
let indices = [
    0,
    Math.round(n / 4),
    Math.round(n / 2),
    n - 1
];
```

For **n=6**:
- 0, round(1.5)=2, round(3)=3, 5 → **0, 2, 3, 5** ✓

For **n=5**:
- 0, round(1.25)=1, round(2.5)=2, 4 → **0, 1, 2, 4** ✓

For **n=7**:
- 0, round(1.75)=2, round(3.5)=4, 6 → **0, 2, 4, 6** ✓

This looks even better! Using quartile boundaries.

## Recommended Fix

```typescript
let indices = [
    0,  // Lowest (0th percentile)
    Math.round(n / 4),  // 25th percentile
    Math.round(n / 2),  // 50th percentile (median)
    n - 1  // Highest (100th percentile)
];
```

This ensures:
1. More even distribution across the fretboard
2. Includes middle voicings that are currently skipped
3. Respects the quartile-based philosophy mentioned in the function comment
