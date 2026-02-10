'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getDisplayOrderedBoxPatterns,
  getPitchClass,
  generateBoxShapePatterns,
  getBoxScaleFamilyOptions,
  getRelativeMajorKeyFromMinor,
  getRelativeMinorKeyFromMajor,
  type BoxScaleFamily,
} from '../lib/box-shapes';
import ScalePatternFretboard, { type FretboardMarker } from './ScalePatternFretboard';
import CircleOfFifthsSelector from './CircleOfFifthsSelector';
import PracticeProgressionsPanel from './PracticeProgressionsPanel';
import { getPracticeProgressions } from '../lib/progression-recommendations';
import {
  DEFAULT_SINGLE_TARGET_TONE_STATE,
  HEXATONIC_MODE_OPTIONS,
  getHexatonicModeDisplayLabel,
  getHexatonicModeOption,
  getTargetToneToggleLabel,
  getTargetTonePitchClass,
  SINGLE_TARGET_TONE_CONFIGS,
  TARGET_TONE_BY_ID,
  type HexatonicModeId,
  type SingleTargetToneId,
  type TonalCenterMode,
  type TargetToneConfig,
  type TargetToneId,
} from '../lib/target-tones';

interface BoxShapesProps {
  selectedMajorKey: string;
  onSelectedMajorKeyChange: (key: string) => void;
}

