import {
  buildChordOffsetsMs,
  getChordPitchClassesFromSymbol,
  getActiveChordIndex,
  getLoopPositionMs,
  getLoopProgress,
  getProgressionSyncKey,
  parseChordSequence,
} from '@/lib/guitar/looper-sync';

describe('guitar looper sync helpers', () => {
  it('parses chord sequences while ignoring bar separators', () => {
    expect(parseChordSequence('I7 I7 | IV7 IV7 | I7')).toEqual(['I7', 'I7', 'IV7', 'IV7', 'I7']);
  });

  it('builds chord offsets when the first chord starts at loop start', () => {
    const offsets = buildChordOffsetsMs(4, 8000, true, [2000, 4000, 6000]);
    expect(offsets).toEqual([0, 2000, 4000, 6000]);
  });

  it('builds chord offsets when the first chord does not start at loop start', () => {
    const offsets = buildChordOffsetsMs(4, 8000, false, [500, 2500, 4500, 6500]);
    expect(offsets).toEqual([500, 2500, 4500, 6500]);
  });

  it('reports active chord index across loop wrap-around', () => {
    const offsets = [500, 2500, 4500, 6500];
    expect(getActiveChordIndex(offsets, 700, 8000)).toBe(0);
    expect(getActiveChordIndex(offsets, 3000, 8000)).toBe(1);
    expect(getActiveChordIndex(offsets, 7000, 8000)).toBe(3);
    // Before first offset means previous-cycle chord 4.
    expect(getActiveChordIndex(offsets, 100, 8000)).toBe(3);
  });

  it('normalizes loop position and progress', () => {
    expect(getLoopPositionMs(8500, 8000)).toBe(500);
    expect(getLoopProgress(8500, 8000)).toBeCloseTo(500 / 8000);
  });

  it('builds stable sync keys per tonal context', () => {
    const key = getProgressionSyncKey(
      { id: 'ionianPop' },
      'major',
      'G',
      'Major (7 modes)'
    );
    expect(key).toBe('major:G:Major (7 modes):ionianPop');
  });

  it('maps chord symbols to pitch classes for looper chord highlighting', () => {
    expect(getChordPitchClassesFromSymbol('Cm')).toEqual([0, 3, 7]);
    expect(getChordPitchClassesFromSymbol('Bb')).toEqual([10, 2, 5]);
    expect(getChordPitchClassesFromSymbol('G7')).toEqual([7, 11, 2, 5]);
  });
});
