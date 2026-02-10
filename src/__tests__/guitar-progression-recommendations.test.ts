import {
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
});
