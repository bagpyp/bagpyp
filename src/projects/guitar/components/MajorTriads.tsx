'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LongFretboardDiagram from './LongFretboardDiagram';
import { generateChordData } from '../lib/chords';
import type { ChordData } from '../lib/chords';
import { buildChord } from '../lib/chord-types';
import { nameToPc } from '../lib';
import { getAllNoteColorsInCircleOfFifths, getNoteColor } from '../lib/note-colors';
import { DIMENSIONS } from '../lib/fretboard-dimensions';
import type { NoteName } from '../lib/types';
import { DEFAULT_TRIAD_SETTINGS, getChordTypeLabels } from '../lib/triad-settings';
import type { TriadSettings } from '../lib/triad-settings';
import { playChord, resumeAudioContext } from '../lib/sound';

// Circle of fifths order (using flats for Db, Ab, Eb, Bb)
const CIRCLE_OF_FIFTHS_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

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

// Keyboard mappings for playing triads
// Each group has 4 keys for positions 0-3
const TRIAD_PLAY_KEYS: Record<number, string[]> = {
  0: ['7', '8', '9', '0'],     // Group 0 (G-B-E)
  1: ['u', 'i', 'o', 'p'],     // Group 1 (D-G-B)
  2: ['j', 'k', 'l', ';'],     // Group 2 (A-D-G)
  3: ['m', ',', '.', '/'],     // Group 3 (E-A-D)
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
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Generate triads data locally (no API needed!)
  const triadsData = useMemo(() => {
    const chordData = generateChordData(selectedKey as NoteName, settings.chordType);
    // If chord generation fails (e.g., some open string constraints), fall back to major
    if (!chordData) {
      const fallbackData = generateChordData(selectedKey as NoteName, 'major');
      // If even major fails, we have a problem
      if (!fallbackData) {
        throw new Error(`No chord data available for ${selectedKey}`);
      }
      return fallbackData;
    }
    return chordData;
  }, [selectedKey, settings.chordType]);

  // Calculate which notes are in the current triad (1, 3, 5)
  const getTriadNotes = (rootKey: string, chordType: 'major' | 'minor' | 'dim' | 'aug'): { root: number; third: number; fifth: number } => {
    // For now, only major and minor are implemented, so fall back to major for dim/aug
    const actualChordType = (chordType === 'major' || chordType === 'minor') ? chordType : 'major';
    const chordPcs = buildChord(rootKey as NoteName, actualChordType);
    return {
      root: chordPcs[0],
      third: chordPcs[1],
      fifth: chordPcs[2],
    };
  };

  const triadNotes = getTriadNotes(selectedKey, settings.chordType);

  // Get interval label for a note (1, 3, 5, or null)
  const getIntervalLabel = (noteName: string): '1' | '3' | '5' | null => {
    const notePc = nameToPc(noteName as any);
    if (notePc === triadNotes.root) return '1';
    if (notePc === triadNotes.third) return '3';
    if (notePc === triadNotes.fifth) return '5';
    return null;
  };

  // Play a triad position
  const playTriadPosition = async (groupIdx: number, positionIdx: number) => {
    await resumeAudioContext();

    if (!triadsData || groupIdx < 0 || groupIdx >= triadsData.stringGroups.length) {
      return;
    }

    // Groups are displayed in reverse order (3,2,1,0) but we need to access them correctly
    const displayGroupIdx = 3 - groupIdx; // Convert display index to data index
    const group = triadsData.stringGroups[displayGroupIdx];

    if (!group || positionIdx < 0 || positionIdx >= group.voicings.length) {
      return;
    }

    const voicing = group.voicings[positionIdx];
    const notes = voicing.strings.map((stringIdx, i) => ({
      stringIndex: stringIdx,
      fret: voicing.frets[i]
    }));

    playChord(notes, 2.0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check for help modal
      if (e.key === '?') {
        e.preventDefault();
        setShowHelpModal(true);
        return;
      }

      // Check for chord type toggles (1-4)
      if (e.key === '1') {
        e.preventDefault();
        setSettings({ ...settings, chordType: 'major' });
        return;
      } else if (e.key === '2') {
        e.preventDefault();
        setSettings({ ...settings, chordType: 'minor' });
        return;
      } else if (e.key === '3') {
        e.preventDefault();
        // Diminished not yet implemented
        return;
      } else if (e.key === '4') {
        e.preventDefault();
        // Augmented not yet implemented
        return;
      }

      // Check for triad playing keys
      for (const [groupStr, keys] of Object.entries(TRIAD_PLAY_KEYS)) {
        const groupIdx = parseInt(groupStr);
        const positionIdx = keys.indexOf(e.key);
        if (positionIdx !== -1) {
          e.preventDefault();
          await playTriadPosition(groupIdx, positionIdx);
          return;
        }
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
  }, [settings, triadsData]);

  // Help Modal Component
  const HelpModal = () => {
    if (!showHelpModal) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={() => setShowHelpModal(false)}
      >
        {/* Semi-transparent backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Modal content */}
        <div
          className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl max-h-[90vh] overflow-auto m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowHelpModal(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Keyboard Shortcuts
          </h2>

          <div className="space-y-4">
            {/* Key Selection */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">
                Key Selection
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">a-g</span>
                  <span className="text-slate-600 dark:text-slate-400">Natural notes (C, D, E, F, G, A, B)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Shift + a-g</span>
                  <span className="text-slate-600 dark:text-slate-400">Sharp notes (C#, D#, F#, G#, A#)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Ctrl + d,e,g,a,b</span>
                  <span className="text-slate-600 dark:text-slate-400">Flat notes (Db, Eb, Gb, Ab, Bb)</span>
                </div>
              </div>
            </div>

            {/* Chord Type */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">
                Chord Type
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">1</span>
                  <span className="text-slate-600 dark:text-slate-400">Major</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">2</span>
                  <span className="text-slate-600 dark:text-slate-400">Minor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">3</span>
                  <span className="text-slate-600 dark:text-slate-400">Diminished (coming soon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">4</span>
                  <span className="text-slate-600 dark:text-slate-400">Augmented (coming soon)</span>
                </div>
              </div>
            </div>

            {/* Play Triads */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">
                Play Triads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
                Press keys to play triad positions (left = lowest/closest to nut)
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">7 8 9 0</span>
                  <span className="text-slate-600 dark:text-slate-400">Strings 3-2-1 (G-B-E)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">u i o p</span>
                  <span className="text-slate-600 dark:text-slate-400">Strings 4-3-2 (D-G-B)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">j k l ;</span>
                  <span className="text-slate-600 dark:text-slate-400">Strings 5-4-3 (A-D-G)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">m , . /</span>
                  <span className="text-slate-600 dark:text-slate-400">Strings 6-5-4 (E-A-D)</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">
                Help
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">?</span>
                  <span className="text-slate-600 dark:text-slate-400">Show this help menu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 p-2 w-full">
      {/* Help Modal */}
      <HelpModal />

      {/* Chord Type Selector with Help Icon */}
      <div className="flex items-center justify-between p-4">
        <div className="flex-1" /> {/* Spacer */}
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
          {(() => {
            const labels = getChordTypeLabels(settings.chordLabelNotation);
            return (
              <>
                <button
                  onClick={() => setSettings({ ...settings, chordType: 'major' })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    settings.chordType === 'major'
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {labels.major}
                </button>
                <button
                  onClick={() => setSettings({ ...settings, chordType: 'minor' })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    settings.chordType === 'minor'
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {labels.minor}
                </button>
                <button
                  disabled
                  className="px-4 py-2 text-sm font-medium rounded-md text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
                  title="Coming soon"
                >
                  {labels.dim}
                </button>
                <button
                  disabled
                  className="px-4 py-2 text-sm font-medium rounded-md text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
                  title="Coming soon"
                >
                  {labels.aug}
                </button>
              </>
            );
          })()}
        </div>
        <div className="flex-1 flex justify-end">
          {/* Question mark icon button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

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
                nameToPc(triadsData.chordNotes[0] as any),
                nameToPc(triadsData.chordNotes[1] as any),
                nameToPc(triadsData.chordNotes[2] as any),
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
                    selectedKey={selectedKey}
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
