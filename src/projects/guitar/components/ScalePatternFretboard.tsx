'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { calculateFretYPositions, getNoteAtPosition, getNoteYPosition, getStringThickness } from '../lib/fretboard-physics';
import { getAllNoteColorsInCircleOfFifths, getNoteColor } from '../lib/note-colors';
import { DIMENSIONS, calculateAllStringYPositions } from '../lib/fretboard-dimensions';
import { playNote, resumeAudioContext, stopAllSounds } from '../lib/sound';

export interface FretboardMarker {
  positions: [number, number][];
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
  dashArray?: string;
  ringOffset?: number;
  variant?: 'ring' | 'blue-vibe';
}

interface ScalePatternFretboardProps {
  title: string;
  selectedKey: string;
  pattern: number[][];
  rootPositions: [number, number][];
  markers?: FretboardMarker[];
  showChromaticNotes?: boolean;
  numFrets?: number;
}

function hasPosition(
  positions: [number, number][],
  stringIdx: number,
  fret: number
): boolean {
  return positions.some(([s, f]) => s === stringIdx && f === fret);
}

export default function ScalePatternFretboard({
  title,
  selectedKey,
  pattern,
  rootPositions,
  markers = [],
  showChromaticNotes = false,
  numFrets = 24,
}: ScalePatternFretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<{ string: number; fret: number } | null>(null);

  const fretYPositions = calculateFretYPositions(
    DIMENSIONS.startFret,
    numFrets,
    DIMENSIONS.svgWidth
  );
  const stringYPositions = calculateAllStringYPositions();
  const allNoteColors = getAllNoteColorsInCircleOfFifths();

  const patternNotes = useMemo(() => {
    const notes: { stringIdx: number; fret: number }[] = [];
    pattern.forEach((frets, stringIdx) => {
      frets.forEach((fret) => notes.push({ stringIdx, fret }));
    });
    return notes;
  }, [pattern]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      resumeAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      stopAllSounds();
    };
  }, []);

  useEffect(() => {
    if (hoveredNote) {
      playNote(hoveredNote.string, hoveredNote.fret, 2.0);
    } else {
      stopAllSounds();
    }
  }, [hoveredNote]);

  return (
    <div className="w-full">
      <div className="text-center mb-1">
        <span className="text-lg font-semibold text-gray-200">{title}</span>
      </div>

      <svg
        width="98%"
        height={DIMENSIONS.svgHeight}
        viewBox={`0 0 ${DIMENSIONS.viewBoxWidth} ${DIMENSIONS.svgHeight}`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        <defs>
          <filter id="blue-vibe-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.8" result="blueBlur" />
            <feMerge>
              <feMergeNode in="blueBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x={DIMENSIONS.openStringOffset}
          y={DIMENSIONS.fretboardMarginTop}
          width={DIMENSIONS.svgWidth}
          height={DIMENSIONS.svgHeight - DIMENSIONS.fretboardMarginTop - DIMENSIONS.fretboardMarginBottom}
          fill="#3d2817"
          rx={DIMENSIONS.fretboardBorderRadius}
        />

        {fretYPositions.map((yPos, fretIdx) => {
          const fretNum = DIMENSIONS.startFret + fretIdx;
          const isNut = fretNum === 0;

          return (
            <line
              key={fretIdx}
              x1={yPos + DIMENSIONS.openStringOffset}
              y1={stringYPositions[0] + DIMENSIONS.fretLineExtensionBottom}
              x2={yPos + DIMENSIONS.openStringOffset}
              y2={stringYPositions[5] - DIMENSIONS.fretLineExtensionTop}
              stroke={isNut ? '#e8dcc8' : '#b8b8b8'}
              strokeWidth={isNut ? DIMENSIONS.nutWidth : DIMENSIONS.fretLineWidth}
            />
          );
        })}

        {stringYPositions.map((yPos, stringIdx) => {
          const isBrassWound = stringIdx <= 3;
          const stringColor = isBrassWound ? '#cd7f32' : '#c0c0c0';

          return (
            <line
              key={stringIdx}
              x1={0}
              y1={yPos}
              x2={DIMENSIONS.openStringOffset + DIMENSIONS.svgWidth}
              y2={yPos}
              stroke={stringColor}
              strokeWidth={getStringThickness(stringIdx, 1.8)}
            />
          );
        })}

        {[3, 5, 7, 9, 15, 17, 19, 21].filter((fretNum) => fretNum <= numFrets).map((fretNum) => {
          const xPos = getNoteYPosition(fretNum, fretYPositions, DIMENSIONS.startFret);
          const yCenter = (stringYPositions[0] + stringYPositions[5]) / 2;

          return (
            <circle
              key={fretNum}
              cx={xPos + DIMENSIONS.openStringOffset}
              cy={yCenter}
              r={DIMENSIONS.fretMarkerRadius}
              fill="#f5f5dc"
              opacity={0.95}
              stroke="#ffffff"
              strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
            />
          );
        })}

        {/* Double inlay at 12th fret */}
        {numFrets >= 12 && (() => {
          const xPos = getNoteYPosition(12, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
          return (
            <>
              <circle
                cx={xPos}
                cy={(stringYPositions[1] + stringYPositions[2]) / 2}
                r={DIMENSIONS.fretMarkerRadius}
                fill="#f5f5dc"
                opacity={0.95}
                stroke="#ffffff"
                strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
              />
              <circle
                cx={xPos}
                cy={(stringYPositions[3] + stringYPositions[4]) / 2}
                r={DIMENSIONS.fretMarkerRadius}
                fill="#f5f5dc"
                opacity={0.95}
                stroke="#ffffff"
                strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
              />
            </>
          );
        })()}

        {showChromaticNotes && allNoteColors.map((noteColor, pc) => {
          const notes: { stringIdx: number; fret: number }[] = [];
          for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
            for (let fret = 0; fret <= numFrets; fret++) {
              const noteAtPos = getNoteAtPosition(stringIdx, fret, selectedKey);
              if (noteAtPos.pitchClass === pc) {
                notes.push({ stringIdx, fret });
              }
            }
          }

          return notes.map(({ stringIdx, fret }) => {
            const xPos = getNoteYPosition(fret, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
            const yPos = stringYPositions[stringIdx];

            return (
              <circle
                key={`chromatic-${pc}-${stringIdx}-${fret}`}
                cx={xPos}
                cy={yPos}
                r={DIMENSIONS.chromaticNoteRadius}
                fill={noteColor.bg}
                opacity={0.3}
              />
            );
          });
        })}

        {patternNotes.map(({ stringIdx, fret }, idx) => {
          const noteAtPos = getNoteAtPosition(stringIdx, fret, selectedKey);
          const colorData = getNoteColor(noteAtPos.noteName);
          const xPos = getNoteYPosition(fret, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
          const yPos = stringYPositions[stringIdx];
          const isHovered = hoveredNote?.string === stringIdx && hoveredNote?.fret === fret;
          const isRoot = hasPosition(rootPositions, stringIdx, fret);

          const radius = isHovered
            ? DIMENSIONS.noteRadius * DIMENSIONS.directHoverSizeMultiplier
            : DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

          return (
            <g key={`pattern-${idx}`}>
              {isRoot && (
                <circle
                  cx={xPos}
                  cy={yPos}
                  r={radius + DIMENSIONS.rootNoteRingOffset}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth={DIMENSIONS.rootNoteRingWidth}
                  opacity={0.95}
                />
              )}

              {markers.map((marker, markerIdx) => {
                if (!hasPosition(marker.positions, stringIdx, fret)) {
                  return null;
                }

                if (marker.variant === 'blue-vibe') {
                  const baseOffset = marker.ringOffset ?? (DIMENSIONS.rootNoteRingOffset + 4);
                  return (
                    <g key={`marker-${idx}-${markerIdx}`} pointerEvents="none">
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={radius + baseOffset + 6}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth={1.2}
                        opacity={0.35}
                        strokeDasharray="1.5 3"
                        filter="url(#blue-vibe-glow)"
                      />
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={radius + baseOffset + 3}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        opacity={0.6}
                        strokeDasharray="4 2"
                        filter="url(#blue-vibe-glow)"
                      />
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={radius + baseOffset}
                        fill="none"
                        stroke="#7dd3fc"
                        strokeWidth={2.6}
                        opacity={0.95}
                        filter="url(#blue-vibe-glow)"
                      />
                    </g>
                  );
                }

                return (
                  <circle
                    key={`marker-${idx}-${markerIdx}`}
                    cx={xPos}
                    cy={yPos}
                    r={radius + (marker.ringOffset ?? (DIMENSIONS.rootNoteRingOffset + 4))}
                    fill="none"
                    stroke={marker.stroke}
                    strokeWidth={marker.strokeWidth ?? 2}
                    opacity={marker.opacity ?? 0.9}
                    strokeDasharray={marker.dashArray}
                  />
                );
              })}

              <circle
                cx={xPos}
                cy={yPos}
                r={radius}
                fill={colorData.bg}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredNote({ string: stringIdx, fret })}
                onMouseLeave={() => setHoveredNote(null)}
              />

              <text
                x={xPos}
                y={yPos}
                fill={colorData.text}
                fontSize={isHovered ? DIMENSIONS.noteHoverFontSize : DIMENSIONS.noteFontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {noteAtPos.noteName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
