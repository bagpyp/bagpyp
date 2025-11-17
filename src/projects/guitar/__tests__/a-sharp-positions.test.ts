import { describe, it, expect } from 'vitest';
import { generateTriadsData } from '../lib/triads';

describe('A# positions relative to A', () => {
  it('should have Groups 1, 2, and 3 exactly as A positions + 1 fret', () => {
    const dataA = generateTriadsData('A');
    const dataASharp = generateTriadsData('A#');

    // Groups 1, 2, and 3 should be identical except shifted up 1 fret
    for (let groupIdx = 1; groupIdx <= 3; groupIdx++) {
      const groupA = dataA.stringGroups[groupIdx];
      const groupASharp = dataASharp.stringGroups[groupIdx];

      // Should have same number of positions
      expect(groupASharp.voicings.length).toBe(groupA.voicings.length);

      // Each position in A# should be A + 1
      for (let posIdx = 0; posIdx < groupA.voicings.length; posIdx++) {
        const voicingA = groupA.voicings[posIdx];
        const voicingASharp = groupASharp.voicings[posIdx];

        // Check that each fret in A# is exactly A + 1
        for (let stringIdx = 0; stringIdx < 3; stringIdx++) {
          const expectedFret = voicingA.frets[stringIdx] + 1;
          const actualFret = voicingASharp.frets[stringIdx];

          expect(actualFret).toBe(expectedFret);
        }

        // Inversions should be the same
        expect(voicingASharp.inversion).toBe(voicingA.inversion);
      }
    }
  });

  it('should have Group 0 with special handling near the nut', () => {
    const dataASharp = generateTriadsData('A#');
    const group0 = dataASharp.stringGroups[0];

    // Group 0 should have at least one position with open string or 1st fret
    const hasLowPosition = group0.voicings.some(v =>
      v.frets.some(f => f <= 1)
    );
    expect(hasLowPosition).toBe(true);

    // Group 0 positions should still be valid triads
    group0.voicings.forEach(voicing => {
      // All notes should be from A# major triad (A#, D, F)
      voicing.noteNames.forEach(note => {
        const baseNote = note.replace(/\d+$/, '');
        expect(['A#', 'D', 'F']).toContain(baseNote);
      });
    });
  });

  it('should maintain proper position ordering for all groups in A#', () => {
    const dataASharp = generateTriadsData('A#');

    dataASharp.stringGroups.forEach((group, groupIdx) => {
      const avgFrets = group.voicings.map(v => v.avgFret);

      // Check ascending order
      for (let i = 1; i < avgFrets.length; i++) {
        expect(avgFrets[i]).toBeGreaterThan(avgFrets[i - 1]);
      }
    });
  });

  it('should have correct A positions as baseline', () => {
    const dataA = generateTriadsData('A');

    // Verify A has the expected positions (from the fixed hard-coded data)
    const expectedA = {
      G1: [[4, 2, 2], [7, 7, 6], [12, 11, 9], [16, 14, 14]],
      G2: [[2, 2, 2], [7, 6, 5], [11, 9, 10], [14, 14, 14]],
      G3: [[2, 2, 0], [6, 5, 5], [9, 10, 9], [14, 14, 12]]
    };

    // Check Group 1
    expectedA.G1.forEach((expectedFrets, posIdx) => {
      expect(dataA.stringGroups[1].voicings[posIdx].frets).toEqual(expectedFrets);
    });

    // Check Group 2
    expectedA.G2.forEach((expectedFrets, posIdx) => {
      expect(dataA.stringGroups[2].voicings[posIdx].frets).toEqual(expectedFrets);
    });

    // Check Group 3
    expectedA.G3.forEach((expectedFrets, posIdx) => {
      expect(dataA.stringGroups[3].voicings[posIdx].frets).toEqual(expectedFrets);
    });
  });

  it('should have A# Groups 1-3 as A + 1', () => {
    const dataASharp = generateTriadsData('A#');

    // Expected A# positions (A + 1)
    const expectedASharp = {
      G1: [[5, 3, 3], [8, 8, 7], [13, 12, 10], [17, 15, 15]],  // A Group 1 + 1
      G2: [[3, 3, 3], [8, 7, 6], [12, 10, 11], [15, 15, 15]],  // A Group 2 + 1
      G3: [[3, 3, 1], [7, 6, 6], [10, 11, 10], [15, 15, 13]]   // A Group 3 + 1
    };

    // Check Group 1
    expectedASharp.G1.forEach((expectedFrets, posIdx) => {
      expect(dataASharp.stringGroups[1].voicings[posIdx].frets).toEqual(expectedFrets);
    });

    // Check Group 2
    expectedASharp.G2.forEach((expectedFrets, posIdx) => {
      expect(dataASharp.stringGroups[2].voicings[posIdx].frets).toEqual(expectedFrets);
    });

    // Check Group 3
    expectedASharp.G3.forEach((expectedFrets, posIdx) => {
      expect(dataASharp.stringGroups[3].voicings[posIdx].frets).toEqual(expectedFrets);
    });
  });
});