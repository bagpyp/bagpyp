import type { BoxScaleFamily } from './box-shapes';
import type { HexatonicModeId, TonalCenterMode } from './target-tones';
import { getPitchClass } from './box-shapes';
import { getChordNotes, type ChordType } from './chord-types';

export interface ProgressionRecommendationContext {
  tonalCenterMode: TonalCenterMode;
  scaleFamily: BoxScaleFamily;
  majorCenterKey: string;
  minorCenterKey: string;
  hexatonicMode: HexatonicModeId;
  visibleTargetIntervals: number[];
}

interface ProgressionTemplate {
  id: string;
  title: string;
  romanNumerals: string;
  whyItFits: string;
}

export interface PracticeProgression {
  id: string;
  title: string;
  romanNumerals: string;
  chordNames: string;
  whyItFits: string;
}

export interface ChordCheatSheetEntry {
  chordSymbol: string;
  notes: string[];
}

export interface ChordCheatSheetData {
  entries: ChordCheatSheetEntry[];
  uniqueNotes: string[];
}

const MAJOR_SCALE_DEGREE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
const SHARP_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']);
const DEGREE_BY_ROMAN: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

const PROGRESSION_TEMPLATES: Record<string, ProgressionTemplate> = {
  blues12: {
    id: 'blues12',
    title: '12-Bar Blues',
    romanNumerals: 'I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7',
    whyItFits: 'Classic dominant-blues form for loop-pedal phrasing.',
  },
  dooWop: {
    id: 'dooWop',
    title: 'Doo-Wop Cycle',
    romanNumerals: 'I vi IV V',
    whyItFits: 'Classic tonal loop with smooth voice leading.',
  },
  majorWalk: {
    id: 'majorWalk',
    title: 'Major Walk',
    romanNumerals: 'I ii IV V',
    whyItFits: 'Strong major movement that supports scale-degree targeting.',
  },
  majorLift: {
    id: 'majorLift',
    title: 'Major Lift',
    romanNumerals: 'I V ii IV',
    whyItFits: 'Modern-feeling motion with clear cadence points.',
  },
  majorHome: {
    id: 'majorHome',
    title: 'Home Cadence',
    romanNumerals: 'I IV ii V',
    whyItFits: 'Keeps tonic awareness while cycling through diatonic color.',
  },
  majorColor: {
    id: 'majorColor',
    title: 'Major Color Sweep',
    romanNumerals: 'I iii IV ii',
    whyItFits: 'Highlights 3rd and 6th color tones in major.',
  },
  majorCadence64: {
    id: 'majorCadence64',
    title: 'Cadence 6-4 Feel',
    romanNumerals: 'I V IV I',
    whyItFits: 'Simple turn-around for repeated line practice.',
  },
  majorCadence: {
    id: 'majorCadence',
    title: 'Major Cadence',
    romanNumerals: 'I IV V I',
    whyItFits: 'Strong tonal center with clear phrase endings.',
  },
  ionianPop: {
    id: 'ionianPop',
    title: 'Pop Major Loop',
    romanNumerals: 'I V vi IV',
    whyItFits: 'Popular modern major progression for melodic practice.',
  },
  majorPentDrive: {
    id: 'majorPentDrive',
    title: 'Major Pent Drive',
    romanNumerals: 'I II V I',
    whyItFits: 'Leans into 1-2-3-5-6 major pentatonic tones.',
  },
  majorPentLift: {
    id: 'majorPentLift',
    title: 'Major Pent Lift',
    romanNumerals: 'I II IV V',
    whyItFits: 'Open harmonic frame for pentatonic phrasing.',
  },
  majorPentFloat: {
    id: 'majorPentFloat',
    title: 'Major Pent Float',
    romanNumerals: 'I V II IV',
    whyItFits: 'Bright circular motion with sparse dissonance.',
  },
  majorPentColor: {
    id: 'majorPentColor',
    title: 'Major Pent Color',
    romanNumerals: 'I iii V IV',
    whyItFits: 'Accents 3 and 6 while keeping strong tonic gravity.',
  },
  minorRock: {
    id: 'minorRock',
    title: 'Natural Minor Rock',
    romanNumerals: 'i bVII bVI bVII',
    whyItFits: 'Common aeolian movement for minor pentatonic language.',
  },
  minorBluesLoop: {
    id: 'minorBluesLoop',
    title: 'Minor Blues Loop',
    romanNumerals: 'i7 i7 iv7 i7 | i7 i7 v7 iv7 | i7 v7 i7 v7',
    whyItFits: 'Minor-blues framework with space for call-and-response lines.',
  },
  minorResolve: {
    id: 'minorResolve',
    title: 'Minor Resolve',
    romanNumerals: 'i bVI bVII i',
    whyItFits: 'Strong aeolian cadence for phrase resolution.',
  },
  minorColor: {
    id: 'minorColor',
    title: 'Minor Color',
    romanNumerals: 'i bIII bVII i',
    whyItFits: 'Natural minor color tones with clear tonic returns.',
  },
  minorDescent: {
    id: 'minorDescent',
    title: 'Minor Descent',
    romanNumerals: 'i bVII bVI i',
    whyItFits: 'Descending harmonic motion for lyrical lines.',
  },
  minorPulse: {
    id: 'minorPulse',
    title: 'Minor Pulse',
    romanNumerals: 'i iv bVII i',
    whyItFits: 'Mixes tonic and subdominant pull without overloading harmony.',
  },
  minorDrone: {
    id: 'minorDrone',
    title: 'Minor Drone',
    romanNumerals: 'i v i bVII',
    whyItFits: 'Minimal movement for focused motif development.',
  },
  dorianVamp: {
    id: 'dorianVamp',
    title: 'Dorian Vamp',
    romanNumerals: 'i7 IV7 i7 IV7',
    whyItFits: 'Highlights the natural 6 color against a minor tonic.',
  },
  dorianTurn: {
    id: 'dorianTurn',
    title: 'Dorian Turn',
    romanNumerals: 'i7 v7 IV7 i7',
    whyItFits: 'Keeps dorian color while adding a tighter turn-around.',
  },
  dorianColor: {
    id: 'dorianColor',
    title: 'Dorian Color Loop',
    romanNumerals: 'i7 bIII IV7 i7',
    whyItFits: 'Connects minor tonic to brighter dorian color chords.',
  },
  dorianBackbeat: {
    id: 'dorianBackbeat',
    title: 'Dorian Backbeat',
    romanNumerals: 'i7 bVII IV7 i7',
    whyItFits: 'Funk-friendly layout with IV major emphasis.',
  },
  dorianClimb: {
    id: 'dorianClimb',
    title: 'Dorian Climb',
    romanNumerals: 'i7 ii7 v7 i7',
    whyItFits: 'Good for stepwise melodic sequencing.',
  },
  dorianWide: {
    id: 'dorianWide',
    title: 'Dorian Wide Loop',
    romanNumerals: 'i7 IV7 bVII i7',
    whyItFits: 'Wider harmonic arc while staying modal.',
  },
  phrygianVamp: {
    id: 'phrygianVamp',
    title: 'Phrygian Tension Vamp',
    romanNumerals: 'i bII i bII',
    whyItFits: 'Leans into the b2 pull for tense modal phrasing.',
  },
  phrygianDrop: {
    id: 'phrygianDrop',
    title: 'Phrygian Drop',
    romanNumerals: 'i bII bVII i',
    whyItFits: 'Maintains phrygian tension with a clear release point.',
  },
  phrygianShadow: {
    id: 'phrygianShadow',
    title: 'Phrygian Shadow',
    romanNumerals: 'i bII bVI bVII',
    whyItFits: 'Dark modal movement centered on b2/b6 colors.',
  },
  phrygianPulse: {
    id: 'phrygianPulse',
    title: 'Phrygian Pulse',
    romanNumerals: 'i bVII bII i',
    whyItFits: 'Keeps the phrygian b2 as a repeated anchor.',
  },
  phrygianHeat: {
    id: 'phrygianHeat',
    title: 'Phrygian Heat',
    romanNumerals: 'i bVI bII i',
    whyItFits: 'Strong contrast around the b2 tension target.',
  },
  phrygianFrame: {
    id: 'phrygianFrame',
    title: 'Phrygian Frame',
    romanNumerals: 'i bII iv i',
    whyItFits: 'Adds iv color while preserving phrygian identity.',
  },
  phrygianTritoneBite: {
    id: 'phrygianTritoneBite',
    title: 'Phrygian Tritone Bite',
    romanNumerals: 'i bV bII i',
    whyItFits: 'Centers the b5 color directly against phrygian b2 tension.',
  },
  phrygianTritonePivot: {
    id: 'phrygianTritonePivot',
    title: 'Phrygian Tritone Pivot',
    romanNumerals: 'i bII bV i',
    whyItFits: 'Approaches the tritone via b2 for dark chromatic pull.',
  },
  phrygianB5Drone: {
    id: 'phrygianB5Drone',
    title: 'Phrygian b5 Drone',
    romanNumerals: 'i bV i bII',
    whyItFits: 'Keeps tonic anchored while repeatedly spotlighting b5.',
  },
  phrygianB5Cycle: {
    id: 'phrygianB5Cycle',
    title: 'Phrygian b5 Cycle',
    romanNumerals: 'i bV bVII bII',
    whyItFits: 'Moves through familiar phrygian colors with explicit b5 color-stop.',
  },
  phrygianB5Descent: {
    id: 'phrygianB5Descent',
    title: 'Phrygian b5 Descent',
    romanNumerals: 'i bVI bV bII',
    whyItFits: 'Descending darker motion with a tritone landing before b2.',
  },
  lydianLift: {
    id: 'lydianLift',
    title: 'Lydian Lift',
    romanNumerals: 'Imaj7 II Imaj7 II',
    whyItFits: 'Uses the raised 4 color through the major II chord.',
  },
  lydianSkyline: {
    id: 'lydianSkyline',
    title: 'Lydian Skyline',
    romanNumerals: 'Imaj7 II V Imaj7',
    whyItFits: 'Strong #4 color plus a conventional return.',
  },
  lydianOpen: {
    id: 'lydianOpen',
    title: 'Lydian Open',
    romanNumerals: 'I II V I',
    whyItFits: 'Clean modal frame for long melodic phrases.',
  },
  lydianFloat: {
    id: 'lydianFloat',
    title: 'Lydian Float',
    romanNumerals: 'I II iii II',
    whyItFits: 'Sustains the bright lydian atmosphere.',
  },
  lydianRise: {
    id: 'lydianRise',
    title: 'Lydian Rise',
    romanNumerals: 'I V II I',
    whyItFits: 'Alternates stability and lift around the II chord.',
  },
  lydianBright: {
    id: 'lydianBright',
    title: 'Lydian Bright Turn',
    romanNumerals: 'Imaj7 II vi V',
    whyItFits: 'Color-rich loop with practical cadence points.',
  },
  mixolydianDrive: {
    id: 'mixolydianDrive',
    title: 'Mixolydian Drive',
    romanNumerals: 'I7 bVII IV I7',
    whyItFits: 'Dominant tonality with the signature b7 neighborhood.',
  },
  mixoStep: {
    id: 'mixoStep',
    title: 'Mixolydian Step',
    romanNumerals: 'I7 IV bVII I7',
    whyItFits: 'Strong dominant center with classic rock movement.',
  },
  mixoReturn: {
    id: 'mixoReturn',
    title: 'Mixolydian Return',
    romanNumerals: 'I7 bVII I7 IV',
    whyItFits: 'Alternates dominant and bVII for call/response lines.',
  },
  mixoLoop: {
    id: 'mixoLoop',
    title: 'Mixolydian Loop',
    romanNumerals: 'I7 IV I7 bVII',
    whyItFits: 'Keeps tonic dominant in focus through each cycle.',
  },
  mixoPocket: {
    id: 'mixoPocket',
    title: 'Mixolydian Pocket',
    romanNumerals: 'I7 bVII IV bVII',
    whyItFits: 'Locks into groove-oriented dominant phrasing.',
  },
  mixoMinorV: {
    id: 'mixoMinorV',
    title: 'Mixolydian Minor-v',
    romanNumerals: 'I7 v IV I7',
    whyItFits: 'Adds darker modal contrast while staying mixolydian.',
  },
  mixoBluesColor: {
    id: 'mixoBluesColor',
    title: 'Mixolydian Blues Color',
    romanNumerals: 'I7 bIII7 IV7 I7',
    whyItFits: 'Major-blues mixture: mixolydian shell plus borrowed b3 color.',
  },
  mixoBluesBackdoor: {
    id: 'mixoBluesBackdoor',
    title: 'Mixolydian Backdoor Blues',
    romanNumerals: 'I7 bVII7 IV7 bIII7',
    whyItFits: 'Dominant groove with bIII color and backdoor motion.',
  },
  mixoBluesTurn: {
    id: 'mixoBluesTurn',
    title: 'Mixolydian Blues Turn',
    romanNumerals: 'I7 IV7 bIII7 bVII7',
    whyItFits: 'Rotating dominant pockets for b3/4/b7 targeting.',
  },
  majorBluesColor: {
    id: 'majorBluesColor',
    title: 'Major Pentatonic Blues Color',
    romanNumerals: 'I7 bIII7 IV7 I7',
    whyItFits: 'Injects blues color into a major-pentatonic frame.',
  },
};

