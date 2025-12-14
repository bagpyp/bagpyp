import type { PitchClass, GridCell, Point } from '../state/types';
import { mod12 } from './musicMath';
import { cellToWorld } from './lattice';

/**
 * Seventh Chord Support for Tonnetz
 *
 * Chords are pitch-class sets S ⊆ ℤ₁₂.
 * Rendering is driven by detecting which major/minor triads exist as 3-subsets.
 * Triangles are faces, not chord objects.
 */

// ============================================================================
// CHORD QUALITY DEFINITIONS
// ============================================================================

/**
 * All supported chord qualities with their interval sets from root
 */
export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
// Extended chord qualities (7ths and 6ths)
export type SeventhQuality = 'maj7' | 'min7' | 'dom7' | 'minMaj7' | 'halfDim7' | 'dim7' | 'augMaj7' | '6' | 'm6';
export type ChordQuality = TriadQuality | SeventhQuality;

/**
 * Interval sets for each chord quality (intervals from root in semitones)
 */
export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  // Triads
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  // Seventh chords
  maj7: [0, 4, 7, 11],      // Major triad + major 7th
  min7: [0, 3, 7, 10],      // Minor triad + minor 7th
  dom7: [0, 4, 7, 10],      // Major triad + minor 7th
  minMaj7: [0, 3, 7, 11],   // Minor triad + major 7th
  halfDim7: [0, 3, 6, 10],  // Diminished triad + minor 7th (ø7)
  dim7: [0, 3, 6, 9],       // Diminished triad + diminished 7th (°7)
  augMaj7: [0, 4, 8, 11],   // Augmented triad + major 7th
  // Sixth chords
  '6': [0, 4, 7, 9],        // Major triad + major 6th
  'm6': [0, 3, 7, 9],       // Minor triad + major 6th
};

/**
 * Human-readable names for chord qualities
 */
export const CHORD_QUALITY_NAMES: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  maj7: 'maj7',
  min7: 'm7',
  dom7: '7',
  minMaj7: 'mMaj7',
  halfDim7: 'ø7',
  dim7: '°7',
  augMaj7: 'augMaj7',
  '6': '6',
  'm6': 'm6',
};

// ============================================================================
// PITCH CLASS SET UTILITIES
// ============================================================================

/**
 * Get pitch classes for a chord given root and quality
 */
export function getChordPitchClasses(root: PitchClass, quality: ChordQuality): PitchClass[] {
  return CHORD_INTERVALS[quality].map(interval => mod12(root + interval));
}

/**
 * Check if a pitch class set matches a major triad template
 * Returns the root if it matches, null otherwise
 */
export function matchesMajorTriad(pcs: Set<number>): PitchClass | null {
  if (pcs.size !== 3) return null;
  const arr = Array.from(pcs).sort((a, b) => a - b);

  // Try each element as potential root
  for (const root of arr) {
    const intervals = arr.map(pc => mod12(pc - root)).sort((a, b) => a - b);
    if (intervals[0] === 0 && intervals[1] === 4 && intervals[2] === 7) {
      return root as PitchClass;
    }
  }
  return null;
}

/**
 * Check if a pitch class set matches a minor triad template
 * Returns the root if it matches, null otherwise
 */
export function matchesMinorTriad(pcs: Set<number>): PitchClass | null {
  if (pcs.size !== 3) return null;
  const arr = Array.from(pcs).sort((a, b) => a - b);

  // Try each element as potential root
  for (const root of arr) {
    const intervals = arr.map(pc => mod12(pc - root)).sort((a, b) => a - b);
    if (intervals[0] === 0 && intervals[1] === 3 && intervals[2] === 7) {
      return root as PitchClass;
    }
  }
  return null;
}

// ============================================================================
// FACE DETECTION
// ============================================================================

/**
 * A detected triad face within a chord
 */
export interface TriadFace {
  type: 'major' | 'minor';
  rootPC: PitchClass;
  pitchClasses: [PitchClass, PitchClass, PitchClass];
}

