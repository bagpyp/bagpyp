/**
 * Major Triads - Voicing generation and utilities
 */

import { nameToPc, pcToDisplayName, buildFretboard } from './core';
import type { NoteName } from './types';
import { MAJOR_TRIAD_POSITIONS } from './major-triad-data';

export type InversionType = 'root' | 'first' | 'second' | 'unknown';

export interface TriadVoicing {
  position: number; // 0, 1, 2, or 3
  strings: number[]; // [low_string_idx, mid_string_idx, high_string_idx]
  frets: number[]; // [fret1, fret2, fret3]
  notes: number[]; // [pc1, pc2, pc3] - pitch classes
  noteNames: string[]; // ["C", "E", "G"]
  inversion: InversionType;
  avgFret: number;
}

export interface StringGroupTriads {
  strings: number[]; // [low_string_idx, mid_string_idx, high_string_idx]
  stringNames: string[]; // ["E", "A", "D"]
  voicings: TriadVoicing[]; // 4 positions
}

export interface TriadsData {
  key: NoteName;
  triadNotes: string[]; // ["C", "E", "G"] for C major
  stringGroups: StringGroupTriads[]; // 4 groups
}

/**
 * Build a major triad from the root note
 * @param rootName The root note name (e.g., "C", "D#")
 * @returns Array of 3 pitch classes [root, third, fifth]
 */
export function buildMajorTriad(rootName: NoteName): [number, number, number] {
  const rootPc = nameToPc(rootName);
  const thirdPc = (rootPc + 4) % 12; // Major third (4 semitones)
  const fifthPc = (rootPc + 7) % 12; // Perfect fifth (7 semitones)
  return [rootPc, thirdPc, fifthPc];
}

/**
 * Identify the inversion type based on the bass note
 * @param voicing The pitch classes in the voicing [low, mid, high]
 * @param triad The triad pitch classes [root, third, fifth]
 * @returns The inversion type
 */
export function identifyInversion(
  voicing: number[],
  triad: [number, number, number]
): InversionType {
  const bassNote = voicing[0]; // Lowest note determines the inversion
  const [root, third, fifth] = triad;

  if (bassNote === root) return 'root';
  if (bassNote === third) return 'first';
  if (bassNote === fifth) return 'second';
  return 'unknown';
}

/**
 * Find all valid triad voicings on a specific 3-string group
 * @param stringGroup Array of 3 string indices [low, mid, high]
 * @param triadPcs The triad pitch classes [root, third, fifth]
 * @param fretboard The fretboard mapping
 * @param maxStretch Maximum fret stretch (default 5)
 * @param maxFret Maximum fret number (default 18)
 * @param key Optional key for note name display (sharps vs flats)
 * @returns Array of valid voicings (without position numbers)
 */
export function findAllTriadVoicings(
  stringGroup: [number, number, number],
  triadPcs: [number, number, number],
  fretboard: Record<number, Record<number, number>>,
  maxStretch: number = 5,
  maxFret: number = 18,
  key?: string
): Omit<TriadVoicing, 'position'>[] {
  const voicings: Omit<TriadVoicing, 'position'>[] = [];

  // Try all combinations of frets (0-maxFret) on the 3 strings
  for (let fret1 = 0; fret1 <= maxFret; fret1++) {
    for (let fret2 = 0; fret2 <= maxFret; fret2++) {
      for (let fret3 = 0; fret3 <= maxFret; fret3++) {
        const frets = [fret1, fret2, fret3];

        // Check if this is within reasonable stretch
        const minFret = Math.min(...frets.filter(f => f > 0)); // Ignore open strings
        const maxFretUsed = Math.max(...frets);
        if (minFret > 0 && maxFretUsed - minFret > maxStretch) {
          continue; // Skip if stretch is too wide
        }

        // Get the pitch classes at these frets
        const note1 = fretboard[stringGroup[0]][fret1];
        const note2 = fretboard[stringGroup[1]][fret2];
        const note3 = fretboard[stringGroup[2]][fret3];
        const notes = [note1, note2, note3];

        // Check if all notes are in the triad
        const notesSet = new Set(notes);
        const triadSet = new Set(triadPcs);

        // All notes must be in the triad
        const allNotesInTriad = [...notesSet].every(n => triadSet.has(n));
        // All triad notes must be present
        const allTriadNotesPresent = [...triadSet].every(n => notesSet.has(n));

        if (allNotesInTriad && allTriadNotesPresent) {
          const avgFret = frets.reduce((sum, f) => sum + f, 0) / 3;
          const inversion = identifyInversion(notes, triadPcs);

          voicings.push({
            strings: [...stringGroup],
            frets,
            notes,
            noteNames: notes.map(pc => pcToDisplayName(pc, key)),
            inversion,
            avgFret,
          });
        }
      }
    }
  }

  return voicings;
}

