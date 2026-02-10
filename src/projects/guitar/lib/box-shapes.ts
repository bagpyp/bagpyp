export type BoxScaleFamily = 'major' | 'pentatonic' | 'blues';

export interface BoxShapeOptions {
  includeExperimentalBluesShape?: boolean;
}

export interface BoxShapePattern {
  id: string;
  family: BoxScaleFamily;
  shapeNumber: number;
  label: string;
  keyRoot: string;
  shapeRootNote: string;
  shapeRootPitchClass: number;
  modeName?: string;
  intervals: number[];
  windowStart: number;
  windowEnd: number;
  pattern: number[][];
  rootPositions: [number, number][];
  blueNotePositions: [number, number][];
}

export interface BoxScaleFamilyOption {
  value: BoxScaleFamily;
  label: string;
  description: string;
}

const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E
const MAX_FRET = 24;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_BOX_SHIFT = 2;
const CIRCLE_OF_FIFTHS_MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'] as const;

const ENHARMONIC_TO_MAJOR_KEY: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'G#': 'Ab',
  'A#': 'Bb',
  'B#': 'C',
  'E#': 'F',
  Cb: 'B',
  Fb: 'E',
};

const RELATIVE_MINOR_BY_MAJOR: Record<string, string> = {
  C: 'A',
  G: 'E',
  D: 'B',
  A: 'F#',
  E: 'C#',
  B: 'G#',
  'F#': 'D#',
  Db: 'Bb',
  Ab: 'F',
  Eb: 'C',
  Bb: 'G',
  F: 'D',
};
const RELATIVE_MAJOR_BY_MINOR: Record<string, string> = Object.fromEntries(
  Object.entries(RELATIVE_MINOR_BY_MAJOR).map(([major, minor]) => [minor, major])
) as Record<string, string>;

const MAJOR_MODE_NAMES = [
  'Ionian',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Aeolian',
  'Locrian',
] as const;

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
// Box -> string index that is 2NPS for major modes
// String indexes: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high E
const MAJOR_2NPS_STRING_INDEX_BY_BOX = [4, 3, 3, 4, 4, 4, 4];
const PENTATONIC_INTERVALS = [0, 3, 5, 7, 10]; // Minor pentatonic
const BLUES_INTERVALS = [0, 3, 5, 6, 7, 10]; // Minor blues (adds b5)

export function getPitchClass(noteName: string): number {
  const normalized = noteName.replace('♯', '#').replace('♭', 'b');
  const index = NOTE_NAMES.indexOf(normalized);
  if (index !== -1) return index;

  const flatMap: Record<string, string> = {
    Db: 'C#',
    Eb: 'D#',
    Fb: 'E',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#',
    Cb: 'B',
  };

  const sharp = flatMap[normalized];
  if (sharp) return NOTE_NAMES.indexOf(sharp);

  return 0;
}

export function getNoteName(pitchClass: number): string {
  return NOTE_NAMES[(pitchClass + 12) % 12];
}

export function getKeyOptions(): { value: string; label: string }[] {
  return NOTE_NAMES.map((note) => ({
    value: note,
    label: note.replace('#', '♯'),
  }));
}

export function getMajorKeyOptions(): { value: string; label: string }[] {
  return CIRCLE_OF_FIFTHS_MAJOR_KEYS.map((note) => ({
    value: note,
    label: note.replace('#', '♯').replace('b', '♭'),
  }));
}

export function normalizeMajorKeyName(noteName: string): string {
  const normalizedInput = noteName.replace('♯', '#').replace('♭', 'b');
  if ((CIRCLE_OF_FIFTHS_MAJOR_KEYS as readonly string[]).includes(normalizedInput)) {
    return normalizedInput;
  }

  const direct = ENHARMONIC_TO_MAJOR_KEY[normalizedInput];
  if (direct) {
    return direct;
  }

  const canonical = getNoteName(getPitchClass(normalizedInput));
  return ENHARMONIC_TO_MAJOR_KEY[canonical] ?? canonical;
}

