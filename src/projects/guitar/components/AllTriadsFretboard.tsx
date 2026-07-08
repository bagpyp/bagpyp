'use client';

import React from 'react';
import type { TriadVoicing } from '../lib/triads';
import {
  calculateFretYPositions,
  getNoteYPosition,
  getStringThickness,
  getOctaveAtPosition,
} from '../lib/fretboard-physics';
import { getNoteColor, getNoteColorWithOctave } from '../lib/note-colors';
import { DIMENSIONS, calculateAllStringYPositions } from '../lib/fretboard-dimensions';
import type { TriadSettings } from '../lib/triad-settings';

const STRING_MIDI = [40, 45, 50, 55, 59, 64];

// Root octave shapes (same as the Notes lattice), used to connect roots.
//   NE = 2 strings up, +2 (clean) / +3 (across the G–B wrinkle)
//   NW = 3 strings up, −3 (clean) / −2 (across the G–B wrinkle)
const OCTAVE_SHAPES = [
  { stringSpan: 2, cleanOffset: 2, dashOnClean: false },
  { stringSpan: 3, cleanOffset: -3, dashOnClean: true },
] as const;

interface AllTriadsFretboardProps {
  voicings: TriadVoicing[]; // all voicings, flattened across string groups
  triadPcs: [number, number, number]; // [root, third, fifth] pitch classes
  settings: TriadSettings;
  selectedKey?: string;
  showRootLattice: boolean;
  dimNonRoots: boolean;
}

interface Dot {
  s: number;
  fret: number;
  pc: number;
  noteName: string;
}

/**
 * A single neck showing every triad voicing at once. Roots are full-strength
 * (with optional halo); 3rds/5ths can be dimmed. An optional "root lattice"
 * connects the roots via the octave (NE/NW) shapes.
 */
