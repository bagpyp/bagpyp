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
  getTargetToneToggleLabel,
  getTargetTonePitchClass,
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

  it('defines hexatonic mode presets as two-note additions', () => {
    const dorian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'dorian');
    const aeolian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'aeolian');
    const phrygian = HEXATONIC_MODE_OPTIONS.find((option) => option.id === 'phrygian');

    expect(dorian?.toneIds).toEqual(['majorSecond', 'majorSixth']);
    expect(aeolian?.toneIds).toEqual(['majorSecond', 'flatSix']);
    expect(phrygian?.toneIds).toEqual(['flatSecond', 'flatSix']);
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

  it('maps hexatonic labels from minor to major perspective', () => {
    expect(getHexatonicModeDisplayLabel('dorian', 'minor')).toBe('Dorian');
    expect(getHexatonicModeDisplayLabel('aeolian', 'minor')).toBe('Aeolian');
    expect(getHexatonicModeDisplayLabel('phrygian', 'minor')).toBe('Phrygian');

    expect(getHexatonicModeDisplayLabel('dorian', 'major')).toBe('Lydian');
    expect(getHexatonicModeDisplayLabel('aeolian', 'major')).toBe('Ionian');
    expect(getHexatonicModeDisplayLabel('phrygian', 'major')).toBe('Mixolydian');
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
});
