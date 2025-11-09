'use client';

import React, { useState, useEffect } from 'react';
import { calculateFretYPositions, getNoteYPosition, getStringThickness, getNoteAtPosition } from '../lib/fretboard-physics';
import { getNoteColor, getAllNoteColorsInCircleOfFifths } from '../lib/note-colors';
import { playNote, stopAllSounds, resumeAudioContext } from '../lib/sound';
import { DIMENSIONS, calculateAllStringYPositions } from '../lib/fretboard-dimensions';

// Mode data structure
interface ModePattern {
  mode: string;
  pattern: number[][]; // 6 arrays of 3 fret numbers each
  markers: {
    root: [number, number][]; // [string (1-6), fret] pairs
    mode_start: [number, number][];
  };
}

// G major modes data
const G_MAJOR_MODES: ModePattern[] = [
  {
    mode: "G Ionian",
    pattern: [
      [3, 5, 7],
      [3, 5, 7],
      [4, 5, 7],
      [4, 5, 7],
      [5, 7, 8],
      [5, 7, 8]
    ],
    markers: {
      root: [[6, 3], [4, 5], [1, 8]],
      mode_start: []
    }
  },
  {
    mode: "A Dorian",
    pattern: [
      [5, 7, 8],
      [5, 7, 9],
      [5, 7, 9],
      [5, 7, 9],
      [7, 8, 10],
      [7, 8, 10]
    ],
    markers: {
      root: [[5, 7], [3, 7]],
      mode_start: [[6, 5], [4, 7], [1, 8]]
    }
  },
  {
    mode: "B Phrygian",
    pattern: [
      [7, 8, 10],
      [7, 9, 10],
      [7, 9, 10],
      [7, 9, 11],
      [8, 10, 12],
      [8, 10, 12]
    ],
    markers: {
      root: [[5, 10], [3, 9]],
      mode_start: [[6, 7], [4, 9], [1, 10]]
    }
  },
  {
    mode: "C Lydian",
    pattern: [
      [8, 10, 12],
      [9, 10, 12],
      [9, 10, 12],
      [9, 10, 12],
      [10, 12, 13],
      [10, 12, 13]
    ],
    markers: {
      root: [[5, 10], [2, 13]],
      mode_start: [[6, 8], [3, 10], [1, 12]]
    }
  },
  {
    mode: "D Mixolydian",
    pattern: [
      [10, 12, 13],
      [10, 12, 14],
      [10, 12, 14],
      [10, 12, 14],
      [12, 13, 15],
      [12, 13, 15]
    ],
    markers: {
      root: [[4, 12], [2, 15]],
      mode_start: [[6, 10], [3, 12], [1, 13]]
    }
  },
  {
    mode: "E Aeolian",
    pattern: [
      [12, 13, 15],
      [12, 14, 15],
      [12, 14, 15],
      [12, 14, 15],
      [13, 15, 17],
      [13, 15, 17]
    ],
    markers: {
      root: [[6, 15], [4, 14]],
      mode_start: [[6, 12], [3, 14], [1, 15]]
    }
  },
  {
    mode: "F# Locrian",
    pattern: [
      [13, 15, 17],
      [13, 15, 17],
      [13, 15, 17],
      [13, 15, 17],
      [15, 17, 18],
      [15, 17, 18]
    ],
    markers: {
      root: [[6, 15], [4, 17]],
      mode_start: [[6, 14], [3, 15], [1, 17]]
    }
  }
];

interface ModeFretboardProps {
  modeData: ModePattern;
}

/**
 * Single fretboard diagram showing a 3NPS mode pattern
 */
