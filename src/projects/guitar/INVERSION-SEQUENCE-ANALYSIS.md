# Inversion Sequence Pattern Analysis

## Test Created

**File**: `__tests__/inversion-sequence.test.ts`

Tests that all position sequences follow the cyclic inversion pattern:
```
[..., 1, 2, ∆, 1, 2, ∆, 1, 2, ∆, ...]
```

Where:
- **1** = first inversion (3rd in bass)
- **2** = second inversion (5th in bass)
- **∆** = root position (root in bass)

## Valid 4-Position Sequences

Starting from any point in the cycle:
- `[1, 2, ∆, 1]` - Start on first inversion
- `[2, ∆, 1, 2]` - Start on second inversion
- `[∆, 1, 2, ∆]` - Start on root position

## Current Test Results

**FAILING**: 17 out of 48 groups violate the pattern (35% failure rate)

### Keys with Perfect Sequences ✓
- **C major** - All 4 groups valid
- **C# major** - All 4 groups valid

### Keys with Violations ✗

| Key | Violations | Violating Groups |
|-----|------------|------------------|
| D | 1/4 | G1: [∆, 1, **1**, 2] - Position 2 repeats first inversion |
| D# | 1/4 | G1: [**2**, 1, **1**, 2] - Position 0 wrong, Position 2 repeats |
| **E** | **4/4** | **All groups violated** |
| F | 2/4 | G0: [1, **1**, 2, ∆], G1: [1, ∆, **1**, 2] |
| F# | 2/4 | G0: [1, **1**, 2, ∆], G1: [1, ∆, **1**, 2] |
| **G** | 1/4 | **G0: [∆, 1, 1, ∆]** - Your reported issue! |
| G# | 1/4 | G0: [∆, 1, **1**, ∆] |
| A | 2/4 | G0: [∆, 1, **1**, 2], G1: [1, **1**, 2, 1] |
| A# | 2/4 | G0: [**2**, 1, **1**, 2], G1: [1, **1**, 2, ∆] |
| B | 1/4 | G1: [1, **1**, 2, ∆] |

### Common Violation Patterns

1. **Repeated inversions**: Most common - same inversion for consecutive positions
   - Example: G major G0 has `[∆, 1, **1**, ∆]` - Position 1 and 2 both "first"

2. **Wrong starting inversion**: Less common
   - Example: E major groups all skip elements in the cycle

3. **E major is worst**: All 4 groups violated
   - E seems to have fundamentally incompatible voicing geometry

## Root Cause

The current algorithm prioritizes:
1. **Fretboard coverage** (low to high frets)
2. **Note sharing** between adjacent groups
3. **Avoiding fret 17+**
4. **Even spacing** (quartile-based)

It does NOT consider inversion sequence at all!

## Why This Matters

The cyclic inversion pattern is musically important because:
1. **Predictable voice leading** - Each position moves smoothly to the next
2. **Consistent fingerings** - Players can anticipate shapes
3. **Pedagogical clarity** - Easier to learn and teach
4. **Musical coherence** - Natural harmonic progression up the neck

## Example: G Major Group 0

**Current (WRONG)**:
```
Pos 0: ∆ (root)   - [3, 2, 0]
Pos 1: 1 (first)  - [7, 5, 5]
Pos 2: 1 (first)  - [7, 10, 12]  ← Should be 2 (second)!
Pos 3: ∆ (root)   - [15, 14, 12]
```

**Expected**:
```
Pos 0: ∆ (root)   - [3, 2, 0]
Pos 1: 1 (first)  - [7, 5, 5]
Pos 2: 2 (second) - ???  ← Need to find this voicing
Pos 3: ∆ (root)   - [15, 14, 12]
```

## How to Fix

The position selection algorithm needs to:

1. **Add inversion as a constraint** alongside fret coverage
2. **Filter voicings by target inversion** before selecting by avgFret
3. **Balance** between:
   - Inversion correctness (priority)
   - Fretboard coverage
   - Note sharing
   - Avoiding fret 17+

This is a significant refactor of `select4Positions()` and `select4PositionsCoordinated()`.

## Test Suite

The test file includes:
- ✅ Pattern validation for all 12 keys
- ✅ Specific test for G major Group 0
- ✅ Cycle wrapping validation
- ✅ Adjacent position increment tests

Run with:
```bash
npm test -- inversion-sequence.test.ts
```

## Next Steps

1. Decide on priority: Inversion correctness vs. fretboard coverage vs. note sharing
2. Refactor selection algorithm to consider inversions
3. Iterate until tests pass
4. May need to compromise on some constraints for keys like E major

## Notes

- C and C# major already pass perfectly - good reference implementations
- G major Group 0 is a clear, isolated case to fix first
- E major may require special handling (all groups violated)
- This explains why some voicings "felt wrong" - they break the natural cycle
