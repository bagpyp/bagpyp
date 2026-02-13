import { getPitchClass } from './box-shapes';

const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E

type PentatonicMajorDegree = 'one' | 'two' | 'three' | 'five' | 'six';

const DEGREE_INTERVAL_BY_ID: Record<PentatonicMajorDegree, number> = {
  one: 0,
  two: 2,
  three: 4,
  five: 7,
  six: 9,
};

const DEGREE_BY_INTERVAL = Object.fromEntries(
  Object.entries(DEGREE_INTERVAL_BY_ID).map(([id, interval]) => [interval, id])
) as Record<number, PentatonicMajorDegree>;

export interface PentatonicShapeOverlay {
  id: string;
  points: [number, number][];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  fill?: string;
  fillOpacity?: number;
  dashArray?: string;
}

interface DegreeFretsByString {
  one: number[];
  two: number[];
  three: number[];
  five: number[];
  six: number[];
}

interface DegreePair {
  stringIndex: number;
  left: number;
  right: number;
}

interface FretBounds {
  min: number;
  max: number;
}

interface ShapeCandidate {
  anchorString: number;
  points: [number, number][];
  score: number;
}

function pitchClassAtPosition(stringIndex: number, fret: number): number {
  return (STANDARD_TUNING_PCS[stringIndex] + fret) % 12;
}

function getDegreeAtPosition(
  stringIndex: number,
  fret: number,
  majorRootPitchClass: number
): PentatonicMajorDegree | null {
  const pitchClass = pitchClassAtPosition(stringIndex, fret);
  const interval = (pitchClass - majorRootPitchClass + 12) % 12;
  return DEGREE_BY_INTERVAL[interval] ?? null;
}

function createEmptyDegreeFrets(): DegreeFretsByString {
  return {
    one: [],
    two: [],
    three: [],
    five: [],
    six: [],
  };
}

function collectDegreeFretsByString(
  pattern: number[][],
  majorRootPitchClass: number
): DegreeFretsByString[] {
  return pattern.map((stringFrets, stringIndex) => {
    const degreeFrets = createEmptyDegreeFrets();
    stringFrets
      .slice()
      .sort((a, b) => a - b)
      .forEach((fret) => {
        const degree = getDegreeAtPosition(stringIndex, fret, majorRootPitchClass);
        if (!degree) {
          return;
        }
        degreeFrets[degree].push(fret);
      });
    return degreeFrets;
  });
}

function collectAscendingPairs(
  leftFrets: number[],
  rightFrets: number[]
): { left: number; right: number }[] {
  const pairs: { left: number; right: number }[] = [];
  for (const left of leftFrets) {
    for (const right of rightFrets) {
      if (right > left) {
        pairs.push({ left, right });
      }
    }
  }
  return pairs;
}

function collectDegreePairsOnString(
  degreeFretsByString: DegreeFretsByString[],
  stringIndex: number,
  leftDegree: keyof DegreeFretsByString,
  rightDegree: keyof DegreeFretsByString
): DegreePair[] {
  if (stringIndex < 0 || stringIndex >= degreeFretsByString.length) {
    return [];
  }

  return collectAscendingPairs(
    degreeFretsByString[stringIndex][leftDegree],
    degreeFretsByString[stringIndex][rightDegree]
  ).map((pair) => ({
    stringIndex,
    left: pair.left,
    right: pair.right,
  }));
}

