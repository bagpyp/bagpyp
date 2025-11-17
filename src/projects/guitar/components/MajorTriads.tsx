'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LongFretboardDiagram from './LongFretboardDiagram';
import { generateTriadsData } from '../lib/triads';
import type { TriadsData } from '../lib/triads';
import { nameToPc } from '../lib';
import { getAllNoteColorsInCircleOfFifths, getNoteColor } from '../lib/note-colors';
import { DIMENSIONS } from '../lib/fretboard-dimensions';
import type { NoteName } from '../lib/types';
import { DEFAULT_TRIAD_SETTINGS } from '../lib/triad-settings';
import type { TriadSettings } from '../lib/triad-settings';

// Circle of fifths order
const CIRCLE_OF_FIFTHS_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

// Keyboard mapping:
// - lowercase = natural (c = C, d = D, etc.)
// - Shift + key = sharp (C = C#, D = D#, etc.)
// - Ctrl + key = flat (Ctrl+D = Db, Ctrl+E = Eb, etc.)
const KEY_TO_NOTE_MAP: Record<string, string> = {
  'c': 'C', 'C': 'C#',
  'd': 'D', 'D': 'D#',
  'e': 'E', 'E': 'F',   // E# = F
  'f': 'F', 'F': 'F#',
  'g': 'G', 'G': 'G#',
  'a': 'A', 'A': 'A#',
  'b': 'B', 'B': 'C',   // B# = C
};

// Ctrl + key = flat equivalents (enharmonic spellings)
const CTRL_KEY_TO_FLAT_MAP: Record<string, string> = {
  'd': 'C#',  // Db = C#
  'e': 'D#',  // Eb = D#
  'g': 'F#',  // Gb = F#
  'a': 'G#',  // Ab = G#
  'b': 'A#',  // Bb = A#
};

const STRING_GROUP_LABELS = [
  'Strings 3-2-1 (G-B-E)',
  'Strings 4-3-2 (D-G-B)',
  'Strings 5-4-3 (A-D-G)',
  'Strings 6-5-4 (E-A-D)',
];

