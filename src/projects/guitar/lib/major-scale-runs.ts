import {
  MAJOR_2NPS_STRING_INDEX_BY_BOX,
  getPitchClass,
  normalizeMajorKeyName,
} from './box-shapes';

export type LaunchCount = 1 | 2 | 3;

export const MAJOR_MODE_DEFINITIONS = [
  {
    name: 'Ionian',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '4', '5', '6', '7'],
    colorNote: 'natural 7',
    family: 'major',
  },
  {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degreeLabels: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    colorNote: 'natural 6',
    family: 'minor',
  },
  {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degreeLabels: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    colorNote: 'flat 2',
    family: 'minor',
  },
  {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '#4', '5', '6', '7'],
    colorNote: 'sharp 4',
    family: 'major',
  },
  {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degreeLabels: ['1', '2', '3', '4', '5', '6', 'b7'],
    colorNote: 'flat 7',
    family: 'major',
  },
  {
    name: 'Aeolian',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeLabels: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    colorNote: 'flat 6',
    family: 'minor',
  },
  {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degreeLabels: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    colorNote: 'flat 2 + flat 5',
    family: 'diminished',
  },
] as const;

export type MajorModeName = (typeof MAJOR_MODE_DEFINITIONS)[number]['name'];

const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64] as const;

const MAJOR_SCALE_SPELLINGS: Record<string, readonly string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
};

export interface MajorScaleRouteNote {
  step: number;
  midi: number;
  pitchClass: number;
  noteName: string;
  degree: number;
  degreeLabel: string;
  stringIndex: number;
  stringNumber: number;
  fret: number;
  octave: number;
  isTonic: boolean;
}

export interface MajorScaleRoute {
  id: string;
  parentKey: string;
  modeIndex: number;
  modeName: MajorModeName;
  tonicName: string;
  tonicPitchClass: number;
  modeFamily: string;
  colorNote: string;
  degreeLabels: readonly string[];
  launchCount: LaunchCount;
  stringLoads: readonly number[];
  hostModeIndex: number;
  hostModeName: MajorModeName;
  hostTonicName: string;
  startFret: number;
  fretMin: number;
  fretMax: number;
  notes: MajorScaleRouteNote[];
  pattern: number[][];
  rootPositions: [number, number][];
}

export interface MajorScaleModeRoutes {
  modeIndex: number;
  modeName: MajorModeName;
  tonicName: string;
  tonicPitchClass: number;
  routes: MajorScaleRoute[];
}

function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function rotate<T>(values: readonly T[], start: number): T[] {
  return values.map((_, index) => values[(start + index) % values.length]);
}

function getMajorScaleNotes(parentKey: string): readonly string[] {
  const normalized = normalizeMajorKeyName(parentKey);
  return MAJOR_SCALE_SPELLINGS[normalized] ?? MAJOR_SCALE_SPELLINGS.C;
}

function getRouteMidis(rootMidi: number, modeIndex: number): number[] {
  const intervals = MAJOR_MODE_DEFINITIONS[modeIndex].intervals;
  return Array.from({ length: 15 }, (_, stepIndex) => (
    rootMidi + intervals[stepIndex % 7] + (Math.floor(stepIndex / 7) * 12)
  ));
}

/**
 * A displayed major box contains 17 notes: three per string except for one
 * interior 2NPS string, with identical low- and high-E fret maps. Starting on
 * slot 3, 2, or 1 of low E therefore creates 1-, 2-, or 3-note launches, while
 * the matching tonic on high E lands in slot 3, 2, or 1.
 */
export function getRouteStringLoads(
  hostModeIndex: number,
  launchCount: LaunchCount
): readonly number[] {
  const loads = [launchCount, 3, 3, 3, 3, 0];
  const twoNpsStringIndex = MAJOR_2NPS_STRING_INDEX_BY_BOX[mod(hostModeIndex, 7)];
  loads[twoNpsStringIndex] = 2;
  loads[5] = 15 - loads.slice(0, 5).reduce((sum, count) => sum + count, 0);
  return loads;
}

function layRouteOnStrings(
  rootMidi: number,
  modeIndex: number,
  launchCount: LaunchCount
): Array<{ midi: number; stringIndex: number; fret: number }> {
  const midis = getRouteMidis(rootMidi, modeIndex);
  const hostModeIndex = mod(modeIndex + launchCount - 3, 7);
  const loads = getRouteStringLoads(hostModeIndex, launchCount);
  let stepIndex = 0;
  const positions: Array<{ midi: number; stringIndex: number; fret: number }> = [];

  loads.forEach((noteCount, stringIndex) => {
    for (let noteIndex = 0; noteIndex < noteCount; noteIndex++) {
      const midi = midis[stepIndex];
      positions.push({
        midi,
        stringIndex,
        fret: midi - STANDARD_TUNING_MIDI[stringIndex],
      });
      stepIndex += 1;
    }
  });

  return positions;
}

function routeFitsFretboard(
  rootMidi: number,
  modeIndex: number,
  launchCount: LaunchCount
): boolean {
  const positions = layRouteOnStrings(rootMidi, modeIndex, launchCount);
  return positions.length === 15 && positions.every(({ fret }) => fret >= 0 && fret <= 24);
}

