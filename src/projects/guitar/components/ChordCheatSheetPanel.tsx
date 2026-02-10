'use client';

import React, { useMemo } from 'react';
import type { ChordCheatSheetData } from '../lib/progression-recommendations';
import { getPitchClass } from '../lib/box-shapes';
import { getNoteColor } from '../lib/note-colors';

interface ChordCheatSheetPanelProps {
  data: ChordCheatSheetData;
  rootPitchClasses: number[];
  auraPitchClasses: number[];
}

interface NoteBadgeProps {
  note: string;
  isRoot: boolean;
  hasAura: boolean;
}

function NoteBadge({ note, isRoot, hasAura }: NoteBadgeProps) {
  const color = getNoteColor(note);
  const badgeSize = 24;
  const auraOuterSize = 32;
  const auraInnerSize = 29;
  const rootRingSize = 30;
  const haloContainerSize = 34;

  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: `${haloContainerSize}px`, height: `${haloContainerSize}px` }}
      title={note}
    >
      {hasAura && (
        <>
          <span
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${auraOuterSize}px`,
              height: `${auraOuterSize}px`,
              border: '1.5px dashed rgba(56, 189, 248, 0.9)',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.95)',
            }}
          />
          <span
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${auraInnerSize}px`,
              height: `${auraInnerSize}px`,
              border: '2px solid rgba(125, 211, 252, 0.95)',
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.85)',
            }}
          />
        </>
      )}

      {isRoot && (
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${rootRingSize}px`,
            height: `${rootRingSize}px`,
            border: '2.25px solid #ffd700',
            boxShadow: '0 0 8px rgba(255, 215, 0, 0.7)',
          }}
        />
      )}

      <span
        className="relative flex items-center justify-center rounded-full font-semibold"
        style={{
          width: `${badgeSize}px`,
          height: `${badgeSize}px`,
          backgroundColor: color.bg,
          color: color.text,
          fontSize: '10px',
          lineHeight: 1,
          zIndex: 2,
        }}
      >
        {note}
      </span>
    </span>
  );
}

export default function ChordCheatSheetPanel({
  data,
  rootPitchClasses,
  auraPitchClasses,
}: ChordCheatSheetPanelProps) {
  const rootSet = useMemo(() => new Set(rootPitchClasses), [rootPitchClasses]);
  const auraSet = useMemo(() => new Set(auraPitchClasses), [auraPitchClasses]);

  return (
    <aside
      className="rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
      style={{ width: '300px' }}
    >
      <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Chord Cheat Sheet
        </h2>
      </div>

      <div className="max-h-[70vh] overflow-auto px-3 py-2">
        <div className="space-y-2">
          {data.entries.map((entry) => (
            <div
              key={entry.chordSymbol}
              className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {entry.chordSymbol}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {entry.notes.map((note, noteIndex) => {
                  const pitchClass = getPitchClass(note);
                  return (
                    <NoteBadge
                      key={`${entry.chordSymbol}-${note}-${noteIndex}`}
                      note={note}
                      isRoot={rootSet.has(pitchClass)}
                      hasAura={auraSet.has(pitchClass)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
