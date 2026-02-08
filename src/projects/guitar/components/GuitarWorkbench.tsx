'use client';

import React, { useCallback, useEffect, useState } from 'react';
import MajorTriads from './MajorTriads';
import BoxShapes from './BoxShapes';
import { normalizeMajorKeyName } from '../lib/box-shapes';

export type GuitarWorkbenchSection = 'triads' | 'boxes';

interface GuitarWorkbenchProps {
  initialSection?: GuitarWorkbenchSection;
}

export default function GuitarWorkbench({
  initialSection = 'triads',
}: GuitarWorkbenchProps) {
  const [section, setSection] = useState<GuitarWorkbenchSection>(initialSection);
  const [selectedMajorKey, setSelectedMajorKey] = useState<string>('G');

  const handleMajorKeyChange = useCallback((nextKey: string) => {
    setSelectedMajorKey(normalizeMajorKeyName(nextKey));
  }, []);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  return (
    <div className="w-full min-h-screen bg-slate-950">
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setSection('triads')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                section === 'triads'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Major Triads
            </button>
            <button
              onClick={() => setSection('boxes')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                section === 'boxes'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Box Shapes
            </button>
          </div>
        </div>
      </div>

      {section === 'triads' ? (
        <div className="bg-slate-900 min-h-screen">
          <MajorTriads
            selectedKey={selectedMajorKey}
            onSelectedKeyChange={handleMajorKeyChange}
          />
        </div>
      ) : (
        <BoxShapes
          selectedMajorKey={selectedMajorKey}
          onSelectedMajorKeyChange={handleMajorKeyChange}
        />
      )}
    </div>
  );
}
