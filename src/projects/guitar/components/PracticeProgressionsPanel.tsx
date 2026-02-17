'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PracticeProgression } from '../lib/progression-recommendations';
import {
  type LoopSyncConfig,
  getActiveChordIndex,
  getLoopProgress,
  getProgressionSyncKey,
  getChordPitchClassesFromSymbol,
  normalizeOffsetMs,
  normalizeLoopDurationMs,
  parseChordSequence,
} from '../lib/looper-sync';

interface PracticeProgressionsPanelProps {
  tonalCenterMode: 'minor' | 'major';
  tonalKey: string;
  majorCenterKey: string;
  minorCenterKey: string;
  scaleFamilyLabel: string;
  progressions: PracticeProgression[];
  panelHeightPx?: number;
  onActiveChordPitchClassesChange?: (pitchClasses: number[] | null) => void;
  onActiveChordSymbolChange?: (symbol: string | null) => void;
  onHideNonScaleChordTonesChange?: (hide: boolean) => void;
  onClose: () => void;
}

interface LoopTransportState {
  progressionKey: string;
  status: 'playing' | 'paused' | 'stopped';
  startedAtMs: number;
  pausedElapsedMs: number;
}

interface LooperSyncModalProps {
  progression: PracticeProgression;
  progressionKey: string;
  existingConfig?: LoopSyncConfig;
  onSave: (config: LoopSyncConfig) => void;
  onAutoSyncDetected?: (config: LoopSyncConfig, startedAtMs: number) => void;
  onClose: () => void;
}

// NOTE: Sync configs persist in localStorage for this browser/session.
// If we scale to multi-device/user sync, move this to a server-backed store
// with user scoping and schema versioning.
const LOOP_SYNC_STORAGE_KEY = 'guitar:loop-sync-configs:v1';

interface AutoStateEvent {
  stateIndex: number;
  timeMs: number;
  confidence: number;
}

function getAutoLockRequirements(
  chordCount: number,
  guideLoopDurationMs?: number | null
): { minimumListenMs: number; minimumStateEvents: number } {
  if (guideLoopDurationMs && Number.isFinite(guideLoopDurationMs) && guideLoopDurationMs > 0) {
    return {
      minimumListenMs: Math.max(5000, guideLoopDurationMs * 1.35),
      minimumStateEvents: Math.max(chordCount * 2, chordCount + 3),
    };
  }

  return {
    minimumListenMs: Math.max(8000, chordCount * 1900),
    minimumStateEvents: Math.max(chordCount * 3, 10),
  };
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) * 0.5;
  }
  return sorted[mid];
}

function normalizeVector(values: number[]): number[] {
  const sum = values.reduce((acc, value) => acc + Math.max(0, value), 0);
  if (sum <= 0) {
    return values.map(() => 0);
  }
  return values.map((value) => Math.max(0, value) / sum);
}

function buildChromaFromSpectrum(
  spectrumDb: Float32Array,
  sampleRate: number
): number[] {
  const chroma = new Array<number>(12).fill(0);
  const fftSize = (spectrumDb.length - 1) * 2;
  const minFrequency = 65; // around C2
  const maxFrequency = 1600; // around G6

  for (let bin = 1; bin < spectrumDb.length; bin += 1) {
    const frequency = (bin * sampleRate) / fftSize;
    if (frequency < minFrequency || frequency > maxFrequency) {
      continue;
    }
    const dbValue = spectrumDb[bin];
    if (!Number.isFinite(dbValue) || dbValue <= -120) {
      continue;
    }
    const magnitude = Math.pow(10, dbValue / 20);
    const midi = 69 + (12 * Math.log2(frequency / 440));
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pitchClass] += magnitude;
  }

  return normalizeVector(chroma);
}

function scoreChordAgainstChroma(
  chroma: number[],
  chordPitchClasses: number[]
): number {
  if (chordPitchClasses.length === 0) {
    return 0.01;
  }
  const chordSet = new Set(chordPitchClasses);
  let inChordEnergy = 0;
  let outOfChordEnergy = 0;

  for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
    if (chordSet.has(pitchClass)) {
      inChordEnergy += chroma[pitchClass];
    } else {
      outOfChordEnergy += chroma[pitchClass];
    }
  }

  return Math.max(0.001, (inChordEnergy * 1.25) - (outOfChordEnergy * 0.25));
}

function buildLoopSyncConfigFromDraft(
  progressionKey: string,
  progression: PracticeProgression,
  loopLabel: string,
  chordCount: number,
  loopDurationMs: number,
  startedWithFirstChord: boolean,
  chordOffsetsMs: number[]
): LoopSyncConfig {
  return {
    progressionKey,
    progressionId: progression.id,
    progressionTitle: progression.title,
    loopLabel: loopLabel.trim().length > 0 ? loopLabel.trim() : progression.title,
    chordCount,
    loopDurationMs: normalizeLoopDurationMs(loopDurationMs),
    startedWithFirstChord,
    chordOffsetsMs,
    updatedAtMs: Date.now(),
  };
}

function inferSyncFromStateEvents(
  events: AutoStateEvent[],
  chordCount: number,
  guideLoopDurationMs?: number
): { loopDurationMs: number; chordOffsetsMs: number[] } | null {
  const { minimumStateEvents } = getAutoLockRequirements(chordCount, guideLoopDurationMs);
  if (events.length < minimumStateEvents) {
    return null;
  }

  const durationsByState: number[][] = Array.from({ length: chordCount }, () => []);

  for (let idx = 0; idx + 1 < events.length; idx += 1) {
    const current = events[idx];
    const next = events[idx + 1];
    const delta = next.timeMs - current.timeMs;
    if (delta < 280 || delta > 18000) {
      continue;
    }
    const steps = (next.stateIndex - current.stateIndex + chordCount) % chordCount;
    if (steps <= 0) {
      continue;
    }
    const perStepDuration = delta / steps;
    for (let step = 0; step < steps; step += 1) {
      const stateIndex = (current.stateIndex + step) % chordCount;
      durationsByState[stateIndex].push(perStepDuration);
    }
  }

  const globalDurations = durationsByState.flat();
  if (globalDurations.length === 0) {
    return null;
  }
  const globalMedian = median(globalDurations);
  let stateDurations = durationsByState.map((durations) =>
    durations.length > 0 ? median(durations) : globalMedian
  );

  let loopDurationMs = stateDurations.reduce((acc, value) => acc + value, 0);
  if (guideLoopDurationMs && Number.isFinite(guideLoopDurationMs) && guideLoopDurationMs > 0) {
    const guidedDuration = normalizeLoopDurationMs(guideLoopDurationMs);
    const scale = guidedDuration / Math.max(1, loopDurationMs);
    stateDurations = stateDurations.map((value) => value * scale);
    loopDurationMs = guidedDuration;
  }
  loopDurationMs = normalizeLoopDurationMs(loopDurationMs);
  if (!guideLoopDurationMs) {
    const minimumPlausibleLoopMs = chordCount * 900;
    if (loopDurationMs < minimumPlausibleLoopMs) {
      return null;
    }
  }

  const chordOffsetsMs = [0];
  let runningOffset = 0;
  for (let stateIndex = 0; stateIndex < chordCount - 1; stateIndex += 1) {
    runningOffset += stateDurations[stateIndex];
    chordOffsetsMs.push(normalizeOffsetMs(runningOffset, loopDurationMs));
  }

  const normalizedOffsets = [...new Set(
    chordOffsetsMs
      .map((offset) => normalizeOffsetMs(offset, loopDurationMs))
      .sort((a, b) => a - b)
  )];

  if (normalizedOffsets.length !== chordCount) {
    // Fallback: evenly spread if inference collapsed duplicated offsets.
    const step = loopDurationMs / chordCount;
    return {
      loopDurationMs,
      chordOffsetsMs: Array.from(
        { length: chordCount },
        (_, idx) => normalizeOffsetMs(Math.round(idx * step), loopDurationMs)
      ),
    };
  }

  return {
    loopDurationMs,
    chordOffsetsMs: normalizedOffsets,
  };
}

