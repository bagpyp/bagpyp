'use client';

import React from 'react';
import { getNoteColor } from '../lib/note-colors';
import { DIMENSIONS } from '../lib/fretboard-dimensions';

const CIRCLE_OF_FIFTHS_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'] as const;

interface CircleOfFifthsSelectorProps {
  selectedKey: string;
  onSelectKey: (key: string) => void;
  getAuxLabel?: (key: string) => string | null;
  showSettingsButton?: boolean;
  isSettingsOpen?: boolean;
  onSettingsToggle?: () => void;
}

export default function CircleOfFifthsSelector({
  selectedKey,
  onSelectKey,
  getAuxLabel,
  showSettingsButton = false,
  isSettingsOpen = false,
  onSettingsToggle,
}: CircleOfFifthsSelectorProps) {
  const radius = DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

  return (
    <svg
      width="100%"
      height="100"
      viewBox="0 0 970 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="selector-golden-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CIRCLE_OF_FIFTHS_KEYS.map((key, index) => {
        const x = 65 + (index * 70);
        const y = 50;
        const colorData = getNoteColor(key);
        const isSelected = key === selectedKey;
        const auxLabel = getAuxLabel?.(key);

        return (
          <g key={key}>
            {isSelected && (
              <g pointerEvents="none">
                <circle
                  cx={x}
                  cy={y}
                  r={radius + DIMENSIONS.rootNoteRingOffset + 3}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth={1}
                  opacity={0.3}
                  filter="url(#selector-golden-glow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={radius + DIMENSIONS.rootNoteRingOffset + 1.5}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth={1.5}
                  opacity={0.5}
                  filter="url(#selector-golden-glow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={radius + DIMENSIONS.rootNoteRingOffset}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth={DIMENSIONS.rootNoteRingWidth}
                  opacity={0.9}
                  filter="url(#selector-golden-glow)"
                />
              </g>
            )}

            {auxLabel && (
              <text
                x={x}
                y={y + radius + 18}
                fill="#4a3020"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {auxLabel}
              </text>
            )}

            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={colorData.bg}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectKey(key)}
            />

            <text
              x={x}
              y={y}
              fill={colorData.text}
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              pointerEvents="none"
            >
              {key}
            </text>
          </g>
        );
      })}

      {showSettingsButton && onSettingsToggle && (
        <g onClick={onSettingsToggle} style={{ cursor: 'pointer' }}>
          <circle
            cx={905}
            cy={50}
            r={radius}
            fill="#64748b"
            opacity={isSettingsOpen ? 1 : 0.8}
          />
          <svg
            x={905 - 10}
            y={40}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </g>
      )}
    </svg>
  );
}
