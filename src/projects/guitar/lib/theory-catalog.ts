/**
 * Theory Catalog
 *
 * Canonical chord/scale formula data used as a source of truth.
 * This keeps interval logic centralized so generators can stay data-driven.
 */

export interface TheoryFormulaSeed {
  name: string;
  symbol: string;
  description: string;
  intervalTokens: readonly string[];
  aliases?: readonly string[];
}

export interface TheoryFormulaDefinition<TId extends string = string> extends TheoryFormulaSeed {
  id: TId;
  intervals: number[];
}

const CHORD_FORMULA_SEEDS = {
  major: {
    name: 'Major',
    symbol: '',
    description: '1-3-5',
    intervalTokens: ['1P', '3M', '5P'],
    aliases: ['maj', 'M'],
  },
  minor: {
    name: 'Minor',
    symbol: 'm',
    description: '1-b3-5',
    intervalTokens: ['1P', '3m', '5P'],
    aliases: ['min', '-'],
  },
  dim: {
    name: 'Diminished',
    symbol: 'dim',
    description: '1-b3-b5',
    intervalTokens: ['1P', '3m', '5d'],
    aliases: ['o'],
  },
  aug: {
    name: 'Augmented',
    symbol: 'aug',
    description: '1-3-#5',
    intervalTokens: ['1P', '3M', '5A'],
    aliases: ['+'],
  },
  maj7: {
    name: 'Major 7th',
    symbol: 'maj7',
    description: '1-3-5-7',
    intervalTokens: ['1P', '3M', '5P', '7M'],
    aliases: ['M7', 'Maj7', 'ma7', '^7', 'delta7'],
  },
  min7: {
    name: 'Minor 7th',
    symbol: 'm7',
    description: '1-b3-5-b7',
    intervalTokens: ['1P', '3m', '5P', '7m'],
    aliases: ['-7', 'min7', 'mi7'],
  },
  '7': {
    name: 'Dominant 7th',
    symbol: '7',
    description: '1-3-5-b7',
    intervalTokens: ['1P', '3M', '5P', '7m'],
    aliases: ['dom', 'dominant7'],
  },
  dim7: {
    name: 'Diminished 7th',
    symbol: 'dim7',
    description: '1-b3-b5-bb7',
    intervalTokens: ['1P', '3m', '5d', '7d'],
    aliases: ['o7'],
  },
  mMaj7: {
    name: 'Minor/Major 7th',
    symbol: 'mMaj7',
    description: '1-b3-5-7',
    intervalTokens: ['1P', '3m', '5P', '7M'],
    aliases: ['mM7', 'm/maj7', '-maj7'],
  },
  '7b5': {
    name: 'Dominant 7 flat 5',
    symbol: '7b5',
    description: '1-3-b5-b7',
    intervalTokens: ['1P', '3M', '5d', '7m'],
    aliases: ['dom7b5'],
  },
  '7#5': {
    name: 'Dominant 7 sharp 5',
    symbol: '7#5',
    description: '1-3-#5-b7',
    intervalTokens: ['1P', '3M', '5A', '7m'],
    aliases: ['+7', '7+', 'aug7', '7aug'],
  },
  m7b5: {
    name: 'Half-Diminished',
    symbol: 'm7b5',
    description: '1-b3-b5-b7',
    intervalTokens: ['1P', '3m', '5d', '7m'],
    aliases: ['halfdim', 'half-diminished', 'h7'],
  },
  '6': {
    name: 'Sixth',
    symbol: '6',
    description: '1-3-5-6',
    intervalTokens: ['1P', '3M', '5P', '6M'],
    aliases: ['add6', 'add13', 'M6'],
  },
  m6: {
    name: 'Minor 6th',
    symbol: 'm6',
    description: '1-b3-5-6',
    intervalTokens: ['1P', '3m', '5P', '6M'],
    aliases: ['-6'],
  },
  '9': {
    name: 'Dominant 9th',
    symbol: '9',
    description: '1-3-5-b7-9',
    intervalTokens: ['1P', '3M', '5P', '7m', '9M'],
    aliases: ['dom9'],
  },
  '11': {
    name: 'Eleventh',
    symbol: '11',
    description: '1-5-b7-9-11',
    intervalTokens: ['1P', '5P', '7m', '9M', '11P'],
  },
  '13': {
    name: 'Dominant 13th',
    symbol: '13',
    description: '1-3-5-b7-9-13',
    intervalTokens: ['1P', '3M', '5P', '7m', '9M', '13M'],
    aliases: ['dom13'],
  },
} as const satisfies Record<string, TheoryFormulaSeed>;

