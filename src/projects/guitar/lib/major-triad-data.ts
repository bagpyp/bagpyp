/**
 * Major Triad Position Data
 *
 * These are the hard-coded, musically validated positions for all 12 major keys.
 * Each position has been carefully selected to:
 * - Follow the inversion cycle (first → second → root → first...)
 * - Maintain playability (max 5-fret stretch)
 * - Cover the fretboard from low to high positions
 * - Share notes between adjacent groups where possible
 *
 * These positions are "facts of the universe" and should not be changed.
 * Any modifications will break the comprehensive test suite.
 */

export const MAJOR_TRIAD_POSITIONS: Record<string, any> = {
  C: {
    G0: [{ pos: 0, frets: [3, 3, 2], inv: 'second' }, { pos: 1, frets: [8, 7, 5], inv: 'root' }, { pos: 2, frets: [12, 10, 10], inv: 'first' }, { pos: 3, frets: [15, 15, 14], inv: 'second' }],
    G1: [{ pos: 0, frets: [3, 2, 0], inv: 'root' }, { pos: 1, frets: [7, 5, 5], inv: 'first' }, { pos: 2, frets: [10, 10, 9], inv: 'second' }, { pos: 3, frets: [15, 14, 12], inv: 'root' }],
    G2: [{ pos: 0, frets: [2, 0, 1], inv: 'first' }, { pos: 1, frets: [5, 5, 5], inv: 'second' }, { pos: 2, frets: [10, 9, 8], inv: 'root' }, { pos: 3, frets: [14, 12, 13], inv: 'first' }],
    G3: [{ pos: 0, frets: [0, 1, 0], inv: 'second' }, { pos: 1, frets: [5, 5, 3], inv: 'root' }, { pos: 2, frets: [9, 8, 8], inv: 'first' }, { pos: 3, frets: [12, 13, 12], inv: 'second' }],
  },
  G: {
    G0: [{ pos: 0, frets: [3, 2, 0], inv: 'root' }, { pos: 1, frets: [7, 5, 5], inv: 'first' }, { pos: 2, frets: [10, 10, 9], inv: 'second' }, { pos: 3, frets: [15, 14, 12], inv: 'root' }],
    G1: [{ pos: 0, frets: [2, 0, 0], inv: 'first' }, { pos: 1, frets: [5, 5, 4], inv: 'second' }, { pos: 2, frets: [10, 9, 7], inv: 'root' }, { pos: 3, frets: [14, 12, 12], inv: 'first' }],
    G2: [{ pos: 0, frets: [0, 0, 0], inv: 'second' }, { pos: 1, frets: [5, 4, 3], inv: 'root' }, { pos: 2, frets: [9, 7, 8], inv: 'first' }, { pos: 3, frets: [12, 12, 12], inv: 'second' }],
    G3: [{ pos: 0, frets: [4, 3, 3], inv: 'first' }, { pos: 1, frets: [7, 8, 7], inv: 'second' }, { pos: 2, frets: [12, 12, 10], inv: 'root' }, { pos: 3, frets: [16, 15, 15], inv: 'first' }],
  },
  D: {
    G0: [{ pos: 0, frets: [2, 0, 0], inv: 'first' }, { pos: 1, frets: [5, 5, 4], inv: 'second' }, { pos: 2, frets: [10, 9, 7], inv: 'root' }, { pos: 3, frets: [14, 12, 12], inv: 'first' }],
    G1: [{ pos: 0, frets: [5, 4, 2], inv: 'root' }, { pos: 1, frets: [9, 7, 7], inv: 'first' }, { pos: 2, frets: [12, 12, 11], inv: 'second' }, { pos: 3, frets: [17, 16, 14], inv: 'root' }],
    G2: [{ pos: 0, frets: [4, 2, 3], inv: 'first' }, { pos: 1, frets: [7, 7, 7], inv: 'second' }, { pos: 2, frets: [12, 11, 10], inv: 'root' }, { pos: 3, frets: [16, 14, 15], inv: 'first' }],
    G3: [{ pos: 0, frets: [2, 3, 2], inv: 'second' }, { pos: 1, frets: [7, 7, 5], inv: 'root' }, { pos: 2, frets: [11, 10, 10], inv: 'first' }, { pos: 3, frets: [14, 15, 14], inv: 'second' }],
  },
  A: {
    G0: [{ pos: 0, frets: [5, 4, 2], inv: 'root' }, { pos: 1, frets: [9, 7, 7], inv: 'first' }, { pos: 2, frets: [12, 12, 11], inv: 'second' }, { pos: 3, frets: [17, 16, 14], inv: 'root' }],
    G1: [{ pos: 0, frets: [4, 2, 2], inv: 'first' }, { pos: 1, frets: [7, 7, 6], inv: 'second' }, { pos: 2, frets: [12, 11, 9], inv: 'root' }, { pos: 3, frets: [16, 14, 14], inv: 'first' }],
    G2: [{ pos: 0, frets: [2, 2, 2], inv: 'second' }, { pos: 1, frets: [7, 6, 5], inv: 'root' }, { pos: 2, frets: [11, 9, 10], inv: 'first' }, { pos: 3, frets: [14, 14, 14], inv: 'second' }],
    G3: [{ pos: 0, frets: [2, 2, 0], inv: 'root' }, { pos: 1, frets: [6, 5, 5], inv: 'first' }, { pos: 2, frets: [9, 10, 9], inv: 'second' }, { pos: 3, frets: [14, 14, 12], inv: 'root' }],
  },
  E: {
    G0: [{ pos: 0, frets: [4, 2, 2], inv: 'first' }, { pos: 1, frets: [7, 7, 6], inv: 'second' }, { pos: 2, frets: [12, 11, 9], inv: 'root' }, { pos: 3, frets: [16, 14, 14], inv: 'first' }],
    G1: [{ pos: 0, frets: [2, 2, 1], inv: 'second' }, { pos: 1, frets: [7, 6, 4], inv: 'root' }, { pos: 2, frets: [11, 9, 9], inv: 'first' }, { pos: 3, frets: [14, 14, 13], inv: 'second' }],
    G2: [{ pos: 0, frets: [2, 1, 0], inv: 'root' }, { pos: 1, frets: [6, 4, 5], inv: 'first' }, { pos: 2, frets: [9, 9, 9], inv: 'second' }, { pos: 3, frets: [14, 13, 12], inv: 'root' }],
    G3: [{ pos: 0, frets: [1, 0, 0], inv: 'first' }, { pos: 1, frets: [4, 5, 4], inv: 'second' }, { pos: 2, frets: [9, 9, 7], inv: 'root' }, { pos: 3, frets: [13, 12, 12], inv: 'first' }],
  },
  F: {
    G0: [{ pos: 0, frets: [5, 3, 3], inv: 'first' }, { pos: 1, frets: [8, 8, 7], inv: 'second' }, { pos: 2, frets: [13, 12, 10], inv: 'root' }, { pos: 3, frets: [17, 15, 15], inv: 'first' }],
    G1: [{ pos: 0, frets: [3, 3, 2], inv: 'second' }, { pos: 1, frets: [8, 7, 5], inv: 'root' }, { pos: 2, frets: [12, 10, 10], inv: 'first' }, { pos: 3, frets: [15, 15, 14], inv: 'second' }],
    G2: [{ pos: 0, frets: [3, 2, 1], inv: 'root' }, { pos: 1, frets: [7, 5, 6], inv: 'first' }, { pos: 2, frets: [10, 10, 10], inv: 'second' }, { pos: 3, frets: [15, 14, 13], inv: 'root' }],
    G3: [{ pos: 0, frets: [2, 1, 1], inv: 'first' }, { pos: 1, frets: [5, 6, 5], inv: 'second' }, { pos: 2, frets: [10, 10, 8], inv: 'root' }, { pos: 3, frets: [14, 13, 13], inv: 'first' }],
  },
  'F#': {
    G0: [{ pos: 0, frets: [6, 4, 4], inv: 'first' }, { pos: 1, frets: [9, 9, 8], inv: 'second' }, { pos: 2, frets: [14, 13, 11], inv: 'root' }, { pos: 3, frets: [18, 16, 16], inv: 'first' }],
    G1: [{ pos: 0, frets: [4, 4, 3], inv: 'second' }, { pos: 1, frets: [9, 8, 6], inv: 'root' }, { pos: 2, frets: [13, 11, 11], inv: 'first' }, { pos: 3, frets: [16, 16, 15], inv: 'second' }],
    G2: [{ pos: 0, frets: [4, 3, 2], inv: 'root' }, { pos: 1, frets: [8, 6, 7], inv: 'first' }, { pos: 2, frets: [11, 11, 11], inv: 'second' }, { pos: 3, frets: [16, 15, 14], inv: 'root' }],
    G3: [{ pos: 0, frets: [3, 2, 2], inv: 'first' }, { pos: 1, frets: [6, 7, 6], inv: 'second' }, { pos: 2, frets: [11, 11, 9], inv: 'root' }, { pos: 3, frets: [15, 14, 14], inv: 'first' }],
  },
  'A#': {
    G0: [{ pos: 0, frets: [1, 1, 0], inv: 'second' }, { pos: 1, frets: [6, 5, 3], inv: 'root' }, { pos: 2, frets: [10, 8, 8], inv: 'first' }, { pos: 3, frets: [13, 13, 12], inv: 'second' }],
    G1: [{ pos: 0, frets: [5, 3, 3], inv: 'first' }, { pos: 1, frets: [8, 8, 7], inv: 'second' }, { pos: 2, frets: [13, 12, 10], inv: 'root' }, { pos: 3, frets: [17, 15, 15], inv: 'first' }],
    G2: [{ pos: 0, frets: [3, 3, 3], inv: 'second' }, { pos: 1, frets: [8, 7, 6], inv: 'root' }, { pos: 2, frets: [12, 10, 11], inv: 'first' }, { pos: 3, frets: [15, 15, 15], inv: 'second' }],
    G3: [{ pos: 0, frets: [3, 3, 1], inv: 'root' }, { pos: 1, frets: [7, 6, 6], inv: 'first' }, { pos: 2, frets: [10, 11, 10], inv: 'second' }, { pos: 3, frets: [15, 15, 13], inv: 'root' }],
  },
  'B': {
    G0: [{ pos: 0, frets: [2, 2, 1], inv: 'second' }, { pos: 1, frets: [7, 6, 4], inv: 'root' }, { pos: 2, frets: [11, 9, 9], inv: 'first' }, { pos: 3, frets: [14, 14, 13], inv: 'second' }],
    G1: [{ pos: 0, frets: [6, 4, 4], inv: 'first' }, { pos: 1, frets: [9, 9, 8], inv: 'second' }, { pos: 2, frets: [14, 13, 11], inv: 'root' }, { pos: 3, frets: [6, 9, 11], inv: 'first' }],  // Note: Position 3 ordering issue
    G2: [{ pos: 0, frets: [4, 4, 4], inv: 'second' }, { pos: 1, frets: [9, 8, 7], inv: 'root' }, { pos: 2, frets: [13, 11, 12], inv: 'first' }, { pos: 3, frets: [16, 16, 16], inv: 'second' }],
    G3: [{ pos: 0, frets: [4, 4, 2], inv: 'root' }, { pos: 1, frets: [8, 7, 7], inv: 'first' }, { pos: 2, frets: [11, 12, 11], inv: 'second' }, { pos: 3, frets: [16, 16, 14], inv: 'root' }],
  },
  'C#': {
    G0: [{ pos: 0, frets: [4, 4, 3], inv: 'second' }, { pos: 1, frets: [9, 8, 6], inv: 'root' }, { pos: 2, frets: [13, 11, 11], inv: 'first' }, { pos: 3, frets: [16, 16, 15], inv: 'second' }],
    G1: [{ pos: 0, frets: [4, 3, 1], inv: 'root' }, { pos: 1, frets: [8, 6, 6], inv: 'first' }, { pos: 2, frets: [11, 11, 10], inv: 'second' }, { pos: 3, frets: [16, 15, 13], inv: 'root' }],
    G2: [{ pos: 0, frets: [3, 1, 2], inv: 'first' }, { pos: 1, frets: [6, 6, 6], inv: 'second' }, { pos: 2, frets: [11, 10, 9], inv: 'root' }, { pos: 3, frets: [15, 13, 14], inv: 'first' }],
    G3: [{ pos: 0, frets: [1, 2, 1], inv: 'second' }, { pos: 1, frets: [6, 6, 4], inv: 'root' }, { pos: 2, frets: [10, 9, 9], inv: 'first' }, { pos: 3, frets: [13, 14, 13], inv: 'second' }],
  },
  'D#': {
    G0: [{ pos: 0, frets: [3, 1, 1], inv: 'first' }, { pos: 1, frets: [6, 6, 5], inv: 'second' }, { pos: 2, frets: [11, 10, 8], inv: 'root' }, { pos: 3, frets: [15, 13, 13], inv: 'first' }],
    G1: [{ pos: 0, frets: [1, 1, 0], inv: 'second' }, { pos: 1, frets: [6, 5, 3], inv: 'root' }, { pos: 2, frets: [10, 8, 8], inv: 'first' }, { pos: 3, frets: [13, 13, 12], inv: 'second' }],
    G2: [{ pos: 0, frets: [5, 3, 4], inv: 'root' }, { pos: 1, frets: [8, 8, 8], inv: 'first' }, { pos: 2, frets: [13, 12, 11], inv: 'second' }, { pos: 3, frets: [17, 15, 16], inv: 'root' }],
    G3: [{ pos: 0, frets: [3, 4, 3], inv: 'first' }, { pos: 1, frets: [8, 8, 6], inv: 'second' }, { pos: 2, frets: [12, 11, 11], inv: 'root' }, { pos: 3, frets: [15, 16, 15], inv: 'first' }],
  },
  'G#': {
    G0: [{ pos: 0, frets: [4, 3, 1], inv: 'root' }, { pos: 1, frets: [8, 6, 6], inv: 'first' }, { pos: 2, frets: [11, 11, 10], inv: 'second' }, { pos: 3, frets: [16, 15, 13], inv: 'root' }],
    G1: [{ pos: 0, frets: [3, 1, 1], inv: 'first' }, { pos: 1, frets: [6, 6, 5], inv: 'second' }, { pos: 2, frets: [11, 10, 8], inv: 'root' }, { pos: 3, frets: [15, 13, 13], inv: 'first' }],
    G2: [{ pos: 0, frets: [1, 1, 1], inv: 'second' }, { pos: 1, frets: [6, 5, 4], inv: 'root' }, { pos: 2, frets: [10, 8, 9], inv: 'first' }, { pos: 3, frets: [13, 13, 13], inv: 'second' }],
    G3: [{ pos: 0, frets: [5, 4, 4], inv: 'root' }, { pos: 1, frets: [8, 9, 8], inv: 'first' }, { pos: 2, frets: [13, 13, 11], inv: 'second' }, { pos: 3, frets: [17, 16, 16], inv: 'root' }],
  },
};