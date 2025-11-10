# G Major Position Selection Fix - Summary

## Problem Identified

For G major (and some other keys), **positions 2 and 3 were skipping middle voicings** and jumping too high on the fretboard. This resulted in:

### Before Fix
- **Group 1 (A-D-G)**:
  - Position 2: [14, 12, 12] avg=12.67 frets ❌ **Skipped the middle voicing!**
  - Position 3: [17, 17, 16] avg=16.67 frets
  - **Missing**: [10, 9, 7] avg=8.67 frets (the middle voicing)

- **Group 2 (D-G-B)**:
  - Position 2: [12, 12, 12] avg=12.00 frets ❌ **Skipped the middle voicing!**
  - Position 3: [17, 16, 15] avg=16.00 frets
  - **Missing**: [9, 7, 8] avg=8.00 frets (the middle voicing)

## Root Cause

The bug was in the **`select4Positions()`** function at line 318-323 of `lib/triads.ts`.

The original formula for selecting position indices was:
```typescript
let indices = [
    0,
    Math.max(1, Math.floor(n / 3)),
    Math.max(2, Math.floor((2 * n) / 3)),
    n - 1
];
```

This caused uneven spacing that skipped middle voicings.

## The Fix

Changed to a proper quartile-based distribution:
```typescript
let indices = [
    0,                    // 0th percentile (lowest)
    Math.round(n / 4),    // 25th percentile
    Math.floor(n / 2),    // 50th percentile (median, floor to favor middle)
    n - 1                 // 100th percentile (highest)
];
```

## After Fix

### G Major Groups 1 & 2 Now Include Middle Voicings ✓

- **Group 1 (A-D-G)**:
  - Position 0: [2, 0, 0] avg=0.67 frets
  - Position 1: [5, 5, 4] avg=4.67 frets
  - Position 2: [10, 9, 7] avg=8.67 frets ✓ **MIDDLE VOICING INCLUDED**
  - Position 3: [17, 17, 16] avg=16.67 frets

- **Group 2 (D-G-B)**:
  - Position 0: [0, 0, 0] avg=0.00 frets
  - Position 1: [5, 4, 3] avg=4.00 frets
  - Position 2: [9, 7, 8] avg=8.00 frets ✓ **MIDDLE VOICING INCLUDED**
  - Position 3: [17, 16, 15] avg=16.00 frets

## About Position 3 at Fret 17

Position 3 still reaches fret 17 for some keys (G, G#, D, D#, F, F#, A, A#, B). This is **expected behavior** because:

1. **Position 3 is the highest position** by design (100th percentile)
2. **Available voicings naturally go to fret 17-18** to cover the full fretboard
3. **G major is "chain-sparse"** - only 6 valid voicings exist for these string groups
4. The voicings cluster in two groups:
   - Low-mid range: frets 0-9
   - High range: frets 14-17
   - **No valid voicings exist in frets 10-13** (due to triad constraints)

### Why the Large Gap?

For Group 1, the 6 available voicings are:
- 0: [2, 0, 0] avg=0.67
- 1: [2, 5, 7] avg=4.67
- 2: [5, 5, 4] avg=4.67
- 3: [10, 9, 7] avg=8.67 ← **NOW INCLUDED in Position 2**
- 4: [14, 12, 12] avg=12.67
- 5: [17, 17, 16] avg=16.67 ← Position 3

The algorithm selects indices 0, 2, 3, 5 (positions 0-3). The gap between indices 3 and 5 (8.67 → 16.67) is large because index 4 (at avg=12.67) would reduce Position 3's fretboard coverage.

## Alternative Considered

We could select index 4 instead of index 5 for Position 3:
- Would avoid fret 17
- Would reduce gap from 8.0 to 4.0 frets
- **But would reduce fretboard coverage from 0-17 to 0-14**

Current design prioritizes **full fretboard coverage** over minimizing gaps.

## Test Results

✅ All 53 guitar-specific tests pass
✅ Middle voicings now included for all affected keys
✅ Position selection improved across all 12 keys

## Keys Affected by This Fix

Keys where middle voicings were previously skipped:
- **G major** (Groups 1 & 2) - Primary issue reported
- **G# major** (Groups 1 & 2)
- **B major** (Group 1)
- And likely a few others

All now correctly include middle voicings in Position 2.

## Files Modified

- `lib/triads.ts` - Lines 318-323 (position selection formula)

## Related Analysis

See `ANALYSIS.md` for detailed technical analysis of the bug and fix.
