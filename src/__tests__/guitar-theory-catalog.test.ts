import { buildChord, CHORD_FORMULAS } from '@/lib/guitar/chord-types';
import {
  getChordFormulaDefinition,
  getScaleFormulaDefinition,
  intervalTokenToSemitones,
  listChordFormulaIds,
  resolveChordFormulaId,
} from '@/lib/guitar/theory-catalog';

describe('guitar theory catalog', () => {
  it('converts interval tokens to semitones', () => {
    expect(intervalTokenToSemitones('1P')).toBe(0);
    expect(intervalTokenToSemitones('3m')).toBe(3);
    expect(intervalTokenToSemitones('3M')).toBe(4);
    expect(intervalTokenToSemitones('5d')).toBe(6);
    expect(intervalTokenToSemitones('5A')).toBe(8);
    expect(intervalTokenToSemitones('7d')).toBe(9);
    expect(intervalTokenToSemitones('9M')).toBe(14);
    expect(intervalTokenToSemitones('11P')).toBe(17);
    expect(intervalTokenToSemitones('13M')).toBe(21);
  });

  it('resolves chord aliases to canonical ids', () => {
    expect(resolveChordFormulaId('dom')).toBe('7');
    expect(resolveChordFormulaId('mM7')).toBe('mMaj7');
    expect(resolveChordFormulaId('half-diminished')).toBe('m7b5');
  });

  it('exposes extended chord formulas through chord-types', () => {
    expect(buildChord('C', '7b5')).toEqual([0, 4, 6, 10]);
    expect(buildChord('C', '7#5')).toEqual([0, 4, 8, 10]);
    expect(buildChord('C', 'mMaj7')).toEqual([0, 3, 7, 11]);

    expect(CHORD_FORMULAS['13'].intervals).toEqual([0, 4, 7, 10, 14, 21]);
  });

  it('provides chord and scale definitions from one catalog', () => {
    const chord = getChordFormulaDefinition('7#5');
    expect(chord).toBeTruthy();
    expect(chord?.intervals).toEqual([0, 4, 8, 10]);

    const scale = getScaleFormulaDefinition('minorPenta');
    expect(scale).toBeTruthy();
    expect(scale?.intervals).toEqual([0, 3, 5, 7, 10]);
  });

  it('lists canonical chord formula ids', () => {
    const ids = listChordFormulaIds();
    expect(ids).toEqual(expect.arrayContaining(['major', 'minor', '7', 'maj7', 'mMaj7', '7b5', '7#5']));
  });
});
