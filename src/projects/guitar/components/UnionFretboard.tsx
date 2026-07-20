'use client';

import React, { useMemo } from 'react';
import type { TriadVoicing } from '../lib/triads';
import { getNoteColor } from '../lib/note-colors';
import {
  calculateFretYPositions,
  getFretPosition,
  getNoteYPosition,
  getStringThickness,
} from '../lib/fretboard-physics';

interface UnionFretboardProps {
  voicings: (TriadVoicing | null)[];
  fretRange: { start: number; end: number };
}

const STRING_SPACING = 22;
const PAD_TOP = 14;
const PAD_BOTTOM = 20;
const NOTE_RADIUS = 9.5;
const PIXELS_PER_MM = 2.5;
const POSITION_MARKER_FRETS = [3, 5, 7, 9, 15, 17];

const BRASS_COLOR = '#cd7f32';
const SILVER_COLOR = '#c0c0c0';

function stringColor(globalStringIdx: number): string {
  return globalStringIdx <= 3 ? BRASS_COLOR : SILVER_COLOR;
}

export default function UnionFretboard({
  voicings,
  fretRange,
}: UnionFretboardProps) {
  const startFret = fretRange.start;
  const endFret = fretRange.end;
  const numCells = Math.max(1, endFret - startFret);
  const includesOpen = startFret === 0;
  const padLeft = includesOpen ? 20 : 10;
  const padRight = 10;

  const physDistanceMm =
    getFretPosition(endFret) - getFretPosition(startFret);
  const fretboardPx = Math.max(160, physDistanceMm * PIXELS_PER_MM);

  const width = padLeft + fretboardPx + padRight;
  const height = PAD_TOP + 5 * STRING_SPACING + PAD_BOTTOM;

  const fretRelativePositions = calculateFretYPositions(
    startFret,
    numCells,
    fretboardPx,
  );
  const fretX = (i: number) => padLeft + fretRelativePositions[i];

  const notePositionX = (fret: number) => {
    if (fret === 0) return padLeft - 10;
    return padLeft + getNoteYPosition(fret, fretRelativePositions, startFret);
  };

  const stringY = (globalStringIdx: number) =>
    PAD_TOP + (5 - globalStringIdx) * STRING_SPACING;

  const woodLeft = includesOpen ? padLeft : padLeft - 2;
  const woodWidth = width - woodLeft - padRight;
  const woodTop = stringY(5) - 6;
  const woodBottom = stringY(0) + 6;
  const middleY = (stringY(0) + stringY(5)) / 2;

  const uniqueNotes = useMemo(() => {
    const map = new Map<
      string,
      { stringIdx: number; fret: number; noteName: string }
    >();
    for (const v of voicings) {
      if (!v) continue;
      for (let i = 0; i < v.frets.length; i++) {
        const stringIdx = v.strings[i];
        const fret = v.frets[i];
        const key = `${stringIdx}-${fret}`;
        if (!map.has(key)) {
          map.set(key, {
            stringIdx,
            fret,
            noteName: v.noteNames[i],
          });
        }
      }
    }
    return Array.from(map.values());
  }, [voicings]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full min-w-[640px] lg:min-w-0 h-auto rounded-sm"
    >
      <rect
        x={woodLeft}
        y={woodTop}
        width={woodWidth}
        height={woodBottom - woodTop}
        fill="#3d2817"
        rx={4}
      />

      {POSITION_MARKER_FRETS.map(fret => {
        if (fret <= startFret || fret > endFret) return null;
        const cx =
          padLeft + getNoteYPosition(fret, fretRelativePositions, startFret);
        return (
          <circle
            key={fret}
            cx={cx}
            cy={middleY}
            r={4}
            fill="#f5f5dc"
            opacity={0.9}
            stroke="#ffffff"
            strokeWidth={0.5}
          />
        );
      })}

      {12 > startFret && 12 <= endFret && (
        <g>
          <circle
            cx={padLeft + getNoteYPosition(12, fretRelativePositions, startFret)}
            cy={(stringY(5) + stringY(3)) / 2}
            r={4}
            fill="#f5f5dc"
            opacity={0.9}
            stroke="#ffffff"
            strokeWidth={0.5}
          />
          <circle
            cx={padLeft + getNoteYPosition(12, fretRelativePositions, startFret)}
            cy={(stringY(2) + stringY(0)) / 2}
            r={4}
            fill="#f5f5dc"
            opacity={0.9}
            stroke="#ffffff"
            strokeWidth={0.5}
          />
        </g>
      )}

      {Array.from({ length: numCells + 1 }).map((_, i) => {
        const fret = startFret + i;
        const isNut = fret === 0;
        return (
          <line
            key={fret}
            x1={fretX(i)}
            y1={woodTop}
            x2={fretX(i)}
            y2={woodBottom}
            stroke={isNut ? '#e8dcc8' : '#b8b8b8'}
            strokeWidth={isNut ? 4 : 1.5}
          />
        );
      })}

      {[0, 1, 2, 3, 4, 5].map(globalStringIdx => {
        const y = stringY(globalStringIdx);
        const thickness = getStringThickness(globalStringIdx, 0.6);
        const color = stringColor(globalStringIdx);
        return (
          <line
            key={globalStringIdx}
            x1={includesOpen ? padLeft - 10 : padLeft}
            y1={y}
            x2={width - padRight}
            y2={y}
            stroke={color}
            strokeWidth={thickness}
          />
        );
      })}

      {uniqueNotes.map(({ stringIdx, fret, noteName }) => {
        const cy = stringY(stringIdx);
        const cx = notePositionX(fret);
        const color = getNoteColor(noteName);
        return (
          <g key={`${stringIdx}-${fret}`}>
            <circle
              cx={cx}
              cy={cy}
              r={NOTE_RADIUS}
              fill={color.bg}
              stroke="#000"
              strokeWidth={0.5}
            />
            <text
              x={cx}
              y={cy + 3.2}
              fill={color.text}
              fontSize={9}
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {noteName}
            </text>
          </g>
        );
      })}

      {Array.from({ length: numCells }).map((_, i) => {
        const fret = startFret + 1 + i;
        const cx =
          padLeft + getNoteYPosition(fret, fretRelativePositions, startFret);
        return (
          <text
            key={fret}
            x={cx}
            y={woodBottom + 12}
            fill="#94a3b8"
            fontSize={9}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {fret}
          </text>
        );
      })}
    </svg>
  );
}