/**
 * Find all major/minor triad faces in a pitch class set
 * Face(S) = all 3-subsets of S that form a major or minor triad
 */
export function findTriadFaces(pitchClasses: PitchClass[]): TriadFace[] {
  const faces: TriadFace[] = [];
  const pcs = [...new Set(pitchClasses)]; // Dedupe

  if (pcs.length < 3) return faces;

  // Generate all 3-subsets
  for (let i = 0; i < pcs.length; i++) {
    for (let j = i + 1; j < pcs.length; j++) {
      for (let k = j + 1; k < pcs.length; k++) {
        const subset = new Set([pcs[i], pcs[j], pcs[k]]);

        // Check for major triad
        const majorRoot = matchesMajorTriad(subset);
        if (majorRoot !== null) {
          faces.push({
            type: 'major',
            rootPC: majorRoot,
            pitchClasses: [majorRoot, mod12(majorRoot + 4), mod12(majorRoot + 7)],
          });
        }

        // Check for minor triad
        const minorRoot = matchesMinorTriad(subset);
        if (minorRoot !== null) {
          faces.push({
            type: 'minor',
            rootPC: minorRoot,
            pitchClasses: [minorRoot, mod12(minorRoot + 3), mod12(minorRoot + 7)],
          });
        }
      }
    }
  }

  return faces;
}

// ============================================================================
// SEVENTH CHORD DECOMPOSITION
// ============================================================================

/**
 * Rendering mode for a seventh chord
 */
export type SeventhChordRenderMode =
  | 'two-triangle'  // Two triads sharing an edge (maj7, m7, 6 chords)
  | 'triangle-leg'  // One triad + added seventh tone (dom7, minMaj7)
  | 'no-face';      // No drawable face (dim7, aug families)

/**
 * Decomposition of a seventh chord for rendering
 */
export interface SeventhChordDecomposition {
  mode: SeventhChordRenderMode;
  faces: TriadFace[];           // The drawable triangle faces
  legTones: PitchClass[];       // Extra tones not covered by faces
  sharedEdge?: PitchClass[];    // For two-triangle mode: the shared edge (2 pcs)
}

/**
 * Decompose a seventh chord into renderable components
 *
 * Rule A: Two-triangle mode
 * If there exist two faces T₁, T₂ such that T₁ ∪ T₂ = S and |T₁ ∩ T₂| = 2
 *
 * Rule B: Triangle + leg mode
 * If Face(S) is non-empty but Rule A fails
 *
 * Rule C: No-face mode
 * If Face(S) is empty
 */
export function decomposeSeventhChord(pitchClasses: PitchClass[]): SeventhChordDecomposition {
  const pcsSet = new Set(pitchClasses);
  const faces = findTriadFaces(pitchClasses);

  // Rule C: No faces found
  if (faces.length === 0) {
    return {
      mode: 'no-face',
      faces: [],
      legTones: pitchClasses,
    };
  }

  // Rule A: Try to find two triangles that cover all 4 tones with 2-tone overlap
  if (pcsSet.size === 4) {
    for (let i = 0; i < faces.length; i++) {
      for (let j = i + 1; j < faces.length; j++) {
        const face1 = faces[i];
        const face2 = faces[j];

        const union = new Set([...face1.pitchClasses, ...face2.pitchClasses]);
        const intersection = face1.pitchClasses.filter(pc => face2.pitchClasses.includes(pc));

        // Check: union covers all pcs, intersection is exactly 2
        if (union.size === pcsSet.size &&
            [...pcsSet].every(pc => union.has(pc)) &&
            intersection.length === 2) {
          return {
            mode: 'two-triangle',
            faces: [face1, face2],
            legTones: [],
            sharedEdge: intersection,
          };
        }
      }
    }
  }

  // Rule B: Use one primary face + leg tones
  // Pick the face whose root matches the chord root (first in the pc list, typically)
  // Or just pick the first face
  const primaryFace = faces[0];
  const coveredPcs = new Set(primaryFace.pitchClasses);
  const legTones = pitchClasses.filter(pc => !coveredPcs.has(pc));

  return {
    mode: 'triangle-leg',
    faces: [primaryFace],
    legTones,
  };
}

