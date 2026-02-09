'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getDisplayOrderedBoxPatterns,
  generateBoxShapePatterns,
  getBoxScaleFamilyOptions,
  getPitchClass,
  getRelativeMinorKeyFromMajor,
  type BoxScaleFamily,
} from '../lib/box-shapes';
import ScalePatternFretboard, { type FretboardMarker } from './ScalePatternFretboard';
import CircleOfFifthsSelector from './CircleOfFifthsSelector';

interface BoxShapesProps {
  selectedMajorKey: string;
  onSelectedMajorKeyChange: (key: string) => void;
}

interface TargetToneConfig {
  id: 'flatFive' | 'flatSix' | 'flatSeven' | 'majorThird' | 'majorSecond' | 'majorSixth';
  label: string;
  description: string;
  intervalFromMinorRoot: number;
  preferFlatName: boolean;
  palette: {
    outer: string;
    mid: string;
    inner: string;
  };
}

const TARGET_TONE_CONFIGS: TargetToneConfig[] = [
  {
    id: 'flatFive',
    label: 'Add b5 targets',
    description: 'Classic blue note bite',
    intervalFromMinorRoot: 6,
    preferFlatName: true,
    palette: { outer: '#0ea5e9', mid: '#38bdf8', inner: '#7dd3fc' },
  },
  {
    id: 'flatSix',
    label: 'Add b6 targets',
    description: 'Dark passing color',
    intervalFromMinorRoot: 8,
    preferFlatName: true,
    palette: { outer: '#0284c7', mid: '#0ea5e9', inner: '#7dd3fc' },
  },
  {
    id: 'flatSeven',
    label: 'Add b7 targets',
    description: 'Dominant blues pull',
    intervalFromMinorRoot: 10,
    preferFlatName: true,
    palette: { outer: '#0369a1', mid: '#0ea5e9', inner: '#7dd3fc' },
  },
  {
    id: 'majorThird',
    label: 'Add M3 targets',
    description: 'Vocal sweet vs sour color',
    intervalFromMinorRoot: 4,
    preferFlatName: false,
    palette: { outer: '#c026d3', mid: '#e879f9', inner: '#f5d0fe' },
  },
  {
    id: 'majorSecond',
    label: 'Add 2/9 targets',
    description: 'Smooth, floating modern blues',
    intervalFromMinorRoot: 2,
    preferFlatName: false,
    palette: { outer: '#0891b2', mid: '#22d3ee', inner: '#a5f3fc' },
  },
  {
    id: 'majorSixth',
    label: 'Add 6 targets',
    description: 'Gospel/soul hopeful color',
    intervalFromMinorRoot: 9,
    preferFlatName: false,
    palette: { outer: '#16a34a', mid: '#4ade80', inner: '#bbf7d0' },
  },
];

const DEFAULT_TARGET_TONE_STATE: Record<TargetToneConfig['id'], boolean> = {
  flatFive: false,
  flatSix: false,
  flatSeven: false,
  majorThird: false,
  majorSecond: false,
  majorSixth: false,
};

export default function BoxShapes({
  selectedMajorKey,
  onSelectedMajorKeyChange,
}: BoxShapesProps) {
  const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E
  const BOX_FRET_COUNT = 24;
  const [scaleFamily, setScaleFamily] = useState<BoxScaleFamily>('major');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetToneState, setTargetToneState] = useState(DEFAULT_TARGET_TONE_STATE);
  const settingsContainerRef = useRef<HTMLDivElement | null>(null);
  const scaleFamilyOptions = useMemo(
    () => getBoxScaleFamilyOptions().filter((option) => option.value !== 'blues'),
    []
  );

  const effectiveScaleKey = useMemo(
    () => (scaleFamily === 'major' ? selectedMajorKey : getRelativeMinorKeyFromMajor(selectedMajorKey)),
    [scaleFamily, selectedMajorKey]
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
  const targetPitchClassById = useMemo(() => {
    const minorRootPitchClass = getPitchClass(effectiveScaleKey);
    return Object.fromEntries(
      TARGET_TONE_CONFIGS.map((config) => [
        config.id,
        (minorRootPitchClass + config.intervalFromMinorRoot) % 12,
      ])
    ) as Record<TargetToneConfig['id'], number>;
  }, [effectiveScaleKey]);
  const enabledTargetToneConfigs = useMemo(
    () => TARGET_TONE_CONFIGS.filter((config) => targetToneState[config.id]),
    [targetToneState]
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
    ? `${effectiveScaleKey} Major System - 7 Modal Box Shapes`
    : `${effectiveScaleKey} Minor Pentatonic - 5 Box Shapes`;

  return (
    <div className="space-y-4 p-4 w-full bg-slate-900 min-h-screen">
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
                          setTargetToneState(DEFAULT_TARGET_TONE_STATE);
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
                      Pentatonic Color Tones
                    </label>
                    {TARGET_TONE_CONFIGS.map((config) => {
                      const isEnabled = targetToneState[config.id];
                      return (
                        <div
                          key={config.id}
                          onClick={() => {
                            setTargetToneState((current) => ({
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
                                {config.label}
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
            Relative minor: {selectedMajorKey} major → {effectiveScaleKey} minor
          </p>
        )}

        <p className="text-gray-400 text-sm">
          Gold rings = shape roots | Aura rings = enabled target tones | Hover to play
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Keyboard: lowercase = natural (c, d, e...) | uppercase = sharp (C=C#, D=D#...)
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {displayPatterns.map((shapeData) => {
          let patternForRender = shapeData.pattern;
          const markers: FretboardMarker[] = [];

          if (activeScaleFamily === 'pentatonic' && enabledTargetToneConfigs.length > 0) {
            const mergedPattern = shapeData.pattern.map((stringFrets) => new Set(stringFrets));
            const minFret = Math.max(0, shapeData.windowStart);
            const maxFret = Math.min(BOX_FRET_COUNT, shapeData.windowEnd);
            const minimumTargetsPerPitchClass = 2;
            const focusFret = maxFret + 1;

            enabledTargetToneConfigs.forEach((toneConfig) => {
              const targetPitchClass = targetPitchClassById[toneConfig.id];
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

          return (
            <ScalePatternFretboard
              key={`${scaleFamily}-${selectedMajorKey}-${effectiveScaleKey}-${shapeData.id}`}
              title={shapeData.label}
              selectedKey={effectiveScaleKey}
              pattern={patternForRender}
              rootPositions={shapeData.rootPositions}
              markers={markers}
              numFrets={BOX_FRET_COUNT}
              titlePlacement="left"
              showTitle={false}
            />
          );
        })}
      </div>
    </div>
  );
}