export function getRelativeMinorKeyFromMajor(majorKey: string): string {
  const normalizedMajor = normalizeMajorKeyName(majorKey);
  return RELATIVE_MINOR_BY_MAJOR[normalizedMajor] ?? getNoteName((getPitchClass(normalizedMajor) + 9) % 12);
}

export function getRelativeMajorKeyFromMinor(minorKey: string): string {
  const normalizedMinor = minorKey.replace('♯', '#').replace('♭', 'b');
  const direct = RELATIVE_MAJOR_BY_MINOR[normalizedMinor];
  if (direct) {
    return direct;
  }

  const canonical = getNoteName(getPitchClass(normalizedMinor));
  const mapped = RELATIVE_MAJOR_BY_MINOR[canonical];
  if (mapped) {
    return mapped;
  }

  return normalizeMajorKeyName(getNoteName((getPitchClass(normalizedMinor) + 3) % 12));
}

function pitchClassAtPosition(stringIndex: number, fret: number): number {
  return (STANDARD_TUNING_PCS[stringIndex] + fret) % 12;
}

function nextScalePitchClass(
  rootPitchClass: number,
  scaleIntervals: number[],
  currentPitchClass: number
): number {
  const interval = (currentPitchClass - rootPitchClass + 12) % 12;
  const intervalIndex = scaleIntervals.indexOf(interval);
  if (intervalIndex === -1) {
    return (currentPitchClass + 2) % 12;
  }

  return (rootPitchClass + scaleIntervals[(intervalIndex + 1) % scaleIntervals.length]) % 12;
}

function findFretsForPitchClassOnString(
  stringIndex: number,
  targetPitchClass: number
): number[] {
  const frets: number[] = [];
  for (let fret = 0; fret <= MAX_FRET; fret++) {
    if (pitchClassAtPosition(stringIndex, fret) === targetPitchClass) {
      frets.push(fret);
    }
  }
  return frets;
}

function canBuildScaleRunFromStart(
  stringIndex: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  startFret: number,
  noteCount: number
): boolean {
  let fret = startFret;
  for (let i = 1; i < noteCount; i++) {
    const next = nextScaleFretOnString(stringIndex, rootPitchClass, scaleIntervals, fret);
    if (next <= fret) {
      return false;
    }
    fret = next;
  }
  return true;
}

function chooseRunStartFretForPitchClass(
  stringIndex: number,
  targetPitchClass: number,
  localStart: number,
  localEnd: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  desiredNotes: number
): number {
  const allFrets = findFretsForPitchClassOnString(stringIndex, targetPitchClass);
  const belowWindow = allFrets
    .filter((fret) => fret < localStart)
    .sort((a, b) => b - a);
  const orderedCandidates = [
    ...allFrets.filter((fret) => fret >= localStart && fret <= localEnd),
    ...allFrets.filter((fret) => fret > localEnd),
    ...belowWindow,
  ];

  for (const candidate of orderedCandidates) {
    if (canBuildScaleRunFromStart(
      stringIndex,
      rootPitchClass,
      scaleIntervals,
      candidate,
      desiredNotes
    )) {
      return candidate;
    }
  }

  return orderedCandidates[0] ?? localStart;
}