const BASE_TEMPLATE_IDS_BY_FLAVOR: Record<string, string[]> = {
  ionian: [
    'majorCadence',
    'ionianPop',
    'dooWop',
    'majorWalk',
    'majorLift',
    'majorHome',
    'majorColor',
    'majorCadence64',
  ],
  majorPentatonic: [
    'majorCadence',
    'ionianPop',
    'majorPentDrive',
    'majorPentLift',
    'majorPentFloat',
    'majorPentColor',
    'majorHome',
  ],
  minorPentatonic: [
    'minorRock',
    'minorBluesLoop',
    'minorResolve',
    'minorColor',
    'minorDescent',
    'minorPulse',
    'minorDrone',
  ],
  dorian: [
    'dorianVamp',
    'dorianTurn',
    'dorianColor',
    'dorianBackbeat',
    'dorianClimb',
    'dorianWide',
  ],
  aeolian: [
    'minorRock',
    'minorResolve',
    'minorColor',
    'minorDescent',
    'minorPulse',
    'minorDrone',
    'minorBluesLoop',
  ],
  phrygian: [
    'phrygianVamp',
    'phrygianDrop',
    'phrygianShadow',
    'phrygianPulse',
    'phrygianHeat',
    'phrygianFrame',
  ],
  phrygianTritone: [
    'phrygianTritoneBite',
    'phrygianTritonePivot',
    'phrygianB5Drone',
    'phrygianB5Cycle',
    'phrygianB5Descent',
    'phrygianVamp',
  ],
  lydian: [
    'lydianLift',
    'lydianSkyline',
    'lydianOpen',
    'lydianFloat',
    'lydianRise',
    'lydianBright',
  ],
  mixolydian: [
    'mixolydianDrive',
    'mixoStep',
    'mixoReturn',
    'mixoLoop',
    'mixoPocket',
    'mixoMinorV',
    'blues12',
  ],
  locrian: [
    'phrygianVamp',
    'phrygianDrop',
    'phrygianFrame',
    'phrygianShadow',
    'minorResolve',
    'minorBluesLoop',
  ],
  mixolydianBlues: [
    'mixoBluesColor',
    'mixoBluesBackdoor',
    'mixoBluesTurn',
    'blues12',
    'mixolydianDrive',
    'mixoStep',
  ],
  majorBlues: [
    'majorBluesColor',
    'blues12',
    'majorCadence',
    'mixolydianDrive',
    'ionianPop',
  ],
  minorBlues: [
    'blues12',
    'minorBluesLoop',
    'minorRock',
    'minorResolve',
    'minorPulse',
  ],
};