const SCALE_FORMULA_SEEDS = {
  major: {
    name: 'Major',
    symbol: 'major',
    description: 'Ionian mode',
    intervalTokens: ['1P', '2M', '3M', '4P', '5P', '6M', '7M'],
    aliases: ['ionian'],
  },
  dorian: {
    name: 'Dorian',
    symbol: 'dorian',
    description: 'Second major mode',
    intervalTokens: ['1P', '2M', '3m', '4P', '5P', '6M', '7m'],
  },
  phrygian: {
    name: 'Phrygian',
    symbol: 'phrygian',
    description: 'Third major mode',
    intervalTokens: ['1P', '2m', '3m', '4P', '5P', '6m', '7m'],
  },
  lydian: {
    name: 'Lydian',
    symbol: 'lydian',
    description: 'Fourth major mode',
    intervalTokens: ['1P', '2M', '3M', '4A', '5P', '6M', '7M'],
  },
  mixolydian: {
    name: 'Mixolydian',
    symbol: 'mixolydian',
    description: 'Fifth major mode',
    intervalTokens: ['1P', '2M', '3M', '4P', '5P', '6M', '7m'],
  },
  aeolian: {
    name: 'Aeolian',
    symbol: 'aeolian',
    description: 'Natural minor mode',
    intervalTokens: ['1P', '2M', '3m', '4P', '5P', '6m', '7m'],
    aliases: ['naturalminor'],
  },
  locrian: {
    name: 'Locrian',
    symbol: 'locrian',
    description: 'Seventh major mode',
    intervalTokens: ['1P', '2m', '3m', '4P', '5d', '6m', '7m'],
  },
  minorPentatonic: {
    name: 'Minor Pentatonic',
    symbol: 'minor-pentatonic',
    description: '1-b3-4-5-b7',
    intervalTokens: ['1P', '3m', '4P', '5P', '7m'],
    aliases: ['pentatonicMinor', 'minorPenta'],
  },
  blues: {
    name: 'Blues',
    symbol: 'blues',
    description: 'Minor pentatonic + b5',
    intervalTokens: ['1P', '3m', '4P', '5d', '5P', '7m'],
  },
} as const satisfies Record<string, TheoryFormulaSeed>;

export type ChordFormulaId = keyof typeof CHORD_FORMULA_SEEDS;
export type ScaleFormulaId = keyof typeof SCALE_FORMULA_SEEDS;

