/**
 * Chord Types - Definitions and formulas for different chord types
 */

import type { NoteName } from './types';
import { nameToPc, pcToSharpName } from './core';

/**
 * Chord type definitions with their interval formulas
 */
export type ChordType = 'major' | 'minor' | 'dim' | 'aug' | 'maj7' | 'min7' | '7' | 'dim7';

/**
 * Intervals in semitones from the root
 */
export interface ChordFormula {
  type: ChordType;
  name: string;
  symbol: string; // e.g., '', 'm', 'dim', 'maj7'
  intervals: number[]; // Semitones from root
  description: string;
}

/**
 * All supported chord formulas
 */
export const CHORD_FORMULAS: Record<ChordType, ChordFormula> = {
  major: {
    type: 'major',
    name: 'Major',
    symbol: '',
    intervals: [0, 4, 7], // Root, Major 3rd, Perfect 5th
    description: '1-3-5',
  },
  minor: {
    type: 'minor',
    name: 'Minor',
    symbol: 'm',
    intervals: [0, 3, 7], // Root, Minor 3rd (flatted), Perfect 5th
    description: '1-♭3-5',
  },
  dim: {
    type: 'dim',
    name: 'Diminished',
    symbol: 'dim',
    intervals: [0, 3, 6], // Root, Minor 3rd, Diminished 5th
    description: '1-♭3-♭5',
  },
  aug: {
    type: 'aug',
    name: 'Augmented',
    symbol: 'aug',
    intervals: [0, 4, 8], // Root, Major 3rd, Augmented 5th
    description: '1-3-#5',
  },
  maj7: {
    type: 'maj7',
    name: 'Major 7th',
    symbol: 'maj7',
    intervals: [0, 4, 7, 11], // Root, Major 3rd, Perfect 5th, Major 7th
    description: '1-3-5-7',
  },
  min7: {
    type: 'min7',
    name: 'Minor 7th',
    symbol: 'm7',
    intervals: [0, 3, 7, 10], // Root, Minor 3rd, Perfect 5th, Minor 7th
    description: '1-♭3-5-♭7',
  },
  '7': {
    type: '7',
    name: 'Dominant 7th',
    symbol: '7',
    intervals: [0, 4, 7, 10], // Root, Major 3rd, Perfect 5th, Minor 7th
    description: '1-3-5-♭7',
  },
  dim7: {
    type: 'dim7',
    name: 'Diminished 7th',
    symbol: 'dim7',
    intervals: [0, 3, 6, 9], // Root, Minor 3rd, Diminished 5th, Diminished 7th
    description: '1-♭3-♭5-♭♭7',
  },
};

/**
 * Build chord pitch classes from root and chord type
 * @param rootName The root note (e.g., "C", "D#")
 * @param chordType The type of chord
 * @returns Array of pitch classes for the chord
 */
export function buildChord(rootName: NoteName, chordType: ChordType): number[] {
  const rootPc = nameToPc(rootName);
  const formula = CHORD_FORMULAS[chordType];

  return formula.intervals.map(interval => (rootPc + interval) % 12);
}

/**
 * Get chord notes as note names
 * @param rootName The root note
 * @param chordType The chord type
 * @returns Array of note names in the chord
 */
export function getChordNotes(rootName: NoteName, chordType: ChordType): string[] {
  const pitchClasses = buildChord(rootName, chordType);
  return pitchClasses.map(pc => pcToSharpName(pc));
}

/**
 * Get the full chord name (e.g., "C major", "Am", "G7")
 * @param rootName The root note
 * @param chordType The chord type
 * @returns The full chord name
 */
export function getChordName(rootName: NoteName, chordType: ChordType): string {
  const formula = CHORD_FORMULAS[chordType];
  return `${rootName}${formula.symbol}`;
}

/**
 * Check if a set of pitch classes forms a valid chord
 * @param pitchClasses The pitch classes to check
 * @param chordPitchClasses The expected chord pitch classes
 * @returns True if all chord tones are present and no extras
 */
export function isValidChordVoicing(
  pitchClasses: number[],
  chordPitchClasses: number[]
): boolean {
  const voicingSet = new Set(pitchClasses);
  const chordSet = new Set(chordPitchClasses);

  // All notes must be in the chord
  const allNotesInChord = [...voicingSet].every(pc => chordSet.has(pc));
  // All chord notes must be present
  const allChordNotesPresent = [...chordSet].every(pc => voicingSet.has(pc));

  return allNotesInChord && allChordNotesPresent;
}

/**
 * For minor chords, check if we can "flat the third" on open strings
 * Returns adjusted fret positions if possible, or null if not possible
 * @param frets The original major chord frets
 * @param strings The string indices
 * @param majorThird The major third pitch class
 * @param minorThird The minor third pitch class
 * @param fretboard The fretboard mapping
 * @returns Adjusted frets for minor chord or null if not possible
 */
export function flatThirdIfPossible(
  frets: number[],
  strings: number[],
  majorThird: number,
  minorThird: number,
  fretboard: Record<number, Record<number, number>>
): number[] | null {
  const newFrets = [...frets];

  for (let i = 0; i < frets.length; i++) {
    const stringIdx = strings[i];
    const currentNote = fretboard[stringIdx][frets[i]];

    // If this note is the major third, try to flat it
    if (currentNote === majorThird) {
      // To flat the third, we need to go down one semitone (one fret)
      const newFret = frets[i] - 1;

      // Can't go below fret 0
      if (newFret < 0) {
        return null; // Cannot flat this third
      }

      // Verify the new note is the minor third
      if (fretboard[stringIdx][newFret] === minorThird) {
        newFrets[i] = newFret;
      } else {
        // Something's wrong with our calculation
        return null;
      }
    }
  }

  return newFrets;
}

/**
 * Transform major triad voicings to another chord type
 * This is the main function for converting major triads to other chord types
 * @param majorFrets The fret positions for a major chord
 * @param strings The string indices being used
 * @param rootName The root note of the chord
 * @param targetChordType The chord type to transform to
 * @param fretboard The fretboard mapping
 * @returns New fret positions or null if transformation not possible
 */
export function transformChordType(
  majorFrets: number[],
  strings: number[],
  rootName: NoteName,
  targetChordType: ChordType,
  fretboard: Record<number, Record<number, number>>
): number[] | null {
  if (targetChordType === 'major') {
    return majorFrets; // No transformation needed
  }

  const majorChord = buildChord(rootName, 'major');
  const targetChord = buildChord(rootName, targetChordType);

  // For triads (3-note chords), we can try simple transformations
  if (targetChordType === 'minor') {
    // Special case: minor is just flatting the third
    const majorThird = majorChord[1];
    const minorThird = targetChord[1];
    return flatThirdIfPossible(majorFrets, strings, majorThird, minorThird, fretboard);
  }

  // For other chord types, we need more complex logic
  // This could involve finding the closest valid voicing
  // For now, return null for unsupported transformations
  // TODO: Implement more chord type transformations

  return null;
}