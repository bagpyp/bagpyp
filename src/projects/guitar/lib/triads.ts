/**
 * Major Triads - Voicing generation and utilities
 */

import { nameToPc, pcToSharpName, buildFretboard } from './core';
import type { NoteName } from './types';

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
  strings: number[]; // e.g., [0, 1, 2] for strings 6-5-4
  stringNames: string[]; // e.g., ["E", "A", "D"]
  voicings: TriadVoicing[]; // 4 voicings (positions 0-3)
}

export interface TriadsData {
  key: string; // e.g., "C"
  triadNotes: string[]; // ["C", "E", "G"]
  stringGroups: StringGroupTriads[]; // 4 string groups
}

/**
 * Build major triad pitch classes
 * Returns: [root_pc, third_pc, fifth_pc]
 */
export function buildMajorTriad(rootName: NoteName): [number, number, number] {
  const rootPc = nameToPc(rootName);
  const thirdPc = (rootPc + 4) % 12; // Major third (4 semitones)
  const fifthPc = (rootPc + 7) % 12; // Perfect fifth (7 semitones)
  return [rootPc, thirdPc, fifthPc];
}

/**
 * Identify which inversion type based on lowest note
 *
 * @param notes [low, mid, high] pitch classes from low to high strings
 * @param triadPcs [root, third, fifth] pitch classes
 * @returns "root", "first", "second", or "unknown"
 */
export function identifyInversion(
  notes: number[],
  triadPcs: [number, number, number]
): InversionType {
  const [rootPc, thirdPc, fifthPc] = triadPcs;
  const lowestNote = notes[0];

  if (lowestNote === rootPc) {
    return 'root';
  } else if (lowestNote === thirdPc) {
    return 'first';
  } else if (lowestNote === fifthPc) {
    return 'second';
  } else {
    return 'unknown';
  }
}

/**
 * Find all valid triad voicings on a 3-string group
 *
 * @param triadPcs [root, third, fifth] pitch classes
 * @param stringGroup [low_string_idx, mid_string_idx, high_string_idx]
 * @param fretboard Fretboard mapping from buildFretboard()
 * @param maxStretch Maximum fret span allowed (default 5)
 * @returns Array of voicing objects
 */
export function findAllTriadVoicings(
  triadPcs: [number, number, number],
  stringGroup: [number, number, number],
  fretboard: Record<number, Record<number, number>>,
  maxStretch: number = 5
): Omit<TriadVoicing, 'position'>[] {
  const voicings: Omit<TriadVoicing, 'position'>[] = [];
  const triadSet = new Set(triadPcs);

  // Try all combinations of frets on the 3 strings (0-18 matches frontend limit)
  for (let fret1 = 0; fret1 <= 18; fret1++) {
    // Low string (0-18)
    const note1 = fretboard[stringGroup[0]][fret1];
    if (!triadSet.has(note1)) continue;

    for (let fret2 = 0; fret2 <= 18; fret2++) {
      // Mid string (0-18)
      const note2 = fretboard[stringGroup[1]][fret2];
      if (!triadSet.has(note2)) continue;

      for (let fret3 = 0; fret3 <= 18; fret3++) {
        // High string (0-18)
        const note3 = fretboard[stringGroup[2]][fret3];
        if (!triadSet.has(note3)) continue;

        // Check that all three unique triad notes are present
        const notes = [note1, note2, note3];
        const noteSet = new Set(notes);
        if (noteSet.size !== triadSet.size || ![...triadSet].every(pc => noteSet.has(pc))) {
          continue;
        }

        // Check fret stretch constraint
        const minFret = Math.min(fret1, fret2, fret3);
        const maxFret = Math.max(fret1, fret2, fret3);
        if (maxFret - minFret > maxStretch) {
          continue;
        }

        // Valid voicing found
        const avgFret = (fret1 + fret2 + fret3) / 3.0;
        const inversion = identifyInversion(notes, triadPcs);
        const noteNames = notes.map(pc => pcToSharpName(pc));

        voicings.push({
          strings: [...stringGroup],
          frets: [fret1, fret2, fret3],
          notes: [...notes],
          noteNames,
          inversion,
          avgFret,
        });
      }
    }
  }

  return voicings;
}

