/**
 * Configuration settings for the Major Triads display
 */

export type InversionNotation = 'symbols' | 'figured-bass';
export type ChordLabelNotation = 'standard' | 'jazz' | 'classical';

export interface TriadSettings {
  // Visual display options
  showChromaticNotes: boolean;      // Show all chromatic notes (30% opacity background)
  showOctaveColors: boolean;        // Use brightness/saturation to show octave differences
  showRootHalos: boolean;           // Show golden halos around root notes

  // Sound options
  enableHoverSound: boolean;        // Play sound when hovering over notes

  // Notation options
  inversionNotation: InversionNotation; // 'symbols' (△, ¹, ²) or 'figured-bass' (6/4, etc.)
  chordLabelNotation: ChordLabelNotation; // How to display chord type labels

  // Chord type (moved to main display, not in settings anymore)
  chordType: 'major' | 'minor' | 'dim' | 'aug';     // Chord type (dim and aug not yet implemented)
}

/**
 * Default settings for the triads display
 */
export const DEFAULT_TRIAD_SETTINGS: TriadSettings = {
  showChromaticNotes: true,
  showOctaveColors: true,
  showRootHalos: true,
  enableHoverSound: true,
  inversionNotation: 'symbols',
  chordLabelNotation: 'standard',
  chordType: 'major',
};

/**
 * Labels for inversion notation types
 */
export const INVERSION_NOTATION_LABELS: Record<InversionNotation, string> = {
  'symbols': 'Symbols (△, ¹, ²)',
  'figured-bass': 'Figured Bass (⁶₄)',
};

/**
 * Get the symbol for an inversion type based on notation preference
 */
export function getInversionSymbol(
  inversion: 'root' | 'first' | 'second' | 'unknown',
  notation: InversionNotation
): string {
  // Handle unknown inversions
  if (inversion === 'unknown') {
    return '?';
  }

  if (notation === 'symbols') {
    return inversion === 'root' ? '△' : inversion === 'first' ? '¹' : '²';
  } else {
    // Figured bass notation
    // Root position: no symbol (or could use 5/3)
    // First inversion: 6 (or 6/3)
    // Second inversion: 6/4
    return inversion === 'root' ? '' : inversion === 'first' ? '⁶' : '⁶₄';
  }
}

/**
 * Get chord type labels based on notation preference
 */
export function getChordTypeLabels(notation: ChordLabelNotation): Record<string, string> {
  switch (notation) {
    case 'standard':
      return {
        major: 'Major',
        minor: 'Minor',
        dim: 'Dim',
        aug: 'Aug',
      };
    case 'jazz':
      return {
        major: 'maj',
        minor: 'min',
        dim: 'dim',
        aug: 'aug',
      };
    case 'classical':
      return {
        major: 'M',
        minor: 'm',
        dim: '°',
        aug: '+',
      };
    default:
      return {
        major: 'Major',
        minor: 'Minor',
        dim: 'Dim',
        aug: 'Aug',
      };
  }
}

/**
 * Labels for chord label notation types
 */
export const CHORD_LABEL_NOTATION_LABELS: Record<ChordLabelNotation, string> = {
  'standard': 'Standard (Major, Minor)',
  'jazz': 'Jazz (maj, min)',
  'classical': 'Classical (M, m, °, +)',
};
