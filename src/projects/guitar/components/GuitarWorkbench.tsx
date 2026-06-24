'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import MajorTriads from './MajorTriads';
import type { TriadsViewMode } from './MajorTriads';
import BoxShapes from './BoxShapes';
import { normalizeMajorKeyName } from '../lib/box-shapes';
import type { BoxScaleFamily } from '../lib/box-shapes';

export type GuitarWorkbenchSection = 'triads' | 'boxes';

export interface GuitarWorkbenchLocation {
  section: GuitarWorkbenchSection;
  triadsView: TriadsViewMode;
  boxFamily: BoxScaleFamily;
}

interface GuitarWorkbenchProps {
  initialSection?: GuitarWorkbenchSection;
  triadsView?: TriadsViewMode;
  boxFamily?: BoxScaleFamily;
  // Called whenever the section or a sub-view changes, so a host (e.g. a routed
  // page) can mirror the current location into the URL.
  onNavigate?: (location: GuitarWorkbenchLocation) => void;
}

export default function GuitarWorkbench({
  initialSection = 'boxes',
  triadsView: triadsViewProp,
  boxFamily: boxFamilyProp,
  onNavigate,
}: GuitarWorkbenchProps) {
  const [section, setSection] = useState<GuitarWorkbenchSection>(initialSection);
  const [triadsView, setTriadsView] = useState<TriadsViewMode>(triadsViewProp ?? 'by-voicing');
  const [boxFamily, setBoxFamily] = useState<BoxScaleFamily>(boxFamilyProp ?? 'pentatonic');
  const [selectedMajorKey, setSelectedMajorKey] = useState<string>('E');
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Keep local state in sync when the host drives navigation (e.g. browser back).
  useEffect(() => {
    if (triadsViewProp) setTriadsView(triadsViewProp);
  }, [triadsViewProp]);
  useEffect(() => {
    if (boxFamilyProp) setBoxFamily(boxFamilyProp);
  }, [boxFamilyProp]);

  const navigate = useCallback(
    (next: Partial<GuitarWorkbenchLocation>) => {
      const target: GuitarWorkbenchLocation = {
        section: next.section ?? section,
        triadsView: next.triadsView ?? triadsView,
        boxFamily: next.boxFamily ?? boxFamily,
      };
      // Update local state immediately so the UI stays responsive.
      if (next.section) setSection(next.section);
      if (next.triadsView) setTriadsView(next.triadsView);
      if (next.boxFamily) setBoxFamily(next.boxFamily);
      onNavigate?.(target);
    },
    [section, triadsView, boxFamily, onNavigate]
  );

  const releaseWakeLock = useCallback(async () => {
    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (!wakeLock) {
      return;
    }
    try {
      await wakeLock.release();
    } catch {
      // Ignore release failures; browser may have already released it.
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (wakeLockRef.current || typeof document === 'undefined') {
      return;
    }
    if (document.visibilityState !== 'visible') {
      return;
    }

    if (!('wakeLock' in navigator)) {
      return;
    }

    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = wakeLock;
      wakeLock.addEventListener('release', () => {
        if (wakeLockRef.current === wakeLock) {
          wakeLockRef.current = null;
        }
      });
    } catch {
      // Ignore request failures (unsupported device/power saver/etc.).
    }
  }, []);

  const handleMajorKeyChange = useCallback((nextKey: string) => {
    setSelectedMajorKey(normalizeMajorKeyName(nextKey));
  }, []);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    void requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      } else {
        void releaseWakeLock();
      }
    };

    const handlePageHide = () => {
      void releaseWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      void releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return (
    <div className="w-full min-h-screen bg-slate-950">
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-[1760px] mx-auto px-4 py-3 xl:px-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => navigate({ section: 'triads' })}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                section === 'triads'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Triads
            </button>
            <button
              onClick={() => navigate({ section: 'boxes' })}
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
            viewMode={triadsView}
            onViewModeChange={(next) => navigate({ triadsView: next })}
          />
        </div>
      ) : (
        <BoxShapes
          selectedMajorKey={selectedMajorKey}
          onSelectedMajorKeyChange={handleMajorKeyChange}
          scaleFamily={boxFamily}
          onScaleFamilyChange={(next) => navigate({ boxFamily: next })}
        />
      )}
    </div>
  );
}
