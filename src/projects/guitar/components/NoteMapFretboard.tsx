'use client';

import React, { useState } from 'react';
import {
  calculateFretYPositions,
  getNoteYPosition,
  getStringThickness,
  getNoteAtPosition,
  getOctaveAtPosition,
} from '../lib/fretboard-physics';
import { getNoteColor, getNoteColorWithOctave } from '../lib/note-colors';
import { DIMENSIONS, calculateAllStringYPositions } from '../lib/fretboard-dimensions';

// Standard-tuning MIDI numbers, string index 0 = low E … 5 = high e.
const STRING_MIDI = [40, 45, 50, 55, 59, 64];

// The two compact octave shapes we illustrate (octave UP).
//   NE = 2 strings up, +2 frets (clean) / +3 (across the G–B wrinkle)
//   NW = 3 strings up, −3 frets (clean) / −2 (across the G–B wrinkle)
const OCTAVE_SHAPES = [
  { key: 'NE', stringSpan: 2, cleanOffset: 2 },
  { key: 'NW', stringSpan: 3, cleanOffset: -3 },
] as const;

const NUM_FRETS = 22;
const MARKER_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];

// Vertical-layout geometry (viewBox units).
const V_FRET_LEN = 900;
const V_STRING_GAP = 56;
const V_SIDE_MARGIN = 40;
const V_OPEN_OFFSET = 35;

interface Pos {
  stringIdx: number;
  fret: number;
}

interface NoteMapFretboardProps {
  /** Pitch class (0-11) to plot across the whole neck. */
  pitchClass: number;
  /** Selected key for sharp/flat note-name spelling. */
  selectedKey?: string;
  /**
   * When set, only notes in this octave are shown at full opacity; notes in
   * other octaves are dimmed. When null, every occurrence is at full opacity.
   */
  activeOctave?: number | null;
  /** Use octave-based brightness (default true for this view). */
  showOctaveColors?: boolean;
  /** Enable hover/tap octave-shape connectors. */
  enableOctaveShapes?: boolean;
  /** Draw octave-shape lines for every note at once (lattice mode). */
  showAllShapes?: boolean;
  /** 'horizontal' (desktop) or 'vertical' (mobile). */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * A single neck that plots every occurrence of one pitch class, colored by
 * octave brightness, with tap/hover octave-shape connectors (NE + NW). Renders
 * horizontally (desktop) or vertically (mobile) via `orientation`.
 */
export default function NoteMapFretboard({
  pitchClass,
  selectedKey,
  activeOctave = null,
  showOctaveColors = true,
  enableOctaveShapes = false,
  showAllShapes = false,
  orientation = 'horizontal',
}: NoteMapFretboardProps) {
  const vertical = orientation === 'vertical';
  const startFret = DIMENSIONS.startFret;

  // Fret axis (exponential spacing) runs along the neck's long dimension.
  const longAxisLen = vertical ? V_FRET_LEN : DIMENSIONS.svgWidth;
  const openOffset = vertical ? V_OPEN_OFFSET : DIMENSIONS.openStringOffset;
  const fretRel = calculateFretYPositions(startFret, NUM_FRETS, longAxisLen);
  const fretAxis = fretRel.map((v) => v + openOffset);

  // String axis.
  const stringAxisH = calculateAllStringYPositions(); // index 0 (low E) at bottom
  const stringAxisV = [0, 1, 2, 3, 4, 5].map((s) => V_SIDE_MARGIN + s * V_STRING_GAP); // low E left

  const fretCoord = (fret: number) =>
    fret === 0 ? openOffset / 2 : getNoteYPosition(fret, fretAxis, startFret);
  const stringCoord = (s: number) => (vertical ? stringAxisV[s] : stringAxisH[s]);

  const place = (s: number, fret: number) =>
    vertical
      ? { x: stringCoord(s), y: fretCoord(fret) }
      : { x: fretCoord(fret), y: stringCoord(s) };

  const width = vertical ? V_SIDE_MARGIN * 2 + V_STRING_GAP * 5 : DIMENSIONS.svgWidth;
  const height = DIMENSIONS.svgHeight;
  const viewBoxW = vertical ? width : DIMENSIONS.viewBoxWidth;
  const viewBoxH = vertical ? openOffset + longAxisLen + 40 : 1.1 * height;

  const noteRadius = DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

  const [hovered, setHovered] = useState<Pos | null>(null);
  const [pinned, setPinned] = useState<Pos | null>(null);
  const anchor = enableOctaveShapes ? pinned ?? hovered : null;

  const partnersFor = (pos: Pos) =>
    OCTAVE_SHAPES.flatMap((shape) => {
      const targetString = pos.stringIdx + shape.stringSpan;
      if (targetString > 5) return [];
      const targetFret = STRING_MIDI[pos.stringIdx] + pos.fret + 12 - STRING_MIDI[targetString];
      if (targetFret < 0 || targetFret > NUM_FRETS) return [];
      const delta = targetFret - pos.fret;
      return [
        {
          key: shape.key,
          stringIdx: targetString,
          fret: targetFret,
          delta,
          wrinkle: delta !== shape.cleanOffset,
        },
      ];
    });

  const partners = anchor ? partnersFor(anchor) : [];

  const colorFor = (pos: Pos): string => {
    const octave = getOctaveAtPosition(pos.stringIdx, pos.fret);
    const { noteName } = getNoteAtPosition(pos.stringIdx, pos.fret, selectedKey);
    return (showOctaveColors ? getNoteColorWithOctave(pitchClass, octave) : getNoteColor(noteName)).bg;
  };

  const notePositions: Pos[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= NUM_FRETS; f++) {
      if (getNoteAtPosition(s, f, selectedKey).pitchClass === pitchClass) {
        notePositions.push({ stringIdx: s, fret: f });
      }
    }
  }

