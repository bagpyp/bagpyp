import type { TrianglePathPoint, GridCell, PitchClass } from '../state/types';
import { mod12 } from '../core/musicMath';
import progressionsData from './triad_progressions_C_and_Am.json';

export interface ProgressionData {
  name: string;
  mode: string;
  seq: [string, [number, number, number]][];
}

export interface Progression {
  id: string;
  name: string;
  mode: 'C_major' | 'A_minor';
  points: TrianglePathPoint[];
}

/**
 * Parse chord name to get root pitch class and type
 * e.g., "C" -> { rootPC: 0, type: 'major' }
 *       "Am" -> { rootPC: 9, type: 'minor' }
 *       "F#m" -> { rootPC: 6, type: 'minor' }
 */
const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

function parseChordName(name: string): { rootPC: PitchClass; type: 'major' | 'minor' } {
  // Check if minor (ends with 'm' but not 'dim' or 'maj')
  const isMinor = name.endsWith('m') && !name.endsWith('dim') && !name.endsWith('maj');

  // Extract root note (remove trailing 'm' if minor)
  const rootName = isMinor ? name.slice(0, -1) : name;

  const rootPC = (NOTE_TO_PC[rootName] ?? 0) as PitchClass;

  return { rootPC, type: isMinor ? 'minor' : 'major' };
}

/**
 * Find grid cell for a given MIDI pitch
 * Solves: 60 + 4*col + 3*row = midi
 * Prefers cells close to origin and within bounds
 */
function midiToGrid(midi: number): GridCell {
  const target = midi - 60; // 4*col + 3*row = target

  // Search for solutions within reasonable bounds
  let bestCell: GridCell = { row: 0, col: 0 };
  let bestDist = Infinity;

  for (let col = -9; col <= 11; col++) {
    // row = (target - 4*col) / 3
    const remainder = target - 4 * col;
    if (remainder % 3 === 0) {
      const row = remainder / 3;
      if (row >= -12 && row <= 15) {
        const dist = Math.abs(row) + Math.abs(col);
        if (dist < bestDist) {
          bestDist = dist;
          bestCell = { row, col };
        }
      }
    }
  }

  return bestCell;
}

/**
 * Find the root MIDI from chord pitches given the known root pitch class
 */
function findRootMidi(midiPitches: [number, number, number], rootPC: PitchClass): number {
  // Find the pitch that matches the root pitch class
  for (const pitch of midiPitches) {
    if (mod12(pitch) === rootPC) {
      return pitch;
    }
  }
  // Fallback to lowest note
  return Math.min(...midiPitches);
}

/**
 * Convert progression data to our path format
 */
function convertProgression(data: ProgressionData, index: number): Progression {
  const points: TrianglePathPoint[] = data.seq.map(([chordName, midiPitches]) => {
    const midi = midiPitches as [number, number, number];

    // Parse chord name to get root and type (don't guess from MIDI)
    const { rootPC, type } = parseChordName(chordName);

    // Find the actual root MIDI note from the pitches
    const rootMidi = findRootMidi(midi, rootPC);

    const rootCell = midiToGrid(rootMidi);

    const third = type === 'major' ? 4 : 3;
    const pitchClasses: [PitchClass, PitchClass, PitchClass] = [
      rootPC,
      mod12(rootPC + third) as PitchClass,
      mod12(rootPC + 7) as PitchClass,
    ];

    return {
      rootCell,
      type,
      rootPC,
      pitchClasses,
      midiPitches: midi,
    };
  });

  return {
    id: `preset-${index}`,
    name: data.name,
    mode: data.mode as 'C_major' | 'A_minor',
    points,
  };
}

// Convert all progressions
export const PROGRESSIONS: Progression[] = (progressionsData as ProgressionData[]).map(
  (data, index) => convertProgression(data, index)
);

// Helper to move a progression to the front by name substring
function prioritize(list: Progression[], nameSubstring: string): Progression[] {
  const idx = list.findIndex(p => p.name.includes(nameSubstring));
  if (idx > 0) {
    const [item] = list.splice(idx, 1);
    list.unshift(item);
  }
  return list;
}

// Group by mode and prioritize specific progressions
export const MAJOR_PROGRESSIONS = prioritize(
  PROGRESSIONS.filter(p => p.mode === 'C_major'),
  'Pachelbel'
);
export const MINOR_PROGRESSIONS = prioritize(
  PROGRESSIONS.filter(p => p.mode === 'A_minor'),
  'Hotel California'
);
