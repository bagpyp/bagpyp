import { generateChordData, getSupportedKeys, debugMinorTransformations } from '../lib/chords';
import { buildChord } from '../lib/chord-types';

describe('Minor Chord Transformations', () => {
  describe('C minor chord', () => {
    it('should transform C major to C minor where possible', () => {
      const chordData = generateChordData('C', 'minor');

      if (!chordData) {
        console.log('C minor transformation details:');
        debugMinorTransformations('C');
      }

      expect(chordData).toBeDefined();

      if (chordData) {
        // Verify chord notes are correct for C minor (C, Eb, G)
        expect(chordData.chordNotes).toEqual(['C', 'D#', 'G']); // D# is enharmonic to Eb

        // Check that we have some voicings
        expect(chordData.stringGroups.length).toBeGreaterThan(0);

        // Verify all voicings contain only C minor chord tones
        const cMinorPcs = buildChord('C', 'minor');
        for (const group of chordData.stringGroups) {
          for (const voicing of group.voicings) {
            // All notes should be from C minor triad
            voicing.notes.forEach(pc => {
              expect(cMinorPcs).toContain(pc);
            });

            // Should have all three chord tones
            const uniqueNotes = new Set(voicing.notes);
            cMinorPcs.forEach(pc => {
              expect(uniqueNotes.has(pc)).toBe(true);
            });
          }
        }
      }
    });

    it('should identify which positions cannot be transformed due to open strings', () => {
      // This test helps us understand the limitations
      const majorData = generateChordData('C', 'major');
      const minorData = generateChordData('C', 'minor');

      expect(majorData).toBeDefined();

      if (majorData && minorData) {
        // Count total positions in major vs minor
        const majorPositionCount = majorData.stringGroups.reduce(
          (sum, group) => sum + group.voicings.length,
          0
        );
        const minorPositionCount = minorData.stringGroups.reduce(
          (sum, group) => sum + group.voicings.length,
          0
        );

        console.log(`C major positions: ${majorPositionCount}`);
        console.log(`C minor positions: ${minorPositionCount}`);
        console.log(`Positions lost: ${majorPositionCount - minorPositionCount}`);

        // We expect to lose some positions due to open string constraints
        expect(minorPositionCount).toBeLessThanOrEqual(majorPositionCount);
      }
    });
  });

  describe('G minor chord', () => {
    it('should handle G minor transformation', () => {
      const chordData = generateChordData('G', 'minor');

      if (!chordData) {
        console.log('G minor transformation details:');
        debugMinorTransformations('G');
      }

      // G has several open string positions, so transformation might be limited
      if (chordData) {
        expect(chordData.chordNotes).toEqual(['G', 'A#', 'D']); // A# is enharmonic to Bb

        const gMinorPcs = buildChord('G', 'minor');
        for (const group of chordData.stringGroups) {
          for (const voicing of group.voicings) {
            // Verify it's a valid G minor voicing
            const uniqueNotes = new Set(voicing.notes);
            expect(uniqueNotes.size).toBe(3);
            gMinorPcs.forEach(pc => {
              expect(uniqueNotes.has(pc)).toBe(true);
            });
          }
        }
      }
    });
  });

  describe('Supported keys for minor chords', () => {
    it('should identify which keys support minor chord transformations', () => {
      const supportedKeys = getSupportedKeys('minor');

      console.log('Keys with full minor chord support:', supportedKeys);

      // We expect at least some keys to support minor chords
      expect(supportedKeys.length).toBeGreaterThan(0);

      // Keys with fewer open string major thirds should work better
      // For example, keys like F, F#, etc. should have good support
      for (const key of supportedKeys) {
        const chordData = generateChordData(key, 'minor');
        expect(chordData).toBeDefined();

        if (chordData) {
          // Should have all 4 string groups
          expect(chordData.stringGroups.length).toBe(4);

          // Each group should have at least one voicing
          chordData.stringGroups.forEach((group, idx) => {
            expect(group.voicings.length).toBeGreaterThan(0);
          });
        }
      }
    });

    it('should show transformation analysis for all keys', () => {
      const allKeys = getSupportedKeys('major');
      console.log('\n=== Minor Chord Support Analysis ===\n');

      const analysis: Record<string, { supported: boolean; groupCoverage: number[] }> = {};

      for (const key of allKeys) {
        const minorData = generateChordData(key, 'minor');

        if (minorData) {
          analysis[key] = {
            supported: minorData.stringGroups.length === 4,
            groupCoverage: minorData.stringGroups.map(g => g.voicings.length),
          };
        } else {
          analysis[key] = {
            supported: false,
            groupCoverage: [],
          };
        }
      }

      // Print summary table
      console.log('Key   | Supported | Group 0 | Group 1 | Group 2 | Group 3 |');
      console.log('------|-----------|---------|---------|---------|---------|');
      for (const [key, data] of Object.entries(analysis)) {
        const g = data.groupCoverage;
        console.log(
          `${key.padEnd(5)} | ${data.supported ? '   ✓    ' : '   ✗    '} | ` +
          `   ${g[0] || 0}   | ` +
          `   ${g[1] || 0}   | ` +
          `   ${g[2] || 0}   | ` +
          `   ${g[3] || 0}   |`
        );
      }
    });
  });

  describe('Specific transformation mechanics', () => {
    it('should correctly flat the third in transformations', () => {
      // Test with a simple case: F major to F minor
      // F major: F, A, C
      // F minor: F, Ab, C (flatting A to Ab)

      const fMajor = buildChord('F', 'major');
      const fMinor = buildChord('F', 'minor');

      expect(fMajor).toEqual([5, 9, 0]); // F=5, A=9, C=0
      expect(fMinor).toEqual([5, 8, 0]); // F=5, Ab=8, C=0

      const chordData = generateChordData('F', 'minor');
      expect(chordData).toBeDefined();

      if (chordData && chordData.stringGroups.length > 0) {
        // Check that major thirds (A=9) are replaced with minor thirds (Ab=8)
        for (const group of chordData.stringGroups) {
          for (const voicing of group.voicings) {
            // Should not contain the major third (A=9)
            expect(voicing.notes).not.toContain(9);
            // Should contain the minor third (Ab=8) if the chord has a third
            if (voicing.notes.some(n => n === 8 || n === 5 || n === 0)) {
              // Valid F minor voicing
              expect(new Set(voicing.notes)).toEqual(new Set([5, 8, 0]));
            }
          }
        }
      }
    });
  });
});