/**
 * Select 4 representative voicings spanning the fretboard (positions 0-3)
 *
 * Uses a quartile-based approach to ensure even distribution:
 * - Position 0: ~0th percentile (lowest voicing)
 * - Position 1: ~25th percentile
 * - Position 2: ~50th percentile
 * - Position 3: ~100th percentile (highest voicing)
 *
 * This ensures we don't skip voicings in the middle range.
 *
 * @param voicings Array of voicings to select from
 * @returns Array of up to 4 voicings, each with added "position" key (0-3)
 */
function voicingsShareNotes(
  v1: Omit<TriadVoicing, 'position'>,
  v2: Omit<TriadVoicing, 'position'>
): boolean {
  // v1's last 2 notes should match v2's first 2 notes
  return (
    v1.notes[1] === v2.notes[0] &&
    v1.notes[2] === v2.notes[1] &&
    v1.frets[1] === v2.frets[0] &&
    v1.frets[2] === v2.frets[1]
  );
}

function findVoicingChains(
  allGroupVoicings: Array<Omit<TriadVoicing, 'position'>[]>
): Array<Omit<TriadVoicing, 'position'>[]> {
  const chains: Array<Omit<TriadVoicing, 'position'>[]> = [];

  // Start with every voicing in group 0
  for (const v0 of allGroupVoicings[0]) {
    for (const v1 of allGroupVoicings[1]) {
      if (!voicingsShareNotes(v0, v1)) continue;

      for (const v2 of allGroupVoicings[2]) {
        if (!voicingsShareNotes(v1, v2)) continue;

        for (const v3 of allGroupVoicings[3]) {
          if (!voicingsShareNotes(v2, v3)) continue;

          // Found a complete chain!
          chains.push([v0, v1, v2, v3]);
        }
      }
    }
  }

  return chains;
}