function selectBlueCandidatesForBox(
  basePattern: number[][],
  windowStart: number,
  windowEnd: number,
  rootPitchClass: number
): { stringIndex: number; fret: number; score: number }[] {
  const candidates: { stringIndex: number; fret: number; score: number }[] = [];

  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const stringFrets = [...basePattern[stringIndex]].sort((a, b) => a - b);
    const low = stringFrets[0];
    const high = stringFrets[stringFrets.length - 1];
    const blueFrets = collectScaleFretsForString(stringIndex, rootPitchClass, [6], 0, MAX_FRET);

    if (blueFrets.length === 0) {
      continue;
    }

    const best = blueFrets
      .map((fret) => {
        const between = fret >= low && fret <= high;
        const belowRun = fret < low;
        const edgeDistance = between ? 0 : Math.min(Math.abs(fret - low), Math.abs(fret - high));
        const windowDistance = fret < windowStart
          ? (windowStart - fret)
          : fret > windowEnd
            ? (fret - windowEnd)
            : 0;
        // Prefer adding blue notes at/above the pentatonic pair so box anchors
        // do not shift left on the neck (e.g. E blues box 4 low-E should stay at B).
        const belowRunPenalty = belowRun ? 2 : 0;
        const score = (between ? -100 : 0) + (edgeDistance * 10) + windowDistance + belowRunPenalty;
        return { stringIndex, fret, score };
      })
      .sort((a, b) => a.score - b.score || a.fret - b.fret)[0];

    candidates.push(best);
  }

  return candidates.sort((a, b) => a.score - b.score || a.stringIndex - b.stringIndex);
}

function rootFretOnLowE(rootPitchClass: number): number {
  return (rootPitchClass - STANDARD_TUNING_PCS[0] + 12) % 12;
}

function collectScaleFretsForString(
  stringIndex: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  minFret: number,
  maxFret: number
): number[] {
  const scaleIntervalSet = new Set(scaleIntervals);
  const frets: number[] = [];

  for (let fret = minFret; fret <= maxFret; fret++) {
    const pc = pitchClassAtPosition(stringIndex, fret);
    const interval = (pc - rootPitchClass + 12) % 12;
    if (scaleIntervalSet.has(interval)) {
      frets.push(fret);
    }
  }

  return frets;
}

function nextScaleFretOnString(
  stringIndex: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  fromFret: number
): number {
  const scaleIntervalSet = new Set(scaleIntervals);

  for (let fret = fromFret + 1; fret <= MAX_FRET; fret++) {
    const pc = pitchClassAtPosition(stringIndex, fret);
    const interval = (pc - rootPitchClass + 12) % 12;
    if (scaleIntervalSet.has(interval)) {
      return fret;
    }
  }

  const nearest = findNearestScaleFrets(
    stringIndex,
    rootPitchClass,
    scaleIntervals,
    Math.min(MAX_FRET, fromFret + 2),
    1
  );

  return nearest[0] ?? fromFret;
}

function findNearestScaleFrets(
  stringIndex: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  targetFret: number,
  desiredCount: number
): number[] {
  const allScaleFrets = collectScaleFretsForString(
    stringIndex,
    rootPitchClass,
    scaleIntervals,
    0,
    MAX_FRET
  );

  return allScaleFrets
    .map((fret) => ({ fret, distance: Math.abs(fret - targetFret) }))
    .sort((a, b) => a.distance - b.distance || a.fret - b.fret)
    .slice(0, desiredCount)
    .map((entry) => entry.fret)
    .sort((a, b) => a - b);
}

function chooseFretsForDisplay(frets: number[], maxNotes: number): number[] {
  const unique = [...new Set(frets)].sort((a, b) => a - b);
  if (unique.length <= maxNotes) {
    return unique;
  }

  if (maxNotes === 1) {
    return [unique[Math.floor(unique.length / 2)]];
  }

  if (maxNotes === 2) {
    // For 2NPS we prefer a compact adjacent pair over wide jumps.
    // This keeps boxes ergonomic and avoids odd stretched shapes.
    const targetCenter = (unique[0] + unique[unique.length - 1]) / 2;
    let bestPair: [number, number] = [unique[0], unique[1]];
    let bestSpan = bestPair[1] - bestPair[0];
    let bestCenterDistance = Math.abs(((bestPair[0] + bestPair[1]) / 2) - targetCenter);

    for (let i = 1; i < unique.length - 1; i++) {
      const pair: [number, number] = [unique[i], unique[i + 1]];
      const span = pair[1] - pair[0];
      const centerDistance = Math.abs(((pair[0] + pair[1]) / 2) - targetCenter);

      if (
        span < bestSpan ||
        (span === bestSpan && centerDistance < bestCenterDistance) ||
        (span === bestSpan && centerDistance === bestCenterDistance && pair[0] < bestPair[0])
      ) {
        bestPair = pair;
        bestSpan = span;
        bestCenterDistance = centerDistance;
      }
    }

    return bestPair;
  }

  if (maxNotes === 3) {
    // For modal box shapes, keep the lower 3-note cluster on each string.
    // This avoids skipping essential tones at the low edge of the box.
    return unique.slice(0, 3);
  }

  return unique.slice(0, maxNotes);
}

