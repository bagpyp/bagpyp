'use client';

import React from 'react';
import type { TriadVoicing, NeighborNote } from '../lib/triads';
import { getNoteColor } from '../lib/note-colors';
import {
  calculateFretYPositions,
  getFretPosition,
  getNoteYPosition,
  getStringThickness,
} from '../lib/fretboard-physics';

interface CompactHorizontalFretboardProps {
  voicing: TriadVoicing;
  triadPcs: [number, number, number];
  fretRange: { start: number; end: number };
  neighbors?: NeighborNote[];
}

const STRING_SPACING = 11;
const PAD_TOP = 8;
const PAD_BOTTOM = 14;
const NOTE_RADIUS = 6.5;
const ROOT_RING_RADIUS = 9;
const PIXELS_PER_MM = 2.1;
const POSITION_MARKER_FRETS = [3, 5, 7, 9, 15, 17];

const BRASS_COLOR = '#cd7f32';
const SILVER_COLOR = '#c0c0c0';

function stringColor(globalStringIdx: number): string {
  return globalStringIdx <= 3 ? BRASS_COLOR : SILVER_COLOR;
}

export default function CompactHorizontalFretboard({
  voicing,
  triadPcs,
  fretRange,
  neighbors = [],
}: CompactHorizontalFretboardProps) {
  const startFret = fretRange.start;
  const endFret = fretRange.end;
  const numCells = Math.max(1, endFret - startFret);
  const includesOpen = startFret === 0;
  const padLeft = includesOpen ? 14 : 8;
  const padRight = 6;

  const physDistanceMm =
    getFretPosition(endFret) - getFretPosition(startFret);
  const fretboardPx = Math.max(80, physDistanceMm * PIXELS_PER_MM);

  const width = padLeft + fretboardPx + padRight;
  // 6 strings → 5 gaps
  const height = PAD_TOP + 5 * STRING_SPACING + PAD_BOTTOM;

  const fretRelativePositions = calculateFretYPositions(
    startFret,
    numCells,
    fretboardPx,
  );
  const fretX = (i: number) => padLeft + fretRelativePositions[i];

  const notePositionX = (fret: number) => {
    if (fret === 0) return padLeft - 7;
    return padLeft + getNoteYPosition(fret, fretRelativePositions, startFret);
  };

  // stringYs[globalStringIdx]: high-pitch string (idx 5) on top, low-pitch (idx 0) at bottom
  const stringY = (globalStringIdx: number) =>
    PAD_TOP + (5 - globalStringIdx) * STRING_SPACING;

  const woodLeft = includesOpen ? padLeft : padLeft - 2;
  const woodWidth = width - woodLeft - padRight;
  const woodTop = stringY(5) - 5;
  const woodBottom = stringY(0) + 5;
  const woodHeight = woodBottom - woodTop;
  const middleY = (stringY(0) + stringY(5)) / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto rounded-sm"
    >
      <rect
        x={woodLeft}
        y={woodTop}
        width={woodWidth}
        height={woodHeight}
        fill="#3d2817"
        rx={3}
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
            r={3}
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
            r={3}
            fill="#f5f5dc"
            opacity={0.9}
            stroke="#ffffff"
            strokeWidth={0.5}
          />
          <circle
            cx={padLeft + getNoteYPosition(12, fretRelativePositions, startFret)}
            cy={(stringY(2) + stringY(0)) / 2}
            r={3}
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
            strokeWidth={isNut ? 3 : 1.4}
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
            x1={includesOpen ? padLeft - 8 : padLeft}
            y1={y}
            x2={width - padRight}
            y2={y}
            stroke={color}
            strokeWidth={thickness}
          />
        );
      })}

      {neighbors.map(n => {
        const cy = stringY(n.globalStringIdx);
        const cx = notePositionX(n.fret);
        const neighborColor = getNoteColor(n.noteName);
        return (
          <g key={`neighbor-${n.globalStringIdx}-${n.fret}`} opacity={0.3}>
            <circle cx={cx} cy={cy} r={NOTE_RADIUS} fill={neighborColor.bg} />
            <text
              x={cx}
              y={cy + 2.3}
              fill={neighborColor.text}
              fontSize={6.5}
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {n.noteName}
            </text>
          </g>
        );
      })}

      {voicing.frets.map((fret, localIdx) => {
        const globalStringIdx = voicing.strings[localIdx];
        const cy = stringY(globalStringIdx);
        const cx = notePositionX(fret);
        const pc = voicing.notes[localIdx];
        const noteName = voicing.noteNames[localIdx];
        const color = getNoteColor(noteName);
        const isRoot = pc === triadPcs[0];
        return (
          <g key={localIdx}>
            {isRoot && (
              <circle
                cx={cx}
                cy={cy}
                r={ROOT_RING_RADIUS}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={1.5}
              />
            )}
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
              y={cy + 2.3}
              fill={color.text}
              fontSize={6.5}
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
            y={woodBottom + 9}
            fill="#64748b"
            fontSize={7}
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
