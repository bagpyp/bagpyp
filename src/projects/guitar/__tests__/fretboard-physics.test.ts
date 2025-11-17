import { describe, it, expect } from 'vitest';

import {
  getFretPosition,
  getFretSpacing,
  getStringThickness,
  calculateFretYPositions,
  getNoteYPosition,
  getNoteAtPosition,
  getOctaveAtPosition,
} from '../lib/fretboard-physics';

describe('Fretboard Physics', () => {
  describe('getFretPosition', () => {
    it('should return 0 for the nut (fret 0)', () => {
      expect(getFretPosition(0)).toBe(0);
    });

    it('should return increasing distances for higher frets', () => {
      const fret1 = getFretPosition(1);
      const fret2 = getFretPosition(2);
      const fret12 = getFretPosition(12);

      expect(fret1).toBeGreaterThan(0);
      expect(fret2).toBeGreaterThan(fret1);
      expect(fret12).toBeGreaterThan(fret2);
    });

    it('should place 12th fret near halfway point of scale length', () => {
      const scaleLength = 648; // mm
      const fret12Pos = getFretPosition(12, scaleLength);

      // 12th fret should be very close to half the scale length
      expect(fret12Pos).toBeGreaterThan(scaleLength * 0.48);
      expect(fret12Pos).toBeLessThan(scaleLength * 0.52);
    });

    it('should have exponentially decreasing spacing (physics-based)', () => {
      const spacing1 = getFretSpacing(0);
      const spacing2 = getFretSpacing(1);
      const spacing12 = getFretSpacing(11);
      const spacing13 = getFretSpacing(12);

      // Each fret spacing should be smaller than the previous
      expect(spacing2).toBeLessThan(spacing1);
      expect(spacing13).toBeLessThan(spacing12);
    });
  });

  describe('getStringThickness', () => {
    it('should return thickest for 6th string (low E)', () => {
      const thickness6 = getStringThickness(0); // 6th string
      const thickness1 = getStringThickness(5); // 1st string

      expect(thickness6).toBeGreaterThan(thickness1);
    });

    it('should have decreasing thickness from 6th to 1st string', () => {
      const thicknesses = [0, 1, 2, 3, 4, 5].map(idx => getStringThickness(idx));

      // Verify all thicknesses are positive
      thicknesses.forEach(t => expect(t).toBeGreaterThan(0));

      // Verify decreasing from low to high strings
      for (let i = 0; i < thicknesses.length - 1; i++) {
        expect(thicknesses[i]).toBeGreaterThan(thicknesses[i + 1]);
      }
    });

    it('should scale with base width parameter', () => {
      const baseWidth1 = getStringThickness(0, 1.5);
      const baseWidth2 = getStringThickness(0, 3.0);

      expect(baseWidth2).toBeCloseTo(baseWidth1 * 2, 1);
    });
  });

  describe('calculateFretYPositions', () => {
    it('should return correct number of positions', () => {
      const positions = calculateFretYPositions(0, 18, 1000);
      expect(positions).toHaveLength(19); // 0-18 inclusive
    });

    it('should start at 0 and end near total height', () => {
      const height = 1000;
      const positions = calculateFretYPositions(0, 18, height);

      expect(positions[0]).toBe(0);
      expect(positions[positions.length - 1]).toBeCloseTo(height, 1);
    });

    it('should have increasing Y values', () => {
      const positions = calculateFretYPositions(0, 18, 1000);

      for (let i = 0; i < positions.length - 1; i++) {
        expect(positions[i + 1]).toBeGreaterThan(positions[i]);
      }
    });
  });

  describe('getNoteYPosition', () => {
    const fretYPositions = calculateFretYPositions(0, 18, 1000);

    it('should place open string at nut position', () => {
      const y = getNoteYPosition(0, fretYPositions, 0);
      expect(y).toBe(fretYPositions[0]);
    });

    it('should place notes between fret lines', () => {
      const y1 = getNoteYPosition(1, fretYPositions, 0);

      expect(y1).toBeGreaterThan(fretYPositions[0]);
      expect(y1).toBeLessThan(fretYPositions[1]);
    });

    it('should return position 65% toward fret (realistic finger placement)', () => {
      const y5 = getNoteYPosition(5, fretYPositions, 0);
      const expectedY = fretYPositions[4] + (fretYPositions[5] - fretYPositions[4]) * 0.65;

      expect(y5).toBeCloseTo(expectedY, 1);
    });
  });

  describe('getNoteAtPosition', () => {
    it('should return correct open string notes', () => {
      expect(getNoteAtPosition(0, 0).noteName).toBe('E');  // 6th string
      expect(getNoteAtPosition(1, 0).noteName).toBe('A');  // 5th string
      expect(getNoteAtPosition(2, 0).noteName).toBe('D');  // 4th string
      expect(getNoteAtPosition(3, 0).noteName).toBe('G');  // 3rd string
      expect(getNoteAtPosition(4, 0).noteName).toBe('B');  // 2nd string
      expect(getNoteAtPosition(5, 0).noteName).toBe('E');  // 1st string
    });

    it('should return correct notes at 5th fret', () => {
      expect(getNoteAtPosition(0, 5).noteName).toBe('A');  // 6th string, 5th fret
      expect(getNoteAtPosition(1, 5).noteName).toBe('D');  // 5th string, 5th fret
      expect(getNoteAtPosition(2, 5).noteName).toBe('G');  // 4th string, 5th fret
    });

    it('should return correct notes at 12th fret (octave)', () => {
      const openE = getNoteAtPosition(0, 0);
      const octaveE = getNoteAtPosition(0, 12);

      expect(openE.noteName).toBe(octaveE.noteName);
      expect(openE.pitchClass).toBe(octaveE.pitchClass);
    });

    it('should return pitch classes in range 0-11', () => {
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret < 18; fret++) {
          const { pitchClass } = getNoteAtPosition(string, fret);
          expect(pitchClass).toBeGreaterThanOrEqual(0);
          expect(pitchClass).toBeLessThanOrEqual(11);
        }
      }
    });

    it('should handle chromatic scale correctly', () => {
      // Starting from open A string (5th string, fret 0), go up chromatically
      const notes = [];
      for (let fret = 0; fret < 12; fret++) {
        notes.push(getNoteAtPosition(1, fret).noteName);
      }

      const expected = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
      expect(notes).toEqual(expected);
    });
  });

  describe('Physics formula validation', () => {
    it('should use correct 12th root of 2 formula', () => {
      const scaleLength = 648;
      const fret1 = getFretPosition(1, scaleLength);

      // Manual calculation using formula: scale_length * (1 - 2^(-1/12))
      const expected = scaleLength * (1 - Math.pow(2, -1 / 12));

      expect(fret1).toBeCloseTo(expected, 5);
    });

    it('should maintain proper ratios between frets', () => {
      // Each fret should divide remaining string by 17.817 (12th root of 2 ratio)
      const spacing1 = getFretSpacing(0);
      const spacing2 = getFretSpacing(1);

      const ratio = spacing1 / spacing2;
      const expectedRatio = Math.pow(2, 1/12); // ≈ 1.0595

      expect(ratio).toBeCloseTo(expectedRatio, 2);
    });
  });

  describe('getOctaveAtPosition', () => {
    it('should return correct octaves for open strings', () => {
      // Standard tuning: E2, A2, D3, G3, B3, E4
      expect(getOctaveAtPosition(0, 0)).toBe(2); // 6th string (E2)
      expect(getOctaveAtPosition(1, 0)).toBe(2); // 5th string (A2)
      expect(getOctaveAtPosition(2, 0)).toBe(3); // 4th string (D3)
      expect(getOctaveAtPosition(3, 0)).toBe(3); // 3rd string (G3)
      expect(getOctaveAtPosition(4, 0)).toBe(3); // 2nd string (B3)
      expect(getOctaveAtPosition(5, 0)).toBe(4); // 1st string (E4)
    });

    it('should return correct octave at 12th fret (one octave up)', () => {
      // Each string at 12th fret should be one octave higher
      expect(getOctaveAtPosition(0, 12)).toBe(3); // 6th string E3
      expect(getOctaveAtPosition(1, 12)).toBe(3); // 5th string A3
      expect(getOctaveAtPosition(2, 12)).toBe(4); // 4th string D4
      expect(getOctaveAtPosition(3, 12)).toBe(4); // 3rd string G4
      expect(getOctaveAtPosition(4, 12)).toBe(4); // 2nd string B4
      expect(getOctaveAtPosition(5, 12)).toBe(5); // 1st string E5
    });

    it('should increase octave correctly across frets', () => {
      // Starting from 6th string (E2, MIDI 40)
      expect(getOctaveAtPosition(0, 0)).toBe(2);  // E2 (MIDI 40)
      expect(getOctaveAtPosition(0, 7)).toBe(2);  // B2 (MIDI 47) - still in octave 2
      expect(getOctaveAtPosition(0, 8)).toBe(3);  // C3 (MIDI 48) - octave 3 starts at C
      expect(getOctaveAtPosition(0, 12)).toBe(3); // E3 (MIDI 52) - octave 3
      expect(getOctaveAtPosition(0, 18)).toBe(3); // A#3 (MIDI 58) - still in octave 3
    });

    it('should return same octave for all notes in same octave range', () => {
      // All notes from MIDI 60-71 should be in octave 4
      // 4th string, frets 10-21 (D3 fret 0 is MIDI 50, so fret 10 = MIDI 60)
      const octave10 = getOctaveAtPosition(2, 10); // D4 (MIDI 60)
      const octave11 = getOctaveAtPosition(2, 11); // D#4 (MIDI 61)
      const octave21 = getOctaveAtPosition(2, 21); // C#5 (MIDI 71)

      expect(octave10).toBe(4);
      expect(octave11).toBe(4);
      expect(octave21).toBe(4);
    });

    it('should match octaves between same notes on different strings', () => {
      // E4 appears on:
      // - 5th string, fret 7 (A2 + 7 = E3... wait, that's E3)
      // - 1st string, open (E4)
      // Let's find matching E4 notes
      const e4_string1 = getOctaveAtPosition(5, 0); // 1st string open = E4
      const e4_string2 = getOctaveAtPosition(4, 5); // 2nd string fret 5 = E4

      expect(e4_string1).toBe(4);
      expect(e4_string2).toBe(4);
    });

    it('should handle guitar range correctly (octaves 2-5)', () => {
      // Test full guitar range
      // Lowest note: 6th string open (E2)
      expect(getOctaveAtPosition(0, 0)).toBe(2);

      // Highest practical note: 1st string, fret 18 (A#5/Bb5)
      // E4 (MIDI 64) + 18 frets = MIDI 82 = A#5
      const highestOctave = getOctaveAtPosition(5, 18);
      expect(highestOctave).toBe(5);

      // All octaves in between should exist
      const octavesFound = new Set<number>();
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret <= 18; fret++) {
          octavesFound.add(getOctaveAtPosition(string, fret));
        }
      }

      expect(octavesFound.has(2)).toBe(true);
      expect(octavesFound.has(3)).toBe(true);
      expect(octavesFound.has(4)).toBe(true);
      expect(octavesFound.has(5)).toBe(true);
    });
  });
});