function selectFretsForString(
  stringIndex: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  localStart: number,
  localEnd: number,
  desiredCount: number
): number[] {
  const inWindow = collectScaleFretsForString(
    stringIndex,
    rootPitchClass,
    scaleIntervals,
    localStart,
    localEnd
  );

  const selected = chooseFretsForDisplay(inWindow, desiredCount);

  if (selected.length >= desiredCount) {
    return selected;
  }

  // If the local window does not provide enough notes, fill from nearest valid frets.
  const nearest = findNearestScaleFrets(
    stringIndex,
    rootPitchClass,
    scaleIntervals,
    Math.round((localStart + localEnd) / 2),
    Math.max(desiredCount * 3, desiredCount)
  );

  const result = [...selected];
  for (const fret of nearest) {
    if (!result.includes(fret)) {
      result.push(fret);
      if (result.length >= desiredCount) {
        break;
      }
    }
  }

  return result.sort((a, b) => a - b);
}

function pickBlueFretForString(
  blueFrets: number[],
  basePentatonicFrets: number[]
): number {
  const uniqueBlue = [...new Set(blueFrets)].sort((a, b) => a - b);
  if (uniqueBlue.length === 1) {
    return uniqueBlue[0];
  }

  const low = basePentatonicFrets[0];
  const high = basePentatonicFrets[basePentatonicFrets.length - 1];
  const between = uniqueBlue.filter((fret) => fret >= low && fret <= high);
  const candidates = between.length > 0 ? between : uniqueBlue;
  const target = (low + high) / 2;

  return candidates
    .map((fret) => ({ fret, distance: Math.abs(fret - target) }))
    .sort((a, b) => a.distance - b.distance || a.fret - b.fret)[0]
    .fret;
}

function selectLowestFretsForString(
  stringIndex: number,
  rootPitchClass: number,
  scaleIntervals: number[],
  localStart: number,
  localEnd: number,
  desiredCount: number
): number[] {
  const inWindow = collectScaleFretsForString(
    stringIndex,
    rootPitchClass,
    scaleIntervals,
    localStart,
    localEnd
  );

  const result = [...new Set(inWindow)].sort((a, b) => a - b);

  if (result.length < desiredCount) {
    const nearest = findNearestScaleFrets(
      stringIndex,
      rootPitchClass,
      scaleIntervals,
      Math.round((localStart + localEnd) / 2),
      Math.max(desiredCount * 3, desiredCount)
    );

    for (const fret of nearest) {
      if (!result.includes(fret)) {
        result.push(fret);
      }
      if (result.length >= desiredCount) {
        break;
      }
    }
  }

  return result.sort((a, b) => a - b).slice(0, desiredCount);
}

