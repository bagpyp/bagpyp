import type { BoxScaleFamily } from './box-shapes';
import type { HexatonicModeId, SingleTargetToneId, TonalCenterMode } from './target-tones';
import { getPitchClass } from './box-shapes';

export interface ProgressionRecommendationContext {
  tonalCenterMode: TonalCenterMode;
  scaleFamily: BoxScaleFamily;
  majorCenterKey: string;
  minorCenterKey: string;
  hexatonicMode: HexatonicModeId;
  activeSingleTargetToneIds: SingleTargetToneId[];
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
  dorianVamp: {
    id: 'dorianVamp',
    title: 'Dorian Vamp',
    romanNumerals: 'i7 IV7 i7 IV7',
    whyItFits: 'Highlights the natural 6 color against a minor tonic.',
  },
  phrygianVamp: {
    id: 'phrygianVamp',
    title: 'Phrygian Tension Vamp',
    romanNumerals: 'i bII i bII',
    whyItFits: 'Leans into the b2 pull for tense modal phrasing.',
  },
  lydianLift: {
    id: 'lydianLift',
    title: 'Lydian Lift',
    romanNumerals: 'Imaj7 II Imaj7 II',
    whyItFits: 'Uses the raised 4 color through the major II chord.',
  },
  mixolydianDrive: {
    id: 'mixolydianDrive',
    title: 'Mixolydian Drive',
    romanNumerals: 'I7 bVII IV I7',
    whyItFits: 'Dominant tonality with the signature b7 neighborhood.',
  },
};

const BASE_TEMPLATE_IDS_BY_FLAVOR: Record<string, string[]> = {
  ionian: ['ionianPop', 'majorCadence'],
  majorPentatonic: ['ionianPop', 'majorCadence'],
  minorPentatonic: ['minorRock', 'minorBluesLoop'],
  dorian: ['dorianVamp', 'minorRock'],
  aeolian: ['minorRock', 'minorBluesLoop'],
  phrygian: ['phrygianVamp', 'minorRock'],
  lydian: ['lydianLift', 'ionianPop'],
  mixolydian: ['mixolydianDrive', 'blues12'],
};

const ADDITIONAL_TEMPLATE_IDS_BY_TONE: Partial<Record<SingleTargetToneId, string[]>> = {
  flatFive: ['blues12'],
  flatSix: ['minorRock'],
  flatSeven: ['mixolydianDrive'],
  majorThird: ['blues12'],
  majorSecond: ['dorianVamp'],
  majorSixth: ['dorianVamp'],
};

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
  hexatonicMode: HexatonicModeId
): string {
  if (scaleFamily === 'major') {
    return tonalCenterMode === 'major' ? 'ionian' : 'aeolian';
  }

  if (hexatonicMode === 'off') {
    return tonalCenterMode === 'major' ? 'majorPentatonic' : 'minorPentatonic';
  }

  if (tonalCenterMode === 'minor') {
    return hexatonicMode;
  }

  const majorFlavorByHexatonic: Record<Exclude<HexatonicModeId, 'off'>, string> = {
    dorian: 'lydian',
    aeolian: 'ionian',
    phrygian: 'mixolydian',
  };
  return majorFlavorByHexatonic[hexatonicMode];
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

export function getPracticeProgressions(
  context: ProgressionRecommendationContext
): PracticeProgression[] {
  const tonalKey = context.tonalCenterMode === 'major'
    ? context.majorCenterKey
    : context.minorCenterKey;
  const flavorId = getFlavorId(context.scaleFamily, context.tonalCenterMode, context.hexatonicMode);
  const progressionIds: string[] = [...(BASE_TEMPLATE_IDS_BY_FLAVOR[flavorId] ?? [])];

  context.activeSingleTargetToneIds.forEach((toneId) => {
    const additions = ADDITIONAL_TEMPLATE_IDS_BY_TONE[toneId];
    if (!additions) {
      return;
    }
    progressionIds.unshift(...additions);
  });

  if (context.hexatonicMode !== 'off') {
    progressionIds.unshift(context.tonalCenterMode === 'major' ? 'lydianLift' : 'dorianVamp');
  }

  return dedupeTemplateIds(progressionIds)
    .slice(0, 6)
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
