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
  const FLAT_SEVEN_INTERVAL = 10;
  const BOX_FRET_COUNT = 24;
  const [scaleFamily, setScaleFamily] = useState<BoxScaleFamily>('major');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFlatSevenTargets, setShowFlatSevenTargets] = useState(false);
  const settingsContainerRef = useRef<HTMLDivElement | null>(null);
  const scaleFamilyOptions = getBoxScaleFamilyOptions();

  const effectiveScaleKey = useMemo(
    () => (scaleFamily === 'major' ? selectedMajorKey : getRelativeMinorKeyFromMajor(selectedMajorKey)),
    [scaleFamily, selectedMajorKey]
  );

  const shapePatterns = useMemo(() => {
    return generateBoxShapePatterns(effectiveScaleKey, scaleFamily);
  }, [effectiveScaleKey, scaleFamily]);

  const displayPatterns = useMemo(
    () => getDisplayOrderedBoxPatterns(shapePatterns, scaleFamily),
    [shapePatterns, scaleFamily]
  );
  const scaleRootPitchClass = useMemo(
    () => getPitchClass(effectiveScaleKey),
    [effectiveScaleKey]
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
    : scaleFamily === 'pentatonic'
      ? `${effectiveScaleKey} Minor Pentatonic - 5 Box Shapes`
      : `${effectiveScaleKey} Blues - ${shapePatterns.length} Box Shapes`;

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

                {scaleFamily === 'blues' && (
                  <>
                    <div className="border-t border-slate-200 dark:border-slate-700" />
                    <div
                      onClick={() => setShowFlatSevenTargets((current) => !current)}
                      className="flex items-center gap-3 cursor-pointer py-1"
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
          Gold rings = shape roots | Electric blue aura = blue note (blues family) | Hover to play
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Keyboard: lowercase = natural (c, d, e...) | uppercase = sharp (C=C#, D=D#...)
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {displayPatterns.map((shapeData) => {
          const markers: FretboardMarker[] = [];
          if (scaleFamily === 'blues') {
            markers.push({
              positions: shapeData.blueNotePositions,
              stroke: '#38bdf8',
              strokeWidth: 2,
              ringOffset: 8,
              variant: 'blue-vibe',
            });

            if (showFlatSevenTargets) {
              const flatSevenPositions: [number, number][] = [];
              shapeData.pattern.forEach((stringFrets, stringIndex) => {
                stringFrets.forEach((fret) => {
                  const pitchClass = (STANDARD_TUNING_PCS[stringIndex] + fret) % 12;
                  const interval = (pitchClass - scaleRootPitchClass + 12) % 12;
                  if (interval === FLAT_SEVEN_INTERVAL) {
                    flatSevenPositions.push([stringIndex, fret]);
                  }
                });
              });

              markers.push({
                positions: flatSevenPositions,
                stroke: '#c084fc',
                strokeWidth: 2,
                dashArray: '4 3',
                ringOffset: 6,
              });
            }
          }

          return (
            <ScalePatternFretboard
              key={`${scaleFamily}-${selectedMajorKey}-${effectiveScaleKey}-${shapeData.id}`}
              title={shapeData.label}
              selectedKey={effectiveScaleKey}
              pattern={shapeData.pattern}
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
