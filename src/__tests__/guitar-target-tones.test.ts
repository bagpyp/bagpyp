import { getPitchClass } from '@/lib/guitar/box-shapes';
import {
  DEFAULT_SINGLE_TARGET_TONE_STATE,
  HEXATONIC_MODE_OPTIONS,
  HEXATONIC_MODE_RING_PALETTE,
  TARGET_TONE_BY_ID,
  getIntervalEffectDescriptionFromSemitones,
  getRomanNumeralLabelFromSemitones,
  getActiveTargetTones,
  getHexatonicModeDisplayLabel,
  getHexatonicModeTonalCenter,
  getModeLockedSingleTargetToneIds,
  getTargetToneToggleLabel,
  getTargetTonePitchClass,
  getVisibleTargetTones,
} from '@/lib/guitar/target-tones';

describe('guitar target tones', () => {
  function config(id: keyof typeof TARGET_TONE_BY_ID) {
    return TARGET_TONE_BY_ID[id];
  }

  it('maps b7 from major context for G major / E minor', () => {
    const flatSeven = getTargetTonePitchClass(config('flatSeven'), 'G', 'E');

    expect(flatSeven).toBe(getPitchClass('F'));
    expect(flatSeven).not.toBe(getPitchClass('D'));
  });

  it('keeps b5 and M3 rooted in the minor context', () => {
    const flatFive = getTargetTonePitchClass(config('flatFive'), 'G', 'E');
    const majorThird = getTargetTonePitchClass(config('majorThird'), 'G', 'E');

    expect(flatFive).toBe(getPitchClass('A#')); // E minor b5
    expect(majorThird).toBe(getPitchClass('G#')); // E major 3rd
  });

  it('defines heptatonic mode presets as two-note additions across all seven modes', () => {
    const ionian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'ionian');
    const dorian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'dorian');
    const phrygian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'phrygian');
    const lydian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'lydian');
    const mixolydian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'mixolydian');
    const aeolian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'aeolian');
    const locrian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'locrian');

    expect(ionian?.toneIds).toEqual(['majorSecond', 'flatSix']);
    expect(dorian?.toneIds).toEqual(['majorSecond', 'majorSixth']);
    expect(phrygian?.toneIds).toEqual(['flatSecond', 'flatSix']);
    expect(lydian?.toneIds).toEqual(['majorSecond', 'majorSixth']);
    expect(mixolydian?.toneIds).toEqual(['flatSecond', 'flatSix']);
    expect(aeolian?.toneIds).toEqual(['majorSecond', 'flatSix']);
    expect(locrian?.toneIds).toEqual(['flatSecond', 'flatFive']);
  });

  it('resolves dorian/aeolian/phrygian additions for G major / E minor', () => {
    const dorianSecond = getTargetTonePitchClass(config('majorSecond'), 'G', 'E');
    const dorianSixth = getTargetTonePitchClass(config('majorSixth'), 'G', 'E');
    const aeolianSixth = getTargetTonePitchClass(config('flatSix'), 'G', 'E');
    const phrygianSecond = getTargetTonePitchClass(config('flatSecond'), 'G', 'E');

    expect(dorianSecond).toBe(getPitchClass('F#'));
    expect(dorianSixth).toBe(getPitchClass('C#'));
    expect(aeolianSixth).toBe(getPitchClass('C'));
    expect(phrygianSecond).toBe(getPitchClass('F'));
  });

  it('uses canonical mode labels and tonal-center targets for mode selection', () => {
    expect(getHexatonicModeDisplayLabel('ionian')).toBe('Ionian');
    expect(getHexatonicModeDisplayLabel('mixolydian')).toBe('Mixolydian');
    expect(getHexatonicModeDisplayLabel('aeolian')).toBe('Aeolian');

    expect(getHexatonicModeTonalCenter('ionian')).toBe('major');
    expect(getHexatonicModeTonalCenter('lydian')).toBe('major');
    expect(getHexatonicModeTonalCenter('mixolydian')).toBe('major');
    expect(getHexatonicModeTonalCenter('dorian')).toBe('minor');
    expect(getHexatonicModeTonalCenter('phrygian')).toBe('minor');
    expect(getHexatonicModeTonalCenter('aeolian')).toBe('minor');
    expect(getHexatonicModeTonalCenter('locrian')).toBe('minor');
  });

  it('maps target-tone labels to the active tonal center interval naming', () => {
    const flatFive = TARGET_TONE_BY_ID.flatFive;
    const majorSeventh = TARGET_TONE_BY_ID.majorSeventh;

    expect(getTargetToneToggleLabel(flatFive, 'minor', 'G', 'E')).toBe('Add b5 targets');
    expect(getTargetToneToggleLabel(flatFive, 'major', 'G', 'E')).toBe('Add b3 targets');
    expect(getTargetToneToggleLabel(majorSeventh, 'minor', 'G', 'E')).toBe('Add 7 targets');
    expect(getTargetToneToggleLabel(majorSeventh, 'major', 'G', 'E')).toBe('Add b6 targets');
  });

  it('exposes roman numerals and interval descriptions for display metadata', () => {
    expect(getRomanNumeralLabelFromSemitones(3)).toBe('bIII');
    expect(getRomanNumeralLabelFromSemitones(8)).toBe('bVI');
    expect(getIntervalEffectDescriptionFromSemitones(3)).toBe('Classic blues bite');
    expect(getIntervalEffectDescriptionFromSemitones(11)).toBe('Leading-tone pull');
  });

  it('uses green halos for hexatonic mode tones and single-target palette on collisions', () => {
    const modeOnly = getActiveTargetTones(DEFAULT_SINGLE_TARGET_TONE_STATE, 'phrygian');
    const flatSecondMode = modeOnly.find((tone) => tone.config.id === 'flatSecond');
    const flatSixMode = modeOnly.find((tone) => tone.config.id === 'flatSix');

    expect(flatSecondMode?.source).toBe('hexatonic');
    expect(flatSecondMode?.palette).toEqual(HEXATONIC_MODE_RING_PALETTE);
    expect(flatSixMode?.source).toBe('hexatonic');
    expect(flatSixMode?.palette).toEqual(HEXATONIC_MODE_RING_PALETTE);

    const withCollision = getActiveTargetTones(
      {
        ...DEFAULT_SINGLE_TARGET_TONE_STATE,
        flatSix: true,
      },
      'phrygian'
    );
    const flatSixCollision = withCollision.find((tone) => tone.config.id === 'flatSix');

    expect(flatSixCollision?.source).toBe('single');
    expect(flatSixCollision?.palette).toEqual(TARGET_TONE_BY_ID.flatSix.palette);
  });

  it('locks equivalent single-target toggles when a mode already includes those notes', () => {
    const locked = getModeLockedSingleTargetToneIds('mixolydian', 'G', 'E');

    expect(locked.has('flatSeven')).toBe(true); // F in G major
    expect(locked.has('flatSix')).toBe(true); // C in G major ("4")
  });

  it('normalizes visible-note state by pitch class so mode and toggles are equivalent', () => {
    const fromMode = getVisibleTargetTones(
      DEFAULT_SINGLE_TARGET_TONE_STATE,
      'mixolydian',
      'major',
      'G',
      'E'
    );
    const fromSingles = getVisibleTargetTones(
      {
        ...DEFAULT_SINGLE_TARGET_TONE_STATE,
        flatSix: true, // C in G major ("4")
        flatSeven: true, // F in G major ("b7")
      },
      'off',
      'major',
      'G',
      'E'
    );

    expect(fromMode.map((tone) => tone.pitchClass)).toEqual(fromSingles.map((tone) => tone.pitchClass));
    expect(fromMode.map((tone) => tone.intervalFromTonalCenter)).toEqual([5, 10]);
    expect(fromSingles.map((tone) => tone.intervalFromTonalCenter)).toEqual([5, 10]);
  });
});
