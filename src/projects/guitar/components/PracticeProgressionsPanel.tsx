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
}

export default function PracticeProgressionsPanel({
  tonalCenterMode,
  tonalKey,
  majorCenterKey,
  minorCenterKey,
  scaleFamilyLabel,
  progressions,
}: PracticeProgressionsPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-700 bg-slate-900/90 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Practice Progressions
      </h2>

      <div className="mt-2 space-y-1 text-[11px] text-slate-400">
        <p>
          Tonal center: <span className="font-semibold text-slate-200">{tonalKey} {tonalCenterMode}</span>
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
            className="rounded border border-slate-700 bg-slate-950/60 px-2.5 py-2"
          >
            <p className="text-xs font-semibold text-slate-100">{progression.title}</p>
            <p className="mt-1 font-mono text-[11px] text-slate-300">{progression.romanNumerals}</p>
            <p className="mt-1 font-mono text-[11px] text-cyan-300">{progression.chordNames}</p>
            <p className="mt-1 text-[11px] text-slate-400">{progression.whyItFits}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