  const isSamePos = (a: Pos | null, b: Pos) =>
    a != null && a.stringIdx === b.stringIdx && a.fret === b.fret;

  const fretEnd = fretAxis[NUM_FRETS];
  const stringMid = (stringAxisV[0] + stringAxisV[5]) / 2;

  return (
    <div className="relative w-full" style={{ padding: '6px' }}>
      <svg
        width="100%"
        className="rounded-lg"
        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        preserveAspectRatio="xMidYMid meet"
        style={
          vertical
            ? { height: '80vh', width: 'auto', maxWidth: '100%', display: 'block', margin: '0 auto' }
            : undefined
        }
      >
        {/* Fretboard wood */}
        {vertical ? (
          <rect
            x={stringAxisV[0] - 14}
            y={openOffset}
            width={stringAxisV[5] - stringAxisV[0] + 28}
            height={fretEnd - openOffset}
            fill="#3d2817"
            rx={DIMENSIONS.fretboardBorderRadius}
          />
        ) : (
          <rect
            x={openOffset}
            y={stringAxisH[5] - DIMENSIONS.fretboardMarginTop}
            width={DIMENSIONS.svgWidth}
            height={
              stringAxisH[0] -
              stringAxisH[5] +
              DIMENSIONS.fretboardMarginTop +
              DIMENSIONS.fretboardMarginBottom
            }
            fill="#3d2817"
            rx={DIMENSIONS.fretboardBorderRadius}
          />
        )}

        {/* Fret lines + inlays */}
        {Array.from({ length: NUM_FRETS + 1 }).map((_, fretIdx) => {
          const p = fretAxis[fretIdx];
          const isNut = fretIdx === 0;
          const strokeW = isNut ? DIMENSIONS.nutWidth : DIMENSIONS.fretLineWidth;
          const stroke = isNut ? '#e8dcc8' : '#b8b8b8';
          const inlayPos = getNoteYPosition(fretIdx, fretAxis, startFret);
          return (
            <g key={`fret-${fretIdx}`}>
              {vertical ? (
                <line x1={stringAxisV[0] - 10} y1={p} x2={stringAxisV[5] + 10} y2={p} stroke={stroke} strokeWidth={strokeW} />
              ) : (
                <line
                  x1={p}
                  y1={stringAxisH[5] - DIMENSIONS.fretLineExtensionTop}
                  x2={p}
                  y2={stringAxisH[0] + DIMENSIONS.fretLineExtensionBottom}
                  stroke={stroke}
                  strokeWidth={strokeW}
                />
              )}
              {MARKER_FRETS.includes(fretIdx) && fretIdx < NUM_FRETS && (
                <circle
                  cx={vertical ? stringMid : inlayPos}
                  cy={vertical ? inlayPos : height / 2}
                  r={DIMENSIONS.fretMarkerRadius}
                  fill="#f5f5dc"
                  opacity={0.95}
                  stroke="#ffffff"
                  strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
                />
              )}
              {fretIdx === 12 &&
                (vertical
                  ? [
                      (stringAxisV[1] + stringAxisV[2]) / 2,
                      (stringAxisV[3] + stringAxisV[4]) / 2,
                    ].map((cx, i) => (
                      <circle
                        key={i}
                        cx={cx}
                        cy={inlayPos}
                        r={DIMENSIONS.fretMarkerRadius}
                        fill="#f5f5dc"
                        opacity={0.95}
                        stroke="#ffffff"
                        strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
                      />
                    ))
                  : [
                      (stringAxisH[1] + stringAxisH[2]) / 2,
                      (stringAxisH[3] + stringAxisH[4]) / 2,
                    ].map((cy, i) => (
                      <circle
                        key={i}
                        cx={inlayPos}
                        cy={cy}
                        r={DIMENSIONS.fretMarkerRadius}
                        fill="#f5f5dc"
                        opacity={0.95}
                        stroke="#ffffff"
                        strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
                      />
                    )))}
            </g>
          );
        })}

        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map((stringIdx) => {
          const c = stringCoord(stringIdx);
          const thickness = getStringThickness(stringIdx, 1.4);
          const stringColor = stringIdx <= 3 ? '#cd7f32' : '#c0c0c0';
          return vertical ? (
            <line
              key={`string-${stringIdx}`}
              x1={c}
              y1={0}
              x2={c}
              y2={fretEnd}
              stroke={stringColor}
              strokeWidth={thickness}
            />
          ) : (
            <line
              key={`string-${stringIdx}`}
              x1={0}
              y1={c}
              x2={fretEnd}
              y2={c}
              stroke={stringColor}
              strokeWidth={thickness}
            />
          );
        })}