const MAJOR_DIATONIC_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_DIATONIC_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];

const TEMPLATE_IDS = Object.keys(PROGRESSION_TEMPLATES);
const FLAVORS_BY_TEMPLATE_ID = (() => {
  const byTemplate = new Map<string, Set<string>>();
  Object.entries(BASE_TEMPLATE_IDS_BY_FLAVOR).forEach(([flavorId, templateIds]) => {
    templateIds.forEach((templateId) => {
      const existing = byTemplate.get(templateId) ?? new Set<string>();
      existing.add(flavorId);
      byTemplate.set(templateId, existing);
    });
  });
  return byTemplate;
})();

function usesFlatSpellingForKey(key: string): boolean {
  return key.includes('b') || FLAT_KEYS.has(key);
}

function formatChordSuffix(coreRoman: string, rawSuffix: string): string {
  const isUpper = coreRoman === coreRoman.toUpperCase();

  if (rawSuffix === 'maj7') {
    return 'maj7';
  }
  if (rawSuffix === 'm7') {
    return 'm7';
  }
  if (rawSuffix === '7') {
    return isUpper ? '7' : 'm7';
  }
  return isUpper ? '' : 'm';
}

function renderRomanTokenAsChord(token: string, tonicKey: string): string {
  const match = token.match(/^([b#]?)([ivIV]+)(maj7|m7|7)?$/);
  if (!match) {
    return token;
  }

  const accidental = match[1];
  const coreRoman = match[2];
  const rawSuffix = match[3] ?? '';
  const degree = DEGREE_BY_ROMAN[coreRoman.toUpperCase()];
  if (!degree) {
    return token;
  }

  const tonicPc = getPitchClass(tonicKey);
  const degreeOffset = MAJOR_SCALE_DEGREE_OFFSETS[degree - 1];
  const accidentalOffset = accidental === 'b' ? -1 : accidental === '#' ? 1 : 0;
  const pitchClass = (tonicPc + degreeOffset + accidentalOffset + 12) % 12;
  const useFlats = accidental === 'b' || usesFlatSpellingForKey(tonicKey);
  const rootName = (useFlats ? FLAT_NOTE_NAMES : SHARP_NOTE_NAMES)[pitchClass];
  const suffix = formatChordSuffix(coreRoman, rawSuffix);

  return `${rootName}${suffix}`;
}

export function renderRomanProgressionToChords(romanNumerals: string, tonicKey: string): string {
  return romanNumerals
    .split(/\s+/)
    .map((token) => (token === '|' ? token : renderRomanTokenAsChord(token, tonicKey)))
    .join(' ');
}

function getFlavorId(
  scaleFamily: BoxScaleFamily,
  tonalCenterMode: TonalCenterMode,
  hexatonicMode: HexatonicModeId,
  visibleTargetIntervals: number[]
): string {
  const intervalSet = new Set(visibleTargetIntervals);
  const hasInterval = (interval: number) => intervalSet.has(interval);

  if (scaleFamily === 'major') {
    return tonalCenterMode === 'major' ? 'ionian' : 'aeolian';
  }

  if (tonalCenterMode === 'major' && hexatonicMode === 'mixolydian' && hasInterval(3)) {
    return 'mixolydianBlues';
  }

  if (tonalCenterMode === 'major' && hexatonicMode === 'off' && hasInterval(3) && hasInterval(10)) {
    return 'majorBlues';
  }

  if (tonalCenterMode === 'minor' && hexatonicMode === 'off' && hasInterval(6)) {
    return 'minorBlues';
  }

  if (tonalCenterMode === 'minor' && hexatonicMode === 'phrygian' && hasInterval(6)) {
    return 'phrygianTritone';
  }

  if (hexatonicMode === 'off') {
    return tonalCenterMode === 'major' ? 'majorPentatonic' : 'minorPentatonic';
  }

  const majorToMinorFallbackMap: Record<Exclude<HexatonicModeId, 'off'>, string> = {
    ionian: 'aeolian',
    dorian: 'dorian',
    phrygian: 'phrygian',
    lydian: 'dorian',
    mixolydian: 'phrygian',
    aeolian: 'aeolian',
    locrian: 'locrian',
  };
  const minorToMajorFallbackMap: Record<Exclude<HexatonicModeId, 'off'>, string> = {
    ionian: 'ionian',
    dorian: 'lydian',
    phrygian: 'mixolydian',
    lydian: 'lydian',
    mixolydian: 'mixolydian',
    aeolian: 'ionian',
    locrian: 'mixolydian',
  };

  return tonalCenterMode === 'minor'
    ? majorToMinorFallbackMap[hexatonicMode]
    : minorToMajorFallbackMap[hexatonicMode];
}

function getBaselineIntervals(
  scaleFamily: BoxScaleFamily,
  tonalCenterMode: TonalCenterMode
): number[] {
  if (scaleFamily === 'major') {
    return tonalCenterMode === 'major' ? MAJOR_DIATONIC_INTERVALS : MINOR_DIATONIC_INTERVALS;
  }
  return tonalCenterMode === 'major' ? MAJOR_PENTATONIC_INTERVALS : MINOR_PENTATONIC_INTERVALS;
}

function getTonalCompatibilityFlavorSet(tonalCenterMode: TonalCenterMode): Set<string> {
  return tonalCenterMode === 'major'
    ? new Set(['ionian', 'majorPentatonic', 'lydian', 'mixolydian', 'mixolydianBlues', 'majorBlues'])
    : new Set(['aeolian', 'minorPentatonic', 'dorian', 'phrygian', 'phrygianTritone', 'locrian', 'minorBlues']);
}

interface TemplateIntervalAnalysis {
  inProfileIntervalHits: number;
  outOfProfileIntervalHits: number;
  targetIntervalHits: number;
  uniqueInProfileIntervals: number;
  uniqueTargetIntervals: number;
  tonicTokenCount: number;
  dominantTokenCount: number;
}

function analyzeTemplateIntervals(
  template: ProgressionTemplate,
  tonalKey: string,
  tonalRootPitchClass: number,
  profileIntervalSet: Set<number>,
  targetIntervalSet: Set<number>
): TemplateIntervalAnalysis {
  const chordTokens = template.romanNumerals
    .split(/\s+/)
    .filter((token) => token !== '|' && token.length > 0);
  const uniqueChordSymbols = [...new Set(chordTokens.map((token) => renderRomanTokenAsChord(token, tonalKey)))];

  let inProfileIntervalHits = 0;
  let outOfProfileIntervalHits = 0;
  let targetIntervalHits = 0;
  const uniqueInProfileIntervals = new Set<number>();
  const uniqueTargetIntervals = new Set<number>();

  uniqueChordSymbols.forEach((chordSymbol) => {
    const noteIntervals = [...new Set(
      chordNotesFromSymbol(chordSymbol)
        .map((noteName) => getPitchClass(noteName))
        .map((pitchClass) => (pitchClass - tonalRootPitchClass + 12) % 12)
    )];

    noteIntervals.forEach((interval) => {
      if (profileIntervalSet.has(interval)) {
        inProfileIntervalHits += 1;
        uniqueInProfileIntervals.add(interval);
      } else {
        outOfProfileIntervalHits += 1;
      }

      if (targetIntervalSet.has(interval)) {
        targetIntervalHits += 1;
        uniqueTargetIntervals.add(interval);
      }
    });
  });

  const tonicTokenCount = chordTokens.filter((token) => /^([b#]?)[iI](?:maj7|m7|7)?$/.test(token)).length;
  const dominantTokenCount = chordTokens.filter((token) => /^([b#]?)[vV](?:maj7|m7|7)?$/.test(token)).length;

  return {
    inProfileIntervalHits,
    outOfProfileIntervalHits,
    targetIntervalHits,
    uniqueInProfileIntervals: uniqueInProfileIntervals.size,
    uniqueTargetIntervals: uniqueTargetIntervals.size,
    tonicTokenCount,
    dominantTokenCount,
  };
}

function getTemplateScore(
  template: ProgressionTemplate,
  tonalKey: string,
  tonalRootPitchClass: number,
  desiredFlavorId: string,
  desiredFlavorOrder: Map<string, number>,
  tonalCompatibilityFlavorSet: Set<string>,
  profileIntervalSet: Set<number>,
  targetIntervalSet: Set<number>
): number {
  const analysis = analyzeTemplateIntervals(
    template,
    tonalKey,
    tonalRootPitchClass,
    profileIntervalSet,
    targetIntervalSet
  );

  const templateFlavorSet = FLAVORS_BY_TEMPLATE_ID.get(template.id) ?? new Set<string>();
  const inDesiredFlavor = desiredFlavorOrder.has(template.id);
  const desiredFlavorIndex = desiredFlavorOrder.get(template.id) ?? 999;
  const tonalCompatible = [...templateFlavorSet].some((flavorId) => tonalCompatibilityFlavorSet.has(flavorId));
  const targetIntervalCount = targetIntervalSet.size;
  const missingTargetIntervals = Math.max(0, targetIntervalCount - analysis.uniqueTargetIntervals);

  let score = 0;

  // Strong prior for hand-picked pedagogical templates by selected flavor.
  if (inDesiredFlavor) {
    score += 150;
    score += Math.max(0, 240 - (desiredFlavorIndex * 70));
  } else if (tonalCompatible) {
    score += 25;
  } else {
    score -= 15;
  }

  // Harmonic fit against the currently visible note set.
  score += analysis.inProfileIntervalHits * 5;
  score -= analysis.outOfProfileIntervalHits * 9;
  score += analysis.uniqueInProfileIntervals * 2;

  // Target-tone pressure: favor progressions that actually surface selected target colors.
  if (targetIntervalCount > 0) {
    score += analysis.targetIntervalHits * 7;
    score += analysis.uniqueTargetIntervals * 18;
    score -= missingTargetIntervals * 22;
    if (analysis.uniqueTargetIntervals === targetIntervalCount) {
      score += 12;
    }
  }

  // Keep tonic gravity and playable loop behavior.
  score += analysis.tonicTokenCount > 0 ? 8 : -10;
  score += analysis.dominantTokenCount > 0 ? 4 : 0;

  return score;
}

function getRankedTemplateIds(
  context: ProgressionRecommendationContext,
  tonalKey: string,
  desiredFlavorId: string
): string[] {
  const tonalRootPitchClass = getPitchClass(tonalKey);
  const profileIntervalSet = new Set<number>([
    ...getBaselineIntervals(context.scaleFamily, context.tonalCenterMode),
    ...context.visibleTargetIntervals,
  ]);
  const targetIntervalSet = new Set<number>(context.visibleTargetIntervals);
  const desiredFlavorTemplates = BASE_TEMPLATE_IDS_BY_FLAVOR[desiredFlavorId] ?? [];
  const desiredFlavorOrder = new Map<string, number>(
    desiredFlavorTemplates.map((id, index) => [id, index])
  );
  const tonalCompatibilityFlavorSet = getTonalCompatibilityFlavorSet(context.tonalCenterMode);
  const shouldKeepModePure = context.scaleFamily === 'pentatonic' && context.hexatonicMode !== 'off';
  const candidateTemplateIds = shouldKeepModePure && desiredFlavorTemplates.length > 0
    ? desiredFlavorTemplates
    : TEMPLATE_IDS;

  return [...candidateTemplateIds]
    .filter((id) => PROGRESSION_TEMPLATES[id])
    .map((id, index) => ({
      id,
      index,
      score: getTemplateScore(
        PROGRESSION_TEMPLATES[id],
        tonalKey,
        tonalRootPitchClass,
        desiredFlavorId,
        desiredFlavorOrder,
        tonalCompatibilityFlavorSet,
        profileIntervalSet,
        targetIntervalSet
      ),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.id);
}

function dedupeTemplateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  ids.forEach((id) => {
    if (!PROGRESSION_TEMPLATES[id] || seen.has(id)) {
      return;
    }
    seen.add(id);
    output.push(id);
  });

  return output;
}

function chordTypeFromSuffix(suffix: string): ChordType | null {
  const normalized = suffix.trim();
  const map: Record<string, ChordType> = {
    '': 'major',
    m: 'minor',
    dim: 'dim',
    aug: 'aug',
    maj7: 'maj7',
    m7: 'min7',
    '7': '7',
    dim7: 'dim7',
    mMaj7: 'mMaj7',
    '7b5': '7b5',
    '7#5': '7#5',
    m7b5: 'm7b5',
    '6': '6',
    m6: 'm6',
    '9': '9',
    '11': '11',
    '13': '13',
  };

  return map[normalized] ?? null;
}

function chordNotesFromSymbol(chordSymbol: string): string[] {
  const baseSymbol = chordSymbol.split('/')[0];
  const match = baseSymbol.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) {
    return [];
  }

  const root = match[1];
  const suffix = match[2];
  const chordType = chordTypeFromSuffix(suffix);
  if (!chordType) {
    return [root];
  }

  return getChordNotes(root, chordType);
}

export function getChordCheatSheetData(progressions: PracticeProgression[]): ChordCheatSheetData {
  const seenChords = new Set<string>();
  const seenNotes = new Set<string>();
  const entries: ChordCheatSheetEntry[] = [];
  const uniqueNotes: string[] = [];

  progressions.forEach((progression) => {
    progression.chordNames
      .split(/\s+/)
      .filter((token) => token !== '|' && token.length > 0)
      .forEach((chordSymbol) => {
        if (!seenChords.has(chordSymbol)) {
          seenChords.add(chordSymbol);
          const notes = chordNotesFromSymbol(chordSymbol);
          entries.push({ chordSymbol, notes });
          notes.forEach((note) => {
            if (!seenNotes.has(note)) {
              seenNotes.add(note);
              uniqueNotes.push(note);
            }
          });
          return;
        }

        const existing = entries.find((entry) => entry.chordSymbol === chordSymbol);
        existing?.notes.forEach((note) => {
          if (!seenNotes.has(note)) {
            seenNotes.add(note);
            uniqueNotes.push(note);
          }
        });
      });
  });

  return { entries, uniqueNotes };
}

export function getPracticeProgressions(
  context: ProgressionRecommendationContext
): PracticeProgression[] {
  const tonalKey = context.tonalCenterMode === 'major'
    ? context.majorCenterKey
    : context.minorCenterKey;
  const flavorId = getFlavorId(
    context.scaleFamily,
    context.tonalCenterMode,
    context.hexatonicMode,
    context.visibleTargetIntervals
  );
  const progressionIds = getRankedTemplateIds(context, tonalKey, flavorId);

  return dedupeTemplateIds(progressionIds)
    .slice(0, 10)
    .map((id) => {
      const template = PROGRESSION_TEMPLATES[id];
      return {
        id: template.id,
        title: template.title,
        romanNumerals: template.romanNumerals,
        chordNames: renderRomanProgressionToChords(template.romanNumerals, tonalKey),
        whyItFits: template.whyItFits,
      };
    });
}