function buildShapePattern(
  family: BoxScaleFamily,
  keyRoot: string,
  rootPitchClass: number,
  shapeAnchor: number,
  shapeNumber: number,
  scaleIntervals: number[],
  notesPerString: number,
  windowWidth: number,
  modeName?: string,
  perStringNoteCounts?: number[]
): BoxShapePattern {
  const lowERootFret = rootFretOnLowE(rootPitchClass);
  const windowStart = family === 'major'
    ? lowERootFret + ((shapeNumber - 1) * MAJOR_BOX_SHIFT)
    : lowERootFret + shapeAnchor;
  const windowEnd = Math.min(MAX_FRET, windowStart + windowWidth);

  const shapeRootPitchClass = family === 'major'
    ? (rootPitchClass + shapeAnchor) % 12
    : rootPitchClass;
  const shapeRootNote = getNoteName(shapeRootPitchClass);

  const pattern: number[][] = [];
  const rootPositions: [number, number][] = [];
  const blueNotePositions: [number, number][] = [];

  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const localStart = Math.max(0, windowStart);
    const localEnd = Math.min(MAX_FRET, windowEnd);

    const desiredNotes = perStringNoteCounts?.[stringIndex] ?? notesPerString;
    let displayFrets: number[] = [];

    if (family === 'blues') {
      const pentatonicFrets = selectFretsForString(
        stringIndex,
        rootPitchClass,
        PENTATONIC_INTERVALS,
        localStart,
        localEnd,
        2
      );
      const blueFrets = collectScaleFretsForString(
        stringIndex,
        rootPitchClass,
        [6],
        localStart,
        localEnd
      );

      if (blueFrets.length > 0) {
        const blueFret = pickBlueFretForString(blueFrets, pentatonicFrets);
        displayFrets = [...new Set([...pentatonicFrets, blueFret])].sort((a, b) => a - b);
      } else {
        displayFrets = pentatonicFrets;
      }
    } else if (family === 'pentatonic') {
      displayFrets = selectFretsForString(
        stringIndex,
        rootPitchClass,
        scaleIntervals,
        localStart,
        localEnd,
        desiredNotes
      );
    } else if (family === 'major' && desiredNotes === 2) {
      // Major box exception strings are explicitly 2NPS and use the lower pair.
      displayFrets = selectLowestFretsForString(
        stringIndex,
        rootPitchClass,
        scaleIntervals,
        localStart,
        localEnd,
        2
      );
    } else {
      displayFrets = selectFretsForString(
        stringIndex,
        rootPitchClass,
        scaleIntervals,
        localStart,
        localEnd,
        desiredNotes
      );
    }

    pattern.push(displayFrets);

    displayFrets.forEach((fret) => {
      const pitchClass = pitchClassAtPosition(stringIndex, fret);
      if (pitchClass === shapeRootPitchClass) {
        rootPositions.push([stringIndex, fret]);
      }

      if (family === 'blues') {
        const intervalFromRoot = (pitchClass - rootPitchClass + 12) % 12;
        if (intervalFromRoot === 6) {
          blueNotePositions.push([stringIndex, fret]);
        }
      }
    });
  }

  const label = family === 'major'
    ? `${shapeRootNote} ${modeName} (Box ${shapeNumber})`
    : family === 'pentatonic'
      ? `${keyRoot} Minor Pentatonic (Box ${shapeNumber})`
      : `${keyRoot} Blues (Box ${shapeNumber})`;

  return {
    id: `${family}-${shapeNumber}`,
    family,
    shapeNumber,
    label,
    keyRoot,
    shapeRootNote,
    shapeRootPitchClass,
    modeName,
    intervals: scaleIntervals,
    windowStart,
    windowEnd,
    pattern,
    rootPositions,
    blueNotePositions,
  };
}

