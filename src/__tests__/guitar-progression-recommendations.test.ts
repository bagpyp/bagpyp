import {
  getChordCheatSheetData,
  getPracticeProgressions,
  renderRomanProgressionToChords,
} from '@/lib/guitar/progression-recommendations';

describe('guitar progression recommendations', () => {
  it('renders 12-bar blues numerals into key-specific chord names', () => {
    const rendered = renderRomanProgressionToChords(
      'I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7',
      'E'
    );

    expect(rendered).toBe('E7 E7 E7 E7 | A7 A7 E7 E7 | B7 A7 E7 B7');
  });

  it('uses flat spellings for flat keys and flat scale-degree tokens', () => {
    const rendered = renderRomanProgressionToChords('I bVII IV', 'Bb');
    expect(rendered).toBe('Bb Ab Eb');
  });

  it('prioritizes 12-bar blues when b5 is enabled over minor pentatonic', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'minor',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'off',
      visibleTargetIntervals: [6],
    });

    expect(progressions[0]?.id).toBe('blues12');
    expect(progressions[0]?.chordNames).toBe('E7 E7 E7 E7 | A7 A7 E7 E7 | B7 A7 E7 B7');
  });

  it('maps major mixolydian heptatonic view to mixolydian-friendly progressions', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'major',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'mixolydian',
      visibleTargetIntervals: [5, 10],
    });

    expect(progressions.some((progression) => progression.id === 'mixolydianDrive')).toBe(true);
    const mixolydian = progressions.find((progression) => progression.id === 'mixolydianDrive');
    expect(mixolydian?.chordNames).toBe('G7 F C G7');
  });

  it('prioritizes mixolydian-blues hybrids when b3 is combined with 4 and b7', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'major',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'mixolydian',
      visibleTargetIntervals: [3, 5, 10],
    });

    expect(progressions[0]?.id).toBe('mixoBluesColor');
    expect(progressions.some((progression) => progression.id === 'blues12')).toBe(true);
    expect(progressions.some((progression) => progression.id === 'mixoBluesBackdoor')).toBe(true);
  });

  it('keeps minor phrygian mode recommendations phrygian-pure', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'minor',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'phrygian',
      visibleTargetIntervals: [1, 8],
    });

    expect(progressions.length).toBeGreaterThanOrEqual(6);
    expect(progressions.some((progression) => progression.id === 'phrygianVamp')).toBe(true);
    expect(progressions.some((progression) => progression.id === 'dorianVamp')).toBe(false);
    expect(progressions.some((progression) => progression.id === 'minorRock')).toBe(false);
  });

  it('switches to phrygian-tritone recommendations when b5 is added in phrygian mode', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'minor',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'phrygian',
      visibleTargetIntervals: [1, 6, 8],
    });

    expect(progressions[0]?.id).toBe('phrygianTritoneBite');
    expect(progressions.some((progression) => progression.id === 'phrygianTritonePivot')).toBe(true);
    expect(progressions.some((progression) => progression.id === 'phrygianB5Drone')).toBe(true);
  });

  it('surfaces locrian-specific recommendations in locrian mode', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'minor',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'locrian',
      visibleTargetIntervals: [1, 6],
    });

    expect(progressions[0]?.id).toBe('locrianHalfDimPedal');
    expect(progressions[0]?.chordNames).toBe('Em7b5 F Dm7 Em7b5');
    expect(progressions.some((progression) => progression.id === 'locrianTritoneFrame')).toBe(true);
  });

  it('returns a larger progression set across quality/key combinations', () => {
    const minorPent = getPracticeProgressions({
      tonalCenterMode: 'minor',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'off',
      visibleTargetIntervals: [],
    });
    const majorPent = getPracticeProgressions({
      tonalCenterMode: 'major',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'off',
      visibleTargetIntervals: [],
    });
    const majorModes = getPracticeProgressions({
      tonalCenterMode: 'major',
      scaleFamily: 'major',
      majorCenterKey: 'Bb',
      minorCenterKey: 'G',
      hexatonicMode: 'off',
      visibleTargetIntervals: [],
    });

    expect(minorPent.length).toBeGreaterThanOrEqual(7);
    expect(majorPent.length).toBeGreaterThanOrEqual(7);
    expect(majorModes.length).toBeGreaterThanOrEqual(8);
    expect(majorModes.some((progression) => progression.chordNames.includes('Bb'))).toBe(true);
    expect(majorModes.some((progression) => progression.id === 'ionianPop')).toBe(true);
    const ionianPop = majorModes.find((progression) => progression.id === 'ionianPop');
    expect(ionianPop?.chordNames).toBe('Bb F Gm Eb');
  });

  it('builds cheat-sheet chords and deduped note pool in appearance order', () => {
    const data = getChordCheatSheetData([
      {
        id: 'p1',
        title: 'P1',
        romanNumerals: 'I7 IV7',
        chordNames: 'E7 A7',
        whyItFits: '',
      },
      {
        id: 'p2',
        title: 'P2',
        romanNumerals: 'V7 I',
        chordNames: 'B7 E',
        whyItFits: '',
      },
    ]);

    expect(data.entries.map((entry) => entry.chordSymbol)).toEqual(['E7', 'A7', 'B7', 'E']);
    expect(data.entries[0]?.notes).toEqual(['E', 'G#', 'B', 'D']);
    expect(data.entries[1]?.notes).toEqual(['A', 'C#', 'E', 'G']);
    expect(data.entries[2]?.notes).toEqual(['B', 'D#', 'F#', 'A']);
    expect(data.entries[3]?.notes).toEqual(['E', 'G#', 'B']);
    expect(data.uniqueNotes).toEqual(['E', 'G#', 'B', 'D', 'A', 'C#', 'G', 'D#', 'F#']);
  });
});