export default function BoxShapes({
  selectedMajorKey,
  onSelectedMajorKeyChange,
}: BoxShapesProps) {
  const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E
  const BOX_FRET_COUNT = 24;
  const [scaleFamily, setScaleFamily] = useState<BoxScaleFamily>('pentatonic');
  const [tonalCenterMode, setTonalCenterMode] = useState<TonalCenterMode>('minor');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [singleTargetToneState, setSingleTargetToneState] = useState({
    ...DEFAULT_SINGLE_TARGET_TONE_STATE,
    flatFive: true,
  });
  const [hexatonicMode, setHexatonicMode] = useState<HexatonicModeId>('off');
  const settingsContainerRef = useRef<HTMLDivElement | null>(null);
  const scaleFamilyOptions = useMemo(
    () => getBoxScaleFamilyOptions().filter((option) => option.value !== 'blues'),
    []
  );

  const majorCenterKey = useMemo(
    () => (tonalCenterMode === 'major' ? selectedMajorKey : getRelativeMajorKeyFromMinor(selectedMajorKey)),
    [selectedMajorKey, tonalCenterMode]
  );
  const minorCenterKey = useMemo(
    () => (tonalCenterMode === 'minor' ? selectedMajorKey : getRelativeMinorKeyFromMajor(selectedMajorKey)),
    [selectedMajorKey, tonalCenterMode]
  );
  const effectiveScaleKey = useMemo(
    () => (scaleFamily === 'major' ? majorCenterKey : minorCenterKey),
    [majorCenterKey, minorCenterKey, scaleFamily]
  );
  const activeScaleFamily = useMemo<BoxScaleFamily>(
    () => (scaleFamily === 'major' ? 'major' : 'pentatonic'),
    [scaleFamily]
  );

  const shapePatterns = useMemo(() => {
    return generateBoxShapePatterns(effectiveScaleKey, activeScaleFamily);
  }, [effectiveScaleKey, activeScaleFamily]);

  const displayPatterns = useMemo(
    () => getDisplayOrderedBoxPatterns(shapePatterns, activeScaleFamily),
    [shapePatterns, activeScaleFamily]
  );
  const activeTargetToneConfigs = useMemo(() => {
    const byId = new Map<TargetToneId, TargetToneConfig>();

    SINGLE_TARGET_TONE_CONFIGS.forEach((config) => {
      if (singleTargetToneState[config.id]) {
        byId.set(config.id, config);
      }
    });

    const selectedHexatonicMode = getHexatonicModeOption(hexatonicMode);
    if (selectedHexatonicMode) {
      selectedHexatonicMode.toneIds.forEach((toneId) => {
        byId.set(toneId, TARGET_TONE_BY_ID[toneId]);
      });
    }

    return [...byId.values()];
  }, [hexatonicMode, singleTargetToneState]);

  const targetPitchClassById = useMemo(() => {
    return Object.fromEntries(
      activeTargetToneConfigs.map((config) => [
        config.id,
        getTargetTonePitchClass(config, majorCenterKey, minorCenterKey),
      ])
    ) as Partial<Record<TargetToneId, number>>;
  }, [activeTargetToneConfigs, majorCenterKey, minorCenterKey]);
  const displayRootPitchClass = useMemo(() => {
    if (activeScaleFamily !== 'pentatonic') {
      return null;
    }
    const rootKey = tonalCenterMode === 'major' ? majorCenterKey : minorCenterKey;
    return getPitchClass(rootKey);
  }, [activeScaleFamily, tonalCenterMode, majorCenterKey, minorCenterKey]);
  const activeSingleTargetToneIds = useMemo<SingleTargetToneId[]>(
    () => SINGLE_TARGET_TONE_CONFIGS
      .filter((config) => singleTargetToneState[config.id])
      .map((config) => config.id),
    [singleTargetToneState]
  );
  const tonalCenterKey = tonalCenterMode === 'major' ? majorCenterKey : minorCenterKey;
  const scaleFamilyLabel = scaleFamilyOptions
    .find((option) => option.value === scaleFamily)
    ?.label ?? (scaleFamily === 'major' ? 'Major (7 modes)' : 'Minor Pentatonic (5 boxes)');
  const activeSingleTargetToneIdsForProgressions = scaleFamily === 'pentatonic'
    ? activeSingleTargetToneIds
    : [];
  const practiceProgressions = useMemo(
    () => getPracticeProgressions({
      tonalCenterMode,
      scaleFamily: activeScaleFamily,
      majorCenterKey,
      minorCenterKey,
      hexatonicMode,
      activeSingleTargetToneIds: activeSingleTargetToneIdsForProgressions,
    }),
    [
      tonalCenterMode,
      activeScaleFamily,
      majorCenterKey,
      minorCenterKey,
      hexatonicMode,
      activeSingleTargetToneIdsForProgressions,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      const key = e.key;

      const naturalMap: Record<string, string> = {
        c: 'C',
        d: 'D',
        e: 'E',
        f: 'F',
        g: 'G',
        a: 'A',
        b: 'B',
      };

      const sharpMap: Record<string, string> = {
        C: 'C#',
        D: 'D#',
        F: 'F#',
        G: 'G#',
        A: 'A#',
        E: 'F',
        B: 'C',
      };

      if (naturalMap[key]) {
        onSelectedMajorKeyChange(naturalMap[key]);
      } else if (sharpMap[key]) {
        onSelectedMajorKeyChange(sharpMap[key]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSelectedMajorKeyChange]);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (settingsContainerRef.current && !settingsContainerRef.current.contains(target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  const title = scaleFamily === 'major'
    ? `${majorCenterKey} Major System - 7 Modal Box Shapes`
    : `${effectiveScaleKey} Minor Pentatonic - 5 Box Shapes`;

  return (
    <div className="w-full bg-slate-900 min-h-screen">
      <div className="mx-auto max-w-[1760px] px-4 py-4 xl:px-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 xl:gap-6 items-start">
          <div className="space-y-4">
            <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>

        <div ref={settingsContainerRef} className="w-full max-w-[970px] mx-auto relative mb-3">
          <CircleOfFifthsSelector
            selectedKey={selectedMajorKey}
            onSelectKey={onSelectedMajorKeyChange}
            showSettingsButton
            isSettingsOpen={isSettingsOpen}
            onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
          />

          {isSettingsOpen && (
            <div
              className="absolute top-24 right-0 z-50 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
              style={{ width: '220px' }}
            >
              <div className="space-y-2" style={{ padding: '6px' }}>
                <div className="space-y-1">
                  <label className="block text-[10px] font-medium uppercase text-slate-500 dark:text-slate-500">
                    Tonal center
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (tonalCenterMode === 'minor') {
                          return;
                        }
                        onSelectedMajorKeyChange(getRelativeMinorKeyFromMajor(selectedMajorKey));
                        setTonalCenterMode('minor');
                      }}
                      className="rounded px-2 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: tonalCenterMode === 'minor' ? '#34C759' : '#E5E7EB',
                        color: tonalCenterMode === 'minor' ? '#FFFFFF' : '#4B5563',
                      }}
                    >
                      Minor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (tonalCenterMode === 'major') {
                          return;
                        }
                        onSelectedMajorKeyChange(getRelativeMajorKeyFromMinor(selectedMajorKey));
                        setTonalCenterMode('major');
                      }}
                      className="rounded px-2 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: tonalCenterMode === 'major' ? '#34C759' : '#E5E7EB',
                        color: tonalCenterMode === 'major' ? '#FFFFFF' : '#4B5563',
                      }}
                    >
                      Major
                    </button>
                  </div>
                </div>

                <div className="space-y-1" role="radiogroup" aria-label="Scale Family">
                  <label className="block text-[10px] font-medium uppercase text-slate-500 dark:text-slate-500">
                    Scale family
                  </label>
                  {scaleFamilyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={option.value === scaleFamily}
                      onClick={() => {
                        setScaleFamily(option.value);
                        if (option.value === 'major') {
                          setSingleTargetToneState({
                            ...DEFAULT_SINGLE_TARGET_TONE_STATE,
                            flatFive: true,
                          });
                          setHexatonicMode('off');
                        }
                      }}
                      className="w-full rounded px-2 py-1.5 text-left text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: option.value === scaleFamily ? '#34C759' : '#E5E7EB',
                        color: option.value === scaleFamily ? '#FFFFFF' : '#4B5563',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {scaleFamily === 'pentatonic' && (
                  <>
                    <div className="border-t border-slate-200 dark:border-slate-700" />
                    <label className="block text-[10px] font-medium uppercase text-slate-500 dark:text-slate-500">
                      Hexatonic Modes
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      Add two notes to express mode color through the pentatonic skeleton.
                    </p>
                    <div className="space-y-1">
                      {HEXATONIC_MODE_OPTIONS.map((modeOption) => {
                        const isActive = hexatonicMode === modeOption.id;
                        const modeLabel = getHexatonicModeDisplayLabel(modeOption.id, tonalCenterMode);
                        return (
                          <button
                            key={modeOption.id}
                            type="button"
                            onClick={() => setHexatonicMode((current) => (
                              current === modeOption.id ? 'off' : modeOption.id
                            ))}
                            className="w-full rounded px-2 py-1.5 text-left text-xs font-medium transition-colors"
                            style={{
                              backgroundColor: isActive ? '#34C759' : '#E5E7EB',
                              color: isActive ? '#FFFFFF' : '#4B5563',
                            }}
                          >
                            <div>{modeLabel}</div>
                            <div
                              className="text-[10px] leading-snug"
                              style={{ color: isActive ? '#ECFDF5' : '#6B7280' }}
                            >
                              {modeOption.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700" />
                    <label className="block text-[10px] font-medium uppercase text-slate-500 dark:text-slate-500">
                      Single-Note Targets
                    </label>
                    {SINGLE_TARGET_TONE_CONFIGS.map((config) => {
                      const isEnabled = singleTargetToneState[config.id];
                      return (
                        <div
                          key={config.id}
                          onClick={() => {
                            setSingleTargetToneState((current) => ({
                              ...current,
                              [config.id]: !current[config.id],
                            }));
                          }}
                          className="flex items-center gap-3 cursor-pointer py-1"
                        >
                          <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                            <div
                              className="absolute inset-0 rounded-full transition-colors"
                              style={{ backgroundColor: isEnabled ? '#34C759' : '#E5E7EB' }}
                            />
                            <div
                              className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                              style={{
                                width: '16px',
                                height: '16px',
                                left: '2px',
                                top: '2px',
                                transform: isEnabled ? 'translateX(16px)' : 'translateX(0)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: config.palette.mid }}
                              />
                              <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                                {getTargetToneToggleLabel(
                                  config,
                                  tonalCenterMode,
                                  majorCenterKey,
                                  minorCenterKey
                                )}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                              {config.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {scaleFamily !== 'major' && (
          <p className="text-slate-400 text-sm mb-1">
            {tonalCenterMode === 'minor'
              ? `Relative major: ${minorCenterKey} minor → ${majorCenterKey} major`
              : `Relative minor: ${majorCenterKey} major → ${minorCenterKey} minor`}
          </p>
        )}

        <p className="text-gray-400 text-sm">
          Gold rings = shape roots | Aura rings = hexatonic/single-note extensions | Hover to play
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Keyboard: lowercase = natural (c, d, e...) | uppercase = sharp (C=C#, D=D#...)
        </p>
            </div>

            <div className="flex flex-col gap-1">
        {displayPatterns.map((shapeData) => {
          let patternForRender = shapeData.pattern;
          let rootPositionsForRender = shapeData.rootPositions;
          const markers: FretboardMarker[] = [];

          if (activeScaleFamily === 'pentatonic' && activeTargetToneConfigs.length > 0) {
            const mergedPattern = shapeData.pattern.map((stringFrets) => new Set(stringFrets));
            const minFret = Math.max(0, shapeData.windowStart);
            const maxFret = Math.min(BOX_FRET_COUNT, shapeData.windowEnd);
            const minimumTargetsPerPitchClass = 2;
            const focusFret = maxFret + 1;

            activeTargetToneConfigs.forEach((toneConfig) => {
              const targetPitchClass = targetPitchClassById[toneConfig.id];
              if (targetPitchClass === undefined) {
                return;
              }
              const targetPositions: [number, number][] = [];
              const targetPositionKeys = new Set<string>();

              const addTargetPosition = (stringIndex: number, fret: number) => {
                const key = `${stringIndex}:${fret}`;
                if (targetPositionKeys.has(key)) {
                  return;
                }
                targetPositionKeys.add(key);
                mergedPattern[stringIndex].add(fret);
                targetPositions.push([stringIndex, fret]);
              };

              const matchesTargetPitchClass = (stringIndex: number, fret: number) =>
                (STANDARD_TUNING_PCS[stringIndex] + fret) % 12 === targetPitchClass;

              // Primary pass: flood this target note inside the current box window.
              for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                for (let fret = minFret; fret <= maxFret; fret++) {
                  if (matchesTargetPitchClass(stringIndex, fret)) {
                    addTargetPosition(stringIndex, fret);
                  }
                }
              }

              // Completion pass: guarantee at least two targets for each active tone.
              let count = targetPositions.length;
              while (count < minimumTargetsPerPitchClass) {
                let bestCandidate: { stringIndex: number; fret: number; score: number } | null = null;

                for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                  for (let fret = 0; fret <= BOX_FRET_COUNT; fret++) {
                    if (!matchesTargetPitchClass(stringIndex, fret)) {
                      continue;
                    }

                    const key = `${stringIndex}:${fret}`;
                    if (targetPositionKeys.has(key)) {
                      continue;
                    }

                    const score = Math.abs(fret - focusFret) + (fret < minFret ? 0.5 : 0);
                    if (
                      !bestCandidate ||
                      score < bestCandidate.score ||
                      (score === bestCandidate.score && fret < bestCandidate.fret)
                    ) {
                      bestCandidate = { stringIndex, fret, score };
                    }
                  }
                }

                if (!bestCandidate) {
                  break;
                }

                addTargetPosition(bestCandidate.stringIndex, bestCandidate.fret);
                count += 1;
              }

              if (targetPositions.length > 0) {
                markers.push({
                  positions: targetPositions,
                  stroke: toneConfig.palette.inner,
                  strokeWidth: 2,
                  ringOffset: 3,
                  variant: 'vibe',
                  vibePalette: toneConfig.palette,
                  preferFlatName: toneConfig.preferFlatName,
                });
              }
            });

            patternForRender = mergedPattern.map((stringFrets) => [...stringFrets].sort((a, b) => a - b));
          }

          if (displayRootPitchClass !== null) {
            const computedRootPositions: [number, number][] = [];
            patternForRender.forEach((stringFrets, stringIndex) => {
              stringFrets.forEach((fret) => {
                if ((STANDARD_TUNING_PCS[stringIndex] + fret) % 12 === displayRootPitchClass) {
                  computedRootPositions.push([stringIndex, fret]);
                }
              });
            });
            if (computedRootPositions.length > 0) {
              rootPositionsForRender = computedRootPositions;
            }
          }

          return (
            <ScalePatternFretboard
              key={`${scaleFamily}-${selectedMajorKey}-${effectiveScaleKey}-${shapeData.id}`}
              title={shapeData.label}
              selectedKey={effectiveScaleKey}
              pattern={patternForRender}
              rootPositions={rootPositionsForRender}
              markers={markers}
              numFrets={BOX_FRET_COUNT}
              titlePlacement="left"
              showTitle={false}
            />
          );
        })}
            </div>
          </div>

          <div className="xl:sticky xl:top-20">
            <PracticeProgressionsPanel
              tonalCenterMode={tonalCenterMode}
              tonalKey={tonalCenterKey}
              majorCenterKey={majorCenterKey}
              minorCenterKey={minorCenterKey}
              scaleFamilyLabel={scaleFamilyLabel}
              progressions={practiceProgressions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