function recalculateShapeDerivedFields(
  shape: BoxShapePattern,
  rootPitchClass: number,
  preserveWindow = false
): BoxShapePattern {
  const rootPositions: [number, number][] = [];
  const blueNotePositions: [number, number][] = [];
  const allFrets = shape.pattern.flat();

  shape.pattern.forEach((frets, stringIndex) => {
    frets.forEach((fret) => {
      const pitchClass = pitchClassAtPosition(stringIndex, fret);
      if (pitchClass === shape.shapeRootPitchClass) {
        rootPositions.push([stringIndex, fret]);
      }

      if (shape.family === 'blues') {
        const intervalFromRoot = (pitchClass - rootPitchClass + 12) % 12;
        if (intervalFromRoot === 6) {
          blueNotePositions.push([stringIndex, fret]);
        }
      }
    });
  });

  return {
    ...shape,
    windowStart: preserveWindow ? shape.windowStart : (allFrets.length ? Math.min(...allFrets) : shape.windowStart),
    windowEnd: preserveWindow ? shape.windowEnd : (allFrets.length ? Math.max(...allFrets) : shape.windowEnd),
    rootPositions,
    blueNotePositions,
  };
}

export function getBoxScaleFamilyOptions(): BoxScaleFamilyOption[] {
  return [
    {
      value: 'major',
      label: 'Major (7 modes)',
      description: 'Seven modal boxes: Ionian through Locrian',
    },
    {
      value: 'pentatonic',
      label: 'Minor Pentatonic (5 boxes)',
      description: 'Five connected pentatonic boxes',
    },
    {
      value: 'blues',
      label: 'Blues (5 boxes)',
      description: 'Minor pentatonic with blue-note targets',
    },
  ];
}

export function getDisplayOrderedBoxPatterns(
  patterns: BoxShapePattern[],
  family: BoxScaleFamily
): BoxShapePattern[] {
  if (patterns.length === 0) {
    return patterns;
  }

  if (family !== 'major') {
    const byShapeNumber = new Map(patterns.map((pattern) => [pattern.shapeNumber, pattern]));
    const candidateOrders = patterns.length >= 6
      ? [
          [4, 5, 6, 1, 2, 3],
          [5, 6, 1, 2, 3, 4],
          [6, 1, 2, 3, 4, 5],
        ]
      : [
          [4, 5, 1, 2, 3],
          [5, 1, 2, 3, 4],
        ];

    const transposeDownOctave = (shape: BoxShapePattern): BoxShapePattern | null => {
      const transposedPattern = shape.pattern.map((stringFrets) =>
        stringFrets
          .map((fret) => (fret >= 12 ? fret - 12 : fret))
          .sort((a, b) => a - b)
      );
      const changed = transposedPattern.some((stringFrets, stringIndex) =>
        stringFrets.some((fret, fretIndex) => fret !== shape.pattern[stringIndex][fretIndex])
      );
      if (!changed) {
        return null;
      }

      return recalculateShapeDerivedFields(
        {
          ...shape,
          pattern: transposedPattern,
          windowStart: Math.max(0, Math.min(...transposedPattern.flat())),
          windowEnd: Math.max(0, Math.max(...transposedPattern.flat())),
        },
        getPitchClass(shape.keyRoot)
      );
    };

    const isDiagonal = (ordered: BoxShapePattern[]): boolean => {
      for (let i = 1; i < ordered.length; i++) {
        const prev = ordered[i - 1];
        const curr = ordered[i];
        if (
          curr.windowStart < prev.windowStart ||
          (curr.windowStart === prev.windowStart && curr.windowEnd < prev.windowEnd)
        ) {
          return false;
        }
      }
      return true;
    };

    for (const preferredOrder of candidateOrders) {
      const ordered = preferredOrder
        .map((shapeNumber) => byShapeNumber.get(shapeNumber))
        .filter((pattern): pattern is BoxShapePattern => Boolean(pattern))
        .map((pattern) => ({ ...pattern, pattern: pattern.pattern.map((s) => [...s]) }));
      const used = new Set(ordered.map((pattern) => pattern.shapeNumber));
      ordered.push(...patterns
        .filter((pattern) => !used.has(pattern.shapeNumber))
        .map((pattern) => ({ ...pattern, pattern: pattern.pattern.map((s) => [...s]) })));

      for (let i = ordered.length - 2; i >= 0; i--) {
        while (
          ordered[i].windowStart > ordered[i + 1].windowStart ||
          (ordered[i].windowStart === ordered[i + 1].windowStart &&
            ordered[i].windowEnd > ordered[i + 1].windowEnd)
        ) {
          const transposed = transposeDownOctave(ordered[i]);
          if (!transposed) {
            break;
          }
          ordered[i] = transposed;
        }
      }

      if (isDiagonal(ordered)) {
        return ordered;
      }
    }
  }

  // Always render as a downward diagonal: top box leftmost, each next box rightward.
  // Tie-break on shape number for deterministic rendering.
  return [...patterns].sort((a, b) =>
    a.windowStart - b.windowStart ||
    a.windowEnd - b.windowEnd ||
    a.shapeNumber - b.shapeNumber
  );
}

