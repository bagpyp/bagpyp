import type { PitchClass } from '../state/types';

// Note names with sharps
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note names with flats
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Interval names relative to tonic
const INTERVAL_NAMES = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];

// Scale degree labels
const DEGREE_LABELS = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];

/**
 * Normalize any integer to a pitch class (0-11)
 */
export function mod12(n: number): PitchClass {
  return ((n % 12) + 12) % 12 as PitchClass;
}

/**
 * Get note name for a pitch class
 * @param pc - pitch class (0-11)
 * @param keyCenter - the tonic pitch class (determines what pc=0 maps to)
 * @param preferSharps - whether to use sharps or flats
 */
export function pcToNoteName(
  pc: PitchClass,
  keyCenter: PitchClass = 0,
  preferSharps: boolean = true
): string {
  // The displayed pitch class is offset by the key center
  const displayPC = mod12(pc + keyCenter);
  return preferSharps ? SHARP_NAMES[displayPC] : FLAT_NAMES[displayPC];
}

/**
 * Get interval name relative to tonic
 * @param pc - pitch class (0-11)
 */
export function pcToInterval(pc: PitchClass): string {
  return INTERVAL_NAMES[pc];
}

/**
 * Get scale degree label relative to tonic
 * @param pc - pitch class (0-11)
 */
export function pcToDegree(pc: PitchClass): string {
  return DEGREE_LABELS[pc];
}

/**
 * Get the pitch classes of a major triad
 * Major = {root, root+4, root+7}
 */
export function majorTriad(root: PitchClass): [PitchClass, PitchClass, PitchClass] {
  return [root, mod12(root + 4), mod12(root + 7)];
}

/**
 * Get the pitch classes of a minor triad
 * Minor = {root, root+3, root+7}
 */
export function minorTriad(root: PitchClass): [PitchClass, PitchClass, PitchClass] {
  return [root, mod12(root + 3), mod12(root + 7)];
}

/**
 * Get chord name (e.g., "C", "Am", "F#m")
 */
export function chordName(
  root: PitchClass,
  type: 'major' | 'minor',
  keyCenter: PitchClass = 0,
  preferSharps: boolean = true
): string {
  const rootName = pcToNoteName(root, keyCenter, preferSharps);
  return type === 'major' ? rootName : `${rootName}m`;
}

/**
 * Get display label based on mode
 */
export function getLabel(
  pc: PitchClass,
  mode: 'notes' | 'intervals' | 'degrees',
  keyCenter: PitchClass = 0,
  preferSharps: boolean = true
): string {
  switch (mode) {
    case 'notes':
      return pcToNoteName(pc, keyCenter, preferSharps);
    case 'intervals':
      return pcToInterval(pc);
    case 'degrees':
      return pcToDegree(pc);
  }
}

/**
 * Convert pitch class to frequency (A4 = 440 Hz)
 * @param pc - pitch class
 * @param octave - octave number (4 = middle C octave)
 */
export function pcToFrequency(pc: PitchClass, octave: number = 4): number {
  // A4 (pc=9, octave=4) = 440 Hz
  const semitonesFromA4 = (pc - 9) + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

/**
 * Get a color for a pitch class (for visualization)
 * Uses a color wheel approach
 */
export function pcToColor(pc: PitchClass, alpha: number = 1): string {
  // Map pitch class to hue (circle of fifths for nice colors)
  const hues = [0, 210, 60, 270, 120, 330, 180, 30, 240, 90, 300, 150];
  const hue = hues[pc];
  return `hsla(${hue}, 70%, 60%, ${alpha})`;
}

// Roman numeral labels for major chords (uppercase)
const MAJOR_ROMAN = ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV', 'V', 'bVI', 'VI', 'bVII', 'VII'];

// Roman numeral labels for minor chords (lowercase)
const MINOR_ROMAN = ['i', 'bii', 'ii', 'biii', 'iii', 'iv', '#iv', 'v', 'bvi', 'vi', 'bvii', 'vii'];

/**
 * Get Roman numeral chord name relative to key center
 * @param rootPC - the root pitch class of the chord (already relative to key center)
 * @param type - 'major' or 'minor'
 */
export function pcToRomanNumeral(
  rootPC: PitchClass,
  type: 'major' | 'minor'
): string {
  return type === 'major' ? MAJOR_ROMAN[rootPC] : MINOR_ROMAN[rootPC];
}

/**
 * Get triangle label based on label mode
 * - 'intervals' mode: Roman numerals (I, ii, IV, V, etc.)
 * - 'notes' or 'degrees' mode: Chord names (C, Am, F, etc.)
 */
export function getTriangleLabel(
  rootPC: PitchClass,
  type: 'major' | 'minor',
  labelMode: 'notes' | 'intervals' | 'degrees',
  keyCenter: PitchClass = 0,
  preferSharps: boolean = true
): string {
  if (labelMode === 'intervals') {
    return pcToRomanNumeral(rootPC, type);
  } else {
    // For 'notes' and 'degrees', show chord name
    return chordName(rootPC, type, keyCenter, preferSharps);
  }
}
