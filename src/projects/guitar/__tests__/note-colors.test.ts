
import {
  getNoteColor,
  getAllNoteColorsInCircleOfFifths,
  getKeyNoteColors,
  getPitchClassColor,
  getNoteColorWithOctave,
} from '../lib/note-colors';

describe('Note Color System', () => {
  describe('getNoteColor', () => {
    it('should return colors for all natural notes', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

      notes.forEach(note => {
        const color = getNoteColor(note);
        expect(color).toBeDefined();
        expect(color.bg).toBeTruthy();
        expect(color.text).toBeTruthy();
        expect(color.name).toBeTruthy();
      });
    });

    it('should return colors for all sharp notes', () => {
      const sharps = ['C#', 'D#', 'F#', 'G#', 'A#'];

      sharps.forEach(note => {
        const color = getNoteColor(note);
        expect(color).toBeDefined();
        expect(color.bg).toBeTruthy();
        expect(color.text).toBeTruthy();
      });
    });

    it('should handle flat notes (enharmonic equivalents)', () => {
      const colorCSharp = getNoteColor('C#');
      const colorDb = getNoteColor('Db');

      expect(colorCSharp.bg).toBe(colorDb.bg);
      expect(colorCSharp.text).toBe(colorDb.text);
    });

    it('should strip octave numbers from note names', () => {
      const colorC = getNoteColor('C');
      const colorC4 = getNoteColor('C4');
      const colorC5 = getNoteColor('C5');

      expect(colorC.bg).toBe(colorC4.bg);
      expect(colorC.bg).toBe(colorC5.bg);
    });

    it('should use valid hex color codes', () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/;

      const color = getNoteColor('C');
      expect(color.bg).toMatch(hexRegex);
      expect(color.text).toMatch(hexRegex);
    });

    it('should have high contrast text colors', () => {
      // Text should be either white or black for readability
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

      notes.forEach(note => {
        const color = getNoteColor(note);
        const isBlackOrWhite =
          color.text === '#ffffff' ||
          color.text === '#000000' ||
          color.text.toLowerCase() === '#fff' ||
          color.text.toLowerCase() === '#000';

        expect(isBlackOrWhite).toBe(true);
      });
    });
  });

  describe('getAllNoteColorsInCircleOfFifths', () => {
    it('should return all 12 chromatic notes', () => {
      const colors = getAllNoteColorsInCircleOfFifths();
      expect(colors).toHaveLength(12);
    });

    it('should be in circle of fifths order', () => {
      const colors = getAllNoteColorsInCircleOfFifths();
      const names = colors.map(c => c.name);

      // Circle of fifths order: C, G, D, A, E, B, F#/Gb, C#/Db, G#/Ab, D#/Eb, A#/Bb, F
      expect(names[0]).toContain('C');
      expect(names[1]).toContain('G');
      expect(names[2]).toContain('D');
      expect(names[3]).toContain('A');
      expect(names[4]).toContain('E');
      expect(names[5]).toContain('B');
      expect(names[11]).toContain('F');
    });

    it('should have unique pitch classes', () => {
      const colors = getAllNoteColorsInCircleOfFifths();
      const pitchClasses = colors.map(c => c.pitchClass);

      const uniquePitchClasses = new Set(pitchClasses);
      expect(uniquePitchClasses.size).toBe(12);
    });

    it('should have enharmonic names for some notes', () => {
      const colors = getAllNoteColorsInCircleOfFifths();

      // Check that some notes have both sharp and flat names
      const hasEnharmonic = colors.some(c => c.name.includes('/'));
      expect(hasEnharmonic).toBe(true);
    });

    it('should have valid color data for all notes', () => {
      const colors = getAllNoteColorsInCircleOfFifths();

      colors.forEach(color => {
        expect(color.pitchClass).toBeGreaterThanOrEqual(0);
        expect(color.pitchClass).toBeLessThanOrEqual(11);
        expect(color.bg).toBeTruthy();
        expect(color.text).toBeTruthy();
        expect(color.name).toBeTruthy();
      });
    });
  });

  describe('getKeyNoteColors', () => {
    it('should return 7 colors for C major', () => {
      const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const colors = getKeyNoteColors(cMajorNotes);

      expect(colors.length).toBe(7);
    });

    it('should return 7 colors for G major', () => {
      const gMajorNotes = ['G', 'A', 'B', 'C', 'D', 'E', 'F#'];
      const colors = getKeyNoteColors(gMajorNotes);

      expect(colors.length).toBe(7);
    });

    it('should maintain circle of fifths order', () => {
      const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const colors = getKeyNoteColors(cMajorNotes);

      // First note should be C (starting point of circle)
      expect(colors[0].noteName).toBe('C');
    });

    it('should include all notes from the key', () => {
      const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const colors = getKeyNoteColors(cMajorNotes);
      const noteNames = colors.map(c => c.noteName);

      cMajorNotes.forEach(note => {
        expect(noteNames).toContain(note);
      });
    });
  });

  describe('getPitchClassColor', () => {
    it('should return colors for all pitch classes 0-11', () => {
      for (let pc = 0; pc < 12; pc++) {
        const color = getPitchClassColor(pc);
        expect(color).toBeDefined();
        expect(color.bg).toBeTruthy();
        expect(color.text).toBeTruthy();
        expect(color.name).toBeTruthy();
      }
    });

    it('should handle modulo 12 for values > 11', () => {
      const color0 = getPitchClassColor(0);
      const color12 = getPitchClassColor(12);
      const color24 = getPitchClassColor(24);

      expect(color0.bg).toBe(color12.bg);
      expect(color0.bg).toBe(color24.bg);
    });

    it('should match getNoteColor for same pitch class', () => {
      const colorFromPc = getPitchClassColor(0); // C
      const colorFromName = getNoteColor('C');

      expect(colorFromPc.bg).toBe(colorFromName.bg);
      expect(colorFromPc.text).toBe(colorFromName.text);
    });
  });

  describe('Circle of Fifths Color Wheel', () => {
    it('should have C as red (starting point)', () => {
      const colorC = getNoteColor('C');
      // Red color should start with #e
      expect(colorC.bg.toLowerCase()).toMatch(/^#e[0-9a-f]/);
    });

    it('should have visually distinct colors for adjacent fifths', () => {
      const colors = getAllNoteColorsInCircleOfFifths();

      // Check that adjacent colors are different
      for (let i = 0; i < colors.length - 1; i++) {
        expect(colors[i].bg).not.toBe(colors[i + 1].bg);
      }
    });

    it('should progress through color spectrum', () => {
      const colors = getAllNoteColorsInCircleOfFifths();
      const bgColors = colors.map(c => c.bg);

      // Should have variety of colors (not all similar hues)
      const uniqueFirstDigits = new Set(
        bgColors.map(c => c[1]) // Get first hex digit after #
      );

      // Should have at least 6 different starting digits
      expect(uniqueFirstDigits.size).toBeGreaterThanOrEqual(6);
    });

    it('should maintain consistent mapping', () => {
      // Same note should always get same color
      const color1 = getNoteColor('A');
      const color2 = getNoteColor('A');
      const color3 = getNoteColor('A');

      expect(color1.bg).toBe(color2.bg);
      expect(color2.bg).toBe(color3.bg);
    });
  });

  describe('Enharmonic Equivalents', () => {
    const enharmonicPairs = [
      ['C#', 'Db'],
      ['D#', 'Eb'],
      ['F#', 'Gb'],
      ['G#', 'Ab'],
      ['A#', 'Bb'],
    ];

    enharmonicPairs.forEach(([sharp, flat]) => {
      it(`should treat ${sharp} and ${flat} as same color`, () => {
        const colorSharp = getNoteColor(sharp);
        const colorFlat = getNoteColor(flat);

        expect(colorSharp.bg).toBe(colorFlat.bg);
        expect(colorSharp.text).toBe(colorFlat.text);
      });
    });
  });

  describe('Color Accessibility', () => {
    it('should provide name for each color', () => {
      const colors = getAllNoteColorsInCircleOfFifths();

      colors.forEach(color => {
        expect(color.name).toBeTruthy();
        expect(typeof color.name).toBe('string');
        expect(color.name.length).toBeGreaterThan(0);
      });
    });

    it('should have valid CSS color values', () => {
      const colors = getAllNoteColorsInCircleOfFifths();

      colors.forEach(color => {
        // Should be valid hex colors
        expect(color.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(color.text).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('getNoteColorWithOctave', () => {
    it('should return valid color for all pitch classes and octaves', () => {
      for (let pc = 0; pc < 12; pc++) {
        for (let octave = 2; octave <= 5; octave++) {
          const color = getNoteColorWithOctave(pc, octave);
          expect(color).toBeDefined();
          expect(color.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(color.text).toMatch(/^#[0-9a-fA-F]{6}$/);
          expect(color.name).toBeTruthy();
        }
      }
    });

    it('should preserve pitch class identity (hue) across octaves', () => {
      // C in different octaves should all be reddish
      const c2 = getNoteColorWithOctave(0, 2);
      const c3 = getNoteColorWithOctave(0, 3);
      const c4 = getNoteColorWithOctave(0, 4);
      const c5 = getNoteColorWithOctave(0, 5);

      // All should have same name (C)
      expect(c2.name).toBe('C');
      expect(c3.name).toBe('C');
      expect(c4.name).toBe('C');
      expect(c5.name).toBe('C');

      // Colors should be different but similar (same hue family)
      expect(c2.bg).not.toBe(c3.bg);
      expect(c3.bg).not.toBe(c4.bg);
      expect(c4.bg).not.toBe(c5.bg);
    });

    it('should make lower octaves darker than higher octaves', () => {
      // Helper to convert hex to brightness (very simple approximation)
      const getBrightness = (hex: string): number => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r + g + b) / 3;
      };

      // Test for C (pitch class 0)
      const c2 = getNoteColorWithOctave(0, 2);
      const c3 = getNoteColorWithOctave(0, 3);
      const c4 = getNoteColorWithOctave(0, 4);
      const c5 = getNoteColorWithOctave(0, 5);

      const brightness2 = getBrightness(c2.bg);
      const brightness3 = getBrightness(c3.bg);
      const brightness4 = getBrightness(c4.bg);
      const brightness5 = getBrightness(c5.bg);

      // Higher octaves should generally be brighter
      expect(brightness3).toBeGreaterThan(brightness2);
      expect(brightness5).toBeGreaterThan(brightness4);
    });

    it('should return base color when includeOctaves is false', () => {
      const baseColor = getPitchClassColor(0); // C base color
      const colorWithoutOctave = getNoteColorWithOctave(0, 3, { includeOctaves: false });

      expect(colorWithoutOctave.bg).toBe(baseColor.bg);
      expect(colorWithoutOctave.text).toBe(baseColor.text);
      expect(colorWithoutOctave.name).toBe(baseColor.name);
    });

    it('should keep text color consistent across octaves', () => {
      // Text color should not change with octave (for readability)
      const c2 = getNoteColorWithOctave(0, 2);
      const c3 = getNoteColorWithOctave(0, 3);
      const c4 = getNoteColorWithOctave(0, 4);
      const c5 = getNoteColorWithOctave(0, 5);

      expect(c2.text).toBe(c3.text);
      expect(c3.text).toBe(c4.text);
      expect(c4.text).toBe(c5.text);
    });

    it('should produce visibly different colors for guitar range (octaves 2-5)', () => {
      // For each pitch class, all 4 octaves should have distinct colors
      for (let pc = 0; pc < 12; pc++) {
        const colors = [2, 3, 4, 5].map(octave => getNoteColorWithOctave(pc, octave).bg);
        const uniqueColors = new Set(colors);

        // All 4 octaves should produce different colors
        expect(uniqueColors.size).toBe(4);
      }
    });

    it('should handle extreme octaves gracefully', () => {
      // Test octaves outside typical guitar range
      const c1 = getNoteColorWithOctave(0, 1); // Very low
      const c6 = getNoteColorWithOctave(0, 6); // Very high

      expect(c1).toBeDefined();
      expect(c6).toBeDefined();
      expect(c1.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c6.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should maintain color distinction between different pitch classes in same octave', () => {
      // All 12 pitch classes in octave 4 should be different
      const octave4Colors = [];
      for (let pc = 0; pc < 12; pc++) {
        octave4Colors.push(getNoteColorWithOctave(pc, 4).bg);
      }

      const uniqueColors = new Set(octave4Colors);
      expect(uniqueColors.size).toBe(12);
    });
  });
});
