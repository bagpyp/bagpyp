/**
 * Chords - General chord voicing generation supporting multiple chord types
 */

import { nameToPc, pcToDisplayName, buildFretboard, normalizeToSharp } from './core';
import type { NoteName } from './types';
import { MAJOR_TRIAD_POSITIONS } from './major-triad-data';
import {
  ChordType,
  buildChord,
  getChordNotes,
  getChordName,
  isValidChordVoicing,
  transformChordType,
} from './chord-types';
import {
  TriadVoicing,
  StringGroupTriads,
  identifyInversion,
  InversionType,
} from './triads';

/**
 * Extended chord data structure that includes chord type
 */
export interface ChordData {
  key: NoteName;
  chordType: ChordType;
  chordName: string; // e.g., "Cm", "G7"
  chordNotes: string[]; // e.g., ["C", "E♭", "G"]
  stringGroups: StringGroupTriads[]; // 4 groups with voicings
}

const MAX_FRET = 18;

function findNearestFretForPitchClass(
  currentFret: number,
  stringIdx: number,
  targetPitchClass: number,
  fretboard: Record<number, Record<number, number>>
): number | null {
  let bestFret: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let candidateFret = 0; candidateFret <= MAX_FRET; candidateFret++) {
    if (fretboard[stringIdx][candidateFret] !== targetPitchClass) {
      continue;
    }
    const distance = Math.abs(candidateFret - currentFret);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestFret = candidateFret;
    }
  }

  return bestFret;
}

function replaceChordToneWithNearestTarget(
  frets: number[],
  strings: number[],
  sourcePitchClass: number,
  targetPitchClass: number,
  fretboard: Record<number, Record<number, number>>
): number[] | null {
  let bestIndex = -1;
  let bestFret = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < frets.length; i++) {
    const currentPitchClass = fretboard[strings[i]][frets[i]];
    if (currentPitchClass !== sourcePitchClass) {
      continue;
    }

    const candidateFret = findNearestFretForPitchClass(frets[i], strings[i], targetPitchClass, fretboard);
    if (candidateFret === null) {
      continue;
    }

    const distance = Math.abs(candidateFret - frets[i]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
      bestFret = candidateFret;
    }
  }

  if (bestIndex === -1) {
    return null;
  }

  const transformed = [...frets];
  transformed[bestIndex] = bestFret;
  return transformed;
}

function transformToShellChordType(
  majorFrets: number[],
  strings: number[],
  rootName: NoteName,
  targetChordType: '7' | 'min7' | 'maj7',
  fretboard: Record<number, Record<number, number>>
): number[] | null {
  const majorChord = buildChord(rootName, 'major');
  const perfectFifth = majorChord[2];

  if (targetChordType === '7') {
    const dominantSeventh = buildChord(rootName, '7')[3];
    return replaceChordToneWithNearestTarget(
      majorFrets,
      strings,
      perfectFifth,
      dominantSeventh,
      fretboard
    );
  }

  if (targetChordType === 'maj7') {
    const majorSeventh = buildChord(rootName, 'maj7')[3];
    return replaceChordToneWithNearestTarget(
      majorFrets,
      strings,
      perfectFifth,
      majorSeventh,
      fretboard
    );
  }

  // min7: major -> minor triad, then replace 5 with b7
  const minorFrets = transformChordType(majorFrets, strings, rootName, 'minor', fretboard);
  if (!minorFrets) {
    return null;
  }

  const minorSeventh = buildChord(rootName, 'min7')[3];
  return replaceChordToneWithNearestTarget(
    minorFrets,
    strings,
    perfectFifth,
    minorSeventh,
    fretboard
  );
}

/**
 * Generate chord voicings for a given key and chord type
 * Currently supports major and minor triads, with more types coming
 * @param key The root note
 * @param chordType The type of chord
 * @returns Chord voicing data or null if not supported
 */
