'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LongFretboardDiagram from './LongFretboardDiagram';
import CircleOfFifthsSelector from './CircleOfFifthsSelector';
import { generateChordData } from '../lib/chords';
import type { ChordData } from '../lib/chords';
import { buildChord } from '../lib/chord-types';
import { nameToPc } from '../lib';
import type { NoteName } from '../lib/types';
import { DEFAULT_TRIAD_SETTINGS, getChordTypeLabels } from '../lib/triad-settings';
import type { TriadSettings } from '../lib/triad-settings';
import { playChord, resumeAudioContext } from '../lib/sound';

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

interface MajorTriadsProps {
  selectedKey: string;
  onSelectedKeyChange: (key: string) => void;
}

export default function MajorTriads({
  selectedKey,
  onSelectedKeyChange,
}: MajorTriadsProps) {
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

  // Calculate which notes are in the current triad
  const getTriadNotes = (rootKey: string, chordType: 'major' | 'minor' | 'dim' | 'aug'): { root: number; third: number; fifth: number } => {
    const chordPcs = buildChord(rootKey as NoteName, chordType);
    return {
      root: chordPcs[0],
      third: chordPcs[1],
      fifth: chordPcs[2],
    };
  };

  const triadNotes = getTriadNotes(selectedKey, settings.chordType);

  // Get interval label for a note based on chord type
  // Major: 1, 3, 5 | Minor: 1, ♭3, 5 | Dim: 1, ♭3, ♭5 | Aug: 1, 3, #5
  const getIntervalLabel = (noteName: string): string | null => {
    const notePc = nameToPc(noteName as any);
    if (notePc === triadNotes.root) return '1';
    if (notePc === triadNotes.third) {
      // 3rd is flat for minor and dim
      return (settings.chordType === 'minor' || settings.chordType === 'dim') ? '♭3' : '3';
    }
    if (notePc === triadNotes.fifth) {
      // 5th is flat for dim, sharp for aug
      if (settings.chordType === 'dim') return '♭5';
      if (settings.chordType === 'aug') return '#5';
      return '5';
    }
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
        setSettings({ ...settings, chordType: 'dim' });
        return;
      } else if (e.key === '4') {
        e.preventDefault();
        setSettings({ ...settings, chordType: 'aug' });
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
          onSelectedKeyChange(flatNote);
          return;
        }
      }

      // Check for regular keys (naturals and sharps)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const note = KEY_TO_NOTE_MAP[e.key];
        if (note) {
          e.preventDefault(); // Prevent any default behavior
          onSelectedKeyChange(note);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectedKeyChange, settings, triadsData]);

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
                  <span className="text-slate-600 dark:text-slate-400">Diminished</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">4</span>
                  <span className="text-slate-600 dark:text-slate-400">Augmented</span>
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
    <div className="space-y-3 p-2 w-full bg-slate-900 min-h-screen text-slate-100">
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
                  onClick={() => setSettings({ ...settings, chordType: 'dim' })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    settings.chordType === 'dim'
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {labels.dim}
                </button>
                <button
                  onClick={() => setSettings({ ...settings, chordType: 'aug' })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    settings.chordType === 'aug'
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
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
          <CircleOfFifthsSelector
            selectedKey={selectedKey}
            onSelectKey={onSelectedKeyChange}
            getAuxLabel={getIntervalLabel}
            showSettingsButton
            isSettingsOpen={isSettingsOpen}
            onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
          />

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
