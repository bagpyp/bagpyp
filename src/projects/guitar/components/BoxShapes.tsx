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

export default function BoxShapes({
  selectedMajorKey,
  onSelectedMajorKeyChange,
}: BoxShapesProps) {
  const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E
  const FLAT_FIVE_INTERVAL = 6;
  const FLAT_SIX_INTERVAL = 8;
  const FLAT_SEVEN_INTERVAL = 10;
  const BOX_FRET_COUNT = 24;
  const [scaleFamily, setScaleFamily] = useState<BoxScaleFamily>('major');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBluesModeEnabled, setIsBluesModeEnabled] = useState(false);
  const [showFlatFiveTargets, setShowFlatFiveTargets] = useState(false);
  const [showFlatSixTargets, setShowFlatSixTargets] = useState(false);
  const [showFlatSevenTargets, setShowFlatSevenTargets] = useState(false);
  const settingsContainerRef = useRef<HTMLDivElement | null>(null);
  const scaleFamilyOptions = useMemo(
    () => getBoxScaleFamilyOptions().filter((option) => option.value !== 'blues'),
    []
  );

  const effectiveScaleKey = useMemo(
    () => (scaleFamily === 'major' ? selectedMajorKey : getRelativeMinorKeyFromMajor(selectedMajorKey)),
    [scaleFamily, selectedMajorKey]
  );
  const activeScaleFamily = useMemo<BoxScaleFamily>(() => {
    if (scaleFamily === 'pentatonic' && isBluesModeEnabled) {
      return 'blues';
    }
    return scaleFamily;
  }, [isBluesModeEnabled, scaleFamily]);

  const shapePatterns = useMemo(() => {
    return generateBoxShapePatterns(effectiveScaleKey, activeScaleFamily);
  }, [effectiveScaleKey, activeScaleFamily]);

  const displayPatterns = useMemo(
    () => getDisplayOrderedBoxPatterns(shapePatterns, activeScaleFamily),
    [shapePatterns, activeScaleFamily]
  );
  const flatFiveTargetPitchClass = useMemo(
    () => (getPitchClass(selectedMajorKey) + FLAT_FIVE_INTERVAL) % 12,
    [selectedMajorKey]
  );
  const flatSixTargetPitchClass = useMemo(
    () => (getPitchClass(selectedMajorKey) + FLAT_SIX_INTERVAL) % 12,
    [selectedMajorKey]
  );
  const flatSevenTargetPitchClass = useMemo(
    () => (getPitchClass(selectedMajorKey) + FLAT_SEVEN_INTERVAL) % 12,
    [selectedMajorKey]
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
    : !isBluesModeEnabled
      ? `${effectiveScaleKey} Minor Pentatonic - 5 Box Shapes`
      : `${effectiveScaleKey} Minor Pentatonic (Blues Mode) - ${shapePatterns.length} Box Shapes`;

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
                          setIsBluesModeEnabled(false);
                          setShowFlatFiveTargets(false);
                          setShowFlatSixTargets(false);
                          setShowFlatSevenTargets(false);
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
                    <div
                      onClick={() => {
                        setIsBluesModeEnabled((current) => {
                          const next = !current;
                          if (!next) {
                            setShowFlatFiveTargets(false);
                            setShowFlatSixTargets(false);
                            setShowFlatSevenTargets(false);
                          }
                          return next;
                        });
                      }}
                      className="flex items-center gap-3 cursor-pointer py-1"
                    >
                      <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                        <div
                          className="absolute inset-0 rounded-full transition-colors"
                          style={{ backgroundColor: isBluesModeEnabled ? '#34C759' : '#E5E7EB' }}
                        />
                        <div
                          className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                          style={{
                            width: '16px',
                            height: '16px',
                            left: '2px',
                            top: '2px',
                            transform: isBluesModeEnabled ? 'translateX(16px)' : 'translateX(0)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                        Blues mode
                      </span>
                    </div>

                    {isBluesModeEnabled && (
                      <>
                        <div
                          onClick={() => setShowFlatFiveTargets((current) => !current)}
                          className="flex items-center gap-3 cursor-pointer py-1 pl-2"
                        >
                          <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                            <div
                              className="absolute inset-0 rounded-full transition-colors"
                              style={{ backgroundColor: showFlatFiveTargets ? '#34C759' : '#E5E7EB' }}
                            />
                            <div
                              className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                              style={{
                                width: '16px',
                                height: '16px',
                                left: '2px',
                                top: '2px',
                                transform: showFlatFiveTargets ? 'translateX(16px)' : 'translateX(0)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                            Add b5 targets
                          </span>
                        </div>

                        <div
                          onClick={() => setShowFlatSixTargets((current) => !current)}
                          className="flex items-center gap-3 cursor-pointer py-1 pl-2"
                        >
                          <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                            <div
                              className="absolute inset-0 rounded-full transition-colors"
                              style={{ backgroundColor: showFlatSixTargets ? '#34C759' : '#E5E7EB' }}
                            />
                            <div
                              className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                              style={{
                                width: '16px',
                                height: '16px',
                                left: '2px',
                                top: '2px',
                                transform: showFlatSixTargets ? 'translateX(16px)' : 'translateX(0)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                            Add b6 targets
                          </span>
                        </div>

                        <div
                          onClick={() => setShowFlatSevenTargets((current) => !current)}
                          className="flex items-center gap-3 cursor-pointer py-1 pl-2"
                        >
                          <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                            <div
                              className="absolute inset-0 rounded-full transition-colors"
                              style={{ backgroundColor: showFlatSevenTargets ? '#34C759' : '#E5E7EB' }}
                            />
                            <div
                              className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                              style={{
                                width: '16px',
                                height: '16px',
                                left: '2px',
                                top: '2px',
                                transform: showFlatSevenTargets ? 'translateX(16px)' : 'translateX(0)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                            Add b7 targets
                          </span>
                        </div>
                      </>
                    )}
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
          Gold rings = shape roots | Electric blue aura = blue note (blues mode) | Hover to play
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Keyboard: lowercase = natural (c, d, e...) | uppercase = sharp (C=C#, D=D#...)
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {displayPatterns.map((shapeData) => {
          let patternForRender = shapeData.pattern;
          const markers: FretboardMarker[] = [];

          if (activeScaleFamily === 'blues') {
            markers.push({
              positions: shapeData.blueNotePositions,
              stroke: '#38bdf8',
              strokeWidth: 2,
              ringOffset: 3,
              variant: 'blue-vibe',
            });

            if (showFlatFiveTargets || showFlatSixTargets || showFlatSevenTargets) {
              const targetPitchClasses = new Set<number>();
              if (showFlatFiveTargets) {
                targetPitchClasses.add(flatFiveTargetPitchClass);
              }
              if (showFlatSixTargets) {
                targetPitchClasses.add(flatSixTargetPitchClass);
              }
              if (showFlatSevenTargets) {
                targetPitchClasses.add(flatSevenTargetPitchClass);
              }
              const targetPitchClassList = [...targetPitchClasses];
              const targetPositions: [number, number][] = [];
              const targetPositionKeys = new Set<string>();
              const mergedPattern = shapeData.pattern.map((stringFrets) => new Set(stringFrets));
              const minFret = Math.max(0, shapeData.windowStart);
              const maxFret = Math.min(BOX_FRET_COUNT, shapeData.windowEnd);

              const addTargetPosition = (stringIndex: number, fret: number) => {
                const key = `${stringIndex}:${fret}`;
                if (targetPositionKeys.has(key)) {
                  return;
                }
                targetPositionKeys.add(key);
                mergedPattern[stringIndex].add(fret);
                targetPositions.push([stringIndex, fret]);
              };

              // Primary pass: flood targets that naturally fall inside the current box window.
              for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                for (let fret = minFret; fret <= maxFret; fret++) {
                  const pitchClass = (STANDARD_TUNING_PCS[stringIndex] + fret) % 12;
                  if (targetPitchClasses.has(pitchClass)) {
                    addTargetPosition(stringIndex, fret);
                  }
                }
              }

              // Completion pass: ensure at least two visible targets for each enabled interval.
              // This helps very tight boxes (like E blues box 1) show a second target note.
              const minimumTargetsPerPitchClass = 2;
              const focusFret = maxFret + 1;

              for (const targetPitchClass of targetPitchClassList) {
                const matchesTargetPitchClass = (stringIndex: number, fret: number) =>
                  (STANDARD_TUNING_PCS[stringIndex] + fret) % 12 === targetPitchClass;

                let count = targetPositions.filter(([stringIndex, fret]) =>
                  matchesTargetPitchClass(stringIndex, fret)
                ).length;

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
              }

              patternForRender = mergedPattern.map((stringFrets) => [...stringFrets].sort((a, b) => a - b));

              markers.push({
                positions: targetPositions,
                stroke: '#38bdf8',
                strokeWidth: 2,
                ringOffset: 3,
                variant: 'blue-vibe',
              });
            }
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