// ============================================================================
// GRID CELL UTILITIES FOR 7TH CHORDS
// ============================================================================

/**
 * Interval to grid displacement mapping
 * v(i) = the unique (Δr, Δc) such that 3Δr + 4Δc ≡ i (mod 12)
 */
export const INTERVAL_TO_DISPLACEMENT: Record<number, { dr: number; dc: number }> = {
  0: { dr: 0, dc: 0 },
  1: { dr: 3, dc: 1 },   // 3*3 + 4*1 = 13 ≡ 1
  2: { dr: 2, dc: 2 },   // 3*2 + 4*2 = 14 ≡ 2
  3: { dr: 1, dc: 0 },   // 3*1 = 3
  4: { dr: 0, dc: 1 },   // 4*1 = 4
  5: { dr: 3, dc: 2 },   // 3*3 + 4*2 = 17 ≡ 5
  6: { dr: 2, dc: 0 },   // 3*2 = 6
  7: { dr: 1, dc: 1 },   // 3*1 + 4*1 = 7
  8: { dr: 0, dc: 2 },   // 4*2 = 8
  9: { dr: 3, dc: 0 },   // 3*3 = 9
  10: { dr: 2, dc: 1 },  // 3*2 + 4*1 = 10
  11: { dr: 1, dc: 2 },  // 3*1 + 4*2 = 11
};

/**
 * Get the grid cell for a pitch class relative to a root cell
 */
export function getGridCellForInterval(
  rootCell: GridCell,
  intervalFromRoot: number
): GridCell {
  const interval = mod12(intervalFromRoot);
  const disp = INTERVAL_TO_DISPLACEMENT[interval];
  return {
    row: rootCell.row + disp.dr,
    col: rootCell.col + disp.dc,
  };
}

/**
 * Get all grid cells for a chord's pitch classes
 */
export function getChordGridCells(
  rootCell: GridCell,
  quality: ChordQuality
): GridCell[] {
  return CHORD_INTERVALS[quality].map(interval =>
    getGridCellForInterval(rootCell, interval)
  );
}

/**
 * Get world coordinates for all vertices of a seventh chord
 */
export function getSeventhChordVertices(
  rootCell: GridCell,
  quality: SeventhQuality,
  cellSize: number
): Point[] {
  const cells = getChordGridCells(rootCell, quality);
  return cells.map(cell => cellToWorld(cell, cellSize));
}

// ============================================================================
// CHORD NAME UTILITIES
// ============================================================================

/**
 * Get the full chord name (e.g., "Cmaj7", "Am7", "G7")
 */
export function getSeventhChordName(
  rootPC: PitchClass,
  quality: SeventhQuality,
  preferSharps: boolean = true
): string {
  const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  const rootName = preferSharps ? SHARP_NAMES[rootPC] : FLAT_NAMES[rootPC];
  return rootName + CHORD_QUALITY_NAMES[quality];
}

/**
 * Identify the quality of a seventh chord from its pitch classes
 */
export function identifySeventhChordQuality(
  pitchClasses: PitchClass[]
): { root: PitchClass; quality: SeventhQuality } | null {
  if (pitchClasses.length !== 4) return null;

  const pcs = [...new Set(pitchClasses)];
  if (pcs.length !== 4) return null;

  // Try each pitch class as potential root
  for (const root of pcs) {
    const intervals = pcs.map(pc => mod12(pc - root)).sort((a, b) => a - b);
    const intervalStr = intervals.join(',');

    // Match against known patterns
    const patterns: Record<string, SeventhQuality> = {
      '0,4,7,11': 'maj7',
      '0,3,7,10': 'min7',
      '0,4,7,10': 'dom7',
      '0,3,7,11': 'minMaj7',
      '0,3,6,10': 'halfDim7',
      '0,3,6,9': 'dim7',
      '0,4,8,11': 'augMaj7',
    };

    if (patterns[intervalStr]) {
      return { root: root as PitchClass, quality: patterns[intervalStr] };
    }
  }

  return null;
}
