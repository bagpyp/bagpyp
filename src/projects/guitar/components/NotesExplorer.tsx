'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CircleOfFifthsSelector from './CircleOfFifthsSelector';
import NoteMapFretboard from './NoteMapFretboard';
import { nameToPc, pcToDisplayName } from '../lib/core';
import { getNoteAtPosition, getOctaveAtPosition } from '../lib/fretboard-physics';


// Plain key -> natural note
const NATURAL_MAP: Record<string, string> = {
  c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', a: 'A', b: 'B',
};

// Shift + key -> sharp (E#=F, B#=C)
const SHARP_MAP: Record<string, string> = {
  c: 'C#', d: 'D#', f: 'F#', g: 'G#', a: 'A#', e: 'F', b: 'C',
};

// Ctrl + key -> flat
const FLAT_MAP: Record<string, string> = {
  d: 'Db', e: 'Eb', g: 'Gb', a: 'Ab', b: 'Bb',
};

/**
 * Notes explorer: pick a note, see one neck with every occurrence across the
 * fretboard (colored by octave brightness), then one neck per octave the note
 * sounds in (highest octave first) — that octave at full opacity, the other
 * octaves dimmed.
 */
export default function NotesExplorer() {
  const [note, setNote] = useState('F');
  const [showAll, setShowAll] = useState(true);
  const [fretCount, setFretCount] = useState(22);

  const pitchClass = nameToPc(note);
  const displayName = pcToDisplayName(pitchClass, note);

  // Keyboard note selection (matches the other views: shift = sharp, ctrl = flat).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.altKey || e.metaKey) {
        return;
      }
      const letter = e.key.toLowerCase();
      if (e.ctrlKey) {
        const flat = FLAT_MAP[letter];
        if (flat) {
          e.preventDefault();
          setNote(flat);
        }
        return;
      }
      if (e.shiftKey) {
        const sharp = SHARP_MAP[letter];
        if (sharp) {
          setNote(sharp);
        }
        return;
      }
      const natural = NATURAL_MAP[letter];
      if (natural) {
        setNote(natural);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Distinct octaves in which this pitch class occurs, highest first.
  const octaves = useMemo(() => {
    const found = new Set<number>();
    for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
      for (let fret = 0; fret <= fretCount; fret++) {
        if (getNoteAtPosition(stringIdx, fret).pitchClass === pitchClass) {
          found.add(getOctaveAtPosition(stringIdx, fret));
        }
      }
    }
    return [...found].sort((a, b) => b - a);
  }, [pitchClass, fretCount]);

  return (
    <div className="w-full min-h-screen bg-slate-900 pb-10">
      <div className="mx-auto w-full max-w-[970px] px-4 pt-4 overflow-x-auto">
        <CircleOfFifthsSelector selectedKey={note} onSelectKey={setNote} />
      </div>

      <h2 className="text-center text-2xl font-bold text-white mt-2 mb-4">
        {displayName} — All Positions
      </h2>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-2 px-4">
        <button
          onClick={() => setShowAll((v) => !v)}
          className={`px-3 py-2.5 md:py-1 min-h-[40px] md:min-h-0 rounded border text-xs md:text-[11px] font-semibold transition-colors ${
            showAll
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {showAll ? 'Hide all lines' : 'Show all lines'}
        </button>
        <div className="inline-flex rounded border border-slate-700 overflow-hidden">
          {[22, 20].map((n) => (
            <button
              key={n}
              onClick={() => setFretCount(n)}
              className={`px-3 py-2.5 md:py-1 min-h-[40px] md:min-h-0 text-xs md:text-[11px] font-semibold transition-colors ${
                fretCount === n
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {n} frets
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: a single vertical whole-neck board */}
      <div className="md:hidden px-2">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          Whole neck
        </p>
        <NoteMapFretboard
          pitchClass={pitchClass}
          selectedKey={note}
          activeOctave={null}
          enableOctaveShapes
          showAllShapes={showAll}
          orientation="vertical"
          numFrets={fretCount}
        />
      </div>

      {/* Desktop: horizontal whole-neck + one board per octave */}
      <div className="hidden md:block px-2">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          Whole neck
        </p>
        <NoteMapFretboard
          pitchClass={pitchClass}
          selectedKey={note}
          activeOctave={null}
          enableOctaveShapes
          showAllShapes={showAll}
          numFrets={fretCount}
        />

        {/* One neck per octave (highest first) */}
        {octaves.map((octave) => (
          <div key={octave} className="mt-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              {`${displayName}${octave}`}
            </p>
            <NoteMapFretboard
              pitchClass={pitchClass}
              selectedKey={note}
              activeOctave={octave}
              numFrets={fretCount}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
