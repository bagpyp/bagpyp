'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  calculateFretYPositions,
  getNoteAtPosition,
  getNoteYPosition,
  getStringThickness,
  toFlatEnharmonic,
} from '../lib/fretboard-physics';
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
  variant?: 'ring' | 'vibe' | 'blue-vibe';
  preferFlatName?: boolean;
  vibePalette?: {
    outer: string;
    mid: string;
    inner: string;
  };
}

export interface FretboardShapeOverlay {
  id: string;
  points: [number, number][];
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
  fill?: string;
  fillOpacity?: number;
  dashArray?: string;
}

interface ScalePatternFretboardProps {
  title: string;
  selectedKey: string;
  pattern: number[][];
  rootPositions: [number, number][];
  markers?: FretboardMarker[];
  shapeOverlays?: FretboardShapeOverlay[];
  pitchClassLabels?: Partial<Record<number, string>>;
  showRootHalos?: boolean;
  showChromaticNotes?: boolean;
  numFrets?: number;
  titlePlacement?: 'top' | 'left';
  showTitle?: boolean;
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
  shapeOverlays = [],
  pitchClassLabels,
  showRootHalos = true,
  showChromaticNotes = false,
  numFrets = 24,
  titlePlacement = 'top',
  showTitle = true,
}: ScalePatternFretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<{ string: number; fret: number } | null>(null);
  const overlayClipPathId = useId();

  const fretYPositions = calculateFretYPositions(
    DIMENSIONS.startFret,
    numFrets,
    DIMENSIONS.svgWidth
  );
  const stringYPositions = calculateAllStringYPositions();
  const allNoteColors = getAllNoteColorsInCircleOfFifths();
  const defaultVibePalette = {
    outer: '#0ea5e9',
    mid: '#38bdf8',
    inner: '#7dd3fc',
  };
  const fretboardTop = stringYPositions[5] - DIMENSIONS.fretLineExtensionTop;
  const fretboardBottom = stringYPositions[0] + DIMENSIONS.fretLineExtensionBottom;
  const fretboardHeight = fretboardBottom - fretboardTop;
  const stringGap = stringYPositions[1] - stringYPositions[0];
  const getOverlayY = (stringPosition: number) => {
    if (Number.isInteger(stringPosition) && stringPosition >= 0 && stringPosition <= 5) {
      return stringYPositions[stringPosition];
    }

    if (stringPosition <= 0) {
      return stringYPositions[0] + (stringPosition * stringGap);
    }

    if (stringPosition >= 5) {
      return stringYPositions[5] + ((stringPosition - 5) * stringGap);
    }

    const lowerString = Math.floor(stringPosition);
    const upperString = Math.ceil(stringPosition);
    const lowerY = stringYPositions[lowerString];
    const upperY = stringYPositions[upperString];
    const t = stringPosition - lowerString;
    return lowerY + ((upperY - lowerY) * t);
  };

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
    <div className={`w-full ${titlePlacement === 'left' ? 'md:flex md:items-center md:gap-2' : ''}`}>
      {showTitle && (
        <div
          className={
            titlePlacement === 'left'
              ? 'text-center md:text-left mb-1 md:mb-0 md:w-56 md:pr-2 flex-shrink-0'
              : 'text-center mb-1'
          }
        >
          <span className="text-lg font-semibold text-gray-200">{title}</span>
        </div>
      )}

      <div className={titlePlacement === 'left' && showTitle ? 'flex-1' : ''}>
        <svg
          width={titlePlacement === 'left' ? '100%' : '98%'}
          height={DIMENSIONS.svgHeight}
          viewBox={`0 0 ${DIMENSIONS.viewBoxWidth} ${DIMENSIONS.svgHeight}`}
          style={{ display: 'block', margin: '0 auto' }}
        >
        <defs>
          <filter id="note-vibe-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.8" result="blueBlur" />
            <feMerge>
              <feMergeNode in="blueBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="note-root-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="rootBlur" />
            <feMerge>
              <feMergeNode in="rootBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={overlayClipPathId}>
            <rect
              x={DIMENSIONS.openStringOffset}
              y={fretboardTop}
              width={DIMENSIONS.svgWidth}
              height={fretboardHeight}
              rx={DIMENSIONS.fretboardBorderRadius}
            />
          </clipPath>
        </defs>

        <rect
          x={DIMENSIONS.openStringOffset}
          y={fretboardTop}
          width={DIMENSIONS.svgWidth}
          height={fretboardHeight}
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

        {shapeOverlays.map((overlay) => {
          const points = overlay.points
            .map(([stringPosition, fret]) => {
              const xPos = getNoteYPosition(fret, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
              const yPos = getOverlayY(stringPosition);
              return `${xPos},${yPos}`;
            })
            .join(' ');

          return (
            <g
              key={`shape-overlay-${overlay.id}`}
              pointerEvents="none"
              clipPath={`url(#${overlayClipPathId})`}
            >
              {overlay.fill && (
                <polygon
                  points={points}
                  fill={overlay.fill}
                  fillOpacity={overlay.fillOpacity ?? 0.5}
                />
              )}
              <polyline
                points={points}
                fill="none"
                stroke="#3d2817"
                strokeWidth={(overlay.strokeWidth ?? 2.5) + 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.95}
              />
              <polyline
                points={points}
                fill="none"
                stroke={overlay.stroke}
                strokeWidth={overlay.strokeWidth ?? 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={overlay.opacity ?? 0.9}
                strokeDasharray={overlay.dashArray}
              />
            </g>
          );
        })}

        {patternNotes.map(({ stringIdx, fret }, idx) => {
          const noteAtPos = getNoteAtPosition(stringIdx, fret, selectedKey);
          const prefersFlatName = markers.some((marker) => {
            const shouldUseFlat = marker.preferFlatName ?? marker.variant === 'blue-vibe';
            return shouldUseFlat && hasPosition(marker.positions, stringIdx, fret);
          });
          const displayNoteName = prefersFlatName ? toFlatEnharmonic(noteAtPos.noteName) : noteAtPos.noteName;
          const displayLabel = pitchClassLabels?.[noteAtPos.pitchClass] ?? displayNoteName;
          const colorData = getNoteColor(displayNoteName);
          const xPos = getNoteYPosition(fret, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
          const yPos = stringYPositions[stringIdx];
          const isHovered = hoveredNote?.string === stringIdx && hoveredNote?.fret === fret;
          const isRoot = hasPosition(rootPositions, stringIdx, fret);

          const radius = isHovered
            ? DIMENSIONS.noteRadius * DIMENSIONS.directHoverSizeMultiplier
            : DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;
          const rootRingOffset = DIMENSIONS.rootNoteRingOffset;
          const rootRingWidth = DIMENSIONS.rootNoteRingWidth;
          const markerRingOffset = Math.max(2, DIMENSIONS.rootNoteRingOffset - 3);

          return (
            <g key={`pattern-${idx}`}>
              {isRoot && showRootHalos && (
                <g pointerEvents="none">
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r={radius + rootRingOffset + 3}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth={1}
                    opacity={0.3}
                    filter="url(#note-root-glow)"
                  />
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r={radius + rootRingOffset + 1.5}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth={1.5}
                    opacity={0.5}
                    filter="url(#note-root-glow)"
                  />
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r={radius + rootRingOffset}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth={rootRingWidth}
                    opacity={0.9}
                    filter="url(#note-root-glow)"
                  />
                </g>
              )}

              {markers.map((marker, markerIdx) => {
                if (!hasPosition(marker.positions, stringIdx, fret)) {
                  return null;
                }

                if (marker.variant === 'vibe' || marker.variant === 'blue-vibe') {
                  const palette = marker.vibePalette ?? defaultVibePalette;
                  const baseOffset = marker.ringOffset ?? (rootRingOffset + 1);
                  return (
                    <g key={`marker-${idx}-${markerIdx}`} pointerEvents="none">
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={radius + baseOffset + 2.5}
                        fill="none"
                        stroke={palette.outer}
                        strokeWidth={1}
                        opacity={0.3}
                        strokeDasharray="1.5 3"
                        filter="url(#note-vibe-glow)"
                      />
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={radius + baseOffset + 1.25}
                        fill="none"
                        stroke={palette.mid}
                        strokeWidth={1.6}
                        opacity={0.55}
                        strokeDasharray="4 2"
                        filter="url(#note-vibe-glow)"
                      />
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={radius + baseOffset}
                        fill="none"
                        stroke={palette.inner}
                        strokeWidth={2}
                        opacity={0.9}
                        filter="url(#note-vibe-glow)"
                      />
                    </g>
                  );
                }

                return (
                  <circle
                    key={`marker-${idx}-${markerIdx}`}
                    cx={xPos}
                    cy={yPos}
                    r={radius + (marker.ringOffset ?? (markerRingOffset + 1))}
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
                {displayLabel}
              </text>
            </g>
          );
        })}
        </svg>
      </div>
    </div>
  );
}