function LoopRing({
  progress,
  label,
  subLabel,
}: {
  progress: number;
  label: string;
  subLabel?: string;
}) {
  const size = 66;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="text-[11px]">
        <p className="font-semibold text-slate-100">{label}</p>
        {subLabel && <p className="text-slate-400">{subLabel}</p>}
      </div>
    </div>
  );
}

function LooperSyncModal({
  progression,
  progressionKey,
  existingConfig,
  onSave,
  onAutoSyncDetected,
  onClose,
}: LooperSyncModalProps) {
  const chordSequence = useMemo(
    () => parseChordSequence(progression.chordNames),
    [progression.chordNames]
  );
  const romanSequence = useMemo(
    () => parseChordSequence(progression.romanNumerals),
    [progression.romanNumerals]
  );
  const chordCount = chordSequence.length;

  const [startedWithFirstChord, setStartedWithFirstChord] = useState(
    existingConfig?.startedWithFirstChord ?? true
  );
  const [loopLabel, setLoopLabel] = useState(existingConfig?.loopLabel ?? progression.title);
  const [loopDurationMs, setLoopDurationMs] = useState(
    existingConfig?.loopDurationMs ?? 0
  );
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'running' | 'done'>(
    existingConfig?.chordOffsetsMs?.length === chordCount ? 'done' : 'idle'
  );
  const [captureStartMs, setCaptureStartMs] = useState<number | null>(null);
  const [capturedFencepostsMs, setCapturedFencepostsMs] = useState<number[]>([]);
  const [chordOffsetsDraft, setChordOffsetsDraft] = useState<number[]>(
    existingConfig?.chordOffsetsMs ?? []
  );
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'listening' | 'detected' | 'error'>('idle');
  const [autoSyncError, setAutoSyncError] = useState<string | null>(null);
  const [autoSyncElapsedMs, setAutoSyncElapsedMs] = useState(0);
  const [autoSyncOnsetCount, setAutoSyncOnsetCount] = useState(0);
  const [autoSyncInputLevel, setAutoSyncInputLevel] = useState(0);
  const [autoSyncActiveStateIndex, setAutoSyncActiveStateIndex] = useState<number | null>(null);
  const [autoSyncConfidence, setAutoSyncConfidence] = useState(0);
  const [autoGuideTapTimesMs, setAutoGuideTapTimesMs] = useState<number[]>([]);
  const [autoStateEventCount, setAutoStateEventCount] = useState(0);
  const [syncMode, setSyncMode] = useState<'manual' | 'auto'>('manual');

  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioContextRef = useRef<AudioContext | null>(null);
  const micRafIdRef = useRef<number | null>(null);
  const micOnsetsMsRef = useRef<number[]>([]);
  const autoStateEventsRef = useRef<AutoStateEvent[]>([]);
  const autoPosteriorRef = useRef<number[] | null>(null);
  const autoCurrentStateRef = useRef<number | null>(null);
  const autoLastStateChangeMsRef = useRef(0);
  const autoRecentCandidatesRef = useRef<number[]>([]);
  const autoGuideLoopDurationMsRef = useRef<number | null>(null);
  const micPreviousMagnitudeSpectrumRef = useRef<Float32Array | null>(null);
  const micFluxBaselineRef = useRef(0);
  const micStartedAtMsRef = useRef(0);
  const micLastOnsetAtMsRef = useRef<number>(-Infinity);
  const micRmsBaselineRef = useRef(0.01);
  const micPreviousRmsRef = useRef(0);

  const requiredFenceposts = startedWithFirstChord
    ? chordCount + 1
    : chordCount + 2;
  const canStartCapture = chordCount > 0;
  const autoChordPitchClassesByState = useMemo(
    () => chordSequence.map((symbol) => getChordPitchClassesFromSymbol(symbol)),
    [chordSequence]
  );
  const autoGuideLoopDurationMs = useMemo(() => {
    if (autoGuideTapTimesMs.length < 2) {
      return null;
    }
    const intervals: number[] = [];
    for (let idx = 1; idx < autoGuideTapTimesMs.length; idx += 1) {
      const interval = autoGuideTapTimesMs[idx] - autoGuideTapTimesMs[idx - 1];
      if (interval >= 500 && interval <= 30000) {
        intervals.push(interval);
      }
    }
    if (intervals.length === 0) {
      return null;
    }
    return normalizeLoopDurationMs(median(intervals));
  }, [autoGuideTapTimesMs]);
  const autoLockRequirements = useMemo(
    () => getAutoLockRequirements(chordCount, autoGuideLoopDurationMs),
    [chordCount, autoGuideLoopDurationMs]
  );
  const autoListenReadiness = Math.min(
    1,
    autoSyncElapsedMs / Math.max(1, autoLockRequirements.minimumListenMs)
  );
  const autoStateReadiness = Math.min(
    1,
    autoStateEventCount / Math.max(1, autoLockRequirements.minimumStateEvents)
  );
  const autoStabilityReadiness = Math.min(autoListenReadiness, autoStateReadiness);
  const canSave =
    normalizeLoopDurationMs(loopDurationMs) > 0 &&
    chordOffsetsDraft.length === chordCount &&
    chordCount > 0;

  useEffect(() => {
    autoGuideLoopDurationMsRef.current = autoGuideLoopDurationMs;
  }, [autoGuideLoopDurationMs]);

  const stopMicCapture = useCallback(() => {
    if (micRafIdRef.current !== null) {
      window.cancelAnimationFrame(micRafIdRef.current);
      micRafIdRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (micAudioContextRef.current) {
      void micAudioContextRef.current.close();
      micAudioContextRef.current = null;
    }
  }, []);

  const finalizeAutoSync = useCallback((
    inferred: { loopDurationMs: number; chordOffsetsMs: number[] },
    nowAbsoluteMs: number
  ) => {
    const nowRelativeMs = nowAbsoluteMs - micStartedAtMsRef.current;
    const activeStateIndex = autoCurrentStateRef.current ?? 0;
    const activeStateOffset = inferred.chordOffsetsMs[activeStateIndex] ?? 0;
    const elapsedSinceStateStart = Math.max(0, nowRelativeMs - autoLastStateChangeMsRef.current);
    const phaseMs = normalizeOffsetMs(
      activeStateOffset + elapsedSinceStateStart,
      inferred.loopDurationMs
    );
    const startedAtMs = nowAbsoluteMs - phaseMs;

    const config = buildLoopSyncConfigFromDraft(
      progressionKey,
      progression,
      loopLabel,
      chordCount,
      inferred.loopDurationMs,
      startedWithFirstChord,
      inferred.chordOffsetsMs
    );

    setLoopDurationMs(inferred.loopDurationMs);
    setChordOffsetsDraft(inferred.chordOffsetsMs);
    setCaptureStatus('done');
    setCaptureStartMs(null);
    setCapturedFencepostsMs([]);
    setAutoSyncElapsedMs(inferred.loopDurationMs);
    setAutoSyncStatus('detected');
    setAutoSyncError(null);

    if (onAutoSyncDetected) {
      onAutoSyncDetected(config, startedAtMs);
    } else {
      onSave(config);
    }

    onClose();
  }, [
    progressionKey,
    progression,
    loopLabel,
    chordCount,
    startedWithFirstChord,
    onAutoSyncDetected,
    onSave,
    onClose,
  ]);

  const handleStartAutoSync = async () => {
    if (autoSyncStatus === 'listening') {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setAutoSyncStatus('error');
      setAutoSyncError('Microphone access is not available in this browser.');
      return;
    }

    stopMicCapture();
    setAutoSyncError(null);
    setAutoSyncStatus('listening');
    setAutoSyncElapsedMs(0);
    setAutoSyncOnsetCount(0);
    setAutoSyncInputLevel(0);
    setAutoSyncActiveStateIndex(null);
    setAutoSyncConfidence(0);
    setAutoGuideTapTimesMs([]);
    setAutoStateEventCount(0);
    micOnsetsMsRef.current = [];
    autoStateEventsRef.current = [];
    autoPosteriorRef.current = null;
    autoCurrentStateRef.current = null;
    autoLastStateChangeMsRef.current = 0;
    autoRecentCandidatesRef.current = [];
    micPreviousMagnitudeSpectrumRef.current = null;
    micFluxBaselineRef.current = 0;
    micLastOnsetAtMsRef.current = -Infinity;
    micRmsBaselineRef.current = 0.01;
    micPreviousRmsRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new window.AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);

      const timeDomain = new Float32Array(analyser.fftSize);
      const frequencyDomainDb = new Float32Array(analyser.frequencyBinCount);
      micStreamRef.current = stream;
      micAudioContextRef.current = audioContext;
      micStartedAtMsRef.current = performance.now();

      const tick = () => {
        analyser.getFloatTimeDomainData(timeDomain);
        let sumSquares = 0;
        for (let idx = 0; idx < timeDomain.length; idx += 1) {
          const sample = timeDomain[idx];
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / timeDomain.length);
        const baseline = (micRmsBaselineRef.current * 0.985) + (rms * 0.015);
        micRmsBaselineRef.current = baseline;
        setAutoSyncInputLevel(Math.min(1, rms * 18));

        const now = performance.now();
        const elapsedMs = now - micStartedAtMsRef.current;
        setAutoSyncElapsedMs(elapsedMs);

        const dynamicThreshold = Math.max(0.004, baseline * 1.85);
        const attack = rms - micPreviousRmsRef.current;
        micPreviousRmsRef.current = rms;

        let spectralFlux = 0;
        const currentMagnitudeSpectrum = new Float32Array(frequencyDomainDb.length);
        for (let idx = 0; idx < frequencyDomainDb.length; idx += 1) {
          const dbValue = frequencyDomainDb[idx];
          currentMagnitudeSpectrum[idx] = Number.isFinite(dbValue)
            ? Math.pow(10, dbValue / 20)
            : 0;
        }
        if (micPreviousMagnitudeSpectrumRef.current) {
          const previousSpectrum = micPreviousMagnitudeSpectrumRef.current;
          const length = Math.min(previousSpectrum.length, currentMagnitudeSpectrum.length);
          for (let idx = 2; idx < length; idx += 1) {
            const delta = currentMagnitudeSpectrum[idx] - previousSpectrum[idx];
            if (delta > 0) {
              spectralFlux += delta;
            }
          }
        }
        micPreviousMagnitudeSpectrumRef.current = currentMagnitudeSpectrum;
        micFluxBaselineRef.current = (micFluxBaselineRef.current * 0.96) + (spectralFlux * 0.04);
        const fluxThreshold = Math.max(0.02, micFluxBaselineRef.current * 2.2);

        const minimumOnsetGapMs = 180;
        const onsetByRmsAttack = (
          rms > dynamicThreshold
          && attack > Math.max(0.0012, baseline * 0.18)
        );
        const onsetByFlux = spectralFlux > fluxThreshold;
        if (
          (onsetByRmsAttack || onsetByFlux)
          && (now - micLastOnsetAtMsRef.current) > minimumOnsetGapMs
        ) {
          micLastOnsetAtMsRef.current = now;
          micOnsetsMsRef.current.push(elapsedMs);
          setAutoSyncOnsetCount(micOnsetsMsRef.current.length);
        }

        analyser.getFloatFrequencyData(frequencyDomainDb);
        const chroma = buildChromaFromSpectrum(frequencyDomainDb, audioContext.sampleRate);
        const energy = chroma.reduce((acc, value) => acc + value, 0);

        if (energy > 0.0001 && autoChordPitchClassesByState.length > 0) {
          const stateCount = autoChordPitchClassesByState.length;
          const emission = autoChordPitchClassesByState.map((pitchClasses) =>
            scoreChordAgainstChroma(chroma, pitchClasses)
          );

          const previousPosterior = autoPosteriorRef.current;
          let nextPosterior = emission.map((value) => Math.max(0.001, value));

          if (previousPosterior && previousPosterior.length === stateCount) {
            nextPosterior = new Array<number>(stateCount).fill(0);
            for (let stateIndex = 0; stateIndex < stateCount; stateIndex += 1) {
              const stay = previousPosterior[stateIndex] * 0.89;
              const advance = previousPosterior[(stateIndex - 1 + stateCount) % stateCount] * 0.1;
              const skip = previousPosterior[(stateIndex - 2 + stateCount) % stateCount] * 0.01;
              nextPosterior[stateIndex] = Math.max(stay, advance, skip) * Math.max(0.001, emission[stateIndex]);
            }
          }

          nextPosterior = normalizeVector(nextPosterior);
          autoPosteriorRef.current = nextPosterior;

          let bestState = 0;
          let bestProbability = -1;
          let secondProbability = -1;
          for (let stateIndex = 0; stateIndex < nextPosterior.length; stateIndex += 1) {
            const probability = nextPosterior[stateIndex];
            if (probability > bestProbability) {
              secondProbability = bestProbability;
              bestProbability = probability;
              bestState = stateIndex;
            } else if (probability > secondProbability) {
              secondProbability = probability;
            }
          }

          const confidenceRatio = bestProbability / Math.max(0.0001, secondProbability);
          setAutoSyncConfidence(confidenceRatio);

          autoRecentCandidatesRef.current.push(bestState);
          if (autoRecentCandidatesRef.current.length > 8) {
            autoRecentCandidatesRef.current.shift();
          }

          const candidateCounts = new Map<number, number>();
          autoRecentCandidatesRef.current.forEach((candidate) => {
            candidateCounts.set(candidate, (candidateCounts.get(candidate) ?? 0) + 1);
          });

          let majorityState = bestState;
          let majorityCount = 0;
          candidateCounts.forEach((count, stateIndex) => {
            if (count > majorityCount) {
              majorityCount = count;
              majorityState = stateIndex;
            }
          });

          const stableCandidate = majorityCount >= 5 ? majorityState : null;
          if (stableCandidate !== null && confidenceRatio >= 1.06) {
            const currentState = autoCurrentStateRef.current;
            if (currentState === null) {
              autoCurrentStateRef.current = stableCandidate;
              autoLastStateChangeMsRef.current = elapsedMs;
              autoStateEventsRef.current.push({
                stateIndex: stableCandidate,
                timeMs: elapsedMs,
                confidence: confidenceRatio,
              });
              setAutoStateEventCount(autoStateEventsRef.current.length);
              setAutoSyncActiveStateIndex(stableCandidate);
            } else if (stableCandidate !== currentState) {
              const guidedStateDuration = autoGuideLoopDurationMsRef.current
                ? (autoGuideLoopDurationMsRef.current / Math.max(1, chordCount))
                : null;
              const onsetScarce = micOnsetsMsRef.current.length < 2 && elapsedMs > 4000;
              const minimumStateDurationMs = guidedStateDuration
                ? Math.max(260, guidedStateDuration * (onsetScarce ? 0.55 : 0.35))
                : (onsetScarce ? 620 : 320);
              if (elapsedMs - autoLastStateChangeMsRef.current >= minimumStateDurationMs) {
                const expectedNext = (currentState + 1) % stateCount;
                const expectedNextTwo = (currentState + 2) % stateCount;
                const nearOnset = (elapsedMs - micLastOnsetAtMsRef.current) <= 260;
                const sequentialStep = stableCandidate === expectedNext
                  || stableCandidate === expectedNextTwo;
                const onsetCondition = nearOnset || onsetScarce;
                const acceptableStep = onsetCondition
                  && (sequentialStep || confidenceRatio >= (onsetScarce ? 1.95 : 1.45));

                if (acceptableStep) {
                  autoCurrentStateRef.current = stableCandidate;
                  autoLastStateChangeMsRef.current = elapsedMs;
                  autoStateEventsRef.current.push({
                    stateIndex: stableCandidate,
                    timeMs: elapsedMs,
                    confidence: confidenceRatio,
                  });
                  setAutoStateEventCount(autoStateEventsRef.current.length);
                  setAutoSyncActiveStateIndex(stableCandidate);
                }
              }
            } else {
              setAutoSyncActiveStateIndex(currentState);
            }
          }

          const requirements = getAutoLockRequirements(
            chordCount,
            autoGuideLoopDurationMsRef.current ?? undefined
          );
          if (elapsedMs >= requirements.minimumListenMs) {
            const inferredSync = inferSyncFromStateEvents(
              autoStateEventsRef.current,
              chordCount,
              autoGuideLoopDurationMsRef.current ?? undefined
            );
            if (inferredSync) {
              stopMicCapture();
              finalizeAutoSync(inferredSync, performance.now());
              return;
            }
          }
        }

        micRafIdRef.current = window.requestAnimationFrame(tick);
      };

      micRafIdRef.current = window.requestAnimationFrame(tick);
    } catch (error) {
      stopMicCapture();
      setAutoSyncStatus('error');
      const message = error instanceof Error ? error.message : 'Unable to access microphone.';
      setAutoSyncError(message);
    }
  };

  const handleStopAndAnalyzeAutoSync = () => {
    const requirements = getAutoLockRequirements(chordCount, autoGuideLoopDurationMs ?? undefined);
    const inferredSync = inferSyncFromStateEvents(
      autoStateEventsRef.current,
      chordCount,
      autoGuideLoopDurationMs ?? undefined
    );
    stopMicCapture();
    if (!inferredSync) {
      setAutoSyncStatus('error');
      setAutoSyncError(
        `Need more stable listening. Target at least ${(requirements.minimumListenMs / 1000).toFixed(1)}s and ${requirements.minimumStateEvents} chord changes.`
      );
      return;
    }
    finalizeAutoSync(inferredSync, performance.now());
  };

  useEffect(() => {
    return () => {
      stopMicCapture();
    };
  }, [stopMicCapture]);

  useEffect(() => {
    if (syncMode === 'auto' && captureStatus === 'running') {
      setCaptureStatus('idle');
      setCaptureStartMs(null);
    }

    if (syncMode === 'manual' && autoSyncStatus === 'listening') {
      stopMicCapture();
      setAutoSyncStatus('idle');
    }
  }, [syncMode, captureStatus, autoSyncStatus, stopMicCapture]);

  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      if (event.code !== 'Space') {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target
        && (
          target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.isContentEditable
        )
      ) {
        return;
      }

      if (syncMode === 'auto' && autoSyncStatus === 'listening') {
        event.preventDefault();
        const elapsedMs = performance.now() - micStartedAtMsRef.current;
        if (elapsedMs >= 0) {
          setAutoGuideTapTimesMs((previous) => [...previous, elapsedMs].slice(-8));
        }
        return;
      }

      if (syncMode !== 'manual') {
        return;
      }

      if (captureStatus !== 'running' || captureStartMs === null) {
        return;
      }

      event.preventDefault();
      const now = performance.now();
      const relativeOffset = now - captureStartMs;
      setCapturedFencepostsMs((previous) => {
        const next = [...previous, relativeOffset];
        if (next.length >= requiredFenceposts) {
          const firstFencepost = next[0];
          const finalFencepost = next[next.length - 1];
          const measuredLoopDuration = normalizeLoopDurationMs(finalFencepost - firstFencepost);

          const rawChordOffsets = startedWithFirstChord
            ? next.slice(0, chordCount).map((value) => value - firstFencepost)
            : next.slice(1, chordCount + 1).map((value) => value - firstFencepost);

          const finalizedOffsets = rawChordOffsets
            .map((value) => normalizeOffsetMs(value, measuredLoopDuration))
            .sort((a, b) => a - b);

          setLoopDurationMs(measuredLoopDuration);
          setChordOffsetsDraft(finalizedOffsets);
          setCaptureStatus('done');
          setCaptureStartMs(null);
        }
        return next;
      });
    };

    window.addEventListener('keydown', handleSpace);
    return () => {
      window.removeEventListener('keydown', handleSpace);
    };
  }, [
    captureStatus,
    captureStartMs,
    requiredFenceposts,
    chordCount,
    startedWithFirstChord,
    syncMode,
    autoSyncStatus,
  ]);

  const handleStartCapture = () => {
    if (!canStartCapture) {
      return;
    }
    // Treat capture start as t0, so users only tap the remaining fenceposts.
    setCapturedFencepostsMs([0]);
    setChordOffsetsDraft([]);
    setLoopDurationMs(0);
    setCaptureStartMs(performance.now());
    setCaptureStatus('running');
  };

  const handleResetCapture = () => {
    setCapturedFencepostsMs([]);
    setChordOffsetsDraft([]);
    setLoopDurationMs(0);
    setCaptureStartMs(null);
    setCaptureStatus('idle');
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave(
      buildLoopSyncConfigFromDraft(
        progressionKey,
        progression,
        loopLabel,
        chordCount,
        loopDurationMs,
        startedWithFirstChord,
        chordOffsetsDraft
      )
    );

    onClose();
  };

  const captureProgress = captureStatus === 'running'
    ? Math.min(1, capturedFencepostsMs.length / Math.max(1, requiredFenceposts))
    : captureStatus === 'done'
      ? 1
      : 0;
  const loopLengthSeconds = loopDurationMs > 0 ? (loopDurationMs / 1000).toFixed(2) : '--';

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg border border-slate-700 p-4 shadow-xl"
        style={{ backgroundColor: 'rgb(30 41 59)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="mb-3 flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2"
          style={{ backgroundColor: 'rgb(15 23 42)' }}
        >
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
              Sync Looper
            </h3>
            <p className="text-xs text-slate-400">
              {progression.title} • {progression.romanNumerals}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            X
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700 md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Loop Identity
            </p>
            <div className="mt-2">
              <label className="block">
                <span className="text-[11px] text-slate-400">Name</span>
                <input
                  type="text"
                  value={loopLabel}
                  onChange={(event) => setLoopLabel(event.target.value)}
                  placeholder={progression.title}
                  className="mt-1 w-full rounded border border-slate-700 px-2 py-1.5 text-xs outline-none ring-primary-500/50 focus:ring-2"
                  style={{ backgroundColor: 'rgb(15 23 42)', color: 'rgb(241 245 249)' }}
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700 md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Capture Mode
            </p>
            <div className="mt-2 inline-flex rounded-md bg-slate-900 p-1 ring-1 ring-slate-700">
              <button
                type="button"
                onClick={() => setSyncMode('manual')}
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  syncMode === 'manual'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setSyncMode('auto')}
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  syncMode === 'auto'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Auto (Mic)
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Manual = spacebar timing capture. Auto = microphone onset detection.
            </p>
          </section>

          {syncMode === 'manual' && (
            <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700 md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Chord Timing Capture
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400">Alignment:</span>
                <div className="inline-flex rounded bg-slate-900 p-0.5 ring-1 ring-slate-700">
                  <button
                    type="button"
                    onClick={() => setStartedWithFirstChord(true)}
                    className={`rounded px-2 py-0.5 font-semibold ${
                      startedWithFirstChord
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    t0 = chord 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartedWithFirstChord(false)}
                    className={`rounded px-2 py-0.5 font-semibold ${
                      !startedWithFirstChord
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    t0 before chord 1
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Start Capture locks <span className="font-semibold text-slate-200">t0</span>. Then capture fenceposts with <span className="font-semibold text-slate-200">Space</span>:
                {' '}
                {startedWithFirstChord
                  ? `first chord through loop return (${requiredFenceposts} fenceposts total)`
                  : `loop start + each chord + loop return (${requiredFenceposts} fenceposts total)`}
                .
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Chords: {chordSequence.join(' • ')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Roman: {romanSequence.join(' • ')}
              </p>
              <p className="mt-2 text-xs text-slate-300">
                Loop Length (read-only): <span className="font-mono text-sky-300">{loopLengthSeconds}s</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <LoopRing
                  progress={captureProgress}
                  label={captureStatus === 'running' ? 'Capturing Fenceposts' : 'Capture Stopped'}
                  subLabel={`${capturedFencepostsMs.length}/${requiredFenceposts} captured`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartCapture}
                    disabled={!canStartCapture || captureStatus === 'running'}
                    className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {captureStatus === 'done' ? 'Capture Again' : 'Start Capture'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCapture}
                    disabled={captureStatus === 'idle' && chordOffsetsDraft.length === 0}
                    className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {chordOffsetsDraft.length > 0 && (
                <p className="mt-2 text-[11px] text-slate-400">
                  Captured chord starts (ms): {chordOffsetsDraft.join(', ')}
                </p>
              )}
            </section>
          )}

          {syncMode === 'auto' && (
            <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700 md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Auto Sync (Mic Beta)
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Real-time chord-aware locking. You can start listening at any point in the loop.
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Best lock: start listening right before loop restart, then tap <span className="font-semibold text-slate-300">Space</span> on each loop restart.
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-800 ring-1 ring-slate-700">
                <div
                  className="h-full bg-sky-400 transition-all"
                  style={{ width: `${Math.max(2, Math.min(100, autoSyncInputLevel * 100))}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: {autoSyncStatus}</span>
                <span>{(autoSyncElapsedMs / 1000).toFixed(1)}s • {autoSyncOnsetCount} onsets</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Guide taps (Space while listening): {autoGuideTapTimesMs.length}</span>
                <span>
                  Guide loop:{' '}
                  <span className="font-mono text-sky-300">
                    {autoGuideLoopDurationMs ? `${(autoGuideLoopDurationMs / 1000).toFixed(2)}s` : '--'}
                  </span>
                </span>
              </div>
              {autoSyncStatus === 'listening' && autoSyncElapsedMs > 4000 && autoSyncOnsetCount === 0 && (
                <p className="mt-1 text-[11px] text-amber-300">
                  No onsets detected yet. Raise input level, point mic toward amp, or tap Space on loop restarts.
                </p>
              )}
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Stability window</span>
                <span>
                  {Math.round(autoStabilityReadiness * 100)}% • {autoStateEventCount}/{autoLockRequirements.minimumStateEvents} changes
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-slate-800 ring-1 ring-slate-700">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.max(3, Math.min(100, autoStabilityReadiness * 100))}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Auto-lock waits for at least {(autoLockRequirements.minimumListenMs / 1000).toFixed(1)}s of listening.
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Estimated chord:{' '}
                  <span className="font-semibold text-slate-200">
                    {autoSyncActiveStateIndex === null
                      ? '—'
                      : `${romanSequence[autoSyncActiveStateIndex] ?? '—'} (${chordSequence[autoSyncActiveStateIndex] ?? '—'})`}
                  </span>
                </span>
                <span>Conf {autoSyncConfidence.toFixed(2)}x</span>
              </div>
              {autoSyncError && (
                <p className="mt-2 text-[11px] text-rose-300">{autoSyncError}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {autoSyncStatus !== 'listening' ? (
                  <button
                    type="button"
                    onClick={handleStartAutoSync}
                    className="rounded bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500"
                  >
                    Start Listening
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopAndAnalyzeAutoSync}
                    className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500"
                  >
                    Stop Listening
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAutoGuideTapTimesMs([])}
                  className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                >
                  Clear Guide
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-xs text-slate-500">
            {canSave
              ? 'Ready to save sync data locally for this progression.'
              : 'Complete loop length + chord timing to enable save.'}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Sync
          </button>
        </div>
      </div>
    </div>
  );
}

function getElapsedMs(transport: LoopTransportState, nowMs: number, loopDurationMs: number): number {
  if (transport.status === 'playing') {
    return (nowMs - transport.startedAtMs + loopDurationMs) % loopDurationMs;
  }

  return transport.pausedElapsedMs % loopDurationMs;
}

export default function PracticeProgressionsPanel({
  tonalCenterMode,
  tonalKey,
  majorCenterKey,
  minorCenterKey,
  scaleFamilyLabel,
  progressions,
  panelHeightPx,
  onActiveChordPitchClassesChange,
  onActiveChordSymbolChange,
  onHideNonScaleChordTonesChange,
  onClose,
}: PracticeProgressionsPanelProps) {
  const panelContainerRef = useRef<HTMLElement | null>(null);
  const scrollRegionRef = useRef<HTMLDivElement | null>(null);
  const [selectedProgressionKey, setSelectedProgressionKey] = useState<string | null>(null);
  const [optionsWheelForKey, setOptionsWheelForKey] = useState<string | null>(null);
  const [syncModalForKey, setSyncModalForKey] = useState<string | null>(null);
  const [syncConfigsByKey, setSyncConfigsByKey] = useState<Record<string, LoopSyncConfig>>({});
  const [syncConfigsLoaded, setSyncConfigsLoaded] = useState(false);
  const [transport, setTransport] = useState<LoopTransportState | null>(null);
  const [showAllActiveChordTones, setShowAllActiveChordTones] = useState(true);
  const [hideNonScaleChordTones, setHideNonScaleChordTones] = useState(false);
  const [nowMs, setNowMs] = useState<number>(0);
  const lastReportedActiveChordKeyRef = useRef<string | null>(null);
  const resolvedPanelHeightPx = typeof panelHeightPx === 'number' && Number.isFinite(panelHeightPx)
    ? Math.max(260, Math.floor(panelHeightPx))
    : null;

  const progressionEntries = useMemo(
    () => progressions.map((progression) => {
      const progressionKey = getProgressionSyncKey(
        progression,
        tonalCenterMode,
        tonalKey,
        scaleFamilyLabel
      );
      return { progression, progressionKey };
    }),
    [progressions, tonalCenterMode, tonalKey, scaleFamilyLabel]
  );

  const progressionByKey = useMemo(
    () => new Map(progressionEntries.map((entry) => [entry.progressionKey, entry.progression])),
    [progressionEntries]
  );

  useEffect(() => {
    setNowMs(performance.now());
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOOP_SYNC_STORAGE_KEY);
      if (!raw) {
        setSyncConfigsLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, LoopSyncConfig>;
      if (parsed && typeof parsed === 'object') {
        setSyncConfigsByKey(parsed);
      }
    } catch {
      // Keep default empty state if parsing fails.
    } finally {
      setSyncConfigsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!syncConfigsLoaded) {
      return;
    }
    window.localStorage.setItem(LOOP_SYNC_STORAGE_KEY, JSON.stringify(syncConfigsByKey));
  }, [syncConfigsByKey, syncConfigsLoaded]);

  useEffect(() => {
    if (!transport || transport.status !== 'playing') {
      return;
    }

    let rafId = 0;
    const tick = () => {
      setNowMs(performance.now());
      rafId = window.requestAnimationFrame(tick);
    };

    tick();
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [transport]);

  useEffect(() => {
    if (!transport) {
      return;
    }
    if (!progressionByKey.has(transport.progressionKey)) {
      setTransport(null);
    }
  }, [transport, progressionByKey]);

  useEffect(() => {
    if (!showAllActiveChordTones) {
      onActiveChordPitchClassesChange?.(null);
    }

    if (!transport || transport.status === 'stopped') {
      if (lastReportedActiveChordKeyRef.current !== null) {
        lastReportedActiveChordKeyRef.current = null;
        onActiveChordPitchClassesChange?.(null);
        onActiveChordSymbolChange?.(null);
      }
      return;
    }

    const progression = progressionByKey.get(transport.progressionKey);
    const config = syncConfigsByKey[transport.progressionKey];
    if (!progression || !config) {
      if (lastReportedActiveChordKeyRef.current !== null) {
        lastReportedActiveChordKeyRef.current = null;
        onActiveChordPitchClassesChange?.(null);
        onActiveChordSymbolChange?.(null);
      }
      return;
    }

    const loopDurationMs = normalizeLoopDurationMs(config.loopDurationMs);
    const elapsedMs = getElapsedMs(transport, nowMs, loopDurationMs);
    const activeChordIndex = getActiveChordIndex(config.chordOffsetsMs, elapsedMs, loopDurationMs);
    const chordSequence = parseChordSequence(progression.chordNames);
    const activeChordSymbol = chordSequence[activeChordIndex];
    if (!activeChordSymbol) {
      if (lastReportedActiveChordKeyRef.current !== null) {
        lastReportedActiveChordKeyRef.current = null;
        onActiveChordPitchClassesChange?.(null);
        onActiveChordSymbolChange?.(null);
      }
      return;
    }

    const reportKey = `${transport.progressionKey}:${transport.status}:${activeChordIndex}:${activeChordSymbol}`;
    if (lastReportedActiveChordKeyRef.current === reportKey) {
      return;
    }

    lastReportedActiveChordKeyRef.current = reportKey;
    onActiveChordPitchClassesChange?.(
      showAllActiveChordTones
        ? getChordPitchClassesFromSymbol(activeChordSymbol)
        : null
    );
    onActiveChordSymbolChange?.(activeChordSymbol);
  }, [
    transport,
    nowMs,
    progressionByKey,
    syncConfigsByKey,
    showAllActiveChordTones,
    onActiveChordPitchClassesChange,
    onActiveChordSymbolChange,
  ]);

  useEffect(() => {
    return () => {
      onActiveChordPitchClassesChange?.(null);
      onActiveChordSymbolChange?.(null);
    };
  }, [onActiveChordPitchClassesChange, onActiveChordSymbolChange]);

  useEffect(() => {
    onHideNonScaleChordTonesChange?.(hideNonScaleChordTones);
  }, [hideNonScaleChordTones, onHideNonScaleChordTonesChange]);

  const modalProgression = syncModalForKey ? progressionByKey.get(syncModalForKey) : undefined;

  const applyPanelWheelScroll = useCallback((deltaX: number, deltaY: number): boolean => {
    const scrollRegion = scrollRegionRef.current;
    if (!scrollRegion) {
      return false;
    }

    const canScrollY = scrollRegion.scrollHeight > scrollRegion.clientHeight + 1;
    const canScrollX = scrollRegion.scrollWidth > scrollRegion.clientWidth + 1;

    if (!canScrollY && !canScrollX) {
      return false;
    }

    const prevTop = scrollRegion.scrollTop;
    const prevLeft = scrollRegion.scrollLeft;

    if (canScrollY && Math.abs(deltaY) > 0) {
      scrollRegion.scrollTop += deltaY;
    }
    if (canScrollX && Math.abs(deltaX) > 0) {
      scrollRegion.scrollLeft += deltaX;
    }

    return scrollRegion.scrollTop !== prevTop || scrollRegion.scrollLeft !== prevLeft || canScrollY || canScrollX;
  }, []);

  const handlePanelWheel = useCallback((event: React.WheelEvent<HTMLElement>) => {
    const handled = applyPanelWheelScroll(event.deltaX, event.deltaY);
    if (!handled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }, [applyPanelWheelScroll]);

  useEffect(() => {
    const panelContainer = panelContainerRef.current;
    if (!panelContainer) {
      return;
    }

    const handleNativeWheel = (event: WheelEvent) => {
      const handled = applyPanelWheelScroll(event.deltaX, event.deltaY);
      if (!handled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };

    panelContainer.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      panelContainer.removeEventListener('wheel', handleNativeWheel);
    };
  }, [applyPanelWheelScroll]);

  const handleSaveSyncConfig = (config: LoopSyncConfig) => {
    setSyncConfigsByKey((current) => ({
      ...current,
      [config.progressionKey]: config,
    }));
  };

  const handleAutoSyncDetected = (config: LoopSyncConfig, startedAtMs: number) => {
    setSyncConfigsByKey((current) => ({
      ...current,
      [config.progressionKey]: config,
    }));
    setSelectedProgressionKey(config.progressionKey);
    setOptionsWheelForKey(null);
    setTransport({
      progressionKey: config.progressionKey,
      status: 'playing',
      startedAtMs,
      pausedElapsedMs: 0,
    });
  };

  const handlePlay = (progressionKey: string) => {
    const config = syncConfigsByKey[progressionKey];
    if (!config) {
      return;
    }
    const now = performance.now();

    setTransport((current) => {
      if (current && current.progressionKey === progressionKey) {
        if (current.status === 'playing') {
          return current;
        }
        return {
          ...current,
          status: 'playing',
          startedAtMs: now - current.pausedElapsedMs,
        };
      }

      return {
        progressionKey,
        status: 'playing',
        startedAtMs: now,
        pausedElapsedMs: 0,
      };
    });
  };

  const handlePause = (progressionKey: string) => {
    const config = syncConfigsByKey[progressionKey];
    if (!config) {
      return;
    }
    const duration = normalizeLoopDurationMs(config.loopDurationMs);
    const now = performance.now();

    setTransport((current) => {
      if (!current || current.progressionKey !== progressionKey || current.status !== 'playing') {
        return current;
      }

      return {
        ...current,
        status: 'paused',
        pausedElapsedMs: (now - current.startedAtMs + duration) % duration,
      };
    });
  };

  const handleStop = (progressionKey: string) => {
    setTransport((current) => {
      if (!current || current.progressionKey !== progressionKey) {
        return current;
      }

      return {
        ...current,
        status: 'stopped',
        pausedElapsedMs: 0,
      };
    });
  };

  const handleClearLoop = (progressionKey: string) => {
    setSyncConfigsByKey((current) => {
      if (!current[progressionKey]) {
        return current;
      }
      const next = { ...current };
      delete next[progressionKey];
      return next;
    });

    setTransport((current) => (
      current?.progressionKey === progressionKey ? null : current
    ));
    setOptionsWheelForKey((current) => (
      current === progressionKey ? null : current
    ));
    setSyncModalForKey((current) => (
      current === progressionKey ? null : current
    ));
    onActiveChordPitchClassesChange?.(null);
    onActiveChordSymbolChange?.(null);
  };

  return (
    <>
      <aside
        ref={panelContainerRef}
        className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl"
        onWheelCapture={handlePanelWheel}
        style={{
          maxWidth: '320px',
          height: resolvedPanelHeightPx ? `${resolvedPanelHeightPx}px` : undefined,
          maxHeight: resolvedPanelHeightPx ? `${resolvedPanelHeightPx}px` : undefined,
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-200">
            Practice Progressions
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-1.5 py-0.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label="Close progressions panel"
          >
            X
          </button>
        </div>

        <div
          ref={scrollRegionRef}
          className={`overflow-auto px-3 py-2 ${
            resolvedPanelHeightPx ? 'min-h-0 flex-1' : 'max-h-[70vh]'
          } overscroll-contain`}
        >
          <div className="space-y-1 text-[11px] text-slate-400">
            <p>
              Tonal center:{' '}
              <span className="font-semibold text-slate-200">{tonalKey} {tonalCenterMode}</span>
            </p>
            <p>
              Relative pair: {majorCenterKey} major / {minorCenterKey} minor
            </p>
            <p>
              Family: {scaleFamilyLabel}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {progressionEntries.map(({ progression, progressionKey }) => {
              const isSelected = selectedProgressionKey === progressionKey;
              const syncConfig = syncConfigsByKey[progressionKey];
              const hasSync = Boolean(syncConfig);
              const isTransportProgression = transport?.progressionKey === progressionKey;
              const loopDurationMs = syncConfig?.loopDurationMs ?? 1;
              const elapsedMs = isTransportProgression && transport
                ? getElapsedMs(transport, nowMs, loopDurationMs)
                : 0;
              const loopProgress = hasSync
                ? getLoopProgress(elapsedMs, loopDurationMs)
                : 0;

              const chordSequence = parseChordSequence(progression.chordNames);
              const romanSequence = parseChordSequence(progression.romanNumerals);
              const activeChordIndex = hasSync
                ? getActiveChordIndex(syncConfig.chordOffsetsMs, elapsedMs, loopDurationMs)
                : 0;
              const activeRoman = romanSequence[activeChordIndex] ?? '—';
              const activeChord = chordSequence[activeChordIndex] ?? '—';

              return (
                <div
                  key={progressionKey}
                  className={`rounded px-2.5 py-2 ring-1 transition-colors ${
                    isSelected
                      ? 'bg-slate-900 ring-sky-400/60'
                      : 'bg-slate-900 ring-slate-700'
                  }`}
                  onClick={() => {
                    setSelectedProgressionKey(progressionKey);
                    setOptionsWheelForKey(progressionKey);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-100">{progression.title}</p>
                    {hasSync && (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                        Synced
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-slate-300">{progression.romanNumerals}</p>
                  <p className="mt-1 font-mono text-[11px] text-sky-300">{progression.chordNames}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{progression.whyItFits}</p>

                  {isSelected && (
                    <div className="mt-2 rounded-md bg-slate-800 p-2 ring-1 ring-slate-700">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOptionsWheelForKey((current) => (
                              current === progressionKey ? null : progressionKey
                            ));
                          }}
                          className="h-8 w-8 rounded-full bg-slate-700/90 text-sm text-slate-200 ring-1 ring-white/20 hover:bg-slate-600"
                          aria-label="Progression options"
                        >
                          ⚙
                        </button>
                        <p className="text-[11px] text-slate-400">
                          {hasSync ? 'Looper sync ready' : 'No looper sync yet'}
                        </p>
                      </div>

                      {optionsWheelForKey === progressionKey && (
                        <div className="mt-2 rounded-md border border-slate-700 bg-slate-800 p-2 shadow-xl">
                          <div className="mb-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                              Sync Looper
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Capture loop length and chord change timing.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSyncModalForKey(progressionKey);
                            }}
                            className="w-full rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-500"
                          >
                            Sync Looper
                          </button>
                        </div>
                      )}

                      {hasSync && (
                        <div className="mt-2 rounded-md border border-slate-700 bg-slate-800 p-2 shadow-xl">
                          <div className="mb-2 flex items-center justify-between rounded-md bg-slate-900 px-2 py-1 ring-1 ring-slate-700">
                            <p className="truncate text-[11px] font-semibold text-slate-200">
                              {syncConfig?.loopLabel?.trim() || progression.title}
                            </p>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSyncModalForKey(progressionKey);
                              }}
                              className="rounded px-1.5 py-0.5 text-xs text-slate-200 hover:bg-slate-700"
                              title="Edit loop name"
                              aria-label="Edit loop name"
                            >
                              ✏️
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <LoopRing
                              progress={loopProgress}
                              label={
                                isTransportProgression
                                  ? transport?.status === 'playing'
                                    ? 'Playing'
                                    : transport?.status === 'paused'
                                      ? 'Paused'
                                      : 'Stopped'
                                  : 'Stopped'
                              }
                              subLabel={`Active: ${activeRoman} (${activeChord})`}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setShowAllActiveChordTones((current) => !current);
                              }}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-sm ring-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
                                showAllActiveChordTones
                                  ? 'bg-sky-500/20 text-sky-200 ring-sky-400/40'
                                  : 'bg-slate-800 text-slate-300 ring-slate-600'
                              }`}
                              title="Show active chord tones"
                              aria-label="Show active chord tones"
                            >
                              🎯
                            </button>
                            <div className="inline-flex items-center gap-2">
                              <span
                                className={`w-7 text-right text-[10px] font-semibold tracking-wide ${
                                  showAllActiveChordTones ? 'text-emerald-300' : 'text-slate-400'
                                }`}
                              >
                                {showAllActiveChordTones ? 'ON' : 'OFF'}
                              </span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setShowAllActiveChordTones((current) => !current);
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
                                  showAllActiveChordTones
                                    ? 'border-emerald-300 bg-emerald-500'
                                    : 'border-slate-500 bg-slate-700'
                                }`}
                                title="Show active chord tones"
                                aria-label="Show active chord tones"
                                role="switch"
                                aria-checked={showAllActiveChordTones}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                    showAllActiveChordTones ? 'translate-x-5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setHideNonScaleChordTones((current) => !current);
                              }}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-sm ring-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
                                hideNonScaleChordTones
                                  ? 'bg-rose-500/20 text-rose-200 ring-rose-400/40'
                                  : 'bg-slate-800 text-slate-300 ring-slate-600'
                              }`}
                              title="Hide non-scale chord tones on loop playback"
                              aria-label="Hide non-scale chord tones on loop playback"
                            >
                              👻
                            </button>
                            <div className="inline-flex items-center gap-2">
                              <span
                                className={`w-9 text-right text-[10px] font-semibold tracking-wide ${
                                  hideNonScaleChordTones ? 'text-rose-300' : 'text-slate-400'
                                }`}
                              >
                                {hideNonScaleChordTones ? 'HIDE' : 'SHOW'}
                              </span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setHideNonScaleChordTones((current) => !current);
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
                                  hideNonScaleChordTones
                                    ? 'border-rose-300 bg-rose-500'
                                    : 'border-slate-500 bg-slate-700'
                                }`}
                                title="Hide non-scale chord tones on loop playback"
                                aria-label="Hide non-scale chord tones on loop playback"
                                role="switch"
                                aria-checked={hideNonScaleChordTones}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                    hideNonScaleChordTones ? 'translate-x-5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                            {chordSequence.map((chord, chordIndex) => (
                              <span
                                key={`${progressionKey}-chord-${chordIndex}`}
                                title={romanSequence[chordIndex] ? `${romanSequence[chordIndex]} ${chord}` : chord}
                                className={`rounded px-3 py-0.5 text-[10px] font-semibold ${
                                  chordIndex === activeChordIndex
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {chord}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePlay(progressionKey);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-base text-white hover:bg-emerald-500"
                              title="Play"
                              aria-label="Play"
                            >
                              ▶️
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePause(progressionKey);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-600 text-base text-white hover:bg-amber-500"
                              title="Pause"
                              aria-label="Pause"
                            >
                              ⏸️
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStop(progressionKey);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-700 text-base text-white hover:bg-rose-600"
                              title="Stop"
                              aria-label="Stop"
                            >
                              ⏹️
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClearLoop(progressionKey);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-900 text-base text-rose-100 hover:bg-rose-800"
                              title="Clear Loop"
                              aria-label="Clear Loop"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {modalProgression && syncModalForKey && (
        <LooperSyncModal
          progression={modalProgression}
          progressionKey={syncModalForKey}
          existingConfig={syncConfigsByKey[syncModalForKey]}
          onSave={handleSaveSyncConfig}
          onAutoSyncDetected={handleAutoSyncDetected}
          onClose={() => setSyncModalForKey(null)}
        />
      )}
    </>
  );
}