function collectVirtualDegreePairs(
  virtualStringIndex: number,
  leftDegree: PentatonicMajorDegree,
  rightDegree: PentatonicMajorDegree,
  majorRootPitchClass: number,
  fretBounds: FretBounds
): DegreePair[] {
  const wrappedString = ((virtualStringIndex % 6) + 6) % 6;
  const leftPitchClass = (majorRootPitchClass + DEGREE_INTERVAL_BY_ID[leftDegree]) % 12;
  const rightPitchClass = (majorRootPitchClass + DEGREE_INTERVAL_BY_ID[rightDegree]) % 12;
  const leftFrets: number[] = [];
  const rightFrets: number[] = [];
  const minFret = Math.max(0, fretBounds.min - 2);
  const maxFret = Math.min(24, fretBounds.max + 2);

  for (let fret = minFret; fret <= maxFret; fret++) {
    const pitchClass = pitchClassAtPosition(wrappedString, fret);
    if (pitchClass === leftPitchClass) {
      leftFrets.push(fret);
    }
    if (pitchClass === rightPitchClass) {
      rightFrets.push(fret);
    }
  }

  return collectAscendingPairs(leftFrets, rightFrets).map((pair) => ({
    stringIndex: virtualStringIndex,
    left: pair.left,
    right: pair.right,
  }));
}

function getDegreePairsForAnyString(
  degreeFretsByString: DegreeFretsByString[],
  stringIndex: number,
  leftDegree: PentatonicMajorDegree,
  rightDegree: PentatonicMajorDegree,
  majorRootPitchClass: number,
  fretBounds: FretBounds
): DegreePair[] {
  if (stringIndex >= 0 && stringIndex <= 5) {
    return collectDegreePairsOnString(
      degreeFretsByString,
      stringIndex,
      leftDegree,
      rightDegree
    );
  }

  return collectVirtualDegreePairs(
    stringIndex,
    leftDegree,
    rightDegree,
    majorRootPitchClass,
    fretBounds
  );
}

function getPatternFretBounds(pattern: number[][]): FretBounds {
  const allFrets = pattern.flat();
  if (allFrets.length === 0) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...allFrets),
    max: Math.max(...allFrets),
  };
}

function countVirtualRows(rows: number[]): number {
  return rows.filter((row) => row < 0 || row > 5).length;
}

function hasVirtualRows(points: [number, number][]): boolean {
  return points.some(([stringIndex]) => stringIndex < 0 || stringIndex > 5);
}

function clampFret(fret: number): number {
  return Math.max(0, Math.min(24, fret));
}

function makeSyntheticPair(stringIndex: number, left: number, right: number): DegreePair {
  const clampedLeft = clampFret(Math.round(left));
  let clampedRight = clampFret(Math.round(right));
  if (clampedRight <= clampedLeft) {
    clampedRight = clampFret(clampedLeft + 2);
  }
  return {
    stringIndex,
    left: clampedLeft,
    right: clampedRight,
  };
}

function buildBestRectangleForBottomString(
  degreeFretsByString: DegreeFretsByString[],
  bottomString: number,
  majorRootPitchClass: number,
  fretBounds: FretBounds
): ShapeCandidate | null {
  const topString = bottomString + 1;
  const bottomPairs = getDegreePairsForAnyString(
    degreeFretsByString,
    bottomString,
    'three',
    'five',
    majorRootPitchClass,
    fretBounds
  );
  const topPairs = getDegreePairsForAnyString(
    degreeFretsByString,
    topString,
    'six',
    'one',
    majorRootPitchClass,
    fretBounds
  );

  let best: ShapeCandidate | null = null;
  const virtualPenalty = countVirtualRows([bottomString, topString]) * 2;
  const addCandidate = (
    bottomPair: DegreePair,
    topPair: DegreePair,
    syntheticRowCount: number
  ) => {
    const bottomWidth = bottomPair.right - bottomPair.left;
    const topWidth = topPair.right - topPair.left;
    const leftEdgeDrift = Math.abs(bottomPair.left - topPair.left);
    const rightEdgeDrift = Math.abs(bottomPair.right - topPair.right);
    const widthDrift = Math.abs(bottomWidth - topWidth);
    const score = leftEdgeDrift
      + rightEdgeDrift
      + (widthDrift * 0.75)
      + virtualPenalty
      + (syntheticRowCount * 4);

    const candidate: ShapeCandidate = {
      anchorString: bottomString,
      points: [
        [bottomString, bottomPair.left], // 3
        [bottomString, bottomPair.right], // 5
        [topString, topPair.right], // 1
        [topString, topPair.left], // 6
        [bottomString, bottomPair.left],
      ],
      score,
    };

    if (!best || candidate.score < best.score) {
      best = candidate;
    }
  };

  for (const bottomPair of bottomPairs) {
    for (const topPair of topPairs) {
      addCandidate(bottomPair, topPair, 0);
    }
  }

  if (bottomPairs.length > 0 && topPairs.length === 0 && topString > 5) {
    for (const bottomPair of bottomPairs) {
      const syntheticTop = makeSyntheticPair(
        topString,
        bottomPair.left,
        bottomPair.right
      );
      addCandidate(bottomPair, syntheticTop, 1);
    }
  }

  if (topPairs.length > 0 && bottomPairs.length === 0 && bottomString < 0) {
    for (const topPair of topPairs) {
      const syntheticBottom = makeSyntheticPair(
        bottomString,
        topPair.left,
        topPair.right
      );
      addCandidate(syntheticBottom, topPair, 1);
    }
  }

  return best;
}

