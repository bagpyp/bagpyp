/**
 * Chord Symbol Parser
 *
 * Parses chord symbols into structured data for rendering and playback.
 * Supports:
 * - Basic triads: "C", "Am", "Bdim", "Faug"
 * - 7th chords: "Cmaj7", "Am7", "G7", "Dm7b5", "Bdim7"
 * - Slash chords: "C/E", "G7/B", "Am/G"
 */

import type { PitchClass, SeventhQuality } from '../state/types';
import { mod12 } from './musicMath';

// Note name to pitch class mapping
const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';

export interface ParsedChord {
  rootPC: PitchClass;
  quality: TriadQuality;
  seventhQuality?: SeventhQuality;  // Includes 7th chords AND 6th chords ('6', 'm6')
  bassPC?: PitchClass;  // For slash chords (e.g., G7/B)
}

/**
 * Parse a note name (e.g., "C", "F#", "Bb") to pitch class
 */
function parseNoteName(note: string): PitchClass {
  const pc = NOTE_TO_PC[note];
  if (pc === undefined) {
    console.warn(`Unknown note name: ${note}, defaulting to C`);
    return 0;
  }
  return pc as PitchClass;
}

/**
 * Parse a chord symbol into its components
 *
 * Supported formats:
 * - Basic triads: "C", "Am", "Bdim", "Faug"
 * - 7th chords: "Cmaj7", "Am7", "G7", "Dm7b5" (halfDim7), "Bdim7"
 * - Slash chords: "C/E", "G7/B", "Am/G"
 *
 * @param symbol - Chord symbol string
 * @returns ParsedChord object
 */
export function parseChordSymbol(symbol: string): ParsedChord {
  let remaining = symbol.trim();

  // Check for slash chord (bass note)
  let bassPC: PitchClass | undefined;
  const slashIndex = remaining.lastIndexOf('/');
  if (slashIndex > 0) {
    const bassNote = remaining.slice(slashIndex + 1);
    bassPC = parseNoteName(bassNote);
    remaining = remaining.slice(0, slashIndex);
  }

  // Parse root note (handle accidentals)
  let rootEndIndex = 1;
  if (remaining.length > 1 && (remaining[1] === '#' || remaining[1] === 'b')) {
    rootEndIndex = 2;
  }

  const rootNote = remaining.slice(0, rootEndIndex);
  const rootPC = parseNoteName(rootNote);
  remaining = remaining.slice(rootEndIndex);

  // Parse quality and extensions
  let quality: TriadQuality = 'major';
  let seventhQuality: SeventhQuality | undefined;

  // Normalize common variations
  remaining = remaining
    .replace(/°7/g, 'dim7')
    .replace(/°/g, 'dim')
    .replace(/ø7/g, 'm7b5')
    .replace(/ø/g, 'm7b5')
    .replace(/Δ7/g, 'maj7')
    .replace(/Δ/g, 'maj7');

  // Check for specific patterns (order matters - check longer patterns first)
  if (remaining.startsWith('maj7') || remaining.startsWith('M7')) {
    quality = 'major';
    seventhQuality = 'maj7';
  } else if (remaining.startsWith('m7b5') || remaining.startsWith('min7b5')) {
    quality = 'diminished';
    seventhQuality = 'halfDim7';
  } else if (remaining.startsWith('mMaj7') || remaining.startsWith('minMaj7') || remaining.startsWith('m(maj7)')) {
    quality = 'minor';
    seventhQuality = 'minMaj7';
  } else if (remaining.startsWith('m7') || remaining.startsWith('min7') || remaining.startsWith('-7')) {
    quality = 'minor';
    seventhQuality = 'min7';
  } else if (remaining.startsWith('m6') || remaining.startsWith('min6')) {
    // Minor 6th chord (minor triad + major 6th)
    quality = 'minor';
    seventhQuality = 'm6';
  } else if (remaining.startsWith('dim7')) {
    quality = 'diminished';
    seventhQuality = 'dim7';
  } else if (remaining.startsWith('aug7') || remaining.startsWith('+7')) {
    quality = 'augmented';
    seventhQuality = 'augMaj7';
  } else if (remaining.startsWith('augMaj7') || remaining.startsWith('+maj7')) {
    quality = 'augmented';
    seventhQuality = 'augMaj7';
  } else if (remaining === '7' || remaining.startsWith('7')) {
    // Dominant 7 (major triad + minor 7th)
    quality = 'major';
    seventhQuality = 'dom7';
  } else if (remaining === '6' || remaining.startsWith('6')) {
    // Major 6th chord (major triad + major 6th)
    quality = 'major';
    seventhQuality = '6';
  } else if (remaining.startsWith('aug') || remaining.startsWith('+')) {
    quality = 'augmented';
  } else if (remaining.startsWith('dim')) {
    quality = 'diminished';
  } else if (remaining.startsWith('m') || remaining.startsWith('min') || remaining.startsWith('-')) {
    quality = 'minor';
  }
  // Default: major (no suffix needed)

  return {
    rootPC: rootPC as PitchClass,
    quality,
    seventhQuality,
    bassPC,
  };
}