export function select4PositionsCoordinated(
  allGroupVoicings: Array<Omit<TriadVoicing, 'position'>[]>,
  triadPcs: [number, number, number]
): TriadVoicing[][] {
  // Find all valid chains
  const chains = findVoicingChains(allGroupVoicings);

  if (chains.length < 4) {
    // Fallback: not enough chains, use independent selection
    // But ALWAYS prioritize absolute lowest for Position 0 (esp. open strings)
    const result = allGroupVoicings.map((groupVoicings, groupIdx) => {
      const groupSelected = select4Positions(groupVoicings);

      // Override Position 0 with absolute lowest
      const sortedVoicings = [...groupVoicings].sort((a, b) => a.avgFret - b.avgFret);
      if (groupSelected.length > 0 && sortedVoicings.length > 0) {
        // Replace Position 0 with absolute lowest
        const pos0Index = groupSelected.findIndex(v => v.position === 0);
        if (pos0Index !== -1) {
          const lowest = { ...sortedVoicings[0], position: 0 };
          groupSelected[pos0Index] = lowest;
        }
      }

      return groupSelected;
    });
    return result;
  }

  // Group chains by inversion pattern
  const chainsByPattern: Record<InversionType, Array<{avgFret: number; chain: Omit<TriadVoicing, 'position'>[]}>> = {
    root: [],
    first: [],
    second: [],
    unknown: [],
  };

  for (const chain of chains) {
    const avgFret = chain.reduce((sum, v) => sum + v.avgFret, 0) / 4;
    const inv = chain[0].inversion;
    chainsByPattern[inv].push({ avgFret, chain });
  }

  // Sort chains within each inversion group by avg fret
  for (const inv in chainsByPattern) {
    chainsByPattern[inv as InversionType].sort((a, b) => a.avgFret - b.avgFret);
  }

  // Find best inversion for P0/P3
  const inversionTypes: InversionType[] = ['root', 'first', 'second'];
  let bestPairedInv: InversionType | null = null;
  let bestSpan = 0;

  for (const inv of inversionTypes) {
    const chainsList = chainsByPattern[inv];
    if (chainsList.length >= 2) {
      const span = chainsList[chainsList.length - 1].avgFret - chainsList[0].avgFret;
      if (span > bestSpan) {
        bestSpan = span;
        bestPairedInv = inv;
      }
    }
  }

  if (bestPairedInv === null) {
    return allGroupVoicings.map(v => select4Positions(v));
  }

  // Select 4 chains with inversion constraints
  const otherInvs = inversionTypes.filter(inv => inv !== bestPairedInv);
  const selectedChains: Array<Omit<TriadVoicing, 'position'>[]> = [];

  // Position 0: Lowest chain with paired inversion
  if (chainsByPattern[bestPairedInv].length > 0) {
    selectedChains.push(chainsByPattern[bestPairedInv][0].chain);
  }

  // Position 1: Chain from first "other" inversion
  if (otherInvs[0] && chainsByPattern[otherInvs[0]].length > 0) {
    const inv1Chains = chainsByPattern[otherInvs[0]];
    const idx = Math.min(inv1Chains.length - 1, Math.floor(inv1Chains.length / 3));
    selectedChains.push(inv1Chains[idx].chain);
  }

  // Position 2: Chain from second "other" inversion
  if (otherInvs.length > 1 && chainsByPattern[otherInvs[1]].length > 0) {
    const inv2Chains = chainsByPattern[otherInvs[1]];
    const idx = Math.max(0, Math.floor(inv2Chains.length * 2 / 3));
    selectedChains.push(inv2Chains[idx].chain);
  }

  // Position 3: Highest chain with paired inversion (prefer to avoid fret 17+)
  if (chainsByPattern[bestPairedInv].length > 0) {
    const chains = chainsByPattern[bestPairedInv];

    // For Position 3, check if highest chain has fret 17+
    const highestChain = chains[chains.length - 1].chain;
    const highestHasFret17 = highestChain.some(v => Math.max(...v.frets) > 16);

    if (highestHasFret17 && chains.length >= 3) {
      // Try second-highest chain (need >= 3 to avoid conflict with Position 0)
      const secondHighestChain = chains[chains.length - 2].chain;
      const secondHighestHasFret17 = secondHighestChain.some(v => Math.max(...v.frets) > 16);

      if (!secondHighestHasFret17) {
        selectedChains.push(secondHighestChain);
      } else {
        selectedChains.push(highestChain); // No better option
      }
    } else if (highestHasFret17 && chains.length === 2) {
      // Only 2 chains and highest has fret 17+
      // Use independent selection for all groups to avoid fret 17+ when possible
      return allGroupVoicings.map(v => select4Positions(v));
    } else {
      // No fret 17+ issue or not enough chains, use highest
      selectedChains.push(highestChain);
    }
  }

  // Convert chains to grouped format
  const result: TriadVoicing[][] = [[], [], [], []];
  selectedChains.forEach((chain, posIdx) => {
    chain.forEach((voicing, groupIdx) => {
      result[groupIdx].push({ ...voicing, position: posIdx });
    });
  });

  return result;
}