function buildBestStackForBottomString(
  degreeFretsByString: DegreeFretsByString[],
  bottomString: number,
  majorRootPitchClass: number,
  fretBounds: FretBounds
): ShapeCandidate | null {
  const middleString = bottomString + 1;
  const topString = bottomString + 2;
  const bottomPairs = getDegreePairsForAnyString(
    degreeFretsByString,
    bottomString,
    'two',
    'three',
    majorRootPitchClass,
    fretBounds
  );
  const middlePairs = getDegreePairsForAnyString(
    degreeFretsByString,
    middleString,
    'five',
    'six',
    majorRootPitchClass,
    fretBounds
  );
  const topPairs = getDegreePairsForAnyString(
    degreeFretsByString,
    topString,
    'one',
    'two',
    majorRootPitchClass,
    fretBounds
  );

  let best: ShapeCandidate | null = null;
  const virtualPenalty = countVirtualRows([bottomString, middleString, topString]) * 2;
  const addCandidate = (
    bottomPair: DegreePair,
    middlePair: DegreePair,
    topPair: DegreePair,
    syntheticRowCount: number
  ) => {
    const widthBottom = bottomPair.right - bottomPair.left;
    const widthMiddle = middlePair.right - middlePair.left;
    const widthTop = topPair.right - topPair.left;
    const leftEdgeDrift = Math.abs(bottomPair.left - middlePair.left)
      + Math.abs(middlePair.left - topPair.left);
    const rightEdgeDrift = Math.abs(bottomPair.right - middlePair.right)
      + Math.abs(middlePair.right - topPair.right);
    const widthDrift = Math.abs(widthBottom - widthMiddle)
      + Math.abs(widthMiddle - widthTop);
    const overWidePenalty = Math.max(0, Math.max(widthBottom, widthMiddle, widthTop) - 5);
    const score = leftEdgeDrift
      + rightEdgeDrift
      + widthDrift
      + overWidePenalty
      + virtualPenalty
      + (syntheticRowCount * 4);

    const candidate: ShapeCandidate = {
      anchorString: bottomString,
      // Required traversal order (G major pentatonic numbering):
      // 2 -> 3 -> 6 -> 2' -> 1 -> 5 -> 2
      points: [
        [bottomString, bottomPair.left], // 2
        [bottomString, bottomPair.right], // 3
        [middleString, middlePair.right], // 6
        [topString, topPair.right], // 2'
        [topString, topPair.left], // 1
        [middleString, middlePair.left], // 5
        [bottomString, bottomPair.left], // 2
      ],
      score,
    };

    if (!best || candidate.score < best.score) {
      best = candidate;
    }
  };

  for (const bottomPair of bottomPairs) {
    for (const middlePair of middlePairs) {
      for (const topPair of topPairs) {
        addCandidate(bottomPair, middlePair, topPair, 0);
      }
    }
  }

  if (bottomPairs.length > 0 && middlePairs.length > 0 && topPairs.length === 0 && topString > 5) {
    for (const bottomPair of bottomPairs) {
      for (const middlePair of middlePairs) {
        const syntheticTop = makeSyntheticPair(
          topString,
          middlePair.left + (middlePair.left - bottomPair.left),
          middlePair.right + (middlePair.right - bottomPair.right)
        );
        addCandidate(bottomPair, middlePair, syntheticTop, 1);
      }
    }
  }

  if (middlePairs.length > 0 && topPairs.length > 0 && bottomPairs.length === 0 && bottomString < 0) {
    for (const middlePair of middlePairs) {
      for (const topPair of topPairs) {
        const syntheticBottom = makeSyntheticPair(
          bottomString,
          middlePair.left + (middlePair.left - topPair.left),
          middlePair.right + (middlePair.right - topPair.right)
        );
        addCandidate(syntheticBottom, middlePair, topPair, 1);
      }
    }
  }

  if (bottomPairs.length > 0 && topPairs.length > 0 && middlePairs.length === 0 && middleString > 5) {
    for (const bottomPair of bottomPairs) {
      for (const topPair of topPairs) {
        const syntheticMiddle = makeSyntheticPair(
          middleString,
          (bottomPair.left + topPair.left) / 2,
          (bottomPair.right + topPair.right) / 2
        );
        addCandidate(bottomPair, syntheticMiddle, topPair, 1);
      }
    }
  }

  if (bottomPairs.length > 0 && middlePairs.length === 0 && topPairs.length === 0 && middleString > 5) {
    for (const bottomPair of bottomPairs) {
      const syntheticMiddle = makeSyntheticPair(
        middleString,
        bottomPair.left,
        bottomPair.right
      );
      const syntheticTop = makeSyntheticPair(
        topString,
        bottomPair.left,
        bottomPair.right
      );
      addCandidate(bottomPair, syntheticMiddle, syntheticTop, 2);
    }
  }

  if (middlePairs.length > 0 && bottomPairs.length === 0 && topPairs.length === 0 && bottomString < 0 && topString > 5) {
    for (const middlePair of middlePairs) {
      const syntheticBottom = makeSyntheticPair(
        bottomString,
        middlePair.left,
        middlePair.right
      );
      const syntheticTop = makeSyntheticPair(
        topString,
        middlePair.left,
        middlePair.right
      );
      addCandidate(syntheticBottom, middlePair, syntheticTop, 2);
    }
  }

  if (topPairs.length > 0 && bottomPairs.length === 0 && middlePairs.length === 0 && bottomString < 0) {
    for (const topPair of topPairs) {
      const syntheticBottom = makeSyntheticPair(
        bottomString,
        topPair.left,
        topPair.right
      );
      const syntheticMiddle = makeSyntheticPair(
        middleString,
        topPair.left,
        topPair.right
      );
      addCandidate(syntheticBottom, syntheticMiddle, topPair, 2);
    }
  }

  return best;
}

