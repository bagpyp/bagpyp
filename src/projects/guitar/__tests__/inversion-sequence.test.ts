/**
 * Test that inversion sequences follow the cyclic pattern: [..., 1, 2, ∆, 1, 2, ∆, ...]
 */

import { describe, it, expect } from '@jest/globals';
import { generateTriadsData } from '../lib/triads';
import type { NoteName } from '../lib/types';
import type { InversionType } from '../lib/triads';

describe('Inversion Sequence Pattern', () => {
  // The cyclic pattern: first (1) -> second (2) -> root (∆) -> first (1) -> ...
  const INVERSION_CYCLE: InversionType[] = ['first', 'second', 'root'];

  /**
   * Check if a sequence of inversions follows the cyclic pattern
   * starting from any point in the cycle
   */
  function isValidInversionSequence(inversions: InversionType[]): boolean {
    if (inversions.length === 0) return true;
    if (inversions.some(inv => inv === 'unknown')) return false;

    // Find starting position in cycle
    const startIdx = INVERSION_CYCLE.indexOf(inversions[0]);
    if (startIdx === -1) return false;

    // Check that each subsequent inversion follows the cycle
    for (let i = 0; i < inversions.length; i++) {
      const expectedInversion = INVERSION_CYCLE[(startIdx + i) % 3];
      if (inversions[i] !== expectedInversion) {
        return false;
      }
    }

    return true;
  }

  /**
   * Format inversion sequence for readable output
   */
  function formatSequence(inversions: InversionType[]): string {
    return inversions.map(inv =>
      inv === 'root' ? '∆' :
      inv === 'first' ? '1' :
      inv === 'second' ? '2' : '?'
    ).join(', ');
  }

  const allKeys: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  describe('Pattern validation for all keys', () => {
    allKeys.forEach(key => {
      it(`${key} major should follow inversion cycle pattern in all groups`, () => {
        const data = generateTriadsData(key);

        data.stringGroups.forEach((group, groupIdx) => {
          const inversions = group.voicings
            .sort((a, b) => a.position - b.position)
            .map(v => v.inversion);

          const isValid = isValidInversionSequence(inversions);

          expect(isValid).toBe(true);

          if (!isValid) {
            // Provide helpful error message
            const sequence = formatSequence(inversions);
            console.error(`
              ${key} major, Group ${groupIdx} (${group.stringNames.join('-')}):
              Sequence: [${sequence}]
              Expected pattern: [1, 2, ∆, 1] or [2, ∆, 1, 2] or [∆, 1, 2, ∆]
            `);
          }
        });
      });
    });
  });

  describe('Specific test cases', () => {
    it('G major Group 0 should follow pattern [∆, 1, 2, ∆]', () => {
      const data = generateTriadsData('G');
      const group0 = data.stringGroups[0];

      const inversions = group0.voicings
        .sort((a, b) => a.position - b.position)
        .map(v => v.inversion);

      // G major Group 0 starts with root (∆), so should follow: ∆, 1, 2, ∆
      expect(inversions).toEqual(['root', 'first', 'second', 'root']);

      const sequence = formatSequence(inversions);
      expect(sequence).toBe('∆, 1, 2, ∆');
    });

    it('C major Group 0 should follow a valid cyclic pattern', () => {
      const data = generateTriadsData('C');
      const group0 = data.stringGroups[0];

      const inversions = group0.voicings
        .sort((a, b) => a.position - b.position)
        .map(v => v.inversion);

      expect(isValidInversionSequence(inversions)).toBe(true);
    });

    it('All groups should have exactly 4 positions', () => {
      allKeys.forEach(key => {
        const data = generateTriadsData(key);

        data.stringGroups.forEach(group => {
          expect(group.voicings).toHaveLength(4);
        });
      });
    });

    it('Pattern should wrap correctly at boundaries', () => {
      // Test that the cycle wraps: if we have [2, ∆, 1, 2], the next would be ∆
      const testSequences = [
        { seq: ['first', 'second', 'root', 'first'], valid: true },
        { seq: ['second', 'root', 'first', 'second'], valid: true },
        { seq: ['root', 'first', 'second', 'root'], valid: true },
        { seq: ['first', 'root', 'second', 'first'], valid: false }, // Invalid
        { seq: ['root', 'second', 'first', 'root'], valid: false }, // Invalid
      ];

      testSequences.forEach(({ seq, valid }) => {
        expect(isValidInversionSequence(seq as InversionType[])).toBe(valid);
      });
    });
  });

  describe('Adjacent positions increment through cycle', () => {
    it('Each position should be next in cycle from previous position', () => {
      allKeys.forEach(key => {
        const data = generateTriadsData(key);

        data.stringGroups.forEach((group, groupIdx) => {
          const sorted = [...group.voicings].sort((a, b) => a.position - b.position);

          for (let i = 0; i < sorted.length - 1; i++) {
            const currentInv = sorted[i].inversion;
            const nextInv = sorted[i + 1].inversion;

            const currentIdx = INVERSION_CYCLE.indexOf(currentInv);
            const nextIdx = INVERSION_CYCLE.indexOf(nextInv);

            // Next inversion should be (current + 1) % 3
            const expectedNextIdx = (currentIdx + 1) % 3;

            expect(nextIdx).toBe(expectedNextIdx);

            if (nextIdx !== expectedNextIdx) {
              console.error(`
                ${key} major, Group ${groupIdx}, Position ${i} -> ${i + 1}:
                Current: ${currentInv}, Next: ${nextInv}
                Expected next: ${INVERSION_CYCLE[expectedNextIdx]}
              `);
            }
          }
        });
      });
    });
  });
});
