import { describe, it, expect } from 'vitest';

import { getCircleOfFifthsOrder } from '../lib/circle-of-fifths';

describe('getCircleOfFifthsOrder', () => {
  it('returns the canonical F-anchored clockwise order by default', () => {
    expect(getCircleOfFifthsOrder('F')).toEqual([
      'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb',
    ]);
  });

  it('rotates to start at C clockwise', () => {
    expect(getCircleOfFifthsOrder('C', 'cw')).toEqual([
      'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F',
    ]);
  });

  it('rotates to start at A clockwise', () => {
    expect(getCircleOfFifthsOrder('A', 'cw')).toEqual([
      'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D',
    ]);
  });

  it('reverses to counter-clockwise while keeping the start note in place', () => {
    expect(getCircleOfFifthsOrder('F', 'ccw')).toEqual([
      'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G', 'C',
    ]);
  });

  it('counter-clockwise from C wraps the other way', () => {
    expect(getCircleOfFifthsOrder('C', 'ccw')).toEqual([
      'C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G',
    ]);
  });

  it('accepts enharmonic spellings for the start note', () => {
    expect(getCircleOfFifthsOrder('C#', 'cw')).toEqual(
      getCircleOfFifthsOrder('Db', 'cw'),
    );
    expect(getCircleOfFifthsOrder('A#', 'cw')).toEqual(
      getCircleOfFifthsOrder('Bb', 'cw'),
    );
  });

  it('always returns 12 unique notes', () => {
    const starts = ['F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb'];
    const directions = ['cw', 'ccw'] as const;
    for (const start of starts) {
      for (const dir of directions) {
        const out = getCircleOfFifthsOrder(start, dir);
        expect(out).toHaveLength(12);
        expect(new Set(out).size).toBe(12);
      }
    }
  });

  it('throws on unknown notes', () => {
    expect(() => getCircleOfFifthsOrder('H')).toThrow();
  });
});
