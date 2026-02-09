/**
 * Chord Types - Definitions and formulas for different chord types
 */

import type { NoteName } from './types';
import { nameToPc, pcToDisplayName } from './core';
import {
  CHORD_FORMULA_CATALOG,
  type ChordFormulaId,
} from './theory-catalog';

/**
 * Chord type definitions with their interval formulas
 */
export type ChordType = ChordFormulaId;

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
export const CHORD_FORMULAS: Record<ChordType, ChordFormula> = Object.fromEntries(
  Object.entries(CHORD_FORMULA_CATALOG).map(([type, formula]) => ([
    type,
    {
      type: type as ChordType,
      name: formula.name,
      symbol: formula.symbol,
      intervals: [...formula.intervals],
      description: formula.description,
    },
  ]))
) as Record<ChordType, ChordFormula>;

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
  return pitchClasses.map(pc => pcToDisplayName(pc, rootName));
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
 * Adjust a specific note in a voicing by a number of semitones
 * @param frets The current fret positions
 * @param strings The string indices
 * @param sourceNote The pitch class to find and adjust
 * @param targetNote The pitch class it should become
 * @param semitones The number of semitones to shift (-1 = flat, +1 = sharp)
 * @param fretboard The fretboard mapping
 * @returns Adjusted frets or null if not possible (e.g., would go below fret 0 or above fret 18)
 */
export function adjustNoteIfPossible(
  frets: number[],
  strings: number[],
  sourceNote: number,
  targetNote: number,
  semitones: number,
  fretboard: Record<number, Record<number, number>>
): number[] | null {
  const newFrets = [...frets];

  for (let i = 0; i < frets.length; i++) {
    const stringIdx = strings[i];
    const currentNote = fretboard[stringIdx][frets[i]];

    if (currentNote === sourceNote) {
      const newFret = frets[i] + semitones;

      // Check bounds
      if (newFret < 0 || newFret > 18) {
        return null;
      }

      // Verify the new note is correct
      if (fretboard[stringIdx][newFret] === targetNote) {
        newFrets[i] = newFret;
      } else {
        return null;
      }
    }
  }

  return newFrets;
}

/**
 * For minor chords, check if we can "flat the third" on open strings
 * Returns adjusted fret positions if possible, or null if not possible
 */
export function flatThirdIfPossible(
  frets: number[],
  strings: number[],
  majorThird: number,
  minorThird: number,
  fretboard: Record<number, Record<number, number>>
): number[] | null {
  return adjustNoteIfPossible(frets, strings, majorThird, minorThird, -1, fretboard);
}

/**
 * Transform major triad voicings to another chord type
 * This is the main function for converting major triads to other chord types
 *
 * Transformations from major [0, 4, 7]:
 * - minor [0, 3, 7]: flat the 3rd (-1 semitone)
 * - dim [0, 3, 6]: flat the 3rd AND flat the 5th
 * - aug [0, 4, 8]: sharp the 5th (+1 semitone)
 *
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

  // Minor: flat the 3rd
  if (targetChordType === 'minor') {
    const majorThird = majorChord[1]; // 4 semitones from root
    const minorThird = targetChord[1]; // 3 semitones from root
    return adjustNoteIfPossible(majorFrets, strings, majorThird, minorThird, -1, fretboard);
  }

  // Diminished: flat the 3rd AND flat the 5th
  if (targetChordType === 'dim') {
    const majorThird = majorChord[1];
    const minorThird = targetChord[1];
    const perfectFifth = majorChord[2]; // 7 semitones from root
    const dimFifth = targetChord[2]; // 6 semitones from root

    // First, flat the third
    const afterFlatThird = adjustNoteIfPossible(majorFrets, strings, majorThird, minorThird, -1, fretboard);
    if (!afterFlatThird) return null;

    // Then, flat the fifth
    return adjustNoteIfPossible(afterFlatThird, strings, perfectFifth, dimFifth, -1, fretboard);
  }

  // Augmented: sharp the 5th
  if (targetChordType === 'aug') {
    const perfectFifth = majorChord[2]; // 7 semitones from root
    const augFifth = targetChord[2]; // 8 semitones from root
    return adjustNoteIfPossible(majorFrets, strings, perfectFifth, augFifth, +1, fretboard);
  }

  // Other chord types not yet supported
  return null;
}