/**
 * Pick one low-E register that keeps all three launches playable. Low modal
 * roots such as E, F and F# move to the next octave because their next scale
 * tone would otherwise fall below the open A string at the first crossing.
 */
export function findSharedLowERootFret(tonicPitchClass: number, modeIndex: number): number {
  const baseFret = mod(tonicPitchClass - (STANDARD_TUNING_MIDI[0] % 12), 12);
  const candidates = [baseFret, baseFret + 12].filter((fret) => fret <= 24);

  const match = candidates.find((fret) => {
    const rootMidi = STANDARD_TUNING_MIDI[0] + fret;
    return ([1, 2, 3] as LaunchCount[]).every((launchCount) => (
      routeFitsFretboard(rootMidi, modeIndex, launchCount)
    ));
  });

  if (match === undefined) {
    throw new Error(`No playable two-octave route for pitch class ${tonicPitchClass}`);
  }

  return match;
}

export function generateMajorScaleRoute(
  parentKey: string,
  modeIndex: number,
  launchCount: LaunchCount
): MajorScaleRoute {
  const normalizedKey = normalizeMajorKeyName(parentKey);
  const majorScaleNotes = getMajorScaleNotes(normalizedKey);
  const normalizedModeIndex = mod(modeIndex, 7);
  const definition = MAJOR_MODE_DEFINITIONS[normalizedModeIndex];
  const modalNotes = rotate(majorScaleNotes, normalizedModeIndex);
  const tonicName = modalNotes[0];
  const tonicPitchClass = getPitchClass(tonicName);
  const startFret = findSharedLowERootFret(tonicPitchClass, normalizedModeIndex);
  const rootMidi = STANDARD_TUNING_MIDI[0] + startFret;
  const positions = layRouteOnStrings(rootMidi, normalizedModeIndex, launchCount);
  const hostModeIndex = mod(normalizedModeIndex + launchCount - 3, 7);
  const hostDefinition = MAJOR_MODE_DEFINITIONS[hostModeIndex];
  const stringLoads = getRouteStringLoads(hostModeIndex, launchCount);

  const notes: MajorScaleRouteNote[] = positions.map((position, stepIndex) => {
    const degreeIndex = stepIndex % 7;
    return {
      step: stepIndex + 1,
      midi: position.midi,
      pitchClass: mod(position.midi, 12),
      noteName: modalNotes[degreeIndex],
      degree: degreeIndex + 1,
      degreeLabel: definition.degreeLabels[degreeIndex],
      stringIndex: position.stringIndex,
      stringNumber: 6 - position.stringIndex,
      fret: position.fret,
      octave: Math.floor(position.midi / 12) - 1,
      isTonic: stepIndex === 0 || stepIndex === 7 || stepIndex === 14,
    };
  });

  const pattern = Array.from({ length: 6 }, () => [] as number[]);
  notes.forEach((note) => pattern[note.stringIndex].push(note.fret));
  const rootPositions = notes
    .filter((note) => note.isTonic)
    .map((note) => [note.stringIndex, note.fret] as [number, number]);
  const frets = notes.map((note) => note.fret);

  return {
    id: `${normalizedKey.toLowerCase().replace('#', 's')}-${definition.name.toLowerCase()}-${launchCount}`,
    parentKey: normalizedKey,
    modeIndex: normalizedModeIndex,
    modeName: definition.name,
    tonicName,
    tonicPitchClass,
    modeFamily: definition.family,
    colorNote: definition.colorNote,
    degreeLabels: definition.degreeLabels,
    launchCount,
    stringLoads,
    hostModeIndex,
    hostModeName: hostDefinition.name,
    hostTonicName: majorScaleNotes[hostModeIndex],
    startFret,
    fretMin: Math.min(...frets),
    fretMax: Math.max(...frets),
    notes,
    pattern,
    rootPositions,
  };
}

export function generateMajorScaleModeRoutes(parentKey: string): MajorScaleModeRoutes[] {
  const normalizedKey = normalizeMajorKeyName(parentKey);
  const scaleNotes = getMajorScaleNotes(normalizedKey);

  return MAJOR_MODE_DEFINITIONS.map((definition, modeIndex) => ({
    modeIndex,
    modeName: definition.name,
    tonicName: scaleNotes[modeIndex],
    tonicPitchClass: getPitchClass(scaleNotes[modeIndex]),
    routes: ([1, 2, 3] as LaunchCount[]).map((launchCount) => (
      generateMajorScaleRoute(normalizedKey, modeIndex, launchCount)
    )),
  }));
}

export function formatRouteSequence(route: MajorScaleRoute): string {
  return route.notes
    .map((note) => `s${note.stringNumber}f${note.fret}`)
    .join(' · ');
}

export function formatRouteByString(route: MajorScaleRoute): string[] {
  return route.pattern
    .map((frets, stringIndex) => `s${6 - stringIndex}: ${frets.join('–')}`)
    .filter((entry) => !entry.endsWith(': '));
}
