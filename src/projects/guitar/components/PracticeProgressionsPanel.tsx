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
      className="w-full rounded-xl bg-slate-800/92 shadow-2xl backdrop-blur ring-1 ring-white/10"
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
          {progressions.map((progression) => (
            <div
              key={progression.id}
              className="rounded bg-slate-900/65 px-2.5 py-2 ring-1 ring-white/10"
            >
              <p className="text-xs font-semibold text-slate-100">{progression.title}</p>
              <p className="mt-1 font-mono text-[11px] text-slate-300">{progression.romanNumerals}</p>
              <p className="mt-1 font-mono text-[11px] text-sky-300">{progression.chordNames}</p>
              <p className="mt-1 text-[11px] text-slate-400">{progression.whyItFits}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
