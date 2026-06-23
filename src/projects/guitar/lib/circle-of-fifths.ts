import type { NoteName } from './types';

export type CircleDirection = 'cw' | 'ccw';

const CANONICAL_CW: readonly NoteName[] = [
  'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb',
];

const ENHARMONIC_TO_CANONICAL: Record<string, NoteName> = {
  'C#': 'Db',
  'D#': 'Eb',
  'Gb': 'F#',
  'G#': 'Ab',
  'A#': 'Bb',
};

export function getCircleOfFifthsOrder(
  startNote: NoteName,
  direction: CircleDirection = 'cw',
): NoteName[] {
  const canonical = ENHARMONIC_TO_CANONICAL[startNote] ?? startNote;
  const startIdx = CANONICAL_CW.indexOf(canonical);
  if (startIdx === -1) {
    throw new Error(`Unknown note: ${startNote}`);
  }

  const rotated = [
    ...CANONICAL_CW.slice(startIdx),
    ...CANONICAL_CW.slice(0, startIdx),
  ];

  if (direction === 'ccw') {
    return [rotated[0], ...rotated.slice(1).reverse()];
  }
  return rotated;
}
