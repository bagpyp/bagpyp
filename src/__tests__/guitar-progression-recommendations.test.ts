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
      activeSingleTargetToneIds: ['flatFive'],
    });

    expect(progressions[0]?.id).toBe('blues12');
    expect(progressions[0]?.chordNames).toBe('E7 E7 E7 E7 | A7 A7 E7 E7 | B7 A7 E7 B7');
  });

  it('maps major phrygian hexatonic view to mixolydian-friendly progressions', () => {
    const progressions = getPracticeProgressions({
      tonalCenterMode: 'major',
      scaleFamily: 'pentatonic',
      majorCenterKey: 'G',
      minorCenterKey: 'E',
      hexatonicMode: 'phrygian',
      activeSingleTargetToneIds: [],
    });

    expect(progressions.some((progression) => progression.id === 'mixolydianDrive')).toBe(true);
    const mixolydian = progressions.find((progression) => progression.id === 'mixolydianDrive');
    expect(mixolydian?.chordNames).toBe('G7 F C G7');
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