export default function MajorTriads() {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [settings, setSettings] = useState<TriadSettings>(DEFAULT_TRIAD_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Generate triads data locally (no API needed!)
  const triadsData = useMemo(() => {
    return generateTriadsData(selectedKey as NoteName);
  }, [selectedKey]);

  // Calculate which notes are in the current triad (1, 3, 5)
  const getTriadNotes = (rootKey: string): { root: number; third: number; fifth: number } => {
    const rootPc = nameToPc(rootKey as any);
    return {
      root: rootPc,
      third: (rootPc + 4) % 12,  // Major third = 4 semitones
      fifth: (rootPc + 7) % 12,  // Perfect fifth = 7 semitones
    };
  };

  const triadNotes = getTriadNotes(selectedKey);

  // Get interval label for a note (1, 3, 5, or null)
  const getIntervalLabel = (noteName: string): '1' | '3' | '5' | null => {
    const notePc = nameToPc(noteName as any);
    if (notePc === triadNotes.root) return '1';
    if (notePc === triadNotes.third) return '3';
    if (notePc === triadNotes.fifth) return '5';
    return null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check for Ctrl+key (flats)
      if (e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) {
        const flatNote = CTRL_KEY_TO_FLAT_MAP[e.key.toLowerCase()];
        if (flatNote) {
          e.preventDefault(); // Prevent browser shortcuts
          setSelectedKey(flatNote);
          return;
        }
      }

      // Check for regular keys (naturals and sharps)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const note = KEY_TO_NOTE_MAP[e.key];
        if (note) {
          e.preventDefault(); // Prevent any default behavior
          setSelectedKey(note);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-3 p-2 w-full">
      {/* Circle of Fifths Visual Selector with Settings Icon */}
      <div className="w-full max-w-[970px] mx-auto relative">
          <svg
            width="100%"
            height="100"
            viewBox="0 0 970 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* SVG Filters for golden glow */}
            <defs>
              <filter id="selector-golden-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {CIRCLE_OF_FIFTHS_KEYS.map((key, index) => {
              const x = 65 + (index * 70); // Properly centered (65px margins on both sides)
              const y = 50; // Vertical center
              const colorData = getNoteColor(key);
              const isSelected = key === selectedKey;
              const intervalLabel = getIntervalLabel(key);

              // All notes same size - only selected gets golden halo
              const radius = DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier;

              return (
                <g key={key}>
                  {/* Golden halo for selected note */}
                  {isSelected && (
                    <g pointerEvents="none">
                      {/* Outer glow ring */}
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
                      {/* Middle glow ring */}
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
                      {/* Main bright ring */}
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

                  {/* Interval label (1, 3, 5) below note */}
                  {intervalLabel && (
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
                      {intervalLabel}
                    </text>
                  )}

                  {/* Note circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={colorData.bg}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedKey(key)}
                  />

                  {/* Note name text */}
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

            {/* Settings Icon - Same size/shape as notes */}
            <g onClick={() => setIsSettingsOpen(!isSettingsOpen)} style={{ cursor: 'pointer' }}>
              <circle
                cx={905} // Position after F (65 + 12 * 70)
                cy={50}
                r={DIMENSIONS.noteRadius * DIMENSIONS.defaultTriadNoteMultiplier}
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
          </svg>

          {/* Settings Panel Dropdown - Opens to the left */}
          {isSettingsOpen && (
            <div className="absolute top-24 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="space-2">
                {/* Toggles */}
                <div className="px-3">
                  {/* Show Chromatic Notes */}
                  <div
                    onClick={() => setSettings({ ...settings, showChromaticNotes: !settings.showChromaticNotes })}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: settings.showChromaticNotes ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: settings.showChromaticNotes ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Chromatic notes
                    </span>
                  </div>

                  {/* Show Octave Colors */}
                  <div
                    onClick={() => setSettings({ ...settings, showOctaveColors: !settings.showOctaveColors })}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: settings.showOctaveColors ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: settings.showOctaveColors ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Octave brightness
                    </span>
                  </div>

                  {/* Show Root Halos */}
                  <div
                    onClick={() => setSettings({ ...settings, showRootHalos: !settings.showRootHalos })}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: settings.showRootHalos ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: settings.showRootHalos ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Root halos
                    </span>
                  </div>

                  {/* Enable Hover Sound */}
                  <div
                    onClick={() => setSettings({ ...settings, enableHoverSound: !settings.enableHoverSound })}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: settings.enableHoverSound ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: settings.enableHoverSound ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Hover sound
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

                {/* Inversion Notation */}
                <div className="space-y-1 p-2">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-500 uppercase">
                    Notation
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, inversionNotation: 'symbols' })}
                      className="flex-1 px-2 py-1.5 text-xs rounded transition-colors font-medium"
                      style={{
                        backgroundColor: settings.inversionNotation === 'symbols' ? '#34C759' : '#E5E7EB',
                        color: settings.inversionNotation === 'symbols' ? '#FFFFFF' : '#4B5563'
                      }}
                    >
                      △¹²
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, inversionNotation: 'figured-bass' })}
                      className="flex-1 px-2 py-1.5 text-xs rounded transition-colors font-medium"
                      style={{
                        backgroundColor: settings.inversionNotation === 'figured-bass' ? '#34C759' : '#E5E7EB',
                        color: settings.inversionNotation === 'figured-bass' ? '#FFFFFF' : '#4B5563'
                      }}
                    >
                      ⁶₄
                    </button>
                  </div>
                </div>

                {/* Chord Type */}
                <div className="space-y-1 p-2">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-500 uppercase">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, chordType: 'major' })}
                      className="flex-1 px-2 py-1.5 text-xs rounded transition-colors font-medium"
                      style={{
                        backgroundColor: settings.chordType === 'major' ? '#34C759' : '#E5E7EB',
                        color: settings.chordType === 'major' ? '#FFFFFF' : '#4B5563'
                      }}
                    >
                      Major
                    </button>
                    <button
                      disabled
                      className="flex-1 px-2 py-1.5 text-xs rounded cursor-not-allowed opacity-50"
                      style={{
                        backgroundColor: '#E5E7EB',
                        color: '#9CA3AF'
                      }}
                      title="Coming soon"
                    >
                      Minor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Triads display - stacked vertically */}
      {triadsData && (
        <div className="w-full">
          <div className="flex flex-col gap-0">
            {[...triadsData.stringGroups].reverse().map((group, groupIdx) => {
              // Convert triad note names to pitch classes
              const triadPcs: [number, number, number] = [
                nameToPc(triadsData.triadNotes[0] as any),
                nameToPc(triadsData.triadNotes[1] as any),
                nameToPc(triadsData.triadNotes[2] as any),
              ];

              // Reversed index for labels (0→3, 1→2, 2→1, 3→0)
              const labelIdx = 3 - groupIdx;

              return (
                <div key={groupIdx} className="flex-shrink-0">
                  <LongFretboardDiagram
                    voicings={group.voicings}
                    stringNames={group.stringNames}
                    stringGroupLabel={STRING_GROUP_LABELS[labelIdx]}
                    triadPcs={triadPcs}
                    settings={settings}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
