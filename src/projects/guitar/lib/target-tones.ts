import { getPitchClass } from './box-shapes';

export type TargetToneId =
  | 'flatSecond'
  | 'flatFive'
  | 'flatSix'
  | 'flatSeven'
  | 'majorSeventh'
  | 'majorThird'
  | 'majorSecond'
  | 'majorSixth';

export type HexatonicModeId = 'off' | 'dorian' | 'aeolian' | 'phrygian';
export type TonalCenterMode = 'minor' | 'major';

export interface TargetTonePalette {
  outer: string;
  mid: string;
  inner: string;
}

export interface TargetToneConfig {
  id: TargetToneId;
  label: string;
  description: string;
  intervalFromReferenceRoot: number;
  referenceRoot: 'major' | 'minor';
  preferFlatName: boolean;
  palette: TargetTonePalette;
}

export interface HexatonicModeOption {
  id: Exclude<HexatonicModeId, 'off'>;
  label: string;
  description: string;
  toneIds: [TargetToneId, TargetToneId];
}

export interface ActiveTargetTone {
  config: TargetToneConfig;
  palette: TargetTonePalette;
  source: 'hexatonic' | 'single';
}

const ALL_TARGET_TONE_CONFIGS: TargetToneConfig[] = [
  {
    id: 'flatSecond',
    label: 'Add b2 targets',
    description: 'Tense phrygian pull',
    intervalFromReferenceRoot: 1,
    referenceRoot: 'minor',
    preferFlatName: true,
    palette: { outer: '#7c2d12', mid: '#ea580c', inner: '#fdba74' },
  },
  {
    id: 'flatFive',
    label: 'Add b5 targets',
    description: 'Classic blue note bite',
    intervalFromReferenceRoot: 6,
    referenceRoot: 'minor',
    preferFlatName: true,
    palette: { outer: '#0ea5e9', mid: '#38bdf8', inner: '#7dd3fc' },
  },
  {
    id: 'flatSix',
    label: 'Add b6 targets',
    description: 'Dark passing color',
    intervalFromReferenceRoot: 8,
    referenceRoot: 'minor',
    preferFlatName: true,
    palette: { outer: '#0284c7', mid: '#0ea5e9', inner: '#7dd3fc' },
  },
  {
    id: 'flatSeven',
    label: 'Add b7 targets',
    description: 'Dominant blues pull',
    intervalFromReferenceRoot: 10,
    referenceRoot: 'major',
    preferFlatName: true,
    palette: { outer: '#0369a1', mid: '#0ea5e9', inner: '#7dd3fc' },
  },
  {
    id: 'majorSeventh',
    label: 'Add 7 targets',
    description: 'Leading-tone pull',
    intervalFromReferenceRoot: 11,
    referenceRoot: 'minor',
    preferFlatName: true,
    palette: { outer: '#6d28d9', mid: '#a78bfa', inner: '#ddd6fe' },
  },
  {
    id: 'majorThird',
    label: 'Add M3 targets',
    description: 'Vocal sweet vs sour color',
    intervalFromReferenceRoot: 4,
    referenceRoot: 'minor',
    preferFlatName: false,
    palette: { outer: '#c026d3', mid: '#e879f9', inner: '#f5d0fe' },
  },
  {
    id: 'majorSecond',
    label: 'Add 2/9 targets',
    description: 'Smooth, floating modern blues',
    intervalFromReferenceRoot: 2,
    referenceRoot: 'minor',
    preferFlatName: false,
    palette: { outer: '#0891b2', mid: '#22d3ee', inner: '#a5f3fc' },
  },
  {
    id: 'majorSixth',
    label: 'Add 6 targets',
    description: 'Gospel/soul hopeful color',
    intervalFromReferenceRoot: 9,
    referenceRoot: 'minor',
    preferFlatName: false,
    palette: { outer: '#16a34a', mid: '#4ade80', inner: '#bbf7d0' },
  },
];

const INTERVAL_LABEL_BY_SEMITONES: Record<number, string> = {
  0: '1',
  1: 'b2',
  2: '2/9',
  3: 'b3',
  4: '3',
  5: '4',
  6: 'b5',
  7: '5',
  8: 'b6',
  9: '6',
  10: 'b7',
  11: '7',
};

const ROMAN_NUMERAL_LABEL_BY_SEMITONES: Record<number, string> = {
  0: 'I',
  1: 'bII',
  2: 'II',
  3: 'bIII',
  4: 'III',
  5: 'IV',
  6: 'bV',
  7: 'V',
  8: 'bVI',
  9: 'VI',
  10: 'bVII',
  11: 'VII',
};

const INTERVAL_EFFECT_DESCRIPTION_BY_SEMITONES: Record<number, string> = {
  1: 'Tense half-step pull',
  2: 'Smooth, floating extension',
  3: 'Classic blues bite',
  4: 'Bright major-color lift',
  5: 'Suspended open color',
  6: 'Tritone tension bite',
  8: 'Borrowed-minor shadow',
  9: 'Warm soulful color',
  10: 'Dominant blues pull',
  11: 'Leading-tone pull',
};

export const TARGET_TONE_BY_ID: Record<TargetToneId, TargetToneConfig> = Object.fromEntries(
  ALL_TARGET_TONE_CONFIGS.map((config) => [config.id, config])
) as Record<TargetToneId, TargetToneConfig>;