        {/* Lattice mode: octave-shape lines for every note (no labels) */}
        {showAllShapes &&
          notePositions.flatMap((pos) =>
            partnersFor(pos).map((p) => {
              const a = place(pos.stringIdx, pos.fret);
              const b = place(p.stringIdx, p.fret);
              return (
                <line
                  key={`all-${pos.stringIdx}-${pos.fret}-${p.key}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={colorFor(pos)}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={p.wrinkle ? '7 5' : undefined}
                  opacity={0.95}
                  pointerEvents="none"
                />
              );
            })
          )}

        {/* Anchor octave-shape connectors + labels */}
        {anchor &&
          partners.map((p) => {
            const a = place(anchor.stringIdx, anchor.fret);
            const b = place(p.stringIdx, p.fret);
            return (
              <g key={`shape-${p.key}`} pointerEvents="none">
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={colorFor(anchor)}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={p.wrinkle ? '7 5' : undefined}
                  opacity={0.95}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 6}
                  fill={colorFor(anchor)}
                  fontSize={DIMENSIONS.noteFontSize}
                  fontWeight="bold"
                  textAnchor="middle"
                  stroke="#0f172a"
                  strokeWidth={0.6}
                  paintOrder="stroke"
                >
                  {`${p.key} ${p.delta > 0 ? '+' : ''}${p.delta}`}
                </text>
              </g>
            );
          })}

        {/* Note dots: every occurrence of the pitch class */}
        {notePositions.map(({ stringIdx, fret }) => {
          const { x, y } = place(stringIdx, fret);
          const { noteName } = getNoteAtPosition(stringIdx, fret, selectedKey);
          const octave = getOctaveAtPosition(stringIdx, fret);
          const color = showOctaveColors
            ? getNoteColorWithOctave(pitchClass, octave)
            : getNoteColor(noteName);
          const isActive = activeOctave == null || octave === activeOctave;
          const pos: Pos = { stringIdx, fret };
          const isAnchor = isSamePos(anchor, pos);

          return (
            <g
              key={`note-${stringIdx}-${fret}`}
              opacity={isActive ? 1 : 0.3}
              pointerEvents={enableOctaveShapes ? 'auto' : 'none'}
              style={enableOctaveShapes ? { cursor: 'pointer' } : undefined}
              onMouseEnter={enableOctaveShapes ? () => setHovered(pos) : undefined}
              onMouseLeave={enableOctaveShapes ? () => setHovered(null) : undefined}
              onClick={
                enableOctaveShapes
                  ? () => setPinned((prev) => (isSamePos(prev, pos) ? null : pos))
                  : undefined
              }
            >
              {isAnchor && (
                <circle cx={x} cy={y} r={noteRadius + 4} fill="none" stroke="#ffffff" strokeWidth={2} />
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
                pointerEvents="none"
              >
                {noteName}
              </text>
            </g>
          );
        })}

        {/* Emphasis rings on the octave-up partners */}
        {anchor &&
          partners.map((p) => {
            const b = place(p.stringIdx, p.fret);
            return (
              <circle
                key={`partner-${p.key}`}
                cx={b.x}
                cy={b.y}
                r={noteRadius + 4}
                fill="none"
                stroke={colorFor(anchor)}
                strokeWidth={2}
                pointerEvents="none"
              />
            );
          })}
      </svg>
    </div>
  );
}