/**
 * Get the interval structure for a triad quality
 */
function getTriadIntervals(quality: TriadQuality): number[] {
  switch (quality) {
    case 'major': return [0, 4, 7];
    case 'minor': return [0, 3, 7];
    case 'diminished': return [0, 3, 6];
    case 'augmented': return [0, 4, 8];
  }
}

/**
 * Get the extended interval for a quality (7ths and 6ths)
 */
function getSeventhInterval(quality: SeventhQuality): number {
  const intervals: Record<SeventhQuality, number> = {
    maj7: 11,      // Major 7th
    min7: 10,      // Minor 7th
    dom7: 10,      // Minor 7th (on major triad)
    minMaj7: 11,   // Major 7th (on minor triad)
    halfDim7: 10,  // Minor 7th (on diminished triad)
    dim7: 9,       // Diminished 7th
    augMaj7: 11,   // Major 7th (on augmented triad)
    '6': 9,        // Major 6th
    'm6': 9,       // Major 6th (on minor triad)
  };
  return intervals[quality];
}

/**
 * Get interval structure for parsed chord (including 7th or 6th if present)
 */
export function getChordIntervals(parsed: ParsedChord): number[] {
  const intervals = getTriadIntervals(parsed.quality);

  if (parsed.seventhQuality) {
    intervals.push(getSeventhInterval(parsed.seventhQuality));
  }

  return intervals;
}

/**
 * Generate pitch classes for a parsed chord
 */
export function getPitchClassesForChord(parsed: ParsedChord): PitchClass[] {
  const intervals = getChordIntervals(parsed);
  return intervals.map(i => mod12(parsed.rootPC + i) as PitchClass);
}

/**
 * Get the display type ('major' | 'minor') for a parsed chord
 * Used for triangle rendering - diminished/augmented map to minor/major visually
 */
export function getDisplayType(parsed: ParsedChord): 'major' | 'minor' {
  switch (parsed.quality) {
    case 'major':
    case 'augmented':
      return 'major';
    case 'minor':
    case 'diminished':
      return 'minor';
  }
}

/**
 * Convert chord symbol to a simple name for display
 */
export function getChordDisplayName(parsed: ParsedChord, preferSharps: boolean = true): string {
  const noteNames = preferSharps
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  let name = noteNames[parsed.rootPC];

  // Add quality suffix
  switch (parsed.quality) {
    case 'minor': name += 'm'; break;
    case 'diminished': name += 'dim'; break;
    case 'augmented': name += 'aug'; break;
    // major has no suffix
  }

  // Add 7th/6th suffix
  if (parsed.seventhQuality) {
    switch (parsed.seventhQuality) {
      case 'maj7': name += 'maj7'; break;
      case 'min7': name = name.replace(/m$/, '') + 'm7'; break;
      case 'dom7': name += '7'; break;
      case 'minMaj7': name = name.replace(/m$/, '') + 'mMaj7'; break;
      case 'halfDim7': name = name.replace(/dim$/, '') + 'ø7'; break;
      case 'dim7': name = name.replace(/dim$/, '') + '°7'; break;
      case 'augMaj7': name = name.replace(/aug$/, '') + '+Maj7'; break;
      case '6': name += '6'; break;
      case 'm6': name = name.replace(/m$/, '') + 'm6'; break;
    }
  }

  // Add bass note for slash chords
  if (parsed.bassPC !== undefined) {
    name += '/' + noteNames[parsed.bassPC];
  }

  return name;
}
