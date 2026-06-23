'use client';

import React, { useMemo } from 'react';
import CompactHorizontalFretboard from './CompactHorizontalFretboard';
import UnionFretboard from './UnionFretboard';
import { generateChordData } from '../lib/chords';
import { buildChord, getChordName } from '../lib/chord-types';
import type { ChordType } from '../lib/chord-types';
import { getCircleOfFifthsOrder } from '../lib/circle-of-fifths';
import type { NoteName } from '../lib/types';

interface TwelveKeysGridProps {
  stringGroup: number;
  position: number;
  chordType?: ChordType;
  noteOrder?: NoteName[];
}

const DEFAULT_NOTE_ORDER = getCircleOfFifthsOrder('F', 'cw');
const MAX_FRET = 18;

export default function TwelveKeysGrid({
  stringGroup,
  position,
  chordType = 'major',
  noteOrder = DEFAULT_NOTE_ORDER,
}: TwelveKeysGridProps) {
  const internalGroupIdx = 3 - stringGroup;

  const { cells, fretRange } = useMemo(() => {
    const built = noteOrder.map(root => {
      const chordData = generateChordData(root, chordType);
      const chordPcs = buildChord(root, chordType);
      const triadPcs: [number, number, number] = [
        chordPcs[0],
        chordPcs[1],
        chordPcs[2],
      ];

      const group = chordData?.stringGroups[internalGroupIdx];
      const voicing =
        group?.voicings.find(v => v.position === position) ??
        group?.voicings[position] ??
        null;
      const chordName = getChordName(root, chordType);

      return { root, chordName, triadPcs, voicing };
    });

    const allFrets = built.flatMap(cell => cell.voicing?.frets ?? []);
    let start: number;
    let end: number;
    if (allFrets.length === 0) {
      start = 0;
      end = 5;
    } else {
      start = Math.max(0, Math.min(...allFrets));
      end = Math.min(MAX_FRET, Math.max(...allFrets));
      if (end - start < 3) end = Math.min(MAX_FRET, start + 3);
    }

    return { cells: built, fretRange: { start, end } };
  }, [noteOrder, chordType, internalGroupIdx, position]);

  return (
    <div className="w-full space-y-6">
    <div className="grid grid-cols-3 gap-3 w-full">
      {cells.map(cell => (
        <div key={cell.root} className="flex flex-col items-center w-full">
          <div className="text-center text-sm font-semibold text-slate-100 mb-1">
            {cell.chordName}
          </div>
          {cell.voicing ? (
            <CompactHorizontalFretboard
              voicing={cell.voicing}
              triadPcs={cell.triadPcs}
              fretRange={fretRange}
            />
          ) : (
            <div className="text-xs text-slate-400 py-6 text-center bg-slate-800 rounded w-full">
              n/a
            </div>
          )}
        </div>
      ))}
    </div>
    <UnionFretboard
      voicings={cells.map(c => c.voicing)}
      fretRange={{ start: 0, end: MAX_FRET }}
    />
    </div>
  );
}