export function generateChordData(key: NoteName, chordType: ChordType): ChordData | null {
  const chordPcs = buildChord(key, chordType);
  const chordNotes = getChordNotes(key, chordType);
  const chordName = getChordName(key, chordType);
  const fretboard = buildFretboard();

  // Normalize key to sharp for lookup in MAJOR_TRIAD_POSITIONS
  const sharpKey = normalizeToSharp(key);

  // For major chords, use the existing hard-coded positions
  if (chordType === 'major' && MAJOR_TRIAD_POSITIONS[sharpKey]) {
    const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringGroupsData: Array<[number, number, number]> = [
      [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
    ];

    const stringGroups: StringGroupTriads[] = stringGroupsData.map((stringGroupIndices, groupIdx) => {
      const groupKey = `G${groupIdx}`;
      const hardCodedVoicings = MAJOR_TRIAD_POSITIONS[sharpKey][groupKey];

      const voicings: TriadVoicing[] = hardCodedVoicings.map((hc: any) => {
        const notes = hc.frets.map((fret: number, idx: number) =>
          fretboard[stringGroupIndices[idx]][fret]
        );
        const noteNames = notes.map((pc: number) => pcToDisplayName(pc, key));
        const avgFret = hc.frets.reduce((sum: number, f: number) => sum + f, 0) / 3;

        return {
          position: hc.pos,
          strings: [...stringGroupIndices],
          frets: [...hc.frets],
          notes,
          noteNames,
          inversion: hc.inv as InversionType,
          avgFret,
        };
      });

      return {
        strings: [...stringGroupIndices],
        stringNames: stringGroupIndices.map(idx => STRING_NAMES[idx]),
        voicings,
      };
    });

    return {
      key,
      chordType,
      chordName,
      chordNotes,
      stringGroups,
    };
  }

  // For minor, dim, and aug chords, transform from major positions
  const transformableTypes: ChordType[] = ['minor', 'dim', 'aug'];
  if (transformableTypes.includes(chordType) && MAJOR_TRIAD_POSITIONS[sharpKey]) {
    const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringGroupsData: Array<[number, number, number]> = [
      [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
    ];

    const stringGroups: StringGroupTriads[] = [];

    for (let groupIdx = 0; groupIdx < stringGroupsData.length; groupIdx++) {
      const stringGroupIndices = stringGroupsData[groupIdx];
      const groupKey = `G${groupIdx}`;
      const majorVoicings = MAJOR_TRIAD_POSITIONS[sharpKey][groupKey];

      const transformedVoicings: TriadVoicing[] = [];

      for (const majorVoicing of majorVoicings) {
        // Try to transform this major voicing to the target chord type
        const newFrets = transformChordType(
          majorVoicing.frets,
          stringGroupIndices,
          key,
          chordType,
          fretboard
        );

        if (newFrets === null) {
          // Can't transform this voicing (e.g., open string or fret limit)
          continue;
        }

        // Calculate the new voicing properties
        const notes = newFrets.map((fret, idx) =>
          fretboard[stringGroupIndices[idx]][fret]
        );

        // Verify this is a valid chord voicing
        if (!isValidChordVoicing(notes, chordPcs)) {
          continue;
        }

        const noteNames = notes.map(pc => pcToDisplayName(pc, key));
        const avgFret = newFrets.reduce((sum, f) => sum + f, 0) / 3;
        const inversion = identifyInversion(notes, chordPcs as [number, number, number]);

        transformedVoicings.push({
          position: majorVoicing.pos,
          strings: [...stringGroupIndices],
          frets: newFrets,
          notes,
          noteNames,
          inversion,
          avgFret,
        });
      }

      // If we have at least some voicings for this group, add it
      if (transformedVoicings.length > 0) {
        // Renumber positions to be consecutive
        transformedVoicings.sort((a, b) => a.avgFret - b.avgFret);
        transformedVoicings.forEach((v, idx) => {
          v.position = idx;
        });

        stringGroups.push({
          strings: [...stringGroupIndices],
          stringNames: stringGroupIndices.map(idx => STRING_NAMES[idx]),
          voicings: transformedVoicings,
        });
      }
    }

    if (stringGroups.length > 0) {
      return {
        key,
        chordType,
        chordName,
        chordNotes,
        stringGroups,
      };
    }
  }

  // For shell-style seventh chords, transform the triad framework:
  // R-3-5 -> R-3-b7 / R-b3-b7 / R-3-7
  const shellChordTypes: ChordType[] = ['7', 'min7', 'maj7'];
  if (shellChordTypes.includes(chordType) && MAJOR_TRIAD_POSITIONS[sharpKey]) {
    const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringGroupsData: Array<[number, number, number]> = [
      [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
    ];

    const stringGroups: StringGroupTriads[] = [];
    const expectedShellPitchClasses = chordType === '7'
      ? [chordPcs[0], chordPcs[1], chordPcs[3]]
      : chordType === 'min7'
        ? [chordPcs[0], chordPcs[1], chordPcs[3]]
        : [chordPcs[0], chordPcs[1], chordPcs[3]];

    for (let groupIdx = 0; groupIdx < stringGroupsData.length; groupIdx++) {
      const stringGroupIndices = stringGroupsData[groupIdx];
      const groupKey = `G${groupIdx}`;
      const majorVoicings = MAJOR_TRIAD_POSITIONS[sharpKey][groupKey];
      const transformedVoicings: TriadVoicing[] = [];

      for (const majorVoicing of majorVoicings) {
        const newFrets = transformToShellChordType(
          majorVoicing.frets,
          stringGroupIndices,
          key,
          chordType as '7' | 'min7' | 'maj7',
          fretboard
        );

        if (newFrets === null) {
          continue;
        }

        const notes = newFrets.map((fret, idx) => fretboard[stringGroupIndices[idx]][fret]);

        if (!isValidChordVoicing(notes, expectedShellPitchClasses)) {
          continue;
        }

        const noteNames = notes.map(pc => pcToDisplayName(pc, key));
        const avgFret = newFrets.reduce((sum, f) => sum + f, 0) / 3;
        const inversion = identifyInversion(
          notes,
          [expectedShellPitchClasses[0], expectedShellPitchClasses[1], expectedShellPitchClasses[2]]
        );

        transformedVoicings.push({
          position: majorVoicing.pos,
          strings: [...stringGroupIndices],
          frets: newFrets,
          notes,
          noteNames,
          inversion,
          avgFret,
        });
      }

      if (transformedVoicings.length > 0) {
        transformedVoicings.sort((a, b) => a.avgFret - b.avgFret);
        transformedVoicings.forEach((v, idx) => {
          v.position = idx;
        });

        stringGroups.push({
          strings: [...stringGroupIndices],
          stringNames: stringGroupIndices.map(idx => STRING_NAMES[idx]),
          voicings: transformedVoicings,
        });
      }
    }

    if (stringGroups.length > 0) {
      return {
        key,
        chordType,
        chordName,
        chordNotes,
        stringGroups,
      };
    }
  }

  // Chord type not yet supported
  return null;
}

/**
 * Get all keys that support a given chord type
 * @param chordType The chord type to check
 * @returns Array of keys that have voicings for this chord type
 */
export function getSupportedKeys(chordType: ChordType): NoteName[] {
  if (chordType === 'major') {
    return Object.keys(MAJOR_TRIAD_POSITIONS) as NoteName[];
  }

  // For transformed/shell chord types, check which major keys can be transformed
  if (['minor', 'dim', 'aug', '7', 'min7', 'maj7'].includes(chordType)) {
    const supportedKeys: NoteName[] = [];
    const allKeys = Object.keys(MAJOR_TRIAD_POSITIONS) as NoteName[];

    for (const key of allKeys) {
      const chordData = generateChordData(key, chordType);
      if (chordData && chordData.stringGroups.length === 4) {
        // Only consider it fully supported if all 4 groups have voicings
        const allGroupsHaveVoicings = chordData.stringGroups.every(
          group => group.voicings.length > 0
        );
        if (allGroupsHaveVoicings) {
          supportedKeys.push(key);
        }
      }
    }

    return supportedKeys;
  }

  // Other chord types not yet supported
  return [];
}

/**
 * Debug function to show which positions can't be transformed to minor
 * @param key The root note
 */
export function debugMinorTransformations(key: NoteName): void {
  console.log(`\n=== Minor Transformation Analysis for ${key} ===`);

  const sharpKey = normalizeToSharp(key);
  const majorChord = buildChord(key, 'major');
  const minorChord = buildChord(key, 'minor');
  const fretboard = buildFretboard();

  const stringGroupsData: Array<[number, number, number]> = [
    [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
  ];

  const groupNames = ['E-A-D', 'A-D-G', 'D-G-B', 'G-B-E'];

  if (!MAJOR_TRIAD_POSITIONS[sharpKey]) {
    console.log(`No major positions defined for ${key}`);
    return;
  }

  for (let groupIdx = 0; groupIdx < 4; groupIdx++) {
    console.log(`\nGroup ${groupIdx} (${groupNames[groupIdx]}):`);
    const groupKey = `G${groupIdx}`;
    const majorVoicings = MAJOR_TRIAD_POSITIONS[sharpKey][groupKey];
    const strings = stringGroupsData[groupIdx];

    for (const voicing of majorVoicings) {
      const hasOpenThird = voicing.frets.some((fret: number, idx: number) => {
        const note = fretboard[strings[idx]][fret];
        return note === majorChord[1] && fret === 0;
      });

      if (hasOpenThird) {
        console.log(
          `  Position ${voicing.pos}: [${voicing.frets.join(', ')}] - ` +
          `CANNOT transform (has open string major third)`
        );
      } else {
        const minorFrets = transformChordType(
          voicing.frets,
          strings,
          key,
          'minor',
          fretboard
        );
        if (minorFrets) {
          console.log(
            `  Position ${voicing.pos}: [${voicing.frets.join(', ')}] → ` +
            `[${minorFrets.join(', ')}] ✓`
          );
        } else {
          console.log(
            `  Position ${voicing.pos}: [${voicing.frets.join(', ')}] - ` +
            `transformation failed`
          );
        }
      }
    }
  }
}
