'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  getDisplayOrderedBoxPatterns,
  generateBoxShapePatterns,
  getBoxScaleFamilyOptions,
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
  const BOX_FRET_COUNT = 24;
  const [scaleFamily, setScaleFamily] = useState<BoxScaleFamily>('major');
  const [includeExperimentalBluesShape, setIncludeExperimentalBluesShape] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scaleFamilyOptions = getBoxScaleFamilyOptions();

  const effectiveScaleKey = useMemo(
    () => (scaleFamily === 'major' ? selectedMajorKey : getRelativeMinorKeyFromMajor(selectedMajorKey)),
    [scaleFamily, selectedMajorKey]
  );

  const shapePatterns = useMemo(() => {
    return generateBoxShapePatterns(effectiveScaleKey, scaleFamily, {
      includeExperimentalBluesShape,
    });
  }, [effectiveScaleKey, scaleFamily, includeExperimentalBluesShape]);

  const displayPatterns = useMemo(
    () => getDisplayOrderedBoxPatterns(shapePatterns, scaleFamily),
    [shapePatterns, scaleFamily]
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

  const title = scaleFamily === 'major'
    ? `${effectiveScaleKey} Major System - 7 Modal Box Shapes`
    : scaleFamily === 'pentatonic'
      ? `${effectiveScaleKey} Minor Pentatonic - 5 Box Shapes`
      : `${effectiveScaleKey} Blues - ${shapePatterns.length} Box Shapes`;

  return (
    <div className="space-y-4 p-4 w-full bg-slate-900 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>

        <div className="w-full max-w-[970px] mx-auto relative mb-4">
          <CircleOfFifthsSelector
            selectedKey={selectedMajorKey}
            onSelectKey={onSelectedMajorKeyChange}
            showSettingsButton
            isSettingsOpen={isSettingsOpen}
            onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
          />

          {isSettingsOpen && (
            <div className="absolute top-24 right-0 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 min-w-[280px] p-3 text-left">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Scale Family
                  </label>
                  <select
                    value={scaleFamily}
                    onChange={(e) => setScaleFamily(e.target.value as BoxScaleFamily)}
                    className="w-full px-3 py-2 rounded-md bg-slate-900 text-slate-100 border border-slate-600 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {scaleFamilyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400">{scaleFamilyOptions.find((f) => f.value === scaleFamily)?.description}</p>
                </div>

                {scaleFamily === 'blues' && (
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeExperimentalBluesShape}
                      onChange={(e) => setIncludeExperimentalBluesShape(e.target.checked)}
                      className="rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500"
                    />
                    Add experimental 6th box
                  </label>
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

      <div className="flex flex-col gap-2">
        {displayPatterns.map((shapeData) => {
          const markers: FretboardMarker[] = scaleFamily === 'blues'
            ? [
                {
                  positions: shapeData.blueNotePositions,
                  stroke: '#38bdf8',
                  strokeWidth: 2,
                  ringOffset: 8,
                  variant: 'blue-vibe',
                },
              ]
            : [];

          return (
            <ScalePatternFretboard
              key={`${scaleFamily}-${selectedMajorKey}-${effectiveScaleKey}-${shapeData.id}`}
              title={shapeData.label}
              selectedKey={effectiveScaleKey}
              pattern={shapeData.pattern}
              rootPositions={shapeData.rootPositions}
              markers={markers}
              numFrets={BOX_FRET_COUNT}
            />
          );
        })}
      </div>
    </div>
  );
}
