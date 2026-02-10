import { getPitchClass } from '@/lib/guitar/box-shapes';
import {
  TARGET_TONE_CONFIGS,
  getTargetTonePitchClass,
} from '@/lib/guitar/target-tones';

describe('guitar target tones', () => {
  function config(id: (typeof TARGET_TONE_CONFIGS)[number]['id']) {
    const found = TARGET_TONE_CONFIGS.find((tone) => tone.id === id);
    if (!found) {
      throw new Error(`Missing target tone config: ${id}`);
    }
    return found;
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
});
