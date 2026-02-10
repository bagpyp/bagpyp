import { getPitchClass } from './box-shapes';

export type TargetToneId =
  | 'flatFive'
  | 'flatSix'
  | 'flatSeven'
  | 'majorThird'
  | 'majorSecond'
  | 'majorSixth';

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

export const TARGET_TONE_CONFIGS: TargetToneConfig[] = [
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

export const DEFAULT_TARGET_TONE_STATE: Record<TargetToneId, boolean> = {
  flatFive: false,
  flatSix: false,
  flatSeven: false,
  majorThird: false,
  majorSecond: false,
  majorSixth: false,
};

export function getTargetTonePitchClass(
  config: TargetToneConfig,
  selectedMajorKey: string,
  effectiveMinorKey: string
): number {
  const referenceKey = config.referenceRoot === 'major' ? selectedMajorKey : effectiveMinorKey;
  return (getPitchClass(referenceKey) + config.intervalFromReferenceRoot) % 12;
}
