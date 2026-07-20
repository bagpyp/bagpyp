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

// Boundary color per string group (lowest string index 0-3), so adjacent
// string groups read as distinct. Validated categorical set (CVD-safe on the
// dark fretboard): blue / aqua / violet / magenta.
const STRING_GROUP_COLORS = ['#3987e5', '#199e70', '#9085e9', '#d55181'];

interface Pt {
  x: number;
  y: number;
}

// Convex hull of the note disks (Minkowski sum of the center-triangle with a
// disc of radius r): straight edges offset outward by r, joined by true r-radius
// arcs around each note center — so the boundary wraps each note's full radius.
function circlesHullPath(centers: Pt[], r: number): string {
  const n = centers.length;
  if (n < 1) return '';
  if (n === 1) {
    const c = centers[0];
    return `M ${(c.x - r).toFixed(1)} ${c.y.toFixed(1)} A ${r} ${r} 0 1 0 ${(c.x + r).toFixed(1)} ${c.y.toFixed(1)} A ${r} ${r} 0 1 0 ${(c.x - r).toFixed(1)} ${c.y.toFixed(1)} Z`;
  }
  const cx = centers.reduce((a, p) => a + p.x, 0) / n;
  const cy = centers.reduce((a, p) => a + p.y, 0) / n;
  const pts = [...centers].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  // Orientation from the signed area (robust for any non-degenerate triangle),
  // so every edge's outward normal has a consistent, correct handedness.
  let sa = 0;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    sa += p.x * q.y - q.x * p.y;
  }
  const ccw = sa > 0;
  const A: Pt[] = [];
  const B: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    const ex = q.x - p.x;
    const ey = q.y - p.y;
    const len = Math.hypot(ex, ey) || 1;
    const nx = (ccw ? ey : -ey) / len;
    const ny = (ccw ? -ex : ex) / len;
    A.push({ x: p.x + nx * r, y: p.y + ny * r });
    B.push({ x: q.x + nx * r, y: q.y + ny * r });
  }
  let d = `M ${A[0].x.toFixed(1)} ${A[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    d += ` L ${B[i].x.toFixed(1)} ${B[i].y.toFixed(1)}`;
    const V = pts[(i + 1) % n];
    const nextA = A[(i + 1) % n];
    const v1x = B[i].x - V.x;
    const v1y = B[i].y - V.y;
    const v2x = nextA.x - V.x;
    const v2y = nextA.y - V.y;
    const sweep = v1x * v2y - v1y * v2x > 0 ? 1 : 0;
    d += ` A ${r} ${r} 0 0 ${sweep} ${nextA.x.toFixed(1)} ${nextA.y.toFixed(1)}`;
  }
  return d + ' Z';
}

interface AllTriadsFretboardProps {
  voicings: TriadVoicing[]; // all voicings, flattened across string groups
  triadPcs: [number, number, number]; // [root, third, fifth] pitch classes
  settings: TriadSettings;
  selectedKey?: string;
  showRootLattice: boolean;
  dimNonRoots: boolean;
  showGroups: boolean;
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
  showGroups,
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

  // Boundary that wraps each voicing's three note disks.
  const groupPaths = showGroups
    ? voicings.map((v) => {
        const centers: Pt[] = v.frets.map((f, i) => ({ x: noteX(f), y: stringY[v.strings[i]] }));
        return {
          d: circlesHullPath(centers, noteRadius + 11),
          color: STRING_GROUP_COLORS[v.strings[0] % STRING_GROUP_COLORS.length],
        };
      })
    : [];

  return (
    <div className="relative w-full overflow-x-auto p-2">
      <svg
        className="w-full min-w-[760px] lg:min-w-0 h-auto rounded-lg"
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

        {/* Triad-group boundaries (behind everything else), colored by string group */}
        {groupPaths.map((g, i) => (
          <path
            key={`group-${i}`}
            d={g.d}
            fill={g.color}
            fillOpacity={0.13}
            stroke={g.color}
            strokeWidth={1.5}
            strokeOpacity={0.65}
            pointerEvents="none"
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
          const opacity = isRoot || !dimNonRoots ? 1 : 0.55;
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
