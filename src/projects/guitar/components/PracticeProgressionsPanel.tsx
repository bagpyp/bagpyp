'use client';

import React from 'react';
import type { PracticeProgression } from '../lib/progression-recommendations';

interface PracticeProgressionsPanelProps {
  tonalCenterMode: 'minor' | 'major';
  tonalKey: string;
  majorCenterKey: string;
  minorCenterKey: string;
  scaleFamilyLabel: string;
  progressions: PracticeProgression[];
  onClose: () => void;
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
  return (
    <aside
      className="rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
      style={{ width: '300px' }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Practice Progressions
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-1.5 py-0.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label="Close progressions panel"
        >
          X
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto px-3 py-2">
        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <p>
          Tonal center: <span className="font-semibold text-slate-700 dark:text-slate-200">{tonalKey} {tonalCenterMode}</span>
        </p>
        <p>
          Relative pair: {majorCenterKey} major / {minorCenterKey} minor
        </p>
        <p>
          Family: {scaleFamilyLabel}
        </p>
      </div>

        <div className="mt-3 space-y-2">
        {progressions.map((progression) => (
          <div
            key={progression.id}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{progression.title}</p>
            <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">{progression.romanNumerals}</p>
            <p className="mt-1 font-mono text-[11px] text-cyan-700 dark:text-cyan-300">{progression.chordNames}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{progression.whyItFits}</p>
          </div>
        ))}
        </div>
      </div>
    </aside>
  );
}
