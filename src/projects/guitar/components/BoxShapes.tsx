'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getDisplayOrderedBoxPatterns,
  getPitchClass,
  generateBoxShapePatterns,
  getBoxScaleFamilyOptions,
  getRelativeMajorKeyFromMinor,
  getRelativeMinorKeyFromMajor,
  type BoxScaleFamily,
} from '../lib/box-shapes';
import ScalePatternFretboard, {
  type FretboardMarker,
  type FretboardOtherPositionNote,
} from './ScalePatternFretboard';
import CircleOfFifthsSelector from './CircleOfFifthsSelector';
import ChordCheatSheetPanel from './ChordCheatSheetPanel';
import PracticeProgressionsPanel from './PracticeProgressionsPanel';
import { buildPentatonicShapeOverlays } from '../lib/pentatonic-shape-overlays';
import {
  getChordCheatSheetData,
  getPracticeProgressions,
} from '../lib/progression-recommendations';
import {
  DEFAULT_SINGLE_TARGET_TONE_STATE,
  HEXATONIC_MODE_OPTIONS,
  getHexatonicModeTonalCenter,
  getIntervalEffectDescriptionFromSemitones,
  getIntervalLabelFromSemitones,
  getModeLockedSingleTargetToneIds,
  getTargetToneIntervalFromTonalCenter,
  getTargetTonePitchClass,
  getVisibleTargetTones,
  SINGLE_TARGET_TONE_CONFIGS,
  type HexatonicModeId,
  type SingleTargetToneId,
  type TonalCenterMode,
} from '../lib/target-tones';

interface BoxShapesProps {
  selectedMajorKey: string;
  onSelectedMajorKeyChange: (key: string) => void;
}

const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E
const BOX_FRET_COUNT = 24;
const CHROMATIC_DEGREE_LABELS = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as const;

const SEGMENT_WRAPPER_CLASS = 'inline-flex rounded-lg bg-slate-800/85 p-1.5 shadow-inner shadow-black/40 ring-1 ring-white/10';
const SEGMENT_BUTTON_BASE_CLASS = 'rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none';

function getSegmentButtonClass(isActive: boolean): string {
  return `${SEGMENT_BUTTON_BASE_CLASS} ${isActive
    ? 'bg-primary-600 text-white'
    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/70 hover:text-slate-100'}`;
}

