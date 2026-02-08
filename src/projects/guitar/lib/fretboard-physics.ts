/**
 * Physics-based fretboard calculations for realistic guitar neck rendering
 *
 * Based on the physics of vibrating strings:
 * - Each fret divides the string length by 2^(1/12) to raise pitch by one semitone
 * - Fret position from nut: scale_length × (1 - 2^(-n/12))
 * - This creates exponentially decreasing fret spacing
 */

/**
 * Standard guitar scale length in mm (Fender-style 25.5")
 */
const SCALE_LENGTH_MM = 648;

/**
 * Calculate the cumulative distance from nut to a given fret number
 * Uses the physics formula: distance = scale_length × (1 - 2^(-fret/12))
 *
 * @param fretNumber - The fret number (0 = nut, 1 = first fret, etc.)
 * @param scaleLength - The total scale length in mm (default 648mm)
 * @returns Distance from nut to the fret in mm
 */
export function getFretPosition(fretNumber: number, scaleLength: number = SCALE_LENGTH_MM): number {
  if (fretNumber === 0) return 0;
  return scaleLength * (1 - Math.pow(2, -fretNumber / 12));
}

/**
 * Calculate the spacing (height) between two consecutive frets
 *
 * @param fretNumber - The fret number (spacing is between this fret and the next)
 * @param scaleLength - The total scale length in mm (default 648mm)
 * @returns Height of the fret space in mm
 */
export function getFretSpacing(fretNumber: number, scaleLength: number = SCALE_LENGTH_MM): number {
  const currentPos = getFretPosition(fretNumber, scaleLength);
  const nextPos = getFretPosition(fretNumber + 1, scaleLength);
  return nextPos - currentPos;
}

/**
 * Standard guitar string gauges in inches (light gauge set)
 * Index 0 = 6th string (low E), Index 5 = 1st string (high E)
 */
const STRING_GAUGES = [0.046, 0.036, 0.026, 0.017, 0.013, 0.010];

/**
 * Get the stroke width for a string based on its gauge
 *
 * @param stringIndex - String index (0 = 6th string/low E, 5 = 1st string/high E)
 * @param baseWidth - Base width for the thinnest string (default 1.5)
 * @returns Stroke width in pixels
 */
export function getStringThickness(stringIndex: number, baseWidth: number = 1.5): number {
  const gauge = STRING_GAUGES[stringIndex];
  const thinestGauge = STRING_GAUGES[5]; // 1st string is thinnest
  return baseWidth * (gauge / thinestGauge);
}

/**
 * Calculate Y positions for all frets in a range, normalized to a given height
 *
 * @param startFret - First fret to display (0 = nut)
 * @param numFrets - Number of frets to display
 * @param totalHeight - Total available height in pixels
 * @returns Array of Y positions for each fret line
 */
export function calculateFretYPositions(
  startFret: number,
  numFrets: number,
  totalHeight: number
): number[] {
  const positions: number[] = [];

  // Calculate physical positions in mm
  const startPos = getFretPosition(startFret);
  const endPos = getFretPosition(startFret + numFrets);
  const totalLength = endPos - startPos;

  // Normalize to pixel coordinates
  for (let i = 0; i <= numFrets; i++) {
    const physicalPos = getFretPosition(startFret + i) - startPos;
    const normalizedY = (physicalPos / totalLength) * totalHeight;
    positions.push(normalizedY);
  }

  return positions;
}

/**
 * Calculate the position for a note at a specific fret
 * Position is slightly toward the previous fret (where you'd press on a real guitar)
 *
 * @param fret - Fret number (0 = open string, on the nut)
 * @param fretPositions - Array of positions for fret lines (X or Y)
 * @param startFret - First fret in the display range
 * @returns Coordinate for the note
 */
export function getNoteYPosition(
  fret: number,
  fretPositions: number[],
  startFret: number
): number {
  const fretIndex = fret - startFret;

  if (fret === 0) {
    // Open string - place on the nut line
    return fretPositions[0];
  }

  // Note is 35% from previous fret, 65% toward current fret
  // (slightly left/behind the fret, where you'd press on a real guitar)
  const prevPos = fretPositions[fretIndex - 1] || 0;
  const currentPos = fretPositions[fretIndex];
  return prevPos + (currentPos - prevPos) * 0.65;
}

/**
 * Standard guitar tuning in pitch classes (0-11)
 * Index 0 = 6th string (low E), Index 5 = 1st string (high E)
 */
const STANDARD_TUNING_PITCH_CLASSES = [4, 9, 2, 7, 11, 4]; // E A D G B E

/**
 * Standard guitar tuning in MIDI note numbers
 * Index 0 = 6th string (E2 = MIDI 40), Index 5 = 1st string (E4 = MIDI 64)
 */
const STRING_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

/**
 * Note names for sharps
 */
const PITCH_CLASS_NAMES_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Note names for flats
 */
const PITCH_CLASS_NAMES_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Keys that use flats in their key signature (flat side of circle of fifths)
 */
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']);
const SHARP_TO_FLAT_ENHARMONIC: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

/**
 * Get the note at a specific string and fret
 *
 * @param stringIndex - String index (0 = 6th string/low E, 5 = 1st string/high E)
 * @param fret - Fret number (0 = open string)
 * @param key - Optional key context to determine sharps vs flats
 * @returns Object with pitch class (0-11) and note name
 */
export function getNoteAtPosition(stringIndex: number, fret: number, key?: string): { pitchClass: number; noteName: string } {
  const openStringPc = STANDARD_TUNING_PITCH_CLASSES[stringIndex];
  const pitchClass = (openStringPc + fret) % 12;
  // Use flats for flat keys, sharps for sharp keys
  const useFlats = key ? FLAT_KEYS.has(key) : false;
  const noteNames = useFlats ? PITCH_CLASS_NAMES_FLATS : PITCH_CLASS_NAMES_SHARPS;
  const noteName = noteNames[pitchClass];
  return { pitchClass, noteName };
}

/**
 * Convert sharp accidental spellings to flat enharmonic spellings.
 * Keeps naturals and existing flats unchanged.
 */
export function toFlatEnharmonic(noteName: string): string {
  const normalized = noteName.replace('♯', '#').replace('♭', 'b');
  const match = normalized.match(/^([A-G](?:#|b)?)(\d+)?$/);
  if (!match) {
    return noteName;
  }

  const [, base, octave = ''] = match;
  return `${SHARP_TO_FLAT_ENHARMONIC[base] ?? base}${octave}`;
}

/**
 * Get the octave number for a note at a specific string and fret
 * Uses MIDI note numbers where octave = floor(midiNote / 12) - 1
 *
 * Examples:
 * - 6th string open (E2, MIDI 40) = octave 2
 * - 1st string open (E4, MIDI 64) = octave 4
 * - 1st string fret 12 (E5, MIDI 76) = octave 5
 *
 * @param stringIndex - String index (0 = 6th string/low E, 5 = 1st string/high E)
 * @param fret - Fret number (0 = open string)
 * @returns Octave number (typically 2-5 for standard guitar range)
 */
export function getOctaveAtPosition(stringIndex: number, fret: number): number {
  const openStringMidi = STRING_TUNING_MIDI[stringIndex];
  const midiNote = openStringMidi + fret;
  return Math.floor(midiNote / 12) - 1;
}