/**
 * Select 4 positions from all voicings for a single string group
 * Prioritizes the inversion cycle: second → root → first → second
 * @param voicings All valid voicings for this group
 * @returns 4 selected positions
 */
export function select4Positions(
  voicings: Omit<TriadVoicing, 'position'>[],
  startingInversion: InversionType = 'second' // Default starting inversion
): TriadVoicing[] {
  // Group voicings by inversion
  const byInversion: Record<InversionType, typeof voicings> = {
    root: [],
    first: [],
    second: [],
    unknown: [],
  };

  voicings.forEach(v => {
    byInversion[v.inversion].push(v);
  });

  // Sort each group by average fret position
  Object.values(byInversion).forEach(group => {
    group.sort((a, b) => a.avgFret - b.avgFret);
  });

  // Select positions following the inversion cycle
  const selected: TriadVoicing[] = [];
  const cycle: InversionType[] = ['second', 'root', 'first', 'second'];

  // Rotate cycle to start with the specified starting inversion
  const startIdx = cycle.indexOf(startingInversion);
  const rotatedCycle = [...cycle.slice(startIdx), ...cycle.slice(0, startIdx)];

  // For each position (0-3), select the best voicing of the target inversion
  for (let pos = 0; pos < 4; pos++) {
    const targetInversion = rotatedCycle[pos];
    const candidates = byInversion[targetInversion];

    if (candidates.length > 0) {
      // Select based on position in the sorted list
      const idx = Math.min(pos, candidates.length - 1);
      selected.push({
        ...candidates[idx],
        position: pos,
      });
    }
  }

  // Fill any gaps with remaining voicings
  if (selected.length < 4) {
    const allRemaining = voicings
      .filter(v => !selected.some(s =>
        s.frets[0] === v.frets[0] &&
        s.frets[1] === v.frets[1] &&
        s.frets[2] === v.frets[2]
      ))
      .sort((a, b) => a.avgFret - b.avgFret);

    while (selected.length < 4 && allRemaining.length > 0) {
      selected.push({
        ...allRemaining.shift()!,
        position: selected.length,
      });
    }
  }

  return selected.slice(0, 4);
}

/**
 * Check if two voicings share any notes (same fret on same string)
 */