function collectRectangleCandidates(
  degreeFretsByString: DegreeFretsByString[],
  majorRootPitchClass: number,
  fretBounds: FretBounds
): ShapeCandidate[] {
  const candidates: ShapeCandidate[] = [];
  for (let bottomString = -1; bottomString <= 5; bottomString++) {
    const candidate = buildBestRectangleForBottomString(
      degreeFretsByString,
      bottomString,
      majorRootPitchClass,
      fretBounds
    );
    if (candidate) {
      candidates.push(candidate);
    }
  }
  return candidates.sort((a, b) => a.score - b.score);
}

function collectStackCandidates(
  degreeFretsByString: DegreeFretsByString[],
  majorRootPitchClass: number,
  fretBounds: FretBounds
): ShapeCandidate[] {
  const candidates: ShapeCandidate[] = [];
  for (let bottomString = -2; bottomString <= 5; bottomString++) {
    const candidate = buildBestStackForBottomString(
      degreeFretsByString,
      bottomString,
      majorRootPitchClass,
      fretBounds
    );
    if (candidate) {
      candidates.push(candidate);
    }
  }
  return candidates.sort((a, b) => a.score - b.score);
}

function getPointsKey(points: [number, number][]): string {
  return points.map(([stringIndex, fret]) => `${stringIndex}:${fret}`).join('|');
}

