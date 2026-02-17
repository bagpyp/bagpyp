import {
  buildChordOffsetsMs,
  detectLoopSyncFromOnsets,
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
    expect(getChordPitchClassesFromSymbol('D/F#')).toEqual([2, 6, 9]);
    expect(getChordPitchClassesFromSymbol('  Em7b5  ')).toEqual([4, 7, 10, 2]);
  });

  it('safely returns an empty list for invalid chord symbols', () => {
    expect(getChordPitchClassesFromSymbol(undefined)).toEqual([]);
    expect(getChordPitchClassesFromSymbol(null)).toEqual([]);
    expect(getChordPitchClassesFromSymbol('')).toEqual([]);
  });

  it('detects loop duration and chord offsets from onset timing', () => {
    const simulatedOnsets = [
      120, 1080, 2060, 3020,
      4120, 5100, 6060, 7040,
      8120, 9100, 10060, 11040,
    ];
    const result = detectLoopSyncFromOnsets({
      onsetTimesMs: simulatedOnsets,
      chordCount: 4,
      startedWithFirstChord: true,
    });

    expect(result).not.toBeNull();
    expect(result?.loopDurationMs).toBeGreaterThanOrEqual(3900);
    expect(result?.loopDurationMs).toBeLessThanOrEqual(4100);
    expect(result?.chordOffsetsMs.length).toBe(4);
    expect(result?.chordOffsetsMs[0]).toBe(0);
  });

  it('returns null when there are not enough onsets for auto sync', () => {
    const result = detectLoopSyncFromOnsets({
      onsetTimesMs: [100, 450, 900],
      chordCount: 4,
      startedWithFirstChord: true,
    });
    expect(result).toBeNull();
  });
});
