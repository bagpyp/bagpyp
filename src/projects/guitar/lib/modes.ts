/**
 * Mode pattern generation for guitar fretboard
 *
 * Generates accurate 3-notes-per-string patterns for all 7 modes,
 * with proper handling of the B string "warp" (major 3rd vs perfect 4th tuning).
 */

// Standard tuning open string pitch classes (0=C, 1=C#, ..., 11=B)
// Index 0 = 6th string (low E), Index 5 = 1st string (high E)
const STANDARD_TUNING = [4, 9, 2, 7, 11, 4]; // E A D G B E

// Note names for display
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mode intervals (semitones from root for each of the 7 scale degrees)
const MODE_INTERVALS: Record<string, number[]> = {
  ionian:     [0, 2, 4, 5, 7, 9, 11],  // W W H W W W H (Major)
  dorian:     [0, 2, 3, 5, 7, 9, 10],  // W H W W W H W
  phrygian:   [0, 1, 3, 5, 7, 8, 10],  // H W W W H W W
  lydian:     [0, 2, 4, 6, 7, 9, 11],  // W W W H W W H
  mixolydian: [0, 2, 4, 5, 7, 9, 10],  // W W H W W H W
  aeolian:    [0, 2, 3, 5, 7, 8, 10],  // W H W W H W W (Natural Minor)
  locrian:    [0, 1, 3, 5, 6, 8, 10],  // H W W H W W W
};

// Mode names in order (relative to parent major key)
const MODE_ORDER = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];

// Scale degree offsets for each mode (which degree of parent major starts the mode)
// Ionian starts on 1, Dorian on 2, Phrygian on 3, etc.
const MODE_DEGREE_OFFSET = [0, 1, 2, 3, 4, 5, 6];

export interface ModePattern {
  mode: string;           // e.g., "G Ionian", "A Dorian"
  modeName: string;       // e.g., "Ionian", "Dorian"
  rootNote: string;       // e.g., "G", "A"
  rootPitchClass: number; // 0-11
  pattern: number[][];    // 6 arrays of fret numbers (2-3 per string)
  rootPositions: [number, number][]; // [stringIndex, fret] pairs for root notes
}

/**
 * Get the pitch class for a note name
 */
export function getPitchClass(noteName: string): number {
  const normalized = noteName.replace('♯', '#').replace('♭', 'b');
  const index = NOTE_NAMES.indexOf(normalized);
  if (index !== -1) return index;

  // Handle flats by converting to sharps
  const flatMap: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
    'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
  };
  const sharp = flatMap[normalized];
  if (sharp) return NOTE_NAMES.indexOf(sharp);

  return 0; // Default to C
}

/**
 * Get note name from pitch class
 */
export function getNoteName(pitchClass: number): string {
  return NOTE_NAMES[(pitchClass + 12) % 12];
}

/**
 * Get all pitch classes in a scale given root and mode
 */
export function getScalePitchClasses(rootPitchClass: number, mode: string): number[] {
  const intervals = MODE_INTERVALS[mode.toLowerCase()];
  if (!intervals) return [];
  return intervals.map(interval => (rootPitchClass + interval) % 12);
}

/**
 * Find the fret for a given pitch class on a given string
 * Returns all frets (0-18) where this pitch class appears
 */
function findFretsForPitchClass(stringIndex: number, pitchClass: number, minFret: number = 0, maxFret: number = 18): number[] {
  const openStringPc = STANDARD_TUNING[stringIndex];
  const frets: number[] = [];

  for (let fret = minFret; fret <= maxFret; fret++) {
    if ((openStringPc + fret) % 12 === pitchClass) {
      frets.push(fret);
    }
  }

  return frets;
}

/**
 * Generate a 3NPS pattern for a mode starting at a specific position
 *
 * The algorithm:
 * 1. Start with the mode's root note on string 6 at the target position
 * 2. For each string, find 3 consecutive scale tones that fit within the position
 * 3. The B string (index 4) may have only 2 notes to maintain playability
 *
 * @param rootPitchClass - The root note's pitch class (0=C, 7=G, etc.)
 * @param mode - The mode name (ionian, dorian, etc.)
 * @param startingFret - Approximate starting position on the neck
 */