function getDegreeAtOverlayPoint(
  stringIndex: number,
  fret: number,
  majorRootPitchClass: number
): PentatonicMajorDegree | null {
  const wrappedString = ((stringIndex % 6) + 6) % 6;
  const pitchClass = pitchClassAtPosition(wrappedString, fret);
  const interval = (pitchClass - majorRootPitchClass + 12) % 12;
  return DEGREE_BY_INTERVAL[interval] ?? null;
}

function isCanonicalStackOrder(
  points: [number, number][],
  majorRootPitchClass: number
): boolean {
  const expected: PentatonicMajorDegree[] = ['two', 'three', 'six', 'two', 'one', 'five', 'two'];
  if (points.length !== expected.length) {
    return false;
  }

  const actual = points.map(([stringIndex, fret]) => (
    getDegreeAtOverlayPoint(stringIndex, fret, majorRootPitchClass)
  ));

  return actual.every((degree, index) => degree === expected[index]);
}

function chooseBestOverlays(
  rectangleCandidates: ShapeCandidate[],
  stackCandidates: ShapeCandidate[],
  majorRootPitchClass: number
): {
  rectangle: [number, number][] | null;
  extensionRectangles: [number, number][][];
  stacks: [number, number][][];
} {
  const bestRectangleByAnchor = new Map<number, ShapeCandidate>();
  rectangleCandidates.forEach((candidate) => {
    if (!bestRectangleByAnchor.has(candidate.anchorString)) {
      bestRectangleByAnchor.set(candidate.anchorString, candidate);
    }
  });

  const bestStackByAnchor = new Map<number, ShapeCandidate>();
  stackCandidates.forEach((candidate) => {
    if (!bestStackByAnchor.has(candidate.anchorString)) {
      bestStackByAnchor.set(candidate.anchorString, candidate);
    }
  });

  const primaryRectangle = rectangleCandidates.find(
    (candidate) => candidate.anchorString >= 0 && candidate.anchorString <= 4
  ) ?? rectangleCandidates[0] ?? null;

  const stacks: [number, number][][] = [];
  const stackKeys = new Set<string>();
  const addStackByAnchor = (anchor: number, requireVirtual = false) => {
    const candidate = bestStackByAnchor.get(anchor);
    if (!candidate) {
      return;
    }
    if (requireVirtual && !hasVirtualRows(candidate.points)) {
      return;
    }
    const key = getPointsKey(candidate.points);
    if (stackKeys.has(key)) {
      return;
    }
    stackKeys.add(key);
    stacks.push(candidate.points);
  };

  const canonicalStack = stackCandidates.find((candidate) => (
    isCanonicalStackOrder(candidate.points, majorRootPitchClass)
  ));
  if (canonicalStack) {
    const key = getPointsKey(canonicalStack.points);
    stackKeys.add(key);
    stacks.push(canonicalStack.points);
  }

  if (primaryRectangle) {
    const rectangleBottom = primaryRectangle.anchorString;
    const desiredStackAnchors: Array<{ anchor: number; requireVirtual?: boolean }> = [
      { anchor: rectangleBottom - 2 }, // lower stack
      { anchor: rectangleBottom + 1 }, // upper stack
      { anchor: rectangleBottom - 3, requireVirtual: true }, // outer lower partial stack (2/3 or 1/3)
      { anchor: rectangleBottom + 2, requireVirtual: true }, // outer upper partial stack (2/3 or 1/3)
      { anchor: rectangleBottom - 4, requireVirtual: true }, // extra outer lower partial stack
      { anchor: rectangleBottom + 3, requireVirtual: true }, // extra outer upper partial stack
    ];

    desiredStackAnchors.forEach(({ anchor, requireVirtual }) => (
      addStackByAnchor(anchor, requireVirtual ?? false)
    ));
  }

  if (stacks.length === 0 && stackCandidates[0]) {
    stacks.push(stackCandidates[0].points);
  }

  const extensionRectangles: [number, number][][] = [];
  const rectangleKeys = new Set<string>();
  if (primaryRectangle) {
    rectangleKeys.add(getPointsKey(primaryRectangle.points));
  }

  stacks.forEach((stackPoints) => {
    const stackBottom = stackPoints[0][0];
    const extensionAnchors = [stackBottom - 1, stackBottom + 2];

    extensionAnchors.forEach((anchor) => {
      const candidate = bestRectangleByAnchor.get(anchor);
      if (!candidate) {
        return;
      }

      // Keep only clipped (half) rectangles for extensions.
      if (anchor >= 0 && anchor + 1 <= 5) {
        return;
      }

      const key = getPointsKey(candidate.points);
      if (rectangleKeys.has(key)) {
        return;
      }
      rectangleKeys.add(key);
      extensionRectangles.push(candidate.points);
    });
  });

  const hasTopBoundaryRectangle = extensionRectangles.some((points) => (
    points.some(([stringIndex]) => stringIndex > 5)
  ));
  const hasBottomBoundaryRectangle = extensionRectangles.some((points) => (
    points.some(([stringIndex]) => stringIndex < 0)
  ));

  const maybeAddBoundaryRectangle = (boundaryAnchor: number) => {
    const candidate = bestRectangleByAnchor.get(boundaryAnchor);
    if (!candidate || !hasVirtualRows(candidate.points)) {
      return;
    }
    const key = getPointsKey(candidate.points);
    if (rectangleKeys.has(key)) {
      return;
    }
    rectangleKeys.add(key);
    extensionRectangles.push(candidate.points);
  };

  if (!hasTopBoundaryRectangle) {
    maybeAddBoundaryRectangle(5);
  }
  if (!hasBottomBoundaryRectangle) {
    maybeAddBoundaryRectangle(-1);
  }

  return {
    rectangle: primaryRectangle?.points ?? null,
    extensionRectangles,
    stacks,
  };
}