export function generateBoxShapePatterns(
  keyRoot: string,
  family: BoxScaleFamily,
  options: BoxShapeOptions = {}
): BoxShapePattern[] {
  const rootPitchClass = getPitchClass(keyRoot);

  if (family === 'major') {
    const majorPerStringNoteCounts = MAJOR_INTERVALS.map((_, index) => {
      const noteCounts = [3, 3, 3, 3, 3, 3];
      noteCounts[MAJOR_2NPS_STRING_INDEX_BY_BOX[index]] = 2;
      return noteCounts;
    });

    const boxes = MAJOR_INTERVALS.map((shapeAnchor, index) =>
      buildShapePattern(
        'major',
        keyRoot,
        rootPitchClass,
        shapeAnchor,
        index + 1,
        MAJOR_INTERVALS,
        3,
        5,
        MAJOR_MODE_NAMES[index],
        majorPerStringNoteCounts[index]
      )
    );

    // Connect low-E string across boxes (box N starts from tail of box N-1).
    for (let boxIndex = 1; boxIndex < boxes.length; boxIndex++) {
      const previous = boxes[boxIndex - 1];
      const current = boxes[boxIndex];
      const prevFrets = [...previous.pattern[0]].sort((a, b) => a - b);
      const carryForward = prevFrets.slice(Math.max(0, prevFrets.length - 2));
      const first = carryForward[0] ?? prevFrets[0] ?? current.pattern[0][0];
      const second = carryForward[1] ?? nextScaleFretOnString(0, rootPitchClass, MAJOR_INTERVALS, first);
      const third = nextScaleFretOnString(0, rootPitchClass, MAJOR_INTERVALS, second);
      current.pattern[0] = [first, second, third];
    }

    // Within each box, each higher string begins from the next scale tone
    // after the last note of the previous (lower) string.
    for (let boxIndex = 0; boxIndex < boxes.length; boxIndex++) {
      const current = boxes[boxIndex];
      const localStart = Math.max(0, current.windowStart);
      const localEnd = Math.min(MAX_FRET, current.windowEnd);

      for (let stringIndex = 1; stringIndex < 6; stringIndex++) {
        const desiredNotes = majorPerStringNoteCounts[boxIndex][stringIndex];
        const previousStringFrets = current.pattern[stringIndex - 1];
        const previousLastFret = previousStringFrets[previousStringFrets.length - 1];
        const previousLastPc = pitchClassAtPosition(stringIndex - 1, previousLastFret);
        const startPitchClass = nextScalePitchClass(rootPitchClass, MAJOR_INTERVALS, previousLastPc);
        const firstFret = chooseRunStartFretForPitchClass(
          stringIndex,
          startPitchClass,
          localStart,
          localEnd,
          rootPitchClass,
          MAJOR_INTERVALS,
          desiredNotes
        );

        const frets = [firstFret];
        while (frets.length < desiredNotes) {
          const next = nextScaleFretOnString(
            stringIndex,
            rootPitchClass,
            MAJOR_INTERVALS,
            frets[frets.length - 1]
          );
          if (frets.includes(next)) {
            break;
          }
          frets.push(next);
        }

        current.pattern[stringIndex] = frets.slice(0, desiredNotes);
      }

      // E strings share the same fret map in standard tuning for these box views.
      current.pattern[5] = [...current.pattern[0]];

      boxes[boxIndex] = recalculateShapeDerivedFields(current, rootPitchClass, true);
    }

    return boxes.map((shape) => recalculateShapeDerivedFields(shape, rootPitchClass, true));
  }

  if (family === 'pentatonic') {
    const boxes = PENTATONIC_INTERVALS.map((shapeAnchor, index) =>
      buildShapePattern(
        'pentatonic',
        keyRoot,
        rootPitchClass,
        shapeAnchor,
        index + 1,
        PENTATONIC_INTERVALS,
        2,
        4
      )
    );

    // Connect boxes: first note in each string of box N equals
    // second note in same string of box N-1.
    for (let boxIndex = 1; boxIndex < boxes.length; boxIndex++) {
      const previous = boxes[boxIndex - 1];
      const current = boxes[boxIndex];

      for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        const prevSecond = previous.pattern[stringIndex][1];
        const next = nextScaleFretOnString(
          stringIndex,
          rootPitchClass,
          PENTATONIC_INTERVALS,
          prevSecond
        );
        current.pattern[stringIndex] = [prevSecond, next];
      }

      boxes[boxIndex] = recalculateShapeDerivedFields(current, rootPitchClass);
    }

    return boxes.map((shape) => recalculateShapeDerivedFields(shape, rootPitchClass));
  }

  const pentatonicBoxes = generateBoxShapePatterns(keyRoot, 'pentatonic');
  const bluesBoxCount = options.includeExperimentalBluesShape ? 6 : 5;

  const bluesBoxes: BoxShapePattern[] = [];

  for (let boxIndex = 0; boxIndex < bluesBoxCount; boxIndex++) {
    const sourceBox = boxIndex < pentatonicBoxes.length
      ? pentatonicBoxes[boxIndex]
      : pentatonicBoxes[boxIndex % pentatonicBoxes.length];
    const pattern = sourceBox.pattern.map((stringFrets) => [...stringFrets]);
    const desiredBlueNotes = (boxIndex === 1 || boxIndex === 2) ? 3 : 2;
    const candidates = selectBlueCandidatesForBox(
      pattern,
      sourceBox.windowStart,
      sourceBox.windowEnd,
      rootPitchClass
    );
    const selectedCandidates: typeof candidates = [];

    // For boxes 2 and 3, force one blue note on high E for clearer top-end resolution.
    if (boxIndex === 1 || boxIndex === 2) {
      const highECandidate = candidates.find((candidate) => candidate.stringIndex === 5);
      if (highECandidate) {
        selectedCandidates.push(highECandidate);
      }
    }

    for (const candidate of candidates) {
      if (selectedCandidates.length >= desiredBlueNotes) {
        break;
      }
      if (selectedCandidates.some((selected) => selected.stringIndex === candidate.stringIndex)) {
        continue;
      }
      selectedCandidates.push(candidate);
    }

    selectedCandidates.slice(0, desiredBlueNotes).forEach(({ stringIndex, fret }) => {
      if (!pattern[stringIndex].includes(fret)) {
        pattern[stringIndex].push(fret);
        pattern[stringIndex].sort((a, b) => a - b);
      }
    });

    const baseShape: BoxShapePattern = {
      ...sourceBox,
      id: `blues-${boxIndex + 1}`,
      family: 'blues',
      shapeNumber: boxIndex + 1,
      label: `${keyRoot} Blues (Box ${boxIndex + 1})`,
      intervals: BLUES_INTERVALS,
      pattern,
    };

    bluesBoxes.push(recalculateShapeDerivedFields(baseShape, rootPitchClass));
  }

  return bluesBoxes;
}
