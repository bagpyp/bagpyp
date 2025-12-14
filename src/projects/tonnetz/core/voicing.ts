/**
 * Voicing utilities for MIDI pitch range constraints and chord voicing
 *
 * Supports the 88 piano keys (MIDI 21-108) as the canonical pitch domain,
 * with configurable subranges for practical use.
 */

import type { MidiRange } from '../state/types';
import {
  DEFAULT_MIDI_RANGE,
  MIDI_PIANO_MIN,
  MIDI_PIANO_MAX,
} from '../state/types';
import { mod12 } from './musicMath';

/**
 * Clamp a MIDI note to a valid range by octave shifting
 * Finds the closest valid octave for the pitch class within the range
 *
 * @param midi - MIDI note number to clamp
 * @param range - Valid MIDI range (defaults to 40-76)
 * @returns MIDI note number within range
 */
export function clampToRange(midi: number, range: MidiRange = DEFAULT_MIDI_RANGE): number {
  if (midi >= range.min && midi <= range.max) {
    return midi;
  }

  const pc = mod12(midi);

  // Find the best octave for this pitch class within range
  for (let octave = Math.floor(range.min / 12); octave <= Math.ceil(range.max / 12); octave++) {
    const candidate = pc + octave * 12;
    if (candidate >= range.min && candidate <= range.max) {
      return candidate;
    }
  }

  // Fallback: hard clamp (shouldn't happen with valid ranges)
  return Math.max(range.min, Math.min(range.max, midi));
}

/**
 * Clamp all notes in a chord to range, preserving voicing order where possible
 *
 * @param midiPitches - Array of MIDI note numbers
 * @param range - Valid MIDI range
 * @returns Array of clamped MIDI note numbers
 */
export function clampChordToRange(
  midiPitches: number[],
  range: MidiRange = DEFAULT_MIDI_RANGE
): number[] {
  return midiPitches.map(p => clampToRange(p, range));
}

/**
 * Validate that a range is sensible (at least one octave, within piano bounds)
 *
 * @param range - Range to validate
 * @returns Validated and clamped range
 */
export function validateRange(range: MidiRange): MidiRange {
  return {
    min: Math.max(MIDI_PIANO_MIN, Math.min(range.min, range.max - 12)),
    max: Math.min(MIDI_PIANO_MAX, Math.max(range.max, range.min + 12)),
  };
}

/**
 * Calculate optimal voicing for a chord given pitch classes and constraints
 *
 * @param pitchClasses - The pitch classes in the chord (0-11)
 * @param range - The valid MIDI range
 * @param bassHint - Optional MIDI pitch hint for the bass voice
 * @param topHint - Optional MIDI pitch hint for the top voice
 * @returns Array of MIDI pitches for the voiced chord
 */
export function voiceChord(
  pitchClasses: number[],
  range: MidiRange = DEFAULT_MIDI_RANGE,
  bassHint?: number,
  topHint?: number
): number[] {
  if (pitchClasses.length === 0) return [];

  const pcs = [...pitchClasses];
  const result: number[] = [];

  // Determine bass note
  let bassNote: number;
  if (bassHint !== undefined) {
    // Use provided bass hint, clamped to range
    bassNote = clampToRange(bassHint, range);
  } else {
    // Default: place bass (first pc) in lower third of range
    const targetBass = range.min + Math.floor((range.max - range.min) / 3);
    const bassPc = pcs[0];
    // Find the octave that puts this pc near targetBass
    bassNote = bassPc + Math.floor(targetBass / 12) * 12;
    if (bassNote < range.min) bassNote += 12;
    if (bassNote > range.max) bassNote -= 12;
    bassNote = clampToRange(bassNote, range);
  }
  result.push(bassNote);

  // Voice remaining notes above bass in ascending order
  const remainingPCs = pcs.slice(1);
  for (const pc of remainingPCs) {
    // Place each note in the octave at or above the previous note
    const prevNote = result[result.length - 1];
    let note = pc + Math.floor(prevNote / 12) * 12;

    // Ensure it's above the previous note
    if (note <= prevNote) {
      note += 12;
    }

    // Clamp to range
    result.push(clampToRange(note, range));
  }

  // If top hint provided and matches a pitch class, adjust that voice
  if (topHint !== undefined && result.length > 1) {
    const topPC = mod12(topHint);
    // Find which result index has this pitch class (prefer higher indices)
    for (let i = result.length - 1; i >= 1; i--) {
      if (mod12(result[i]) === topPC) {
        result[i] = clampToRange(topHint, range);
        break;
      }
    }
  }

  return result;
}

/**
 * Voice a chord with smooth voice leading from a previous chord
 * Minimizes total voice motion while respecting range constraints
 *
 * @param pitchClasses - Pitch classes for the new chord
 * @param previousVoicing - MIDI pitches from previous chord
 * @param range - Valid MIDI range
 * @returns MIDI pitches for the new chord with smooth voice leading
 */
export function voiceChordSmooth(
  pitchClasses: number[],
  previousVoicing: number[],
  range: MidiRange = DEFAULT_MIDI_RANGE
): number[] {
  if (pitchClasses.length === 0) return [];
  if (previousVoicing.length === 0) {
    return voiceChord(pitchClasses, range);
  }

  const result: number[] = [];
  const usedPcs = new Set<number>();

  // For each voice in the previous chord, find the closest note in the new chord
  for (let i = 0; i < Math.max(pitchClasses.length, previousVoicing.length); i++) {
    const prevNote = previousVoicing[i] ?? previousVoicing[previousVoicing.length - 1];

    // Find the unused pitch class closest to prevNote
    let bestPc = -1;
    let bestDist = Infinity;

    for (const pc of pitchClasses) {
      if (usedPcs.has(pc)) continue;

      // Find the closest octave of this pc to prevNote
      const candidate = pc + Math.round((prevNote - pc) / 12) * 12;
      const dist = Math.abs(candidate - prevNote);

      if (dist < bestDist) {
        bestDist = dist;
        bestPc = pc;
      }
    }

    if (bestPc >= 0) {
      usedPcs.add(bestPc);
      const note = bestPc + Math.round((prevNote - bestPc) / 12) * 12;
      result.push(clampToRange(note, range));
    }
  }

  // Sort to maintain bass-to-treble ordering
  result.sort((a, b) => a - b);

  return result;
}