function normalizeLookupToken(value: string): string {
  return value
    .replace('♯', '#')
    .replace('♭', 'b')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function buildCatalog<TId extends string>(
  seeds: Record<TId, TheoryFormulaSeed>
): Record<TId, TheoryFormulaDefinition<TId>> {
  const catalog = {} as Record<TId, TheoryFormulaDefinition<TId>>;

  for (const id in seeds) {
    const typedId = id as TId;
    const seed = seeds[typedId];

    catalog[typedId] = {
      ...seed,
      id: typedId,
      intervals: seed.intervalTokens.map(intervalTokenToSemitones),
    };
  }

  return catalog;
}

function buildAliasIndex<TId extends string>(
  catalog: Record<TId, TheoryFormulaDefinition<TId>>
): Record<string, TId> {
  const index = {} as Record<string, TId>;

  for (const id in catalog) {
    const formula = catalog[id as TId];
    const keys = [
      formula.id,
      formula.symbol,
      ...(formula.aliases ?? []),
    ];

    keys
      .filter((key) => key && key.trim().length > 0)
      .forEach((key) => {
        index[normalizeLookupToken(key)] = formula.id;
      });
  }

  return index;
}

/**
 * Convert interval tokens to semitones.
 *
 * Supports tonal-style tokens like:
 * - 1P, 3M, 3m, 5d, 5A, 7d, 9M, 11P, 13M
 */
export function intervalTokenToSemitones(token: string): number {
  const normalized = token.trim();
  const match = normalized.match(/^(\d+)([PMmAd]+)$/);

  if (!match) {
    throw new Error(`Invalid interval token: ${token}`);
  }

  const degreeNumber = Number(match[1]);
  const quality = match[2];
  const octaveCount = Math.floor((degreeNumber - 1) / 7);
  const degree = ((degreeNumber - 1) % 7) + 1;

  const majorScaleSemitonesByDegree: Record<number, number> = {
    1: 0,
    2: 2,
    3: 4,
    4: 5,
    5: 7,
    6: 9,
    7: 11,
  };

  const perfectClass = degree === 1 || degree === 4 || degree === 5;
  const baseSemitones = majorScaleSemitonesByDegree[degree] + (octaveCount * 12);
  const augmentCount = quality.split('').filter((char) => char === 'A').length;
  const diminishCount = quality.split('').filter((char) => char === 'd').length;

  if (quality === 'M') {
    if (perfectClass) {
      throw new Error(`Invalid quality '${quality}' for perfect-class interval: ${token}`);
    }
    return baseSemitones;
  }

  if (quality === 'm') {
    if (perfectClass) {
      throw new Error(`Invalid quality '${quality}' for perfect-class interval: ${token}`);
    }
    return baseSemitones - 1;
  }

  if (quality === 'P') {
    if (!perfectClass) {
      throw new Error(`Invalid quality '${quality}' for major-class interval: ${token}`);
    }
    return baseSemitones;
  }

  if (augmentCount > 0 && quality.replace(/A/g, '').length === 0) {
    return baseSemitones + augmentCount;
  }

  if (diminishCount > 0 && quality.replace(/d/g, '').length === 0) {
    // Perfect-class diminished: -1 per d.
    // Major-class diminished starts from major and drops 2 for first d.
    if (perfectClass) {
      return baseSemitones - diminishCount;
    }
    return baseSemitones - (diminishCount + 1);
  }

  throw new Error(`Unsupported interval quality '${quality}' for token: ${token}`);
}

export const CHORD_FORMULA_CATALOG = buildCatalog<ChordFormulaId>(CHORD_FORMULA_SEEDS);
export const SCALE_FORMULA_CATALOG = buildCatalog<ScaleFormulaId>(SCALE_FORMULA_SEEDS);

const CHORD_ALIAS_INDEX = buildAliasIndex(CHORD_FORMULA_CATALOG);
const SCALE_ALIAS_INDEX = buildAliasIndex(SCALE_FORMULA_CATALOG);

export function listChordFormulaIds(): ChordFormulaId[] {
  return Object.keys(CHORD_FORMULA_CATALOG) as ChordFormulaId[];
}

export function listScaleFormulaIds(): ScaleFormulaId[] {
  return Object.keys(SCALE_FORMULA_CATALOG) as ScaleFormulaId[];
}

export function resolveChordFormulaId(idOrAlias: string): ChordFormulaId | null {
  const resolved = CHORD_ALIAS_INDEX[normalizeLookupToken(idOrAlias)];
  return resolved ?? null;
}

export function resolveScaleFormulaId(idOrAlias: string): ScaleFormulaId | null {
  const resolved = SCALE_ALIAS_INDEX[normalizeLookupToken(idOrAlias)];
  return resolved ?? null;
}

export function getChordFormulaDefinition(idOrAlias: string): TheoryFormulaDefinition<ChordFormulaId> | null {
  const id = resolveChordFormulaId(idOrAlias);
  if (!id) return null;
  return CHORD_FORMULA_CATALOG[id];
}

export function getScaleFormulaDefinition(idOrAlias: string): TheoryFormulaDefinition<ScaleFormulaId> | null {
  const id = resolveScaleFormulaId(idOrAlias);
  if (!id) return null;
  return SCALE_FORMULA_CATALOG[id];
}
