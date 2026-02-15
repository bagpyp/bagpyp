import type { PracticeProgression } from './progression-recommendations';

export interface LoopSyncConfig {
  progressionKey: string;
  progressionId: string;
  progressionTitle: string;
  chordCount: number;
  loopDurationMs: number;
  startedWithFirstChord: boolean;
  chordOffsetsMs: number[];
  updatedAtMs: number;
}

const LOOP_MIN_DURATION_MS = 250;

export function parseChordSequence(sequence: string): string[] {
  return sequence
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && token !== '|');
}

export function getProgressionSyncKey(
  progression: Pick<PracticeProgression, 'id'>,
  tonalCenterMode: 'major' | 'minor',
  tonalKey: string,
  scaleFamilyLabel: string
): string {
  return `${tonalCenterMode}:${tonalKey}:${scaleFamilyLabel}:${progression.id}`;
}

export function normalizeLoopDurationMs(loopDurationMs: number): number {
  if (!Number.isFinite(loopDurationMs)) {
    return LOOP_MIN_DURATION_MS;
  }
  return Math.max(LOOP_MIN_DURATION_MS, Math.round(loopDurationMs));
}

export function normalizeOffsetMs(offsetMs: number, loopDurationMs: number): number {
  const duration = normalizeLoopDurationMs(loopDurationMs);
  const normalized = ((offsetMs % duration) + duration) % duration;
  return Math.round(normalized);
}

export function buildChordOffsetsMs(
  chordCount: number,
  loopDurationMs: number,
  startedWithFirstChord: boolean,
  capturedPressesMs: number[]
): number[] {
  const duration = normalizeLoopDurationMs(loopDurationMs);
  if (chordCount <= 0) {
    return [];
  }

  const normalizedPresses = capturedPressesMs
    .map((offset) => normalizeOffsetMs(offset, duration))
    .sort((a, b) => a - b);

  let offsets = startedWithFirstChord
    ? [0, ...normalizedPresses]
    : [...normalizedPresses];

  if (offsets.length > chordCount) {
    offsets = offsets.slice(0, chordCount);
  }

  // Fallback for incomplete capture: evenly fill missing chord starts.
  if (offsets.length < chordCount) {
    const defaultStep = duration / chordCount;
    for (let i = offsets.length; i < chordCount; i++) {
      offsets.push(Math.round((i * defaultStep) % duration));
    }
  }

  return offsets
    .map((offset) => normalizeOffsetMs(offset, duration))
    .sort((a, b) => a - b);
}

export function getLoopPositionMs(
  elapsedMs: number,
  loopDurationMs: number
): number {
  return normalizeOffsetMs(elapsedMs, loopDurationMs);
}

export function getLoopProgress(
  elapsedMs: number,
  loopDurationMs: number
): number {
  const duration = normalizeLoopDurationMs(loopDurationMs);
  return getLoopPositionMs(elapsedMs, duration) / duration;
}

export function getActiveChordIndex(
  chordOffsetsMs: number[],
  elapsedMs: number,
  loopDurationMs: number
): number {
  if (chordOffsetsMs.length === 0) {
    return 0;
  }

  const duration = normalizeLoopDurationMs(loopDurationMs);
  const offsets = chordOffsetsMs
    .map((offset) => normalizeOffsetMs(offset, duration))
    .sort((a, b) => a - b);
  const loopPosition = getLoopPositionMs(elapsedMs, duration);

  for (let i = offsets.length - 1; i >= 0; i--) {
    if (loopPosition >= offsets[i]) {
      return i;
    }
  }

  // Before first offset in loop => previous cycle final chord.
  return offsets.length - 1;
}

