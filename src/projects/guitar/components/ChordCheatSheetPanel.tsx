'use client';

import React from 'react';
import type { ChordCheatSheetData } from '../lib/progression-recommendations';

interface ChordCheatSheetPanelProps {
  data: ChordCheatSheetData;
}

export default function ChordCheatSheetPanel({ data }: ChordCheatSheetPanelProps) {
  return (
    <aside
      className="rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
      style={{ width: '280px' }}
    >
      <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Chord Cheat Sheet
        </h2>
      </div>

      <div className="max-h-[70vh] overflow-auto px-3 py-2">
        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
          Unique notes
        </p>
        <p className="mt-1 font-mono text-[11px] text-cyan-700 dark:text-cyan-300">
          {data.uniqueNotes.join('  ')}
        </p>

        <div className="mt-3 space-y-2">
          {data.entries.map((entry) => (
            <div
              key={entry.chordSymbol}
              className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {entry.chordSymbol}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                {entry.notes.join('  ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
