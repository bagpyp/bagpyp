'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { calculateFretYPositions, getNoteYPosition, getStringThickness, getNoteAtPosition } from '../lib/fretboard-physics';
import { getNoteColor, getAllNoteColorsInCircleOfFifths } from '../lib/note-colors';
import { playNote, stopAllSounds, resumeAudioContext } from '../lib/sound';
import { DIMENSIONS, calculateAllStringYPositions } from '../lib/fretboard-dimensions';
import { generateAllModePatterns, getKeyOptions, ModePattern } from '../lib/modes';

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

  // Check if a position is a root marker
  const isRootMarker = (stringIdx: number, fret: number): boolean => {
    return modeData.rootPositions.some(([s, f]) => s === stringIdx && f === fret);
  };

  // Collect all pattern notes
  const patternNotes: { stringIdx: number; fret: number }[] = [];
  modeData.pattern.forEach((frets, stringIdx) => {
    frets.forEach(fret => {
      patternNotes.push({ stringIdx, fret });
    });
  });

  return (
    <div className="w-full">
      {/* Mode label */}
      <div className="text-center mb-1">
        <span className="text-lg font-semibold text-gray-200">{modeData.mode}</span>
      </div>

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
        {patternNotes.map(({ stringIdx, fret }, idx) => {
          const noteAtPos = getNoteAtPosition(stringIdx, fret);
          const colorData = getNoteColor(noteAtPos.noteName);
          const xPos = getNoteYPosition(fret, fretYPositions, DIMENSIONS.startFret) + DIMENSIONS.openStringOffset;
          const yPos = stringYPositions[stringIdx];
          const isHovered = hoveredNote?.string === stringIdx && hoveredNote?.fret === fret;
          const isRoot = isRootMarker(stringIdx, fret);

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
 * Main component showing all 7 modes for a selected key
 */
export default function Modes3NPS() {
  const [selectedKey, setSelectedKey] = useState('G');
  const keyOptions = getKeyOptions();

  // Generate mode patterns when key changes
  const modePatterns = useMemo(() => {
    return generateAllModePatterns(selectedKey);
  }, [selectedKey]);

  // Handle keyboard shortcuts for key selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      const key = e.key;

      // Natural notes: lowercase letters
      const naturalMap: Record<string, string> = {
        'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
        'g': 'G', 'a': 'A', 'b': 'B'
      };

      // Sharp notes: uppercase letters
      const sharpMap: Record<string, string> = {
        'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#',
        'E': 'F', 'B': 'C' // E# = F, B# = C
      };

      if (naturalMap[key]) {
        setSelectedKey(naturalMap[key]);
      } else if (sharpMap[key]) {
        setSelectedKey(sharpMap[key]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-4 p-4 w-full bg-slate-900 min-h-screen">
      {/* Header with key selector */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4 text-white">
          {selectedKey} Major Scale - 7 Modes (3NPS)
        </h1>

        {/* Key selector */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <label className="text-gray-300 font-medium">Key:</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            {keyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} Major
              </option>
            ))}
          </select>
        </div>

        <p className="text-gray-400 text-sm">
          Three notes per string patterns | Golden rings = root notes | Hover to play
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Keyboard: lowercase = natural (c, d, e...) | uppercase = sharp (C=C#, D=D#...)
        </p>
      </div>

      {/* Stack all 7 mode fretboards */}
      <div className="flex flex-col gap-2">
        {modePatterns.map((modeData, idx) => (
          <ModeFretboard key={`${selectedKey}-${idx}`} modeData={modeData} />
        ))}
      </div>
    </div>
  );
}
