/**
 * Configuration settings for the Major Triads display
 */

export type InversionNotation = 'symbols' | 'figured-bass';

export interface TriadSettings {
  // Visual display options
  showChromaticNotes: boolean;      // Show all chromatic notes (30% opacity background)
  showOctaveColors: boolean;        // Use brightness/saturation to show octave differences
  showRootHalos: boolean;           // Show golden halos around root notes

  // Sound options
  enableHoverSound: boolean;        // Play sound when hovering over notes

  // Notation options
  inversionNotation: InversionNotation; // 'symbols' (△, ¹, ²) or 'figured-bass' (6/4, etc.)

  // Chord type (not yet implemented)
  chordType: 'major' | 'minor';     // Major or minor triads (minor not yet implemented)
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
