import type { TrianglePathPoint, GridCell, PitchClass, MidiRange } from '../state/types';
import { DEFAULT_MIDI_RANGE } from '../state/types';
import { mod12 } from '../core/musicMath';
import {
  parseChordSymbol,
  getPitchClassesForChord,
  getDisplayType,
} from '../core/chordParser';
import { voiceChord, voiceChordSmooth } from '../core/voicing';
import progressionsData from './triad_progressions_C_and_Am.json';

// =============================================================================
// New JSON format (with metadata)
// =============================================================================

/**
 * Raw progression data from JSON
 */
export interface ProgressionJsonData {
  name: string;
  chords: string[];
  source?: string;
  genre?: string;
  tags?: string[];
  mode?: 'major' | 'minor';
  originalKey?: string;
  bassLineMidi?: (number | null)[];
  topLineMidi?: (number | null)[];
}

/**
 * Processed progression with computed path points
 */
export interface Progression {
  id: string;
  name: string;
  chords: string[];           // Original chord symbols
  source?: string;            // Description/origin
  genre?: string;             // Genre category
  tags: string[];             // Searchable tags
  mode: 'major' | 'minor';    // Tonal center
  originalKey?: string;       // Original key before normalization
  points: TrianglePathPoint[];
}

// =============================================================================
// Available genres and tags (computed from data)
// =============================================================================

export const ALL_GENRES: string[] = [];
export const ALL_TAGS: string[] = [];

// =============================================================================
// Grid/MIDI utilities
// =============================================================================

/**
 * Target center MIDI pitch (middle C = 60)
 * All progressions will be shifted to center around this
 */
const CENTER_MIDI = 60;

/**
 * Find grid cell for a given MIDI pitch
 * Solves: 60 + 4*col + 3*row = midi
 * Prefers cells close to origin and within bounds
 */