export function buildPentatonicShapeOverlays(
  pattern: number[][],
  majorCenterKey: string
): PentatonicShapeOverlay[] {
  const majorRootPitchClass = getPitchClass(majorCenterKey);
  const degreeFretsByString = collectDegreeFretsByString(pattern, majorRootPitchClass);
  const fretBounds = getPatternFretBounds(pattern);
  const rectangleCandidates = collectRectangleCandidates(
    degreeFretsByString,
    majorRootPitchClass,
    fretBounds
  );
  const stackCandidates = collectStackCandidates(
    degreeFretsByString,
    majorRootPitchClass,
    fretBounds
  );
  const { rectangle, extensionRectangles, stacks } = chooseBestOverlays(
    rectangleCandidates,
    stackCandidates,
    majorRootPitchClass
  );

  const overlays: PentatonicShapeOverlay[] = [];

  if (rectangle) {
    overlays.push({
      id: 'rectangle',
      points: rectangle,
      stroke: '#ef4444',
      strokeWidth: 5,
      opacity: 0.9,
      fill: '#ef4444',
      fillOpacity: 0.5,
    });
  }

  extensionRectangles.forEach((rectanglePoints, index) => {
    const virtual = hasVirtualRows(rectanglePoints);
    overlays.push({
      id: `rectangle-ext-${index + 1}`,
      points: rectanglePoints,
      stroke: '#ef4444',
      strokeWidth: 5,
      opacity: virtual ? 0.8 : 0.85,
      fill: '#ef4444',
      fillOpacity: virtual ? 0.25 : 0.45,
    });
  });

  stacks.forEach((stackPoints, index) => {
    const virtual = hasVirtualRows(stackPoints);
    overlays.push({
      id: index === 0 ? 'stack' : `stack-${index + 1}`,
      points: stackPoints,
      stroke: '#3b82f6',
      strokeWidth: 5,
      opacity: virtual ? 0.85 : 0.9,
      fill: '#3b82f6',
      fillOpacity: virtual ? 0.25 : 0.5,
    });
  });

  return overlays;
}