function getChordRootPitchClassFromSymbol(symbol: string | null): number | null {
  if (!symbol) {
    return null;
  }
  const normalized = symbol
    .trim()
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#');
  const match = normalized.match(/^([A-G](?:#|b)?)/);
  if (!match) {
    return null;
  }
  return getPitchClass(match[1]);
}

export default function BoxShapes({
  selectedMajorKey,
  onSelectedMajorKeyChange,
}: BoxShapesProps) {
  const [scaleFamily, setScaleFamily] = useState<BoxScaleFamily>('pentatonic');
  const [tonalCenterMode, setTonalCenterMode] = useState<TonalCenterMode>('minor');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showRectangleAndStack, setShowRectangleAndStack] = useState(true);
  const [showIntervalLabels, setShowIntervalLabels] = useState(true);
  const [showRootHalos, setShowRootHalos] = useState(true);
  const [showPracticePanel, setShowPracticePanel] = useState(true);
  const [showCheatSheetPanel, setShowCheatSheetPanel] = useState(true);
  const [activeChordPitchClasses, setActiveChordPitchClasses] = useState<number[] | null>(null);
  const [activeChordSymbol, setActiveChordSymbol] = useState<string | null>(null);
  const [hideNonScaleChordTones, setHideNonScaleChordTones] = useState(false);
  const [showNotesFromOtherPositions, setShowNotesFromOtherPositions] = useState(false);
  const [singleTargetToneState, setSingleTargetToneState] = useState(
    DEFAULT_SINGLE_TARGET_TONE_STATE
  );
  const [hexatonicMode, setHexatonicMode] = useState<HexatonicModeId>('off');
  const controlsPanelRef = useRef<HTMLElement | null>(null);
  const fretboardsContainerRef = useRef<HTMLDivElement | null>(null);
  const circleSelectorRef = useRef<HTMLDivElement | null>(null);
  const [floatingPanelPositions, setFloatingPanelPositions] = useState<{
    leftPanelTop: number;
    rightPanelTop: number;
    leftPanelLeft: number | null;
    rightPanelLeft: number | null;
    viewportHeight: number;
  } | null>(null);

  const scaleFamilyOptions = useMemo(
    () => getBoxScaleFamilyOptions().filter((option) => option.value !== 'blues'),
    []
  );

  const majorCenterKey = useMemo(
    () => (
      tonalCenterMode === 'major'
        ? selectedMajorKey
        : getRelativeMajorKeyFromMinor(selectedMajorKey)
    ),
    [selectedMajorKey, tonalCenterMode]
  );
  const minorCenterKey = useMemo(
    () => (
      tonalCenterMode === 'minor'
        ? selectedMajorKey
        : getRelativeMinorKeyFromMajor(selectedMajorKey)
    ),
    [selectedMajorKey, tonalCenterMode]
  );
  const effectiveScaleKey = useMemo(
    () => (scaleFamily === 'major' ? majorCenterKey : minorCenterKey),
    [majorCenterKey, minorCenterKey, scaleFamily]
  );
  const activeScaleFamily = useMemo<BoxScaleFamily>(
    () => (scaleFamily === 'major' ? 'major' : 'pentatonic'),
    [scaleFamily]
  );

  const shapePatterns = useMemo(() => {
    return generateBoxShapePatterns(effectiveScaleKey, activeScaleFamily);
  }, [effectiveScaleKey, activeScaleFamily]);

  const displayPatterns = useMemo(
    () => getDisplayOrderedBoxPatterns(shapePatterns, activeScaleFamily),
    [shapePatterns, activeScaleFamily]
  );

  const getPitchClassAtPosition = (stringIndex: number, fret: number) =>
    (STANDARD_TUNING_PCS[stringIndex] + fret) % 12;
  const visibleTargetTones = useMemo(
    () => getVisibleTargetTones(
      singleTargetToneState,
      hexatonicMode,
      tonalCenterMode,
      majorCenterKey,
      minorCenterKey
    ),
    [singleTargetToneState, hexatonicMode, tonalCenterMode, majorCenterKey, minorCenterKey]
  );

  const visibleTargetToneByPitchClass = useMemo(
    () => new Map(visibleTargetTones.map((tone) => [tone.pitchClass, tone])),
    [visibleTargetTones]
  );

  const modeLockedSingleTargetToneIds = useMemo(
    () => getModeLockedSingleTargetToneIds(hexatonicMode, majorCenterKey, minorCenterKey),
    [hexatonicMode, majorCenterKey, minorCenterKey]
  );

  const tonalCenterRootPitchClass = useMemo(() => {
    const rootKey = tonalCenterMode === 'major' ? majorCenterKey : minorCenterKey;
    return getPitchClass(rootKey);
  }, [tonalCenterMode, majorCenterKey, minorCenterKey]);
  const activeChordRootPitchClass = useMemo(
    () => getChordRootPitchClassFromSymbol(activeChordSymbol),
    [activeChordSymbol]
  );
  const rootHaloPitchClass = activeChordRootPitchClass ?? tonalCenterRootPitchClass;

  const pitchClassLabels = useMemo(() => {
    if (!showIntervalLabels) {
      return undefined;
    }

    const labels: Partial<Record<number, string>> = {};
    for (let pitchClass = 0; pitchClass < 12; pitchClass++) {
      const interval = (pitchClass - tonalCenterRootPitchClass + 12) % 12;
      labels[pitchClass] = CHROMATIC_DEGREE_LABELS[interval];
    }
    return labels;
  }, [showIntervalLabels, tonalCenterRootPitchClass]);

  const orderedSingleTargetToneConfigs = useMemo(
    () => [...SINGLE_TARGET_TONE_CONFIGS].sort((a, b) => {
      const aInterval = getTargetToneIntervalFromTonalCenter(
        a,
        tonalCenterMode,
        majorCenterKey,
        minorCenterKey
      );
      const bInterval = getTargetToneIntervalFromTonalCenter(
        b,
        tonalCenterMode,
        majorCenterKey,
        minorCenterKey
      );
      if (aInterval !== bInterval) {
        return aInterval - bInterval;
      }
      return a.id.localeCompare(b.id);
    }),
    [tonalCenterMode, majorCenterKey, minorCenterKey]
  );

  const tonalCenterKey = tonalCenterMode === 'major' ? majorCenterKey : minorCenterKey;
  const scaleFamilyLabel = activeScaleFamily === 'major'
    ? 'Major (7 modes)'
    : tonalCenterMode === 'major'
      ? 'Major Pentatonic (5 boxes)'
      : 'Minor Pentatonic (5 boxes)';

  const visibleTargetIntervalsForProgressions = scaleFamily === 'pentatonic'
    ? visibleTargetTones.map((tone) => tone.intervalFromTonalCenter)
    : [];

  const practiceProgressions = useMemo(
    () => getPracticeProgressions({
      tonalCenterMode,
      scaleFamily: activeScaleFamily,
      majorCenterKey,
      minorCenterKey,
      hexatonicMode,
      visibleTargetIntervals: visibleTargetIntervalsForProgressions,
    }),
    [
      tonalCenterMode,
      activeScaleFamily,
      majorCenterKey,
      minorCenterKey,
      hexatonicMode,
      visibleTargetIntervalsForProgressions,
    ]
  );

  const chordCheatSheetData = useMemo(
    () => getChordCheatSheetData(practiceProgressions),
    [practiceProgressions]
  );

  const cheatSheetRootPitchClasses = useMemo(
    () => [tonalCenterRootPitchClass],
    [tonalCenterRootPitchClass]
  );

  const cheatSheetAuraPitchClasses = useMemo(() => {
    const unique = new Set<number>();
    visibleTargetTones.forEach((tone) => unique.add(tone.pitchClass));
    return [...unique];
  }, [visibleTargetTones]);

  const otherPositionNotesByPatternId = useMemo(() => {
    const byPatternId = new Map<string, FretboardOtherPositionNote[]>();
    if (!showNotesFromOtherPositions) {
      return byPatternId;
    }

    const positionsByPattern = displayPatterns.map((shape) => {
      const keys = new Set<string>();
      shape.pattern.forEach((stringFrets, stringIdx) => {
        stringFrets.forEach((fret) => {
          keys.add(`${stringIdx}:${fret}`);
        });
      });
      return { id: shape.id, keys };
    });

    positionsByPattern.forEach((current) => {
      const keys = new Set<string>();
      positionsByPattern.forEach((other) => {
        if (other.id === current.id) {
          return;
        }
        other.keys.forEach((key) => {
          if (!current.keys.has(key)) {
            keys.add(key);
          }
        });
      });

      const notePositions = [...keys].map((key) => {
        const [stringIdx, fret] = key.split(':').map((value) => Number(value));
        return { stringIdx, fret };
      });

      byPatternId.set(current.id, notePositions);
    });

    return byPatternId;
  }, [displayPatterns, showNotesFromOtherPositions]);

  const shouldShowPracticePanels = showPracticePanel || showCheatSheetPanel;
  const shouldFloatCheatSheet = showCheatSheetPanel && floatingPanelPositions?.leftPanelLeft !== null;
  const shouldFloatProgressions = showPracticePanel && floatingPanelPositions?.rightPanelLeft !== null;
  const shouldStackCheatSheet = showCheatSheetPanel && !shouldFloatCheatSheet;
  const shouldStackProgressions = showPracticePanel && !shouldFloatProgressions;

  const handleTonalCenterChange = (nextMode: TonalCenterMode) => {
    if (nextMode === tonalCenterMode) {
      return;
    }

    if (nextMode === 'minor') {
      onSelectedMajorKeyChange(getRelativeMinorKeyFromMajor(selectedMajorKey));
    } else {
      onSelectedMajorKeyChange(getRelativeMajorKeyFromMinor(selectedMajorKey));
    }
    setTonalCenterMode(nextMode);
  };

  const handleScaleFamilyChange = (nextFamily: BoxScaleFamily) => {
    if (nextFamily === 'blues') {
      return;
    }
    if (nextFamily === scaleFamily) {
      return;
    }

    if (nextFamily === 'major' && tonalCenterMode !== 'major') {
      handleTonalCenterChange('major');
    }

    setScaleFamily(nextFamily);
    if (nextFamily === 'major') {
      setSingleTargetToneState(DEFAULT_SINGLE_TARGET_TONE_STATE);
      setHexatonicMode('off');
    }
  };

  const handleHeptatonicModeSelection = (modeId: Exclude<HexatonicModeId, 'off'>) => {
    if (hexatonicMode === modeId) {
      setHexatonicMode('off');
      return;
    }

    const targetTonalCenter = getHexatonicModeTonalCenter(modeId);
    if (targetTonalCenter !== tonalCenterMode) {
      handleTonalCenterChange(targetTonalCenter);
    }
    setHexatonicMode(modeId);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (circleSelectorRef.current?.contains(target)) {
        return;
      }
      setIsSettingsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      const key = e.key;

      const naturalMap: Record<string, string> = {
        c: 'C',
        d: 'D',
        e: 'E',
        f: 'F',
        g: 'G',
        a: 'A',
        b: 'B',
      };

      const sharpMap: Record<string, string> = {
        C: 'C#',
        D: 'D#',
        F: 'F#',
        G: 'G#',
        A: 'A#',
        E: 'F',
        B: 'C',
      };

      if (naturalMap[key]) {
        onSelectedMajorKeyChange(naturalMap[key]);
      } else if (sharpMap[key]) {
        onSelectedMajorKeyChange(sharpMap[key]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSelectedMajorKeyChange]);

  useEffect(() => {
    if (!shouldShowPracticePanels) {
      setFloatingPanelPositions(null);
      return;
    }

    const updateFloatingPositions = () => {
      const container = fretboardsContainerRef.current;
      if (!container || window.innerWidth < 1200) {
        setFloatingPanelPositions(null);
        return;
      }

      const controlsRect = controlsPanelRef.current?.getBoundingClientRect() ?? null;
      const rect = container.getBoundingClientRect();
      const leftPanelWidth = 260;
      const rightPanelWidth = 300;
      const gap = 12;
      const margin = 12;
      const headerClearanceOffset = 50;
      const leftCandidate = rect.left - leftPanelWidth - gap;
      const rightCandidate = rect.right + gap;
      const leftFits = leftCandidate >= margin;
      const rightFits = rightCandidate + rightPanelWidth <= window.innerWidth - margin;

      if (!leftFits && !rightFits) {
        setFloatingPanelPositions(null);
        return;
      }

      const alignedPanelTop = Math.max(margin, controlsRect?.top ?? rect.top) + headerClearanceOffset;

      setFloatingPanelPositions({
        leftPanelTop: alignedPanelTop,
        rightPanelTop: alignedPanelTop,
        leftPanelLeft: leftFits ? leftCandidate : null,
        rightPanelLeft: rightFits ? rightCandidate : null,
        viewportHeight: window.innerHeight,
      });
    };

    updateFloatingPositions();
    window.addEventListener('resize', updateFloatingPositions);
    window.addEventListener('scroll', updateFloatingPositions, true);
    return () => {
      window.removeEventListener('resize', updateFloatingPositions);
      window.removeEventListener('scroll', updateFloatingPositions, true);
    };
  }, [
    shouldShowPracticePanels,
    showPracticePanel,
    showCheatSheetPanel,
    scaleFamily,
    tonalCenterMode,
    hexatonicMode,
    displayPatterns.length,
  ]);

  const title = scaleFamily === 'major'
    ? `${majorCenterKey} Major System - 7 Modal Box Shapes`
    : `${tonalCenterMode === 'major' ? majorCenterKey : minorCenterKey} ${tonalCenterMode === 'major' ? 'Major' : 'Minor'} Pentatonic - 5 Box Shapes`;

  return (
    <div className="w-full bg-slate-900 min-h-screen">
      <div className="mx-auto max-w-[1860px] px-4 py-4 xl:px-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>

          <div ref={circleSelectorRef} className="w-full max-w-[970px] mx-auto relative z-[120]">
            <CircleOfFifthsSelector
              selectedKey={selectedMajorKey}
              onSelectKey={onSelectedMajorKeyChange}
              showSettingsButton
              isSettingsOpen={isSettingsOpen}
              onSettingsToggle={() => setIsSettingsOpen((current) => !current)}
            />

            {isSettingsOpen && (
              <div className="absolute top-24 right-0 z-50 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                    Display
                  </p>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2">
                  <div
                    onClick={() => setShowRectangleAndStack((current) => !current)}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: showRectangleAndStack ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: showRectangleAndStack ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Show rectangle + stack
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Pentatonic overlay geometry
                  </p>

                  <div
                    onClick={() => setShowRootHalos((current) => !current)}
                    className="mt-2 flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: showRootHalos ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: showRootHalos ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Show root halos
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Root ring highlights
                  </p>

                  <div
                    onClick={() => setShowIntervalLabels((current) => !current)}
                    className="mt-2 flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: showIntervalLabels ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: showIntervalLabels ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Show interval labels
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Relative to selected tonal center
                  </p>

                  <div
                    onClick={() => setShowNotesFromOtherPositions((current) => !current)}
                    className="mt-2 flex items-center gap-3 cursor-pointer py-1"
                  >
                    <div className="relative flex-shrink-0" style={{ width: '36px', height: '20px' }}>
                      <div
                        className="absolute inset-0 rounded-full transition-colors"
                        style={{ backgroundColor: showNotesFromOtherPositions ? '#34C759' : '#E5E7EB' }}
                      />
                      <div
                        className="absolute bg-white rounded-full shadow-sm pointer-events-none"
                        style={{
                          width: '16px',
                          height: '16px',
                          left: '2px',
                          top: '2px',
                          transform: showNotesFromOtherPositions ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
                      Show notes from other positions
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Faint scale notes from the other displayed boxes
                  </p>
                </div>
              </div>
            )}
          </div>

          <section
            ref={controlsPanelRef}
            className="mx-auto w-full max-w-[1320px] rounded-xl bg-slate-900/45 p-4 shadow-lg ring-1 ring-white/10 backdrop-blur-sm"
          >
            <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
              <div className="flex flex-col items-center text-center">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Tonal Center
                </p>
                <div className={SEGMENT_WRAPPER_CLASS}>
                  <button
                    type="button"
                    onClick={() => handleTonalCenterChange('minor')}
                    className={getSegmentButtonClass(tonalCenterMode === 'minor')}
                  >
                    Minor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTonalCenterChange('major')}
                    className={getSegmentButtonClass(tonalCenterMode === 'major')}
                  >
                    Major
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Relative pair: {minorCenterKey} minor / {majorCenterKey} major
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Box Family
                </p>
                <div className={SEGMENT_WRAPPER_CLASS}>
                  {scaleFamilyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleScaleFamilyChange(option.value)}
                      className={getSegmentButtonClass(option.value === scaleFamily)}
                    >
                      {option.value === 'major' ? 'Major (7)' : 'Pentatonic (5)'}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-400">{scaleFamilyLabel}</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Panels
                </p>
                <div className={SEGMENT_WRAPPER_CLASS}>
                  <button
                    type="button"
                    onClick={() => setShowPracticePanel((current) => !current)}
                    className={getSegmentButtonClass(showPracticePanel)}
                  >
                    Progressions
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheatSheetPanel((current) => !current)}
                    className={getSegmentButtonClass(showCheatSheetPanel)}
                  >
                    Chord Notes
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">Always available without opening a menu.</p>
              </div>
            </div>

            {scaleFamily === 'pentatonic' && (
              <div className="mt-4 space-y-3 text-center">
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Heptatonic Modes
                  </p>
                  <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-lg bg-slate-800/85 p-1.5 shadow-inner shadow-black/40 ring-1 ring-white/10">
                    <button
                      type="button"
                      onClick={() => setHexatonicMode('off')}
                      className={getSegmentButtonClass(hexatonicMode === 'off')}
                    >
                      Off
                    </button>
                    {HEXATONIC_MODE_OPTIONS.map((modeOption) => {
                      const isActive = hexatonicMode === modeOption.id;
                      return (
                        <button
                          key={modeOption.id}
                          type="button"
                          onClick={() => handleHeptatonicModeSelection(modeOption.id)}
                          className={getSegmentButtonClass(isActive)}
                          title={modeOption.description}
                        >
                          {modeOption.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Single-Note Targets
                  </p>
                  <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-lg bg-slate-800/85 p-1.5 shadow-inner shadow-black/40 ring-1 ring-white/10">
                    {orderedSingleTargetToneConfigs.map((config) => {
                      const pitchClass = getTargetTonePitchClass(config, majorCenterKey, minorCenterKey);
                      const isVisible = visibleTargetToneByPitchClass.has(pitchClass);
                      const isLockedByMode = modeLockedSingleTargetToneIds.has(config.id);
                      const intervalSemitones = getTargetToneIntervalFromTonalCenter(
                        config,
                        tonalCenterMode,
                        majorCenterKey,
                        minorCenterKey
                      );
                      const intervalLabel = getIntervalLabelFromSemitones(intervalSemitones);
                      const intervalEffectDescription = getIntervalEffectDescriptionFromSemitones(intervalSemitones);
                      return (
                        <button
                          key={config.id}
                          type="button"
                          disabled={isLockedByMode}
                          onClick={() => {
                            if (isLockedByMode) {
                              return;
                            }
                            setSingleTargetToneState((current) => ({
                              ...current,
                              [config.id]: !current[config.id],
                            }));
                          }}
                          className={[
                            'inline-flex min-w-[190px] flex-col items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isVisible
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/70 hover:text-slate-100',
                            isLockedByMode ? 'cursor-not-allowed opacity-80' : '',
                          ].join(' ')}
                          title={isLockedByMode ? 'Already included by the selected heptatonic mode' : undefined}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: config.palette.mid }}
                            />
                            <span>{`Add ${intervalLabel} targets`}</span>
                          </span>
                          <span className={`text-xs ${isVisible ? 'text-slate-100' : 'text-slate-400'}`}>
                            {isLockedByMode ? `${intervalEffectDescription} (mode)` : intervalEffectDescription}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          <div>
            <div ref={fretboardsContainerRef} className="relative flex flex-col gap-1">
              {displayPatterns.map((shapeData) => {
                let patternForRender = shapeData.pattern;
                let rootPositionsForRender = shapeData.rootPositions;
                const markers: FretboardMarker[] = [];
                const ghostNotes: {
                  stringIdx: number;
                  fret: number;
                  preferFlatName?: boolean;
                  vibePalette?: {
                    outer: string;
                    mid: string;
                    inner: string;
                  };
                }[] = [];
                const focusedShapeOverlays = activeScaleFamily === 'pentatonic' && showRectangleAndStack
                  ? buildPentatonicShapeOverlays(shapeData.pattern, majorCenterKey)
                  : [];
                const faintOtherShapeOverlays = activeScaleFamily === 'pentatonic'
                  && showRectangleAndStack
                  && showNotesFromOtherPositions
                  ? displayPatterns
                    .filter((otherShape) => otherShape.id !== shapeData.id)
                    .flatMap((otherShape) => (
                      buildPentatonicShapeOverlays(otherShape.pattern, majorCenterKey).map((overlay, overlayIndex) => ({
                        ...overlay,
                        id: `other-${otherShape.id}-${overlay.id}-${overlayIndex}`,
                        strokeWidth: Math.max(1.4, (overlay.strokeWidth ?? 2.5) - 0.9),
                        opacity: Math.min(overlay.opacity ?? 0.9, 0.32),
                        fillOpacity: Math.min(overlay.fillOpacity ?? 0.5, 0.22),
                      }))
                    ))
                  : [];
                const shapeOverlaysForRender = [
                  ...faintOtherShapeOverlays,
                  ...focusedShapeOverlays,
                ];
                const temporaryNonScaleToneStyleByPitchClass = new Map<
                  number,
                  {
                    preferFlatName: boolean;
                    vibePalette: { outer: string; mid: string; inner: string };
                  }
                >();

                if (activeScaleFamily === 'pentatonic' && visibleTargetTones.length > 0) {
                  const mergedPattern = shapeData.pattern.map((stringFrets) => new Set(stringFrets));
                  const minFret = Math.max(0, shapeData.windowStart);
                  const maxFret = Math.min(BOX_FRET_COUNT, shapeData.windowEnd);
                  const minimumTargetsPerPitchClass = 2;
                  const focusFret = maxFret + 1;

                  visibleTargetTones.forEach((tone) => {
                    const targetPitchClass = tone.pitchClass;
                    const targetPositions: [number, number][] = [];
                    const targetPositionKeys = new Set<string>();

                    const addTargetPosition = (stringIndex: number, fret: number) => {
                      const key = `${stringIndex}:${fret}`;
                      if (targetPositionKeys.has(key)) {
                        return;
                      }
                      targetPositionKeys.add(key);
                      mergedPattern[stringIndex].add(fret);
                      targetPositions.push([stringIndex, fret]);
                    };

                    const matchesTargetPitchClass = (stringIndex: number, fret: number) =>
                      getPitchClassAtPosition(stringIndex, fret) === targetPitchClass;

                    // Primary pass: flood this target note inside the current box window.
                    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                      for (let fret = minFret; fret <= maxFret; fret++) {
                        if (matchesTargetPitchClass(stringIndex, fret)) {
                          addTargetPosition(stringIndex, fret);
                        }
                      }
                    }

                    // Completion pass: guarantee at least two targets for each active tone.
                    let count = targetPositions.length;
                    while (count < minimumTargetsPerPitchClass) {
                      let bestCandidate: { stringIndex: number; fret: number; score: number } | null = null;

                      for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
                        for (let fret = 0; fret <= BOX_FRET_COUNT; fret++) {
                          if (!matchesTargetPitchClass(stringIndex, fret)) {
                            continue;
                          }

                          const key = `${stringIndex}:${fret}`;
                          if (targetPositionKeys.has(key)) {
                            continue;
                          }

                          const score = Math.abs(fret - focusFret) + (fret < minFret ? 0.5 : 0);
                          if (
                            !bestCandidate
                            || score < bestCandidate.score
                            || (score === bestCandidate.score && fret < bestCandidate.fret)
                          ) {
                            bestCandidate = { stringIndex, fret, score };
                          }
                        }
                      }

                      if (!bestCandidate) {
                        break;
                      }

                      addTargetPosition(bestCandidate.stringIndex, bestCandidate.fret);
                      count += 1;
                    }

                    if (targetPositions.length > 0) {
                      markers.push({
                        positions: targetPositions,
                        stroke: tone.palette.inner,
                        strokeWidth: 2,
                        ringOffset: 3,
                        variant: 'vibe',
                        vibePalette: tone.palette,
                        preferFlatName: tone.preferFlatName,
                      });
                    }
                  });

                  patternForRender = mergedPattern.map(
                    (stringFrets) => [...stringFrets].sort((a, b) => a - b)
                  );
                }

                const computedRootPositions: [number, number][] = [];
                patternForRender.forEach((stringFrets, stringIndex) => {
                  stringFrets.forEach((fret) => {
                    if (getPitchClassAtPosition(stringIndex, fret) === rootHaloPitchClass) {
                      computedRootPositions.push([stringIndex, fret]);
                    }
                  });
                });
                if (computedRootPositions.length > 0) {
                  rootPositionsForRender = computedRootPositions;
                }

                if (
                  activeChordPitchClasses
                  && activeChordPitchClasses.length > 0
                  && !hideNonScaleChordTones
                ) {
                  const visiblePitchClasses = new Set<number>();
                  patternForRender.forEach((stringFrets, stringIndex) => {
                    stringFrets.forEach((fret) => {
                      visiblePitchClasses.add(getPitchClassAtPosition(stringIndex, fret));
                    });
                  });

                  const missingPitchClasses = [...new Set(activeChordPitchClasses)]
                    .map((pitchClass) => ((pitchClass % 12) + 12) % 12)
                    .filter((pitchClass) => !visiblePitchClasses.has(pitchClass));

                  missingPitchClasses.forEach((pitchClass) => {
                    const fromVisibleTarget = visibleTargetToneByPitchClass.get(pitchClass);
                    if (fromVisibleTarget) {
                      temporaryNonScaleToneStyleByPitchClass.set(pitchClass, {
                        preferFlatName: fromVisibleTarget.preferFlatName,
                        vibePalette: fromVisibleTarget.palette,
                      });
                      return;
                    }

                    const intervalFromTonalCenter = (pitchClass - tonalCenterRootPitchClass + 12) % 12;
                    const configForInterval = SINGLE_TARGET_TONE_CONFIGS.find((config) => (
                      getTargetToneIntervalFromTonalCenter(
                        config,
                        tonalCenterMode,
                        majorCenterKey,
                        minorCenterKey
                      ) === intervalFromTonalCenter
                    ));

                    if (configForInterval) {
                      temporaryNonScaleToneStyleByPitchClass.set(pitchClass, {
                        preferFlatName: configForInterval.preferFlatName,
                        vibePalette: configForInterval.palette,
                      });
                    }
                  });

                  if (missingPitchClasses.length > 0) {
                    const minFret = Math.max(0, shapeData.windowStart);
                    const maxFret = Math.min(BOX_FRET_COUNT, shapeData.windowEnd);
                    const centerFret = (minFret + maxFret) / 2;

                    const getCandidates = (pitchClass: number, fretStart: number, fretEnd: number) => {
                      const candidates: { stringIdx: number; fret: number; score: number }[] = [];
                      for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
                        for (let fret = fretStart; fret <= fretEnd; fret++) {
                          if (getPitchClassAtPosition(stringIdx, fret) !== pitchClass) {
                            continue;
                          }
                          const score = Math.abs(fret - centerFret) + Math.abs(stringIdx - 2.5) * 0.35;
                          candidates.push({ stringIdx, fret, score });
                        }
                      }

                      return candidates.sort((a, b) => {
                        if (a.score !== b.score) {
                          return a.score - b.score;
                        }
                        if (a.fret !== b.fret) {
                          return a.fret - b.fret;
                        }
                        return a.stringIdx - b.stringIdx;
                      });
                    };

                    missingPitchClasses.forEach((pitchClass) => {
                      const temporaryToneStyle = temporaryNonScaleToneStyleByPitchClass.get(pitchClass);
                      const inWindowCandidates = getCandidates(pitchClass, minFret, maxFret);
                      const pickedCandidates = inWindowCandidates.length > 0
                        ? inWindowCandidates.slice(0, 2)
                        : getCandidates(pitchClass, 0, BOX_FRET_COUNT).slice(0, 2);

                      pickedCandidates.forEach(({ stringIdx, fret }) => {
                        const key = `${stringIdx}:${fret}`;
                        if (!ghostNotes.some((note) => `${note.stringIdx}:${note.fret}` === key)) {
                          ghostNotes.push({
                            stringIdx,
                            fret,
                            preferFlatName: temporaryToneStyle?.preferFlatName,
                            vibePalette: temporaryToneStyle?.vibePalette,
                          });
                        }
                      });
                    });
                  }
                }

                const otherPositionNotesForRender = [
                  ...(otherPositionNotesByPatternId.get(shapeData.id) ?? []),
                ];
                let ghostNotesForRender = ghostNotes;

                if (showNotesFromOtherPositions && temporaryNonScaleToneStyleByPitchClass.size > 0) {
                  const otherPositionKeys = new Set(
                    otherPositionNotesForRender.map((note) => `${note.stringIdx}:${note.fret}`)
                  );

                  // Promote matching "other-position" notes to temporary non-scale markers.
                  otherPositionNotesForRender.forEach((note) => {
                    const pitchClass = getPitchClassAtPosition(note.stringIdx, note.fret);
                    const temporaryToneStyle = temporaryNonScaleToneStyleByPitchClass.get(pitchClass);
                    if (!temporaryToneStyle) {
                      return;
                    }
                    note.isTemporaryNonScale = true;
                    note.preferFlatName = note.preferFlatName || temporaryToneStyle.preferFlatName;
                    note.vibePalette = temporaryToneStyle.vibePalette;
                  });

                  // Also project those temporary tones across the *other* box windows so they appear
                  // across the neck with the non-focused-position layer.
                  displayPatterns
                    .filter((otherShape) => otherShape.id !== shapeData.id)
                    .forEach((otherShape) => {
                      const minFret = Math.max(0, otherShape.windowStart);
                      const maxFret = Math.min(BOX_FRET_COUNT, otherShape.windowEnd);
                      temporaryNonScaleToneStyleByPitchClass.forEach((temporaryToneStyle, pitchClass) => {
                        for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
                          for (let fret = minFret; fret <= maxFret; fret++) {
                            if (getPitchClassAtPosition(stringIdx, fret) !== pitchClass) {
                              continue;
                            }
                            const key = `${stringIdx}:${fret}`;
                            if (otherPositionKeys.has(key)) {
                              continue;
                            }
                            otherPositionKeys.add(key);
                            otherPositionNotesForRender.push({
                              stringIdx,
                              fret,
                              preferFlatName: temporaryToneStyle.preferFlatName,
                              isTemporaryNonScale: true,
                              vibePalette: temporaryToneStyle.vibePalette,
                            });
                          }
                        }
                      });
                    });
                }

                if (showNotesFromOtherPositions && ghostNotes.length > 0) {
                  const otherPositionKeys = new Set(
                    otherPositionNotesForRender.map((note) => `${note.stringIdx}:${note.fret}`)
                  );
                  ghostNotes.forEach((note) => {
                    const key = `${note.stringIdx}:${note.fret}`;
                    if (otherPositionKeys.has(key)) {
                      return;
                    }
                    otherPositionKeys.add(key);
                    otherPositionNotesForRender.push({
                      stringIdx: note.stringIdx,
                      fret: note.fret,
                      preferFlatName: note.preferFlatName,
                      isTemporaryNonScale: true,
                      vibePalette: note.vibePalette,
                    });
                  });
                  ghostNotesForRender = [];
                }

                return (
                  <ScalePatternFretboard
                    key={`${scaleFamily}-${selectedMajorKey}-${effectiveScaleKey}-${shapeData.id}`}
                    title={shapeData.label}
                    selectedKey={effectiveScaleKey}
                    pattern={patternForRender}
                    rootPositions={rootPositionsForRender}
                    rootPitchClassOverride={rootHaloPitchClass}
                    otherPositionNotes={otherPositionNotesForRender}
                    ghostNotes={ghostNotesForRender}
                    markers={markers}
                    shapeOverlays={shapeOverlaysForRender}
                    pitchClassLabels={pitchClassLabels}
                    showRootHalos={showRootHalos}
                    activeChordPitchClasses={activeChordPitchClasses ?? undefined}
                    numFrets={BOX_FRET_COUNT}
                    titlePlacement="left"
                    showTitle={false}
                  />
                );
              })}
            </div>

            {shouldShowPracticePanels && shouldFloatCheatSheet && floatingPanelPositions && (
              <div
                className="fixed z-40"
                style={{
                  top: `${floatingPanelPositions.leftPanelTop}px`,
                  left: `${floatingPanelPositions.leftPanelLeft}px`,
                  width: '260px',
                }}
              >
                <ChordCheatSheetPanel
                  data={chordCheatSheetData}
                  rootPitchClasses={cheatSheetRootPitchClasses}
                  auraPitchClasses={cheatSheetAuraPitchClasses}
                  activeChordPitchClasses={activeChordPitchClasses ?? undefined}
                  activeChordSymbol={activeChordSymbol ?? undefined}
                  onClose={() => setShowCheatSheetPanel(false)}
                />
              </div>
            )}

            {shouldShowPracticePanels && shouldFloatProgressions && floatingPanelPositions && (
              <div
                className="fixed z-40"
                style={{
                  top: `${floatingPanelPositions.rightPanelTop}px`,
                  left: `${floatingPanelPositions.rightPanelLeft}px`,
                  width: '300px',
                }}
              >
                <PracticeProgressionsPanel
                  tonalCenterMode={tonalCenterMode}
                  tonalKey={tonalCenterKey}
                  majorCenterKey={majorCenterKey}
                  minorCenterKey={minorCenterKey}
                  scaleFamilyLabel={scaleFamilyLabel}
                  progressions={practiceProgressions}
                  panelHeightPx={floatingPanelPositions.viewportHeight - floatingPanelPositions.rightPanelTop - 12}
                  onActiveChordPitchClassesChange={setActiveChordPitchClasses}
                  onActiveChordSymbolChange={setActiveChordSymbol}
                  onHideNonScaleChordTonesChange={setHideNonScaleChordTones}
                  onClose={() => setShowPracticePanel(false)}
                />
              </div>
            )}

            {shouldShowPracticePanels && (shouldStackCheatSheet || shouldStackProgressions) && (
              <div className="mt-4 space-y-3">
                {shouldStackCheatSheet && (
                  <ChordCheatSheetPanel
                    data={chordCheatSheetData}
                    rootPitchClasses={cheatSheetRootPitchClasses}
                    auraPitchClasses={cheatSheetAuraPitchClasses}
                    activeChordPitchClasses={activeChordPitchClasses ?? undefined}
                    activeChordSymbol={activeChordSymbol ?? undefined}
                    onClose={() => setShowCheatSheetPanel(false)}
                  />
                )}
                {shouldStackProgressions && (
                  <PracticeProgressionsPanel
                    tonalCenterMode={tonalCenterMode}
                    tonalKey={tonalCenterKey}
                    majorCenterKey={majorCenterKey}
                    minorCenterKey={minorCenterKey}
                    scaleFamilyLabel={scaleFamilyLabel}
                    progressions={practiceProgressions}
                    onActiveChordPitchClassesChange={setActiveChordPitchClasses}
                    onActiveChordSymbolChange={setActiveChordSymbol}
                    onHideNonScaleChordTonesChange={setHideNonScaleChordTones}
                    onClose={() => setShowPracticePanel(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