export function select4Positions(
  voicings: Omit<TriadVoicing, 'position'>[]
): TriadVoicing[] {
  if (voicings.length === 0) {
    return [];
  }

  // Sort by average fret
  const sortedVoicings = [...voicings].sort((a, b) => a.avgFret - b.avgFret);
  const n = sortedVoicings.length;

  if (n <= 4) {
    // If 4 or fewer voicings, use them all
    return sortedVoicings.map((v, idx) => ({ ...v, position: idx }));
  }

  // NEW APPROACH: Prioritize inversion sequence pattern
  // The cyclic pattern is: first -> second -> root -> first -> ...
  const INVERSION_CYCLE: InversionType[] = ['first', 'second', 'root'];

  // Group voicings by inversion
  const byInversion: Record<InversionType, typeof sortedVoicings> = {
    root: [],
    first: [],
    second: [],
    unknown: [],
  };

  sortedVoicings.forEach(v => {
    byInversion[v.inversion].push(v);
  });

  // Select Position 0 (lowest voicing overall)
  const pos0 = sortedVoicings[0];
  const startInversionIdx = INVERSION_CYCLE.indexOf(pos0.inversion);

  // If Position 0 has unknown inversion, fall back to old algorithm
  if (startInversionIdx === -1) {
    return selectByQuartiles(sortedVoicings);
  }

  // Determine target inversions for each position based on the cycle
  const targetInversions: InversionType[] = [
    INVERSION_CYCLE[startInversionIdx],           // Position 0
    INVERSION_CYCLE[(startInversionIdx + 1) % 3], // Position 1
    INVERSION_CYCLE[(startInversionIdx + 2) % 3], // Position 2
    INVERSION_CYCLE[(startInversionIdx + 3) % 3], // Position 3 (wraps)
  ];

  const selected: TriadVoicing[] = [];

  // Select voicings for each position
  for (let posIdx = 0; posIdx < 4; posIdx++) {
    const targetInv = targetInversions[posIdx];
    const candidates = byInversion[targetInv];

    if (candidates.length === 0) {
      // No voicing with target inversion - fall back to old algorithm
      return selectByQuartiles(sortedVoicings);
    }

    let selectedVoicing: typeof candidates[0];

    if (posIdx === 0) {
      // Position 0: use lowest overall (already set as pos0)
      selectedVoicing = pos0;
    } else if (posIdx === 3) {
      // Position 3: prefer second-highest to avoid fret 17+, within target inversion
      let candidateIdx = candidates.length - 1;
      const highest = candidates[candidateIdx];
      const highestMaxFret = Math.max(...highest.frets);

      if (highestMaxFret > 16 && candidates.length >= 2) {
        const secondHighest = candidates[candidates.length - 2];
        const secondHighestMaxFret = Math.max(...secondHighest.frets);
        if (secondHighestMaxFret <= 16) {
          candidateIdx = candidates.length - 2;
        }
      }
      selectedVoicing = candidates[candidateIdx];
    } else {
      // Positions 1 & 2: Select from candidates based on proximity to target avgFret
      // IMPORTANT: Must maintain monotonic ordering (each position > previous)
      const prevAvgFret = selected[selected.length - 1].avgFret;

      // Filter candidates that are higher than previous position
      const validCandidates = candidates.filter(c => c.avgFret > prevAvgFret);

      if (validCandidates.length === 0) {
        // No valid candidates - fall back to old algorithm
        return selectByQuartiles(sortedVoicings);
      }

      // Target avgFret is based on position in the fretboard
      const targetAvgFret = posIdx === 1
        ? sortedVoicings[Math.round(n / 4)].avgFret  // ~25th percentile
        : sortedVoicings[Math.floor(n / 2)].avgFret; // ~50th percentile

      // Find candidate closest to target avgFret (among valid candidates)
      selectedVoicing = validCandidates.reduce((closest, current) => {
        const closestDist = Math.abs(closest.avgFret - targetAvgFret);
        const currentDist = Math.abs(current.avgFret - targetAvgFret);
        return currentDist < closestDist ? current : closest;
      });
    }

    selected.push({ ...selectedVoicing, position: posIdx });
  }

  return selected;
}

/**
 * Fallback: Old quartile-based selection (no inversion constraint)
 */
function selectByQuartiles(
  sortedVoicings: Omit<TriadVoicing, 'position'>[]
): TriadVoicing[] {
  const n = sortedVoicings.length;

  // For Position 3, prefer second-highest to avoid fret 17+
  let pos3Index = n - 1;
  const highestVoicing = sortedVoicings[n - 1];
  const highestMaxFret = Math.max(...highestVoicing.frets);

  if (highestMaxFret > 16 && n >= 5) {
    const secondHighest = sortedVoicings[n - 2];
    const secondHighestMaxFret = Math.max(...secondHighest.frets);
    if (secondHighestMaxFret <= 16) {
      pos3Index = n - 2;
    }
  }

  let indices = [
    0,
    Math.round(n / 4),
    Math.floor(n / 2),
    pos3Index
  ];

  // Ensure all indices are unique
  indices = Array.from(new Set(indices)).sort((a, b) => a - b);

  // If we don't have 4 unique indices, fill with quartiles
  if (indices.length < 4) {
    indices = [
      0,
      Math.max(1, Math.floor(n / 4)),
      Math.max(2, Math.floor(n / 2)),
      n - 1
    ];
  }

  const selected: TriadVoicing[] = [];
  for (let positionIdx = 0; positionIdx < Math.min(4, indices.length); positionIdx++) {
    const voicingIdx = indices[positionIdx];
    selected.push({ ...sortedVoicings[voicingIdx], position: positionIdx });
  }

  return selected;
}