export function generate3NPSPattern(
  rootPitchClass: number,
  mode: string,
  startingFret: number = 2
): { pattern: number[][]; rootPositions: [number, number][] } {
  const scalePcs = getScalePitchClasses(rootPitchClass, mode);
  if (scalePcs.length === 0) {
    return { pattern: [[], [], [], [], [], []], rootPositions: [] };
  }

  const pattern: number[][] = [];
  const rootPositions: [number, number][] = [];

  // For 3NPS, we play 3 notes per string, cycling through the scale
  // String 6 gets degrees 1,2,3 | String 5 gets 4,5,6 | String 4 gets 7,1,2 | etc.
  // This creates the characteristic 3NPS fingering

  let scaleIndex = 0; // Which scale degree we're on (0-6, cycles)

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const stringNotes: number[] = [];
    const openStringPc = STANDARD_TUNING[stringIdx];

    // Determine how many notes on this string
    // For a true 3NPS pattern with B string adjustment:
    // The B string (index 4) often needs adjustment due to the tuning offset
    const notesOnString = 3;

    // Find frets for the next 3 scale degrees
    for (let i = 0; i < notesOnString; i++) {
      const targetPc = scalePcs[scaleIndex % 7];

      // Find the fret closest to our current position
      const possibleFrets = findFretsForPitchClass(stringIdx, targetPc, 0, 18);

      // Calculate target fret range based on previous string
      let targetMin = startingFret;
      let targetMax = startingFret + 6;

      if (stringIdx > 0 && pattern[stringIdx - 1].length > 0) {
        // Base position on previous string, accounting for string transition
        const prevStringAvg = pattern[stringIdx - 1].reduce((a, b) => a + b, 0) / pattern[stringIdx - 1].length;

        // B string (index 4) needs +1 fret adjustment due to major 3rd tuning
        const bStringAdjust = stringIdx === 4 ? 1 : 0;

        targetMin = Math.max(0, Math.floor(prevStringAvg) - 1 + bStringAdjust);
        targetMax = targetMin + 5;
      }

      // Find best fret in range
      let bestFret = possibleFrets[0] || 0;
      let bestDist = Infinity;

      for (const fret of possibleFrets) {
        if (fret >= targetMin && fret <= targetMax) {
          const dist = Math.abs(fret - (targetMin + 2));
          if (dist < bestDist) {
            bestDist = dist;
            bestFret = fret;
          }
        }
      }

      // If no fret in range, find closest one
      if (bestDist === Infinity) {
        for (const fret of possibleFrets) {
          const dist = Math.min(Math.abs(fret - targetMin), Math.abs(fret - targetMax));
          if (dist < bestDist) {
            bestDist = dist;
            bestFret = fret;
          }
        }
      }

      stringNotes.push(bestFret);

      // Track root positions
      if (targetPc === rootPitchClass) {
        rootPositions.push([stringIdx, bestFret]);
      }

      scaleIndex++;
    }

    // Sort notes on this string by fret number
    stringNotes.sort((a, b) => a - b);
    pattern.push(stringNotes);
  }

  return { pattern, rootPositions };
}

/**
 * Generate all 7 mode patterns for a given key
 *
 * @param keyRoot - The root note name of the major key (e.g., "G" for G major)
 * @returns Array of 7 ModePattern objects
 */
export function generateAllModePatterns(keyRoot: string = 'G'): ModePattern[] {
  const keyRootPc = getPitchClass(keyRoot);
  const majorScalePcs = getScalePitchClasses(keyRootPc, 'ionian');

  const patterns: ModePattern[] = [];

  // Generate each mode
  for (let modeIdx = 0; modeIdx < 7; modeIdx++) {
    const modeName = MODE_ORDER[modeIdx];
    const modeRootPc = majorScalePcs[modeIdx];
    const modeRootName = getNoteName(modeRootPc);

    // Calculate starting fret based on mode root on low E string
    // Find the lowest occurrence of the root note
    const rootFretsOnLowE = findFretsForPitchClass(0, modeRootPc, 0, 12);
    const startingFret = rootFretsOnLowE[0] || 0;

    const { pattern, rootPositions } = generate3NPSPattern(modeRootPc, modeName, startingFret);

    // Format mode name with proper capitalization
    const formattedModeName = modeName.charAt(0).toUpperCase() + modeName.slice(1);

    patterns.push({
      mode: `${modeRootName} ${formattedModeName}`,
      modeName: formattedModeName,
      rootNote: modeRootName,
      rootPitchClass: modeRootPc,
      pattern,
      rootPositions,
    });
  }

  return patterns;
}

/**
 * Get available key options for the UI
 */
export function getKeyOptions(): { value: string; label: string }[] {
  return NOTE_NAMES.map(note => ({
    value: note,
    label: note.replace('#', '♯'),
  }));
}
