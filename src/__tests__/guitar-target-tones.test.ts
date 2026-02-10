import { getPitchClass } from '@/lib/guitar/box-shapes';
import {
  HEXATONIC_MODE_OPTIONS,
  TARGET_TONE_BY_ID,
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

    expect(getTargetToneToggleLabel(flatFive, 'minor', 'G', 'E')).toBe('Add b5 targets');
    expect(getTargetToneToggleLabel(flatFive, 'major', 'G', 'E')).toBe('Add b3 targets');
  });
});
