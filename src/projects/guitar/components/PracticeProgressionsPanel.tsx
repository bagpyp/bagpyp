'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { PracticeProgression } from '../lib/progression-recommendations';
import {
  type LoopSyncConfig,
  buildChordOffsetsMs,
  getActiveChordIndex,
  getLoopProgress,
  getProgressionSyncKey,
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
  onClose: () => void;
}

const LOOP_SYNC_STORAGE_KEY = 'guitar:loop-sync-configs:v1';

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
  const [loopDurationMs, setLoopDurationMs] = useState(
    existingConfig?.loopDurationMs ?? 0
  );
  const [measurementStatus, setMeasurementStatus] = useState<'idle' | 'running' | 'done'>(
    existingConfig?.loopDurationMs ? 'done' : 'idle'
  );
  const [measurementStartMs, setMeasurementStartMs] = useState<number | null>(null);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'running' | 'done'>(
    existingConfig?.chordOffsetsMs?.length === chordCount ? 'done' : 'idle'
  );
  const [captureStartMs, setCaptureStartMs] = useState<number>(0);
  const [capturedPressesMs, setCapturedPressesMs] = useState<number[]>([]);
  const [chordOffsetsDraft, setChordOffsetsDraft] = useState<number[]>(
    existingConfig?.chordOffsetsMs ?? []
  );
  const [nowMs, setNowMs] = useState<number>(0);

  const requiredPresses = Math.max(0, chordCount - (startedWithFirstChord ? 1 : 0));
  const canStartCapture = normalizeLoopDurationMs(loopDurationMs) > 0 && requiredPresses > 0;
  const canSave =
    normalizeLoopDurationMs(loopDurationMs) > 0 &&
    chordOffsetsDraft.length === chordCount &&
    chordCount > 0;

  useEffect(() => {
    if (captureStatus !== 'running' && measurementStatus !== 'running') {
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
  }, [captureStatus, measurementStatus]);

  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      if (event.code !== 'Space') {
        return;
      }

      event.preventDefault();
      const now = performance.now();

      if (captureStatus === 'running') {
        const normalizedLoopDuration = normalizeLoopDurationMs(loopDurationMs);
        const relativeOffset = ((now - captureStartMs) % normalizedLoopDuration + normalizedLoopDuration) % normalizedLoopDuration;
        setCapturedPressesMs((previous) => {
          const next = [...previous, relativeOffset];
          if (next.length >= requiredPresses) {
            const finalizedOffsets = buildChordOffsetsMs(
              chordCount,
              normalizedLoopDuration,
              startedWithFirstChord,
              next
            );
            setChordOffsetsDraft(finalizedOffsets);
            setCaptureStatus('done');
          }
          return next;
        });
        return;
      }

      if (measurementStatus === 'running') {
        if (!measurementStartMs) {
          return;
        }
        const measuredLoopDuration = normalizeLoopDurationMs(now - measurementStartMs);
        setLoopDurationMs(measuredLoopDuration);
        setMeasurementStatus('done');
        setMeasurementStartMs(null);

        if (requiredPresses === 0) {
          setChordOffsetsDraft([0]);
          setCaptureStatus('done');
        } else {
          setCaptureStatus('idle');
          setChordOffsetsDraft([]);
          setCapturedPressesMs([]);
        }
        return;
      }

      if (measurementStatus === 'idle') {
        setMeasurementStartMs(now);
        setMeasurementStatus('running');
      }
    };

    window.addEventListener('keydown', handleSpace);
    return () => {
      window.removeEventListener('keydown', handleSpace);
    };
  }, [
    captureStatus,
    measurementStatus,
    measurementStartMs,
    captureStartMs,
    loopDurationMs,
    requiredPresses,
    chordCount,
    startedWithFirstChord,
  ]);

  const handleStartLoopMeasurement = () => {
    setMeasurementStartMs(performance.now());
    setMeasurementStatus('running');
  };

  const handleStopLoopMeasurement = () => {
    if (!measurementStartMs) {
      return;
    }
    const measuredLoopDuration = normalizeLoopDurationMs(performance.now() - measurementStartMs);
    setLoopDurationMs(measuredLoopDuration);
    setMeasurementStatus('done');
    setMeasurementStartMs(null);

    if (requiredPresses === 0) {
      setChordOffsetsDraft([0]);
      setCaptureStatus('done');
    } else {
      setCaptureStatus('idle');
      setChordOffsetsDraft([]);
      setCapturedPressesMs([]);
    }
  };

  const handleStartCapture = () => {
    if (!canStartCapture) {
      return;
    }
    setCapturedPressesMs([]);
    setChordOffsetsDraft([]);
    setCaptureStartMs(performance.now());
    setCaptureStatus('running');
  };

  const handleResetCapture = () => {
    setCapturedPressesMs([]);
    setChordOffsetsDraft([]);
    setCaptureStatus('idle');
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave({
      progressionKey,
      progressionId: progression.id,
      progressionTitle: progression.title,
      chordCount,
      loopDurationMs: normalizeLoopDurationMs(loopDurationMs),
      startedWithFirstChord,
      chordOffsetsMs: chordOffsetsDraft,
      updatedAtMs: Date.now(),
    });

    onClose();
  };

  const captureProgress = captureStatus === 'running'
    ? getLoopProgress(nowMs - captureStartMs, loopDurationMs)
    : 0;
  const measurementSeconds = measurementStatus === 'running' && measurementStartMs
    ? ((nowMs - measurementStartMs) / 1000).toFixed(2)
    : (loopDurationMs > 0 ? (loopDurationMs / 1000).toFixed(2) : '0.00');

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
          <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Alignment
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Did the loop start exactly when you strummed the first chord?
            </p>
            <div className="mt-2 inline-flex rounded-md bg-slate-900 p-1 ring-1 ring-slate-700">
              <button
                type="button"
                onClick={() => setStartedWithFirstChord(true)}
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  startedWithFirstChord
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Yes (default)
              </button>
              <button
                type="button"
                onClick={() => setStartedWithFirstChord(false)}
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  !startedWithFirstChord
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                No
              </button>
            </div>
          </section>

          <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Loop Length (T)
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Press <span className="font-semibold text-slate-200">Space</span> to start measurement, then press it again to stop.
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="font-mono text-lg text-sky-300">{measurementSeconds}s</p>
              {measurementStatus !== 'running' ? (
                <button
                  type="button"
                  onClick={handleStartLoopMeasurement}
                  className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600"
                >
                  Start
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopLoopMeasurement}
                  className="rounded bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-500"
                >
                  Stop
                </button>
              )}
            </div>
          </section>

          <section className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700 md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Chord Timing Capture
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Loop plays visually. Press <span className="font-semibold text-slate-200">Space</span>{' '}
              {requiredPresses > 0 ? `${requiredPresses} more time${requiredPresses === 1 ? '' : 's'}` : '0 more times'}
              {' '}at chord changes.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Chords: {chordSequence.join(' • ')}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Roman: {romanSequence.join(' • ')}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <LoopRing
                progress={captureProgress}
                label={captureStatus === 'running' ? 'Loop Running' : 'Loop Stopped'}
                subLabel={requiredPresses > 0 ? `${capturedPressesMs.length}/${requiredPresses} captured` : 'No extra presses needed'}
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
                Captured offsets (ms): {chordOffsetsDraft.join(', ')}
              </p>
            )}
          </section>
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
  onClose,
}: PracticeProgressionsPanelProps) {
  const [selectedProgressionKey, setSelectedProgressionKey] = useState<string | null>(null);
  const [optionsWheelForKey, setOptionsWheelForKey] = useState<string | null>(null);
  const [syncModalForKey, setSyncModalForKey] = useState<string | null>(null);
  const [syncConfigsByKey, setSyncConfigsByKey] = useState<Record<string, LoopSyncConfig>>({});
  const [syncConfigsLoaded, setSyncConfigsLoaded] = useState(false);
  const [transport, setTransport] = useState<LoopTransportState | null>(null);
  const [nowMs, setNowMs] = useState<number>(0);

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

  const modalProgression = syncModalForKey ? progressionByKey.get(syncModalForKey) : undefined;

  const handleSaveSyncConfig = (config: LoopSyncConfig) => {
    setSyncConfigsByKey((current) => ({
      ...current,
      [config.progressionKey]: config,
    }));
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

  return (
    <>
      <aside
        className="w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl"
        style={{ maxWidth: '320px' }}
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

        <div className="max-h-[70vh] overflow-auto px-3 py-2">
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
                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePlay(progressionKey);
                              }}
                              className="rounded bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                            >
                              Play
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePause(progressionKey);
                              }}
                              className="rounded bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-amber-500"
                            >
                              Pause
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStop(progressionKey);
                              }}
                              className="rounded bg-rose-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-600"
                            >
                              Stop
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
          onClose={() => setSyncModalForKey(null)}
        />
      )}
    </>
  );
}