/**
 * Generate all triad voicings for a key (4 string groups × 4 positions)
 * This is the main function to use for generating triad data
 */
export function generateTriadsData(key: NoteName): TriadsData {
  const triadPcs = buildMajorTriad(key);
  const triadNoteNames = triadPcs.map(pc => pcToSharpName(pc));
  const fretboard = buildFretboard();

  // Hard-coded perfect voicings for C, G, D, A, E (verified to follow inversion cycle)
  const PERFECT_KEYS: Record<string, any> = {
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
      G1: [{ pos: 0, frets: [5, 4, 2], inv: 'root' }, { pos: 1, frets: [9, 7, 7], inv: 'first' }, { pos: 2, frets: [12, 12, 11], inv: 'second' }, { pos: 3, frets: [5, 4, 2], inv: 'root' }],
      G2: [{ pos: 0, frets: [4, 2, 3], inv: 'first' }, { pos: 1, frets: [7, 7, 7], inv: 'second' }, { pos: 2, frets: [12, 11, 10], inv: 'root' }, { pos: 3, frets: [16, 14, 15], inv: 'first' }],
      G3: [{ pos: 0, frets: [2, 3, 2], inv: 'second' }, { pos: 1, frets: [7, 7, 5], inv: 'root' }, { pos: 2, frets: [11, 10, 10], inv: 'first' }, { pos: 3, frets: [14, 15, 14], inv: 'second' }],
    },
    A: {
      G0: [{ pos: 0, frets: [5, 4, 2], inv: 'root' }, { pos: 1, frets: [9, 7, 7], inv: 'first' }, { pos: 2, frets: [12, 12, 11], inv: 'second' }, { pos: 3, frets: [5, 4, 2], inv: 'root' }],
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
  };

  // Use hard-coded voicings if available
  if (PERFECT_KEYS[key]) {
    const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringGroupsData: Array<[number, number, number]> = [
      [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
    ];

    const stringGroups: StringGroupTriads[] = stringGroupsData.map((stringGroupIndices, groupIdx) => {
      const groupKey = `G${groupIdx}`;
      const hardCodedVoicings = PERFECT_KEYS[key][groupKey];

      const voicings: TriadVoicing[] = hardCodedVoicings.map((hc: any) => {
        const notes = hc.frets.map((fret: number, idx: number) => fretboard[stringGroupIndices[idx]][fret]);
        const noteNames = notes.map((pc: number) => pcToSharpName(pc));
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

  const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];

  // Find all voicings for all groups first (for coordination)
  const allGroupVoicings = stringGroupsData.map(stringGroupIndices =>
    findAllTriadVoicings(triadPcs, stringGroupIndices, fretboard)
  );

  // Select positions using coordinated algorithm
  const selectedByGroup = select4PositionsCoordinated(allGroupVoicings, triadPcs);

  const stringGroups: StringGroupTriads[] = stringGroupsData.map((stringGroupIndices, groupIdx) => {
    const groupStringNames = stringGroupIndices.map(idx => STRING_NAMES[idx]);
    const selectedVoicings = selectedByGroup[groupIdx];

    return {
      strings: [...stringGroupIndices],
      stringNames: groupStringNames,
      voicings: selectedVoicings,
    };
  });

  return {
    key,
    triadNotes: triadNoteNames,
    stringGroups,
  };
}
