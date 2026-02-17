import type { PracticeProgression } from './progression-recommendations';
import type { ChordType } from './chord-types';
import { buildChord } from './chord-types';
import { nameToPc } from './core';

export interface LoopSyncConfig {
  progressionKey: string;
  progressionId: string;
  progressionTitle: string;
  loopLabel?: string;
  chordCount: number;
  loopDurationMs: number;
  startedWithFirstChord: boolean;
  chordOffsetsMs: number[];
  updatedAtMs: number;
}

export interface AutoLoopSyncDetectionInput {
  onsetTimesMs: number[];
  chordCount: number;
  startedWithFirstChord: boolean;
}

export interface AutoLoopSyncDetectionResult {
  loopDurationMs: number;
  chordOffsetsMs: number[];
  onsetCount: number;
}

function chordTypeFromSuffix(suffix: string): ChordType | null {
  const normalized = suffix.trim();
  const map: Record<string, ChordType> = {
    '': 'major',
    m: 'minor',
    dim: 'dim',
    aug: 'aug',
    maj7: 'maj7',
    m7: 'min7',
    '7': '7',
    dim7: 'dim7',
    mMaj7: 'mMaj7',
    '7b5': '7b5',
    '7#5': '7#5',
    m7b5: 'm7b5',
    '6': '6',
    m6: 'm6',
    '9': '9',
    '11': '11',
    '13': '13',
  };

  return map[normalized] ?? null;
}

export function getChordPitchClassesFromSymbol(chordSymbol: string | null | undefined): number[] {
  if (typeof chordSymbol !== 'string') {
    return [];
  }

  const baseSymbol = chordSymbol.split('/')[0]?.trim();
  if (!baseSymbol) {
    return [];
  }

  const match = baseSymbol.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) {
    return [];
  }

  const root = match[1];
  const suffix = match[2];
  const chordType = chordTypeFromSuffix(suffix);
  if (!chordType) {
    return [nameToPc(root)];
  }

  return buildChord(root as Parameters<typeof buildChord>[0], chordType);
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) * 0.5;
  }
  return sorted[middle];
}

function dedupeOnsets(onsetTimesMs: number[], minimumSeparationMs = 140): number[] {
  const sorted = [...onsetTimesMs]
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const deduped: number[] = [];
  sorted.forEach((time) => {
    const previous = deduped[deduped.length - 1];
    if (previous === undefined || Math.abs(time - previous) >= minimumSeparationMs) {
      deduped.push(time);
    }
  });
  return deduped;
}

function normalizePhaseMs(timeMs: number, loopDurationMs: number): number {
  const duration = normalizeLoopDurationMs(loopDurationMs);
  return ((timeMs % duration) + duration) % duration;
}

function mergePhaseClusters(
  phasesMs: number[],
  loopDurationMs: number,
  mergeToleranceMs: number
): number[] {
  if (phasesMs.length === 0) {
    return [];
  }

  const sorted = [...phasesMs].sort((a, b) => a - b);
  const clusters: number[][] = [[sorted[0]]];

  for (let idx = 1; idx < sorted.length; idx += 1) {
    const value = sorted[idx];
    const currentCluster = clusters[clusters.length - 1];
    const currentCenter = median(currentCluster);
    if (Math.abs(value - currentCenter) <= mergeToleranceMs) {
      currentCluster.push(value);
    } else {
      clusters.push([value]);
    }
  }

  if (clusters.length > 1) {
    const firstCluster = clusters[0];
    const lastCluster = clusters[clusters.length - 1];
    const firstCenter = median(firstCluster);
    const lastCenter = median(lastCluster);
    const wrappedDistance = loopDurationMs - lastCenter + firstCenter;
    if (wrappedDistance <= mergeToleranceMs) {
      clusters[0] = [...lastCluster.map((value) => value - loopDurationMs), ...firstCluster];
      clusters.pop();
    }
  }

  return clusters
    .map((cluster) => normalizePhaseMs(median(cluster), loopDurationMs))
    .sort((a, b) => a - b);
}

function compressPhaseCentersToChordCount(
  centersMs: number[],
  loopDurationMs: number,
  chordCount: number
): number[] {
  if (centersMs.length <= chordCount) {
    return centersMs;
  }

  const working = [...centersMs].sort((a, b) => a - b);
  while (working.length > chordCount) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let idx = 0; idx < working.length - 1; idx += 1) {
      const distance = working[idx + 1] - working[idx];
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = idx;
      }
    }
    const merged = normalizePhaseMs(
      (working[bestIndex] + working[bestIndex + 1]) * 0.5,
      loopDurationMs
    );
    working.splice(bestIndex, 2, merged);
    working.sort((a, b) => a - b);
  }

  return working;
}

export function detectLoopSyncFromOnsets({
  onsetTimesMs,
  chordCount,
  startedWithFirstChord,
}: AutoLoopSyncDetectionInput): AutoLoopSyncDetectionResult | null {
  if (chordCount <= 0) {
    return null;
  }

  const cleanedOnsets = dedupeOnsets(onsetTimesMs);
  if (cleanedOnsets.length < Math.max(chordCount + 1, 4)) {
    return null;
  }

  const durationCandidates: number[] = [];
  for (let idx = 0; idx + chordCount < cleanedOnsets.length; idx += 1) {
    const delta = cleanedOnsets[idx + chordCount] - cleanedOnsets[idx];
    if (delta >= LOOP_MIN_DURATION_MS) {
      durationCandidates.push(delta);
    }
  }

  if (durationCandidates.length === 0) {
    return null;
  }

  const loopDurationMs = normalizeLoopDurationMs(median(durationCandidates));
  const relativePhases = cleanedOnsets.map((onsetMs) =>
    normalizePhaseMs(onsetMs - cleanedOnsets[0], loopDurationMs)
  );
  const mergeToleranceMs = Math.max(90, Math.round(loopDurationMs / (chordCount * 7)));
  let centers = mergePhaseClusters(relativePhases, loopDurationMs, mergeToleranceMs);
  centers = compressPhaseCentersToChordCount(centers, loopDurationMs, chordCount);

  if (centers.length < chordCount) {
    const step = loopDurationMs / chordCount;
    centers = Array.from({ length: chordCount }, (_, idx) =>
      normalizePhaseMs(idx * step, loopDurationMs)
    );
  }

  let chordOffsetsMs = [...centers].sort((a, b) => a - b);
  if (startedWithFirstChord) {
    const phaseShift = chordOffsetsMs[0] ?? 0;
    chordOffsetsMs = chordOffsetsMs
      .map((offset) => normalizePhaseMs(offset - phaseShift, loopDurationMs))
      .sort((a, b) => a - b);
    if (chordOffsetsMs.length > 0) {
      chordOffsetsMs[0] = 0;
    }
  }

  chordOffsetsMs = chordOffsetsMs
    .slice(0, chordCount)
    .map((offset) => normalizeOffsetMs(offset, loopDurationMs))
    .sort((a, b) => a - b);

  if (chordOffsetsMs.length < chordCount) {
    return null;
  }

  return {
    loopDurationMs,
    chordOffsetsMs,
    onsetCount: cleanedOnsets.length,
  };
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