function midiToGrid(midi: number): GridCell {
  const target = midi - 60; // 4*col + 3*row = target

  let bestCell: GridCell = { row: 0, col: 0 };
  let bestDist = Infinity;

  for (let col = -9; col <= 11; col++) {
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
 * Center a progression's MIDI pitches around CENTER_MIDI (60)
 * Shifts all pitches by whole octaves so the average pitch is close to 60
 */
function centerProgression(points: TrianglePathPoint[]): TrianglePathPoint[] {
  if (points.length === 0) return points;

  // Calculate average MIDI pitch across all notes
  let totalPitch = 0;
  let noteCount = 0;

  for (const point of points) {
    for (const midi of point.midiPitches) {
      totalPitch += midi;
      noteCount++;
    }
    if (point.seventhMidiPitch !== undefined) {
      totalPitch += point.seventhMidiPitch;
      noteCount++;
    }
  }

  const avgPitch = totalPitch / noteCount;

  // Calculate octave shift needed (in semitones, multiple of 12)
  const octaveShift = Math.round((CENTER_MIDI - avgPitch) / 12) * 12;

  // If shift is 0, no change needed
  if (octaveShift === 0) return points;

  // Apply shift to all pitches and recalculate grid cells
  return points.map(point => {
    const newMidiPitches: [number, number, number] = [
      point.midiPitches[0] + octaveShift,
      point.midiPitches[1] + octaveShift,
      point.midiPitches[2] + octaveShift,
    ];

    // Find new root cell based on shifted bass note
    const rootMidi = newMidiPitches[0];
    const rootCell = midiToGrid(rootMidi);

    const newPoint: TrianglePathPoint = {
      ...point,
      rootCell,
      midiPitches: newMidiPitches,
    };

    // Shift 7th/6th pitch if present
    if (point.seventhMidiPitch !== undefined) {
      newPoint.seventhMidiPitch = point.seventhMidiPitch + octaveShift;
    }

    return newPoint;
  });
}

// =============================================================================
// Progression parsing
// =============================================================================

/**
 * Parse chord symbols into TrianglePathPoint array with voice leading
 */
function parseProgressionChords(
  chords: string[],
  bassHints?: (number | null)[],
  topHints?: (number | null)[],
  range: MidiRange = DEFAULT_MIDI_RANGE
): TrianglePathPoint[] {
  const points: TrianglePathPoint[] = [];
  let previousVoicing: number[] | undefined;

  for (let i = 0; i < chords.length; i++) {
    const chordSymbol = chords[i];
    const parsed = parseChordSymbol(chordSymbol);

    // Get pitch classes for this chord
    const pitchClasses = getPitchClassesForChord(parsed);

    // Get display type for triangle rendering
    const displayType = getDisplayType(parsed);

    // Get voice-leading hints if available
    const bassHint = bassHints?.[i] ?? undefined;
    const topHint = topHints?.[i] ?? undefined;

    // Voice the chord
    let midiPitches: number[];
    if (previousVoicing && !bassHint && !topHint) {
      midiPitches = voiceChordSmooth(pitchClasses, previousVoicing, range);
    } else {
      midiPitches = voiceChord(pitchClasses, range, bassHint, topHint);
    }
    previousVoicing = midiPitches;

    // Find root MIDI (bass note if slash chord, otherwise first pitch class match)
    const rootMidi = parsed.bassPC !== undefined
      ? midiPitches.find(m => mod12(m) === parsed.bassPC) ?? midiPitches[0]
      : midiPitches.find(m => mod12(m) === parsed.rootPC) ?? midiPitches[0];

    const rootCell = midiToGrid(rootMidi);

    // Build pitch classes tuple (first 3 notes)
    const pitchClassesTuple: [PitchClass, PitchClass, PitchClass] = [
      pitchClasses[0],
      pitchClasses[1],
      pitchClasses[2],
    ];

    // Build MIDI pitches tuple
    const midiPitchesTuple: [number, number, number] = [
      midiPitches[0] ?? rootMidi,
      midiPitches[1] ?? rootMidi + 4,
      midiPitches[2] ?? rootMidi + 7,
    ];

    const point: TrianglePathPoint = {
      rootCell,
      type: displayType,
      rootPC: parsed.rootPC,
      pitchClasses: pitchClassesTuple,
      midiPitches: midiPitchesTuple,
    };

    // Add 7th chord properties if present
    if (parsed.seventhQuality && pitchClasses.length >= 4) {
      point.seventhQuality = parsed.seventhQuality;
      point.seventhPitchClass = pitchClasses[3];
      point.seventhMidiPitch = midiPitches[3];
    }

    points.push(point);
  }

  return points;
}

/**
 * Convert raw JSON data to Progression object
 */
function convertProgression(data: ProgressionJsonData, index: number): Progression {
  // Parse chords and apply centering so progression is near middle C
  const rawPoints = parseProgressionChords(
    data.chords,
    data.bassLineMidi,
    data.topLineMidi
  );
  const centeredPoints = centerProgression(rawPoints);

  return {
    id: `prog-${index}`,
    name: data.name,
    chords: data.chords,
    source: data.source,
    genre: data.genre,
    tags: data.tags ?? [],
    mode: data.mode ?? 'major',
    originalKey: data.originalKey,
    points: centeredPoints,
  };
}

// =============================================================================
// Load and export progressions
// =============================================================================

// Convert all progressions from JSON
export const PROGRESSIONS: Progression[] = (progressionsData as ProgressionJsonData[]).map(
  (data, index) => convertProgression(data, index)
);

// Build genre and tag lists
const genreSet = new Set<string>();
const tagSet = new Set<string>();

for (const prog of PROGRESSIONS) {
  if (prog.genre) genreSet.add(prog.genre);
  for (const tag of prog.tags) tagSet.add(tag);
}

// Sort and export
ALL_GENRES.push(...Array.from(genreSet).sort());
ALL_TAGS.push(...Array.from(tagSet).sort());

// =============================================================================
// Filter helpers
// =============================================================================

/**
 * Filter progressions by genre
 */
export function filterByGenre(genre: string | null): Progression[] {
  if (!genre) return PROGRESSIONS;
  return PROGRESSIONS.filter(p => p.genre === genre);
}

/**
 * Filter progressions by tag
 */
export function filterByTag(tag: string): Progression[] {
  return PROGRESSIONS.filter(p => p.tags.includes(tag));
}

/**
 * Filter progressions by mode
 */
export function filterByMode(mode: 'major' | 'minor'): Progression[] {
  return PROGRESSIONS.filter(p => p.mode === mode);
}

/**
 * Search progressions by name or tags
 */
export function searchProgressions(query: string): Progression[] {
  const lowerQuery = query.toLowerCase();
  return PROGRESSIONS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    p.source?.toLowerCase().includes(lowerQuery)
  );
}