function voicingsShareNotes(
  v1: Omit<TriadVoicing, 'position'>,
  v2: Omit<TriadVoicing, 'position'>,
  stringIndices1: number[],
  stringIndices2: number[]
): boolean {
  for (let i = 0; i < stringIndices1.length; i++) {
    for (let j = 0; j < stringIndices2.length; j++) {
      if (stringIndices1[i] === stringIndices2[j] && v1.frets[i] === v2.frets[j]) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Find chains of voicings that share notes between adjacent groups
 */
function findVoicingChains(
  groupVoicings: Omit<TriadVoicing, 'position'>[][],
  stringGroups: number[][]
): Omit<TriadVoicing, 'position'>[][] {
  const chains: Omit<TriadVoicing, 'position'>[][] = [];

  // Start with all voicings from the first group
  const firstGroupVoicings = groupVoicings[0];
  for (const firstVoicing of firstGroupVoicings) {
    const chain = [firstVoicing];

    // Try to extend the chain through the remaining groups
    for (let groupIdx = 1; groupIdx < groupVoicings.length; groupIdx++) {
      const candidates = groupVoicings[groupIdx].filter(v =>
        voicingsShareNotes(chain[chain.length - 1], v, stringGroups[groupIdx - 1], stringGroups[groupIdx])
      );

      if (candidates.length > 0) {
        // Pick the candidate with the best inversion progression
        chain.push(candidates[0]);
      } else {
        // Chain breaks here
        break;
      }
    }

    if (chain.length === groupVoicings.length) {
      chains.push(chain);
    }
  }

  return chains;
}

/**
 * Select 4 positions for each string group with coordination
 */
export function select4PositionsCoordinated(
  groupVoicings: Omit<TriadVoicing, 'position'>[][],
  stringGroups: number[][]
): TriadVoicing[][] {
  // Try to find complete chains through all 4 groups
  const chains = findVoicingChains(groupVoicings, stringGroups);

  // If we found complete chains, select from them
  if (chains.length >= 4) {
    // Sort chains by total average fret
    chains.sort((a, b) => {
      const avgA = a.reduce((sum, v) => sum + v.avgFret, 0) / a.length;
      const avgB = b.reduce((sum, v) => sum + v.avgFret, 0) / b.length;
      return avgA - avgB;
    });

    // Select 4 evenly spaced chains
    const selectedChains: Omit<TriadVoicing, 'position'>[][] = [];
    const step = Math.floor(chains.length / 4);
    for (let i = 0; i < 4; i++) {
      const idx = Math.min(i * step, chains.length - 1);
      selectedChains.push(chains[idx]);
    }

    // Convert chains to positioned voicings
    const result: TriadVoicing[][] = [[], [], [], []];
    for (let pos = 0; pos < 4; pos++) {
      for (let group = 0; group < 4; group++) {
        result[group].push({
          ...selectedChains[pos][group],
          position: pos,
        });
      }
    }

    return result;
  }

  // Fallback: Select independently for each group with good distribution
  const result: TriadVoicing[][] = [];

  // Determine starting inversions for cycle continuity across groups
  const startingInversions: InversionType[] = ['second', 'first', 'root', 'second'];

  for (let groupIdx = 0; groupIdx < 4; groupIdx++) {
    // Sort voicings by average fret
    const sorted = [...groupVoicings[groupIdx]].sort((a, b) => a.avgFret - b.avgFret);

    // Group by inversion
    const byInversion: Record<InversionType, typeof sorted> = {
      root: [],
      first: [],
      second: [],
      unknown: [],
    };

    sorted.forEach(v => {
      byInversion[v.inversion].push(v);
    });

    // Select positions with good coverage
    const positions: TriadVoicing[] = [];

    // Position 0: Lowest voicing (prefer with starting inversion)
    const startInv = startingInversions[groupIdx];
    const pos0Candidates = byInversion[startInv].length > 0 ? byInversion[startInv] : sorted;
    if (pos0Candidates.length > 0) {
      positions.push({
        ...pos0Candidates[0],
        position: 0,
      });
    }

    // Position 3: Highest voicing
    const highCandidates = sorted.filter(v =>
      !positions.some(p => p.frets.join(',') === v.frets.join(','))
    );
    if (highCandidates.length > 0) {
      positions.push({
        ...highCandidates[highCandidates.length - 1],
        position: 3,
      });
    }

    // Positions 1 & 2: Fill in between
    const remaining = sorted.filter(v =>
      !positions.some(p => p.frets.join(',') === v.frets.join(','))
    );

    if (remaining.length > 0) {
      const third = Math.floor(remaining.length / 3);
      const twoThirds = Math.floor((remaining.length * 2) / 3);

      if (remaining[third]) {
        positions.push({
          ...remaining[third],
          position: 1,
        });
      }

      if (remaining[twoThirds] && remaining[twoThirds] !== remaining[third]) {
        positions.push({
          ...remaining[twoThirds],
          position: 2,
        });
      }
    }

    // Sort by position and fill any gaps
    positions.sort((a, b) => a.position - b.position);

    // Renumber positions 0-3
    positions.forEach((p, idx) => {
      p.position = idx;
    });

    result.push(positions);
  }

  return result;
}

/**
 * Visualize the fretboard patterns for debugging
 * @param voicings The voicings to visualize
 * @param label Label for this visualization
 */
export function visualizeVoicings(
  voicings: TriadVoicing[],
  label: string = 'Voicings'
): void {
  console.log(`\n=== ${label} ===`);
  voicings.forEach(v => {
    const fretsStr = v.frets.map(f => f.toString().padStart(2)).join('-');
    const notesStr = v.noteNames.join('-');
    const invStr = v.inversion.padEnd(6);
    console.log(
      `Pos ${v.position}: [${fretsStr}] ${invStr} (${notesStr}) avg=${v.avgFret.toFixed(1)}`
    );
  });
}

/**
 * Generate all triad voicings for a given key
 * @param key The root note of the major triad
 * @returns Complete triad voicing data for all string groups
 */
export function generateTriadsData(key: NoteName): TriadsData {
  const triadPcs = buildMajorTriad(key);
  const triadNoteNames = triadPcs.map(pc => pcToDisplayName(pc, key));
  const fretboard = buildFretboard();

  // Use hard-coded voicings if available
  if (MAJOR_TRIAD_POSITIONS[key]) {
    const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringGroupsData: Array<[number, number, number]> = [
      [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
    ];

    const stringGroups: StringGroupTriads[] = stringGroupsData.map((stringGroupIndices, groupIdx) => {
      const groupKey = `G${groupIdx}`;
      const hardCodedVoicings = MAJOR_TRIAD_POSITIONS[key][groupKey];

      // Validation: Check for duplicate positions
      const fretStrings = hardCodedVoicings.map((hc: any) => hc.frets.join(','));
      const uniqueFretStrings = new Set(fretStrings);
      if (uniqueFretStrings.size !== fretStrings.length) {
        console.warn(`Warning: Key ${key}, Group ${groupIdx} has duplicate positions in hard-coded data!`);
        const seen = new Set<string>();
        fretStrings.forEach((fs: string, idx: number) => {
          if (seen.has(fs)) {
            console.warn(`  Position ${idx} [${fs}] is a duplicate`);
          }
          seen.add(fs);
        });
      }

      const voicings: TriadVoicing[] = hardCodedVoicings.map((hc: any) => {
        const notes = hc.frets.map((fret: number, idx: number) => fretboard[stringGroupIndices[idx]][fret]);
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
      triadNotes: triadNoteNames,
      stringGroups,
    };
  }

  // Define the 4 string groups (adjacent 3-string sets)
  const stringGroupsData: Array<[number, number, number]> = [
    [0, 1, 2], // Strings 6-5-4 (E-A-D)
    [1, 2, 3], // Strings 5-4-3 (A-D-G)
    [2, 3, 4], // Strings 4-3-2 (D-G-B)
    [3, 4, 5], // Strings 3-2-1 (G-B-E)
  ];

  // Find all voicings for each group
  const allGroupVoicings = stringGroupsData.map(stringGroup =>
    findAllTriadVoicings(stringGroup, triadPcs, fretboard, 5, 18, key)
  );

  // Select 4 positions for each group with coordination
  const selectedPositions = select4PositionsCoordinated(
    allGroupVoicings,
    stringGroupsData.map(g => [...g])
  );

  // Build the final data structure
  const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
  const stringGroups: StringGroupTriads[] = stringGroupsData.map(
    (stringGroupIndices, groupIdx) => ({
      strings: [...stringGroupIndices],
      stringNames: stringGroupIndices.map(idx => STRING_NAMES[idx]),
      voicings: selectedPositions[groupIdx],
    })
  );

  return {
    key,
    triadNotes: triadNoteNames,
    stringGroups,
  };
}