// Core guitar logic ported from Python

import {
  NOTE_NAMES_SHARP,
  MODE_TO_START,
  MODE_OFFSETS,
  STRING_TUNING_MIDI,
  STRING_NAMES,
  STRING_ORDINALS,
  XYZ_BASE,
  WINDOW_LEN,
} from "./constants";
import type { Mode, XYZSymbol, Position, XYZPosition } from "./types";

// Map flat note names to their sharp equivalents
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Fb': 'E',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'Cb': 'B',
};

/**
 * Normalize a note name to its sharp equivalent
 * @param name Note name (e.g., "Db", "C#", "C")
 * @returns Sharp equivalent (e.g., "C#", "C#", "C")
 */
export function normalizeToSharp(name: string): string {
  return FLAT_TO_SHARP[name] ?? name;
}

export function nameToPc(name: string): number {
  // Normalize flats to sharps for lookup
  const normalizedName = normalizeToSharp(name);
  return NOTE_NAMES_SHARP.indexOf(normalizedName);
}

export function pcToSharpName(pc: number): string {
  return NOTE_NAMES_SHARP[pc % 12];
}

// Note names using sharps
const NOTE_NAMES_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note names using flats
const NOTE_NAMES_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Keys that use flats in their key signature (flat side of circle of fifths)
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']);

/**
 * Determine if a key uses flats or sharps for accidentals
 * Sharp keys: C, G, D, A, E, B, F#
 * Flat keys: F, Bb, Eb, Ab, Db (and Gb for completeness)
 */
export function keyUsesFlats(key: string): boolean {
  // Normalize the key name (handle both sharp and flat input)
  const normalizedKey = normalizeToSharp(key);
  // F, Bb, Eb, Ab, Db (as A#, D#, G#, C# in sharp notation) use flats
  // Also keep Gb/F# as F# since that's the boundary key
  return FLAT_KEYS.has(key) ||
         (normalizedKey !== key && FLAT_KEYS.has(key)); // Key was input as flat
}

/**
 * Convert pitch class to display name
 * @param pc Pitch class (0-11)
 * @param key Optional key context to determine sharps vs flats
 *            Sharp keys (C,G,D,A,E,B,F#): use sharps
 *            Flat keys (F,Bb,Eb,Ab,Db): use flats
 */
export function pcToDisplayName(pc: number, key?: string): string {
  const useFlats = key ? keyUsesFlats(key) : false;
  const noteNames = useFlats ? NOTE_NAMES_FLATS : NOTE_NAMES_SHARPS;
  return noteNames[pc % 12];
}

export function midiToPc(midiNote: number): number {
  return midiNote % 12;
}

export function parentMajor(mode: Mode, tonic: string): string {
  const tonicPc = nameToPc(tonic);
  const offset = MODE_OFFSETS[mode];
  const parentPc = (tonicPc - offset + 12) % 12;
  return pcToSharpName(parentPc);
}

export function buildFretboard(): Record<number, Record<number, number>> {
  const fretboard: Record<number, Record<number, number>> = {};

  for (let stringIdx = 0; stringIdx < STRING_TUNING_MIDI.length; stringIdx++) {
    fretboard[stringIdx] = {};
    const openMidi = STRING_TUNING_MIDI[stringIdx];

    for (let fret = 0; fret <= 20; fret++) {
      const midiNote = openMidi + fret;
      const pitchClass = midiToPc(midiNote);
      fretboard[stringIdx][fret] = pitchClass;
    }
  }

  return fretboard;
}

export function findBestPosition(
  note: string,
  targetFret: number,
  fretboard: Record<number, Record<number, number>>
): Position {
  const targetPc = nameToPc(note);
  const candidates: Array<[number, number, number]> = [];

  // Find all positions that produce the target note
  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    for (let fret = 0; fret <= 20; fret++) {
      if (fretboard[stringIdx][fret] === targetPc) {
        const distance = Math.abs(fret - targetFret);
        candidates.push([distance, fret, stringIdx]);
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error(`Note ${note} not found on fretboard`);
  }

  // Sort by: distance (asc), string_index (asc for deeper strings), fret (asc)
  candidates.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0]; // distance
    if (a[2] !== b[2]) return a[2] - b[2]; // string index
    return a[1] - b[1]; // fret
  });

  const [distance, fret, stringIdx] = candidates[0];
  const stringName = STRING_NAMES[stringIdx];

  return {
    stringIndex: stringIdx,
    stringName,
    fret,
    distance,
  };
}

export function stringIndexToOrdinal(stringIdx: number): string {
  return STRING_ORDINALS[stringIdx];
}

export function xyzWindowForMode(mode: Mode): XYZSymbol[] {
  const start = MODE_TO_START[mode];
  return Array.from({ length: WINDOW_LEN }, (_, i) => XYZ_BASE[(start + i) % 7]) as XYZSymbol[];
}

export function getXyzDisplayString(mode: Mode): string {
  return xyzWindowForMode(mode).join("");
}

export function planXyzPositions(
  mode: Mode,
  startStringIdx: number,
  startFret: number
): XYZPosition[] {
  const symbols = xyzWindowForMode(mode);
  const frets: (number | null)[] = Array(6).fill(null);
  frets[startStringIdx] = startFret;

  // Work backwards from start_string to string 6
  let currentFret = startFret;
  for (let i = startStringIdx - 1; i >= 0; i--) {
    const prevSymbol = symbols[i + 1];
    const currSymbol = symbols[i];

    // Reverse of X→Y shift: Y→X means +1 fret
    if (prevSymbol === "Y" && currSymbol === "X") {
      currentFret += 1;
    }

    // Reverse of G→B shift: B→G (index 4→3) means +1 fret
    if (i === 3 && (i + 1) === 4) {
      currentFret += 1;
    }

    frets[i] = currentFret;
  }

  // Work forwards from start_string to string 1
  currentFret = startFret;
  for (let i = startStringIdx + 1; i < 6; i++) {
    const prevSymbol = symbols[i - 1];
    const currSymbol = symbols[i];

    // X → Y transition shift
    if (prevSymbol === "X" && currSymbol === "Y") {
      currentFret -= 1;
    }

    // G → B string shift (indices 3 → 4)
    if ((i - 1) === 3 && i === 4) {
      currentFret -= 1;
    }

    frets[i] = currentFret;
  }

  // Build the plan
  return frets.map((fret, i) => ({
    stringIndex: i,
    fret: fret!,
    symbol: symbols[i],
  }));
}