export const SINGLE_TARGET_TONE_IDS = [
  'flatFive',
  'flatSix',
  'flatSeven',
  'majorSeventh',
  'majorThird',
  'majorSecond',
  'majorSixth',
] as const;

export type SingleTargetToneId = (typeof SINGLE_TARGET_TONE_IDS)[number];

export const SINGLE_TARGET_TONE_CONFIGS: Array<TargetToneConfig & { id: SingleTargetToneId }> =
  SINGLE_TARGET_TONE_IDS.map(
    (toneId) => TARGET_TONE_BY_ID[toneId] as TargetToneConfig & { id: SingleTargetToneId }
  );

export const HEXATONIC_MODE_OPTIONS: HexatonicModeOption[] = [
  {
    id: 'dorian',
    label: 'Dorian',
    description: 'Add 2 and 6 over minor pentatonic',
    toneIds: ['majorSecond', 'majorSixth'],
  },
  {
    id: 'aeolian',
    label: 'Aeolian',
    description: 'Add 2 and b6 over minor pentatonic',
    toneIds: ['majorSecond', 'flatSix'],
  },
  {
    id: 'phrygian',
    label: 'Phrygian',
    description: 'Add b2 and b6 over minor pentatonic',
    toneIds: ['flatSecond', 'flatSix'],
  },
];

export const HEXATONIC_MODE_RING_PALETTE: TargetTonePalette = {
  outer: '#166534',
  mid: '#22c55e',
  inner: '#86efac',
};

export const DEFAULT_SINGLE_TARGET_TONE_STATE: Record<SingleTargetToneId, boolean> = {
  flatFive: false,
  flatSix: false,
  flatSeven: false,
  majorSeventh: false,
  majorThird: false,
  majorSecond: false,
  majorSixth: false,
};

export function getHexatonicModeOption(id: HexatonicModeId): HexatonicModeOption | null {
  if (id === 'off') {
    return null;
  }
  return HEXATONIC_MODE_OPTIONS.find((option) => option.id === id) ?? null;
}

export function getActiveTargetTones(
  singleTargetToneState: Record<SingleTargetToneId, boolean>,
  hexatonicMode: HexatonicModeId
): ActiveTargetTone[] {
  const byId = new Map<TargetToneId, ActiveTargetTone>();
  const selectedHexatonicMode = getHexatonicModeOption(hexatonicMode);

  if (selectedHexatonicMode) {
    selectedHexatonicMode.toneIds.forEach((toneId) => {
      byId.set(toneId, {
        config: TARGET_TONE_BY_ID[toneId],
        palette: HEXATONIC_MODE_RING_PALETTE,
        source: 'hexatonic',
      });
    });
  }

  // Single-note targets override hexatonic ring styling when both select the same tone.
  SINGLE_TARGET_TONE_CONFIGS.forEach((config) => {
    if (!singleTargetToneState[config.id]) {
      return;
    }
    byId.set(config.id, {
      config,
      palette: config.palette,
      source: 'single',
    });
  });

  return [...byId.values()];
}

export function getHexatonicModeDisplayLabel(
  modeId: Exclude<HexatonicModeId, 'off'>,
  tonalCenter: TonalCenterMode
): string {
  if (tonalCenter === 'minor') {
    return modeId.charAt(0).toUpperCase() + modeId.slice(1);
  }

  const majorLabelByMinorMode: Record<Exclude<HexatonicModeId, 'off'>, string> = {
    dorian: 'Lydian',
    aeolian: 'Ionian',
    phrygian: 'Mixolydian',
  };

  return majorLabelByMinorMode[modeId];
}

export function getTargetTonePitchClass(
  config: TargetToneConfig,
  selectedMajorKey: string,
  effectiveMinorKey: string
): number {
  const referenceKey = config.referenceRoot === 'major' ? selectedMajorKey : effectiveMinorKey;
  return (getPitchClass(referenceKey) + config.intervalFromReferenceRoot) % 12;
}

export function getIntervalLabelFromSemitones(semitones: number): string {
  return INTERVAL_LABEL_BY_SEMITONES[((semitones % 12) + 12) % 12] ?? `${semitones}`;
}

export function getRomanNumeralLabelFromSemitones(semitones: number): string {
  return ROMAN_NUMERAL_LABEL_BY_SEMITONES[((semitones % 12) + 12) % 12] ?? `${semitones}`;
}

export function getIntervalEffectDescriptionFromSemitones(semitones: number): string {
  const normalized = ((semitones % 12) + 12) % 12;
  return INTERVAL_EFFECT_DESCRIPTION_BY_SEMITONES[normalized] ?? 'Color extension target';
}

export function getTargetToneIntervalFromTonalCenter(
  config: TargetToneConfig,
  tonalCenter: TonalCenterMode,
  majorCenterKey: string,
  minorCenterKey: string
): number {
  const targetPitchClass = getTargetTonePitchClass(config, majorCenterKey, minorCenterKey);
  const tonalCenterPitchClass = getPitchClass(tonalCenter === 'major' ? majorCenterKey : minorCenterKey);
  return (targetPitchClass - tonalCenterPitchClass + 12) % 12;
}

export function getTargetToneToggleLabel(
  config: TargetToneConfig,
  tonalCenter: TonalCenterMode,
  majorCenterKey: string,
  minorCenterKey: string
): string {
  const interval = getTargetToneIntervalFromTonalCenter(
    config,
    tonalCenter,
    majorCenterKey,
    minorCenterKey
  );
  return `Add ${getIntervalLabelFromSemitones(interval)} targets`;
}