function ModeFretboard({ modeData }: ModeFretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<{ string: number; fret: number } | null>(null);

  // Calculate dimensions
  const fretYPositions = calculateFretYPositions(DIMENSIONS.startFret, DIMENSIONS.numFrets, DIMENSIONS.svgWidth);
  const stringYPositions = calculateAllStringYPositions();

  // Get all chromatic notes for background (30% opacity)
  const allNoteColors = getAllNoteColorsInCircleOfFifths();

  // Resume audio context on first interaction
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
    };
  }, []);

  // Play sound on hover
  useEffect(() => {
    if (hoveredNote) {
      playNote(hoveredNote.string, hoveredNote.fret, 2.0);
    } else {
      stopAllSounds();
    }
  }, [hoveredNote]);

  // Convert string number (1-6) to string index (5-0)
  const stringNumToIdx = (stringNum: number) => 6 - stringNum;

  // Check if a position is a root marker
  const isRootMarker = (stringNum: number, fret: number): boolean => {
    return modeData.markers.root.some(([s, f]) => s === stringNum && f === fret);
  };

  // Collect all pattern notes
  const patternNotes: { stringIdx: number; fret: number; stringNum: number }[] = [];
  modeData.pattern.forEach((frets, stringIdx) => {
    frets.forEach(fret => {
      patternNotes.push({ stringIdx, fret, stringNum: 6 - stringIdx });
    });
  });

  return (
    <div className="w-full">
      <svg
        width="98%"
        height={DIMENSIONS.svgHeight}
        viewBox={`0 0 ${DIMENSIONS.viewBoxWidth} ${DIMENSIONS.svgHeight}`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Fretboard background */}
        <rect
          x={DIMENSIONS.openStringOffset}
          y={DIMENSIONS.fretboardMarginTop}
          width={DIMENSIONS.svgWidth}
          height={DIMENSIONS.svgHeight - DIMENSIONS.fretboardMarginTop - DIMENSIONS.fretboardMarginBottom}
          fill="#3a2817"
          rx={DIMENSIONS.fretboardBorderRadius}
        />

        {/* Fret lines */}
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
              stroke={isNut ? '#ffffff' : '#888888'}
              strokeWidth={isNut ? DIMENSIONS.nutWidth : DIMENSIONS.fretLineWidth}
            />
          );
        })}

        {/* Strings */}
        {stringYPositions.map((yPos, stringIdx) => (
          <line
            key={stringIdx}
            x1={DIMENSIONS.openStringOffset}
            y1={yPos}
            x2={DIMENSIONS.openStringOffset + DIMENSIONS.svgWidth}
            y2={yPos}
            stroke="#888888"
            strokeWidth={getStringThickness(stringIdx)}
          />
        ))}

        {/* Fret markers (3, 5, 7, 9, 12, 15) */}
        {[3, 5, 7, 9, 12, 15].map(fretNum => {
          const xPos = getNoteYPosition(fretNum, fretYPositions, DIMENSIONS.startFret);
          const yCenter = (stringYPositions[0] + stringYPositions[5]) / 2;

          return (
            <circle
              key={fretNum}
              cx={xPos + DIMENSIONS.openStringOffset}
              cy={yCenter}
              r={DIMENSIONS.fretMarkerRadius}
              fill="#4a3020"
              stroke="#888888"
              strokeWidth={DIMENSIONS.fretMarkerStrokeWidth}
            />
          );
        })}

        {/* Chromatic background notes (30% opacity) */}
        {allNoteColors.map((noteColor, pc) => {
          const notes: { stringIdx: number; fret: number }[] = [];
          for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
            for (let fret = 0; fret <= 18; fret++) {
              const noteAtPos = getNoteAtPosition(stringIdx, fret);
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

        {/* Pattern notes (100% opacity) */}
        {patternNotes.map(({ stringIdx, fret, stringNum }, idx) => {
          const noteAtPos = getNoteAtPosition(stringIdx, fret);
          const colorData = getNoteColor(noteAtPos.noteName);
          const xPos = getNoteYPosition(fret, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
          const yPos = stringYPositions[stringIdx];
          const isHovered = hoveredNote?.string === stringIdx && hoveredNote?.fret === fret;
          const isRoot = isRootMarker(stringNum, fret);

          const radius = isHovered
            ? DIMENSIONS.noteRadius * DIMENSIONS.directHoverSizeMultiplier
            : DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

          return (
            <g key={`pattern-${idx}`}>
              {/* Root marker: golden ring */}
              {isRoot && (
                <circle
                  cx={xPos}
                  cy={yPos}
                  r={radius + DIMENSIONS.rootNoteRingOffset}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth={DIMENSIONS.rootNoteRingWidth}
                  opacity={0.9}
                />
              )}

              {/* Note circle */}
              <circle
                cx={xPos}
                cy={yPos}
                r={radius}
                fill={colorData.bg}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredNote({ string: stringIdx, fret })}
                onMouseLeave={() => setHoveredNote(null)}
              />

              {/* Note name text */}
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

/**
 * Main component showing all 7 modes of G major
 */
export default function Modes3NPS() {
  return (
    <div className="space-y-6 p-4 w-full">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">G Major Scale - 7 Modes (3NPS)</h1>
        <p className="text-gray-400">
          Three notes per string patterns • Golden rings = root notes
        </p>
      </div>

      {/* Stack all 7 mode fretboards */}
      <div className="flex flex-col gap-0">
        {G_MAJOR_MODES.map((modeData, idx) => (
          <ModeFretboard key={idx} modeData={modeData} />
        ))}
      </div>
    </div>
  );
}