export default function AllTriadsFretboard({
  voicings,
  triadPcs,
  settings,
  selectedKey,
  showRootLattice,
  dimNonRoots,
}: AllTriadsFretboardProps) {
  const width = DIMENSIONS.svgWidth;
  const height = DIMENSIONS.svgHeight;
  const numFrets = DIMENSIONS.numFrets;
  const startFret = DIMENSIONS.startFret;
  const openOffset = DIMENSIONS.openStringOffset;
  const viewBoxWidth = DIMENSIONS.viewBoxWidth;

  const fretAxis = calculateFretYPositions(startFret, numFrets, width).map((x) => x + openOffset);
  const stringY = calculateAllStringYPositions();
  const noteX = (fret: number) => (fret === 0 ? openOffset / 2 : getNoteYPosition(fret, fretAxis, startFret));
  const noteRadius = DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

  const rootPc = triadPcs[0];

  // Dedupe all voicing notes to one dot per (string, fret).
  const byKey = new Map<string, Dot>();
  voicings.forEach((v) => {
    v.frets.forEach((fret, i) => {
      const s = v.strings[i];
      const key = `${s}-${fret}`;
      if (!byKey.has(key)) {
        byKey.set(key, { s, fret, pc: v.notes[i], noteName: v.noteNames[i] });
      }
    });
  });
  const dots = [...byKey.values()];
  const rootKeys = new Set(dots.filter((d) => d.pc === rootPc).map((d) => `${d.s}-${d.fret}`));

  const colorOf = (d: Dot) => {
    const octave = getOctaveAtPosition(d.s, d.fret);
    return settings.showOctaveColors
      ? getNoteColorWithOctave(d.pc, octave)
      : getNoteColor(d.noteName);
  };

  // Root-to-root octave edges present on the neck.
  const latticeEdges: { x1: number; y1: number; x2: number; y2: number; color: string; dashed: boolean }[] = [];
  if (showRootLattice) {
    dots
      .filter((d) => d.pc === rootPc)
      .forEach((d) => {
        OCTAVE_SHAPES.forEach((shape) => {
          const ts = d.s + shape.stringSpan;
          if (ts > 5) return;
          const tf = STRING_MIDI[d.s] + d.fret + 12 - STRING_MIDI[ts];
          if (tf < 0 || tf > numFrets) return;
          if (!rootKeys.has(`${ts}-${tf}`)) return;
          const delta = tf - d.fret;
          const wrinkle = delta !== shape.cleanOffset;
          latticeEdges.push({
            x1: noteX(d.fret),
            y1: stringY[d.s],
            x2: noteX(tf),
            y2: stringY[ts],
            color: colorOf(d).bg,
            dashed: shape.dashOnClean ? !wrinkle : wrinkle,
          });
        });
      });
  }

  return (
    <div className="relative w-full" style={{ padding: '10px' }}>
      <svg
        width="100%"
        className="rounded-lg"
        viewBox={`0 0 ${viewBoxWidth} ${1.1 * height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="all-golden-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wood */}
        <rect
          x={openOffset}
          y={stringY[5] - DIMENSIONS.fretboardMarginTop}
          width={width}
          height={stringY[0] - stringY[5] + DIMENSIONS.fretboardMarginTop + DIMENSIONS.fretboardMarginBottom}
          fill="#3d2817"
          rx={DIMENSIONS.fretboardBorderRadius}
        />

        {/* Frets + inlays */}
        {Array.from({ length: numFrets + 1 }).map((_, f) => {
          const x = fretAxis[f];
          const isNut = f === 0;
          return (
            <g key={`fret-${f}`}>
              <line
                x1={x}
                y1={stringY[5] - DIMENSIONS.fretLineExtensionTop}
                x2={x}
                y2={stringY[0] + DIMENSIONS.fretLineExtensionBottom}
                stroke={isNut ? '#e8dcc8' : '#b8b8b8'}
                strokeWidth={isNut ? DIMENSIONS.nutWidth : DIMENSIONS.fretLineWidth}
              />
              {[3, 5, 7, 9, 15, 17].includes(f) && f < numFrets && (
                <circle
                  cx={getNoteYPosition(f, fretAxis, startFret)}
                  cy={height / 2}
                  r={DIMENSIONS.fretMarkerRadius}
                  fill="#f5f5dc"
                  opacity={0.95}
                />
              )}
              {f === 12 &&
                [
                  (stringY[1] + stringY[2]) / 2,
                  (stringY[3] + stringY[4]) / 2,
                ].map((cy, i) => (
                  <circle
                    key={i}
                    cx={getNoteYPosition(12, fretAxis, startFret)}
                    cy={cy}
                    r={DIMENSIONS.fretMarkerRadius}
                    fill="#f5f5dc"
                    opacity={0.95}
                  />
                ))}
            </g>
          );
        })}

        {/* Strings */}
        {stringY.map((y, s) => (
          <line
            key={`string-${s}`}
            x1={0}
            y1={y}
            x2={fretAxis[numFrets]}
            y2={y}
            stroke={s <= 3 ? '#cd7f32' : '#c0c0c0'}
            strokeWidth={getStringThickness(s, 1.5)}
          />
        ))}

        {/* Root lattice (under the dots) */}
        {latticeEdges.map((e, i) => (
          <line
            key={`edge-${i}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={e.color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={e.dashed ? '7 5' : undefined}
            opacity={0.95}
            pointerEvents="none"
          />
        ))}

        {/* Note dots */}
        {dots.map((d) => {
          const isRoot = d.pc === rootPc;
          const color = colorOf(d);
          const x = noteX(d.fret);
          const y = stringY[d.s];
          const opacity = isRoot || !dimNonRoots ? 1 : 0.3;
          return (
            <g key={`dot-${d.s}-${d.fret}`} opacity={opacity} pointerEvents="none">
              {isRoot && settings.showRootHalos && (
                <circle
                  cx={x}
                  cy={y}
                  r={noteRadius + DIMENSIONS.rootNoteRingOffset}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth={DIMENSIONS.rootNoteRingWidth}
                  opacity={0.9}
                  filter="url(#all-golden-glow)"
                />
              )}
              <circle cx={x} cy={y} r={noteRadius} fill={color.bg} />
              <text
                x={x}
                y={y}
                fill={color.text}
                fontSize={DIMENSIONS.noteFontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {d.noteName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
